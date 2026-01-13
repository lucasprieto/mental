import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { eq, createId, pg } from "@mental/db";
import { getDb } from "../db.js";

// In-memory session storage (single instance, personal tool)
let activeSession: { id: string; name?: string; startedAt: Date } | null = null;

const sessionsRoute = new Hono()
  // GET /active - Get active session ID
  .get("/active", (c) => {
    if (!activeSession) {
      return c.json({ sessionId: null });
    }
    return c.json({
      sessionId: activeSession.id,
      name: activeSession.name,
      startedAt: activeSession.startedAt.toISOString(),
    });
  })
  // POST /start - Start a new session
  .post(
    "/start",
    zValidator(
      "json",
      z
        .object({
          name: z.string().optional(),
        })
        .optional()
    ),
    (c) => {
      const body = c.req.valid("json");

      // End previous session if exists
      if (activeSession) {
        activeSession = null;
      }

      const newSession = {
        id: createId(),
        name: body?.name,
        startedAt: new Date(),
      };

      activeSession = newSession;

      return c.json({
        sessionId: newSession.id,
        name: newSession.name,
        startedAt: newSession.startedAt.toISOString(),
      });
    }
  )
  // POST /end - End current session
  .post("/end", async (c) => {
    if (!activeSession) {
      return c.json({ error: "No active session" }, 400);
    }

    const db = getDb();
    const sessionId = activeSession.id;

    // Count items captured in this session
    const items = await db
      .select()
      .from(pg.mentalItems)
      .where(eq(pg.mentalItems.sessionId, sessionId));

    const summary = {
      sessionId,
      name: activeSession.name,
      startedAt: activeSession.startedAt.toISOString(),
      endedAt: new Date().toISOString(),
      itemCount: items.length,
    };

    // Clear active session
    activeSession = null;

    return c.json(summary);
  });

export default sessionsRoute;
export type SessionsRoute = typeof sessionsRoute;
