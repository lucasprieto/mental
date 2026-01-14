---
phase: 15-full-text-search
plan: 01
type: summary
status: complete
completed: 2026-01-14
duration: ~8 min
---

# Plan 15-01 Summary: Full-text Search Schema & API

## What Was Built

Added PostgreSQL full-text search with weighted tsvector and GIN index, plus search API endpoint.

## Changes Made

### packages/db/src/schema-pg.ts
- Added `tsvector` custom type for PostgreSQL full-text search
- Added `search` generated column to mentalItems table:
  - Weighted combination: title (A) + content (B)
  - Auto-maintained by PostgreSQL on insert/update
- Added GIN index `idx_mental_items_search` for fast lookups

### packages/db/src/index.ts
- Exported `sql` utility from drizzle-orm for raw SQL queries

### packages/api/src/routes/items.ts
- Added GET `/search` endpoint:
  - Query param: `q` (search query)
  - Uses `plainto_tsquery` for safe user input handling
  - Orders by `ts_rank` for relevance ranking
  - Limits to 50 results

### packages/api/drizzle.config.ts
- Updated to drizzle-kit v0.31+ config format
- Changed from `driver: "pg"` to `dialect: "postgresql"`

### Package Upgrades
- drizzle-orm: 0.29.0 -> 0.45.1 (for generated columns support)
- drizzle-kit: 0.20.0 -> 0.31.8

## Verification

- [x] `pnpm --filter @mental/db build` succeeds
- [x] `pnpm --filter @mental/api build` succeeds
- [x] Schema pushed to Neon database
- [x] GET /items/search?q=phase returns matching results
- [x] Empty query returns empty array
- [x] Results ordered by relevance (title matches rank higher)

## Technical Notes

- Using PostgreSQL's built-in full-text search (no external dependencies)
- Generated columns auto-maintain search vectors (no triggers needed)
- GIN index provides fast lookups for search queries
- `plainto_tsquery` safely handles user input (stop words filtered automatically)

## Next Step

Plan 15-02: Add debounced search bar to webapp with URL sync.
