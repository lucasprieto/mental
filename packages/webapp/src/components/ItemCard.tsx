import type { MentalItemRow } from "@mental/db";
import Link from "next/link";

interface ItemCardProps {
  item: MentalItemRow;
}

export function ItemCard({ item }: ItemCardProps) {
  const tags = JSON.parse(item.tags) as string[];

  return (
    <Link
      href={`/item/${item.id}`}
      className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow p-4"
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-medium text-gray-900 truncate flex-1">
          {item.title}
        </h3>
        <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
          item.status === "open"
            ? "bg-blue-100 text-blue-700"
            : "bg-green-100 text-green-700"
        }`}>
          {item.status}
        </span>
      </div>

      <p className="text-gray-600 text-sm line-clamp-2 mb-3">
        {item.content}
      </p>

      <div className="flex items-center gap-2 flex-wrap">
        {item.theme && (
          <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded">
            {item.theme}
          </span>
        )}
        {tags.map(tag => (
          <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
            {tag}
          </span>
        ))}
      </div>

      <p className="text-gray-400 text-xs mt-2">
        {item.status === "resolved" && item.resolvedAt
          ? `Resolved ${new Date(item.resolvedAt).toLocaleDateString()}`
          : `Created ${new Date(item.createdAt).toLocaleDateString()}`
        }
      </p>
    </Link>
  );
}
