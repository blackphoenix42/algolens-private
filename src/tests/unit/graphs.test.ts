import { describe, expect, it } from "vitest";

import { run as bellmanFord } from "../../algorithms/graphs/algos/bellmanFord";
import { run as dijkstra } from "../../algorithms/graphs/algos/dijkstra";
import { run as kruskalMST } from "../../algorithms/graphs/algos/kruskalMST";
import { run as topologicalSort } from "../../algorithms/graphs/algos/topologicalSort";
import type { Frame } from "../../engine/types";

function runGraphAlgo(
  algorithm: (input: unknown) => Generator<Frame>,
  input: { graph: number[][]; startNode: number }
): Frame[] {
  return Array.from(algorithm(input));
}

describe("Dijkstra", () => {
  it("generates frames on a simple graph", () => {
    const graph = [
      [1, 2],
      [0, 2],
      [0, 1],
    ];
    const frames = runGraphAlgo(dijkstra, { graph, startNode: 0 });
    expect(frames.length).toBeGreaterThan(0);
  });

  it("handles single node graph", () => {
    const graph: number[][] = [[]];
    const frames = runGraphAlgo(dijkstra, { graph, startNode: 0 });
    expect(frames.length).toBeGreaterThan(0);
  });

  it("each frame has array field", () => {
    const graph = [
      [1, 2],
      [0, 2],
      [0, 1],
    ];
    const frames = runGraphAlgo(dijkstra, { graph, startNode: 0 });
    frames.forEach((frame) => {
      expect(frame).toHaveProperty("array");
      expect(Array.isArray(frame.array)).toBe(true);
    });
  });

  it("each frame has explain field", () => {
    const graph = [
      [1, 2],
      [0, 2],
      [0, 1],
    ];
    const frames = runGraphAlgo(dijkstra, { graph, startNode: 0 });
    frames.forEach((frame) => {
      expect(frame).toHaveProperty("explain");
      expect(typeof frame.explain).toBe("string");
    });
  });

  it("generates proper highlights", () => {
    const graph = [
      [1, 2],
      [0, 2],
      [0, 1],
    ];
    const frames = runGraphAlgo(dijkstra, { graph, startNode: 0 });
    const frameWithHighlights = frames.find(
      (f) => f.highlights && (f.highlights.indices?.length ?? 0) > 0
    );
    expect(frameWithHighlights).toBeDefined();
  });
});

describe("Bellman-Ford", () => {
  it("generates frames on a simple graph", () => {
    const graph = [
      [1, 2],
      [0, 2],
      [0, 1],
    ];
    const frames = runGraphAlgo(bellmanFord, { graph, startNode: 0 });
    expect(frames.length).toBeGreaterThan(0);
  });

  it("handles single node graph", () => {
    const graph: number[][] = [[]];
    const frames = runGraphAlgo(bellmanFord, { graph, startNode: 0 });
    expect(frames.length).toBeGreaterThan(0);
  });

  it("each frame has array field", () => {
    const graph = [
      [1, 2],
      [0, 2],
      [0, 1],
    ];
    const frames = runGraphAlgo(bellmanFord, { graph, startNode: 0 });
    frames.forEach((frame) => {
      expect(frame).toHaveProperty("array");
      expect(Array.isArray(frame.array)).toBe(true);
    });
  });

  it("each frame has explain field", () => {
    const graph = [
      [1, 2],
      [0, 2],
      [0, 1],
    ];
    const frames = runGraphAlgo(bellmanFord, { graph, startNode: 0 });
    frames.forEach((frame) => {
      expect(frame).toHaveProperty("explain");
      expect(typeof frame.explain).toBe("string");
    });
  });

  it("generates proper highlights", () => {
    const graph = [
      [1, 2],
      [0, 2],
      [0, 1],
    ];
    const frames = runGraphAlgo(bellmanFord, { graph, startNode: 0 });
    const frameWithHighlights = frames.find(
      (f) => f.highlights && (f.highlights.indices?.length ?? 0) > 0
    );
    expect(frameWithHighlights).toBeDefined();
  });
});

describe("Topological Sort", () => {
  it("generates frames on a DAG", () => {
    const graph = [[1, 2], [2], []];
    const frames = runGraphAlgo(topologicalSort, { graph, startNode: 0 });
    expect(frames.length).toBeGreaterThan(0);
  });

  it("handles single node graph", () => {
    const graph: number[][] = [[]];
    const frames = runGraphAlgo(topologicalSort, { graph, startNode: 0 });
    expect(frames.length).toBeGreaterThan(0);
  });

  it("each frame has array field", () => {
    const graph = [[1, 2], [2], []];
    const frames = runGraphAlgo(topologicalSort, { graph, startNode: 0 });
    frames.forEach((frame) => {
      expect(frame).toHaveProperty("array");
      expect(Array.isArray(frame.array)).toBe(true);
    });
  });

  it("each frame has explain field", () => {
    const graph = [[1, 2], [2], []];
    const frames = runGraphAlgo(topologicalSort, { graph, startNode: 0 });
    frames.forEach((frame) => {
      expect(frame).toHaveProperty("explain");
      expect(typeof frame.explain).toBe("string");
    });
  });

  it("generates proper highlights", () => {
    const graph = [[1, 2], [2], []];
    const frames = runGraphAlgo(topologicalSort, { graph, startNode: 0 });
    const frameWithHighlights = frames.find(
      (f) => f.highlights && (f.highlights.indices?.length ?? 0) > 0
    );
    expect(frameWithHighlights).toBeDefined();
  });
});

describe("Kruskal MST", () => {
  it("generates frames on a simple graph", () => {
    const graph = [
      [1, 2],
      [0, 2],
      [0, 1],
    ];
    const frames = runGraphAlgo(kruskalMST, { graph, startNode: 0 });
    expect(frames.length).toBeGreaterThan(0);
  });

  it("handles single node graph", () => {
    const graph: number[][] = [[]];
    const frames = runGraphAlgo(kruskalMST, { graph, startNode: 0 });
    expect(frames.length).toBeGreaterThan(0);
  });

  it("each frame has array field", () => {
    const graph = [
      [1, 2],
      [0, 2],
      [0, 1],
    ];
    const frames = runGraphAlgo(kruskalMST, { graph, startNode: 0 });
    frames.forEach((frame) => {
      expect(frame).toHaveProperty("array");
      expect(Array.isArray(frame.array)).toBe(true);
    });
  });

  it("each frame has explain field", () => {
    const graph = [
      [1, 2],
      [0, 2],
      [0, 1],
    ];
    const frames = runGraphAlgo(kruskalMST, { graph, startNode: 0 });
    frames.forEach((frame) => {
      expect(frame).toHaveProperty("explain");
      expect(typeof frame.explain).toBe("string");
    });
  });

  it("generates proper highlights", () => {
    const graph = [
      [1, 2],
      [0, 2],
      [0, 1],
    ];
    const frames = runGraphAlgo(kruskalMST, { graph, startNode: 0 });
    const frameWithHighlights = frames.find(
      (f) => f.highlights && (f.highlights.indices?.length ?? 0) > 0
    );
    expect(frameWithHighlights).toBeDefined();
  });
});
