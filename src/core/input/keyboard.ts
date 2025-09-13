/**
 * Keyboard shortcuts system for AlgoLens
 * Provides comprehensive keyboard navigation and shortcuts
 */

import { useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

// Keyboard shortcut definitions
export const SHORTCUTS = {
  // Navigation
  HOME: ["h", "Home"] as string[],
  ALGORITHMS: ["a", "alt+a"] as string[],
  SEARCH: ["/", "ctrl+k", "cmd+k"] as string[],
  HELP: ["?", "F1"] as string[],

  // Algorithm controls
  PLAY_PAUSE: [" ", "Space"] as string[],
  STEP_FORWARD: ["ArrowRight", "."] as string[],
  STEP_BACKWARD: ["ArrowLeft", ","] as string[],
  RESET: ["r", "ctrl+r"] as string[],
  SPEED_UP: ["+", "="] as string[],
  SPEED_DOWN: ["-", "_"] as string[],

  // UI controls
  TOGGLE_SIDEBAR: ["s", "ctrl+b"] as string[],
  TOGGLE_DARK_MODE: ["d", "ctrl+shift+d"] as string[],
  FULLSCREEN: ["f", "F11"] as string[],
  ESCAPE: ["Escape"] as string[],

  // Export
  EXPORT_IMAGE: ["ctrl+shift+i", "cmd+shift+i"] as string[],
  EXPORT_VIDEO: ["ctrl+shift+v", "cmd+shift+v"] as string[],
  EXPORT_CODE: ["ctrl+shift+c", "cmd+shift+c"] as string[],

  // Focus management
  FOCUS_NEXT: ["Tab"] as string[],
  FOCUS_PREV: ["shift+Tab"] as string[],

  // Quick actions
  QUICK_SORT: ["q+s"] as string[],
  MERGE_SORT: ["q+m"] as string[],
  BUBBLE_SORT: ["q+b"] as string[],
  HEAP_SORT: ["q+h"] as string[],

  // Accessibility
  ANNOUNCE_STATE: ["ctrl+shift+a", "cmd+shift+a"] as string[],
  TOGGLE_VOICE: ["v", "ctrl+shift+v"] as string[],
};

// Shortcut context type
interface ShortcutContext {
  isInputFocused: boolean;
  isModalOpen: boolean;
  isPlaying: boolean;
  currentPage: string;
}

// Keyboard shortcut hook
export function useKeyboardShortcuts(context: Partial<ShortcutContext> = {}) {
  const navigate = useNavigate();
  const shortcutRef = useRef<Map<string, () => void>>(new Map());

  // Register shortcut handlers
  const registerShortcut = useCallback(
    (
      keys: string | string[],
      handler: () => void,
      options: { preventDefault?: boolean; stopPropagation?: boolean } = {}
    ) => {
      const keyArray = Array.isArray(keys) ? keys : [keys];

      keyArray.forEach((key) => {
        shortcutRef.current.set(normalizeKey(key), () => {
          if (options.preventDefault !== false) {
            // preventDefault will be handled in the event listener
          }
          handler();
        });
      });
    },
    []
  );

  // Handle key combinations
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const { isInputFocused = false } = context;

      // Don't handle shortcuts when typing in inputs (except specific ones)
      if (isInputFocused && !isGlobalShortcut(event)) {
        return;
      }

      const key = normalizeKey(getKeyString(event));
      const handler = shortcutRef.current.get(key);

      if (handler) {
        event.preventDefault();
        event.stopPropagation();
        handler();
      }
    },
    [context]
  );

  // Set up event listeners
  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Default shortcut handlers
  useEffect(() => {
    // Navigation shortcuts
    registerShortcut(SHORTCUTS.HOME, () => navigate("/"));
    registerShortcut(SHORTCUTS.ALGORITHMS, () => navigate("/algorithms"));

    // Search shortcut
    registerShortcut(SHORTCUTS.SEARCH, () => {
      const searchInput = document.querySelector(
        "[data-search-input]"
      ) as HTMLInputElement;
      if (searchInput) {
        searchInput.focus();
        searchInput.select();
      }
    });

    // Help shortcut
    registerShortcut(SHORTCUTS.HELP, () => {
      showHelpModal();
    });

    // Escape shortcut
    registerShortcut(SHORTCUTS.ESCAPE, () => {
      // Close modals, clear focus, etc.
      const activeElement = document.activeElement as HTMLElement;
      if (activeElement && activeElement.blur) {
        activeElement.blur();
      }

      // Close any open modals
      const modals = document.querySelectorAll("[data-modal]");
      modals.forEach((modal) => {
        const closeButton = modal.querySelector(
          "[data-modal-close]"
        ) as HTMLElement;
        if (closeButton) closeButton.click();
      });
    });

    // Accessibility shortcuts
    registerShortcut(SHORTCUTS.ANNOUNCE_STATE, () => {
      announceCurrentState();
    });
  }, [navigate, registerShortcut]);

  return { registerShortcut };
}

