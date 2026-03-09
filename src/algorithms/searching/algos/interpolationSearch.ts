import type { Algorithm } from "@/engine/types";

export const run: Algorithm = function* interpolationSearch(input: unknown) {
  const { array, target } = input as { array: number[]; target: number };
  let low = 0;
  let high = array.length - 1;
  let comparisons = 0;

  yield {
    array: [...array],
    highlights: {},
    counters: { comparisons: 0 },
    explain: `Starting Interpolation Search for target: ${target}`,
    pcLine: 1,
  };

  while (low <= high && target >= array[low] && target <= array[high]) {
    if (low === high) {
      comparisons++;
      yield {
        array: [...array],
        highlights: { indices: [low] },
        counters: { comparisons },
        explain: `Single element range at index ${low}`,
        pcLine: 2,
      };
      if (array[low] === target) {
        yield {
          array: [...array],
          highlights: { indices: [low] },
          counters: { comparisons },
          explain: `Found target ${target} at index ${low}!`,
          pcLine: 4,
        };
        return;
      }
      break;
    }

    const pos =
      low +
      Math.floor(
        ((target - array[low]) * (high - low)) / (array[high] - array[low])
      );
    const clampedPos = Math.min(Math.max(pos, low), high);

    yield {
      array: [...array],
      highlights: {
        indices: [clampedPos, low, high],
      },
      counters: { comparisons },
      explain: `Probing at position ${clampedPos} (range ${low}-${high}), value: ${array[clampedPos]}`,
      pcLine: 3,
    };

    comparisons++;
    if (array[clampedPos] === target) {
      yield {
        array: [...array],
        highlights: { indices: [clampedPos] },
        counters: { comparisons },
        explain: `Found target ${target} at index ${clampedPos}!`,
        pcLine: 4,
      };
      return;
    }

    if (array[clampedPos] < target) {
      low = clampedPos + 1;
      yield {
        array: [...array],
        highlights: { indices: [clampedPos] },
        counters: { comparisons },
        explain: `${array[clampedPos]} < ${target}, narrowing to right half`,
        pcLine: 6,
      };
    } else {
      high = clampedPos - 1;
      yield {
        array: [...array],
        highlights: { indices: [clampedPos] },
        counters: { comparisons },
        explain: `${array[clampedPos]} > ${target}, narrowing to left half`,
        pcLine: 7,
      };
    }
  }

  yield {
    array: [...array],
    highlights: {},
    counters: { comparisons },
    explain: `Target ${target} not found in the array`,
    pcLine: 8,
  };
};
