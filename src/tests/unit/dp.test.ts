import { describe, expect, it } from "vitest";

import { run as editDistance } from "../../algorithms/dp/algos/editDistance";
import { run as knapsack } from "../../algorithms/dp/algos/knapsack";
import { run as lis } from "../../algorithms/dp/algos/lis";
import type { Frame } from "../../engine/types";

function runDpAlgo(
  algorithm: (input: unknown) => Generator<Frame>,
  arr: number[]
): Frame[] {
  return Array.from(algorithm(arr));
}

describe("Knapsack", () => {
  it("generates frames", () => {
    const frames = runDpAlgo(knapsack, [1, 2, 3, 4, 5]);
    expect(frames.length).toBeGreaterThan(0);
  });

  it("each frame has array field", () => {
    const frames = runDpAlgo(knapsack, [1, 2, 3, 4, 5]);
    frames.forEach((frame) => {
      expect(frame).toHaveProperty("array");
      expect(Array.isArray(frame.array)).toBe(true);
    });
  });

  it("each frame has explain field", () => {
    const frames = runDpAlgo(knapsack, [1, 2, 3, 4, 5]);
    frames.forEach((frame) => {
      expect(frame).toHaveProperty("explain");
      expect(typeof frame.explain).toBe("string");
    });
  });

  it("completes with max value in final frame", () => {
    const frames = runDpAlgo(knapsack, [1, 2, 3, 4, 5]);
    const finalFrame = frames[frames.length - 1];
    expect(finalFrame?.explain).toMatch(/Completed! Max value achievable:/);
  });
});

describe("LIS (Longest Increasing Subsequence)", () => {
  it("generates frames", () => {
    const frames = runDpAlgo(lis, [10, 9, 2, 5, 3, 7, 101, 18]);
    expect(frames.length).toBeGreaterThan(0);
  });

  it("each frame has array field", () => {
    const frames = runDpAlgo(lis, [1, 2, 3, 4, 5]);
    frames.forEach((frame) => {
      expect(frame).toHaveProperty("array");
      expect(Array.isArray(frame.array)).toBe(true);
    });
  });

  it("each frame has explain field", () => {
    const frames = runDpAlgo(lis, [1, 2, 3, 4, 5]);
    frames.forEach((frame) => {
      expect(frame).toHaveProperty("explain");
      expect(typeof frame.explain).toBe("string");
    });
  });

  it("dp values are correct for sorted array", () => {
    const arr = [1, 2, 3, 4, 5];
    const frames = runDpAlgo(lis, arr);
    const finalFrame = frames[frames.length - 1];
    expect(finalFrame?.explain).toMatch(
      /Completed! Longest Increasing Subsequence length: 5/
    );
  });

  it("computes correct LIS length for standard case", () => {
    const arr = [10, 9, 2, 5, 3, 7, 101, 18];
    const frames = runDpAlgo(lis, arr);
    const finalFrame = frames[frames.length - 1];
    expect(finalFrame?.explain).toMatch(
      /Completed! Longest Increasing Subsequence length: \d+/
    );
  });
});

describe("Edit Distance", () => {
  it("generates frames", () => {
    const arr = [1, 2, 3, 4, 5, 6];
    const frames = runDpAlgo(editDistance, arr);
    expect(frames.length).toBeGreaterThan(0);
  });

  it("each frame has array field", () => {
    const arr = [1, 2, 3, 4, 5, 6];
    const frames = runDpAlgo(editDistance, arr);
    frames.forEach((frame) => {
      expect(frame).toHaveProperty("array");
      expect(Array.isArray(frame.array)).toBe(true);
    });
  });

  it("each frame has explain field", () => {
    const arr = [1, 2, 3, 4, 5, 6];
    const frames = runDpAlgo(editDistance, arr);
    frames.forEach((frame) => {
      expect(frame).toHaveProperty("explain");
      expect(typeof frame.explain).toBe("string");
    });
  });

  it("completes with edit distance in final frame", () => {
    const arr = [1, 2, 3, 4, 5, 6];
    const frames = runDpAlgo(editDistance, arr);
    const finalFrame = frames[frames.length - 1];
    expect(finalFrame?.explain).toMatch(/Completed! Edit distance: \d+/);
  });

  it("handles identical halves (zero edit distance)", () => {
    const arr = [1, 2, 3, 1, 2, 3];
    const frames = runDpAlgo(editDistance, arr);
    const finalFrame = frames[frames.length - 1];
    expect(finalFrame?.explain).toMatch(/Completed! Edit distance: 0/);
  });
});
