# Phase 15: Full-text Search - Research

**Researched:** 2026-01-14
**Domain:** Postgres Full-Text Search with Drizzle ORM + Next.js
**Confidence:** HIGH

<research_summary>
## Summary

Researched PostgreSQL full-text search (FTS) implementation with Drizzle ORM for the mental webapp. Postgres FTS is the right choice - it's built-in, well-supported by Drizzle, and perfect for our scale (thousands of items, not millions).

The standard approach uses:
1. Generated `tsvector` column combining title (weight A) + content (weight B)
2. GIN index on the tsvector column for fast lookups
3. `plainto_tsquery` for user input (handles plain text automatically)
4. `ts_rank` for relevance ordering
5. Debounced URL-synced search in Next.js frontend

**Primary recommendation:** Use Drizzle's generated column pattern with weighted tsvector. Add GIN index with `fastupdate=off` for read-heavy workload. 300ms debounce on frontend with URL sync for bookmarkable searches.
</research_summary>

<standard_stack>
## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| drizzle-orm | current | ORM with FTS support | Already in stack, has documented FTS patterns |
| Postgres FTS | built-in | Full-text search engine | Native, no external deps, good for our scale |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| use-debounce | 10.x | Debounce search input | Recommended by Next.js docs |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Postgres FTS | Elasticsearch | Overkill for <100k docs, adds complexity |
| Postgres FTS | Algolia | External service, cost, good for very large scale |
| Postgres FTS | pg_search (ParadeDB) | BM25 ranking, but adds dependency |
| use-debounce | Custom hook | Library is well-tested, no need to reinvent |

**Installation:**
```bash
pnpm add use-debounce
```
</standard_stack>

<architecture_patterns>
## Architecture Patterns

### Recommended Approach: Generated tsvector Column

Use a generated column that automatically maintains the search vector:

```typescript
// Source: Drizzle ORM docs - full-text search with generated columns
import { SQL, sql } from 'drizzle-orm';
import { index, pgTable, text, customType } from 'drizzle-orm/pg-core';

export const tsvector = customType<{ data: string }>({
  dataType() {
    return `tsvector`;
  },
});

export const mentalItems = pgTable(
  'mental_items',
  {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    content: text('content').notNull(),
    // ... other columns

    // Generated search column - auto-maintained!
    search: tsvector('search')
      .generatedAlwaysAs(
        (): SQL =>
          sql`setweight(to_tsvector('english', ${mentalItems.title}), 'A') ||
              setweight(to_tsvector('english', ${mentalItems.content}), 'B')`,
      ),
  },
  (t) => [
    // GIN index for fast lookups
    index('idx_mental_items_search').using('gin', t.search),
  ],
);
```

### Pattern: Search Query with Ranking

```typescript
// Source: Drizzle ORM docs
import { desc, sql } from 'drizzle-orm';

async function searchItems(query: string) {
  const searchQuery = sql`plainto_tsquery('english', ${query})`;

  return db
    .select({
      ...getTableColumns(mentalItems),
      rank: sql<number>`ts_rank(${mentalItems.search}, ${searchQuery})`,
    })
    .from(mentalItems)
    .where(sql`${mentalItems.search} @@ ${searchQuery}`)
    .orderBy((t) => desc(t.rank));
}
```

### Pattern: URL-Synced Debounced Search (Next.js)

```typescript
// Source: Next.js docs + community patterns
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';

export function SearchInput() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set('q', term);
    } else {
      params.delete('q');
    }
    router.push(`/?${params.toString()}`);
  }, 300);

  return (
    <input
      type="text"
      defaultValue={searchParams.get('q') ?? ''}
      onChange={(e) => handleSearch(e.target.value)}
      placeholder="Search thoughts..."
    />
  );
}
```

### Anti-Patterns to Avoid
- **LIKE '%query%' for search:** Can't use indexes effectively, slow on large text
- **Searching without debounce:** Hammers API on every keystroke
- **Not using URL params:** Loses searchability, bookmarkability
- **Manual tsvector column:** Use generated column instead - auto-maintained
</architecture_patterns>

<dont_hand_roll>
## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Text search | LIKE/ILIKE queries | Postgres FTS | FTS is 10-50x faster with indexes, handles stemming |
| Relevance ranking | Custom scoring | ts_rank | Built-in, handles weighted fields |
| Input sanitization | Manual escaping | plainto_tsquery | Safely converts user input to tsquery |
| Debouncing | setTimeout + clearTimeout | use-debounce library | Well-tested, handles edge cases |
| Search vector maintenance | Triggers | Generated columns | Auto-maintained, no sync bugs |

**Key insight:** Postgres FTS is mature and battle-tested. The Drizzle docs have complete patterns. Don't reinvent - follow the documented approach.
</dont_hand_roll>

<common_pitfalls>
## Common Pitfalls

### Pitfall 1: Slow Search Due to Missing Index
**What goes wrong:** Search queries scan entire table, taking seconds
**Why it happens:** No GIN index on tsvector column
**How to avoid:** Always create GIN index: `index('idx_search').using('gin', t.search)`
**Warning signs:** Search slows as data grows, EXPLAIN shows Seq Scan

### Pitfall 2: GIN Index Slow Reads with Default Settings
**What goes wrong:** Reads slower than expected despite index
**Why it happens:** Default `fastupdate=on` keeps pending list that slows queries
**How to avoid:** For read-heavy workloads, use `WITH (fastupdate = off)`
**Warning signs:** ~50x slower than optimal (41s vs 877ms in benchmarks)

