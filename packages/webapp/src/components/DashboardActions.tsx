"use client";

import { useState } from "react";
import { CaptureModal } from "./CaptureModal";

export function DashboardActions() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      {/* Floating action button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 flex items-center justify-center text-2xl z-40"
        aria-label="Add new thought"
      >
        +
      </button>

      <CaptureModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
