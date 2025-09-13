import React, { useState, useCallback } from "react";
import { Node } from "reactflow";

import GraphCanvas from "./GraphCanvas";

interface GraphNode extends Node {
  data: {
    label: string;
    value?: number;
    visited?: boolean;
    inPath?: boolean;
    distance?: number;
  };
}

interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
  style?: React.CSSProperties;
  className?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  markerEnd?: any;
  label?: string | React.ReactNode;
  data?: {
    weight?: number;
    highlighted?: boolean;
    inPath?: boolean;
  };
}

interface GraphVisualizationProps {
  className?: string;
  onAlgorithmStart?: (algorithm: string, startNode?: string) => void;
  onAlgorithmComplete?: () => void;
}

// Sample graph data for demonstration
const createSampleNodes = (): GraphNode[] => [
  {
    id: "1",
    type: "default",
    position: { x: 100, y: 100 },
    data: { label: "1", visited: false, inPath: false },
  },
  {
    id: "2",
    type: "default",
    position: { x: 300, y: 100 },
    data: { label: "2", visited: false, inPath: false },
  },
  {
    id: "3",
    type: "default",
    position: { x: 200, y: 250 },
    data: { label: "3", visited: false, inPath: false },
  },
  {
    id: "4",
    type: "default",
    position: { x: 400, y: 200 },
    data: { label: "4", visited: false, inPath: false },
  },
  {
    id: "5",
    type: "default",
    position: { x: 500, y: 100 },
    data: { label: "5", visited: false, inPath: false },
  },
];

const createSampleEdges = (): GraphEdge[] => [
  {
    id: "1-2",
    source: "1",
    target: "2",
    label: "4",
    data: { weight: 4, highlighted: false, inPath: false },
  },
  {
    id: "1-3",
    source: "1",
    target: "3",
    label: "2",
    data: { weight: 2, highlighted: false, inPath: false },
  },
  {
    id: "2-4",
    source: "2",
    target: "4",
    label: "3",
    data: { weight: 3, highlighted: false, inPath: false },
  },
  {
    id: "3-4",
    source: "3",
    target: "4",
    label: "1",
    data: { weight: 1, highlighted: false, inPath: false },
  },
  {
    id: "4-5",
    source: "4",
    target: "5",
    label: "5",
    data: { weight: 5, highlighted: false, inPath: false },
  },
  {
    id: "2-5",
    source: "2",
    target: "5",
    label: "7",
    data: { weight: 7, highlighted: false, inPath: false },
  },
];

