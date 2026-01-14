# Phase 9 Plan 01: MCP Server Sync Summary

**MCP server now calls remote API for all thought operations, enabling multi-computer sync.**

## Performance

- **Duration:** 3 min
- **Started:** 2026-01-14T01:47:01Z
- **Completed:** 2026-01-14T01:54:00Z
- **Tasks:** 3
- **Files modified:** 4

## Accomplishments

- All 8 MCP tools converted from direct SQLite to remote API calls
- Type-safe Hono RPC client with separate route clients for items and sessions
- Removed database dependencies from MCP server package
- Theme extraction remains local (preprocessing before API call)

## Task Commits

1. **Task 1: Add Hono client and create API module** - `007e08b` (feat)
2. **Task 2: Convert all tools to use API calls** - `26ffa48` (feat)
3. **Task 3: Clean up dependencies** - `70e74ac` (chore)

## Files Created/Modified

- `packages/mcp-server/package.json` - Removed @mental/db, drizzle-orm; added @mental/api, hono
- `packages/mcp-server/src/api.ts` - Created: typed API client factory with lazy initialization
- `packages/mcp-server/src/index.ts` - Rewrote all tool handlers to use API calls
- `packages/mcp-server/src/db.ts` - Deleted (no longer needed)
- `.gitignore` - Added .next/ to prevent build artifact commits

## Decisions Made

- **Separate route clients vs single AppType client**: Used `getItemsClient()` and `getSessionsClient()` returning `hc<ItemsRoute>` and `hc<SessionsRoute>` respectively, because `app.route()` doesn't chain types into the parent AppType properly.

## Deviations from Plan

### Deviation 1: TypeScript type inference issue with AppType

**Plan said:** Use single `getApiClient()` returning `hc<AppType>(API_URL)`
**Actual:** Created separate `getItemsClient()` and `getSessionsClient()` functions

**Why:** The `AppType = typeof app` doesn't capture nested route types when using `app.route()`. The API uses `app.route("/items", itemsRoute)` which means `AppType.items` is `unknown`. Using the individual route types directly (`ItemsRoute`, `SessionsRoute`) provides proper type inference.

**Impact:** Better type safety, more explicit API surface

## Issues Encountered

1. **Variable naming collision**: Used `items` for both client and response data in same scope, causing TypeScript redeclaration error. Fixed by renaming client to `client` and response to `itemList`.

2. **Query parameter type mismatch**: API expects `limit` as string (query params), but code passed number. Fixed with `String(maxItems)`.

3. **Accidentally committed .next folder**: Previous build artifacts were staged. Fixed by adding `.next/` to gitignore and removing from git cache.

## Next Step

Phase 9 complete, ready for Phase 10 (Webapp Sync) or manual testing with MCP inspector.

---
*Phase: 09-mcp-server-sync*
*Completed: 2026-01-14*
