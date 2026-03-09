import type { Algorithm } from "@/engine/types";

export const run: Algorithm = function* ternarySearch(input: unknown) {
  const { array, target } = input as { array: number[]; target: number };
  let low = 0;
  let high = array.length - 1;
  let comparisons = 0;

  yield {
    array: [...array],
    highlights: {},
    counters: { comparisons: 0 },
    explain: `Starting Ternary Search for target: ${target}`,
    pcLine: 1,
  };

  while (low <= high) {
    const mid1 = low + Math.floor((high - low) / 3);
    const mid2 = high - Math.floor((high - low) / 3);

    yield {
      array: [...array],
      highlights: {
        indices: [mid1, mid2, low, high],
      },
      counters: { comparisons },
      explain: `Dividing range [${low}, ${high}] at mid1=${mid1}, mid2=${mid2}`,
      pcLine: 2,
    };

    comparisons++;
    if (array[mid1] === target) {
      yield {
        array: [...array],
        highlights: { indices: [mid1] },
        counters: { comparisons },
        explain: `Found target ${target} at index ${mid1}!`,
        pcLine: 4,
      };
      return;
    }

    comparisons++;
    if (array[mid2] === target) {
      yield {
        array: [...array],
        highlights: { indices: [mid2] },
        counters: { comparisons },
        explain: `Found target ${target} at index ${mid2}!`,
        pcLine: 5,
      };
      return;
    }

    if (target < array[mid1]) {
      high = mid1 - 1;
      yield {
        array: [...array],
        highlights: { indices: [mid1, mid2] },
        counters: { comparisons },
        explain: `${target} < ${array[mid1]}, searching left third`,
        pcLine: 7,
      };
    } else if (target > array[mid2]) {
      low = mid2 + 1;
      yield {
        array: [...array],
        highlights: { indices: [mid1, mid2] },
        counters: { comparisons },
        explain: `${target} > ${array[mid2]}, searching right third`,
        pcLine: 8,
      };
    } else {
      low = mid1 + 1;
      high = mid2 - 1;
      yield {
        array: [...array],
        highlights: { indices: [mid1, mid2] },
        counters: { comparisons },
        explain: `${array[mid1]} < ${target} < ${array[mid2]}, searching middle third`,
        pcLine: 9,
      };
    }
  }

  yield {
    array: [...array],
    highlights: {},
    counters: { comparisons },
    explain: `Target ${target} not found in the array`,
    pcLine: 10,
  };
};
