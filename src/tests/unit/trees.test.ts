import { describe, expect, it } from "vitest";

import { run as bstInsert } from "../../algorithms/trees/algos/bstInsert";
import { run as bstSearch } from "../../algorithms/trees/algos/bstSearch";

const EMPTY = -Infinity;

function isValidBST(tree: number[], rootIdx = 0): boolean {
  if (rootIdx >= tree.length || tree[rootIdx] === EMPTY) return true;
  const val = tree[rootIdx];
  const leftIdx = 2 * rootIdx + 1;
  const rightIdx = 2 * rootIdx + 2;

  if (leftIdx < tree.length && tree[leftIdx] !== EMPTY && tree[leftIdx] >= val)
    return false;
  if (
    rightIdx < tree.length &&
    tree[rightIdx] !== EMPTY &&
    tree[rightIdx] !== undefined &&
    tree[rightIdx] < val
  )
    return false;

  return isValidBST(tree, leftIdx) && isValidBST(tree, rightIdx);
}

describe("BST Insert", () => {
  it("generates frames", () => {
    const frames = Array.from(bstInsert([5, 3, 7, 1, 4]));
    expect(frames.length).toBeGreaterThan(0);
  });

  it("each frame has array field", () => {
    const frames = Array.from(bstInsert([5, 3, 7]));
    frames.forEach((frame) => {
      expect(frame).toHaveProperty("array");
      expect(Array.isArray(frame.array)).toBe(true);
    });
  });

  it("final array represents valid BST for [5, 3, 7, 1, 4]", () => {
    const frames = Array.from(bstInsert([5, 3, 7, 1, 4]));
    const finalFrame = frames[frames.length - 1];
    expect(finalFrame?.array).toBeDefined();
    const tree = finalFrame!.array!;
    const nonEmptyValues = tree.filter((v) => v !== EMPTY && v !== undefined);
    expect(nonEmptyValues).toHaveLength(5);
    expect(nonEmptyValues.sort((a, b) => a - b)).toEqual([1, 3, 4, 5, 7]);
    expect(isValidBST(tree)).toBe(true);
  });

  it("each frame has explain field", () => {
    const frames = Array.from(bstInsert([5, 3, 7]));
    frames.forEach((frame) => {
      expect(frame).toHaveProperty("explain");
      expect(typeof frame.explain).toBe("string");
    });
  });
});

describe("BST Search", () => {
  it("generates frames", () => {
    const tree = [5, 3, 7, 1, 4, -Infinity, -Infinity];
    const frames = Array.from(bstSearch({ array: tree, target: 4 }));
    expect(frames.length).toBeGreaterThan(0);
  });

  it("each frame has array field", () => {
    const tree = [5, 3, 7, 1, 4, -Infinity, -Infinity];
    const frames = Array.from(bstSearch({ array: tree, target: 4 }));
    frames.forEach((frame) => {
      expect(frame).toHaveProperty("array");
      expect(Array.isArray(frame.array)).toBe(true);
    });
  });

  it("finds existing element", () => {
    const tree = [5, 3, 7, 1, 4, -Infinity, -Infinity];
    const frames = Array.from(bstSearch({ array: tree, target: 4 }));
    const foundFrame = frames.find((f) =>
      f.explain?.includes("Found target 4 at index")
    );
    expect(foundFrame).toBeDefined();
  });

  it("handles missing element", () => {
    const tree = [5, 3, 7, 1, 4, -Infinity, -Infinity];
    const frames = Array.from(bstSearch({ array: tree, target: 99 }));
    const notFoundFrame = frames.find((f) =>
      f.explain?.includes("not found in BST")
    );
    expect(notFoundFrame).toBeDefined();
  });

  it("each frame has explain field", () => {
    const tree = [5, 3, 7];
    const frames = Array.from(bstSearch({ array: tree, target: 7 }));
    frames.forEach((frame) => {
      expect(frame).toHaveProperty("explain");
      expect(typeof frame.explain).toBe("string");
    });
  });
});