// Algorithm control hooks
export function useAlgorithmShortcuts(controls: {
  play?: () => void;
  pause?: () => void;
  step?: () => void;
  reset?: () => void;
  speedUp?: () => void;
  speedDown?: () => void;
  isPlaying?: boolean;
}) {
  const { registerShortcut } = useKeyboardShortcuts();

  useEffect(() => {
    if (controls.play && controls.pause) {
      registerShortcut(SHORTCUTS.PLAY_PAUSE, () => {
        if (controls.isPlaying) {
          controls.pause?.();
        } else {
          controls.play?.();
        }
      });
    }

    if (controls.step) {
      registerShortcut(SHORTCUTS.STEP_FORWARD, controls.step);
    }

    if (controls.reset) {
      registerShortcut(SHORTCUTS.RESET, controls.reset);
    }

    if (controls.speedUp) {
      registerShortcut(SHORTCUTS.SPEED_UP, controls.speedUp);
    }

    if (controls.speedDown) {
      registerShortcut(SHORTCUTS.SPEED_DOWN, controls.speedDown);
    }
  }, [controls, registerShortcut]);
}

// Export shortcuts hook
export function useExportShortcuts(exportHandlers: {
  exportImage?: () => void;
  exportVideo?: () => void;
  exportCode?: () => void;
}) {
  const { registerShortcut } = useKeyboardShortcuts();

  useEffect(() => {
    if (exportHandlers.exportImage) {
      registerShortcut(SHORTCUTS.EXPORT_IMAGE, exportHandlers.exportImage);
    }

    if (exportHandlers.exportVideo) {
      registerShortcut(SHORTCUTS.EXPORT_VIDEO, exportHandlers.exportVideo);
    }

    if (exportHandlers.exportCode) {
      registerShortcut(SHORTCUTS.EXPORT_CODE, exportHandlers.exportCode);
    }
  }, [exportHandlers, registerShortcut]);
}

// Focus management hook
export function useFocusManagement() {
  const focusableElements = useRef<HTMLElement[]>([]);

  // Get all focusable elements
  const updateFocusableElements = useCallback(() => {
    const selectors = [
      "button:not([disabled])",
      "input:not([disabled])",
      "select:not([disabled])",
      "textarea:not([disabled])",
      "a[href]",
      '[tabindex]:not([tabindex="-1"])',
    ].join(",");

    focusableElements.current = Array.from(
      document.querySelectorAll(selectors)
    ) as HTMLElement[];
  }, []);

  // Focus next element
  const focusNext = useCallback(() => {
    updateFocusableElements();
    const current = document.activeElement as HTMLElement;
    const currentIndex = focusableElements.current.indexOf(current);
    const nextIndex = (currentIndex + 1) % focusableElements.current.length;
    focusableElements.current[nextIndex]?.focus();
  }, [updateFocusableElements]);

  // Focus previous element
  const focusPrevious = useCallback(() => {
    updateFocusableElements();
    const current = document.activeElement as HTMLElement;
    const currentIndex = focusableElements.current.indexOf(current);
    const prevIndex =
      currentIndex <= 0
        ? focusableElements.current.length - 1
        : currentIndex - 1;
    focusableElements.current[prevIndex]?.focus();
  }, [updateFocusableElements]);

  const { registerShortcut } = useKeyboardShortcuts();

  useEffect(() => {
    registerShortcut(SHORTCUTS.FOCUS_NEXT, focusNext);
    registerShortcut(SHORTCUTS.FOCUS_PREV, focusPrevious);
  }, [focusNext, focusPrevious, registerShortcut]);

  return { focusNext, focusPrevious, updateFocusableElements };
}

