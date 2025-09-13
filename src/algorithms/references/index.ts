import { dijkstra } from "javascript-algorithms/src/algorithms/graph";
import {
  binarySearch,
  linearSearch,
} from "javascript-algorithms/src/algorithms/search";
import {
  bubbleSort,
  mergeSort,
  quickSort,
} from "javascript-algorithms/src/algorithms/sorting";
import { Graph } from "javascript-algorithms/src/data-structures/graph";

// Algorithm reference implementations from javascript-algorithms
export const algorithmReferences = {
  sorting: {
    bubbleSort,
    quickSort,
    mergeSort,
  },
  searching: {
    binarySearch,
    linearSearch,
  },
  graph: {
    Graph,
    dijkstra,
  },
};

// Wrapper functions for easier integration
export class AlgorithmReference {
  // Sorting algorithms
  static bubbleSort<T>(array: T[], compareFn?: (a: T, b: T) => number): T[] {
    return bubbleSort(array, compareFn);
  }

  static quickSort<T>(array: T[], compareFn?: (a: T, b: T) => number): T[] {
    return quickSort(array, compareFn);
  }

  static mergeSort<T>(array: T[], compareFn?: (a: T, b: T) => number): T[] {
    return mergeSort(array, compareFn);
  }

  // Searching algorithms
  static binarySearch<T>(
    array: T[],
    target: T,
    compareFn?: (a: T, b: T) => number
  ): number {
    return binarySearch(array, target, compareFn);
  }

  static linearSearch<T>(
    array: T[],
    target: T,
    compareFn?: (a: T, b: T) => number
  ): number {
    return linearSearch(array, target, compareFn);
  }

  // Graph algorithms
  static createGraph(isDirected = false) {
    return new Graph(isDirected);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static dijkstraAlgorithm(graph: any, startVertex: any) {
    return dijkstra(graph, startVertex);
  }
}

// Custom algorithm implementations with step tracking for visualization
export class VisualizationAlgorithms {
  // Bubble Sort with step tracking
  static *bubbleSortSteps<T extends number | string>(
    array: T[],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    compareFn: (a: T, b: T) => number = (a, b) => (a as any) - (b as any)
  ) {
    const arr = [...array];
    const n = arr.length;

    for (let i = 0; i < n - 1; i++) {
      let swapped = false;

      for (let j = 0; j < n - i - 1; j++) {
        // Yield comparison step
        yield {
          array: [...arr],
          action: "compare",
          indices: [j, j + 1],
          step: `Comparing ${arr[j]} and ${arr[j + 1]}`,
        };

        if (compareFn(arr[j], arr[j + 1]) > 0) {
          // Yield swap step
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          swapped = true;

          yield {
            array: [...arr],
            action: "swap",
            indices: [j, j + 1],
            step: `Swapped ${arr[j + 1]} and ${arr[j]}`,
          };
        }
      }

      if (!swapped) break;
    }

    yield {
      array: [...arr],
      action: "complete",
      indices: [],
      step: "Sorting complete!",
    };
  }

  // Quick Sort with step tracking
  static *quickSortSteps<T extends number | string>(
    array: T[],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    compareFn: (a: T, b: T) => number = (a, b) => (a as any) - (b as any),
    low = 0,
    high = array.length - 1
  ): Generator<{
    array: T[];
    pivotIndex?: number;
    comparedIndices?: [number, number];
    swappedIndices?: [number, number];
  }> {
    if (low < high) {
      const pivotIndex = yield* this.partitionSteps(
        array,
        compareFn,
        low,
        high
      );

      yield* this.quickSortSteps(array, compareFn, low, pivotIndex - 1);
      yield* this.quickSortSteps(array, compareFn, pivotIndex + 1, high);
    }
  }

