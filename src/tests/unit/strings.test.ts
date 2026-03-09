import { describe, expect, it } from "vitest";

import { run as kmpSearch } from "../../algorithms/strings/algos/kmpSearch";
import { run as rabinKarp } from "../../algorithms/strings/algos/rabinKarp";
import type { Frame } from "../../engine/types";

function runStringAlgo(
  algorithm: (input: unknown) => Generator<Frame>,
  arr: number[]
): Frame[] {
  return Array.from(algorithm(arr));
}

describe("KMP Search", () => {
  it("generates frames", () => {
    const arr = [1, 2, 3, 4, 5, 1, 2, 3, 6];
    const frames = runStringAlgo(kmpSearch, arr);
    expect(frames.length).toBeGreaterThan(0);
  });

  it("finds pattern in text", () => {
    const arr = [1, 2, 3, 4, 5, 1, 2, 3, 6];
    const frames = runStringAlgo(kmpSearch, arr);
    const foundFrame = frames.find((f) =>
      f.explain?.includes("Pattern found at text position")
    );
    expect(foundFrame).toBeDefined();
  });

  it("handles no match", () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const frames = runStringAlgo(kmpSearch, arr);
    const completedFrame = frames.find((f) =>
      f.explain?.includes("KMP search completed")
    );
    expect(completedFrame).toBeDefined();
  });

  it("each frame has array and explain", () => {
    const arr = [1, 2, 3, 4, 5, 1, 2, 3, 6];
    const frames = runStringAlgo(kmpSearch, arr);
    frames.forEach((frame) => {
      expect(frame).toHaveProperty("array");
      expect(frame).toHaveProperty("explain");
      expect(Array.isArray(frame.array)).toBe(true);
      expect(typeof frame.explain).toBe("string");
    });
  });
});

describe("Rabin-Karp Search", () => {
  it("generates frames", () => {
    const arr = [1, 2, 3, 4, 5, 1, 2, 3, 6];
    const frames = runStringAlgo(rabinKarp, arr);
    expect(frames.length).toBeGreaterThan(0);
  });

  it("finds pattern in text", () => {
    const arr = [1, 2, 3, 4, 5, 1, 2, 3, 6];
    const frames = runStringAlgo(rabinKarp, arr);
    const foundFrame = frames.find((f) =>
      f.explain?.includes("pattern found at position")
    );
    expect(foundFrame).toBeDefined();
  });

  it("handles no match", () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const frames = runStringAlgo(rabinKarp, arr);
    const completedFrame = frames.find((f) =>
      f.explain?.includes("Rabin-Karp search completed")
    );
    expect(completedFrame).toBeDefined();
  });

  it("each frame has array and explain", () => {
    const arr = [1, 2, 3, 4, 5, 1, 2, 3, 6];
    const frames = runStringAlgo(rabinKarp, arr);
    frames.forEach((frame) => {
      expect(frame).toHaveProperty("array");
      expect(frame).toHaveProperty("explain");
      expect(Array.isArray(frame.array)).toBe(true);
      expect(typeof frame.explain).toBe("string");
    });
  });
});
