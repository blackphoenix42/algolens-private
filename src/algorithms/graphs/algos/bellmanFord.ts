import type { Algorithm } from "@/engine/types";

export const run: Algorithm = function* bellmanFord(input: unknown) {
  const { graph, startNode } = input as {
    graph: number[][];
    startNode: number;
  };
  const n = graph.length;
  const edges: [number, number, number][] = [];
  for (let u = 0; u < n; u++) {
    for (const v of graph[u]) {
      edges.push([u, v, 1]);
    }
  }

  const distances = new Array<number>(n).fill(Infinity);
  distances[startNode] = 0;
  let relaxations = 0;

  yield {
    array: [...distances.map((d) => (d === Infinity ? -1 : d))],
    highlights: {},
    counters: { relaxations: 0 },
    explain: `Starting Bellman-Ford from node ${startNode}. Initialize distances.`,
    pcLine: 1,
  };

  for (let i = 0; i < n - 1; i++) {
    yield {
      array: [...distances.map((d) => (d === Infinity ? -1 : d))],
      highlights: {},
      counters: { relaxations },
      explain: `Iteration ${i + 1}/${n - 1}: Relaxing all edges`,
      pcLine: 2,
    };

    for (const [u, v, w] of edges) {
      if (distances[u] !== Infinity && distances[u] + w < distances[v]) {
        distances[v] = distances[u] + w;
        relaxations++;
        yield {
          array: [...distances.map((d) => (d === Infinity ? -1 : d))],
          highlights: { indices: [u, v] },
          counters: { relaxations },
          explain: `Relax ${u}->${v}: distance[${v}] = ${distances[v]}`,
          pcLine: 4,
        };
      }
    }
  }

  yield {
    array: [...distances.map((d) => (d === Infinity ? -1 : d))],
    highlights: {},
    counters: { relaxations },
    explain: `Bellman-Ford completed. Shortest distances from node ${startNode}.`,
    pcLine: -1,
  };
};
