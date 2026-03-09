import { describe, expect, it } from "vitest";

import { run as exponentialSearch } from "../../algorithms/searching/algos/exponentialSearch";
import { run as interpolationSearch } from "../../algorithms/searching/algos/interpolationSearch";
import { run as ternarySearch } from "../../algorithms/searching/algos/ternarySearch";
import type { Frame } from "../../engine/types";

function runSearch(
  algorithm: (input: unknown) => Generator<Frame>,
  input: { array: number[]; target: number }
): Frame[] {
  return Array.from(algorithm(input));
}

describe("Interpolation Search", () => {
  it("finds element that exists in sorted array", () => {
    const frames = runSearch(interpolationSearch, {
      array: [1, 2, 3, 4, 5],
      target: 3,
    });
    expect(frames.length).toBeGreaterThan(0);
    const foundFrame = frames.find((f) =>
      f.explain?.includes("Found target 3 at index")
    );
    expect(foundFrame).toBeDefined();
  });

  it("handles element not found", () => {
    const frames = runSearch(interpolationSearch, {
      array: [1, 2, 4, 5, 6],
      target: 3,
    });
    const notFoundFrame = frames.find((f) =>
      f.explain?.includes("not found in the array")
    );
    expect(notFoundFrame).toBeDefined();
  });

  it("handles single element array", () => {
    const frames = runSearch(interpolationSearch, {
      array: [42],
      target: 42,
    });
    expect(frames.length).toBeGreaterThan(0);
    const foundFrame = frames.find((f) =>
      f.explain?.includes("Found target 42 at index")
    );
    expect(foundFrame).toBeDefined();
  });

  it("generates proper frames with array and explain", () => {
    const frames = runSearch(interpolationSearch, {
      array: [1, 2, 3, 4, 5],
      target: 4,
    });
    frames.forEach((frame) => {
      expect(frame).toHaveProperty("array");
      expect(frame).toHaveProperty("explain");
      expect(Array.isArray(frame.array)).toBe(true);
      expect(typeof frame.explain).toBe("string");
    });
  });

  it("each frame has highlights", () => {
    const frames = runSearch(interpolationSearch, {
      array: [1, 2, 3, 4, 5],
      target: 3,
    });
    expect(frames.length).toBeGreaterThan(0);
    const frameWithHighlights = frames.find(
      (f) => f.highlights && Object.keys(f.highlights).length > 0
    );
    expect(frameWithHighlights).toBeDefined();
  });
});

describe("Ternary Search", () => {
  it("finds element that exists in sorted array", () => {
    const frames = runSearch(ternarySearch, {
      array: [1, 2, 3, 4, 5],
      target: 3,
    });
    const foundFrame = frames.find((f) =>
      f.explain?.includes("Found target 3 at index")
    );
    expect(foundFrame).toBeDefined();
  });

  it("handles element not found", () => {
    const frames = runSearch(ternarySearch, {
      array: [1, 2, 4, 5, 6],
      target: 3,
    });
    const notFoundFrame = frames.find((f) =>
      f.explain?.includes("not found in the array")
    );
    expect(notFoundFrame).toBeDefined();
  });

  it("handles single element array", () => {
    const frames = runSearch(ternarySearch, {
      array: [42],
      target: 42,
    });
    expect(frames.length).toBeGreaterThan(0);
    const foundFrame = frames.find((f) =>
      f.explain?.includes("Found target 42 at index")
    );
    expect(foundFrame).toBeDefined();
  });

  it("generates proper frames with array and explain", () => {
    const frames = runSearch(ternarySearch, {
      array: [1, 2, 3, 4, 5],
      target: 4,
    });
    frames.forEach((frame) => {
      expect(frame).toHaveProperty("array");
      expect(frame).toHaveProperty("explain");
      expect(Array.isArray(frame.array)).toBe(true);
      expect(typeof frame.explain).toBe("string");
    });
  });

  it("each frame has highlights", () => {
    const frames = runSearch(ternarySearch, {
      array: [1, 2, 3, 4, 5, 6, 7],
      target: 4,
    });
    const frameWithHighlights = frames.find(
      (f) => f.highlights && Object.keys(f.highlights).length > 0
    );
    expect(frameWithHighlights).toBeDefined();
  });
});

describe("Exponential Search", () => {
  it("finds element that exists in sorted array", () => {
    const frames = runSearch(exponentialSearch, {
      array: [1, 2, 3, 4, 5],
      target: 3,
    });
    const foundFrame = frames.find((f) =>
      f.explain?.includes("Found target 3 at index")
    );
    expect(foundFrame).toBeDefined();
  });

  it("handles element not found", () => {
    const frames = runSearch(exponentialSearch, {
      array: [1, 2, 4, 5, 6],
      target: 3,
    });
    const notFoundFrame = frames.find((f) =>
      f.explain?.includes("not found in the array")
    );
    expect(notFoundFrame).toBeDefined();
  });

  it("handles single element array", () => {
    const frames = runSearch(exponentialSearch, {
      array: [42],
      target: 42,
    });
    expect(frames.length).toBeGreaterThan(0);
    const foundFrame = frames.find((f) =>
      f.explain?.includes("Found target 42 at index")
    );
    expect(foundFrame).toBeDefined();
  });

  it("generates proper frames with array and explain", () => {
    const frames = runSearch(exponentialSearch, {
      array: [1, 2, 3, 4, 5],
      target: 4,
    });
    frames.forEach((frame) => {
      expect(frame).toHaveProperty("array");
      expect(frame).toHaveProperty("explain");
      expect(Array.isArray(frame.array)).toBe(true);
      expect(typeof frame.explain).toBe("string");
    });
  });

  it("each frame has highlights", () => {
    const frames = runSearch(exponentialSearch, {
      array: [1, 2, 3, 4, 5, 6, 7, 8],
      target: 5,
    });
    const frameWithHighlights = frames.find(
      (f) => f.highlights && Object.keys(f.highlights).length > 0
    );
    expect(frameWithHighlights).toBeDefined();
  });
});