export default function GraphVisualization({
  className = "",
  onAlgorithmStart,
  onAlgorithmComplete,
}: GraphVisualizationProps) {
  const [nodes, setNodes] = useState<GraphNode[]>(createSampleNodes);
  const [edges, setEdges] = useState<GraphEdge[]>(createSampleEdges);
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<
    "dijkstra" | "bfs" | "dfs" | "mst" | ""
  >("");
  const [startNode, setStartNode] = useState<string>("1");

  // Handle node changes
  const handleNodesChange = useCallback((updatedNodes: GraphNode[]) => {
    setNodes(updatedNodes);
  }, []);

  // Handle edge changes
  const handleEdgesChange = useCallback((updatedEdges: GraphEdge[]) => {
    setEdges(updatedEdges);
  }, []);

  // Simulate BFS algorithm
  const simulateBFS = useCallback(
    async (startNodeId: string) => {
      setIsAnimating(true);
      const visited = new Set<string>();
      const queue = [startNodeId];

      // Reset all nodes
      const resetNodes = nodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          visited: false,
          inPath: false,
          distance: undefined,
        },
      }));
      setNodes(resetNodes);

      let step = 0;
      while (queue.length > 0) {
        const currentId = queue.shift()!;
        if (visited.has(currentId)) continue;

        visited.add(currentId);

        // Update node as visited
        setNodes((prevNodes) =>
          prevNodes.map((node) =>
            node.id === currentId
              ? {
                  ...node,
                  data: { ...node.data, visited: true, distance: step },
                }
              : node
          )
        );

        // Find adjacent nodes
        const adjacentNodes = edges
          .filter(
            (edge) => edge.source === currentId && !visited.has(edge.target)
          )
          .map((edge) => edge.target);

        queue.push(...adjacentNodes);
        step++;

        // Wait for animation
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      setIsAnimating(false);
      onAlgorithmComplete?.();
    },
    [nodes, edges, onAlgorithmComplete]
  );

  // Simulate DFS algorithm
  const simulateDFS = useCallback(
    async (startNodeId: string) => {
      setIsAnimating(true);
      const visited = new Set<string>();
      const stack = [startNodeId];

      // Reset all nodes
      const resetNodes = nodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          visited: false,
          inPath: false,
          distance: undefined,
        },
      }));
      setNodes(resetNodes);

      let step = 0;
      while (stack.length > 0) {
        const currentId = stack.pop()!;
        if (visited.has(currentId)) continue;

        visited.add(currentId);

        // Update node as visited
        setNodes((prevNodes) =>
          prevNodes.map((node) =>
            node.id === currentId
              ? {
                  ...node,
                  data: { ...node.data, visited: true, distance: step },
                }
              : node
          )
        );

        // Find adjacent nodes
        const adjacentNodes = edges
          .filter(
            (edge) => edge.source === currentId && !visited.has(edge.target)
          )
          .map((edge) => edge.target);

        stack.push(...adjacentNodes);
        step++;

        // Wait for animation
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      setIsAnimating(false);
      onAlgorithmComplete?.();
    },
    [nodes, edges, onAlgorithmComplete]
  );

  // Start algorithm simulation
  const startAlgorithm = useCallback(() => {
    if (!selectedAlgorithm || isAnimating) return;

    onAlgorithmStart?.(selectedAlgorithm, startNode);

    switch (selectedAlgorithm) {
      case "bfs":
        simulateBFS(startNode);
        break;
      case "dfs":
        simulateDFS(startNode);
        break;
      case "dijkstra":
        // TODO: Implement Dijkstra's algorithm
        console.log("Dijkstra's algorithm - TODO");
        break;
      case "mst":
        // TODO: Implement MST algorithm
        console.log("MST algorithm - TODO");
        break;
      default:
        break;
    }
  }, [
    selectedAlgorithm,
    startNode,
    isAnimating,
    onAlgorithmStart,
    simulateBFS,
    simulateDFS,
  ]);

  // Generate random graph
  const generateRandomGraph = useCallback(() => {
    if (isAnimating) return;

    const nodeCount = Math.floor(Math.random() * 5) + 5; // 5-10 nodes
    const newNodes: GraphNode[] = [];

    for (let i = 1; i <= nodeCount; i++) {
      newNodes.push({
        id: i.toString(),
        type: "default",
        position: {
          x: Math.random() * 600 + 50,
          y: Math.random() * 400 + 50,
        },
        data: {
          label: i.toString(),
          visited: false,
          inPath: false,
        },
      });
    }

    // Generate random edges
    const newEdges: GraphEdge[] = [];
    for (let i = 1; i <= nodeCount; i++) {
      const connections = Math.floor(Math.random() * 3) + 1; // 1-3 connections per node
      for (let j = 0; j < connections; j++) {
        const target = Math.floor(Math.random() * nodeCount) + 1;
        if (
          target !== i &&
          !newEdges.some(
            (e) =>
              (e.source === i.toString() && e.target === target.toString()) ||
              (e.source === target.toString() && e.target === i.toString())
          )
        ) {
          const weight = Math.floor(Math.random() * 10) + 1;
          newEdges.push({
            id: `${i}-${target}`,
            source: i.toString(),
            target: target.toString(),
            label: weight.toString(),
            data: { weight, highlighted: false, inPath: false },
          });
        }
      }
    }

    setNodes(newNodes);
    setEdges(newEdges);
  }, [isAnimating]);

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Control Panel */}
      <div className="flex flex-wrap gap-4 p-4 bg-white border-b shadow-sm">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Algorithm:</label>
          <select
            value={selectedAlgorithm}
            onChange={(e) =>
              setSelectedAlgorithm(e.target.value as typeof selectedAlgorithm)
            }
            disabled={isAnimating}
            className="px-3 py-1 border rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Algorithm</option>
            <option value="bfs">Breadth-First Search</option>
            <option value="dfs">Depth-First Search</option>
            <option value="dijkstra">Dijkstra's Algorithm</option>
            <option value="mst">Minimum Spanning Tree</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Start Node:</label>
          <select
            value={startNode}
            onChange={(e) => setStartNode(e.target.value)}
            disabled={isAnimating}
            className="px-3 py-1 border rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {nodes.map((node) => (
              <option key={node.id} value={node.id}>
                Node {node.data.label}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={startAlgorithm}
          disabled={!selectedAlgorithm || isAnimating}
          className="px-4 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isAnimating ? "Running..." : "Start Algorithm"}
        </button>

        <button
          onClick={generateRandomGraph}
          disabled={isAnimating}
          className="px-4 py-2 bg-green-500 text-white rounded text-sm hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Generate Random Graph
        </button>
      </div>

      {/* Graph Canvas */}
      <div className="flex-1">
        <GraphCanvas
          nodes={nodes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          algorithm={selectedAlgorithm === "" ? null : selectedAlgorithm}
          isAnimating={isAnimating}
          showWeights={true}
          directed={false}
        />
      </div>
    </div>
  );
}
