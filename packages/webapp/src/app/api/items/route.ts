import { NextRequest, NextResponse } from "next/server";
import { createItem } from "@/lib/api";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, theme } = body;

    if (!title || typeof title !== "string" || title.trim() === "") {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    if (!content || typeof content !== "string" || content.trim() === "") {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    const item = await createItem({
      title: title.trim(),
      content: content.trim(),
      theme: theme?.trim() || undefined,
    });

    if (!item) {
      return NextResponse.json({ error: "Failed to create item" }, { status: 500 });
    }

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("Error creating item:", error);
    return NextResponse.json({ error: "Failed to create item" }, { status: 500 });
  }
}
