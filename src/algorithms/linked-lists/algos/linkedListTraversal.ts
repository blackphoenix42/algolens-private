import type { Algorithm } from "@/engine/types";

export const run: Algorithm = function* linkedListTraversal(input: unknown) {
  const arr = input as number[];
  const visitedOrder: number[] = [];

  yield {
    array: [...arr],
    highlights: {},
    explain: "Starting linked list traversal.",
    pcLine: 1,
  };

  for (let i = 0; i < arr.length; i++) {
    yield {
      array: [...arr],
      highlights: { indices: [i] },
      explain: `Visiting node at index ${i} (value: ${arr[i]})`,
      pcLine: 2,
    };

    visitedOrder.push(arr[i]);

    yield {
      array: [...arr],
      highlights: { indices: [i] },
      counters: { visited: visitedOrder.length },
      explain: `Added ${arr[i]} to visited order. Visited: [${visitedOrder.join(", ")}]`,
      pcLine: 3,
    };
  }

  yield {
    array: [...arr],
    highlights: {},
    explain: `Traversal completed! Visited order: [${visitedOrder.join(", ")}]`,
    pcLine: -1,
  };
};
