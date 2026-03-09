import type { Algorithm } from "@/engine/types";

function find(parent: number[], x: number): number {
  let root = x;
  while (parent[root] !== root) root = parent[root];
  // Path compression
  while (parent[x] !== root) {
    const next = parent[x];
    parent[x] = root;
    x = next;
  }
  return root;
}

function union(
  parent: number[],
  rank: number[],
  x: number,
  y: number
): boolean {
  const px = find(parent, x);
  const py = find(parent, y);
  if (px === py) return false;
  if (rank[px] < rank[py]) {
    parent[px] = py;
  } else if (rank[px] > rank[py]) {
    parent[py] = px;
  } else {
    parent[py] = px;
    rank[px]++;
  }
  return true;
}

export const run: Algorithm = function* kruskalMST(input: unknown) {
  const { graph } = input as {
    graph: number[][];
    startNode: number;
  };
  const n = graph.length;
  const edges: [number, number, number][] = [];
  for (let u = 0; u < n; u++) {
    for (const v of graph[u]) {
      if (u < v) edges.push([u, v, 1]);
    }
  }
  edges.sort((a, b) => a[2] - b[2]);

  const parent = Array.from({ length: n }, (_, i) => i);
  const rank = new Array<number>(n).fill(0);
  const mstEdges: [number, number][] = [];
  const mstArray: number[] = [];
  let edgesAdded = 0;

  yield {
    array: [...mstArray],
    highlights: {},
    counters: { edgesAdded: 0 },
    explain: `Starting Kruskal's MST. Edges sorted by weight.`,
    pcLine: 1,
  };

  for (const [u, v, w] of edges) {
    if (edgesAdded >= n - 1) break;

    yield {
      array: [...mstArray],
      highlights: {},
      counters: { edgesAdded },
      explain: `Considering edge ${u}-${v} (weight ${w})`,
      pcLine: 2,
    };

    if (union(parent, rank, u, v)) {
      mstEdges.push([u, v]);
      mstArray.push(u, v);
      edgesAdded++;

      yield {
        array: [...mstArray],
        highlights: { indices: [mstArray.length - 2, mstArray.length - 1] },
        counters: { edgesAdded },
        explain: `Add edge ${u}-${v} to MST (no cycle)`,
        pcLine: 4,
      };
    } else {
      yield {
        array: [...mstArray],
        highlights: {},
        counters: { edgesAdded },
        explain: `Skip edge ${u}-${v} (would create cycle)`,
        pcLine: 5,
      };
    }
  }

  yield {
    array: [...mstArray],
    highlights: {},
    counters: { edgesAdded },
    explain: `Kruskal's MST completed. Selected ${edgesAdded} edges.`,
    pcLine: -1,
  };
};
