# Project Milestones: Mental

## v2.0 Cloud Sync (Shipped: 2026-01-14)

**Delivered:** Backend infrastructure for multi-computer access with Neon Postgres, plus sentiment-based auto-tagging for smarter thought categorization.

**Phases completed:** 7-11 (8 plans total)

**Key accomplishments:**
- Hono API server with Neon Postgres for hosted backend
- SQLite to Neon migration preserving all existing data
- MCP server converted to remote API calls (multi-computer sync)
- Webapp converted to remote API calls
- Sentiment-based theme detection (blocker/concern/question/idea)
- Auto-tagging based on sentiment with project context capture

**Stats:**
- 3,783 lines of TypeScript/TSX (total codebase)
- 5 phases, 8 plans
- 2 days (2026-01-13 → 2026-01-14)

**Git range:** `feat(07-01)` → `feat(11-02)`

**What's next:** v3.0 - LLM-driven theme selection (let the calling LLM decide themes instead of string matching)

---

## v1.0 MVP (Shipped: 2026-01-13)

**Delivered:** Personal mind centralization system with MCP server for frictionless thought capture from Claude Code/Cursor and a webapp for viewing, filtering, and managing items.

**Phases completed:** 1-6 (13 plans total)

**Key accomplishments:**
- pnpm monorepo with TypeScript infrastructure and @mental/db package with Drizzle ORM
- MCP server with 8 tools (ping, capture_thought, list_thoughts, get_thought, resolve_thought, reopen_thought, start_session, end_session)
- SQLite persistence with automatic theme extraction from content
- Session lifecycle management with open → resolved tracking
- Next.js 15 webapp with dashboard, item detail views, and real-time URL-based filtering
- Manual entry/editing directly in webapp with status management

**Stats:**
- 149 files created/modified
- 3,269 lines of TypeScript/TSX
- 6 phases, 13 plans
- 1 day from start to ship (2026-01-13)

**Git range:** `feat(01-01)` → `feat(06-02)`

**What's next:** TBD - ready for user validation and feedback

---
