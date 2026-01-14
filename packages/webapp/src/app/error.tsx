"use client";

import { useEffect } from "react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  const isConnectionError =
    error.message.includes("fetch failed") ||
    error.message.includes("ECONNREFUSED") ||
    error.message.includes("network");

  return (
    <div className="ml-64 min-h-screen bg-gray-50">
      <div className="px-6 py-8">
        <div className="max-w-md mx-auto mt-16">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            {isConnectionError ? (
              <>
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-amber-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Cannot Connect to API
                </h2>
                <p className="text-gray-600 mb-6">
                  The Mental API server is not responding. Make sure the API server is running.
                </p>
                <div className="bg-gray-50 rounded-md p-4 mb-6 text-left">
                  <p className="text-sm text-gray-500 mb-2">To start the API server:</p>
                  <code className="text-sm font-mono bg-gray-200 px-2 py-1 rounded">
                    pnpm --filter @mental/api dev
                  </code>
                </div>
              </>
            ) : (
              <>
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-red-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Something Went Wrong
                </h2>
                <p className="text-gray-600 mb-4">
                  An unexpected error occurred while loading the dashboard.
                </p>
                <p className="text-sm text-gray-500 bg-gray-50 rounded-md p-3 font-mono mb-6">
                  {error.message}
                </p>
              </>
            )}
            <button
              onClick={reset}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
