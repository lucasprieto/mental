# Roadmap: Mental

## Overview

Build a personal mind centralization system in six phases: foundation and tech stack, MCP server that connects to Claude Code/Cursor, capture engine for automatic theme extraction and explicit tagging, session lifecycle tracking (open → resolved), webapp for viewing and managing items, and finally search/filter/manual entry features.

## Domain Expertise

None

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

- [ ] **Phase 1: Foundation** - Project setup, tech stack, database schema
- [ ] **Phase 2: MCP Server Core** - Basic MCP server for Claude Code/Cursor
- [ ] **Phase 3: Capture Engine** - Auto-extraction and explicit tagging
- [ ] **Phase 4: Session Lifecycle** - Open/resolved tracking with sessions
- [ ] **Phase 5: Webapp Core** - Dashboard and item viewing
- [ ] **Phase 6: Webapp Features** - Search, filter, manual entry

## Phase Details

### Phase 1: Foundation
**Goal**: Establish project structure, choose tech stack, design database schema for mental items
**Depends on**: Nothing (first phase)
**Research**: Likely (tech stack decisions, MCP protocol basics)
**Research topics**: MCP protocol specification, recommended stack for MCP servers, database options
**Plans**: TBD

Plans:
- [x] 01-01: Tech stack decisions and project setup
- [ ] 01-02: Database schema design and setup

### Phase 2: MCP Server Core
**Goal**: Working MCP server that Claude Code and Cursor can discover and connect to
**Depends on**: Phase 1
**Research**: Likely (MCP protocol, tool registration, Claude Code integration)
**Research topics**: MCP server implementation, tool schemas, how Cursor/Claude Code discover MCP servers
**Plans**: TBD

Plans:
- [ ] 02-01: Basic MCP server with health check
- [ ] 02-02: Tool registration and connection testing

### Phase 3: Capture Engine
**Goal**: MCP tools that capture thoughts — auto-extract themes from context, support explicit tags
**Depends on**: Phase 2
**Research**: Unlikely (building on established MCP patterns)
**Plans**: TBD

Plans:
- [ ] 03-01: Capture tool with theme extraction
- [ ] 03-02: Explicit tagging support

### Phase 4: Session Lifecycle
**Goal**: Items have lifecycle (open → resolved), session-aware resolution with summaries
**Depends on**: Phase 3
**Research**: Unlikely (internal patterns)
**Plans**: TBD

Plans:
- [ ] 04-01: Item lifecycle states and transitions
- [ ] 04-02: Session-aware resolution with summaries

### Phase 5: Webapp Core
**Goal**: Web interface showing dashboard with open items, recently resolved, themes/tags at a glance
**Depends on**: Phase 4
**Research**: Unlikely (standard webapp patterns)
**Plans**: TBD

Plans:
- [ ] 05-01: Webapp setup and routing
- [ ] 05-02: Dashboard view
- [ ] 05-03: Item detail view

### Phase 6: Webapp Features
**Goal**: Search and filter (keyword, tag, date, status), manual entry/editing directly in webapp
**Depends on**: Phase 5
**Research**: Unlikely (standard webapp patterns)
**Plans**: TBD

Plans:
- [ ] 06-01: Search and filter functionality
- [ ] 06-02: Manual entry and editing

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 1/2 | In progress | - |
| 2. MCP Server Core | 0/2 | Not started | - |
| 3. Capture Engine | 0/2 | Not started | - |
| 4. Session Lifecycle | 0/2 | Not started | - |
| 5. Webapp Core | 0/3 | Not started | - |
| 6. Webapp Features | 0/2 | Not started | - |
