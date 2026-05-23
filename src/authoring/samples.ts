/**
 * Sample authored algorithms shipped with AlgoLens, useful both as
 * documentation for the {@link Emitter} API and as fixtures for the
 * golden-state tests.
 */

import type { AuthoredAlgorithm } from "@/authoring/emit";

/** Bubble sort, authored with the `emit()` API. */
export const bubbleSortAuthored: AuthoredAlgorithm<number[]> = (
  input,
  emitter
) => {
  const arr = [...input];
  emitter.snapshot(arr, { explain: "Start", pcLine: 1 });

  for (let i = 0; i < arr.length - 1; i++) {
    for (let j = 0; j < arr.length - i - 1; j++) {
      emitter.emit({
        array: [...arr],
        highlights: { compared: [j, j + 1] },
        explain: `Compare ${arr[j]} and ${arr[j + 1]}`,
        pcLine: 3,
      });
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        emitter.emit({
          array: [...arr],
          highlights: { swapped: [j, j + 1] },
          explain: "Swap",
          pcLine: 4,
        });
      }
    }
  }
  emitter.snapshot(arr, { explain: "Done", pcLine: -1 });
};

/** Linear search, demonstrating counters + watch. */
export const linearSearchAuthored: AuthoredAlgorithm<{
  array: number[];
  target: number;
}> = ({ array, target }, emitter) => {
  let comparisons = 0;
  emitter.emit({
    array: [...array],
    counters: { comparisons },
    watch: { target },
    explain: "Start linear search",
  });
  for (let i = 0; i < array.length; i++) {
    comparisons++;
    emitter.emit({
      array: [...array],
      highlights: { indices: [i] },
      counters: { comparisons },
      watch: { target, i, value: array[i] },
      explain: `Inspect index ${i}`,
    });
    if (array[i] === target) {
      emitter.emit({
        array: [...array],
        highlights: { indices: [i] },
        counters: { comparisons },
        watch: { target, foundAt: i },
        explain: `Found at index ${i}`,
      });
      return;
    }
  }
  emitter.emit({
    array: [...array],
    counters: { comparisons },
    watch: { target, foundAt: -1 },
    explain: "Not found",
  });
};

/** Factorial — exercises pushStack / popStack. */
export const factorialAuthored: AuthoredAlgorithm<number> = (n, emitter) => {
  const visit = (k: number): number => {
    emitter.pushStack({ name: `fact(${k})`, args: { k } });
    emitter.explain(`Enter fact(${k})`);
    let result: number;
    if (k <= 1) {
      result = 1;
      emitter.explain(`Base case → 1`);
    } else {
      result = k * visit(k - 1);
    }
    emitter.explain(`Return ${result}`, { watch: { k, result } });
    emitter.popStack();
    return result;
  };
  visit(n);
};
