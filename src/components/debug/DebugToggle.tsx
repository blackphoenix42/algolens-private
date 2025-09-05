// src/components/debug/DebugToggle.tsx
import { useState, useEffect } from "react";

import DebugPanel from "./DebugPanel";

import { LogCategory, logger } from "@/services/monitoring";

export default function DebugToggle() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Only show debug toggle in development mode
  useEffect(() => {
    setIsVisible(
      import.meta.env.DEV || import.meta.env.VITE_ENABLE_DEBUG === "true"
    );

    // Keyboard shortcut to open debug panel
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key === "D") {
        event.preventDefault();
        setIsOpen((prev) => {
          const newState = !prev;
          logger.info(
            LogCategory.GENERAL,
            `Debug panel ${newState ? "opened" : "closed"}`
          );
          return newState;
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!isVisible) return null;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600 z-40"
        title="Open Debug Panel (Ctrl+Shift+D)"
        aria-label="Open debug panel"
      >
        🐛
      </button>

      <DebugPanel isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
