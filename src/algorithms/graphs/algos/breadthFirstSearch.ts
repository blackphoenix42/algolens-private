import type { Algorithm } from "@/engine/types";

export const run: Algorithm = function* breadthFirstSearch(input: unknown) {
  const { graph, startNode } = input as {
    graph: number[][];
    startNode: number;
  };
  const visited = new Set<number>();
  const queue = [startNode];
  const visitOrder: number[] = [];

  yield {
    array: [...visitOrder],
    highlights: {},
    explain: `Starting BFS from node ${startNode}`,
    pcLine: 0,
  };

  while (queue.length > 0) {
    const currentNode = queue.shift()!;

    if (!visited.has(currentNode)) {
      visited.add(currentNode);
      visitOrder.push(currentNode);

      yield {
        array: [...visitOrder],
        highlights: {
          indices: [visitOrder.length - 1],
        },
        explain: `Visiting node ${currentNode}`,
        pcLine: 1,
      };

      // Add unvisited neighbors to queue
      for (const neighbor of graph[currentNode]) {
        if (!visited.has(neighbor) && !queue.includes(neighbor)) {
          queue.push(neighbor);
        }
      }

      yield {
        array: [...visitOrder],
        highlights: {
          indices: [visitOrder.length - 1],
        },
        explain: `Added neighbors of node ${currentNode} to queue`,
        pcLine: 2,
      };
    }
  }

  yield {
    array: [...visitOrder],
    highlights: {},
    explain: `BFS completed. Visited nodes: ${visitOrder.join(", ")}`,
    pcLine: -1,
  };
};