// Quick algorithm selection hook
export function useQuickAlgorithmSelection() {
  const navigate = useNavigate();
  const { registerShortcut } = useKeyboardShortcuts();

  useEffect(() => {
    registerShortcut(SHORTCUTS.QUICK_SORT, () => {
      navigate("/algorithms/quick-sort");
    });

    registerShortcut(SHORTCUTS.MERGE_SORT, () => {
      navigate("/algorithms/merge-sort");
    });

    registerShortcut(SHORTCUTS.BUBBLE_SORT, () => {
      navigate("/algorithms/bubble-sort");
    });

    registerShortcut(SHORTCUTS.HEAP_SORT, () => {
      navigate("/algorithms/heap-sort");
    });
  }, [navigate, registerShortcut]);
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

function isGlobalShortcut(event: KeyboardEvent): boolean {
  const globalKeys = ["Escape", "F1", "F11", "Tab"];

  const hasModifier = event.ctrlKey || event.metaKey || event.altKey;
  const isGlobalKey = globalKeys.includes(event.key);

  return hasModifier || isGlobalKey;
}

function showHelpModal() {
  // Create or show help modal
  let modal = document.querySelector("[data-help-modal]");

  if (!modal) {
    modal = document.createElement("div");
    modal.setAttribute("data-help-modal", "true");
    modal.setAttribute("data-modal", "true");
    modal.className =
      "fixed inset-0 z-50 flex items-center justify-center bg-black/50";

    modal.innerHTML = `
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl max-h-[80vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold">Keyboard Shortcuts</h2>
          <button data-modal-close class="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          ${generateShortcutHelp()}
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Close on outside click
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal?.remove();
      }
    });

    // Close button
    const closeButton = modal.querySelector("[data-modal-close]");
    closeButton?.addEventListener("click", () => modal?.remove());
  }

  modal.classList.remove("hidden");
}

function generateShortcutHelp(): string {
  const sections = [
    {
      title: "Navigation",
      shortcuts: [
        { keys: "H", description: "Go to Home" },
        { keys: "A", description: "Go to Algorithms" },
        { keys: "Ctrl+K", description: "Focus Search" },
        { keys: "?", description: "Show Help" },
      ],
    },
    {
      title: "Algorithm Controls",
      shortcuts: [
        { keys: "Space", description: "Play/Pause" },
        { keys: "→", description: "Step Forward" },
        { keys: "←", description: "Step Backward" },
        { keys: "R", description: "Reset" },
        { keys: "+/-", description: "Speed Control" },
      ],
    },
    {
      title: "Export",
      shortcuts: [
        { keys: "Ctrl+Shift+I", description: "Export Image" },
        { keys: "Ctrl+Shift+V", description: "Export Video" },
        { keys: "Ctrl+Shift+C", description: "Export Code" },
      ],
    },
  ];

  return sections
    .map(
      (section) => `
    <div>
      <h3 class="font-semibold mb-2">${section.title}</h3>
      ${section.shortcuts
        .map(
          (shortcut) => `
        <div class="flex justify-between py-1">
          <span class="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">${shortcut.keys}</span>
          <span>${shortcut.description}</span>
        </div>
      `
        )
        .join("")}
    </div>
  `
    )
    .join("");
}

function announceCurrentState() {
  // Announce current page and state for screen readers
  const currentUrl = window.location.pathname;
  const pageTitle = document.title;

  const announcement = `Current page: ${pageTitle}. URL: ${currentUrl}`;

  // Create announcement element
  const announcer = document.createElement("div");
  announcer.setAttribute("aria-live", "polite");
  announcer.setAttribute("aria-atomic", "true");
  announcer.className = "sr-only";
  announcer.textContent = announcement;

  document.body.appendChild(announcer);

  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcer);
  }, 1000);
}

// Shortcut hint component data
export function getShortcutHints(context: string) {
  const hints: Record<string, Array<{ key: string; description: string }>> = {
    home: [
      { key: "A", description: "Browse Algorithms" },
      { key: "Ctrl+K", description: "Search" },
      { key: "?", description: "Help" },
    ],
    algorithm: [
      { key: "Space", description: "Play/Pause" },
      { key: "→", description: "Step Forward" },
      { key: "R", description: "Reset" },
      { key: "Ctrl+Shift+I", description: "Export" },
    ],
    search: [
      { key: "Enter", description: "Select Result" },
      { key: "↑↓", description: "Navigate Results" },
      { key: "Escape", description: "Close" },
    ],
  };

  return hints[context] || [];
}
