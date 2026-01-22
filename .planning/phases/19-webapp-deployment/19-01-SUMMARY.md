---
phase: 19-webapp-deployment
plan: 01
subsystem: infra
tags: [vercel, deployment, auth0, fetch]

requires:
  - phase: 18
    provides: Auth0 integration with login/logout
provides:
  - Production webapp deployment at mental-webapp.vercel.app
  - Independent webapp with no workspace dependencies
affects: [20-user-management]

tech-stack:
  added: []
  patterns: [fetch-based API client, local type definitions]

key-files:
  created: []
  modified:
    - packages/webapp/src/lib/api.ts
    - packages/webapp/package.json

key-decisions:
  - "Remove @mental/api workspace dependency - define types locally"
  - "Use plain fetch instead of Hono RPC client for API calls"
  - "Deploy from monorepo root with pnpm filter commands"

issues-created: []

duration: ~45min
completed: 2026-01-20
---

# Phase 19 Plan 01: Webapp Deployment Summary

**Webapp deployed to Vercel at mental-webapp.vercel.app with Auth0 authentication**

## Performance

- **Duration:** ~45 min
- **Tasks:** 4
- **Files modified:** 5

## Accomplishments

- Deployed webapp to Vercel production
- Removed @mental/api workspace dependency (was blocking Vercel builds)
- Replaced Hono RPC client with plain fetch and local types
- Configured Auth0 for production (callback/logout URLs)
- Verified login/logout flow works end-to-end

## Task Commits

1. **Task 1: Configure Next.js** - `ffe1c48` (chore)
2. **Type fixes for Vercel** - `1bf6e0b`, `3d21916` (fix)
3. **Remove workspace dependency** - `99bfb33` (fix)
4. **Update lockfile** - `67bd787` (chore)

## Files Created/Modified

- `packages/webapp/src/lib/api.ts` - Rewrote with fetch and local ApiItem type
- `packages/webapp/src/app/page.tsx` - Use fetchItems instead of Hono client
- `packages/webapp/src/app/api/items/route.ts` - Use createItem helper
- `packages/webapp/src/app/api/items/[id]/route.ts` - Use updateItem helper
- `packages/webapp/package.json` - Removed @mental/api and hono deps

## Decisions Made

1. **Remove @mental/api dependency** - Workspace dependencies don't resolve properly when Vercel builds from subdirectory. Cleaner to define types locally.
2. **Plain fetch over Hono RPC** - Simpler, no build-time coupling between packages, webapp is now fully independent.

## Issues Encountered

- Vercel couldn't resolve workspace dependency types (even from monorepo root)
- Multiple iterations to find the right fix
- Solved by removing dependency entirely and using fetch

## Next Phase Readiness

- Webapp live at https://mental-webapp.vercel.app
- Auth0 working in production
- Ready for Phase 20: User Management

---
*Phase: 19-webapp-deployment*
*Completed: 2026-01-20*