### Pitfall 3: No Results for Common Words
**What goes wrong:** Searching "the" or "is" returns nothing
**Why it happens:** Stop words are filtered by FTS (intentional)
**How to avoid:** This is expected behavior - document for users
**Warning signs:** Users report "search doesn't work" for simple words

### Pitfall 4: Search Hammering API
**What goes wrong:** Every keystroke triggers API call
**Why it happens:** Missing debounce on search input
**How to avoid:** Use 300ms debounce (use-debounce library)
**Warning signs:** Network tab shows many rapid requests while typing

### Pitfall 5: Lost Search State on Refresh
**What goes wrong:** User's search disappears on page refresh
**Why it happens:** Search stored only in React state, not URL
**How to avoid:** Sync search to URL params with router.push
**Warning signs:** Search input empty after refresh despite filtering
</common_pitfalls>

<code_examples>
## Code Examples

### Schema with Generated Search Column
```typescript
// Source: Drizzle ORM docs
export const tsvector = customType<{ data: string }>({
  dataType() {
    return `tsvector`;
  },
});

export const mentalItems = pgTable(
  'mental_items',
  {
    // ... existing columns
    search: tsvector('search')
      .generatedAlwaysAs(
        (): SQL =>
          sql`setweight(to_tsvector('english', ${mentalItems.title}), 'A') ||
              setweight(to_tsvector('english', ${mentalItems.content}), 'B')`,
      ),
  },
  (t) => [
    index('idx_mental_items_search').using('gin', t.search),
  ],
);
```

### API Search Endpoint
```typescript
// Source: Drizzle ORM docs patterns
app.get('/search', async (c) => {
  const q = c.req.query('q');
  if (!q) {
    return c.json([]);
  }

  const searchQuery = sql`plainto_tsquery('english', ${q})`;

  const results = await db
    .select()
    .from(mentalItems)
    .where(sql`${mentalItems.search} @@ ${searchQuery}`)
    .orderBy(sql`ts_rank(${mentalItems.search}, ${searchQuery}) DESC`)
    .limit(50);

  return c.json(results);
});
```

### Debounced Search Component
```typescript
// Source: Next.js docs
'use client';
import { useDebouncedCallback } from 'use-debounce';
import { useSearchParams, useRouter } from 'next/navigation';

export function SearchBar() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    term ? params.set('q', term) : params.delete('q');
    router.push(`/?${params.toString()}`);
  }, 300);

  return (
    <input
      defaultValue={searchParams.get('q') ?? ''}
      onChange={(e) => handleSearch(e.target.value)}
    />
  );
}
```
</code_examples>

<sota_updates>
## State of the Art (2025-2026)

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual tsvector column + trigger | Generated columns | Drizzle support added | Simpler, no sync bugs |
| Custom debounce hooks | use-debounce library | Established | Recommended by Next.js docs |
| Client-only search state | URL-synced search | Next.js App Router | Bookmarkable, shareable searches |

**New tools/patterns to consider:**
- **ParadeDB pg_search:** BM25 ranking (better than ts_rank), but adds dependency
- **nuqs library:** Native debounce support for URL query state

**Deprecated/outdated:**
- **LIKE queries for search:** Use FTS instead for any non-trivial text search
- **Manual tsvector maintenance:** Use generated columns
</sota_updates>

<open_questions>
## Open Questions

1. **Highlight matches in results?**
   - What we know: Postgres has `ts_headline()` for highlighting
   - What's unclear: Worth the complexity for MVP?
   - Recommendation: Skip for v1, add later if users want it

2. **Fuzzy matching / typo tolerance?**
   - What we know: Postgres FTS doesn't support fuzzy by default
   - What's unclear: How important is this for our use case?
   - Recommendation: Skip for v1 - exact word matching is fine for personal notes
</open_questions>

<sources>
## Sources

### Primary (HIGH confidence)
- [Drizzle ORM FTS docs](https://github.com/drizzle-team/drizzle-orm-docs) - Generated columns, GIN indexes, query patterns
- [PostgreSQL FTS docs](https://www.postgresql.org/docs/current/textsearch-indexes.html) - GIN index types
- [Next.js Search docs](https://nextjs.org/learn/dashboard-app/adding-search-and-pagination) - Debounce, URL sync

### Secondary (MEDIUM confidence)
- [pganalyze GIN Index guide](https://pganalyze.com/blog/gin-index) - fastupdate optimization
- [Neon FTS comparison](https://neon.com/blog/postgres-full-text-search-vs-elasticsearch) - FTS vs alternatives
- [VectorChord FTS optimization](https://blog.vectorchord.ai/postgresql-full-text-search-fast-when-done-right-debunking-the-slow-myth) - 50x speedup with fastupdate=off

### Tertiary (LOW confidence - needs validation)
- None - all findings verified with official sources
</sources>

<metadata>
## Metadata

**Research scope:**
- Core technology: Postgres Full-Text Search
- Ecosystem: Drizzle ORM, use-debounce, Next.js App Router
- Patterns: Generated tsvector, GIN indexes, debounced URL search
- Pitfalls: Missing indexes, fastupdate setting, no debounce

**Confidence breakdown:**
- Standard stack: HIGH - Drizzle has official FTS documentation
- Architecture: HIGH - Patterns from official Drizzle docs
- Pitfalls: HIGH - Documented in Postgres and community sources
- Code examples: HIGH - From Context7/official sources

**Research date:** 2026-01-14
**Valid until:** 2026-02-14 (30 days - stable technology)
</metadata>

---

*Phase: 15-full-text-search*
*Research completed: 2026-01-14*
*Ready for planning: yes*
