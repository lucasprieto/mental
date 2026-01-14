"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

interface Item {
  id: string;
  title: string;
  content: string;
  theme: string | null;
  status: "open" | "resolved";
  resolution: string | null;
}

interface EditItemFormProps {
  item: Item;
  onCancel: () => void;
}

export function EditItemForm({ item, onCancel }: EditItemFormProps) {
  const router = useRouter();

  const [title, setTitle] = useState(item.title);
  const [content, setContent] = useState(item.content);
  const [theme, setTheme] = useState(item.theme || "");
  const [status, setStatus] = useState<"open" | "resolved">(item.status);
  const [resolution, setResolution] = useState(item.resolution || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch(`/api/items/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          theme: theme || null,
          status,
          resolution: status === "resolved" ? resolution : null,
        }),
      });

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType?.includes("application/json")) {
          const data = await response.json();
          throw new Error(data.error || "Failed to update item");
        } else {
          throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }
      }

      router.refresh();
      onCancel();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [item.id, title, content, theme, status, resolution, router, onCancel]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Title
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
          disabled={isLoading}
        />
      </div>

      {/* Content */}
      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
          Content
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-none"
          required
          disabled={isLoading}
        />
      </div>

      {/* Theme */}
      <div>
        <label htmlFor="theme" className="block text-sm font-medium text-gray-700 mb-1">
          Theme
        </label>
        <input
          type="text"
          id="theme"
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Optional theme"
          disabled={isLoading}
        />
      </div>

      {/* Status */}
      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
          Status
        </label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value as "open" | "resolved")}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        >
          <option value="open">Open</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      {/* Resolution (only shown when status is resolved) */}
      {status === "resolved" && (
        <div>
          <label htmlFor="resolution" className="block text-sm font-medium text-gray-700 mb-1">
            Resolution
          </label>
          <textarea
            id="resolution"
            value={resolution}
            onChange={(e) => setResolution(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
            placeholder="How was this resolved?"
            disabled={isLoading}
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
