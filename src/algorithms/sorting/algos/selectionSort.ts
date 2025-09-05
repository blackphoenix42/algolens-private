import type { Algorithm } from "@/engine/types";

export const run: Algorithm = function* selectionSort(input: unknown) {
  const arr = input as number[];

  yield {
    array: [...arr],
    highlights: {},
    explain: "Starting Selection Sort",
    pcLine: 1, // Maps to pseudocode line 0: "for i = 0 to n-2"
  };

  for (let i = 0; i < arr.length - 1; i++) {
    let minIndex = i;

    yield {
      array: [...arr],
      highlights: {
        indices: [i],
      },
      explain: `Finding minimum element starting from position ${i}`,
      pcLine: 2, // Maps to pseudocode line 1: "minIndex = i"
    };

    for (let j = i + 1; j < arr.length; j++) {
      yield {
        array: [...arr],
        highlights: {
          compared: [minIndex, j] as [number, number],
        },
        explain: `Comparing ${arr[minIndex]} with ${arr[j]}`,
        pcLine: 4, // Maps to pseudocode line 3: "if arr[j] < arr[minIndex]"
      };

      if (arr[j] < arr[minIndex]) {
        minIndex = j;

        yield {
          array: [...arr],
          highlights: {
            indices: [minIndex],
          },
          explain: `New minimum found: ${arr[minIndex]} at position ${minIndex}`,
          pcLine: 5, // Maps to pseudocode line 4: "minIndex = j"
        };
      }
    }

    if (minIndex !== i) {
      [arr[i], arr[minIndex]] = [arr[minIndex], arr[i]];

      yield {
        array: [...arr],
        highlights: {
          swapped: [i, minIndex] as [number, number],
        },
        explain: `Swapped ${arr[minIndex]} and ${arr[i]}`,
        pcLine: 6, // Maps to pseudocode line 5: "swap arr[i] and arr[minIndex]"
      };
    }
  }

  yield {
    array: [...arr],
    highlights: {},
    explain: "Selection Sort completed!",
    pcLine: -1, // No specific line, algorithm completed
  };
};
