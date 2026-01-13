# Phase 2: MCP Server Core - Research

**Researched:** 2026-01-13
**Domain:** Model Context Protocol (MCP) server with TypeScript SDK
**Confidence:** HIGH

<research_summary>
## Summary

Researched the MCP ecosystem for building a local server that Claude Code and Cursor can discover and connect to. The standard approach uses the official `@modelcontextprotocol/sdk` package with stdio transport for local communication.

Key finding: Use the v1.x SDK branch for production (v2 is pre-alpha, stable Q1 2026). The stdio transport is the correct choice for local MCP servers - it communicates via stdin/stdout with the host application. Critical: never write to stdout except protocol messages, or the connection breaks.

**Primary recommendation:** Use `@modelcontextprotocol/sdk` v1.x with `StdioServerTransport`. Define tools using `server.tool()` with Zod schemas. Configure discovery via `.mcp.json` (Claude Code) or `.cursor/mcp.json` (Cursor).
</research_summary>

<standard_stack>
## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @modelcontextprotocol/sdk | ^1.x | MCP server/client SDK | Official Anthropic SDK, full protocol support |
| zod | ^3.25 | Schema validation | Required peer dep, provides runtime validation + type inference |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @modelcontextprotocol/inspector | latest | Debug/test MCP servers | Development and testing |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Official SDK | mcp-framework | Third-party, less battle-tested |
| stdio transport | Streamable HTTP | HTTP is for remote servers, stdio is simpler for local |
| zod | JSON schema | Zod provides better TypeScript integration |

**Installation:**
```bash
pnpm add @modelcontextprotocol/sdk zod
```

**Dev dependency:**
```bash
pnpm add -D @modelcontextprotocol/inspector
```
</standard_stack>

<architecture_patterns>
## Architecture Patterns

### Recommended Project Structure
```
packages/mcp-server/
├── src/
│   ├── index.ts        # Entry point, transport setup
│   ├── server.ts       # McpServer configuration
│   └── tools/          # Tool definitions
│       ├── index.ts    # Tool registration
│       └── capture.ts  # Individual tool implementations
├── package.json
└── tsconfig.json
```

### Pattern 1: Basic Server Setup
**What:** Create McpServer instance and connect to stdio transport
**When to use:** Every MCP server entry point
**Example:**
```typescript
// Source: @modelcontextprotocol/sdk docs
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new McpServer({
  name: "mental-mcp",
  version: "1.0.0"
});

// Register tools here...

const transport = new StdioServerTransport();
await server.connect(transport);
```

### Pattern 2: Tool Definition with Zod
**What:** Define tools with typed parameters using Zod schemas
**When to use:** Every tool definition
**Example:**
```typescript
// Source: @modelcontextprotocol/sdk docs
import { z } from "zod";

server.tool(
  "capture_thought",
  "Capture a mental item with optional tags",
  {
    title: z.string().describe("Brief title for the thought"),
    content: z.string().describe("Full content or context"),
    tags: z.array(z.string()).optional().describe("Optional tags")
  },
  async ({ title, content, tags }) => {
    // Implementation
    return {
      content: [{ type: "text", text: `Captured: ${title}` }]
    };
  }
);
```

### Pattern 3: Logging to stderr
**What:** All logging MUST go to stderr, never stdout
**When to use:** Any debug/info logging
**Example:**
```typescript
// CORRECT - logs to stderr
console.error("[mental-mcp] Tool called:", toolName);

// WRONG - corrupts stdio protocol!
// console.log("Tool called");
```

### Anti-Patterns to Avoid
- **console.log to stdout:** Corrupts the stdio JSON-RPC stream, breaks connection
- **Similar tool names/purposes:** LLM gets confused, calls wrong tool
- **Returning huge payloads:** Hits token limits, confuses model
- **Global state for user data:** Tools are called concurrently by different users
</architecture_patterns>

<dont_hand_roll>
## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| JSON-RPC protocol | Custom message parsing | @modelcontextprotocol/sdk | Protocol has many edge cases, versioning |
| Transport layer | Custom stdin/stdout handling | StdioServerTransport | Handles buffering, encoding, errors |
| Schema validation | Manual arg checking | Zod schemas in server.tool() | Type safety, auto-documentation |
| Tool discovery | Custom capability negotiation | SDK handles automatically | Protocol-compliant negotiation |

**Key insight:** MCP is a standardized protocol. The SDK handles all the protocol complexity - message framing, capability negotiation, error formats. Fighting this leads to incompatibility with clients.
</dont_hand_roll>

<common_pitfalls>
## Common Pitfalls

### Pitfall 1: stdout Pollution (Error -32000)
**What goes wrong:** Server writes to stdout, connection dies with "Connection closed"
**Why it happens:** console.log, print statements, or stray debug output
**How to avoid:** Use console.error() for all logging; lint for console.log
**Warning signs:** "MCP error -32000: Connection closed" immediately or intermittently

### Pitfall 2: Similar Tools Confuse LLM
**What goes wrong:** LLM calls the wrong tool repeatedly
**Why it happens:** Tools with overlapping names or descriptions
**How to avoid:** Make each tool clearly distinct; use descriptive names
**Warning signs:** Model calls tool A when you expected tool B

### Pitfall 3: Relative Paths in Configuration
**What goes wrong:** Server not found when launched from different directory
**Why it happens:** Working directory for MCP servers is often undefined (e.g., `/` on macOS)
**How to avoid:** Always use absolute paths in .mcp.json and server code
**Warning signs:** "ENOENT" errors, server fails to start from Claude Code/Cursor

