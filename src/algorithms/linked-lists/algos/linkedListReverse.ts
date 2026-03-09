import type { Algorithm } from "@/engine/types";

export const run: Algorithm = function* linkedListReverse(input: unknown) {
  const arr = input as number[];
  const result = [...arr];
  const n = result.length;

  yield {
    array: [...result],
    highlights: {},
    explain: "Starting linked list reversal (three-pointer approach).",
    pcLine: 1,
  };

  let left = 0;
  let right = n - 1;

  while (left < right) {
    yield {
      array: [...result],
      highlights: {
        compared: [left, right] as [number, number],
      },
      explain: `Comparing positions ${left} and ${right}: swapping ${result[left]} and ${result[right]}`,
      pcLine: 3,
    };

    [result[left], result[right]] = [result[right], result[left]];

    yield {
      array: [...result],
      highlights: {
        swapped: [left, right] as [number, number],
      },
      explain: `Swapped: position ${left} = ${result[left]}, position ${right} = ${result[right]}`,
      pcLine: 4,
    };

    left++;
    right--;
  }

  yield {
    array: [...result],
    highlights: {},
    explain: "Linked list reversal completed!",
    pcLine: -1,
  };
};
