# Roadmap: Mental

## Overview

Build a personal mind centralization system: MCP server that connects to Claude Code/Cursor for frictionless thought capture, with a webapp for viewing and managing items.

## Domain Expertise

None

## Milestones

- ✅ [**v1.0 MVP**](milestones/v1.0-ROADMAP.md) - Phases 1-6 (shipped 2026-01-13)
- 🚧 **v2.0 Cloud Sync** - Phases 7-11 (in progress)

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

<details>
<summary>✅ v1.0 MVP (Phases 1-6) - SHIPPED 2026-01-13</summary>

- [x] **Phase 1: Foundation** - Project setup, tech stack, database schema
- [x] **Phase 2: MCP Server Core** - Basic MCP server for Claude Code/Cursor
- [x] **Phase 3: Capture Engine** - Auto-extraction and explicit tagging
- [x] **Phase 4: Session Lifecycle** - Open/resolved tracking with sessions
- [x] **Phase 5: Webapp Core** - Dashboard and item viewing
- [x] **Phase 6: Webapp Features** - Search, filter, manual entry

Plans:
- [x] 01-01: Tech stack decisions and project setup
- [x] 01-02: Database schema design and setup
- [x] 02-01: Basic MCP server with health check
- [x] 02-02: Tool registration and connection testing
- [x] 03-01: Capture tool with theme extraction
- [x] 03-02: List and query tools
- [x] 04-01: Item lifecycle states and transitions
- [x] 04-02: Session-aware resolution with summaries
- [x] 05-01: Webapp setup and routing
- [x] 05-02: Dashboard view
- [x] 05-03: Item detail view
- [x] 06-01: Search and filter functionality
- [x] 06-02: Manual entry and editing

</details>

### 🚧 v2.0 Cloud Sync (In Progress)

**Milestone Goal:** Backend for multi-computer access with advanced capture improvements

- [x] **Phase 7: Backend Setup** - API server with database hosting
- [ ] **Phase 8: Data Sync** - Migrate from local SQLite to hosted database
- [ ] **Phase 9: MCP Server Sync** - Update MCP server to use remote API
- [ ] **Phase 10: Webapp Sync** - Update webapp to use remote API
- [ ] **Phase 11: Advanced Capture** - Better theme extraction, context awareness

#### Phase 7: Backend Setup

**Goal**: Set up hosted API server and database for multi-computer access
**Depends on**: v1.0 complete
**Research**: Complete (Hono + Neon Postgres + Railway)
**Plans**: 2 plans

Plans:
- [x] 07-01: API package setup with Hono and Neon database connection
- [x] 07-02: API routes for items and sessions CRUD

#### Phase 8: Data Sync

**Goal**: Migrate from local SQLite to hosted database with sync capability
**Depends on**: Phase 7
**Research**: Complete (Neon setup, migration script)
**Plans**: 2 plans

Plans:
- [ ] 08-01: Neon database setup and schema push
- [ ] 08-02: Migration script and data verification

#### Phase 9: MCP Server Sync

**Goal**: Update MCP server to use remote API instead of local SQLite
**Depends on**: Phase 8
**Research**: Unlikely (internal patterns)
**Plans**: TBD

Plans:
- [ ] 09-01: TBD

#### Phase 10: Webapp Sync

**Goal**: Update webapp to use remote API instead of local database
**Depends on**: Phase 8
**Research**: Unlikely (internal patterns)
**Plans**: TBD

Plans:
- [ ] 10-01: TBD

#### Phase 11: Advanced Capture

**Goal**: Improved theme extraction, context awareness, smart tagging
**Depends on**: Phase 9
**Research**: Unlikely (internal patterns, regex improvements)
**Plans**: TBD

Plans:
- [ ] 11-01: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Foundation | v1.0 | 2/2 | Complete | 2026-01-13 |
| 2. MCP Server Core | v1.0 | 2/2 | Complete | 2026-01-13 |
| 3. Capture Engine | v1.0 | 2/2 | Complete | 2026-01-13 |
| 4. Session Lifecycle | v1.0 | 2/2 | Complete | 2026-01-13 |
| 5. Webapp Core | v1.0 | 3/3 | Complete | 2026-01-13 |
| 6. Webapp Features | v1.0 | 2/2 | Complete | 2026-01-13 |
| 7. Backend Setup | v2.0 | 2/2 | Complete | 2026-01-13 |
| 8. Data Sync | v2.0 | 0/2 | Not started | - |
| 9. MCP Server Sync | v2.0 | 0/? | Not started | - |
| 10. Webapp Sync | v2.0 | 0/? | Not started | - |
| 11. Advanced Capture | v2.0 | 0/? | Not started | - |
