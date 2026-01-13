"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export interface FilterState {
  status: "all" | "open" | "resolved";
  tags: string[];
  theme: string | null;
}

interface FilterBarProps {
  tags: string[];
  themes: string[];
  activeStatus: "all" | "open" | "resolved";
  activeTags: string[];
  activeTheme: string | null;
}

export function FilterBar({
  tags,
  themes,
  activeStatus,
  activeTags,
  activeTheme,
}: FilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilters = useCallback(
    (updates: Partial<FilterState>) => {
      const params = new URLSearchParams(searchParams.toString());

      // Update status
      if (updates.status !== undefined) {
        if (updates.status === "all") {
          params.delete("status");
        } else {
          params.set("status", updates.status);
        }
      }

      // Update tags
      if (updates.tags !== undefined) {
        if (updates.tags.length === 0) {
          params.delete("tags");
        } else {
          params.set("tags", updates.tags.join(","));
        }
      }

      // Update theme
      if (updates.theme !== undefined) {
        if (updates.theme === null) {
          params.delete("theme");
        } else {
          params.set("theme", updates.theme);
        }
      }

      const queryString = params.toString();
      router.push(queryString ? `/?${queryString}` : "/");
    },
    [router, searchParams]
  );

  const toggleTag = (tag: string) => {
    const newTags = activeTags.includes(tag)
      ? activeTags.filter((t) => t !== tag)
      : [...activeTags, tag];
    updateFilters({ tags: newTags });
  };

  const toggleTheme = (theme: string) => {
    updateFilters({ theme: activeTheme === theme ? null : theme });
  };

  const resetFilters = () => {
    router.push("/");
  };

  const hasActiveFilters =
    activeStatus !== "all" || activeTags.length > 0 || activeTheme !== null;

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-8">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-800">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Reset
          </button>
        )}
      </div>

      {/* Status filter */}
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">Status</p>
        <div className="flex gap-2">
          {(["all", "open", "resolved"] as const).map((status) => (
            <button
              key={status}
              onClick={() => updateFilters({ status })}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                activeStatus === status
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Tags filter */}
      {tags.length > 0 && (
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Tags</p>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  activeTags.includes(tag)
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Themes filter */}
      {themes.length > 0 && (
        <div>
          <p className="text-sm text-gray-600 mb-2">Themes</p>
          <div className="flex flex-wrap gap-2">
            {themes.map((theme) => (
              <button
                key={theme}
                onClick={() => toggleTheme(theme)}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  activeTheme === theme
                    ? "bg-purple-600 text-white"
                    : "bg-purple-100 text-purple-700 hover:bg-purple-200"
                }`}
              >
                {theme}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
