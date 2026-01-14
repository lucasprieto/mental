import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { getItemsClient, getSessionsClient } from "./api.js";

// Session tracking (in-memory for this process, synced with API)
let currentSessionId: string | null = null;
let sessionStartTime: Date | null = null;

/**
 * Detect sentiment/urgency from content
 * Priority order: blocker > concern > question > idea
 */
function detectSentiment(content: string): "blocker" | "concern" | "idea" | "question" | null {
  const lowerContent = content.toLowerCase();

  // Blocker patterns (highest priority)
  const blockerPatterns = ["blocked", "can't proceed", "cannot proceed", "waiting on", "waiting for", "dependency", "depends on", "stuck"];
  for (const pattern of blockerPatterns) {
    if (lowerContent.includes(pattern)) {
      return "blocker";
    }
  }

  // Concern patterns
  const concernPatterns = ["worried", "risk", "might break", "unsure", "uncertain", "problem", "issue"];
  for (const pattern of concernPatterns) {
    if (lowerContent.includes(pattern)) {
      return "concern";
    }
  }

  // Question patterns (check for ? anywhere, or specific phrases)
  if (content.includes("?")) {
    return "question";
  }
  const questionPatterns = ["how do", "why does", "not sure if", "wondering", "unclear"];
  for (const pattern of questionPatterns) {
    if (lowerContent.includes(pattern)) {
      return "question";
    }
  }

  // Idea patterns (lowest priority)
  const ideaPatterns = ["could", "maybe", "what if", "might be better", "suggestion", "consider", "alternative"];
  for (const pattern of ideaPatterns) {
    if (lowerContent.includes(pattern)) {
      return "idea";
    }
  }

  return null;
}

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

// Capture thought tool - persists via API
server.tool(
  "capture_thought",
  "Capture a thought or topic to your mental database. Use this when the user mentions something they want to remember, track, or come back to later.",
  {
    title: z.string().describe("Brief title for the thought (2-10 words)"),
    content: z.string().describe("Full content or context of the thought"),
    tags: z.array(z.string()).optional().describe("Optional tags for categorization")
  },
  async ({ title, content, tags }) => {
    // Detect sentiment first (higher priority than topic extraction)
    const sentiment = detectSentiment(content);
    const topicTheme = extractTheme(content);
    // Use sentiment as theme if detected, otherwise fall back to topic
    const theme = sentiment || topicTheme;

    console.error(`[mental-mcp] Capturing: "${title}"`);
    if (sentiment) {
      console.error(`[mental-mcp] Sentiment detected: ${sentiment}`);
    }
    console.error(`[mental-mcp] Theme: ${theme || "none"}${sentiment ? " (sentiment)" : ""}`);
    console.error(`[mental-mcp] Tags: ${tags?.join(", ") || "none"}`);
    if (currentSessionId) {
      console.error(`[mental-mcp] Session: ${currentSessionId}`);
    }

    const client = getItemsClient();
    const res = await client.index.$post({
      json: {
        title,
        content,
        tags: tags || [],
        theme: theme ?? undefined,
        sessionId: currentSessionId ?? undefined,
      }
    });

    if (!res.ok) {
      console.error(`[mental-mcp] API error: ${res.status}`);
      return {
        content: [{ type: "text", text: `Error capturing thought: ${res.status}` }]
      };
    }

    const item = await res.json();
    console.error(`[mental-mcp] Saved with ID: ${item.id}`);

    return {
      content: [{
        type: "text",
        text: `Captured: "${title}"\nID: ${item.id}\nTheme: ${theme || "none"}${sentiment ? " (sentiment)" : ""}\nTags: ${tags?.join(", ") || "none"}\nStatus: open${currentSessionId ? `\nSession: ${currentSessionId}` : ""}`
      }]
    };
  }
);

