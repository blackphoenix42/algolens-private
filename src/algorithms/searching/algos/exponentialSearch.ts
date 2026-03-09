import type { Algorithm } from "@/engine/types";

export const run: Algorithm = function* exponentialSearch(input: unknown) {
  const { array, target } = input as { array: number[]; target: number };
  let comparisons = 0;

  yield {
    array: [...array],
    highlights: {},
    counters: { comparisons: 0 },
    explain: `Starting Exponential Search for target: ${target}`,
    pcLine: 1,
  };

  if (array.length === 0) {
    yield {
      array: [...array],
      highlights: {},
      counters: { comparisons },
      explain: `Target ${target} not found (empty array)`,
      pcLine: 9,
    };
    return;
  }

  if (array[0] === target) {
    yield {
      array: [...array],
      highlights: { indices: [0] },
      counters: { comparisons: 1 },
      explain: `Found target ${target} at index 0!`,
      pcLine: 3,
    };
    return;
  }

  let bound = 1;
  yield {
    array: [...array],
    highlights: { indices: [0] },
    counters: { comparisons },
    explain: `Phase 1: Finding range by doubling index (bound=${bound})`,
    pcLine: 2,
  };

  while (bound < array.length && array[bound] < target) {
    comparisons++;
    yield {
      array: [...array],
      highlights: { indices: [bound] },
      counters: { comparisons },
      explain: `array[${bound}]=${array[bound]} < ${target}, doubling bound: ${bound} -> ${bound * 2}`,
      pcLine: 2,
    };
    bound *= 2;
  }

  const left = Math.floor(bound / 2);
  const right = Math.min(bound, array.length - 1);

  yield {
    array: [...array],
    highlights: { indices: [left, right] },
    counters: { comparisons },
    explain: `Phase 2: Binary search in range [${left}, ${right}]`,
    pcLine: 4,
  };

  let lo = left;
  let hi = right;

  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);

    yield {
      array: [...array],
      highlights: {
        indices: [mid, lo, hi],
      },
      counters: { comparisons },
      explain: `Checking mid=${mid}: ${array[mid]} (range [${lo}, ${hi}])`,
      pcLine: 5,
    };

    comparisons++;
    if (array[mid] === target) {
      yield {
        array: [...array],
        highlights: { indices: [mid] },
        counters: { comparisons },
        explain: `Found target ${target} at index ${mid}!`,
        pcLine: 6,
      };
      return;
    }

    if (array[mid] < target) {
      lo = mid + 1;
      yield {
        array: [...array],
        highlights: { indices: [mid] },
        counters: { comparisons },
        explain: `${array[mid]} < ${target}, search right half`,
        pcLine: 7,
      };
    } else {
      hi = mid - 1;
      yield {
        array: [...array],
        highlights: { indices: [mid] },
        counters: { comparisons },
        explain: `${array[mid]} > ${target}, search left half`,
        pcLine: 8,
      };
    }
  }

  yield {
    array: [...array],
    highlights: {},
    counters: { comparisons },
    explain: `Target ${target} not found in the array`,
    pcLine: 9,
  };
};
