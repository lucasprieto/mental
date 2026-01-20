# E2E Test Documentation

This folder contains manual end-to-end test specifications for the Mental webapp.

## Test Files

- [search-tests.md](./search-tests.md) - Search functionality tests
- [filter-tests.md](./filter-tests.md) - Filter functionality tests
- [combined-tests.md](./combined-tests.md) - Combined search + filter scenarios
- [url-persistence-tests.md](./url-persistence-tests.md) - URL state persistence tests

## Running Tests

Tests can be run manually using the `agent-browser` CLI tool or via Playwright.

### Using agent-browser

```bash
# Start servers
pnpm --filter @mental/api dev
pnpm --filter @mental/webapp dev

# Run browser automation
agent-browser open http://localhost:3001
agent-browser snapshot -i  # Get interactive elements
agent-browser fill @e6 "search term"  # Fill search
agent-browser click @e2  # Click filter
agent-browser get url  # Verify URL
```

### Prerequisites

- API server running on port 3000
- Webapp server running on port 3001
- Test data in database (at least items with different themes/statuses)

## Test Data Requirements

| Requirement | Description |
|-------------|-------------|
| Open items | At least 1 item with status "open" |
| Resolved items | At least 2 items with status "resolved" |
| idea theme | At least 1 item with theme "idea" |
| blocker theme | At least 1 item with theme "blocker" |
| Searchable content | Items with words like "test", "phase", "mental" in title/content |
