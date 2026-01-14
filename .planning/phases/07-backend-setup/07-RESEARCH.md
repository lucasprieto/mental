# Phase 7: Backend Setup - Research

**Researched:** 2026-01-13
**Domain:** TypeScript API server with hosted database for multi-computer sync
**Confidence:** HIGH

<research_summary>
## Summary

Researched the ecosystem for building a hosted TypeScript API backend that enables multi-computer access for Mental. The standard approach for a personal tool without user authentication is to use **Hono** as the API framework (lightweight, edge-ready, built-in RPC type safety) with **Neon Postgres** for the database (serverless, free tier, Drizzle ORM support) hosted on **Railway** (simplest deployment, good DX).

Key finding: Since we already use Drizzle ORM with SQLite, migrating to Postgres is straightforward - Drizzle abstracts the database layer. Hono's RPC feature provides end-to-end type safety without the complexity of tRPC, and the schema types can be shared between MCP server, webapp, and API.

**Primary recommendation:** Use Hono + Neon Postgres + Railway. Keep the existing Drizzle schema, just change the driver from better-sqlite3 to @neondatabase/serverless.
</research_summary>

<standard_stack>
## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| hono | ^4.x | API framework | Ultrafast, edge-ready, built-in RPC type safety, works everywhere |
| @neondatabase/serverless | ^0.10.x | Postgres driver | Serverless-optimized, HTTP mode for edge, connection pooling built-in |
| drizzle-orm | ^0.36.x | ORM | Already using it, supports Postgres with same schema syntax |
| drizzle-kit | ^0.28.x | Migrations | Generate and apply migrations to Postgres |
| zod | ^3.x | Validation | Already using in MCP server, integrates with Hono validator |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @hono/zod-validator | ^0.4.x | Request validation | Validate incoming requests with Zod schemas |
| dotenv | ^16.x | Environment variables | Local development configuration |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Hono | tRPC | tRPC has more features (batching, React Query) but more complex, overkill for this use case |
| Hono | Express | Express is older, heavier, no built-in type safety |
| Neon | Turso/LibSQL | Turso is SQLite-compatible (easier migration) but Neon has better free tier and we already know Drizzle+Postgres |
| Neon | Supabase | Supabase adds auth/realtime we don't need, more complex |
| Railway | Fly.io | Fly better for global distribution, Railway simpler for single-region personal tool |
| Railway | Render | Both similar, Railway has better DX and pricing flexibility |

**Installation:**
```bash
pnpm add hono @neondatabase/serverless @hono/zod-validator
pnpm add -D drizzle-kit
```
</standard_stack>

<architecture_patterns>
## Architecture Patterns

### Recommended Project Structure
```
packages/
├── api/                    # New package for hosted API
│   ├── src/
│   │   ├── index.ts       # Hono app entry point
│   │   ├── routes/        # Route handlers
│   │   │   ├── items.ts   # Mental items CRUD
│   │   │   └── sessions.ts # Session management
│   │   └── db.ts          # Neon database connection
│   ├── package.json
│   └── drizzle.config.ts  # Drizzle config for Neon
├── db/                     # Existing - schema stays here
│   └── src/
│       └── schema.ts      # Same schema, works with both SQLite and Postgres
├── mcp-server/            # Update to call API instead of local DB
└── webapp/                # Update to call API instead of local DB
```

### Pattern 1: Hono RPC with Shared Types
**What:** Export app type for end-to-end type safety
**When to use:** Always - this is the main benefit of Hono
**Example:**
```typescript
// packages/api/src/routes/items.ts
import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'

const app = new Hono()
  .get('/', async (c) => {
    const items = await db.select().from(mentalItems)
    return c.json(items)
  })
  .post('/', zValidator('json', z.object({
    title: z.string(),
    content: z.string(),
    tags: z.array(z.string()).optional(),
  })), async (c) => {
    const body = c.req.valid('json')
    // insert logic
    return c.json(newItem, 201)
  })

export default app
export type ItemsRoute = typeof app
```

