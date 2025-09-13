import { X, Keyboard } from "lucide-react";
import React, { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

import { cn } from "@/utils";

interface KeyboardShortcutsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KeyboardShortcutsPanel({
  isOpen,
  onClose,
}: KeyboardShortcutsPanelProps) {
  const location = useLocation();
  const modalRef = useRef<HTMLDivElement | null>(null);

  // Add click-outside functionality
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Get context-aware shortcuts based on current page
  const isVisualizerPage = location.pathname.includes("/viz/");
  const isHomePage = location.pathname === "/";

  const getContextualShortcuts = () => {
    if (isVisualizerPage) {
      return {
        "Visualizer Controls": [
          { key: "Space", description: "Play/Pause animation" },
          { key: "→", description: "Step forward" },
          { key: "←", description: "Step backward" },
          { key: "↑", description: "Increase speed" },
          { key: "↓", description: "Decrease speed" },
          { key: "R", description: "Reset animation" },
          { key: "Ctrl+Home", description: "Go to start" },
          { key: "Ctrl+End", description: "Go to end" },
        ],
        "Speed Presets": [
          { key: "1", description: "Set speed to 0.25×" },
          { key: "2", description: "Set speed to 0.5×" },
          { key: "3", description: "Set speed to 1×" },
          { key: "4", description: "Set speed to 2×" },
          { key: "5", description: "Set speed to 4×" },
        ],
        Navigation: [
          { key: "H", description: "Go to homepage" },
          { key: "Esc", description: "Exit/close panels" },
        ],
        Interface: [
          { key: "T", description: "Toggle theme" },
          { key: "F", description: "Toggle fullscreen" },
          { key: "?", description: "Show/hide shortcuts" },
        ],
      };
    } else if (isHomePage) {
      return {
        Navigation: [
          { key: "V", description: "Go to visualizer" },
          { key: "/", description: "Focus search" },
          { key: "Ctrl+K", description: "Quick search" },
        ],
        Interface: [
          { key: "T", description: "Toggle theme" },
          { key: "F", description: "Toggle fullscreen" },
          { key: "?", description: "Show/hide shortcuts" },
        ],
      };
    } else {
      return {
        Navigation: [
          { key: "H", description: "Go to homepage" },
          { key: "V", description: "Go to visualizer" },
          { key: "/", description: "Focus search" },
          { key: "Ctrl+K", description: "Quick search" },
        ],
        Interface: [
          { key: "T", description: "Toggle theme" },
          { key: "F", description: "Toggle fullscreen" },
          { key: "?", description: "Show/hide shortcuts" },
          { key: "Esc", description: "Exit/close panels" },
        ],
      };
    }
  };

  const shortcuts = getContextualShortcuts();

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
      <div
        ref={modalRef}
        className="bg-white dark:bg-slate-900 rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Keyboard className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Keyboard Shortcuts
              {isVisualizerPage && (
                <span className="ml-2 text-sm text-blue-600 dark:text-blue-400">
                  (Visualizer Mode)
                </span>
              )}
              {isHomePage && (
                <span className="ml-2 text-sm text-green-600 dark:text-green-400">
                  (Home Page)
                </span>
              )}
            </h2>
          </div>
          <button
            onClick={onClose}
            className={cn(
              "p-2 rounded-lg",
              "hover:bg-slate-100 dark:hover:bg-slate-800",
              "transition-colors"
            )}
            title="Close shortcuts panel"
            aria-label="Close shortcuts panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-8">
          {Object.entries(shortcuts).map(([category, categoryShortcuts]) => (
            <div key={category}>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-primary-600 rounded-full" />
                {category}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {categoryShortcuts.map(
                  (
                    shortcut: { key: string; description: string },
                    index: number
                  ) => (
                    <div
                      key={index}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-lg",
                        "bg-slate-50 dark:bg-slate-800/50",
                        "border border-slate-200 dark:border-slate-700",
                        "hover:bg-slate-100 dark:hover:bg-slate-800/70",
                        "transition-colors"
                      )}
                    >
                      <span className="text-slate-600 dark:text-slate-300 text-sm">
                        {shortcut.description}
                      </span>
                      <kbd
                        className={cn(
                          "px-2 py-1 rounded",
                          "bg-slate-200 dark:bg-slate-700",
                          "text-slate-800 dark:text-slate-200",
                          "text-xs font-mono border",
                          "border-slate-300 dark:border-slate-600",
                          "shadow-sm"
                        )}
                      >
                        {shortcut.key}
                      </kbd>
                    </div>
                  )
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <div className="text-blue-600 dark:text-blue-400 text-xl">💡</div>
            <div>
              <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-1">
                Pro Tips
              </h4>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• Press ? anytime to toggle this panel</li>
                <li>• Press Esc to close panels or exit modes</li>
                <li>• Click outside this panel to close it</li>
                {isVisualizerPage && (
                  <li>• Use number keys 1-5 for quick speed control</li>
                )}
                <li>• Shortcuts are context-aware and change per page</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function KeyboardShortcutsButton() {
  const [isOpen, setIsOpen] = React.useState(false);

  // Listen for keyboard shortcut to open/close
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "?" && !event.ctrlKey && !event.metaKey) {
        // Check if we're not in an input field
        const target = event.target as HTMLElement;
        if (
          target.tagName !== "INPUT" &&
          target.tagName !== "TEXTAREA" &&
          !target.isContentEditable
        ) {
          event.preventDefault();
          setIsOpen((prev) => !prev);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-4 right-16 z-30",
          "bg-blue-600 hover:bg-blue-700 text-white",
          "p-3 rounded-full shadow-lg",
          "transition-all duration-200",
          "flex items-center gap-2"
        )}
        title="Show Keyboard Shortcuts (?)"
      >
        <Keyboard className="w-5 h-5" />
      </button>
      <KeyboardShortcutsPanel
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}
