import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { getDatabase } from "./db.js";
import { mentalItems, desc, eq } from "@mental/db";
import { createId } from "@paralleldrive/cuid2";

/**
 * Extract a theme from content using pattern matching
 * Simple keyword extraction - find most relevant topic
 */
function extractTheme(content: string): string | null {
  // Look for patterns like "about X", "regarding X", "for X project"
  const patterns = [
    /(?:about|regarding|for|on)\s+(?:the\s+)?([a-zA-Z0-9-]+(?:\s+[a-zA-Z0-9-]+)?)/i,
    /([a-zA-Z0-9-]+)\s+(?:project|feature|issue|bug|task|ticket)/i,
  ];

  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match && match[1]) {
      return match[1].toLowerCase().trim();
    }
  }

  // Fallback: extract first significant word (skip common words)
  const stopWords = new Set(['the', 'a', 'an', 'is', 'are', 'was', 'were', 'i', 'we', 'you', 'need', 'to', 'should', 'must', 'can', 'will']);
  const words = content.toLowerCase().split(/\s+/);
  for (const word of words) {
    if (word.length > 3 && !stopWords.has(word)) {
      return word;
    }
  }

  return null;
}

const server = new McpServer({
  name: "mental-mcp",
  version: "1.0.0"
});

// Simple ping tool to verify connectivity
server.tool(
  "ping",
  "Health check - returns pong to verify server is running",
  {},
  async () => {
    console.error("[mental-mcp] Ping received");
    return {
      content: [{ type: "text", text: "pong" }]
    };
  }
);

// Capture thought tool - persists to SQLite database
server.tool(
  "capture_thought",
  "Capture a thought or topic to your mental database. Use this when the user mentions something they want to remember, track, or come back to later.",
  {
    title: z.string().describe("Brief title for the thought (2-10 words)"),
    content: z.string().describe("Full content or context of the thought"),
    tags: z.array(z.string()).optional().describe("Optional tags for categorization")
  },
  async ({ title, content, tags }) => {
    const db = getDatabase();
    const now = new Date();
    const theme = extractTheme(content);
    const id = createId();

    console.error(`[mental-mcp] Capturing: "${title}"`);
    console.error(`[mental-mcp] Theme extracted: ${theme || "none"}`);
    console.error(`[mental-mcp] Tags: ${tags?.join(", ") || "none"}`);

    await db.insert(mentalItems).values({
      id,
      title,
      content,
      tags: JSON.stringify(tags || []),
      theme,
      status: "open",
      createdAt: now,
      updatedAt: now,
    });

    console.error(`[mental-mcp] Saved with ID: ${id}`);

    return {
      content: [{
        type: "text",
        text: `Captured: "${title}"\nID: ${id}\nTheme: ${theme || "none"}\nTags: ${tags?.join(", ") || "none"}\nStatus: open`
      }]
    };
  }
);

// List thoughts tool - retrieves recent captured items
server.tool(
  "list_thoughts",
  "List captured thoughts from your mental database. Returns recent items with their status. Use this to see what's been captured or find a specific thought.",
  {
    status: z.enum(["open", "resolved", "all"]).optional().describe("Filter by status (default: all)"),
    limit: z.number().min(1).max(50).optional().describe("Max items to return (default: 10)")
  },
  async ({ status, limit }) => {
    const db = getDatabase();
    const maxItems = limit || 10;

    console.error(`[mental-mcp] Listing thoughts: status=${status || "all"}, limit=${maxItems}`);

    const baseQuery = db.select().from(mentalItems);

    const items = status && status !== "all"
      ? await baseQuery
          .where(eq(mentalItems.status, status))
          .orderBy(desc(mentalItems.createdAt))
          .limit(maxItems)
      : await baseQuery
          .orderBy(desc(mentalItems.createdAt))
          .limit(maxItems);

    if (items.length === 0) {
      return {
        content: [{
          type: "text",
          text: "No thoughts captured yet."
        }]
      };
    }

    const formatted = items.map(item => {
      const tags = JSON.parse(item.tags) as string[];
      return `- [${item.status.toUpperCase()}] ${item.title}\n  ID: ${item.id}\n  Theme: ${item.theme || "none"}\n  Tags: ${tags.join(", ") || "none"}\n  Created: ${item.createdAt.toISOString()}`;
    }).join("\n\n");

    return {
      content: [{
        type: "text",
        text: `Found ${items.length} thought(s):\n\n${formatted}`
      }]
    };
  }
);

