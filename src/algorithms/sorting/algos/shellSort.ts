import type { Algorithm } from "@/engine/types";

export const run: Algorithm = function* shellSort(input: unknown) {
  const arr = input as number[];
  const n = arr.length;

  yield {
    array: [...arr],
    highlights: {},
    explain: "Starting Shell Sort - gap-based insertion sort",
    pcLine: 1,
  };

  // Knuth's gap sequence: 1, 4, 13, 40, 121, ... (gap = gap * 3 + 1)
  let gap = 1;
  while (gap < n) {
    gap = gap * 3 + 1;
  }
  gap = Math.floor(gap / 3);

  while (gap >= 1) {
    yield {
      array: [...arr],
      highlights: {},
      explain: `Using gap size ${gap} for this pass`,
      pcLine: 2,
    };

    for (let i = gap; i < n; i++) {
      const temp = arr[i];
      let j = i;

      while (j >= gap && arr[j - gap] > temp) {
        yield {
          array: [...arr],
          highlights: {
            compared: [j - gap, j] as [number, number],
          },
          explain: `Comparing ${arr[j - gap]} and ${temp} (gap=${gap})`,
          pcLine: 3,
        };

        arr[j] = arr[j - gap];
        j -= gap;

        yield {
          array: [...arr],
          highlights: {
            swapped: [j, j + gap] as [number, number],
          },
          explain: `Shifted element right by gap ${gap}`,
          pcLine: 4,
        };
      }

      if (j !== i) {
        arr[j] = temp;
        yield {
          array: [...arr],
          highlights: {
            indices: [j],
          },
          explain: `Placed ${temp} at position ${j}`,
          pcLine: 5,
        };
      }
    }

    gap = Math.floor(gap / 3);
  }

  yield {
    array: [...arr],
    highlights: {},
    explain: "Shell Sort completed!",
    pcLine: -1,
  };
};
