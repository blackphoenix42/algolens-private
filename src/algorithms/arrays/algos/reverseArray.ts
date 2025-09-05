import type { Algorithm } from "@/engine/types";

export const run: Algorithm = function* reverseArray(input: unknown) {
  const arr = input as number[];
  const result = [...arr];
  let left = 0;
  let right = result.length - 1;

  yield {
    array: [...result],
    highlights: {},
    explain: `Starting array reversal`,
    pcLine: 0,
  };

  while (left < right) {
    yield {
      array: [...result],
      highlights: {
        indices: [left, right],
      },
      explain: `Swapping elements at indices ${left} and ${right}`,
      pcLine: 1,
    };

    // Swap elements
    [result[left], result[right]] = [result[right], result[left]];

    yield {
      array: [...result],
      highlights: {
        indices: [left, right],
      },
      explain: `Swapped ${result[right]} and ${result[left]}`,
      pcLine: 2,
    };

    left++;
    right--;
  }

  yield {
    array: [...result],
    highlights: {},
    explain: `Array reversal completed!`,
    pcLine: -1,
  };
};
