# Search Functionality Tests

## Overview

Tests for the search bar component with debounced URL sync.

---

## TEST-S01: Basic Search

**Description**: Typing in search box updates URL after debounce

**Steps**:
1. Navigate to `http://localhost:3001/`
2. Locate search input (placeholder "Search thoughts...")
3. Type "mental" in the search box
4. Wait 300ms (debounce delay)

**Expected Results**:
- [ ] URL updates to `/?q=mental`
- [ ] Results filter to items containing "mental"
- [ ] Stats update to reflect filtered counts
- [ ] Theme pills update to show only themes with matching items

**How to verify with agent-browser**:
```bash
agent-browser open http://localhost:3001/
agent-browser snapshot -i
agent-browser fill @e6 "mental"
sleep 1
agent-browser get url  # Should be /?q=mental
```

---

## TEST-S02: Search with Different Terms

**Description**: Search works with various search terms

**Test Data**:
| Search Term | Expected Behavior |
|-------------|-------------------|
| "phase" | Returns items with "phase" in title/content |
| "follow" | Returns items with "follow" in title/content |
| "test" | Returns items with "test" in title/content |
| "blocker" | Returns items with "blocker" in title/content |

**Steps**:
1. Navigate to `http://localhost:3001/`
2. Type each search term
3. Wait for debounce
4. Verify URL and results

**Expected Results**:
- [ ] URL updates to `/?q={term}` for each term
- [ ] Results match the search term
- [ ] Empty results show "No results found" message

---

## TEST-S03: Clear Search

**Description**: Clearing search input restores all items

**Steps**:
1. Navigate to `http://localhost:3001/`
2. Type "mental" in search box
3. Wait for URL to update to `/?q=mental`
4. Clear the search input (select all, delete)
5. Wait 300ms

**Expected Results**:
- [ ] URL changes back to `/` (no query param)
- [ ] All items are displayed
- [ ] All theme pills are visible
- [ ] Stats show unfiltered counts

**How to verify with agent-browser**:
```bash
agent-browser fill @e6 "mental"
sleep 1
agent-browser fill @e6 ""
sleep 1
agent-browser get url  # Should be /
```

---

## TEST-S04: Search No Results

**Description**: Searching for non-existent term shows empty state

**Steps**:
1. Navigate to `http://localhost:3001/`
2. Type "xyznonexistent123" in search box
3. Wait for debounce

**Expected Results**:
- [ ] URL updates to `/?q=xyznonexistent123`
- [ ] "No results found for 'xyznonexistent123'" message displayed
- [ ] Stats show 0 for all counts
- [ ] No theme pills visible (no matching themes)
- [ ] "Search Results (0)" title shown

---

## TEST-S05: Search Input Preserves Value on Refresh

**Description**: Search input is populated from URL on page load

**Steps**:
1. Navigate directly to `http://localhost:3001/?q=mental`
2. Check the search input value

**Expected Results**:
- [ ] Search input contains "mental"
- [ ] Results are filtered to match "mental"
- [ ] URL remains `/?q=mental`

---

## TEST-S06: Search Debounce Behavior

**Description**: Search doesn't fire on every keystroke

**Steps**:
1. Navigate to `http://localhost:3001/`
2. Type "test" quickly (within 300ms)
3. Observe network requests

**Expected Results**:
- [ ] Only ONE search request is made after typing stops
- [ ] URL updates only once after 300ms delay
- [ ] No flickering of results during typing
