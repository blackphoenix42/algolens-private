// src/components/canvas/EnhancedArrayVisualization.tsx
import React, {
  useMemo,
  useState,
  useRef,
  useCallback,
  useImperativeHandle,
  forwardRef,
  useEffect,
} from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  Cell,
  LabelList,
} from "recharts";

import { cn } from "@/utils";

type Highlights = {
  compared?: [number, number];
  swapped?: [number, number];
  pivot?: number;
  indices?: number[];
};

type Colors = {
  base: string;
  compared: string;
  swapped: string;
  pivot: string;
  highlighted: string;
};

type View = "bars" | "dots" | "table";
type ColorMode = "plain" | "rainbow" | "value" | "custom";

export type EnhancedArrayVisualizationHandle = {
  zoomIn: () => void;
  zoomOut: () => void;
  resetView: () => void;
  toggleGrid: () => void;
  toggleSnap: () => void;
  setPanMode: (on: boolean) => void;
  rotate90: () => void;
  setDragEnabled: (on: boolean) => void;
  centerBars: () => void;
};

interface EnhancedArrayVisualizationProps {
  array: number[];
  highlights?: Highlights;
  viewMode: View;
  colorMode: ColorMode;
  colors: Colors;
  showLabels: boolean;
  height?: number | string;
  onReorder?: (next: number[]) => void;
  className?: string;
  panModeExternal?: boolean;
  dragEnabled?: boolean;
  onViewChange?: (s: {
    grid: boolean;
    snap: boolean;
    pan: boolean;
    drag: boolean;
  }) => void;
  showPlane?: boolean;
}

interface TooltipData {
  index: number;
  value: number;
  name: string;
  originalIndex: number;
}

interface TooltipData {
  index: number;
  value: number;
  name: string;
  originalIndex: number;
}

const EnhancedArrayVisualization = forwardRef<
  EnhancedArrayVisualizationHandle,
  EnhancedArrayVisualizationProps
