import React, { useState } from "react";

import { useFullscreen } from "@/hooks/useFullscreen";

import type { ArrayCanvasHandle } from "./ArrayCanvas";

/**
 * Props for the CanvasToolbar component
 */
type Props = {
  /** Reference to the surface element for fullscreen functionality */
  surfaceRef: React.RefObject<HTMLDivElement | null>;
  /** Reference to the canvas handle for method calls */
  canvasHandle?: React.RefObject<ArrayCanvasHandle | null>;
  /** Current pan mode state */
  panMode: boolean;
  /** Callback to toggle pan mode */
  onPanMode: (on: boolean) => void;
  /** Current drag enabled state */
  dragging: boolean;
  /** Callback to toggle drag functionality */
  onDragging: (on: boolean) => void;
  /** Current grid visibility state */
  gridOn: boolean;
  /** Current snap-to-grid state */
  snapOn: boolean;
  /** Whether the component is being used on mobile */
  isMobile?: boolean;
};

/**
 * Simple chevron-down icon component for collapse/expand functionality
 * @param className - CSS classes to apply
 */
const ChevronDownIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden>
    <path
      d="M6 9l6 6 6-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * A collapsible toolbar component for controlling canvas visualization features.
 *
 * Features:
 * - Zoom controls
 * - Grid and snap toggles
 * - Pan and drag mode toggles
 * - View reset functionality
 * - Rotation controls
 * - Fullscreen toggle
 * - Collapsible interface
 *
 * @param props - Component properties
 */

export default function CanvasToolbar({
  surfaceRef,
  canvasHandle,
  panMode,
  onPanMode,
  dragging,
  onDragging,
  gridOn,
  snapOn,
  isMobile = false,
}: Props) {
  const { isFullscreen, enter, exit } = useFullscreen<HTMLDivElement>();
  const full = () => (isFullscreen ? exit() : enter(surfaceRef.current));

  // Type-safe method calling with better validation
  type NoArgMethods = {
    [K in keyof ArrayCanvasHandle]: ArrayCanvasHandle[K] extends () => void
      ? K
      : never;
  }[keyof ArrayCanvasHandle];

  const call = (method: NoArgMethods) => {
    const handle = canvasHandle?.current;
    if (!handle) {
      console.warn("Canvas handle not available");
      return;
    }

    try {
      // TypeScript ensures this is type-safe at compile time
      handle[method]();
    } catch (error) {
      console.warn(`Error calling canvas method ${method}:`, error);
    }
  };
  // collapse / expand
  const [open, setOpen] = useState(!isMobile);

  // small helper for consistent button styling
  const baseBtn =
    "px-2 py-1 rounded border transition-colors " +
    "bg-white border-slate-200 hover:bg-slate-100 " +
    "dark:bg-slate-900 dark:border-slate-700 dark:hover:bg-slate-800/70";

  const pressed =
    "ring-1 ring-slate-300 dark:ring-slate-600 " +
    "bg-slate-100 dark:bg-slate-800/70";

  const Divider = () => (
    <span className="mx-2 h-5 w-px bg-slate-300 dark:bg-slate-700" />
  );

  return (
    <div
      className={
        "card min-w-0 text-sm " +
        "border border-slate-200 bg-white" +
        "dark:border-slate-700 dark:bg-slate-900"
      }
    >
      {/* Header with collapse/expand */}
      <div className="flex items-center justify-between">
        <div className="panel-title font-semibold text-slate-900 dark:text-slate-200">
          Canvas Controls
        </div>
        <button
          className="inline-flex items-center justify-center rounded border border-slate-200 bg-white px-2 py-1 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800/70"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="canvas-controls-body"
          title={open ? "Collapse" : "Expand"}
        >
          <ChevronDownIcon
            className={`h-4 w-4 transition-transform duration-200 ${
              open ? "rotate-180" : "rotate-0"
            }`}
          />
          <span className="sr-only">{open ? "Collapse" : "Expand"}</span>
        </button>
      </div>

      {!open ? null : (
        <div
          id="canvas-controls-body"
          className="mt-2 flex flex-wrap items-center gap-2 text-slate-900 dark:text-slate-200"
        >
          <button
            className={baseBtn}
            onClick={() => call("zoomOut")}
            title="Zoom out"
          >
            −
          </button>
          <button
            className={baseBtn}
            onClick={() => call("zoomIn")}
            title="Zoom in"
          >
            +
          </button>
          <button
            className={baseBtn}
            onClick={() => call("resetView")}
            title="Reset view"
          >
            Reset
          </button>

          <Divider />

          <button
            className={`${baseBtn} ${gridOn ? pressed : ""}`}
            onClick={() => call("toggleGrid")}
            aria-pressed={gridOn}
            title={gridOn ? "Grid: On" : "Grid: Off"}
          >
            Grid {gridOn ? "On" : "Off"}
          </button>

          <button
            className={`${baseBtn} ${panMode ? pressed : ""}`}
            onClick={() => onPanMode(!panMode)}
            aria-pressed={panMode}
            title={panMode ? "Pan: On" : "Pan: Off"}
          >
            {panMode ? "Pan On" : "Pan Off"}
          </button>

          <button
            className={`${baseBtn} ${snapOn ? pressed : ""}`}
            onClick={() => call("toggleSnap")}
            aria-pressed={snapOn}
            title={snapOn ? "Snap to grid: On" : "Snap to grid: Off"}
          >
            Snap {snapOn ? "On" : "Off"}
          </button>

          <button
            className={`${baseBtn} ${dragging ? pressed : ""}`}
            onClick={() => {
              const next = !dragging;
              onDragging(next);
              canvasHandle?.current?.setDragEnabled(next);
            }}
            aria-pressed={dragging}
            title={dragging ? "Drag: On" : "Drag: Off"}
          >
            {dragging ? "Drag On" : "Drag Off"}
          </button>

          <Divider />

          <button
            className={baseBtn}
            onClick={() => call("rotate90")}
            title="Rotate by 90°"
          >
            Rotate 90°
          </button>

          <Divider />

          <button className={baseBtn} onClick={full} title="Toggle fullscreen">
            {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          </button>
        </div>
      )}
    </div>
  );
}
