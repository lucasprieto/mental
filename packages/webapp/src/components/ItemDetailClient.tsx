"use client";

import { useState } from "react";
import Link from "next/link";
import { EditItemForm } from "./EditItemForm";

interface Item {
  id: string;
  title: string;
  content: string;
  theme: string | null;
  status: "open" | "resolved";
  resolution: string | null;
  sessionId: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  resolvedAt: Date | string | null;
}

interface FollowUp {
  id: string;
  itemId: string;
  content: string;
  createdAt: Date | string;
}

interface ItemDetailClientProps {
  item: Item;
  followups: FollowUp[];
}

export function ItemDetailClient({ item, followups }: ItemDetailClientProps) {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <div className="max-w-3xl">
        <Link
          href="/"
          className="text-blue-600 hover:text-blue-800 text-sm mb-4 inline-block"
        >
          &larr; Back to Dashboard
        </Link>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Edit Item</h2>
          <EditItemForm item={item} onCancel={() => setIsEditing(false)} />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      {/* Back link */}
      <Link
        href="/"
        className="text-blue-600 hover:text-blue-800 text-sm mb-4 inline-block"
      >
        &larr; Back to Dashboard
      </Link>

      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-4">
          <h1 className="text-2xl font-bold text-gray-900">{item.title}</h1>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 text-sm rounded-full ${
              item.status === "open"
                ? "bg-blue-100 text-blue-700"
                : "bg-green-100 text-green-700"
            }`}>
              {item.status}
            </span>
            <button
              onClick={() => setIsEditing(true)}
              className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
            >
              Edit
            </button>
          </div>
        </div>

        {/* Meta info */}
        {item.theme && (
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-sm rounded">
              Theme: {item.theme}
            </span>
          </div>
        )}

        {/* Timestamps */}
        <div className="text-sm text-gray-500 space-y-1">
          <p>Created: {new Date(item.createdAt).toLocaleString()}</p>
          <p>Updated: {new Date(item.updatedAt).toLocaleString()}</p>
          {item.resolvedAt && (
            <p>Resolved: {new Date(item.resolvedAt).toLocaleString()}</p>
          )}
          {item.sessionId && (
            <p>Session: {item.sessionId}</p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-3 text-gray-800">Content</h2>
        <div className="prose prose-gray max-w-none">
          <p className="whitespace-pre-wrap">{item.content}</p>
        </div>
      </div>

      {/* Follow-ups section */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Follow-ups
          <span className="ml-2 text-sm font-normal text-gray-500">
            ({followups.length})
          </span>
        </h2>
        {followups.length === 0 ? (
          <p className="text-gray-500 text-sm italic">No follow-ups yet</p>
        ) : (
          <div className="space-y-4">
            {followups.map((followup) => (
              <div key={followup.id} className="border-l-2 border-gray-200 pl-4">
                <p className="text-gray-400 text-xs mb-1">
                  {new Date(followup.createdAt).toLocaleString()}
                </p>
                <p className="text-gray-700 whitespace-pre-wrap">{followup.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resolution (if resolved) */}
      {item.status === "resolved" && item.resolution && (
        <div className="bg-green-50 rounded-lg shadow p-6 border border-green-200 mb-6">
          <h2 className="text-lg font-semibold mb-3 text-green-800">Resolution</h2>
          <p className="text-green-700 whitespace-pre-wrap">{item.resolution}</p>
        </div>
      )}

      {/* ID footer */}
      <p className="text-xs text-gray-400 mt-6">
        ID: {item.id}
      </p>
    </div>
  );
}
