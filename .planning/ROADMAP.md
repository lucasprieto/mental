# Roadmap: Mental

## Overview

Build a personal mind centralization system: MCP server that connects to Claude Code/Cursor for frictionless thought capture, with a webapp for viewing and managing items.

## Domain Expertise

None

## Milestones

- ✅ [**v1.0 MVP**](milestones/v1.0-ROADMAP.md) - Phases 1-6 (shipped 2026-01-13)
- ✅ [**v2.0 Cloud Sync**](milestones/v2.0-ROADMAP.md) - Phases 7-11 (shipped 2026-01-14)
- 🚧 **v3.0 UX & Intelligence** - Phases 12-16 (in progress)

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

<details>
<summary>✅ v2.0 Cloud Sync (Phases 7-11) - SHIPPED 2026-01-14</summary>

- [x] **Phase 7: Backend Setup** - API server with database hosting
- [x] **Phase 8: Data Sync** - Migrate from local SQLite to hosted database
- [x] **Phase 9: MCP Server Sync** - Update MCP server to use remote API
- [x] **Phase 10: Webapp Sync** - Update webapp to use remote API
- [x] **Phase 11: Advanced Capture** - Better theme extraction, context awareness

Plans:
- [x] 07-01: API package setup with Hono and Neon database connection
- [x] 07-02: API routes for items and sessions CRUD
- [x] 08-01: Neon database setup and schema push
- [x] 08-02: Migration script and data verification
- [x] 09-01: Convert MCP tools to remote API calls
- [x] 10-01: Convert webapp to remote API calls
- [x] 11-01: Enhanced theme extraction with sentiment detection
- [x] 11-02: Project context and auto-tagging

</details>

### 🚧 v3.0 UX & Intelligence (In Progress)

**Milestone Goal:** Better intelligence (LLM themes) + polished user experience

- [ ] **Phase 12: LLM Theme Selection** - Let calling LLM decide themes
- [ ] **Phase 13: Dashboard Redesign** - Better filters, modern UI
- [ ] **Phase 14: Follow-up Functionality** - Append context to thoughts
- [ ] **Phase 15: Full-text Search** - Search across content
- [ ] **Phase 16: Responsive Mobile** - Phone-friendly design

#### Phase 12: LLM Theme Selection

**Goal**: Refactor capture_thought to add `theme` as an enum parameter, remove string-based sentiment detection, remove tags from system
**Depends on**: v2.0 complete
**Research**: None needed (internal refactoring)
**Plans**: 2 plans

Plans:
- [x] 12-01: MCP Server - Theme enum & remove tags
- [ ] 12-02: Remove tags from schema, API, and webapp

#### Phase 13: Dashboard Redesign

**Goal**: Redesign dashboard with better filter placement, modern admin dashboard inspiration
**Depends on**: Phase 12
**Research**: Likely (UI inspiration)
**Research topics**: Admin dashboard patterns, filter UX best practices
**Plans**: TBD

Plans:
- [ ] 13-01: TBD

#### Phase 14: Follow-up Functionality

**Goal**: Add ability to append context/updates to existing thoughts (thread-like)
**Depends on**: Phase 13
**Research**: Unlikely (internal patterns)
**Plans**: TBD

Plans:
- [ ] 14-01: TBD

#### Phase 15: Full-text Search

**Goal**: Search across thought titles and content for better discovery
**Depends on**: Phase 14
**Research**: Likely (search implementation)
**Research topics**: Postgres FTS, search patterns
**Plans**: TBD

Plans:
- [ ] 15-01: TBD

#### Phase 16: Responsive Mobile

**Goal**: Make webapp work well on phone screens with responsive design
**Depends on**: Phase 15
**Research**: Unlikely (Tailwind responsive patterns)
**Plans**: TBD

Plans:
- [ ] 16-01: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → ... → 12 → 13 → 14 → 15 → 16

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Foundation | v1.0 | 2/2 | Complete | 2026-01-13 |
| 2. MCP Server Core | v1.0 | 2/2 | Complete | 2026-01-13 |
| 3. Capture Engine | v1.0 | 2/2 | Complete | 2026-01-13 |
| 4. Session Lifecycle | v1.0 | 2/2 | Complete | 2026-01-13 |
| 5. Webapp Core | v1.0 | 3/3 | Complete | 2026-01-13 |
| 6. Webapp Features | v1.0 | 2/2 | Complete | 2026-01-13 |
| 7. Backend Setup | v2.0 | 2/2 | Complete | 2026-01-13 |
| 8. Data Sync | v2.0 | 2/2 | Complete | 2026-01-14 |
| 9. MCP Server Sync | v2.0 | 1/1 | Complete | 2026-01-14 |
| 10. Webapp Sync | v2.0 | 1/1 | Complete | 2026-01-14 |
| 11. Advanced Capture | v2.0 | 2/2 | Complete | 2026-01-14 |
| 12. LLM Theme Selection | v3.0 | 1/2 | In progress | - |
| 13. Dashboard Redesign | v3.0 | 0/? | Not started | - |
| 14. Follow-up Functionality | v3.0 | 0/? | Not started | - |
| 15. Full-text Search | v3.0 | 0/? | Not started | - |
| 16. Responsive Mobile | v3.0 | 0/? | Not started | - |
