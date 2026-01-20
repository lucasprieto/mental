# URL Persistence Tests

## Overview

Tests for URL state persistence across page loads and navigation.

---

## TEST-U01: Search Persists on Refresh

**Description**: Search query is preserved when page is refreshed

**Steps**:
1. Navigate to `http://localhost:3001/`
2. Type "mental" in search box
3. Wait for URL to update to `/?q=mental`
4. Refresh the page (F5 or browser reload)

**Expected Results**:
- [ ] URL remains `/?q=mental`
- [ ] Search input contains "mental"
- [ ] Results are filtered to match "mental"

**How to verify with agent-browser**:
```bash
agent-browser open http://localhost:3001/?q=mental
agent-browser snapshot -i
# Check search input has value
agent-browser reload
sleep 1
agent-browser get url  # Should still be /?q=mental
```

---

## TEST-U02: Status Filter Persists on Refresh

**Description**: Status filter is preserved when page is refreshed

**Steps**:
1. Navigate to `http://localhost:3001/?status=open`
2. Refresh the page

**Expected Results**:
- [ ] URL remains `/?status=open`
- [ ] "Open" button is highlighted
- [ ] Only open items are shown

---

## TEST-U03: Theme Filter Persists on Refresh

**Description**: Theme filter is preserved when page is refreshed

**Steps**:
1. Navigate to `http://localhost:3001/?theme=idea`
2. Refresh the page

**Expected Results**:
- [ ] URL remains `/?theme=idea`
- [ ] "idea" theme button is highlighted
- [ ] Only items with theme "idea" are shown

---

## TEST-U04: Combined Params Persist on Refresh

**Description**: All URL params are preserved when page is refreshed

**Steps**:
1. Navigate to `http://localhost:3001/?q=mental&status=open&theme=idea`
2. Refresh the page

**Expected Results**:
- [ ] URL remains `/?q=mental&status=open&theme=idea`
- [ ] Search input contains "mental"
- [ ] "Open" button is highlighted
- [ ] "idea" theme button is highlighted
- [ ] Results match all three filters

**How to verify with agent-browser**:
```bash
agent-browser open "http://localhost:3001/?q=mental&status=open&theme=idea"
sleep 1
agent-browser get url  # Should be /?q=mental&status=open&theme=idea
agent-browser snapshot -i
# Verify UI state matches URL params
```

---

## TEST-U05: Direct URL Navigation

**Description**: Navigating directly to a URL with params applies all filters

**Steps**:
1. Open a new browser tab
2. Navigate directly to `http://localhost:3001/?q=test&status=resolved`

**Expected Results**:
- [ ] Search input contains "test"
- [ ] "Resolved" button is highlighted
- [ ] Only resolved items matching "test" are shown

---

## TEST-U06: Shareable URLs

**Description**: URLs can be shared and reproduce the same view

**Steps**:
1. User A: Navigate and filter to get URL `/?q=phase&theme=idea`
2. User A: Copy the URL
3. User B: Paste and navigate to the URL

**Expected Results**:
- [ ] User B sees identical filtered results
- [ ] Search input contains "phase"
- [ ] "idea" theme is active

---

## TEST-U07: Browser Back/Forward Navigation

**Description**: Browser history works with filter changes

**Steps**:
1. Navigate to `http://localhost:3001/`
2. Click "Open" filter (URL: `/?status=open`)
3. Click "Resolved" filter (URL: `/?status=resolved`)
4. Click browser back button
5. Click browser forward button

**Expected Results**:
- [ ] Back navigates to `/?status=open` with correct UI state
- [ ] Forward navigates to `/?status=resolved` with correct UI state
- [ ] Each navigation updates both URL and UI

---

## TEST-U08: Bookmarkable State

**Description**: Bookmarking a filtered view works correctly

**Steps**:
1. Navigate to `http://localhost:3001/?q=mental&theme=idea`
2. Bookmark the page
3. Close the tab
4. Open the bookmark

**Expected Results**:
- [ ] Page loads with all filters applied
- [ ] Identical view to when bookmark was created