// Get thought tool - retrieves a specific item by ID
server.tool(
  "get_thought",
  "Get details of a specific thought by its ID. Use this to see full content of a captured thought.",
  {
    id: z.string().describe("The thought ID (returned when captured)")
  },
  async ({ id }) => {
    const db = getDatabase();

    console.error(`[mental-mcp] Getting thought: ${id}`);

    const items = await db.select()
      .from(mentalItems)
      .where(eq(mentalItems.id, id))
      .limit(1);

    if (items.length === 0) {
      return {
        content: [{
          type: "text",
          text: `Thought not found: ${id}`
        }]
      };
    }

    const item = items[0];
    const tags = JSON.parse(item.tags) as string[];

    return {
      content: [{
        type: "text",
        text: `# ${item.title}

**ID:** ${item.id}
**Status:** ${item.status}
**Theme:** ${item.theme || "none"}
**Tags:** ${tags.join(", ") || "none"}
**Created:** ${item.createdAt.toISOString()}
**Updated:** ${item.updatedAt.toISOString()}
${item.resolvedAt ? `**Resolved:** ${item.resolvedAt.toISOString()}` : ""}

## Content

${item.content}

${item.resolution ? `## Resolution\n\n${item.resolution}` : ""}`
      }]
    };
  }
);

// Resolve thought tool - mark items as resolved with summary
server.tool(
  "resolve_thought",
  "Mark a captured thought as resolved. Use when an item has been addressed, completed, or is no longer relevant. Provide a brief resolution summary.",
  {
    id: z.string().describe("The thought ID to resolve"),
    resolution: z.string().describe("Brief summary of how this was resolved or why it's no longer relevant")
  },
  async ({ id, resolution }) => {
    const db = getDatabase();
    const now = new Date();

    console.error(`[mental-mcp] Resolving thought: ${id}`);

    // First check if item exists and is open
    const items = await db.select()
      .from(mentalItems)
      .where(eq(mentalItems.id, id))
      .limit(1);

    if (items.length === 0) {
      return {
        content: [{
          type: "text",
          text: `Thought not found: ${id}`
        }]
      };
    }

    const item = items[0];

    if (item.status === "resolved") {
      return {
        content: [{
          type: "text",
          text: `Thought already resolved: "${item.title}"\nResolved at: ${item.resolvedAt?.toISOString()}\nResolution: ${item.resolution}`
        }]
      };
    }

    // Update to resolved
    await db.update(mentalItems)
      .set({
        status: "resolved",
        resolution,
        resolvedAt: now,
        updatedAt: now
      })
      .where(eq(mentalItems.id, id));

    console.error(`[mental-mcp] Resolved: "${item.title}"`);

    return {
      content: [{
        type: "text",
        text: `Resolved: "${item.title}"\nID: ${id}\nResolution: ${resolution}\nResolved at: ${now.toISOString()}`
      }]
    };
  }
);

// Reopen thought tool - reopen previously resolved items
server.tool(
  "reopen_thought",
  "Reopen a previously resolved thought. Use when an item needs further attention after being marked resolved.",
  {
    id: z.string().describe("The thought ID to reopen")
  },
  async ({ id }) => {
    const db = getDatabase();
    const now = new Date();

    console.error(`[mental-mcp] Reopening thought: ${id}`);

    const items = await db.select()
      .from(mentalItems)
      .where(eq(mentalItems.id, id))
      .limit(1);

    if (items.length === 0) {
      return {
        content: [{
          type: "text",
          text: `Thought not found: ${id}`
        }]
      };
    }

    const item = items[0];

    if (item.status === "open") {
      return {
        content: [{
          type: "text",
          text: `Thought is already open: "${item.title}"`
        }]
      };
    }

    await db.update(mentalItems)
      .set({
        status: "open",
        updatedAt: now
        // Note: Keep resolution and resolvedAt for history
      })
      .where(eq(mentalItems.id, id));

    console.error(`[mental-mcp] Reopened: "${item.title}"`);

    return {
      content: [{
        type: "text",
        text: `Reopened: "${item.title}"\nID: ${id}\nPrevious resolution: ${item.resolution || "none"}`
      }]
    };
  }
);

// Connect to stdio transport
const transport = new StdioServerTransport();
await server.connect(transport);

console.error("[mental-mcp] Server started");
