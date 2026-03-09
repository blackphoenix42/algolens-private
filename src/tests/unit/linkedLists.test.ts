import { describe, expect, it } from "vitest";

import { run as linkedListReverse } from "../../algorithms/linked-lists/algos/linkedListReverse";
import { run as linkedListTraversal } from "../../algorithms/linked-lists/algos/linkedListTraversal";
import type { Frame } from "../../engine/types";

function runLinkedListAlgo(
  algorithm: (input: unknown) => Generator<Frame>,
  arr: number[]
): Frame[] {
  return Array.from(algorithm(arr));
}

describe("Linked List Traversal", () => {
  it("generates frames", () => {
    const frames = runLinkedListAlgo(linkedListTraversal, [1, 2, 3, 4, 5]);
    expect(frames.length).toBeGreaterThan(0);
  });

  it("visits all elements", () => {
    const arr = [1, 2, 3];
    const frames = runLinkedListAlgo(linkedListTraversal, arr);
    const finalFrame = frames[frames.length - 1];
    expect(finalFrame?.explain).toContain("Traversal completed!");
    expect(finalFrame?.explain).toContain("1, 2, 3");
  });

  it("each frame has array field", () => {
    const frames = runLinkedListAlgo(linkedListTraversal, [1, 2, 3]);
    frames.forEach((frame) => {
      expect(frame).toHaveProperty("array");
      expect(Array.isArray(frame.array)).toBe(true);
    });
  });

  it("each frame has explain field", () => {
    const frames = runLinkedListAlgo(linkedListTraversal, [1, 2, 3]);
    frames.forEach((frame) => {
      expect(frame).toHaveProperty("explain");
      expect(typeof frame.explain).toBe("string");
    });
  });

  it("proper frame structure with highlights", () => {
    const frames = runLinkedListAlgo(linkedListTraversal, [1, 2, 3]);
    const frameWithHighlights = frames.find(
      (f) => f.highlights && (f.highlights.indices?.length ?? 0) > 0
    );
    expect(frameWithHighlights).toBeDefined();
  });
});

describe("Linked List Reverse", () => {
  it("generates frames", () => {
    const frames = runLinkedListAlgo(linkedListReverse, [1, 2, 3, 4, 5]);
    expect(frames.length).toBeGreaterThan(0);
  });

  it("each frame has array field", () => {
    const frames = runLinkedListAlgo(linkedListReverse, [1, 2, 3]);
    frames.forEach((frame) => {
      expect(frame).toHaveProperty("array");
      expect(Array.isArray(frame.array)).toBe(true);
    });
  });

  it("each frame has explain field", () => {
    const frames = runLinkedListAlgo(linkedListReverse, [1, 2, 3]);
    frames.forEach((frame) => {
      expect(frame).toHaveProperty("explain");
      expect(typeof frame.explain).toBe("string");
    });
  });

  it("proper frame structure", () => {
    const arr = [1, 2, 3];
    const frames = runLinkedListAlgo(linkedListReverse, arr);
    const finalFrame = frames[frames.length - 1];
    expect(finalFrame?.explain).toContain("reversal completed");
    expect(finalFrame?.array).toBeDefined();
    expect(finalFrame!.array!.length).toBe(arr.length);
  });

  it("correctly reverses the array", () => {
    const frames = runLinkedListAlgo(linkedListReverse, [1, 2, 3, 4, 5]);
    const finalFrame = frames[frames.length - 1];
    expect(finalFrame!.array).toEqual([5, 4, 3, 2, 1]);
  });

  it("correctly reverses a two-element array", () => {
    const frames = runLinkedListAlgo(linkedListReverse, [10, 20]);
    const finalFrame = frames[frames.length - 1];
    expect(finalFrame!.array).toEqual([20, 10]);
  });

  it("handles single-element array", () => {
    const frames = runLinkedListAlgo(linkedListReverse, [42]);
    const finalFrame = frames[frames.length - 1];
    expect(finalFrame!.array).toEqual([42]);
  });
});
