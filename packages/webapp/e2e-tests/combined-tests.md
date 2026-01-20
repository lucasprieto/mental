# Combined Search + Filter Tests

## Overview

Tests for interactions between search and filter functionality.

---

## TEST-C01: Search Then Add Status Filter

**Description**: Adding a status filter while searching preserves both

**Steps**:
1. Navigate to `http://localhost:3001/`
2. Type "mental" in search box, wait for URL update
3. Click "Open" status filter

**Expected Results**:
- [ ] URL updates to `/?q=mental&status=open`
- [ ] Only open items matching "mental" are shown
- [ ] Search input still contains "mental"
- [ ] "Open" button is highlighted

**How to verify with agent-browser**:
```bash
agent-browser open http://localhost:3001/
agent-browser snapshot -i
agent-browser fill @e6 "mental"
sleep 1
agent-browser snapshot -i
agent-browser click @e2  # Open
sleep 0.5
agent-browser get url  # Should be /?q=mental&status=open
```

---

## TEST-C02: Search Then Add Theme Filter

**Description**: Adding a theme filter while searching preserves both

**Steps**:
1. Navigate to `http://localhost:3001/`
2. Type "mental" in search box, wait for URL update
3. Click "idea" theme filter

**Expected Results**:
- [ ] URL updates to `/?q=mental&theme=idea`
- [ ] Only items with theme "idea" matching "mental" are shown
- [ ] Search input still contains "mental"

---

## TEST-C03: Status Filter Then Search

**Description**: Searching while filtered preserves the filter

**Steps**:
1. Navigate to `http://localhost:3001/`
2. Click "Open" status filter
3. Type "phase" in search box

**Expected Results**:
- [ ] URL updates to `/?status=open&q=phase`
- [ ] Only open items matching "phase" are shown
- [ ] "Open" button remains highlighted

**How to verify with agent-browser**:
```bash
agent-browser open http://localhost:3001/
agent-browser snapshot -i
agent-browser click @e2  # Open
sleep 0.5
agent-browser snapshot -i
agent-browser fill @e6 "phase"
sleep 1
agent-browser get url  # Should be /?status=open&q=phase
```

---

## TEST-C04: Theme Filter Then Search

**Description**: Searching while theme-filtered preserves the filter

**Steps**:
1. Navigate to `http://localhost:3001/`
2. Click "idea" theme filter
3. Type "test" in search box

**Expected Results**:
- [ ] URL updates to `/?theme=idea&q=test`
- [ ] Only items with theme "idea" matching "test" are shown

---

## TEST-C05: Search → Filter → Change Filter

**Description**: Changing filter while searching preserves search

**Steps**:
1. Navigate to `http://localhost:3001/`
2. Type "test" in search box
3. Click "Open" status filter
4. Click "Resolved" status filter

**Expected Results**:
- [ ] URL updates to `/?q=test&status=resolved`
- [ ] Only resolved items matching "test" are shown
- [ ] Search input still contains "test"

---

## TEST-C06: Search → Filter → Clear Search

**Description**: Clearing search while filtered preserves filter

**Steps**:
1. Navigate to `http://localhost:3001/`
2. Type "test" in search box
3. Click "Resolved" status filter (URL: `/?q=test&status=resolved`)
4. Clear the search input

**Expected Results**:
- [ ] URL updates to `/?status=resolved` (q param removed)
- [ ] All resolved items are shown (not filtered by search)
- [ ] "Resolved" filter remains active

**How to verify with agent-browser**:
```bash
agent-browser open http://localhost:3001/
agent-browser snapshot -i
agent-browser fill @e6 "test"
sleep 1
agent-browser snapshot -i
agent-browser click @e3  # Resolved
sleep 0.5
agent-browser snapshot -i
agent-browser fill @e5 ""  # Clear search
sleep 1
agent-browser get url  # Should be /?status=resolved
```

---

## TEST-C07: Filter → Search → Remove Filter

**Description**: Removing filter while searching preserves search

**Steps**:
1. Navigate to `http://localhost:3001/`
2. Click "Open" status filter
3. Type "mental" in search box
4. Click "All" status filter

**Expected Results**:
- [ ] URL updates to `/?q=mental` (status param removed)
- [ ] All items matching "mental" are shown (both open and resolved)
- [ ] Search input still contains "mental"

---

## TEST-C08: Theme Filter → Search → Switch Theme

**Description**: Switching theme filter while searching preserves search

**Steps**:
1. Navigate to `http://localhost:3001/?theme=idea`
2. Type "test" in search box
3. Click "blocker" theme filter

**Expected Results**:
- [ ] URL updates to `/?theme=blocker&q=test`
- [ ] Only items with theme "blocker" matching "test" are shown
- [ ] Search input still contains "test"

---

## TEST-C09: All Three Params Combined

**Description**: Search + status + theme all work together

**Steps**:
1. Navigate to `http://localhost:3001/`
2. Type "test" in search box
3. Click "Open" status filter
4. Click "idea" theme filter

**Expected Results**:
- [ ] URL contains all three: `/?q=test&status=open&theme=idea`
- [ ] Only open items with theme "idea" matching "test" are shown

---

## TEST-C10: Dynamic Theme Pills During Search

**Description**: Theme pills update to show only themes with matching results

**Steps**:
1. Navigate to `http://localhost:3001/`
2. Note which theme pills are visible
3. Type "mental" in search box
4. Observe theme pills

**Expected Results**:
- [ ] Theme pills update to show only themes that have items matching "mental"
- [ ] If search term matches only "idea" items, "blocker" pill disappears
- [ ] Clearing search restores all theme pills
