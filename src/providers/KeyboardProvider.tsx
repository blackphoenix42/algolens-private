/**
 * Global keyboard shortcuts provider
 * Integrates keyboard shortcuts across the entire application
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { createPortal } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";

import { getShortcutHints } from "@/core/input";

interface KeyboardContextType {
  isEnabled: boolean;
  toggleShortcuts: () => void;
  showHints: boolean;
  setShowHints: (show: boolean) => void;
  currentHints: Array<{ key: string; description: string }>;
}

const KeyboardContext = createContext<KeyboardContextType | null>(null);

export function useKeyboard() {
  const context = useContext(KeyboardContext);
  if (!context) {
    throw new Error("useKeyboard must be used within KeyboardProvider");
  }
  return context;
}

interface KeyboardProviderProps {
  children: React.ReactNode;
}

export function KeyboardProvider({ children }: KeyboardProviderProps) {
  const [isEnabled, setIsEnabled] = useState(true);
  const [showHints, setShowHints] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleShortcuts = () => setIsEnabled((prev) => !prev);

  // Helper functions
  const focusSearch = useCallback(() => {
    const searchInput = document.querySelector(
      'input[type="search"], input[placeholder*="search" i]'
    ) as HTMLInputElement;
    if (searchInput) {
      searchInput.focus();
    }
  }, []);

  const handleEscape = useCallback(() => {
    // Remove focus from any active element
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    // Close any open modals/dialogs
    document.dispatchEvent(new CustomEvent("algolens:escape"));
  }, []);

  // Get context-aware hints
  const currentHints = getShortcutHints(
    location.pathname === "/"
      ? "home"
      : location.pathname.includes("/algorithm")
        ? "algorithm"
        : "general"
  );

  // Global keyboard event handler
  const handleGlobalKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!isEnabled) return;

      // Don't handle shortcuts when typing in inputs
      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        // Exception for global shortcuts
        if (
          !["Escape", "F1"].includes(event.key) &&
          !event.ctrlKey &&
          !event.metaKey
        ) {
          return;
        }
      }

      const key = normalizeKey(getKeyString(event));
      const isVisualizerPage = location.pathname.includes("/viz/");

      // Handle global shortcuts
      switch (key) {
        // Navigation shortcuts
        case "h":
          event.preventDefault();
          navigate("/");
          break;

        case "v":
          event.preventDefault();
          if (!isVisualizerPage) {
            // Navigate to a default algorithm if not on visualizer
            navigate("/viz/sorting/bubble-sort");
          }
          break;

        case "/":
        case "ctrl+k":
        case "cmd+k":
          event.preventDefault();
          focusSearch();
          break;

        // Help and interface shortcuts
        case "f1":
          event.preventDefault();
          setShowHints(true);
          break;

        case "escape":
          event.preventDefault();
          setShowHints(false);
          handleEscape();
          break;

        case "ctrl+shift+h":
        case "cmd+shift+h":
          event.preventDefault();
          setShowHints((prev: boolean) => !prev);
          break;

        // Theme toggle
        case "t":
          event.preventDefault();
          document.dispatchEvent(new CustomEvent("algolens:toggle-theme"));
          break;

        // Fullscreen
        case "f":
          if (!event.ctrlKey && !event.metaKey) {
            event.preventDefault();
            if (document.fullscreenElement) {
              document.exitFullscreen();
            } else {
              document.documentElement.requestFullscreen();
            }
          }
          break;

        // Visualizer-specific shortcuts (dispatch events for components to handle)
        case " ":
        case "space":
          if (isVisualizerPage) {
            event.preventDefault();
            document.dispatchEvent(new CustomEvent("algolens:play-pause"));
          }
          break;

        case "arrowright":
        case ".":
          if (isVisualizerPage) {
            event.preventDefault();
            document.dispatchEvent(new CustomEvent("algolens:step-forward"));
          }
          break;

        case "arrowleft":
        case ",":
          if (isVisualizerPage) {
            event.preventDefault();
            document.dispatchEvent(new CustomEvent("algolens:step-backward"));
          }
          break;

        case "r":
          if (isVisualizerPage && !event.ctrlKey && !event.metaKey) {
            event.preventDefault();
            document.dispatchEvent(new CustomEvent("algolens:reset"));
          }
          break;

        case "arrowup":
        case "+":
        case "=":
          if (isVisualizerPage) {
            event.preventDefault();
            document.dispatchEvent(new CustomEvent("algolens:speed-up"));
          }
          break;

        case "arrowdown":
        case "-":
        case "_":
          if (isVisualizerPage) {
            event.preventDefault();
            document.dispatchEvent(new CustomEvent("algolens:speed-down"));
          }
          break;

        case "ctrl+home":
          if (isVisualizerPage) {
            event.preventDefault();
            document.dispatchEvent(new CustomEvent("algolens:go-to-start"));
          }
          break;

        case "ctrl+end":
          if (isVisualizerPage) {
            event.preventDefault();
            document.dispatchEvent(new CustomEvent("algolens:go-to-end"));
          }
          break;

        // Speed presets (visualizer only)
        case "1":
          if (isVisualizerPage && !event.ctrlKey && !event.metaKey) {
            event.preventDefault();
            document.dispatchEvent(
              new CustomEvent("algolens:set-speed", { detail: 0.25 })
            );
          }
          break;

        case "2":
          if (isVisualizerPage && !event.ctrlKey && !event.metaKey) {
            event.preventDefault();
            document.dispatchEvent(
              new CustomEvent("algolens:set-speed", { detail: 0.5 })
            );
          }
          break;

        case "3":
          if (isVisualizerPage && !event.ctrlKey && !event.metaKey) {
            event.preventDefault();
            document.dispatchEvent(
              new CustomEvent("algolens:set-speed", { detail: 1 })
            );
          }
          break;

        case "4":
          if (isVisualizerPage && !event.ctrlKey && !event.metaKey) {
            event.preventDefault();
            document.dispatchEvent(
              new CustomEvent("algolens:set-speed", { detail: 2 })
            );
          }
          break;

        case "5":
          if (isVisualizerPage && !event.ctrlKey && !event.metaKey) {
            event.preventDefault();
            document.dispatchEvent(
              new CustomEvent("algolens:set-speed", { detail: 4 })
            );
          }
          break;
      }
    },
    [isEnabled, navigate, location.pathname, focusSearch, handleEscape]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleGlobalKeyDown);
    return () => document.removeEventListener("keydown", handleGlobalKeyDown);
  }, [handleGlobalKeyDown]);

  return (
    <KeyboardContext.Provider
      value={{
        isEnabled,
        toggleShortcuts,
        showHints,
        setShowHints,
        currentHints,
      }}
    >
      {children}
      {showHints && createPortal(<KeyboardHintsModal />, document.body)}
    </KeyboardContext.Provider>
  );
}

// Keyboard hints modal - simple function to prevent issues
function KeyboardHintsModal() {
  const { setShowHints } = useKeyboard();
  const location = useLocation();

  // Close on background click with proper event handling
  const handleBackgroundClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        setShowHints(false);
      }
    },
    [setShowHints]
  );

  const allShortcuts = [
    {
      category: "Navigation",
      shortcuts: [
        { key: "H", description: "Go to Home" },
        { key: "A", description: "Go to Algorithms" },
        { key: "Ctrl+K", description: "Focus Search" },
        { key: "?", description: "Show/Hide Help" },
        { key: "Esc", description: "Close Modals" },
      ],
    },
    ...(location.pathname.includes("/algorithm")
      ? [
          {
            category: "Algorithm Controls",
            shortcuts: [
              { key: "Space", description: "Play/Pause" },
              { key: "→", description: "Step Forward" },
              { key: "←", description: "Step Backward" },
              { key: "R", description: "Reset" },
              { key: "+/-", description: "Speed Control" },
            ],
          },
          {
            category: "Export",
            shortcuts: [
              { key: "Ctrl+Shift+I", description: "Export Image" },
              { key: "Ctrl+Shift+V", description: "Export Video" },
              { key: "Ctrl+Shift+C", description: "Export Code" },
            ],
          },
        ]
      : []),
    {
      category: "Quick Actions",
      shortcuts: [
        { key: "Q+S", description: "Quick Sort" },
        { key: "Q+M", description: "Merge Sort" },
        { key: "Q+B", description: "Bubble Sort" },
        { key: "Q+H", description: "Heap Sort" },
      ],
    },
  ];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleBackgroundClick}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              ⌨️ Keyboard Shortcuts
            </h2>
            <button
              onClick={() => setShowHints(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-xl"
            >
              ✕
            </button>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {allShortcuts.map((section) => (
              <div key={section.category} className="space-y-3">
                <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200">
                  {section.category}
                </h3>
                <div className="space-y-2">
                  {section.shortcuts.map((shortcut) => (
                    <div
                      key={shortcut.key}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {shortcut.description}
                      </span>
                      <kbd className="px-2 py-1 text-xs font-mono bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded border">
                        {shortcut.key}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              Press{" "}
              <kbd className="px-1 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 rounded">
                ?
              </kbd>{" "}
              or{" "}
              <kbd className="px-1 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 rounded">
                Esc
              </kbd>{" "}
              to close
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Utility functions
function normalizeKey(key: string): string {
  return key.toLowerCase().replace(/\s+/g, "");
}

function getKeyString(event: KeyboardEvent): string {
  const parts: string[] = [];

  if (event.ctrlKey) parts.push("ctrl");
  if (event.metaKey) parts.push("cmd");
  if (event.altKey) parts.push("alt");
  if (event.shiftKey && event.key !== "Shift") parts.push("shift");

  parts.push(event.key);

  return parts.join("+");
}
