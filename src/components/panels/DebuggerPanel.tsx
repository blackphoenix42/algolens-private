// src/components/panels/DebuggerPanel.tsx
import { useMemo, useState } from "react";

import { ChevronDownIcon } from "@/components/ui/Icons";
import type { Frame } from "@/types";

type Tab = "breakpoints" | "watch" | "callstack";

export interface DebuggerPanelProps {
  /** The currently displayed frame (may be empty). */
  frame: Frame;
  /** Total number of lines in the active pseudocode \u2014 used for input validation. */
  pseudocodeLineCount: number;

  /** Set of 1-based pseudocode line numbers with active breakpoints. */
  breakpoints: Set<number>;
  onToggleBreakpoint: (pcLine: number) => void;
  onClearBreakpoints: () => void;

  /**
   * Counter breakpoints: pause when `counters[name] >= threshold`.
   * Keys are counter names; values are the trigger threshold.
   */
  counterBreakpoints: Record<string, number>;
  onSetCounterBreakpoint: (name: string, threshold: number) => void;
  onRemoveCounterBreakpoint: (name: string) => void;

  isMobile?: boolean;
}

/** Stable JSON-ish formatter for arbitrary watch values. */
function formatValue(value: unknown): string {
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  if (typeof value === "string") return `"${value}"`;
  if (typeof value === "number" || typeof value === "boolean")
    return String(value);
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

export default function DebuggerPanel({
  frame,
  pseudocodeLineCount,
  breakpoints,
  onToggleBreakpoint,
  onClearBreakpoints,
  counterBreakpoints,
  onSetCounterBreakpoint,
  onRemoveCounterBreakpoint,
  isMobile = false,
}: DebuggerPanelProps) {
  const [tab, setTab] = useState<Tab>("breakpoints");
  const [collapsed, setCollapsed] = useState(isMobile);

  const [lineInput, setLineInput] = useState("");
  const [counterNameInput, setCounterNameInput] = useState("");
  const [counterThresholdInput, setCounterThresholdInput] = useState("");

  const sortedBreakpoints = useMemo(
    () => Array.from(breakpoints).sort((a, b) => a - b),
    [breakpoints]
  );

  const counterEntries = useMemo(
    () => Object.entries(counterBreakpoints),
    [counterBreakpoints]
  );

  const watchEntries = useMemo(() => {
    const merged: Array<[string, unknown]> = [];
    if (frame.watch) {
      for (const [k, v] of Object.entries(frame.watch)) merged.push([k, v]);
    }
    if (frame.counters) {
      for (const [k, v] of Object.entries(frame.counters))
        merged.push([`counter:${k}`, v]);
    }
    return merged;
  }, [frame.watch, frame.counters]);

  const callStack = frame.callStack ?? [];

  function addLineBreakpoint() {
    const n = Number(lineInput);
    if (
      !Number.isFinite(n) ||
      !Number.isInteger(n) ||
      n < 1 ||
      (pseudocodeLineCount > 0 && n > pseudocodeLineCount)
    ) {
      return;
    }
    onToggleBreakpoint(n);
    setLineInput("");
  }

  function addCounterBreakpoint() {
    const name = counterNameInput.trim();
    const threshold = Number(counterThresholdInput);
    if (!name || !Number.isFinite(threshold)) return;
    onSetCounterBreakpoint(name, threshold);
    setCounterNameInput("");
    setCounterThresholdInput("");
  }

  return (
    <div className="card relative overflow-hidden border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-2 py-1 dark:border-slate-700 dark:bg-slate-800">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <div className="flex gap-1">
            <TabButton
              active={tab === "breakpoints"}
              onClick={() => setTab("breakpoints")}
              count={breakpoints.size + counterEntries.length}
            >
              Breakpoints
            </TabButton>
            <TabButton
              active={tab === "watch"}
              onClick={() => setTab("watch")}
              count={watchEntries.length}
            >
              Watch
            </TabButton>
            <TabButton
              active={tab === "callstack"}
              onClick={() => setTab("callstack")}
              count={callStack.length}
            >
              Call Stack
            </TabButton>
          </div>
        </div>
        <button
          className="inline-flex items-center justify-center rounded border border-slate-200 bg-white px-2 py-1 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800/70"
          onClick={() => setCollapsed((v) => !v)}
          aria-expanded={!collapsed}
          aria-controls="debugger-body"
          title={collapsed ? "Expand" : "Collapse"}
        >
          <ChevronDownIcon open={!collapsed} />
          <span className="sr-only">{collapsed ? "Expand" : "Collapse"}</span>
        </button>
      </div>

      {/* Body */}
      {!collapsed && (
        <div id="debugger-body" className="max-h-[40vh] overflow-auto p-2">
          {tab === "breakpoints" && (
            <div className="space-y-3 text-sm">
              {/* Line breakpoints */}
              <section>
                <header className="mb-1 flex items-center justify-between">
                  <h4 className="font-medium text-slate-900 dark:text-slate-100">
                    Line breakpoints
                  </h4>
                  {(breakpoints.size > 0 || counterEntries.length > 0) && (
                    <button
                      type="button"
                      className="text-xs text-slate-500 hover:text-red-600 dark:hover:text-red-400"
                      onClick={onClearBreakpoints}
                    >
                      Clear all
                    </button>
                  )}
                </header>
                <p className="mb-2 text-xs text-slate-500 dark:text-slate-400">
                  Click a pseudocode line in the Code panel to toggle, or add
                  one here.
                </p>
                <div className="mb-2 flex gap-2">
                  <input
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={pseudocodeLineCount || undefined}
                    placeholder="Line #"
                    value={lineInput}
                    onChange={(e) => setLineInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") addLineBreakpoint();
                    }}
                    className="w-24 rounded border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                    aria-label="Pseudocode line for new breakpoint"
                  />
                  <button
                    type="button"
                    onClick={addLineBreakpoint}
                    className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>
                {sortedBreakpoints.length === 0 ? (
                  <p className="text-xs text-slate-500 italic dark:text-slate-400">
                    No line breakpoints set.
                  </p>
                ) : (
                  <ul className="space-y-1">
                    {sortedBreakpoints.map((line) => (
                      <li
                        key={line}
                        className="flex items-center justify-between rounded border border-slate-200 bg-slate-50 px-2 py-1 dark:border-slate-700 dark:bg-slate-800"
                      >
                        <span className="font-mono text-slate-800 dark:text-slate-200">
                          Line {line}
                          {frame.pcLine === line && (
                            <span className="ml-2 rounded bg-yellow-200 px-1 text-xs text-yellow-900 dark:bg-yellow-700 dark:text-yellow-50">
                              current
                            </span>
                          )}
                        </span>
                        <button
                          type="button"
                          onClick={() => onToggleBreakpoint(line)}
                          className="text-xs text-slate-500 hover:text-red-600 dark:hover:text-red-400"
                          aria-label={`Remove breakpoint on line ${line}`}
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              {/* Counter breakpoints */}
              <section>
                <h4 className="mb-1 font-medium text-slate-900 dark:text-slate-100">
                  Counter breakpoints
                </h4>
                <p className="mb-2 text-xs text-slate-500 dark:text-slate-400">
                  Pause when a counter reaches its threshold (e.g.{" "}
                  <code>comparisons \u2265 50</code>).
                </p>
                <div className="mb-2 flex flex-wrap gap-2">
                  <input
                    type="text"
                    placeholder="counter name"
                    value={counterNameInput}
                    onChange={(e) => setCounterNameInput(e.target.value)}
                    className="min-w-0 flex-1 rounded border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                    aria-label="Counter name"
                  />
                  <input
                    type="number"
                    placeholder="\u2265"
                    value={counterThresholdInput}
                    onChange={(e) => setCounterThresholdInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") addCounterBreakpoint();
                    }}
                    className="w-20 rounded border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                    aria-label="Counter threshold"
                  />
                  <button
                    type="button"
                    onClick={addCounterBreakpoint}
                    className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>
                {counterEntries.length === 0 ? (
                  <p className="text-xs text-slate-500 italic dark:text-slate-400">
                    No counter breakpoints set.
                  </p>
                ) : (
                  <ul className="space-y-1">
                    {counterEntries.map(([name, threshold]) => {
                      const current = Number(frame.counters?.[name] ?? 0);
                      const hit = current >= threshold;
                      return (
                        <li
                          key={name}
                          className="flex items-center justify-between rounded border border-slate-200 bg-slate-50 px-2 py-1 dark:border-slate-700 dark:bg-slate-800"
                        >
                          <span className="font-mono text-xs text-slate-800 dark:text-slate-200">
                            {name} \u2265 {threshold}
                            <span
                              className={`ml-2 rounded px-1 text-xs ${
                                hit
                                  ? "bg-red-200 text-red-900 dark:bg-red-700 dark:text-red-50"
                                  : "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200"
                              }`}
                            >
                              now: {current}
                            </span>
                          </span>
                          <button
                            type="button"
                            onClick={() => onRemoveCounterBreakpoint(name)}
                            className="text-xs text-slate-500 hover:text-red-600 dark:hover:text-red-400"
                            aria-label={`Remove counter breakpoint ${name}`}
                          >
                            Remove
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            </div>
          )}

          {tab === "watch" && (
            <div className="text-sm">
              {watchEntries.length === 0 ? (
                <p className="text-xs text-slate-500 italic dark:text-slate-400">
                  This algorithm does not publish watch variables for the
                  current step.
                </p>
              ) : (
                <table className="w-full table-fixed text-left font-mono text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <th className="w-1/3 py-1 pr-2 text-slate-600 dark:text-slate-300">
                        Name
                      </th>
                      <th className="py-1 text-slate-600 dark:text-slate-300">
                        Value
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {watchEntries.map(([name, value]) => (
                      <tr
                        key={name}
                        className="border-b border-slate-100 last:border-0 dark:border-slate-800"
                      >
                        <td className="truncate py-1 pr-2 text-slate-800 dark:text-slate-200">
                          {name}
                        </td>
                        <td className="truncate py-1 text-slate-700 dark:text-slate-300">
                          {formatValue(value)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {tab === "callstack" && (
            <div className="text-sm">
              {callStack.length === 0 ? (
                <p className="text-xs text-slate-500 italic dark:text-slate-400">
                  This algorithm does not publish a call stack for the current
                  step.
                </p>
              ) : (
                <ol className="space-y-1 font-mono text-xs">
                  {[...callStack]
                    .map((sf, i) => ({ sf, i }))
                    .reverse()
                    .map(({ sf, i }) => (
                      <li
                        key={`sf-${i}-${sf.name}`}
                        className={`rounded border px-2 py-1 ${
                          i === callStack.length - 1
                            ? "border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/30"
                            : "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800"
                        }`}
                      >
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="truncate text-slate-900 dark:text-slate-100">
                            #{i} {sf.name}
                            {sf.pcLine !== undefined && (
                              <span className="ml-1 text-slate-500">
                                @ line {sf.pcLine}
                              </span>
                            )}
                          </span>
                          {i === callStack.length - 1 && (
                            <span className="shrink-0 rounded bg-blue-200 px-1 text-[10px] text-blue-900 dark:bg-blue-700 dark:text-blue-50">
                              top
                            </span>
                          )}
                        </div>
                        {sf.args && Object.keys(sf.args).length > 0 && (
                          <div className="mt-1 text-slate-600 dark:text-slate-400">
                            args:{" "}
                            {Object.entries(sf.args)
                              .map(([k, v]) => `${k}=${formatValue(v)}`)
                              .join(", ")}
                          </div>
                        )}
                        {sf.locals && Object.keys(sf.locals).length > 0 && (
                          <div className="text-slate-600 dark:text-slate-400">
                            locals:{" "}
                            {Object.entries(sf.locals)
                              .map(([k, v]) => `${k}=${formatValue(v)}`)
                              .join(", ")}
                          </div>
                        )}
                      </li>
                    ))}
                </ol>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TabButton({
  active,
  count,
  onClick,
  children,
}: {
  active: boolean;
  count?: number;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`rounded px-2 py-1 text-sm ${
        active
          ? "border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
          : "hover:bg-slate-100 dark:hover:bg-slate-700/60"
      }`}
    >
      {children}
      {typeof count === "number" && count > 0 && (
        <span className="ml-1 rounded bg-slate-200 px-1 text-[10px] text-slate-700 dark:bg-slate-700 dark:text-slate-200">
          {count}
        </span>
      )}
    </button>
  );
}
