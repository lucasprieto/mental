# Mental

## What This Is

A personal "mind centralization" system for a Tech Lead who context-switches constantly. A webapp paired with an MCP server that captures thoughts from Claude Code/Cursor sessions — topics get logged automatically as you work, and resolved when you close the loop. Nothing falls through the cracks.

## Core Value

Frictionless capture — thoughts get logged without interrupting flow. If this doesn't feel seamless, nothing else matters.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] MCP server that integrates with Claude Code and Cursor
- [ ] Auto-extract themes/topics from prompts
- [ ] Explicit tagging support ("log this: ...")
- [ ] Session-aware resolution tracking (open → resolved with summary)
- [ ] Webapp dashboard showing open items, recently resolved, themes/tags
- [ ] Search and filter by keyword, tag, date, status
- [ ] Manual entry/editing directly in webapp

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
| MCP as primary capture mechanism | Capture where work happens, zero friction | — Pending |
| Session-aware resolution | Items have lifecycle, not just dumped | — Pending |
| Personal-only for v1 | Ship fast, validate core value before adding complexity | — Pending |

---
*Last updated: 2026-01-13 after initialization*
