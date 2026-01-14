# Plan 14-01 Summary: Follow-ups Schema & API

**Completed:** 2026-01-14
**Duration:** ~10 minutes

## What Was Built

Added database schema and API endpoints for follow-ups (thread-like updates to thoughts).

### Changes Made

1. **follow_ups Table** (`packages/db/src/schema-pg.ts`)
   - id: text (cuid) primary key
   - itemId: text (foreign key to mental_items)
   - content: text (follow-up content)
   - createdAt: timestamp

2. **Shared Types** (`packages/shared/src/types.ts`)
   - `FollowUp` interface
   - `CreateFollowUpInput` interface

3. **DB Package Exports** (`packages/db/src/index.ts`)
   - Exported new Postgres types
   - Added `asc` from drizzle-orm for ordering

4. **Follow-ups API Routes** (`packages/api/src/routes/followups.ts`)
   - `POST /followups` - Create follow-up (validates item exists, returns 404 if not)
   - `GET /followups/item/:itemId` - Get all follow-ups for an item (ordered by createdAt ASC)

5. **API Index** (`packages/api/src/index.ts`)
   - Mounted followups routes
   - Exported `FollowupsRoute` type

### Files Created/Modified

- `packages/db/src/schema-pg.ts` - Added followUps table
- `packages/db/src/index.ts` - Added exports
- `packages/shared/src/types.ts` - Added FollowUp types
- `packages/api/src/routes/followups.ts` - New file
- `packages/api/src/index.ts` - Mounted routes

## Verification

- [x] `pnpm --filter @mental/db build` succeeds
- [x] `pnpm --filter @mental/api build` succeeds
- [x] Schema pushed to Neon database
- [x] POST /followups creates follow-up linked to item
- [x] GET /followups/item/:itemId returns follow-ups for item
- [x] 404 returned when item doesn't exist

## Next

Plan 14-02: MCP tool and webapp UI for follow-ups
