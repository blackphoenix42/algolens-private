// src/styles/z-index.ts
/**
 * Centralized z-index management to prevent conflicts
 */

export const Z_INDEX = {
  // Background layers
  BASE: 1,
  STICKY_HEADER: 30,
  DROPDOWN: 40,

  // Overlay layers
  TOOLTIP: 50,
  MODAL_BACKDROP: 60,
  MODAL: 70,

  // Notification layers
  TOAST: 80,
  NOTIFICATION: 90,

  // Highest priority
  MODAL_KEYBOARD_HINTS: 100,
  DEBUG_OVERLAY: 999,
} as const;

export type ZIndexKey = keyof typeof Z_INDEX;
