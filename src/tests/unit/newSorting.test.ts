import { run as bucketSort } from "../../algorithms/sorting/algos/bucketSort";
import { run as countingSort } from "../../algorithms/sorting/algos/countingSort";
import { run as heapSort } from "../../algorithms/sorting/algos/heapSort";
import { run as radixSort } from "../../algorithms/sorting/algos/radixSort";
import { run as shellSort } from "../../algorithms/sorting/algos/shellSort";
import type { Algorithm } from "../../engine/types";
import { testSortingAlgorithm } from "../helpers/algorithmTestUtils";

function adaptAlgorithm(algorithm: Algorithm) {
  return (arr: number[]) => algorithm(arr, { seed: 42 });
}

testSortingAlgorithm("Heap Sort", adaptAlgorithm(heapSort));
testSortingAlgorithm("Shell Sort", adaptAlgorithm(shellSort));
testSortingAlgorithm("Counting Sort", adaptAlgorithm(countingSort));
testSortingAlgorithm("Radix Sort", adaptAlgorithm(radixSort));
testSortingAlgorithm("Bucket Sort", adaptAlgorithm(bucketSort));
