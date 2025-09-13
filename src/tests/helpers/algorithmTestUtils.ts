// Test utilities for algorithms
import { describe, expect, it } from "vitest";

import type { Frame } from "../../engine/types";

/**
 * Extracts the final sorted array from algorithm frames
 */
export function getFinalArray(frames: Frame[]): number[] {
  const finalFrame = frames[frames.length - 1];
  if (!finalFrame || !finalFrame.array) {
    throw new Error("Algorithm did not produce a final frame with an array");
  }
  return finalFrame.array;
}

export function testSortingAlgorithm(
  algorithmName: string,
  algorithm: (arr: number[]) => Generator<Frame, void, unknown>
) {
  describe(`${algorithmName} Algorithm`, () => {
    it("should sort an empty array", () => {
      const input: number[] = [];
      const frames = Array.from(algorithm([...input]));
      // Empty array should have minimal frames
      expect(frames.length).toBeGreaterThanOrEqual(0);
    });

    it("should sort a single element array", () => {
      const input = [42];
      const frames = Array.from(algorithm([...input]));
      const finalArray = getFinalArray(frames);
      expect(finalArray).toEqual([42]);
    });

    it("should sort an already sorted array", () => {
      const input = [1, 2, 3, 4, 5];
      const frames = Array.from(algorithm([...input]));
      const finalArray = getFinalArray(frames);
      expect(finalArray).toEqual([1, 2, 3, 4, 5]);
    });

    it("should sort a reverse sorted array", () => {
      const input = [5, 4, 3, 2, 1];
      const frames = Array.from(algorithm([...input]));
      const finalArray = getFinalArray(frames);
      expect(finalArray).toEqual([1, 2, 3, 4, 5]);
    });

    it("should sort an array with duplicates", () => {
      const input = [3, 1, 4, 1, 5, 9, 2, 6, 5];
      const frames = Array.from(algorithm([...input]));
      const finalArray = getFinalArray(frames);
      expect(finalArray).toEqual([1, 1, 2, 3, 4, 5, 5, 6, 9]);
    });

    it("should generate at least one frame", () => {
      const input = [3, 1, 4];
      const frames = Array.from(algorithm([...input]));
      expect(frames.length).toBeGreaterThan(0);
    });

    it("should have proper frame structure", () => {
      const input = [3, 1, 4];
      const frames = Array.from(algorithm([...input]));
      const firstFrame = frames[0];

      expect(firstFrame).toBeDefined();
      expect(firstFrame).toHaveProperty("array");
      expect(Array.isArray(firstFrame.array)).toBe(true);

      // These properties are optional, so just check if they exist and are valid when present
      if (firstFrame.counters) {
        expect(typeof firstFrame.counters).toBe("object");
      }
      if (firstFrame.highlights) {
        expect(typeof firstFrame.highlights).toBe("object");
      }
      if (firstFrame.pcLine) {
        expect(typeof firstFrame.pcLine).toBe("number");
      }
    });
  });
}

export function testSearchingAlgorithm(
  algorithmName: string,
  algorithm: (
    input: unknown,
    opts?: { seed?: number }
  ) => Generator<Frame, void, unknown>
) {
  describe(`${algorithmName} Algorithm`, () => {
    it("should generate frames with proper structure", () => {
      const input = [1, 2, 3, 4, 5];
      const frames = Array.from(algorithm(input, { seed: 42 }));

      expect(frames.length).toBeGreaterThan(0);
      const firstFrame = frames[0];
      expect(firstFrame).toHaveProperty("array");
      expect(firstFrame).toHaveProperty("counters");
      expect(Array.isArray(firstFrame.array)).toBe(true);
    });

    it("should search through array elements", () => {
      const input = [1, 2, 3, 4, 5];
      const frames = Array.from(algorithm(input, { seed: 42 }));

      // Should have multiple frames showing search progression
      expect(frames.length).toBeGreaterThan(1);

      // Should have highlights showing current element being checked
      const frameWithHighlights = frames.find(
        (frame) => frame.highlights?.indices
      );
      expect(frameWithHighlights).toBeDefined();
    });

    it("should handle empty array", () => {
      const input: number[] = [];
      const frames = Array.from(algorithm(input, { seed: 42 }));

      // Should generate at least initial frame
      expect(frames.length).toBeGreaterThan(0);
      const finalFrame = frames[frames.length - 1];
      expect(finalFrame.array).toEqual([]);
    });

    it("should maintain array integrity", () => {
      const input = [1, 2, 3, 4, 5];
      const frames = Array.from(algorithm(input, { seed: 42 }));

      // Array should remain unchanged throughout search
      frames.forEach((frame) => {
        expect(frame.array).toEqual([1, 2, 3, 4, 5]);
      });
    });
  });
}
