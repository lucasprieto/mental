import { NextRequest, NextResponse } from "next/server";
import { getItemsClient } from "@/lib/api";

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

    // Prepare tags array
    const tagsArray = Array.isArray(tags) ? tags : [];

    const client = getItemsClient();
    const res = await client.index.$post({
      json: {
        title: title.trim(),
        content: content.trim(),
        tags: tagsArray,
        theme: theme?.trim() || undefined,
      },
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Error creating item:", error);
    return NextResponse.json(
      { error: "Failed to create item" },
      { status: 500 }
    );
  }
}
