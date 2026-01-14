# Plan 13-01 Summary: Layout Restructure with Sidebar

**Completed:** 2026-01-14
**Duration:** ~5 minutes

## What Was Built

Restructured the dashboard layout with a fixed sidebar for filters, following CSS Grid patterns and Linear-style minimal aesthetics.

### Changes Made

1. **Installed Headless UI** (`@headlessui/react`)
   - Added to webapp package for accessible UI components
   - Will be used in Plan 02 for collapsible sections

2. **Restructured Layout** (`layout.tsx`)
   - Removed header from layout (now handled in sidebar)
   - Added `ml-64` margin to account for fixed sidebar
   - Added subtle gray background (`bg-gray-50`)

3. **Created Sidebar Component** (`Sidebar.tsx`)
   - Fixed position left sidebar (w-64)
   - "Mental" branding at top
   - Slim theme pills below branding showing active themes
   - Status filters (All/Open/Resolved) with Linear-style buttons
   - Theme filters with purple accent for active selection
   - Uses URL params for filter state (same pattern as old FilterBar)

4. **Updated Dashboard Page** (`page.tsx`)
   - Removed FilterBar component usage
   - Removed "Active Themes" overview section (now in sidebar)
   - Added Sidebar component rendering
   - Kept stats row and item lists unchanged

### Files Modified

- `packages/webapp/package.json` - Added @headlessui/react dependency
- `packages/webapp/src/app/layout.tsx` - Simplified to main content with margin
- `packages/webapp/src/app/page.tsx` - Removed FilterBar, added Sidebar
- `packages/webapp/src/components/Sidebar.tsx` - New component

### Files Deprecated

- `packages/webapp/src/components/FilterBar.tsx` - No longer used (kept for reference)

## Verification

- [x] `pnpm --filter @mental/webapp build` succeeds
- [x] Dashboard loads with sidebar on left
- [x] Sidebar contains branding, theme pills, and filter sections
- [x] No TypeScript errors

## Next Steps

Plan 13-02 will add the CollapsibleSection component for the Recently Resolved section.
