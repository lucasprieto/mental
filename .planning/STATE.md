# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-14)

**Core value:** Frictionless capture — thoughts get logged without interrupting flow
**Current focus:** v4.0 Distribution & Auth — npm publishing + user authentication

## Current Position

Phase: 20 of 20 (User Management)
Plan: 0 of ? complete
Status: Ready to plan
Last activity: 2026-01-20 — Completed Phase 19 (webapp deployed to Vercel)

Progress: █████████░░░ 75% (v4.0)

## Performance Metrics

**Velocity:**
- Total plans completed: 23 (13 v1.0 + 8 v2.0 + 2 v4.0)
- Average duration: ~3 min
- Total execution time: ~1 hour 50 min

**By Milestone:**

| Milestone | Phases | Plans | Duration |
|-----------|--------|-------|----------|
| v1.0 MVP | 1-6 | 13 | ~35 min |
| v2.0 Cloud Sync | 7-11 | 8 | ~25 min |
| v3.0 UX & Intelligence | 12-16 | TBD | - |
| v4.0 Distribution & Auth | 17-20 | 5 | ~59 min |

## Accumulated Context

### Decisions

All key decisions logged in PROJECT.md Key Decisions table.

**Phase 17:**
- tsup for npm package bundling with external runtime dependencies
- @go-mental/mcp as npm package name
- AnyRoute typing to remove workspace dependency

**Phase 18:**
- SHA-256 for API key hashing (not bcrypt)
- mental_ prefix for API keys
- Hard delete for key removal
- nextjs-auth0 v4 middleware pattern (not v3 route handler)
- Combined auth middleware (JWT first, then API key)
- Routes not protected yet (Phase 19/20)

**Phase 19:**
- Remove @mental/api workspace dependency (Vercel can't resolve workspace types)
- Plain fetch instead of Hono RPC client (simpler, no build coupling)
- Deploy from monorepo root with pnpm filter commands
- Webapp fully independent from API package

### Deferred Issues

None.

### Pending Todos

None.

### Blockers/Concerns

None.

### Roadmap Evolution

- v1.0 MVP: Foundation through Webapp Features (Phases 1-6)
- v2.0 Cloud Sync: Backend + Advanced Capture (Phases 7-11)
- v3.0 UX & Intelligence: LLM themes + Dashboard + Search + Mobile (Phases 12-16)
- v4.0 Distribution & Auth: npm package + Auth0 + deployment (Phases 17-20)

## Session Continuity

Last session: 2026-01-20
Stopped at: Completed 19-01-PLAN.md, Phase 19 complete (webapp at mental-webapp.vercel.app)
Resume file: None
