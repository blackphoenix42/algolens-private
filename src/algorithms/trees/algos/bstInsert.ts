import type { Algorithm } from "@/engine/types";

// Using -Infinity avoids collision with valid integer input values
const EMPTY = -Infinity;

function ensureCapacity(tree: number[], index: number): number[] {
  while (tree.length <= index) {
    tree.push(EMPTY);
  }
  return tree;
}

export const run: Algorithm = function* bstInsert(input: unknown) {
  const values = input as number[];
  const tree: number[] = [];

  yield {
    array: [...tree],
    highlights: {},
    explain: "Starting BST Insert - building tree from input array",
    pcLine: 1,
  };

  for (let vIdx = 0; vIdx < values.length; vIdx++) {
    const value = values[vIdx];
    const path: number[] = [];

    yield {
      array: [...tree],
      highlights: { indices: path },
      explain: `Inserting ${value} (element ${vIdx + 1}/${values.length})`,
      pcLine: 2,
    };

    if (tree.length === 0) {
      tree.push(value);
      path.push(0);
      yield {
        array: [...tree],
        highlights: { indices: [0], compared: [0, 0] },
        explain: `Tree empty - placing ${value} at root`,
        pcLine: 3,
      };
      continue;
    }

    let i = 0;
    while (true) {
      path.push(i);
      const nodeVal = tree[i];

      yield {
        array: [...tree],
        highlights: { indices: [...path], compared: [i, i] },
        explain: `Comparing ${value} with node at index ${i} (value: ${nodeVal})`,
        pcLine: 4,
      };

      if (value < nodeVal) {
        const leftIdx = 2 * i + 1;
        ensureCapacity(tree, leftIdx);
        if (tree[leftIdx] === EMPTY) {
          tree[leftIdx] = value;
          path.push(leftIdx);
          yield {
            array: [...tree],
            highlights: { indices: [...path], compared: [i, leftIdx] },
            explain: `${value} < ${nodeVal} - placing at left child (index ${leftIdx})`,
            pcLine: 6,
          };
          break;
        }
        i = leftIdx;
        yield {
          array: [...tree],
          highlights: { indices: [...path], compared: [i, leftIdx] },
          explain: `${value} < ${nodeVal} - traverse left to index ${leftIdx}`,
          pcLine: 7,
        };
      } else {
        const rightIdx = 2 * i + 2;
        ensureCapacity(tree, rightIdx);
        if (tree[rightIdx] === EMPTY) {
          tree[rightIdx] = value;
          path.push(rightIdx);
          yield {
            array: [...tree],
            highlights: { indices: [...path], compared: [i, rightIdx] },
            explain: `${value} >= ${nodeVal} - placing at right child (index ${rightIdx})`,
            pcLine: 9,
          };
          break;
        }
        i = rightIdx;
        yield {
          array: [...tree],
          highlights: { indices: [...path], compared: [i, rightIdx] },
          explain: `${value} >= ${nodeVal} - traverse right to index ${rightIdx}`,
          pcLine: 10,
        };
      }
    }
  }

  yield {
    array: [...tree],
    highlights: {},
    explain: "BST Insert completed!",
    pcLine: -1,
  };
};
