import type { Algorithm } from "@/engine/types";

export const run: Algorithm = function* depthFirstSearch(input: unknown) {
  const { graph, startNode } = input as {
    graph: number[][];
    startNode: number;
  };
  const visited = new Set<number>();
  const stack = [startNode];
  const visitOrder: number[] = [];

  yield {
    array: [...visitOrder],
    highlights: {},
    explain: `Starting DFS from node ${startNode}`,
    pcLine: 0,
  };

  while (stack.length > 0) {
    const currentNode = stack.pop()!;

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

      // Add neighbors to stack (in reverse order to maintain left-to-right traversal)
      for (let i = graph[currentNode].length - 1; i >= 0; i--) {
        const neighbor = graph[currentNode][i];
        if (!visited.has(neighbor)) {
          stack.push(neighbor);
        }
      }

      yield {
        array: [...visitOrder],
        highlights: {
          indices: [visitOrder.length - 1],
        },
        explain: `Added neighbors of node ${currentNode} to stack`,
        pcLine: 2,
      };
    }
  }

  yield {
    array: [...visitOrder],
    highlights: {},
    explain: `DFS completed. Visited nodes: ${visitOrder.join(", ")}`,
    pcLine: -1,
  };
};
