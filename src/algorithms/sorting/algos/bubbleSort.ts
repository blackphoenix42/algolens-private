import type { Algorithm } from "@/engine/types";

export const run: Algorithm = function* bubbleSort(input: unknown) {
  const arr = input as number[];
  const n = arr.length;

  yield {
    array: [...arr],
    highlights: {},
    explain: "Starting Bubble Sort",
    pcLine: 1, // Maps to pseudocode line 0: "for i = 0 to n-2"
  };

  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      yield {
        array: [...arr],
        highlights: {
          compared: [j, j + 1] as [number, number],
        },
        explain: `Comparing elements at positions ${j} and ${j + 1}`,
        pcLine: 3, // Maps to pseudocode line 2: "if arr[j] > arr[j+1]"
      };

      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];

        yield {
          array: [...arr],
          highlights: {
            swapped: [j, j + 1] as [number, number],
          },
          explain: `Swapped elements ${arr[j + 1]} and ${arr[j]}`,
          pcLine: 4, // Maps to pseudocode line 3: "swap arr[j] and arr[j+1]"
        };
      }
    }
  }

  yield {
    array: [...arr],
    highlights: {},
    explain: "Bubble Sort completed!",
    pcLine: -1, // No specific line, algorithm completed
  };
};
