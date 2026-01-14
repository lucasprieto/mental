# Phase 8: Data Sync - Research

**Researched:** 2026-01-13
**Domain:** Migrate from local SQLite to hosted Neon Postgres with data synchronization
**Confidence:** HIGH

<research_summary>
## Summary

Phase 8 focuses on migrating from local SQLite to the hosted Neon Postgres database set up in Phase 7. The core challenge is straightforward: we already have dual schemas (schema.ts for SQLite, schema-pg.ts for Postgres) and the API routes are ready. The main work is:

1. **Create Neon database and apply schema** - Use Drizzle Kit to push the Postgres schema
2. **Migrate existing SQLite data** - Write a one-time migration script to copy data
3. **Update consumers** - MCP server and webapp should call the hosted API instead of local SQLite

Key finding: The schema is already compatible. The only difference is timestamp handling (SQLite uses integer unix timestamps, Postgres uses native timestamps). The migration script needs to convert these.

**Primary recommendation:**
- Create Neon project via dashboard (free tier)
- Use `drizzle-kit push` to create tables
- Write Node.js migration script that reads SQLite and POSTs to API
- Keep SQLite as fallback during transition
</research_summary>

<standard_stack>
## Standard Stack

### Core (Already Installed from Phase 7)
| Library | Version | Purpose | Status |
|---------|---------|---------|--------|
| @neondatabase/serverless | ^0.10.x | Postgres driver | ✅ In @mental/db |
| drizzle-orm | ^0.29.x | ORM | ✅ In @mental/db |
| drizzle-kit | ^0.20.x | Migrations | ✅ In @mental/db devDeps |

### For Migration Script
| Library | Version | Purpose | Notes |
|---------|---------|---------|-------|
| better-sqlite3 | ^9.x | Read local SQLite | ✅ Already in @mental/db |
| dotenv | ^16.x | Load DATABASE_URL | May need to add |

No new packages needed - all infrastructure is in place from Phase 7.
</standard_stack>

<architecture_patterns>
## Architecture Patterns

### Pattern 1: Neon Project Setup
**What:** Create database via Neon dashboard, get connection string
**When to use:** One-time setup
**Steps:**
1. Go to neon.tech → Create Project "mental"
2. Copy connection string (pooled URL)
3. Set DATABASE_URL in local .env and Railway

### Pattern 2: Schema Push with Drizzle Kit
**What:** Use `drizzle-kit push` to create tables in Neon
**When to use:** Initial schema creation
**Example:**
```typescript
// packages/api/drizzle.config.ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "../db/src/schema-pg.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```
```bash
cd packages/api && pnpm drizzle-kit push
```

### Pattern 3: One-Time Migration Script
**What:** Read SQLite, POST to API endpoints
**When to use:** Migrate existing data
**Why not direct DB insert:** Using API validates the full stack
**Example:**
```typescript
// packages/api/scripts/migrate-from-sqlite.ts
import Database from "better-sqlite3";
import { hc } from "hono/client";
import type { AppType } from "../src/index.js";

const sqlite = new Database(process.env.SQLITE_PATH || "../mcp-server/mental.db");
const client = hc<AppType>(process.env.API_URL || "http://localhost:3000");

async function migrate() {
  const items = sqlite.prepare("SELECT * FROM mental_items").all();

  for (const item of items) {
    // Convert Unix timestamp (seconds) to ISO string
    const createdAt = new Date(item.created_at * 1000);

    await client.items.$post({
      json: {
        title: item.title,
        content: item.content,
        tags: JSON.parse(item.tags || "[]"),
        theme: item.theme,
        sessionId: item.session_id,
      }
    });
  }

  console.log(`Migrated ${items.length} items`);
}

migrate().catch(console.error);
```

### Pattern 4: Fallback Strategy
**What:** Keep SQLite working during transition
**When to use:** For safety during migration
**How:** Don't delete local db.ts files yet, add environment flag
```typescript
const USE_REMOTE_API = process.env.MENTAL_USE_REMOTE === "true";
```

### Anti-Patterns to Avoid
- **Direct SQL migration:** Don't dump SQLite and restore to Postgres - schema differs slightly
- **Deleting SQLite immediately:** Keep as backup until remote is verified
- **Complex sync logic:** This is a one-way migration, not ongoing sync
</architecture_patterns>

<dont_hand_roll>
## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Schema creation | Manual CREATE TABLE | drizzle-kit push | Handles types correctly |
| Connection string | Build URL manually | Neon dashboard | Gets pooled URL format right |
| Data conversion | Manual SQL transforms | JS Date conversion | More readable, handles edge cases |
</dont_hand_roll>

