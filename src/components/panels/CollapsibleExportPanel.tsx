// src/components/panels/CollapsibleExportPanel.tsx
import { useState } from "react";

import ExportPanel from "@/components/export/ExportPanel";
import type { ColorMode, Colors, DrawOptions, View } from "@/services/export";

/** Simple chevron that rotates when collapsed/expanded */
function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`h-4 w-4 transition-transform ${
        open ? "-rotate-180" : "rotate-0"
      }`}
      aria-hidden
    >
      <path
        d="M8 10l4 4 4-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface CollapsibleExportPanelProps {
  array: number[];
  view: View;
  colorMode: ColorMode;
  colors: Colors;
  showPlane: boolean;
  showLabels: boolean;
  framesProvider: () => DrawOptions[];
  watermarkUrl: string;
}

export default function CollapsibleExportPanel(
  props: CollapsibleExportPanelProps
) {
  const [collapsed, setCollapsed] = useState(true); // Start collapsed

  return (
    <div className="card relative min-w-0 text-sm">
      {/* Header */}
      <div className="mb-2 flex items-center justify-between">
        <button
          className="inline-flex items-center gap-2 text-left"
          onClick={() => setCollapsed((v) => !v)}
          aria-expanded={!collapsed}
          aria-controls="export-body"
          title={collapsed ? "Expand Export Panel" : "Collapse Export Panel"}
        >
          <Chevron open={!collapsed} />
          <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
            Export Visualization
          </span>
        </button>

        {/* Export Badge */}
        <div className="rounded-full bg-green-50 px-2 py-1 text-xs text-green-700 dark:bg-green-900/20 dark:text-green-300">
          📤 PNG, SVG, GIF, MP4
        </div>
      </div>

      {/* Body (collapsible) */}
      {!collapsed && (
        <div id="export-body" className="animate-fade-in-down">
          <ExportPanel {...props} />
        </div>
      )}
    </div>
  );
}
