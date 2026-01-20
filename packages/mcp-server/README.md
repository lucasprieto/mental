# @go-mental/mcp

MCP (Model Context Protocol) server for the Mental thought capture system. Capture thoughts, ideas, blockers, and questions directly from Claude Code or Cursor without leaving your workflow.

## What is Mental?

Mental is a personal "mind centralization" system for developers who context-switch constantly. It captures thoughts as you work, tracks their status (open/resolved), and helps you close the loop on ideas, blockers, and questions.

## Installation

```bash
# Run directly with npx (recommended)
npx @go-mental/mcp

# Or install globally
npm install -g @go-mental/mcp
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MENTAL_API_URL` | URL of your Mental API server | `http://localhost:3000` |

### Claude Code (claude_desktop_config.json)

Add to your Claude Code configuration:

```json
{
  "mcpServers": {
    "mental": {
      "command": "npx",
      "args": ["@go-mental/mcp"],
      "env": {
        "MENTAL_API_URL": "https://your-mental-api.example.com"
      }
    }
  }
}
```

### Cursor

Add to your Cursor MCP settings:

```json
{
  "mcpServers": {
    "mental": {
      "command": "npx",
      "args": ["@go-mental/mcp"],
      "env": {
        "MENTAL_API_URL": "https://your-mental-api.example.com"
      }
    }
  }
}
```

## Available Tools

| Tool | Description |
|------|-------------|
| `ping` | Health check - returns pong to verify server is running |
| `capture_thought` | Capture a thought with title, content, optional project and theme |
| `list_thoughts` | List captured thoughts, optionally filtered by status |
| `get_thought` | Get details of a specific thought by ID |
| `resolve_thought` | Mark a thought as resolved with a resolution summary |
| `reopen_thought` | Reopen a previously resolved thought |
| `add_followup` | Add a follow-up update to an existing thought |
| `start_session` | Start a capture session to group related thoughts |
| `end_session` | End the current session and see summary |

### Themes

When capturing thoughts, you can specify a theme:
- `blocker` - Blocked, waiting on dependencies
- `concern` - Worried, risk, uncertain
- `question` - Asking how/why, unclear
- `idea` - Suggestion, alternative, maybe

## Example Usage

Once configured, you can ask Claude to:

- "Capture a thought: I need to refactor the auth module"
- "List my open thoughts"
- "Mark thought abc123 as resolved - decided to use JWT"
- "Start a session for the payments feature"

## Links

- [Mental Repository](https://github.com/lucasprieto/mental)
- [Model Context Protocol](https://modelcontextprotocol.io/)

## License

MIT
