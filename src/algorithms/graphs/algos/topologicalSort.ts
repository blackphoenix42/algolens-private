import type { Algorithm } from "@/engine/types";

export const run: Algorithm = function* topologicalSort(input: unknown) {
  const { graph } = input as {
    graph: number[][];
    startNode: number;
  };
  const n = graph.length;
  const inDegree = new Array<number>(n).fill(0);

  for (let u = 0; u < n; u++) {
    for (const v of graph[u]) {
      inDegree[v]++;
    }
  }

  const result: number[] = [];
  const queue: number[] = [];

  yield {
    array: [...result],
    highlights: {},
    explain: `Starting Kahn's Topological Sort. Computing in-degrees.`,
    pcLine: 1,
  };

  for (let i = 0; i < n; i++) {
    if (inDegree[i] === 0) {
      queue.push(i);
    }
  }

  yield {
    array: [...result],
    highlights: {},
    explain: `Nodes with in-degree 0: [${queue.join(", ")}]`,
    pcLine: 2,
  };

  while (queue.length > 0) {
    const u = queue.shift()!;
    result.push(u);

    yield {
      array: [...result],
      highlights: { indices: [result.length - 1] },
      explain: `Processing node ${u}, adding to result`,
      pcLine: 3,
    };

    for (const v of graph[u]) {
      inDegree[v]--;
      if (inDegree[v] === 0) {
        queue.push(v);
        yield {
          array: [...result],
          highlights: { indices: [result.length - 1] },
          explain: `Decrement in-degree of ${v}, add to queue`,
          pcLine: 5,
        };
      }
    }
  }

  yield {
    array: [...result],
    highlights: {},
    explain: `Topological order: [${result.join(", ")}]`,
    pcLine: -1,
  };
};
