import type { Algorithm } from "@/engine/types";

export const run: Algorithm = function* insertionSort(input: unknown) {
  const arr = input as number[];

  // Line 1: function insertionSort(arr) {
  yield {
    array: [...arr],
    highlights: {},
    explain: "Starting Insertion Sort",
    pcLine: 1,
  };

  // Line 2: for (let i = 1; i < arr.length; i++) {
  for (let i = 1; i < arr.length; i++) {
    // Line 3: let key = arr[i];
    const key = arr[i];
    // Line 4: let j = i - 1;
    let j = i - 1;

    yield {
      array: [...arr],
      highlights: {
        indices: [i],
      },
      explain: `Selecting element ${key} at position ${i}`,
      pcLine: 2,
    };

    // Line 5: while (j >= 0 && arr[j] > key) {
    while (j >= 0 && arr[j] > key) {
      yield {
        array: [...arr],
        highlights: {
          compared: [j, j + 1] as [number, number],
        },
        explain: `Comparing ${arr[j]} with ${key}`,
        pcLine: 4,
      };

      // Line 6: arr[j + 1] = arr[j];
      arr[j + 1] = arr[j];

      yield {
        array: [...arr],
        highlights: {
          indices: [j + 1],
        },
        explain: `Shifting ${arr[j]} to position ${j + 1}`,
        pcLine: 5,
      };

      // Line 7: j--;
      j--;
    }

    // Line 9: arr[j + 1] = key;
    arr[j + 1] = key;

    yield {
      array: [...arr],
      highlights: {
        indices: [j + 1],
      },
      explain: `Inserted ${key} at position ${j + 1}`,
      pcLine: 7,
    };
  }

  // Line 11: return arr;
  yield {
    array: [...arr],
    highlights: {},
    explain: "Insertion Sort completed!",
    pcLine: 11,
  };
};
