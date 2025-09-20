// src/components/debug/DebugPanel.tsx
// Debug panel disabled to eliminate localStorage usage

// import { useEffect, useMemo, useRef, useState } from "react";
// import { LogCategory, logger, LogLevel } from "@/services/monitoring";

interface DebugPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

// Simplified debug panel with monitoring disabled
export default function DebugPanel({ isOpen, onClose }: DebugPanelProps) {
  if (!isOpen) return null;

  return (
    <div className="bg-opacity-50 fixed inset-0 z-[200] flex items-center justify-center bg-black">
      <div className="max-h-[80vh] w-[80vw] max-w-4xl overflow-hidden rounded-lg bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b bg-gray-50 p-4">
          <h2 className="text-xl font-semibold">Debug Panel (Disabled)</h2>
          <button
            onClick={onClose}
            className="rounded p-1 text-gray-500 hover:bg-gray-200"
            aria-label="Close debug panel"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center text-gray-600">
            <p className="mb-4 text-lg">Debug monitoring has been disabled</p>
            <p className="mb-2">
              Logging and performance monitoring are turned off to eliminate
              localStorage usage.
            </p>
            <p className="text-sm text-gray-500">
              To re-enable, uncomment the monitoring services in
              src/services/monitoring/
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
