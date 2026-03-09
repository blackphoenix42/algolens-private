import type { Algorithm } from "@/engine/types";

export const run: Algorithm = function* dijkstra(input: unknown) {
  const { graph, startNode } = input as {
    graph: number[][];
    startNode: number;
  };
  const n = graph.length;
  const distances = new Array<number>(n).fill(Infinity);
  distances[startNode] = 0;
  const visited = new Set<number>();
  let relaxations = 0;

  yield {
    array: [...distances.map((d) => (d === Infinity ? -1 : d))],
    highlights: {},
    counters: { relaxations: 0 },
    explain: `Starting Dijkstra from node ${startNode}. Initialize distances.`,
    pcLine: 1,
  };

  const pq: { node: number; dist: number }[] = [{ node: startNode, dist: 0 }];

  while (pq.length > 0) {
    pq.sort((a, b) => a.dist - b.dist);
    const { node: u } = pq.shift()!;

    if (visited.has(u)) continue;
    visited.add(u);

    yield {
      array: [...distances.map((d) => (d === Infinity ? -1 : d))],
      highlights: { indices: [u] },
      counters: { relaxations },
      explain: `Processing node ${u} (distance: ${distances[u]})`,
      pcLine: 2,
    };

    for (const v of graph[u]) {
      const weight = 1;
      const newDist = distances[u] + weight;
      if (newDist < distances[v]) {
        distances[v] = newDist;
        relaxations++;
        pq.push({ node: v, dist: newDist });
        yield {
          array: [...distances.map((d) => (d === Infinity ? -1 : d))],
          highlights: { indices: [u, v] },
          counters: { relaxations },
          explain: `Relax edge ${u}->${v}: distance[${v}] = ${newDist}`,
          pcLine: 4,
        };
      }
    }
  }

  yield {
    array: [...distances.map((d) => (d === Infinity ? -1 : d))],
    highlights: {},
    counters: { relaxations },
    explain: `Dijkstra completed. Shortest distances from node ${startNode}.`,
    pcLine: -1,
  };
};