```typescript
// In MCP server or webapp
import { hc } from 'hono/client'
import type { ItemsRoute } from '@mental/api/routes/items'

const client = hc<ItemsRoute>('https://api.mental.example.com')
const res = await client.index.$get()
const items = await res.json() // Fully typed!
```

### Pattern 2: Neon Serverless Connection
**What:** Use HTTP mode for edge/serverless, pooled for long-running
**When to use:** HTTP for webapp/MCP, pooled for API server
**Example:**
```typescript
// packages/api/src/db.ts
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from '@mental/db/schema'

const sql = neon(process.env.DATABASE_URL!)
export const db = drizzle(sql, { schema })
```

### Pattern 3: Schema Sharing Across Packages
**What:** Keep schema in @mental/db, use from API, MCP, and webapp
**When to use:** Always - single source of truth for types
**Example:**
```typescript
// packages/db/src/schema.ts - no changes needed!
// Drizzle schema works with both SQLite and Postgres

// packages/api/drizzle.config.ts
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: '../db/src/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})
```

### Anti-Patterns to Avoid
- **Duplicating schema:** Don't create separate schemas for API - use @mental/db
- **Direct DB access from webapp/MCP:** Route all requests through API for sync
- **Custom auth for personal tool:** No auth needed - it's single-user, just deploy privately
- **Complex middleware chains:** Keep it simple - no auth middleware needed
</architecture_patterns>

<dont_hand_roll>
## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Database migrations | Manual SQL scripts | drizzle-kit generate/migrate | Handles schema diffs, rollbacks, type safety |
| Connection pooling | Custom pool logic | Neon's built-in pooler | Already optimized for serverless |
| Request validation | Manual if/else checks | @hono/zod-validator | Type inference, consistent errors |
| API client | fetch with manual types | hono/client (hc) | Full type safety from server definition |
| CORS handling | Custom headers | hono/cors middleware | Handles preflight, credentials properly |

**Key insight:** The Hono + Drizzle + Neon stack handles all the infrastructure concerns. Focus on business logic (items CRUD, session management), not plumbing.
</dont_hand_roll>

<common_pitfalls>
## Common Pitfalls

### Pitfall 1: Schema Incompatibility SQLite → Postgres
**What goes wrong:** Some SQLite-specific syntax doesn't work in Postgres
**Why it happens:** Different SQL dialects
**How to avoid:** Our schema uses standard Drizzle types that work with both. The `integer("x", { mode: "timestamp" })` works identically.
**Warning signs:** Migration errors mentioning syntax

### Pitfall 2: Cold Start Latency on Serverless
**What goes wrong:** First request after idle period is slow (1-2s)
**Why it happens:** Serverless functions spin down when idle
**How to avoid:** Railway runs containers, not serverless functions - no cold starts. If using Vercel/Cloudflare, use HTTP connection mode.
**Warning signs:** Intermittent slow requests

### Pitfall 3: Forgetting to Update All Consumers
**What goes wrong:** MCP server still tries to use local SQLite after API is deployed
**Why it happens:** Multiple packages need updating
**How to avoid:** Update in order: 1) Deploy API, 2) Update MCP server, 3) Update webapp. Test each step.
**Warning signs:** "Database not found" errors locally

### Pitfall 4: CORS Issues from Webapp
**What goes wrong:** Browser blocks requests to API
**Why it happens:** Different origins (localhost:3001 → api.example.com)
**How to avoid:** Add CORS middleware in Hono from day 1
**Warning signs:** Console errors about CORS, OPTIONS preflight failures
</common_pitfalls>

<code_examples>
## Code Examples

### Basic Hono API Setup
```typescript
// Source: Hono docs
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import items from './routes/items'
import sessions from './routes/sessions'

const app = new Hono()

// Middleware
app.use('*', logger())
app.use('*', cors())

// Routes
app.route('/items', items)
app.route('/sessions', sessions)

// Health check
app.get('/health', (c) => c.json({ status: 'ok' }))

export default app
export type AppType = typeof app
```

