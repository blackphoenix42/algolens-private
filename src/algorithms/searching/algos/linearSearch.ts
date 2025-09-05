import type { Algorithm } from "@/engine/types";

export const run: Algorithm = function* linearSearch(input: unknown) {
  const { array, target } = input as { array: number[]; target: number };

  yield {
    array: [...array],
    highlights: {},
    explain: `Starting Linear Search for target: ${target}`,
    pcLine: 1,
  };

  for (let i = 0; i < array.length; i++) {
    yield {
      array: [...array],
      highlights: {
        indices: [i],
      },
      explain: `Checking element at index ${i}: ${array[i]}`,
      pcLine: 2,
    };

    if (array[i] === target) {
      yield {
        array: [...array],
        highlights: {
          indices: [i],
        },
        explain: `Found target ${target} at index ${i}!`,
        pcLine: 3,
      };
      return;
    }
  }

  yield {
    array: [...array],
    highlights: {},
    explain: `Target ${target} not found in the array`,
    pcLine: 4,
  };
};
