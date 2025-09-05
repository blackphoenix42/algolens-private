import type { Algorithm } from "@/engine/types";

export const run: Algorithm = function* binarySearch(input: unknown) {
  const { array, target } = input as { array: number[]; target: number };
  let left = 0;
  let right = array.length - 1;

  yield {
    array: [...array],
    highlights: {},
    explain: `Starting Binary Search for target: ${target}`,
    pcLine: 1,
  };

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);

    yield {
      array: [...array],
      highlights: {
        indices: [left, mid, right],
      },
      explain: `Checking middle element at index ${mid}: ${array[mid]} (range: ${left}-${right})`,
      pcLine: 3,
    };

    if (array[mid] === target) {
      yield {
        array: [...array],
        highlights: {
          indices: [mid],
        },
        explain: `Found target ${target} at index ${mid}!`,
        pcLine: 5,
      };
      return;
    }

    if (array[mid] < target) {
      left = mid + 1;
      yield {
        array: [...array],
        highlights: {
          indices: [mid],
        },
        explain: `${array[mid]} < ${target}, searching right half`,
        pcLine: 7,
      };
    } else {
      right = mid - 1;
      yield {
        array: [...array],
        highlights: {
          indices: [mid],
        },
        explain: `${array[mid]} > ${target}, searching left half`,
        pcLine: 9,
      };
    }
  }

  yield {
    array: [...array],
    highlights: {},
    explain: `Target ${target} not found in the array`,
    pcLine: 10,
  };
};
