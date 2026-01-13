import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/db";
import { mentalItems } from "@mental/db";
import { createId } from "@paralleldrive/cuid2";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, tags, theme } = body;

    // Validate required fields
    if (!title || typeof title !== "string" || title.trim() === "") {
      return NextResponse.json(
        { error: "Title is required and must be non-empty" },
        { status: 400 }
      );
    }

    if (!content || typeof content !== "string" || content.trim() === "") {
      return NextResponse.json(
        { error: "Content is required and must be non-empty" },
        { status: 400 }
      );
    }

    const db = getDatabase();
    const now = new Date();
    const id = createId();

    // Prepare tags as JSON string
    const tagsArray = Array.isArray(tags) ? tags : [];
    const tagsJson = JSON.stringify(tagsArray);

    const newItem = {
      id,
      title: title.trim(),
      content: content.trim(),
      tags: tagsJson,
      theme: theme?.trim() || null,
      status: "open" as const,
      resolution: null,
      sessionId: null,
      createdAt: now,
      updatedAt: now,
      resolvedAt: null,
    };

    await db.insert(mentalItems).values(newItem);

    return NextResponse.json(newItem);
  } catch (error) {
    console.error("Error creating item:", error);
    return NextResponse.json(
      { error: "Failed to create item" },
      { status: 500 }
    );
  }
}
