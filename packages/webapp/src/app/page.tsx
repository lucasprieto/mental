import { getDatabase } from "@/lib/db";
import { mentalItems, desc, eq } from "@mental/db";
import { ItemList } from "@/components/ItemList";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const db = getDatabase();

  // Fetch open items (most recent first)
  const openItems = await db.select()
    .from(mentalItems)
    .where(eq(mentalItems.status, "open"))
    .orderBy(desc(mentalItems.createdAt));

  // Fetch recently resolved (last 10)
  const resolvedItems = await db.select()
    .from(mentalItems)
    .where(eq(mentalItems.status, "resolved"))
    .orderBy(desc(mentalItems.resolvedAt))
    .limit(10);

  // Get unique themes from open items
  const themes = [...new Set(openItems.map(i => i.theme).filter(Boolean))];

  // Get all tags from open items
  const allTags = openItems.flatMap(i => JSON.parse(i.tags) as string[]);
  const tagCounts = allTags.reduce((acc, tag) => {
    acc[tag] = (acc[tag] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const topTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  return (
    <div>
      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-3xl font-bold text-blue-600">{openItems.length}</p>
          <p className="text-gray-600">Open</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-3xl font-bold text-green-600">{resolvedItems.length}</p>
          <p className="text-gray-600">Recently Resolved</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-3xl font-bold text-purple-600">{themes.length}</p>
          <p className="text-gray-600">Active Themes</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-3xl font-bold text-gray-600">{topTags.length}</p>
          <p className="text-gray-600">Tags in Use</p>
        </div>
      </div>

      {/* Themes & Tags overview */}
      {(themes.length > 0 || topTags.length > 0) && (
        <div className="bg-white rounded-lg shadow p-4 mb-8">
          <h3 className="font-semibold mb-3">At a Glance</h3>
          <div className="flex flex-wrap gap-2">
            {themes.map(theme => (
              <span key={theme} className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full">
                {theme}
              </span>
            ))}
            {topTags.map(([tag, count]) => (
              <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                {tag} ({count})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Open items */}
      <ItemList
        title="Open Items"
        items={openItems}
        emptyMessage="No open items. Capture some thoughts via Claude Code!"
      />

      {/* Recently resolved */}
      <ItemList
        title="Recently Resolved"
        items={resolvedItems}
        emptyMessage="No resolved items yet."
      />
    </div>
  );
}
