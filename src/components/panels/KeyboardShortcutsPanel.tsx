import { Keyboard, X } from "lucide-react";
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
        "Search & Navigation": [
          { key: "/", description: "Focus search bar" },
          { key: "Ctrl+K", description: "Quick search" },
          { key: "Esc", description: "Clear search/close panels" },
          { key: "V", description: "Go to visualizer" },
          { key: "Enter", description: "Search with current query" },
        ],
        "Filter Management": [
          { key: "Ctrl+Shift+C", description: "Clear all filters" },
          { key: "Ctrl+Shift+F", description: "Show featured algorithms" },
          { key: "Ctrl+Shift+E", description: "Toggle filter bar" },
          { key: "Alt+1", description: "Filter by Easy difficulty" },
          { key: "Alt+2", description: "Filter by Medium difficulty" },
          { key: "Alt+3", description: "Filter by Hard difficulty" },
        ],
        "Quick Access": [
          { key: "Ctrl+1", description: "Go to Sorting algorithms" },
          { key: "Ctrl+2", description: "Go to Searching algorithms" },
          { key: "Ctrl+3", description: "Go to Graph algorithms" },
          { key: "Ctrl+4", description: "Go to Tree algorithms" },
          { key: "Ctrl+0", description: "Reset to all algorithms" },
        ],
        "Page Controls": [
          { key: "Ctrl+H", description: "Toggle hero section" },
          { key: "Ctrl+T", description: "Start guided tour" },
          { key: "Ctrl+R", description: "Refresh algorithm catalog" },
          { key: "PageDown", description: "Scroll to next section" },
          { key: "PageUp", description: "Scroll to previous section" },
        ],
        Interface: [
          { key: "T", description: "Toggle theme" },
          { key: "F", description: "Toggle fullscreen" },
          { key: "?", description: "Show/hide shortcuts" },
          { key: "F1", description: "Show help" },
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div
        ref={modalRef}
        className="mx-4 max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-8 shadow-2xl dark:border-slate-700 dark:bg-slate-900"
      >
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 p-3 shadow-lg">
              <Keyboard className="h-7 w-7 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                Keyboard Shortcuts
              </h2>
              <p className="mt-1 text-slate-600 dark:text-slate-400">
                {isVisualizerPage && (
                  <span className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-blue-500"></span>
                    Visualizer Mode Active
                  </span>
                )}
                {isHomePage && (
                  <span className="inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-green-500"></span>
                    Home Page Mode
                  </span>
                )}
                {!isVisualizerPage && !isHomePage && (
                  <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                    General Navigation
                  </span>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={cn(
              "rounded-xl p-3 transition-all duration-200",
              "hover:bg-slate-100 dark:hover:bg-slate-800",
              "hover:scale-105 active:scale-95",
              "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            )}
            title="Close shortcuts panel"
            aria-label="Close shortcuts panel"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 xl:grid-cols-3">
          {Object.entries(shortcuts).map(([category, categoryShortcuts]) => (
            <div key={category} className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="from-primary-500 to-secondary-500 flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r">
                  <span className="text-sm font-bold text-white">
                    {category.charAt(0).toUpperCase()}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {category}
                </h3>
                <div className="from-primary-200 h-px flex-1 bg-gradient-to-r to-transparent dark:from-slate-700"></div>
              </div>
              <div className="space-y-2">
                {categoryShortcuts.map(
                  (
                    shortcut: { key: string; description: string },
                    index: number
                  ) => (
                    <div
                      key={index}
                      className={cn(
                        "group flex items-center justify-between rounded-xl p-4 transition-all duration-200",
                        "bg-gradient-to-r from-slate-50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-800/20",
                        "border border-slate-200/60 dark:border-slate-700/60",
                        "hover:from-primary-50 hover:to-secondary-50 dark:hover:from-primary-900/20 dark:hover:to-secondary-900/20",
                        "hover:border-primary-200 dark:hover:border-primary-700",
                        "hover:scale-[1.02] hover:shadow-md active:scale-[0.98]"
                      )}
                    >
                      <span className="text-sm font-medium text-slate-700 transition-colors group-hover:text-slate-900 dark:text-slate-300 dark:group-hover:text-slate-100">
                        {shortcut.description}
                      </span>
                      <kbd
                        className={cn(
                          "rounded-lg px-3 py-2 font-mono text-xs font-bold",
                          "bg-white shadow-sm dark:bg-slate-900",
                          "text-slate-800 dark:text-slate-200",
                          "border-2 border-slate-300 dark:border-slate-600",
                          "group-hover:border-primary-400 dark:group-hover:border-primary-500",
                          "group-hover:bg-primary-50 dark:group-hover:bg-primary-900/30",
                          "min-w-[3rem] text-center transition-all duration-200"
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

        <div className="mt-10 rounded-2xl border border-blue-200/60 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 shadow-lg dark:border-blue-700/60 dark:from-blue-900/30 dark:via-indigo-900/20 dark:to-purple-900/30">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 p-3 shadow-lg">
              <div className="text-xl text-white">💡</div>
            </div>
            <div className="flex-1">
              <div className="mb-3 flex items-center gap-2">
                <h4 className="text-lg font-bold text-blue-800 dark:text-blue-200">
                  Pro Tips
                </h4>
                <div className="h-px flex-1 bg-gradient-to-r from-blue-300 to-transparent dark:from-blue-600"></div>
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
                  <li className="flex items-start gap-2">
                    <span className="mt-1 text-xs text-blue-500">▶</span>
                    <span>
                      Press{" "}
                      <kbd className="rounded bg-blue-200 px-1.5 py-0.5 font-mono text-xs dark:bg-blue-800">
                        ?
                      </kbd>{" "}
                      anytime to toggle this panel
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 text-xs text-blue-500">▶</span>
                    <span>
                      Press{" "}
                      <kbd className="rounded bg-blue-200 px-1.5 py-0.5 font-mono text-xs dark:bg-blue-800">
                        Esc
                      </kbd>{" "}
                      to close panels or exit modes
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 text-xs text-blue-500">▶</span>
                    <span>Click outside this panel to close it</span>
                  </li>
                </ul>
                <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
                  {isVisualizerPage && (
                    <li className="flex items-start gap-2">
                      <span className="mt-1 text-xs text-blue-500">▶</span>
                      <span>
                        Use number keys{" "}
                        <kbd className="rounded bg-blue-200 px-1.5 py-0.5 font-mono text-xs dark:bg-blue-800">
                          1-5
                        </kbd>{" "}
                        for quick speed control
                      </span>
                    </li>
                  )}
                  {isHomePage && (
                    <>
                      <li className="flex items-start gap-2">
                        <span className="mt-1 text-xs text-green-500">▶</span>
                        <span>
                          Use{" "}
                          <kbd className="rounded bg-green-200 px-1.5 py-0.5 font-mono text-xs dark:bg-green-800">
                            Ctrl+1-4
                          </kbd>{" "}
                          to jump to algorithm categories
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-1 text-xs text-green-500">▶</span>
                        <span>
                          Filter by difficulty with{" "}
                          <kbd className="rounded bg-green-200 px-1.5 py-0.5 font-mono text-xs dark:bg-green-800">
                            Alt+1-3
                          </kbd>
                        </span>
                      </li>
                    </>
                  )}
                  <li className="flex items-start gap-2">
                    <span className="mt-1 text-xs text-blue-500">▶</span>
                    <span>Shortcuts are context-aware and change per page</span>
                  </li>
                </ul>
              </div>
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
          "group fixed right-6 bottom-6 z-50",
          "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700",
          "rounded-2xl p-4 text-white shadow-xl hover:shadow-2xl",
          "transform transition-all duration-300 hover:scale-105 active:scale-95",
          "border border-blue-500/20 backdrop-blur-sm",
          "flex min-w-[3rem] items-center gap-3 overflow-hidden"
        )}
        title="Show Keyboard Shortcuts (?)"
      >
        <Keyboard className="h-6 w-6 flex-shrink-0" />
        <span className="max-w-0 overflow-hidden text-sm font-medium whitespace-nowrap opacity-0 transition-all duration-300 group-hover:max-w-[10rem] group-hover:opacity-100">
          Shortcuts
        </span>
        <div className="absolute -top-1 -right-1 h-3 w-3 animate-pulse rounded-full bg-orange-400"></div>
      </button>
      <KeyboardShortcutsPanel
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}
