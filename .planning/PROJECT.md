# Mental

## What This Is

A personal "mind centralization" system for a Tech Lead who context-switches constantly. A webapp paired with an MCP server that captures thoughts from Claude Code/Cursor sessions — topics get logged automatically as you work, and resolved when you close the loop. Nothing falls through the cracks.

## Core Value

Frictionless capture — thoughts get logged without interrupting flow. If this doesn't feel seamless, nothing else matters.

## Current State (v2.0)

Shipped v2.0 Cloud Sync with 3,783 lines of TypeScript.

**Tech stack:** pnpm monorepo, TypeScript, Neon Postgres + Drizzle ORM, Hono API, MCP SDK v1.x, Next.js 15, React 19, Tailwind CSS

**What's working:**
- MCP server with 8 tools for thought capture and lifecycle management
- Remote API backend (Hono + Neon Postgres) for multi-computer sync
- Sentiment-based theme detection (blocker/concern/question/idea)
- Auto-tagging based on sentiment
- Project context capture
- Webapp dashboard with filtering by status/tag/theme
- Manual entry and editing via webapp

## Requirements

### Validated

- ✓ MCP server that integrates with Claude Code and Cursor — v1.0
- ✓ Auto-extract themes/topics from prompts — v1.0
- ✓ Explicit tagging support — v1.0
- ✓ Session-aware resolution tracking (open → resolved with summary) — v1.0
- ✓ Webapp dashboard showing open items, recently resolved, themes/tags — v1.0
- ✓ Search and filter by keyword, tag, date, status — v1.0 (status/tag/theme filters)
- ✓ Manual entry/editing directly in webapp — v1.0
- ✓ Multi-computer sync via hosted backend — v2.0
- ✓ Sentiment-based theme detection (blocker/concern/question/idea) — v2.0
- ✓ Auto-tagging based on detected sentiment — v2.0
- ✓ Project context capture — v2.0

### Active

- [ ] LLM-driven theme selection (let calling LLM decide theme instead of string matching)

### Out of Scope

- Team features (sharing, collaboration, multiple users) — v1 is personal only
- AI summaries/insights (pattern analysis across thoughts) — capture first, analyze later
- Integrations beyond MCP (Slack, email, calendar) — MCP is the only integration point for now

## Context

User is a Tech Lead juggling many threads — tickets, reviews, decisions, conversations. Things get started but not always closed. The pain is losing track of what's open, what was resolved, and the context around each.

The MCP integration is strategic: capture happens where work happens (in the IDE), not in a separate app that adds friction.

## Constraints

- **None specified** — open to whatever tech stack works best

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| MCP as primary capture mechanism | Capture where work happens, zero friction | ✓ Good |
| Session-aware resolution | Items have lifecycle, not just dumped | ✓ Good |
| Personal-only for v1 | Ship fast, validate core value before adding complexity | ✓ Good |
| pnpm monorepo | Fast, good monorepo support | ✓ Good |
| SQLite + Drizzle ORM | Simple, local-first, type-safe | ✓ Good |
| @modelcontextprotocol/sdk v1.x | Stable SDK, not pre-alpha v2 | ✓ Good |
| console.error for MCP logging | Avoid corrupting stdio protocol | ✓ Good |
| cuid2 for IDs | URL-safe, shorter than UUID | ✓ Good |
| Next.js 15 + React 19 | Latest stable, good server components | ✓ Good |
| URL params for filtering | Shareable/bookmarkable filter states | ✓ Good |
| Hono + Neon Postgres for API | Type-safe RPC, serverless Postgres | ✓ Good |
| Dual schema pattern (SQLite + Postgres) | Local dev + hosted prod | ✓ Good |
| String-based sentiment detection | Quick implementation | ⚠️ Revisit (v3.0 LLM-driven) |
| Hono RPC client pattern | Type-safe API calls from MCP and webapp | ✓ Good |

---
*Last updated: 2026-01-14 after v2.0 milestone*
