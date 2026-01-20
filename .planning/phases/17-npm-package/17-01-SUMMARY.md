---
phase: 17-npm-package
plan: 01
subsystem: infra
tags: [npm, mcp, tsup, cli, distribution]

# Dependency graph
requires:
  - phase: 16-responsive-mobile
    provides: Complete v3.0 MCP server ready for packaging
provides:
  - npm package @go-mental/mcp ready for publishing
  - CLI entry point for npx execution
  - README with installation and usage instructions
affects: [18-auth0-integration, 19-webapp-deployment]

# Tech tracking
tech-stack:
  added: [tsup]
  patterns: [npm-package-bundling, cli-entry-point]

key-files:
  created: [packages/mcp-server/tsup.config.ts, packages/mcp-server/src/cli.ts, packages/mcp-server/README.md]
  modified: [packages/mcp-server/package.json, packages/mcp-server/src/api.ts]

key-decisions:
  - "Use tsup for bundling with external runtime dependencies"
  - "Keep MCP SDK, hono, zod as npm dependencies (not bundled)"
  - "Remove workspace type imports, use AnyRoute for flexibility"

patterns-established:
  - "npm package config: bin, files, engines fields for CLI packages"
  - "External dependencies for npm packages that users need at runtime"

issues-created: []

# Metrics
duration: 5min
completed: 2026-01-20
---

# Phase 17 Plan 01: npm Package Setup Summary

**@go-mental/mcp npm package configured with tsup bundler, CLI entry point, and README - ready for npm publish**

## Performance

- **Duration:** 5 min
- **Started:** 2026-01-20T13:43:21Z
- **Completed:** 2026-01-20T13:48:53Z
- **Tasks:** 3
- **Files modified:** 6

## Accomplishments

- Renamed package to @go-mental/mcp for npm publishing
- Configured tsup bundler for ESM output targeting Node 18+
- Created CLI entry point with graceful shutdown handling
- Removed workspace dependencies (now uses runtime deps)
- Added comprehensive README with installation and usage instructions
- Verified npm pack produces clean tarball with only expected files

## Task Commits

Each task was committed atomically:

1. **Task 1: Configure tsup bundler and update package.json** - `b91215c` (feat)
2. **Task 2: Create CLI entry point and inline API types** - `132710c` (feat)
3. **Task 3: Create README and test npm pack** - `5c96abb` (docs)

## Files Created/Modified

- `packages/mcp-server/package.json` - Renamed to @go-mental/mcp, added npm metadata
- `packages/mcp-server/tsup.config.ts` - Bundler configuration for ESM output
- `packages/mcp-server/src/cli.ts` - CLI entry point with signal handling
- `packages/mcp-server/src/api.ts` - Removed @mental/api import, uses AnyRoute
- `packages/mcp-server/README.md` - Installation and usage documentation

## Decisions Made

- **tsup over tsc**: tsup bundles source while keeping external deps, perfect for npm CLI packages
- **External runtime dependencies**: @modelcontextprotocol/sdk, hono, zod stay as npm deps (installed by users)
- **AnyRoute typing**: Removed strict typing from @mental/api to eliminate workspace dependency - functionality unchanged

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Duplicate shebang in output**
- **Found during:** Task 2 (CLI entry point creation)
- **Issue:** Both cli.ts and tsup banner had shebang, resulting in duplicate
- **Fix:** Removed shebang from cli.ts, let tsup add it via banner config
- **Files modified:** packages/mcp-server/src/cli.ts
- **Verification:** Build output has single shebang line
- **Committed in:** 132710c (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (blocking), 0 deferred
**Impact on plan:** Minor fix, no scope change.

## Issues Encountered

None

## Next Phase Readiness

- Package ready for `npm publish` to @go-mental org
- Users can run `npx @go-mental/mcp` after publishing
- Need to actually publish (manual step outside this plan)
- Phase 18 (Auth0) can proceed once API supports multi-user

---
*Phase: 17-npm-package*
*Completed: 2026-01-20*
