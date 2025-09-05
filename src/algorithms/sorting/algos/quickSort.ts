import type { Algorithm, Frame } from "@/engine/types";

export const run: Algorithm = function* quickSort(input: unknown) {
  const arr = input as number[];

  yield {
    array: [...arr],
    highlights: {},
    explain: "Starting Quick Sort",
    pcLine: 1,
  };

  function* quickSortHelper(
    arr: number[],
    low: number,
    high: number
  ): Generator<Frame> {
    if (low < high) {
      const pivotIndex = yield* partition(arr, low, high);

      yield {
        array: [...arr],
        highlights: {
          pivot: pivotIndex,
        },
        explain: `Pivot placed at position ${pivotIndex}`,
        pcLine: 2,
      };

      yield* quickSortHelper(arr, low, pivotIndex - 1);
      yield* quickSortHelper(arr, pivotIndex + 1, high);
    }
  }

  function* partition(
    arr: number[],
    low: number,
    high: number
  ): Generator<Frame, number> {
    const pivot = arr[high];
    let i = low - 1;

    yield {
      array: [...arr],
      highlights: {
        pivot: high,
      },
      explain: `Partitioning with pivot ${pivot}`,
      pcLine: 2,
    };

    for (let j = low; j < high; j++) {
      yield {
        array: [...arr],
        highlights: {
          compared: [j, high] as [number, number],
          pivot: high,
        },
        explain: `Comparing ${arr[j]} with pivot ${pivot}`,
        pcLine: 3,
      };

      if (arr[j] < pivot) {
        i++;
        [arr[i], arr[j]] = [arr[j], arr[i]];

        yield {
          array: [...arr],
          highlights: {
            swapped: [i, j] as [number, number],
            pivot: high,
          },
          explain: `Swapped ${arr[j]} and ${arr[i]}`,
          pcLine: 4,
        };
      }
    }

    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];

    yield {
      array: [...arr],
      highlights: {
        swapped: [i + 1, high] as [number, number],
      },
      explain: `Placed pivot in final position`,
      pcLine: 5,
    };

    return i + 1;
  }

  yield* quickSortHelper(arr, 0, arr.length - 1);

  yield {
    array: [...arr],
    highlights: {},
    explain: "Quick Sort completed!",
    pcLine: 4,
  };
};
