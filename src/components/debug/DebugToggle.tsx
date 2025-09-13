// src/components/debug/DebugToggle.tsx
import { useEffect, useState } from "react";

import { LogCategory, logger } from "@/services/monitoring";

import DebugPanel from "./DebugPanel";

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
            LogCategory.USER_INTERACTION,
            `Debug panel ${newState ? "opened" : "closed"} via keyboard shortcut`,
            {
              method: "keyboard_shortcut",
              key: "Ctrl+Shift+D",
              timestamp: new Date().toISOString(),
            }
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
        onClick={() => {
          logger.info(
            LogCategory.USER_INTERACTION,
            "Debug panel opened via button",
            {
              method: "button_click",
              timestamp: new Date().toISOString(),
            }
          );
          setIsOpen(true);
        }}
        className="fixed bottom-4 left-4 z-40 rounded-full bg-red-500 p-2 text-white shadow-lg hover:bg-red-600"
        title="Open Debug Panel (Ctrl+Shift+D)"
        aria-label="Open debug panel"
      >
        🐛
      </button>

      <DebugPanel
        isOpen={isOpen}
        onClose={() => {
          logger.info(LogCategory.USER_INTERACTION, "Debug panel closed", {
            timestamp: new Date().toISOString(),
          });
          setIsOpen(false);
        }}
      />
    </>
  );
}