### Pitfall 4: Version Mismatch
**What goes wrong:** Connection fails or protocol errors
**Why it happens:** Client expects different protocol version than server provides
**How to avoid:** Use v1.x SDK (stable); check client compatibility
**Warning signs:** Parsing errors, "unexpected message" errors

### Pitfall 5: Excessive Response Data
**What goes wrong:** Model truncates or misinterprets response
**Why it happens:** Returning thousands of items in one response
**How to avoid:** Paginate results, summarize, or provide drill-down tools
**Warning signs:** Incomplete or wrong model responses
</common_pitfalls>

<code_examples>
## Code Examples

Verified patterns from official sources:

### Complete Server Entry Point
```typescript
// Source: @modelcontextprotocol/sdk GitHub + verified patterns
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
  name: "mental-mcp",
  version: "1.0.0"
});

// Tool with full Zod schema
server.tool(
  "capture_thought",
  "Capture a thought or topic to your mental database",
  {
    title: z.string().describe("Brief title"),
    content: z.string().describe("Full content"),
    tags: z.array(z.string()).optional().describe("Tags for categorization")
  },
  async ({ title, content, tags }) => {
    // Logging goes to stderr
    console.error(`[mental-mcp] Capturing: ${title}`);

    // Your database logic here

    return {
      content: [{
        type: "text",
        text: `Captured thought: "${title}"`
      }]
    };
  }
);

// Connect to stdio transport
const transport = new StdioServerTransport();
await server.connect(transport);
```

### Claude Code Configuration (.mcp.json)
```json
{
  "mcpServers": {
    "mental": {
      "command": "node",
      "args": ["/absolute/path/to/packages/mcp-server/dist/index.js"],
      "env": {}
    }
  }
}
```

### Cursor Configuration (.cursor/mcp.json)
```json
{
  "mcpServers": {
    "mental": {
      "command": "node",
      "args": ["/absolute/path/to/packages/mcp-server/dist/index.js"]
    }
  }
}
```

### Testing with MCP Inspector
```bash
# Test server in isolation before connecting to Claude Code/Cursor
npx @modelcontextprotocol/inspector node /path/to/dist/index.js
# Opens web UI at http://localhost:5173
```
</code_examples>

<sota_updates>
## State of the Art (2025-2026)

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| SSE transport | Streamable HTTP or stdio | MCP spec 2025-03-26 | SSE deprecated, don't use for new servers |
| SDK v1.x | SDK v2 (pre-alpha) | Q1 2026 expected | Stick with v1.x until v2 stable |
| Manual JSON-RPC | Official SDK | Always | Never hand-roll protocol |

**New tools/patterns to consider:**
- **MCP Inspector:** Official debugging tool, essential for development
- **Managed MCP (managed-mcp.json):** Enterprise feature for locked-down configs

**Deprecated/outdated:**
- **SSE transport:** Use stdio for local, Streamable HTTP for remote
- **@modelcontextprotocol/server-github:** Deprecated April 2025, use Docker image instead
</sota_updates>

<open_questions>
## Open Questions

None - all critical questions resolved. The path forward is clear:
1. Use official SDK v1.x with stdio transport
2. Define tools with Zod schemas
3. Configure via .mcp.json for Claude Code
4. Test with MCP Inspector before client integration
</open_questions>

<sources>
## Sources

### Primary (HIGH confidence)
- [GitHub - modelcontextprotocol/typescript-sdk](https://github.com/modelcontextprotocol/typescript-sdk) - Official SDK repository
- [@modelcontextprotocol/sdk - npm](https://www.npmjs.com/package/@modelcontextprotocol/sdk) - Package documentation
- [MCP Specification](https://modelcontextprotocol.io/specification/2025-11-25) - Protocol spec

### Secondary (MEDIUM confidence)
- [How to build MCP servers with TypeScript SDK - DEV](https://dev.to/shadid12/how-to-build-mcp-servers-with-typescript-sdk-1c28) - Verified against SDK docs
- [MCP Tips, Tricks and Pitfalls - Nearform](https://nearform.com/digital-community/implementing-model-context-protocol-mcp-tips-tricks-and-pitfalls/) - Practical implementation guidance
- [Cursor MCP Docs](https://cursor.com/docs/context/mcp) - Cursor configuration reference
- [MCP Troubleshooting Guide](https://www.mcpstack.org/learn/mcp-server-troubleshooting-guide-2025) - Common errors and fixes

### Tertiary (verified via multiple sources)
- [Adding Custom Tools to MCP Servers](https://mcpcat.io/guides/adding-custom-tools-mcp-server-typescript/) - Tool definition patterns
</sources>

<metadata>
## Metadata

**Research scope:**
- Core technology: @modelcontextprotocol/sdk, MCP protocol
- Ecosystem: Zod, MCP Inspector
- Patterns: Server setup, tool definition, stdio transport
- Pitfalls: stdout pollution, path issues, version mismatches

**Confidence breakdown:**
- Standard stack: HIGH - official SDK, well-documented
- Architecture: HIGH - patterns from official docs and examples
- Pitfalls: HIGH - documented in multiple sources, common issues
- Code examples: HIGH - verified against SDK documentation

**Research date:** 2026-01-13
**Valid until:** 2026-02-13 (30 days - MCP ecosystem is stable but evolving)
</metadata>

---

*Phase: 02-mcp-server-core*
*Research completed: 2026-01-13*
*Ready for planning: yes*
