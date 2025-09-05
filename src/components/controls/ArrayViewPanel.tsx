import { useState } from "react";

import { useI18n } from "../../i18n/hooks";

type View = "bars" | "dots" | "table";
type ColorMode = "plain" | "rainbow" | "value" | "custom";
type Colors = {
  base: string;
  compared: string;
  swapped: string;
  pivot: string;
  highlighted: string;
};

// Simple chevron-down icon; we'll rotate it 180° when collapsed
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

export default function ArrayViewPanel({
  view,
  onView,
  colorMode,
  onColorMode,
  colors,
  onColorsChange,
  showLabels,
  onShowLabels,
  showPlane,
  onShowPlane,
}: {
  view: View;
  onView: (v: View) => void;
  colorMode: ColorMode;
  onColorMode: (m: ColorMode) => void;
  colors: Colors;
  onColorsChange: (c: Colors) => void;
  showLabels: boolean;
  onShowLabels: (v: boolean) => void;
  showPlane: boolean;
  onShowPlane: (v: boolean) => void;
}) {
  const [open, setOpen] = useState(true);
  const { t } = useI18n();

  const upd = (k: keyof Colors) => (e: React.ChangeEvent<HTMLInputElement>) =>
    onColorsChange({ ...colors, [k]: e.target.value });

  return (
    <div className="card text-sm min-w-0">
      {/* Header with collapse/expand */}
      <div className="flex items-center justify-between">
        <div className="font-medium panel-title">
          {t("controls.arrayView", { defaultValue: "Array View" })}
        </div>
        <button
          className="px-2 py-1 rounded border
                     bg-white border-slate-200 hover:bg-slate-100
                     dark:bg-slate-900 dark:border-slate-700 dark:hover:bg-slate-800/70
                     inline-flex items-center justify-center"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="arrayview-body"
          title={
            open
              ? t("controls.collapse", { defaultValue: "Collapse" })
              : t("controls.expand", { defaultValue: "Expand" })
          }
        >
          <ChevronDownIcon
            className={`w-4 h-4 transition-transform duration-200 ${
              open ? "rotate-180" : "rotate-0"
            }`}
          />
          <span className="sr-only">
            {open
              ? t("controls.collapse", { defaultValue: "Collapse" })
              : t("controls.expand", { defaultValue: "Expand" })}
          </span>
        </button>
      </div>

      {!open ? null : (
        <div id="arrayview-body" className="grid gap-2 mt-2 min-w-0">
          {/* Types */}
          <div className="grid gap-2">
            <div className="text-xs font-semibold panel-muted">
              {t("controls.types", { defaultValue: "Types" })}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                className={`seg-btn ${view === "bars" ? "on" : ""}`}
                onClick={() => onView("bars")}
              >
                {t("controls.bars", { defaultValue: "Bars" })}
              </button>
              <button
                className={`seg-btn ${view === "dots" ? "on" : ""}`}
                onClick={() => onView("dots")}
              >
                {t("controls.dots", { defaultValue: "Dots" })}
              </button>
              <button
                className={`seg-btn ${view === "table" ? "on" : ""}`}
                onClick={() => onView("table")}
              >
                {t("controls.table", { defaultValue: "Table" })}
              </button>
            </div>
          </div>

          {/* Labels & Axes */}
          <div className="grid gap-2 mt-3">
            <div className="text-xs font-semibold panel-muted">
              {t("controls.labelsAndAxes", { defaultValue: "Labels & Axes" })}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showLabels}
                  onChange={(e) => onShowLabels(e.target.checked)}
                />
                {t("controls.showNumbers", { defaultValue: "Show numbers" })}
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showPlane}
                  onChange={(e) => onShowPlane(e.target.checked)}
                />
                {t("controls.cartesianPlane", {
                  defaultValue: "Cartesian plane",
                })}
              </label>
            </div>
          </div>

          {/* Coloring */}
          <div className="grid gap-2 mt-3">
            <div className="text-xs font-semibold panel-muted">
              {t("controls.coloring.title", { defaultValue: "Coloring" })}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                className={`seg-btn ${colorMode === "plain" ? "on" : ""}`}
                onClick={() => onColorMode("plain")}
              >
                {t("controls.coloring.plain", { defaultValue: "Plain" })}
              </button>
              <button
                className={`seg-btn ${colorMode === "rainbow" ? "on" : ""}`}
                onClick={() => onColorMode("rainbow")}
              >
                {t("controls.coloring.rainbow", { defaultValue: "Rainbow" })}
              </button>
              <button
                className={`seg-btn ${colorMode === "value" ? "on" : ""}`}
                onClick={() => onColorMode("value")}
              >
                {t("controls.coloring.byValue", { defaultValue: "By value" })}
              </button>
              <button
                className={`seg-btn ${colorMode === "custom" ? "on" : ""}`}
                onClick={() => onColorMode("custom")}
              >
                {t("controls.coloring.custom", { defaultValue: "Custom" })}
              </button>
            </div>

            {colorMode === "custom" && (
              <div
                className="grid items-center gap-x-4 gap-y-2 mt-1"
                style={{ gridTemplateColumns: "auto auto auto auto" }}
              >
                <span className="panel-muted">
                  {t("controls.coloring.base", { defaultValue: "Base" })}
                </span>
                <input
                  type="color"
                  value={colors.base}
                  onChange={upd("base")}
                  aria-label={t("controls.coloring.base", {
                    defaultValue: "Base",
                  })}
                />
                <span className="panel-muted">
                  {t("controls.coloring.compared", {
                    defaultValue: "Compared",
                  })}
                </span>
                <input
                  type="color"
                  value={colors.compared}
                  onChange={upd("compared")}
                  aria-label={t("controls.coloring.compared", {
                    defaultValue: "Compared",
                  })}
                />
                <span className="panel-muted">
                  {t("controls.coloring.swapped", { defaultValue: "Swapped" })}
                </span>
                <input
                  type="color"
                  value={colors.swapped}
                  onChange={upd("swapped")}
                  aria-label={t("controls.coloring.swapped", {
                    defaultValue: "Swapped",
                  })}
                />
                <span className="panel-muted">
                  {t("controls.coloring.pivot", { defaultValue: "Pivot" })}
                </span>
                <input
                  type="color"
                  value={colors.pivot}
                  onChange={upd("pivot")}
                  aria-label={t("controls.coloring.pivot", {
                    defaultValue: "Pivot",
                  })}
                />
                <span className="panel-muted">
                  {t("controls.coloring.highlight", {
                    defaultValue: "Highlight",
                  })}
                </span>
                <input
                  type="color"
                  value={colors.highlighted}
                  onChange={upd("highlighted")}
                  aria-label={t("controls.coloring.highlight", {
                    defaultValue: "Highlight",
                  })}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
