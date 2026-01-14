# Phase 11: Advanced Capture - Context

## User Vision

**Goal:** All three improvements together - smarter theme extraction, context awareness, and smart tagging.

## Requirements Gathered

### Theme Extraction
- Focus on **sentiment/urgency detection**
- Auto-detect: blockers, concerns, ideas, questions
- Apply as themes automatically based on content analysis

### Context Awareness
- Capture **project/repo name** with each thought
- Include **session metadata** (time of day, duration, related thoughts)
- NOT capturing file paths (not needed)

### Smart Tagging
- **Auto-apply common tags** based on content
- Tags like 'bug', 'idea', 'question', 'blocker' applied automatically
- No manual suggestion system needed

## Technical Implications

### Database Changes
- Add `project` field to items table (nullable, for repo/project context)
- Session metadata already exists via `sessionId` relationship

### MCP Server Changes
- Enhance `capture_thought` tool to:
  - Accept optional `project` parameter
  - Auto-detect sentiment/urgency from content
  - Auto-apply appropriate tags

### Theme Detection Patterns
Sentiment/urgency patterns to detect:
- **blocker**: "blocked", "can't proceed", "waiting on", "dependency"
- **concern**: "worried", "risk", "might break", "unsure"
- **idea**: "could", "maybe", "what if", "might be better"
- **question**: "?", "how do", "why does", "not sure if"

### Auto-Tag Patterns
Map detected sentiment to tags:
- blocker → `blocker`, `urgent`
- concern → `concern`, `risk`
- idea → `idea`, `enhancement`
- question → `question`, `clarification`

## Scope

### In Scope
- Sentiment/urgency theme detection
- Project context capture
- Session metadata enhancement
- Auto-tagging based on content

### Out of Scope
- Technical topic detection (React, TypeScript, etc.)
- Task type detection (bug fix, feature, refactor)
- File path context
- Tag suggestion from history

## Dependencies

- Phase 9 complete (MCP Server uses remote API)
- Phase 10 complete (Webapp uses remote API)

## Current Implementation Analysis

### Theme Extraction (index.ts:14-38)
Current `extractTheme()` function uses basic pattern matching:
- Looks for "about X", "regarding X", "for X project"
- Falls back to first significant word (skips stop words)
- No sentiment/urgency detection

### Capture Tool (index.ts:59-105)
Current parameters:
- `title` (required)
- `content` (required)
- `tags` (optional array)

Missing:
- `project` parameter for repo context
- No auto-tagging logic
- No sentiment detection

### Database Schema (schema.ts)
Current fields:
- id, title, content, tags, theme, status, resolution, sessionId, createdAt, updatedAt, resolvedAt

Missing:
- `project` field for repo/project context

## Proposed Plan Structure

**Plan 11-01: Enhanced Theme Extraction**
- Add sentiment/urgency detection patterns
- Detect: blocker, concern, idea, question
- Update extractTheme() to detect multiple themes

**Plan 11-02: Context and Auto-Tagging**
- Add `project` field to schema and API
- Add auto-tag logic based on detected sentiment
- Update capture_thought tool with project param