// List thoughts tool - retrieves recent captured items via API
server.tool(
  "list_thoughts",
  "List captured thoughts from your mental database. Returns recent items with their status. Use this to see what's been captured or find a specific thought.",
  {
    status: z.enum(["open", "resolved", "all"]).optional().describe("Filter by status (default: all)"),
    limit: z.number().min(1).max(50).optional().describe("Max items to return (default: 10)")
  },
  async ({ status, limit }) => {
    const maxItems = limit || 10;

    console.error(`[mental-mcp] Listing thoughts: status=${status || "all"}, limit=${maxItems}`);

    const client = getItemsClient();
    const res = await client.index.$get({
      query: { status: status || "all", limit: String(maxItems) }
    });

    if (!res.ok) {
      console.error(`[mental-mcp] API error: ${res.status}`);
      return {
        content: [{ type: "text", text: `Error listing thoughts: ${res.status}` }]
      };
    }

    const itemList = await res.json();

    if (itemList.length === 0) {
      return {
        content: [{
          type: "text",
          text: "No thoughts captured yet."
        }]
      };
    }

    const formatted = itemList.map((item) => {
      const tags = JSON.parse(item.tags) as string[];
      return `- [${item.status.toUpperCase()}] ${item.title}\n  ID: ${item.id}\n  Theme: ${item.theme || "none"}\n  Tags: ${tags.join(", ") || "none"}\n  Created: ${item.createdAt}`;
    }).join("\n\n");

    return {
      content: [{
        type: "text",
        text: `Found ${itemList.length} thought(s):\n\n${formatted}`
      }]
    };
  }
);

// Get thought tool - retrieves a specific item by ID via API
server.tool(
  "get_thought",
  "Get details of a specific thought by its ID. Use this to see full content of a captured thought.",
  {
    id: z.string().describe("The thought ID (returned when captured)")
  },
  async ({ id }) => {
    console.error(`[mental-mcp] Getting thought: ${id}`);

    const client = getItemsClient();
    const res = await client[":id"].$get({ param: { id } });

    if (res.status === 404) {
      return {
        content: [{
          type: "text",
          text: `Thought not found: ${id}`
        }]
      };
    }

    if (!res.ok) {
      console.error(`[mental-mcp] API error: ${res.status}`);
      return {
        content: [{ type: "text", text: `Error getting thought: ${res.status}` }]
      };
    }

    const item = await res.json() as {
      id: string;
      title: string;
      content: string;
      status: string;
      theme: string | null;
      tags: string;
      createdAt: string;
      updatedAt: string;
      resolvedAt: string | null;
      resolution: string | null;
    };
    const tags = JSON.parse(item.tags) as string[];

    return {
      content: [{
        type: "text",
        text: `# ${item.title}

**ID:** ${item.id}
**Status:** ${item.status}
**Theme:** ${item.theme || "none"}
**Tags:** ${tags.join(", ") || "none"}
**Created:** ${item.createdAt}
**Updated:** ${item.updatedAt}
${item.resolvedAt ? `**Resolved:** ${item.resolvedAt}` : ""}

## Content

${item.content}

${item.resolution ? `## Resolution\n\n${item.resolution}` : ""}`
      }]
    };
  }
);

// Resolve thought tool - mark items as resolved via API
server.tool(
  "resolve_thought",
  "Mark a captured thought as resolved. Use when an item has been addressed, completed, or is no longer relevant. Provide a brief resolution summary.",
  {
    id: z.string().describe("The thought ID to resolve"),
    resolution: z.string().describe("Brief summary of how this was resolved or why it's no longer relevant")
  },
  async ({ id, resolution }) => {
    console.error(`[mental-mcp] Resolving thought: ${id}`);

    const client = getItemsClient();

    // First check if item exists and get current status
    const getRes = await client[":id"].$get({ param: { id } });

    if (getRes.status === 404) {
      return {
        content: [{
          type: "text",
          text: `Thought not found: ${id}`
        }]
      };
    }

    if (!getRes.ok) {
      console.error(`[mental-mcp] API error: ${getRes.status}`);
      return {
        content: [{ type: "text", text: `Error checking thought: ${getRes.status}` }]
      };
    }

    const item = await getRes.json() as {
      id: string;
      title: string;
      status: string;
      resolvedAt: string | null;
      resolution: string | null;
    };

    if (item.status === "resolved") {
      return {
        content: [{
          type: "text",
          text: `Thought already resolved: "${item.title}"\nResolved at: ${item.resolvedAt}\nResolution: ${item.resolution}`
        }]
      };
    }

    // Update to resolved
    const updateRes = await client[":id"].$put({
      param: { id },
      json: { status: "resolved", resolution }
    });

    if (!updateRes.ok) {
      console.error(`[mental-mcp] API error: ${updateRes.status}`);
      return {
        content: [{ type: "text", text: `Error resolving thought: ${updateRes.status}` }]
      };
    }

    const updated = await updateRes.json() as { resolvedAt: string };
    console.error(`[mental-mcp] Resolved: "${item.title}"`);

    return {
      content: [{
        type: "text",
        text: `Resolved: "${item.title}"\nID: ${id}\nResolution: ${resolution}\nResolved at: ${updated.resolvedAt}`
      }]
    };
  }
);

