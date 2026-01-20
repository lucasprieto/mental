# Filter Functionality Tests

## Overview

Tests for status filters (All/Open/Resolved) and theme filters in the sidebar.

---

## Status Filter Tests

### TEST-F01: Filter by Open Status

**Description**: Clicking "Open" filter shows only open items

**Steps**:
1. Navigate to `http://localhost:3001/`
2. Click "Open" button in sidebar

**Expected Results**:
- [ ] URL updates to `/?status=open`
- [ ] Only items with status "open" are displayed
- [ ] "Recently Resolved" section is hidden
- [ ] "Open" button appears selected/highlighted

**How to verify with agent-browser**:
```bash
agent-browser open http://localhost:3001/
agent-browser snapshot -i
agent-browser click @e2  # Open button
sleep 0.5
agent-browser get url  # Should be /?status=open
```

---

### TEST-F02: Filter by Resolved Status

**Description**: Clicking "Resolved" filter shows only resolved items

**Steps**:
1. Navigate to `http://localhost:3001/`
2. Click "Resolved" button in sidebar

**Expected Results**:
- [ ] URL updates to `/?status=resolved`
- [ ] Only items with status "resolved" are displayed
- [ ] "Recently Resolved" section auto-expands
- [ ] "Open Items" section is hidden
- [ ] "Resolved" button appears selected/highlighted

---

### TEST-F03: Filter by All Status (Reset)

**Description**: Clicking "All" filter shows all items and clears status param

**Steps**:
1. Navigate to `http://localhost:3001/?status=open`
2. Click "All" button in sidebar

**Expected Results**:
- [ ] URL updates to `/` (status param removed)
- [ ] Both open and resolved items are displayed
- [ ] "All" button appears selected/highlighted

**How to verify with agent-browser**:
```bash
agent-browser open http://localhost:3001/?status=open
agent-browser snapshot -i
agent-browser click @e1  # All button
sleep 0.5
agent-browser get url  # Should be / (no status param)
```

---

## Theme Filter Tests

### TEST-F04: Filter by Theme

**Description**: Clicking a theme filter shows only items with that theme

**Steps**:
1. Navigate to `http://localhost:3001/`
2. Click "idea" theme button in sidebar

**Expected Results**:
- [ ] URL updates to `/?theme=idea`
- [ ] Only items with theme "idea" are displayed
- [ ] Stats update to reflect filtered counts
- [ ] "idea" button appears selected/highlighted

---

### TEST-F05: Switch Between Themes

**Description**: Clicking a different theme switches the filter

**Steps**:
1. Navigate to `http://localhost:3001/?theme=idea`
2. Click "blocker" theme button in sidebar

**Expected Results**:
- [ ] URL updates to `/?theme=blocker`
- [ ] Only items with theme "blocker" are displayed
- [ ] "blocker" button appears selected/highlighted
- [ ] "idea" button is no longer highlighted

**How to verify with agent-browser**:
```bash
agent-browser open http://localhost:3001/?theme=idea
agent-browser snapshot -i
agent-browser click @e5  # blocker button
sleep 0.5
agent-browser get url  # Should be /?theme=blocker
```

---

### TEST-F06: Clear Theme Filter

**Description**: Clicking active theme again clears the filter

**Steps**:
1. Navigate to `http://localhost:3001/?theme=idea`
2. Click "idea" theme button again

**Expected Results**:
- [ ] URL updates to `/` (theme param removed)
- [ ] All items are displayed regardless of theme
- [ ] No theme button is highlighted

---

## Dynamic Theme Pills

### TEST-F07: Theme Pills Update Based on Data

**Description**: Theme pills reflect available themes in current dataset

**Steps**:
1. Navigate to `http://localhost:3001/`
2. Observe theme pills in sidebar

**Expected Results**:
- [ ] Only themes that exist in the data are shown
- [ ] Theme pill counts reflect number of items with that theme
- [ ] If no items have a theme, that pill is not shown
