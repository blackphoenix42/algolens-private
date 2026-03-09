import type { Algorithm } from "@/engine/types";

// Using -Infinity avoids collision with valid integer input values
const EMPTY = -Infinity;

export const run: Algorithm = function* bstSearch(input: unknown) {
  const { array, target } = input as { array: number[]; target: number };
  const tree = [...array];
  const path: number[] = [];

  yield {
    array: [...tree],
    highlights: {},
    explain: `Starting BST Search for target: ${target}`,
    pcLine: 1,
  };

  let i = 0;
  while (i < tree.length && tree[i] !== EMPTY && tree[i] !== undefined) {
    const nodeVal = tree[i];
    path.push(i);

    yield {
      array: [...tree],
      highlights: { indices: [...path], compared: [i, i] },
      explain: `Comparing target ${target} with node at index ${i} (value: ${nodeVal})`,
      pcLine: 3,
    };

    if (nodeVal === target) {
      yield {
        array: [...tree],
        highlights: { indices: [i], compared: [i, i] },
        explain: `Found target ${target} at index ${i}!`,
        pcLine: 5,
      };
      return;
    }

    if (target < nodeVal) {
      const leftIdx = 2 * i + 1;
      yield {
        array: [...tree],
        highlights: { indices: [...path], compared: [i, leftIdx] },
        explain: `${target} < ${nodeVal} - go left to index ${leftIdx}`,
        pcLine: 7,
      };
      i = leftIdx;
    } else {
      const rightIdx = 2 * i + 2;
      yield {
        array: [...tree],
        highlights: { indices: [...path], compared: [i, rightIdx] },
        explain: `${target} > ${nodeVal} - go right to index ${rightIdx}`,
        pcLine: 9,
      };
      i = rightIdx;
    }
  }

  yield {
    array: [...tree],
    highlights: {},
    explain: `Target ${target} not found in BST`,
    pcLine: 11,
  };
};