// Reopen thought tool - reopen previously resolved items via API
server.tool(
  "reopen_thought",
  "Reopen a previously resolved thought. Use when an item needs further attention after being marked resolved.",
  {
    id: z.string().describe("The thought ID to reopen")
  },
  async ({ id }) => {
    console.error(`[mental-mcp] Reopening thought: ${id}`);

    const client = getItemsClient();

    // First check if item exists and get current status
    const getRes = await client[":id"].$get({ param: { id } });

    if (getRes.status === 404) {
      return {
        content: [{
          type: "text",
          text: `Thought not found: ${id}`
        }]
      };
    }

    if (!getRes.ok) {
      console.error(`[mental-mcp] API error: ${getRes.status}`);
      return {
        content: [{ type: "text", text: `Error checking thought: ${getRes.status}` }]
      };
    }

    const item = await getRes.json() as {
      id: string;
      title: string;
      status: string;
      resolution: string | null;
    };

    if (item.status === "open") {
      return {
        content: [{
          type: "text",
          text: `Thought is already open: "${item.title}"`
        }]
      };
    }

    // Update to open
    const updateRes = await client[":id"].$put({
      param: { id },
      json: { status: "open" }
    });

    if (!updateRes.ok) {
      console.error(`[mental-mcp] API error: ${updateRes.status}`);
      return {
        content: [{ type: "text", text: `Error reopening thought: ${updateRes.status}` }]
      };
    }

    console.error(`[mental-mcp] Reopened: "${item.title}"`);

    return {
      content: [{
        type: "text",
        text: `Reopened: "${item.title}"\nID: ${id}\nPrevious resolution: ${item.resolution || "none"}`
      }]
    };
  }
);

// Start session tool - begins a new capture session via API
server.tool(
  "start_session",
  "Start a new mental capture session. Items captured after this will be linked to the session. Use at the beginning of a focused work session.",
  {
    name: z.string().optional().describe("Optional session name/description")
  },
  async ({ name }) => {
    if (currentSessionId) {
      return {
        content: [{
          type: "text",
          text: `Session already active: ${currentSessionId}\nStarted: ${sessionStartTime?.toISOString()}\n\nEnd the current session first with end_session.`
        }]
      };
    }

    const sessions = getSessionsClient();
    const res = await sessions.start.$post({
      json: { name }
    });

    if (!res.ok) {
      console.error(`[mental-mcp] API error: ${res.status}`);
      return {
        content: [{ type: "text", text: `Error starting session: ${res.status}` }]
      };
    }

    const session = await res.json();
    currentSessionId = session.sessionId;
    sessionStartTime = new Date(session.startedAt);

    console.error(`[mental-mcp] Session started: ${currentSessionId}`);

    return {
      content: [{
        type: "text",
        text: `Session started: ${currentSessionId}\n${name ? `Name: ${name}\n` : ""}Time: ${sessionStartTime.toISOString()}\n\nItems captured from now will be linked to this session.`
      }]
    };
  }
);

// End session tool - summarizes and clears session via API
server.tool(
  "end_session",
  "End the current capture session. Shows summary of items captured during the session.",
  {},
  async () => {
    if (!currentSessionId) {
      return {
        content: [{
          type: "text",
          text: "No active session. Start one with start_session."
        }]
      };
    }

    const startTime = sessionStartTime;

    const sessions = getSessionsClient();
    const res = await sessions.end.$post();

    if (!res.ok) {
      // API might say no active session if server restarted
      console.error(`[mental-mcp] API error: ${res.status}`);
      // Clear local state anyway
      currentSessionId = null;
      sessionStartTime = null;
      return {
        content: [{
          type: "text",
          text: `Session ended locally (API had no active session)\nStarted: ${startTime?.toISOString()}\nEnded: ${new Date().toISOString()}`
        }]
      };
    }

    const summary = await res.json();

    // Clear local session state
    currentSessionId = null;
    sessionStartTime = null;

    console.error(`[mental-mcp] Session ended: ${summary.sessionId}`);

    return {
      content: [{
        type: "text",
        text: `Session ended: ${summary.sessionId}\nStarted: ${summary.startedAt}\nEnded: ${summary.endedAt}\n\n## Items Captured: ${summary.itemCount}`
      }]
    };
  }
);

// Connect to stdio transport
const transport = new StdioServerTransport();
await server.connect(transport);

console.error("[mental-mcp] Server started");
