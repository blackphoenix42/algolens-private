import type { Algorithm } from "@/engine/types";

export const run: Algorithm = function* findMaximum(input: unknown) {
  const arr = input as number[];
  let maxValue = arr[0];
  let maxIndex = 0;

  yield {
    array: [...arr],
    highlights: {
      indices: [0],
    },
    explain: `Starting with first element as maximum: ${maxValue}`,
    pcLine: 0,
  };

  for (let i = 1; i < arr.length; i++) {
    yield {
      array: [...arr],
      highlights: {
        indices: [i, maxIndex],
      },
      explain: `Comparing ${arr[i]} with current maximum ${maxValue}`,
      pcLine: 1,
    };

    if (arr[i] > maxValue) {
      maxValue = arr[i];
      maxIndex = i;

      yield {
        array: [...arr],
        highlights: {
          indices: [i],
        },
        explain: `Found new maximum: ${maxValue} at index ${i}`,
        pcLine: 2,
      };
    }
  }

  yield {
    array: [...arr],
    highlights: {
      indices: [maxIndex],
    },
    explain: `Maximum value ${maxValue} found at index ${maxIndex}`,
    pcLine: -1,
  };
};
