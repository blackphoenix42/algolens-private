// Test setup file for vitest
import "@testing-library/jest-dom";

import { cleanup } from "@testing-library/react";
import { afterEach, beforeAll, vi } from "vitest";

// Always unmount React trees between tests to prevent cross-test leakage.
afterEach(() => {
  cleanup();
});

beforeAll(() => {
  // matchMedia is used by useOrientation, theme hooks, and Tailwind responsive guards.
  if (typeof window !== "undefined" && !("matchMedia" in window)) {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      configurable: true,
      value: (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: () => false,
      }),
    });
  }

  // Minimal ResizeObserver stub – used by Recharts / canvas resize logic.
  class StubObserver {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
    takeRecords(): unknown[] {
      return [];
    }
  }

  if (typeof window !== "undefined") {
    if (!("ResizeObserver" in window)) {
      (
        window as unknown as { ResizeObserver: typeof StubObserver }
      ).ResizeObserver = StubObserver;
    }
    if (!("IntersectionObserver" in window)) {
      (
        window as unknown as { IntersectionObserver: typeof StubObserver }
      ).IntersectionObserver = StubObserver;
    }
    // jsdom doesn't implement scrollTo; some panels call it during effects.
    if (typeof window.scrollTo !== "function") {
      window.scrollTo = (() => {}) as typeof window.scrollTo;
    }
  }
});
