import React, { useCallback, useState, useEffect } from "react";
import {
  ReactFlow,
  Node,
  addEdge,
  ConnectionLineType,
  Panel,
  useNodesState,
  useEdgesState,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  Connection,
  MarkerType,
  NodeChange,
  EdgeChange,
} from "reactflow";
import "reactflow/dist/style.css";

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
  markerEnd?: any; // Using any for compatibility with ReactFlow's EdgeMarkerType
  label?: string | React.ReactNode;
  data?: {
    weight?: number;
    highlighted?: boolean;
    inPath?: boolean;
  };
}

interface GraphCanvasProps {
  nodes?: GraphNode[];
  edges?: GraphEdge[];
  onNodesChange?: (nodes: GraphNode[]) => void;
  onEdgesChange?: (edges: GraphEdge[]) => void;
  algorithm?: "dijkstra" | "bfs" | "dfs" | "mst" | null;
  isAnimating?: boolean;
  showWeights?: boolean;
  directed?: boolean;
  className?: string;
}

const nodeTypes = {
  default: ({
    data,
    selected,
  }: {
    data: GraphNode["data"];
    selected: boolean;
  }) => (
    <div
      className={`px-4 py-2 shadow-md rounded-full bg-white border-2 transition-all duration-300 ${
        data.visited
          ? "border-green-500 bg-green-100"
          : data.inPath
            ? "border-blue-500 bg-blue-100"
            : selected
              ? "border-purple-500"
              : "border-gray-300"
      }`}
    >
      <div className="flex flex-col items-center">
        <div className="font-bold text-sm">{data.label}</div>
        {data.distance !== undefined && (
          <div className="text-xs text-gray-600">{data.distance}</div>
        )}
      </div>
    </div>
  ),
};

export default function GraphCanvas({
  nodes: initialNodes = [],
  edges: initialEdges = [],
  onNodesChange,
  onEdgesChange,
  algorithm = null,
  isAnimating = false,
  showWeights = true,
  directed = false,
  className = "",
}: GraphCanvasProps) {
  const [nodes, setNodes, onNodesStateChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesStateChange] = useEdgesState(initialEdges);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState(algorithm);

  // Update nodes and edges when props change
  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);

  useEffect(() => {
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);

  // Handle new connections (edge creation)
  const onConnect = useCallback(
    (params: Connection) => {
      if (!params.source || !params.target) return;

      const newEdge: GraphEdge = {
        ...params,
        id: `${params.source}-${params.target}`,
        source: params.source,
        target: params.target,
        type: "default",
        markerEnd: directed ? { type: MarkerType.ArrowClosed } : undefined,
        data: {
          weight: Math.floor(Math.random() * 10) + 1,
          highlighted: false,
          inPath: false,
        },
        label: showWeights
          ? `${Math.floor(Math.random() * 10) + 1}`
          : undefined,
      };

      const updatedEdges = addEdge(newEdge, edges);
      setEdges(updatedEdges);
      onEdgesChange?.(updatedEdges);
    },
    [edges, directed, showWeights, setEdges, onEdgesChange]
  );

  // Handle node changes
  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      onNodesStateChange(changes);
      onNodesChange?.(nodes);
    },
    [onNodesStateChange, onNodesChange, nodes]
  );

  // Handle edge changes
  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      onEdgesStateChange(changes);
      onEdgesChange?.(edges);
    },
    [onEdgesStateChange, onEdgesChange, edges]
  );

  // Add a new node
  const addNode = useCallback(() => {
    const newNode: GraphNode = {
      id: `node-${nodes.length + 1}`,
      type: "default",
      position: {
        x: Math.random() * 300 + 100,
        y: Math.random() * 300 + 100,
      },
      data: {
        label: `${nodes.length + 1}`,
        visited: false,
        inPath: false,
      },
    };

    const updatedNodes = [...nodes, newNode];
    setNodes(updatedNodes);
    onNodesChange?.(updatedNodes);
  }, [nodes, setNodes, onNodesChange]);

  // Clear all highlighting
  const clearHighlighting = useCallback(() => {
    const clearedNodes = nodes.map((node) => ({
      ...node,
      data: {
        ...node.data,
        visited: false,
        inPath: false,
        distance: undefined,
      },
    }));

    const clearedEdges = edges.map((edge) => ({
      ...edge,
      data: {
        ...edge.data,
        highlighted: false,
        inPath: false,
      },
    }));

    setNodes(clearedNodes);
    setEdges(clearedEdges);
    onNodesChange?.(clearedNodes);
    onEdgesChange?.(clearedEdges);
  }, [nodes, edges, setNodes, setEdges, onNodesChange, onEdgesChange]);

  return (
    <div className={`w-full h-full ${className}`}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        connectionLineType={ConnectionLineType.SmoothStep}
        fitView
        className="bg-gray-50"
      >
        <Controls />
        <MiniMap />
        <Background variant={BackgroundVariant.Dots} />

        <Panel
          position="top-left"
          className="bg-white p-4 rounded-lg shadow-md"
        >
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Graph Controls</h3>
            <div className="flex flex-col gap-2">
              <button
                onClick={addNode}
                disabled={isAnimating}
                className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:opacity-50"
              >
                Add Node
              </button>
              <button
                onClick={clearHighlighting}
                disabled={isAnimating}
                className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 disabled:opacity-50"
              >
                Clear Highlights
              </button>
            </div>
            <div className="text-xs text-gray-600 mt-2">
              <p>• Drag nodes to reposition</p>
              <p>• Click and drag to connect nodes</p>
              <p>• Select nodes/edges to delete</p>
            </div>
          </div>
        </Panel>

        <Panel
          position="top-right"
          className="bg-white p-4 rounded-lg shadow-md"
        >
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Algorithm</h3>
            <select
              value={selectedAlgorithm || ""}
              onChange={(e) =>
                setSelectedAlgorithm(
                  e.target.value === ""
                    ? null
                    : (e.target.value as "dijkstra" | "bfs" | "dfs" | "mst")
                )
              }
              className="w-full p-2 border rounded text-sm"
              disabled={isAnimating}
            >
              <option value="">Select Algorithm</option>
              <option value="bfs">Breadth-First Search</option>
              <option value="dfs">Depth-First Search</option>
              <option value="dijkstra">Dijkstra's Algorithm</option>
              <option value="mst">Minimum Spanning Tree</option>
            </select>

            <div className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={directed}
                onChange={() => {
                  /* Handle directed graph toggle */
                }}
                disabled={isAnimating}
              />
              <label>Directed Graph</label>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showWeights}
                onChange={() => {
                  /* Handle weights toggle */
                }}
                disabled={isAnimating}
              />
              <label>Show Weights</label>
            </div>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}