  private static *partitionSteps<T>(
    array: T[],
    compareFn: (a: T, b: T) => number,
    low: number,
    high: number
  ) {
    const pivot = array[high];
    let i = low - 1;

    yield {
      array: [...array],
      action: "pivot",
      indices: [high],
      step: `Selected pivot: ${pivot}`,
    };

    for (let j = low; j < high; j++) {
      yield {
        array: [...array],
        action: "compare",
        indices: [j, high],
        step: `Comparing ${array[j]} with pivot ${pivot}`,
      };

      if (compareFn(array[j], pivot) <= 0) {
        i++;
        if (i !== j) {
          [array[i], array[j]] = [array[j], array[i]];
          yield {
            array: [...array],
            action: "swap",
            indices: [i, j],
            step: `Swapped ${array[j]} and ${array[i]}`,
          };
        }
      }
    }

    [array[i + 1], array[high]] = [array[high], array[i + 1]];
    yield {
      array: [...array],
      action: "swap",
      indices: [i + 1, high],
      step: `Placed pivot in correct position`,
    };

    return i + 1;
  }

  // Binary Search with step tracking
  static *binarySearchSteps<T extends number | string>(
    array: T[],
    target: T,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    compareFn: (a: T, b: T) => number = (a, b) => (a as any) - (b as any)
  ) {
    let left = 0;
    let right = array.length - 1;

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);

      yield {
        array: [...array],
        action: "search",
        indices: [mid],
        range: [left, right],
        step: `Checking middle element at index ${mid}: ${array[mid]}`,
      };

      const comparison = compareFn(array[mid], target);

      if (comparison === 0) {
        yield {
          array: [...array],
          action: "found",
          indices: [mid],
          step: `Found target ${target} at index ${mid}!`,
        };
        return mid;
      } else if (comparison < 0) {
        left = mid + 1;
        yield {
          array: [...array],
          action: "search_right",
          range: [left, right],
          step: `Target is greater, searching right half`,
        };
      } else {
        right = mid - 1;
        yield {
          array: [...array],
          action: "search_left",
          range: [left, right],
          step: `Target is smaller, searching left half`,
        };
      }
    }

    yield {
      array: [...array],
      action: "not_found",
      indices: [],
      step: `Target ${target} not found in array`,
    };

    return -1;
  }
}

// Utility functions for algorithm verification
export const AlgorithmUtils = {
  // Verify if an array is sorted
  isSorted<T extends number | string>(
    array: T[],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    compareFn: (a: T, b: T) => number = (a, b) => (a as any) - (b as any)
  ): boolean {
    for (let i = 1; i < array.length; i++) {
      if (compareFn(array[i - 1], array[i]) > 0) {
        return false;
      }
    }
    return true;
  },

  // Generate test data
  generateRandomArray(size: number, min = 1, max = 100): number[] {
    return Array.from(
      { length: size },
      () => Math.floor(Math.random() * (max - min + 1)) + min
    );
  },

  generateSortedArray(size: number, ascending = true): number[] {
    const arr = Array.from({ length: size }, (_, i) => i + 1);
    return ascending ? arr : arr.reverse();
  },

  generateNearlySortedArray(size: number, swaps = 2): number[] {
    const arr = Array.from({ length: size }, (_, i) => i + 1);

    for (let i = 0; i < swaps; i++) {
      const idx1 = Math.floor(Math.random() * size);
      const idx2 = Math.floor(Math.random() * size);
      [arr[idx1], arr[idx2]] = [arr[idx2], arr[idx1]];
    }

    return arr;
  },

  // Performance benchmarking
  benchmark<T>(
    algorithm: (array: T[]) => T[],
    array: T[],
    iterations = 1000
  ): number {
    const start = performance.now();

    for (let i = 0; i < iterations; i++) {
      algorithm([...array]); // Clone array to avoid mutation
    }

    const end = performance.now();
    return (end - start) / iterations;
  },

  // Compare two algorithms
  compareAlgorithms<T>(
    algorithms: { name: string; fn: (array: T[]) => T[] }[],
    testArray: T[],
    iterations = 100
  ): { name: string; avgTime: number }[] {
    return algorithms.map(({ name, fn }) => ({
      name,
      avgTime: this.benchmark(fn, testArray, iterations),
    }));
  },
};
