import type { Algorithm, Frame } from "@/engine/types";

export const run: Algorithm = function* heapSort(input: unknown) {
  const arr = input as number[];
  const n = arr.length;

  yield {
    array: [...arr],
    highlights: {},
    explain: "Starting Heap Sort - building max heap",
    pcLine: 1,
  };

  // Build max heap
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    yield* heapify(arr, n, i, 1);
  }

  yield {
    array: [...arr],
    highlights: {},
    explain: "Max heap built. Extracting elements one by one.",
    pcLine: 2,
  };

  // Extract elements from heap one by one
  for (let end = n - 1; end > 0; end--) {
    yield {
      array: [...arr],
      highlights: {
        compared: [0, end] as [number, number],
      },
      explain: `Swapping root (max) with element at position ${end}`,
      pcLine: 3,
    };

    [arr[0], arr[end]] = [arr[end], arr[0]];

    yield {
      array: [...arr],
      highlights: {
        swapped: [0, end] as [number, number],
      },
      explain: `Moved max to sorted position ${end}`,
      pcLine: 4,
    };

    yield* heapify(arr, end, 0, 5);
  }

  yield {
    array: [...arr],
    highlights: {},
    explain: "Heap Sort completed!",
    pcLine: -1,
  };
};

function* heapify(
  arr: number[],
  n: number,
  i: number,
  pcLine: number
): Generator<Frame> {
  let largest = i;
  const left = 2 * i + 1;
  const right = 2 * i + 2;

  if (left < n) {
    yield {
      array: [...arr],
      highlights: {
        compared: [left, largest] as [number, number],
      },
      explain: `Comparing left child ${arr[left]} with current largest ${arr[largest]}`,
      pcLine,
    };

    if (arr[left] > arr[largest]) {
      largest = left;
    }
  }

  if (right < n) {
    yield {
      array: [...arr],
      highlights: {
        compared: [right, largest] as [number, number],
      },
      explain: `Comparing right child ${arr[right]} with current largest ${arr[largest]}`,
      pcLine,
    };

    if (arr[right] > arr[largest]) {
      largest = right;
    }
  }

  if (largest !== i) {
    yield {
      array: [...arr],
      highlights: {
        compared: [i, largest] as [number, number],
      },
      explain: `Swapping ${arr[i]} and ${arr[largest]} to restore heap property`,
      pcLine,
    };

    [arr[i], arr[largest]] = [arr[largest], arr[i]];

    yield {
      array: [...arr],
      highlights: {
        swapped: [i, largest] as [number, number],
      },
      explain: `Swapped. Heapifying subtree at ${largest}`,
      pcLine,
    };

    yield* heapify(arr, n, largest, pcLine);
  }
}
