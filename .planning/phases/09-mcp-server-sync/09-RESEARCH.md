# Phase 9: MCP Server Sync - Research

**Researched:** 2026-01-14
**Domain:** Internal patterns - updating MCP server to use remote API
**Confidence:** HIGH

<research_summary>
## Summary

This phase updates the MCP server from direct SQLite database access to calling the hosted API. The patterns are already established in Phase 7 research (Hono RPC client). The MCP server currently has 8 tools that directly access the database via `@mental/db`. These need to be converted to use `hono/client` to call the remote API.

**Key insight:** The API already supports all required operations (items CRUD, sessions start/end). The MCP server tools map directly to API endpoints with minimal logic changes. The main work is swapping database calls for HTTP client calls.

**Session management consideration:** The MCP server currently tracks sessions in-memory. The API also has in-memory session tracking. Since the MCP server is the primary client that manages sessions, we should continue to let it call the API's session endpoints, which will maintain server-side session state.
</research_summary>

<current_architecture>
## Current MCP Server Architecture

### Tools and Database Operations

| Tool | Operation | DB Method | API Equivalent |
|------|-----------|-----------|----------------|
| ping | Health check | None | GET /health |
| capture_thought | Insert item | db.insert(mentalItems) | POST /items |
| list_thoughts | Query items | db.select().from(mentalItems) | GET /items?status=&limit= |
| get_thought | Get by ID | db.select().where(eq(id)) | GET /items/:id |
| resolve_thought | Update status | db.update(mentalItems).set() | PUT /items/:id |
| reopen_thought | Update status | db.update(mentalItems).set() | PUT /items/:id |
| start_session | In-memory + logging | None (in-memory) | POST /sessions/start |
| end_session | Query session items | db.select().where(eq(sessionId)) | POST /sessions/end |

### Current Dependencies
- `@mental/db` - For SQLite schema/client
- `@modelcontextprotocol/sdk` - MCP server framework
- `@paralleldrive/cuid2` - ID generation
- `zod` - Schema validation

### Files to Modify
- `packages/mcp-server/src/index.ts` - All tool handlers
- `packages/mcp-server/src/db.ts` - Remove (no longer needed)
- `packages/mcp-server/package.json` - Update dependencies
</current_architecture>

<target_architecture>
## Target Architecture

### New Dependencies
- `hono` - For hc client
- Keep: `@modelcontextprotocol/sdk`, `@paralleldrive/cuid2`, `zod`
- Remove: `@mental/db` (no longer direct DB access), `drizzle-orm`

### API Client Setup
```typescript
// packages/mcp-server/src/api.ts
import { hc } from "hono/client";
import type { AppType } from "@mental/api";

const API_URL = process.env.MENTAL_API_URL || "http://localhost:3000";

export function getApiClient() {
  return hc<AppType>(API_URL);
}
```

### Tool Conversion Pattern
```typescript
// Before (direct DB)
const db = getDatabase();
await db.insert(mentalItems).values({ ... });

// After (API call)
const api = getApiClient();
const res = await api.items.$post({ json: { ... } });
if (!res.ok) throw new Error("API error");
const item = await res.json();
```

### Environment Variable
- `MENTAL_API_URL` - Required, points to hosted API (e.g., `https://mental-api.railway.app`)
</target_architecture>

<tool_mappings>
## Tool-to-API Mappings

### capture_thought → POST /items
```typescript
// Current
await db.insert(mentalItems).values({
  id: createId(),
  title, content, tags: JSON.stringify(tags || []),
  theme, status: "open", sessionId: currentSessionId,
  createdAt: now, updatedAt: now,
});

// New
const api = getApiClient();
const res = await api.items.$post({
  json: {
    title,
    content,
    tags: tags || [],
    theme,
    sessionId: currentSessionId,
  }
});
const item = await res.json();
// API generates ID and timestamps
```

### list_thoughts → GET /items
```typescript
// Current
const items = await db.select().from(mentalItems)
  .where(eq(mentalItems.status, status))
  .orderBy(desc(mentalItems.createdAt))
  .limit(maxItems);

// New
const api = getApiClient();
const res = await api.items.$get({
  query: { status: status || "all", limit: maxItems }
});
const items = await res.json();
```

### get_thought → GET /items/:id
```typescript
// Current
const items = await db.select().from(mentalItems)
  .where(eq(mentalItems.id, id)).limit(1);

// New
const api = getApiClient();
const res = await api.items[":id"].$get({ param: { id } });
if (res.status === 404) return notFound;
const item = await res.json();
```

