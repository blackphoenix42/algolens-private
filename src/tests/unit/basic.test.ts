import { describe, expect, it } from "vitest";

describe("Basic Test Suite", () => {
  describe("Math operations", () => {
    it("should perform basic arithmetic", () => {
      expect(1 + 1).toBe(2);
      expect(5 - 3).toBe(2);
      expect(4 * 3).toBe(12);
      expect(10 / 2).toBe(5);
    });
  });

  describe("Array operations", () => {
    it("should work with arrays", () => {
      const arr = [3, 1, 4, 1, 5];
      expect(arr.length).toBe(5);
      expect(arr.sort((a, b) => a - b)).toEqual([1, 1, 3, 4, 5]);
    });

    it("should handle array methods", () => {
      const arr = [1, 2, 3, 4, 5];
      expect(arr.map((x) => x * 2)).toEqual([2, 4, 6, 8, 10]);
      expect(arr.filter((x) => x % 2 === 0)).toEqual([2, 4]);
      expect(arr.reduce((sum, x) => sum + x, 0)).toBe(15);
    });
  });

  describe("Environment setup", () => {
    it("should have vitest globals available", () => {
      expect(describe).toBeDefined();
      expect(it).toBeDefined();
      expect(expect).toBeDefined();
    });
  });
});