<common_pitfalls>
## Common Pitfalls

### Pitfall 1: Timestamp Conversion
**What goes wrong:** SQLite stores unix integers, Postgres expects timestamps
**Why it happens:** Different storage formats
**How to avoid:** Convert in migration script: `new Date(unixTimestamp * 1000)`
**Warning signs:** Date parsing errors, items showing wrong dates

### Pitfall 2: Neon Free Tier Limits
**What goes wrong:** Database sleeps after 5 min inactivity on free tier
**Why it happens:** Neon suspends inactive databases
**How to avoid:** First request after sleep adds ~300ms cold start - acceptable for personal tool
**Warning signs:** Intermittent slow first requests

### Pitfall 3: Drizzle Schema Mismatch
**What goes wrong:** TypeScript types don't match actual Postgres columns
**Why it happens:** Schema drift between schema-pg.ts and actual tables
**How to avoid:** Use `drizzle-kit push` consistently, don't modify DB directly
**Warning signs:** Runtime errors about missing columns

### Pitfall 4: Missing DATABASE_URL in Different Environments
**What goes wrong:** API crashes with "DATABASE_URL required"
**Why it happens:** Env var not set in Railway/local
**How to avoid:** Set in Railway dashboard and local .env, verify before deploy
**Warning signs:** Immediate crash on startup
</common_pitfalls>

<code_examples>
## Code Examples

### Neon Connection String Format
```bash
# Pooled (recommended for API)
DATABASE_URL="postgresql://user:password@ep-xxx-xxx-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require"

# Direct (for migrations)
DATABASE_URL_DIRECT="postgresql://user:password@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
```

### Drizzle Config for Neon
```typescript
// packages/api/drizzle.config.ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "../db/src/schema-pg.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

### Test API Health Before Migration
```bash
# Verify API is up and connected to Neon
curl http://localhost:3000/health
# Should return: {"status":"ok","timestamp":"..."}

# Try creating an item
curl -X POST http://localhost:3000/items \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","content":"test content"}'
```

### Verify Data After Migration
```typescript
// Quick verification query
const res = await client.items.$get({ query: { limit: 5 } });
const items = await res.json();
console.log(`Found ${items.length} items in Neon`);
```
</code_examples>

<open_questions>
## Open Questions

1. **Preserve IDs or Generate New Ones?**
   - Context: Existing items have cuid2 IDs in SQLite
   - Options: Keep same IDs (requires direct DB insert) or let API generate new (simpler but loses history)
   - Recommendation: Direct insert to preserve IDs for data continuity

2. **Resolved Items History**
   - Context: Should we migrate resolved items or just open ones?
   - Recommendation: Migrate all - preserves complete history
</open_questions>

<task_breakdown>
## Task Breakdown for Planning

### Task 1: Create Neon Project and Database
- Create Neon account/project via dashboard
- Get connection string (pooled URL)
- Create .env.local with DATABASE_URL
- Test connection with basic query

### Task 2: Apply Postgres Schema
- Add drizzle.config.ts to packages/api
- Run `drizzle-kit push` to create tables
- Verify table structure in Neon dashboard

### Task 3: Write and Run Migration Script
- Create packages/api/scripts/migrate-from-sqlite.ts
- Read all items from local SQLite
- Direct insert to Neon (to preserve IDs)
- Handle timestamp conversion
- Run and verify data

### Task 4: Verify API Works with Neon Data
- Start API locally with DATABASE_URL
- Test all CRUD operations
- Verify data integrity (counts, dates, content)
</task_breakdown>

<sources>
## Sources

### Primary (HIGH confidence)
- Phase 7 Research: 07-RESEARCH.md - Neon + Drizzle patterns
- Existing code: schema-pg.ts, client-pg.ts - Already implemented
- Neon docs: Connection string formats, free tier limits

### Secondary (MEDIUM confidence)
- Drizzle Kit docs: push vs generate commands
- Better-sqlite3: Reading existing data
</sources>

<metadata>
## Metadata

**Research scope:**
- Core technology: Neon Postgres setup
- Migration: SQLite → Postgres one-time transfer
- Validation: Verify API works with hosted database

**Confidence breakdown:**
- Standard stack: HIGH - no new packages needed
- Architecture: HIGH - patterns from Phase 7
- Migration approach: HIGH - straightforward script
- Pitfalls: HIGH - well-documented issues

**Research date:** 2026-01-13
**Valid until:** 2026-02-13
</metadata>

---

*Phase: 08-data-sync*
*Research completed: 2026-01-13*
*Ready for planning: yes*