### resolve_thought → PUT /items/:id
```typescript
// Current
await db.update(mentalItems).set({
  status: "resolved", resolution, resolvedAt: now, updatedAt: now
}).where(eq(mentalItems.id, id));

// New
const api = getApiClient();
const res = await api.items[":id"].$put({
  param: { id },
  json: { status: "resolved", resolution }
});
```

### reopen_thought → PUT /items/:id
```typescript
// Current
await db.update(mentalItems).set({
  status: "open", updatedAt: now
}).where(eq(mentalItems.id, id));

// New
const api = getApiClient();
const res = await api.items[":id"].$put({
  param: { id },
  json: { status: "open" }
});
```

### start_session → POST /sessions/start
```typescript
// Current (in-memory)
currentSessionId = createId();
sessionStartTime = new Date();

// New (call API + keep local ref)
const api = getApiClient();
const res = await api.sessions.start.$post({ json: { name } });
const session = await res.json();
currentSessionId = session.sessionId;
sessionStartTime = new Date(session.startedAt);
```

### end_session → POST /sessions/end
```typescript
// Current
const items = await db.select().from(mentalItems)
  .where(eq(mentalItems.sessionId, sessionId));
currentSessionId = null;

// New
const api = getApiClient();
const res = await api.sessions.end.$post();
const summary = await res.json();
currentSessionId = null;
sessionStartTime = null;
// summary has itemCount, etc.
```
</tool_mappings>

<implementation_notes>
## Implementation Notes

### 1. Theme Extraction
The `extractTheme()` function currently runs in the MCP server. Options:
- **Keep in MCP server** (recommended): Simple, no API changes needed
- Move to API: Would require API to accept raw content and extract theme

Recommendation: Keep theme extraction in MCP server - it's a local preprocessing step.

### 2. Session State
Sessions are currently:
- MCP server: In-memory `currentSessionId`, `sessionStartTime`
- API server: In-memory `activeSession`

After sync, the API becomes the source of truth for sessions. The MCP server should:
1. Call API to start/end sessions
2. Cache the `sessionId` locally for use in `capture_thought`
3. Query API's `/sessions/active` if needed to restore state

### 3. Error Handling
API calls can fail. Each tool should:
- Check `res.ok` before parsing JSON
- Return appropriate MCP error messages on failure
- Log errors to stderr for debugging

### 4. Environment Configuration
The MCP server needs `MENTAL_API_URL` environment variable. Claude Code MCP config:
```json
{
  "mcpServers": {
    "mental": {
      "command": "node",
      "args": ["/.../packages/mcp-server/dist/index.js"],
      "env": {
        "MENTAL_API_URL": "https://mental-api.railway.app"
      }
    }
  }
}
```

### 5. Local Development
For local dev, run API server locally:
```bash
# Terminal 1: API server
cd packages/api && pnpm dev

# Terminal 2: Test MCP server
MENTAL_API_URL=http://localhost:3000 node packages/mcp-server/dist/index.js
```

### 6. Type Safety
Using `hc<AppType>()` provides full type safety. Import from API package:
```typescript
import type { AppType } from "@mental/api";
```

This requires the API package to export its type.
</implementation_notes>

<plan_structure>
## Suggested Plan Structure

### Plan 09-01: API Client Setup
1. Add `hono` dependency to mcp-server package
2. Create `src/api.ts` with typed client factory
3. Update package.json (add hono, keep MCP deps)
4. Verify type import from @mental/api works

### Plan 09-02: Convert Tools to API Calls
1. Convert capture_thought to POST /items
2. Convert list_thoughts to GET /items
3. Convert get_thought to GET /items/:id
4. Convert resolve_thought and reopen_thought to PUT /items/:id
5. Convert session tools to /sessions endpoints
6. Remove db.ts file
7. Test all tools via MCP inspector
</plan_structure>

<risks>
## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| API unavailable | Tools fail | Good error messages, suggest checking API status |
| Network latency | Slower captures | Acceptable for personal tool; API is fast |
| Type mismatch | Runtime errors | Hono RPC ensures compile-time type safety |
| Session desync | Lost session context | MCP caches sessionId locally, queries API if needed |
</risks>

<metadata>
## Metadata

**Research scope:**
- Internal refactoring: MCP server → API client
- Patterns: Hono RPC client usage
- No external research needed (marked "Unlikely" in roadmap)

**Confidence breakdown:**
- Tool mappings: HIGH - API routes already match MCP tool needs
- Hono client usage: HIGH - pattern documented in Phase 7 research
- Session handling: HIGH - clear state management approach

**Research date:** 2026-01-14
**Valid until:** N/A (internal patterns)
</metadata>

---

*Phase: 09-mcp-server-sync*
*Research completed: 2026-01-14*
*Ready for planning: yes*
