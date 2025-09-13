import { describe, expect, it } from "vitest";

import { run as bubbleSort } from "../../algorithms/sorting/algos/bubbleSort";
import { run as insertionSort } from "../../algorithms/sorting/algos/insertionSort";
import { run as mergeSort } from "../../algorithms/sorting/algos/mergeSort";
import { run as quickSort } from "../../algorithms/sorting/algos/quickSort";
import { run as selectionSort } from "../../algorithms/sorting/algos/selectionSort";
import type { Algorithm, Frame } from "../../engine/types";
import { expectedResults, testArrays } from "../fixtures/testArrays";
import {
  getFinalArray,
  testSortingAlgorithm,
} from "../helpers/algorithmTestUtils";

// Convert Algorithm type to simpler array input function for testing
function adaptAlgorithm(algorithm: Algorithm) {
  return (arr: number[]) => algorithm(arr, { seed: 42 });
}

testSortingAlgorithm("Bubble Sort", adaptAlgorithm(bubbleSort));
testSortingAlgorithm("Selection Sort", adaptAlgorithm(selectionSort));
testSortingAlgorithm("Insertion Sort", adaptAlgorithm(insertionSort));
testSortingAlgorithm("Merge Sort", adaptAlgorithm(mergeSort));
testSortingAlgorithm("Quick Sort", adaptAlgorithm(quickSort));

describe("Sorting Algorithm Performance", () => {
  it("should handle large arrays efficiently", () => {
    // Test that algorithms can handle larger arrays without throwing
    expect(() =>
      Array.from(bubbleSort(testArrays.large, { seed: 42 }))
    ).not.toThrow();
    expect(() =>
      Array.from(selectionSort(testArrays.large, { seed: 42 }))
    ).not.toThrow();
    expect(() =>
      Array.from(insertionSort(testArrays.large, { seed: 42 }))
    ).not.toThrow();
    expect(() =>
      Array.from(mergeSort(testArrays.large, { seed: 42 }))
    ).not.toThrow();
    expect(() =>
      Array.from(quickSort(testArrays.large, { seed: 42 }))
    ).not.toThrow();
  });

  it("should produce sorted output for all algorithms", () => {
    const algorithms = [
      bubbleSort,
      selectionSort,
      insertionSort,
      mergeSort,
      quickSort,
    ];

    algorithms.forEach((algorithm) => {
      const frames = Array.from(
        algorithm([...testArrays.random], { seed: 42 })
      );
      const finalArray = getFinalArray(frames as Frame[]);
      expect(finalArray).toEqual(expectedResults.random);
    });
  });
});
