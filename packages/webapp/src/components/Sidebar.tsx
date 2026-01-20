"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { UserMenu } from "./UserMenu";

interface SidebarProps {
  themes: string[];
  activeStatus: "all" | "open" | "resolved";
  activeTheme: string | null;
  user?: {
    email?: string;
    name?: string;
    picture?: string;
  };
}

export function Sidebar({ themes, activeStatus, activeTheme, user }: SidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  const updateFilter = useCallback(
    (key: "status" | "theme", value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());

      if (key === "status") {
        if (value === "all" || value === null) {
          params.delete("status");
        } else {
          params.set("status", value);
        }
      } else if (key === "theme") {
        if (value === null) {
          params.delete("theme");
        } else {
          params.set("theme", value);
        }
      }

      const queryString = params.toString();
      router.push(queryString ? `/?${queryString}` : "/");
      setIsOpen(false); // Close sidebar on mobile after selection
    },
    [router, searchParams]
  );

  const toggleTheme = (theme: string) => {
    updateFilter("theme", activeTheme === theme ? null : theme);
  };

  return (
    <>
      {/* Mobile hamburger button - fixed position */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow md:hidden"
        aria-label="Open menu"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 w-64 h-screen flex flex-col border-r border-gray-200 bg-white z-40
          transform transition-transform duration-200 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        {/* Branding with close button */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h1 className="text-lg font-semibold">Mental</h1>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 text-gray-500 hover:text-gray-700 md:hidden"
            aria-label="Close menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Filter sections */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Status filter */}
          <div>
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
              Status
            </h3>
            <div className="space-y-1">
              {(["all", "open", "resolved"] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => updateFilter("status", status)}
                  className={`
                    w-full px-3 py-1.5 text-sm text-left rounded-md transition-colors
                    ${
                      activeStatus === status
                        ? "bg-gray-100 text-gray-900 font-medium"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }
                  `}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Theme filter */}
          {themes.length > 0 && (
            <div>
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                Theme
              </h3>
              <div className="space-y-1">
                {themes.map((theme) => (
                  <button
                    key={theme}
                    onClick={() => toggleTheme(theme)}
                    className={`
                      w-full px-3 py-1.5 text-sm text-left rounded-md transition-colors
                      ${
                        activeTheme === theme
                          ? "bg-purple-100 text-purple-900 font-medium"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }
                    `}
                  >
                    {theme}
                  </button>
                ))}
              </div>
            </div>
          )}
        </nav>

        {/* User menu at bottom */}
        {user && (
          <div className="border-t border-gray-200 p-3">
            <UserMenu user={user} />
          </div>
        )}
      </aside>
    </>
  );
}
