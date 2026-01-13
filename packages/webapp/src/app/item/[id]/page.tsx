import { getDatabase } from "@/lib/db";
import { mentalItems, eq } from "@mental/db";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ItemDetail({ params }: PageProps) {
  const { id } = await params;
  const db = getDatabase();

  const items = await db.select()
    .from(mentalItems)
    .where(eq(mentalItems.id, id))
    .limit(1);

  if (items.length === 0) {
    notFound();
  }

  const item = items[0];
  const tags = JSON.parse(item.tags) as string[];

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
        <div className="flex items-start justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">{item.title}</h1>
          <span className={`px-3 py-1 text-sm rounded-full ${
            item.status === "open"
              ? "bg-blue-100 text-blue-700"
              : "bg-green-100 text-green-700"
          }`}>
            {item.status}
          </span>
        </div>

        {/* Meta info */}
        <div className="flex flex-wrap gap-2 mb-4">
          {item.theme && (
            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-sm rounded">
              Theme: {item.theme}
            </span>
          )}
          {tags.map(tag => (
            <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded">
              {tag}
            </span>
          ))}
        </div>

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

      {/* Resolution (if resolved) */}
      {item.status === "resolved" && item.resolution && (
        <div className="bg-green-50 rounded-lg shadow p-6 border border-green-200">
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