### Neon + Drizzle Setup
```typescript
// Source: Drizzle + Neon docs
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from '@mental/db/schema'

const sql = neon(process.env.DATABASE_URL!)
export const db = drizzle(sql, { schema })

// Usage - same as before!
const items = await db.select().from(schema.mentalItems)
```

### Type-Safe Client from MCP Server
```typescript
// Source: Hono RPC docs
import { hc } from 'hono/client'
import type { AppType } from '@mental/api'

const API_URL = process.env.MENTAL_API_URL || 'http://localhost:3000'
const client = hc<AppType>(API_URL)

// Fully typed!
const res = await client.items.$get()
if (res.ok) {
  const items = await res.json()
  // items is typed as MentalItem[]
}
```

### Railway Deployment (Dockerfile)
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/api ./packages/api
COPY packages/db ./packages/db
RUN npm install -g pnpm && pnpm install --frozen-lockfile
RUN pnpm --filter @mental/api build
EXPOSE 3000
CMD ["node", "packages/api/dist/index.js"]
```
</code_examples>

<sota_updates>
## State of the Art (2025-2026)

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Express.js | Hono | 2023+ | Hono is faster, smaller, edge-ready |
| pg + node-postgres | @neondatabase/serverless | 2023+ | Better for serverless, HTTP mode |
| Manual types | Hono RPC / tRPC | 2022+ | End-to-end type safety |
| Heroku | Railway/Render/Fly | 2022+ | Better DX, pricing, modern features |

**New tools/patterns to consider:**
- **Hono RPC:** Lighter than tRPC, sufficient for internal APIs
- **Neon branching:** Can create DB branches for testing/development
- **Railway environments:** Separate staging/production easily

**Deprecated/outdated:**
- **Express for new projects:** Still works but Hono is better for TypeScript
- **Heroku:** Pricing and DX now inferior to Railway/Render
- **Manual connection pooling:** Use Neon's built-in pooler
</sota_updates>

<open_questions>
## Open Questions

1. **API Authentication Strategy**
   - What we know: Single-user personal tool, no traditional auth needed
   - What's unclear: Should we add API key for minimal security?
   - Recommendation: Start without auth, add simple API key header if needed later

2. **Data Migration Strategy**
   - What we know: Need to move existing SQLite data to Neon
   - What's unclear: Best approach (export/import vs one-time script)
   - Recommendation: Write a migration script that reads SQLite, writes to Neon
</open_questions>

<sources>
## Sources

### Primary (HIGH confidence)
- /llmstxt/hono_dev_llms_txt - Hono setup, RPC, middleware
- /llmstxt/orm_drizzle_team_llms_txt - Drizzle with Neon, migrations
- /websites/trpc_io - tRPC comparison (decided against)

### Secondary (MEDIUM confidence)
- [Railway vs Fly vs Render comparison](https://medium.com/ai-disruption/railway-vs-fly-io-vs-render-which-cloud-gives-you-the-best-roi-2e3305399e5b) - verified Railway fits use case
- [Neon vs Turso comparison](https://openalternative.co/compare/neon-postgres/vs/turso) - verified Neon better for this project
- [Hono vs tRPC discussion](https://github.com/orgs/honojs/discussions/2242) - verified Hono RPC sufficient

### Tertiary (LOW confidence - needs validation)
- None - all findings verified
</sources>

<metadata>
## Metadata

**Research scope:**
- Core technology: Hono API framework
- Ecosystem: Neon Postgres, Railway hosting, Drizzle ORM
- Patterns: RPC type safety, schema sharing, serverless DB
- Pitfalls: Migration, CORS, cold starts

**Confidence breakdown:**
- Standard stack: HIGH - all libraries well-documented, verified with Context7
- Architecture: HIGH - patterns from official docs
- Pitfalls: HIGH - common issues documented in discussions
- Code examples: HIGH - from Context7/official sources

**Research date:** 2026-01-13
**Valid until:** 2026-02-13 (30 days - stable ecosystem)
</metadata>

---

*Phase: 07-backend-setup*
*Research completed: 2026-01-13*
*Ready for planning: yes*
