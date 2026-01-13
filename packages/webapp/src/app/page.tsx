import { getDatabase } from "@/lib/db";
import { mentalItems, desc, eq } from "@mental/db";
import { ItemList } from "@/components/ItemList";
import { FilterBar } from "@/components/FilterBar";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ status?: string; tags?: string; theme?: string }>;
}

export default async function Dashboard({ searchParams }: PageProps) {
  const params = await searchParams;
  const db = getDatabase();

  // Parse filter params
  const statusFilter: "all" | "open" | "resolved" =
    params.status === "open" || params.status === "resolved"
      ? params.status
      : "all";
  const tagsFilter = params.tags ? params.tags.split(",") : [];
  const themeFilter = params.theme || null;

  // Fetch all items for stats (unfiltered)
  const allOpenItems = await db.select()
    .from(mentalItems)
    .where(eq(mentalItems.status, "open"))
    .orderBy(desc(mentalItems.createdAt));

  const allResolvedItems = await db.select()
    .from(mentalItems)
    .where(eq(mentalItems.status, "resolved"))
    .orderBy(desc(mentalItems.resolvedAt))
    .limit(10);

  // Get unique themes from all items
  const allItems = [...allOpenItems, ...allResolvedItems];
  const themes = [...new Set(allItems.map(i => i.theme).filter((t): t is string => Boolean(t)))];

  // Get all unique tags from all items
  const allTags = allItems.flatMap(i => JSON.parse(i.tags) as string[]);
  const uniqueTags = [...new Set(allTags)];

  // Get tag counts for "At a Glance" display
  const tagCounts = allTags.reduce((acc, tag) => {
    acc[tag] = (acc[tag] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const topTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  // Apply filters for display
  let filteredOpenItems = allOpenItems;
  let filteredResolvedItems = allResolvedItems;

  // Status filter
  if (statusFilter === "open") {
    filteredResolvedItems = [];
  } else if (statusFilter === "resolved") {
    filteredOpenItems = [];
  }

  // Tags filter (AND logic - items must have ALL selected tags)
  if (tagsFilter.length > 0) {
    filteredOpenItems = filteredOpenItems.filter(item => {
      const itemTags = JSON.parse(item.tags) as string[];
      return tagsFilter.every(tag => itemTags.includes(tag));
    });
    filteredResolvedItems = filteredResolvedItems.filter(item => {
      const itemTags = JSON.parse(item.tags) as string[];
      return tagsFilter.every(tag => itemTags.includes(tag));
    });
  }

  // Theme filter
  if (themeFilter) {
    filteredOpenItems = filteredOpenItems.filter(item => item.theme === themeFilter);
    filteredResolvedItems = filteredResolvedItems.filter(item => item.theme === themeFilter);
  }

  return (
    <div>
      {/* Stats row - unfiltered counts */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-3xl font-bold text-blue-600">{allOpenItems.length}</p>
          <p className="text-gray-600">Open</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-3xl font-bold text-green-600">{allResolvedItems.length}</p>
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

      {/* Themes & Tags overview - unfiltered */}
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

      {/* Filter bar */}
      <Suspense fallback={<div className="bg-white rounded-lg shadow p-4 mb-8 animate-pulse h-32" />}>
        <FilterBar
          tags={uniqueTags}
          themes={themes}
          activeStatus={statusFilter}
          activeTags={tagsFilter}
          activeTheme={themeFilter}
        />
      </Suspense>

      {/* Open items - filtered */}
      {(statusFilter === "all" || statusFilter === "open") && (
        <ItemList
          title="Open Items"
          items={filteredOpenItems}
          emptyMessage={tagsFilter.length > 0 || themeFilter ? "No items match filters" : "No open items. Capture some thoughts via Claude Code!"}
        />
      )}

      {/* Recently resolved - filtered */}
      {(statusFilter === "all" || statusFilter === "resolved") && (
        <ItemList
          title="Recently Resolved"
          items={filteredResolvedItems}
          emptyMessage={tagsFilter.length > 0 || themeFilter ? "No items match filters" : "No resolved items yet."}
        />
      )}
    </div>
  );
}