>(function EnhancedArrayVisualization(
  {
    array,
    highlights,
    viewMode,
    colorMode,
    colors,
    showLabels,
    height = 400,
    className,
    onReorder,
    panModeExternal,
    dragEnabled = true,
    onViewChange,
  },
  ref
) {
  // State for interactive features
  const [scale, setScale] = useState(1);
  const [gridEnabled, setGridEnabled] = useState(true);
  const [snapEnabled, setSnapEnabled] = useState(false);
  const [panMode, setPanMode] = useState(false);
  const [dragOn, setDragOn] = useState(dragEnabled);
  const [angle, setAngle] = useState(0);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [tempArray, setTempArray] = useState<number[] | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dropTargetIdx, setDropTargetIdx] = useState<number | null>(null);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const rotatorRef = useRef<HTMLDivElement>(null);
  const draggedIndexRef = useRef<number | null>(null);
  const currentDropTargetRef = useRef<number | null>(null);
  const isDragActiveRef = useRef<boolean>(false);
  const dragStartTimeRef = useRef<number>(0);
  const lastMoveTimeRef = useRef<number>(0);

  // Zoom functionality
  const zoomAt = useCallback((factor: number) => {
    setScale((prevScale) => Math.min(3, Math.max(0.5, prevScale * factor)));
  }, []);

  const centerBars = useCallback(() => {
    // Center logic for charts - this is handled by ResponsiveContainer
    // but we can provide visual feedback
  }, []);

  // Imperative handle for external controls
  useImperativeHandle(
    ref,
    () => ({
      zoomIn: () => zoomAt(1.2),
      zoomOut: () => zoomAt(1 / 1.2),
      resetView: () => {
        setScale(1);
        setAngle(0);
      },
      toggleGrid: () => setGridEnabled((g) => !g),
      toggleSnap: () => setSnapEnabled((s) => !s),
      setPanMode: (on: boolean) => setPanMode(on),
      rotate90: () => setAngle((a) => (a + 90) % 360),
      setDragEnabled: (on: boolean) => setDragOn(on),
      centerBars,
    }),
    [zoomAt, centerBars]
  );

  // External control synchronization
  useEffect(() => {
    if (typeof panModeExternal === "boolean") setPanMode(panModeExternal);
  }, [panModeExternal]);

  useEffect(() => {
    onViewChange?.({
      grid: gridEnabled,
      snap: snapEnabled,
      pan: panMode,
      drag: dragOn,
    });
  }, [gridEnabled, snapEnabled, panMode, dragOn, onViewChange]);

  // Cleanup effect to ensure no lingering event listeners
  useEffect(() => {
    return () => {
      // Cleanup any remaining global event listeners on unmount
      const cleanupGlobalListeners = () => {
        // This is a safety net - the event listeners should be removed in handleGlobalMouseUp
        const allMouseMoveListeners = document.querySelectorAll(
          '[data-dragging="true"]'
        );
        allMouseMoveListeners.forEach((el) =>
          el.removeAttribute("data-dragging")
        );
      };
      cleanupGlobalListeners();
    };
  }, []);

  // Drag and drop handlers
  const handleDragStart = useCallback(
    (index: number) => {
      if (!dragOn || panMode) return;
      setDragIdx(index);
      setTempArray([...array]);
      setIsDragging(true);
    },
    [dragOn, panMode, array]
  );

  const renderArray = tempArray ?? array;

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, index: number) => {
      if (!dragOn || panMode) return; // Remove isDragging check for faster response
      e.preventDefault();
      e.stopPropagation();

      // Force cleanup any existing drag state immediately
      if (isDragActiveRef.current) {
        isDragActiveRef.current = false;
        draggedIndexRef.current = null;
        currentDropTargetRef.current = null;
      }

      // Set up new drag state immediately
      isDragActiveRef.current = true;
      draggedIndexRef.current = index;
      currentDropTargetRef.current = index;
      dragStartTimeRef.current = Date.now();

      // Update React state
      setIsDragging(true);
      setDragIdx(index);
      setTempArray([...array]);
      setDropTargetIdx(index);
      handleDragStart(index);

      // Add global mouse event listeners for robust drag handling
      const handleGlobalMouseMove = (globalE: MouseEvent) => {
        // Use refs for immediate state checking - no React state delays
        const wrapper = wrapperRef.current;
        const draggedIdx = draggedIndexRef.current;
        const isActive = isDragActiveRef.current;

        if (!wrapper || draggedIdx === null || !isActive) return;

        // Lightweight throttling for extremely fast movements (max 60fps)
        const now = Date.now();
        if (now - lastMoveTimeRef.current < 16) return; // ~60fps throttling
        lastMoveTimeRef.current = now;

        // Prevent default to avoid any browser interference
        globalE.preventDefault();

        const rect = wrapper.getBoundingClientRect();
        const x = globalE.clientX - rect.left;
        const y = globalE.clientY - rect.top;

        // More lenient boundary checking for fast movements
        const maxDistance = 300; // Increased from 200px
        if (
          x < -maxDistance ||
          x > rect.width + maxDistance ||
          y < -maxDistance ||
          y > rect.height + maxDistance
        ) {
          // Only auto-cancel if dragging has been active for at least 100ms
          // This prevents accidental cancellation on fast initial movements
          if (Date.now() - dragStartTimeRef.current > 100) {
            handleGlobalMouseUp();
            return;
          }
        }

        // Improved position calculation for fast movements
        let newIdx: number;
        const barWidth = rect.width / array.length;

        if (x < 0) {
          // Dragging to the left - use proportional distance for better feel
          const distanceLeft = Math.abs(x);
          newIdx =
            distanceLeft > barWidth * 0.5 ? 0 : Math.floor(-x / barWidth);
          newIdx = Math.max(0, draggedIdx - Math.abs(newIdx));
        } else if (x > rect.width) {
          // Dragging to the right - use proportional distance
          const distanceRight = x - rect.width;
          newIdx =
            distanceRight > barWidth * 0.5
              ? array.length - 1
              : Math.ceil(distanceRight / barWidth);
          newIdx = Math.min(array.length - 1, draggedIdx + newIdx);
        } else {
          // Normal calculation within bounds
          newIdx = Math.floor(x / barWidth);
        }

        const clampedIdx = Math.max(0, Math.min(array.length - 1, newIdx));

        // Update immediately using refs to avoid React state delay
        if (clampedIdx !== currentDropTargetRef.current) {
          currentDropTargetRef.current = clampedIdx;

          // Update React state for visual feedback
          setDropTargetIdx(clampedIdx);

          // Update temp array with new position
          const newArray = [...array];
          const draggedValue = newArray[draggedIdx];
          newArray.splice(draggedIdx, 1);
          newArray.splice(clampedIdx, 0, draggedValue);
          setTempArray(newArray);
        }
      };

      // Add keyboard escape handler
      const handleKeyDown = (keyE: KeyboardEvent) => {
        if (keyE.key === "Escape") {
          // Cancel drag operation on escape
          handleGlobalMouseUp();
        }
      };

      const handleGlobalMouseUp = () => {
        // Use refs for immediate state access
        const draggedIdx = draggedIndexRef.current;
        const dropIdx = currentDropTargetRef.current;
        const wasActive = isDragActiveRef.current;

        // Immediately mark drag as inactive
        isDragActiveRef.current = false;

        // Force cleanup all drag-related state
        setIsDragging(false);
        setDropTargetIdx(null);
        setHoveredIdx(null);

        // Apply the reorder if there was a valid drop and drag was actually active
        if (
          wasActive &&
          draggedIdx !== null &&
          dropIdx !== null &&
          dropIdx !== draggedIdx
        ) {
          const newArray = [...array];
          const draggedValue = newArray[draggedIdx];
          newArray.splice(draggedIdx, 1);
          newArray.splice(dropIdx, 0, draggedValue);
          onReorder?.(newArray);
        }

        setDragIdx(null);
        setTempArray(null);

        // Reset refs completely
        draggedIndexRef.current = null;
        currentDropTargetRef.current = null;
        dragStartTimeRef.current = 0;
        lastMoveTimeRef.current = 0;

        // Remove global event listeners with error handling
        try {
          document.removeEventListener("mousemove", handleGlobalMouseMove, {
            capture: true,
          });
          document.removeEventListener("mouseup", handleGlobalMouseUp, {
            capture: true,
          });
          document.removeEventListener("keydown", handleKeyDown, {
            capture: true,
          });
        } catch (error) {
          console.warn("Error removing event listeners:", error);
        }

        // Additional cleanup: remove any potential duplicate listeners
        // This is a safeguard against listener accumulation
        const cleanup = () => {
          document.removeEventListener("mousemove", handleGlobalMouseMove, {
            capture: true,
          });
          document.removeEventListener("mouseup", handleGlobalMouseUp, {
            capture: true,
          });
          document.removeEventListener("keydown", handleKeyDown, {
            capture: true,
          });
        };
        cleanup();
      };

      // Add global event listeners with capture phase for better fast drag handling
      document.addEventListener("mousemove", handleGlobalMouseMove, {
        capture: true,
        passive: false,
      });
      document.addEventListener("mouseup", handleGlobalMouseUp, {
        capture: true,
      });
      document.addEventListener("keydown", handleKeyDown, { capture: true });
    },
    [dragOn, panMode, handleDragStart, array, onReorder]
  );

  const chartData = useMemo(() => {
    return renderArray.map((value, index) => ({
      index,
      value,
      name: `Index ${index}`,
      originalIndex: index,
    }));
  }, [renderArray]);

  const getBarColor = (
    index: number,
    value: number,
    isHovered: boolean = false
  ) => {
    // Priority states (highest to lowest)
    if (highlights?.pivot === index) return colors.pivot;
    if (
      highlights?.compared?.[0] === index ||
      highlights?.compared?.[1] === index
    ) {
      return colors.compared;
    }
    if (
      highlights?.swapped?.[0] === index ||
      highlights?.swapped?.[1] === index
    ) {
      return colors.swapped;
    }
    if (highlights?.indices?.includes(index)) return colors.highlighted;

    // Base color based on mode
    let baseColor: string;
    switch (colorMode) {
      case "rainbow": {
        const hue = (index / renderArray.length) * 360;
        baseColor = `hsl(${hue}, 70%, 60%)`;
        break;
      }
      case "value": {
        const maxVal = Math.max(...renderArray);
        const intensity = value / maxVal;
        baseColor = `hsl(220, 100%, ${30 + intensity * 40}%)`;
        break;
      }
      case "custom":
      default:
        baseColor = colors.base;
    }

    // Apply hover effect with dark mode support
    if (isHovered) {
      // Create a lighter/darker version for hover based on theme
      if (baseColor.startsWith("hsl")) {
        return baseColor.replace(/(\d+)%\)$/, (_, lightness) => {
          const currentLightness = parseInt(lightness);
          // In dark mode, make it lighter; in light mode, make it slightly darker
          const newLightness = document.documentElement.classList.contains(
            "dark"
          )
            ? Math.min(currentLightness + 15, 85)
            : Math.max(currentLightness - 10, 25);
          return `${newLightness}%)`;
        });
      } else {
        // For hex colors, add a semi-transparent overlay effect
        return document.documentElement.classList.contains("dark")
          ? `color-mix(in srgb, ${baseColor} 85%, white 15%)`
          : `color-mix(in srgb, ${baseColor} 90%, black 10%)`;
      }
    }

    return baseColor;
  };

  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{ payload: TooltipData }>;
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg p-3">
          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
            Index: {data.index}
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Value: {data.value}
          </p>
          {highlights?.pivot === data.index && (
            <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">
              Pivot
            </p>
          )}
          {(highlights?.compared?.[0] === data.index ||
            highlights?.compared?.[1] === data.index) && (
            <p className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">
              Comparing
            </p>
          )}
          {(highlights?.swapped?.[0] === data.index ||
            highlights?.swapped?.[1] === data.index) && (
            <p className="text-xs text-red-600 dark:text-red-400 font-medium">
              Swapped
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const renderBarChart = () => (
    <ResponsiveContainer width={400 * scale} height={300 * scale}>
      <BarChart
        data={chartData}
        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        barCategoryGap="20%"
      >
        {gridEnabled && (
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgb(148 163 184 / 0.3)"
          />
        )}
        <XAxis
          dataKey="index"
          tick={{ fontSize: 12 * scale }}
          stroke="rgb(100 116 139)"
        />
        <YAxis tick={{ fontSize: 12 * scale }} stroke="rgb(100 116 139)" />
        <Tooltip content={<CustomTooltip />} />
        <Bar
          dataKey="value"
          radius={[4, 4, 0, 0]}
          stroke="rgba(0,0,0,0.1)"
          strokeWidth={1}
        >
          {chartData.map((entry, index) => {
            const isDraggedItem = dragIdx === entry.index;
            const isDropTarget = dropTargetIdx === entry.index && isDragging;
            const isHovered = hoveredIdx === entry.index && !isDragging;

            return (
              <Cell
                key={`cell-${index}`}
                fill={getBarColor(entry.index, entry.value, isHovered)}
                style={{
                  cursor:
                    dragOn && !panMode
                      ? isDraggedItem
                        ? "grabbing"
                        : "grab"
                      : "default",
                  opacity: isDraggedItem ? 0.5 : isDropTarget ? 0.8 : 1,
                  transition: "fill 0.2s ease-in-out, opacity 0.2s ease-in-out",
                  filter: isDropTarget ? "brightness(1.2)" : "none",
                }}
                onMouseDown={(e: React.MouseEvent) =>
                  dragOn && !panMode && handleMouseDown(e, entry.index)
                }
                onMouseEnter={() => !isDragging && setHoveredIdx(entry.index)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
            );
          })}
          {showLabels && (
            <LabelList
              dataKey="value"
              position="top"
              style={{ fontSize: 11 * scale, fill: "rgb(100 116 139)" }}
            />
          )}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );

  const renderScatterChart = () => (
    <ResponsiveContainer width={400 * scale} height={300 * scale}>
      <ScatterChart
        data={chartData}
        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
      >
        {gridEnabled && (
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgb(148 163 184 / 0.3)"
          />
        )}
        <XAxis
          dataKey="index"
          type="number"
          domain={[0, renderArray.length - 1]}
          tick={{ fontSize: 12 * scale }}
          stroke="rgb(100 116 139)"
        />
        <YAxis
          dataKey="value"
          type="number"
          tick={{ fontSize: 12 * scale }}
          stroke="rgb(100 116 139)"
        />
        <Tooltip content={<CustomTooltip />} />
        <Scatter dataKey="value">
          {chartData.map((entry, index) => {
            const isDraggedItem = dragIdx === entry.index;
            const isDropTarget = dropTargetIdx === entry.index && isDragging;
            const isHovered = hoveredIdx === entry.index && !isDragging;

            return (
              <Cell
                key={`dot-${index}`}
                fill={getBarColor(entry.index, entry.value, isHovered)}
                style={{
                  cursor:
                    dragOn && !panMode
                      ? isDraggedItem
                        ? "grabbing"
                        : "grab"
                      : "default",
                  opacity: isDraggedItem ? 0.5 : isDropTarget ? 0.8 : 1,
                  transition: "fill 0.2s ease-in-out, opacity 0.2s ease-in-out",
                  filter: isDropTarget ? "brightness(1.2)" : "none",
                }}
                onMouseDown={(e: React.MouseEvent) =>
                  dragOn && !panMode && handleMouseDown(e, entry.index)
                }
                onMouseEnter={() => !isDragging && setHoveredIdx(entry.index)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
            );
          })}
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  );

  const getRowHighlight = (index: number) => {
    if (highlights?.pivot === index)
      return "bg-purple-100 dark:bg-purple-900/20";
    if (
      highlights?.compared?.[0] === index ||
      highlights?.compared?.[1] === index
    ) {
      return "bg-yellow-100 dark:bg-yellow-900/20";
    }
    if (
      highlights?.swapped?.[0] === index ||
      highlights?.swapped?.[1] === index
    ) {
      return "bg-red-100 dark:bg-red-900/20";
    }
    if (highlights?.indices?.includes(index))
      return "bg-blue-100 dark:bg-blue-900/20";
    return "";
  };

  const renderTable = () => (
    <div
      className="w-full h-full overflow-auto"
      style={{
        fontSize: `${12 * scale}px`,
      }}
    >
      <div className="min-h-full flex flex-col">
        <div className="overflow-auto flex-1">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700">
                  Index
                </th>
                <th className="px-4 py-3 text-left font-medium text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700">
                  Value
                </th>
                <th className="px-4 py-3 text-left font-medium text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {renderArray.map((value, index) => {
                const highlight = getRowHighlight(index);
                let status = "";
                if (highlights?.pivot === index) status = "Pivot";
                else if (
                  highlights?.compared?.[0] === index ||
                  highlights?.compared?.[1] === index
                )
                  status = "Comparing";
                else if (
                  highlights?.swapped?.[0] === index ||
                  highlights?.swapped?.[1] === index
                )
                  status = "Swapped";
                else if (highlights?.indices?.includes(index))
                  status = "Highlighted";

                return (
                  <tr
                    key={index}
                    className={cn(
                      "transition-colors duration-200 hover:bg-slate-50 dark:hover:bg-slate-800/50",
                      highlight,
                      dragOn && !panMode ? "cursor-grab" : ""
                    )}
                    onClick={() => {
                      if (dragOn && !panMode) {
                        handleDragStart(index);
                      }
                    }}
                    style={{
                      opacity: dragIdx === index ? 0.7 : 1,
                    }}
                  >
                    <td className="px-4 py-2 text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800">
                      {index}
                    </td>
                    <td className="px-4 py-2 text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800">
                      <span
                        className="inline-flex items-center justify-center w-8 h-8 rounded text-white text-sm font-medium"
                        style={{ backgroundColor: getBarColor(index, value) }}
                      >
                        {value}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-slate-600 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
                      {status && (
                        <span
                          className={cn(
                            "inline-flex px-2 py-1 rounded-full text-xs font-medium",
                            status === "Pivot" &&
                              "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300",
                            status === "Comparing" &&
                              "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300",
                            status === "Swapped" &&
                              "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300",
                            status === "Highlighted" &&
                              "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
                          )}
                        >
                          {status}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div
      ref={wrapperRef}
      className={cn(
        "relative w-full bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 overflow-auto",
        className
      )}
      style={{
        height,
        cursor: panMode ? "grab" : isDragging ? "grabbing" : "default",
      }}
    >
      {/* Zoom Controls */}
      <div className="absolute top-2 right-2 z-10 flex flex-col gap-1">
        <button
          className="w-8 h-8 bg-white/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded shadow-sm hover:bg-white dark:hover:bg-slate-800 transition-colors flex items-center justify-center text-slate-600 dark:text-slate-400"
          onClick={() => zoomAt(1.2)}
          title="Zoom In"
        >
          +
        </button>
        <button
          className="w-8 h-8 bg-white/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded shadow-sm hover:bg-white dark:hover:bg-slate-800 transition-colors flex items-center justify-center text-slate-600 dark:text-slate-400"
          onClick={() => zoomAt(1 / 1.2)}
          title="Zoom Out"
        >
          −
        </button>
        <button
          className="w-8 h-8 bg-white/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded shadow-sm hover:bg-white dark:hover:bg-slate-800 transition-colors flex items-center justify-center text-slate-600 dark:text-slate-400"
          onClick={() => {
            setScale(1);
            setAngle(0);
          }}
          title="Reset View"
        >
          ⌂
        </button>
      </div>

      {/* Scrollable Chart Container */}
      <div className="w-full h-full overflow-auto">
        <div
          ref={rotatorRef}
          className="relative"
          style={{
            transform: `rotate(${angle}deg)`,
            transformOrigin: "center center",
            transition: "transform 0.2s ease-out",
            width: `${100 * scale}%`,
            height: `${100 * scale}%`,
            minWidth: `${400 * scale}px`,
            minHeight: `${300 * scale}px`,
          }}
        >
          {viewMode === "bars" && renderBarChart()}
          {viewMode === "dots" && renderScatterChart()}
          {viewMode === "table" && renderTable()}
        </div>
      </div>
    </div>
  );
});

export default EnhancedArrayVisualization;
