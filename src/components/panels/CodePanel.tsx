// src/components/panels/CodePanel.tsx
import "highlight.js/styles/github.css";
import "@/styles/hljs-dark-overrides.css";
import "./CodePanel.css";

import hljs from "highlight.js/lib/core";
import cpp from "highlight.js/lib/languages/cpp";
import java from "highlight.js/lib/languages/java";
import javascript from "highlight.js/lib/languages/javascript";
import python from "highlight.js/lib/languages/python";
import { useEffect, useMemo, useState } from "react";

import { ChevronDownIcon, CopyIcon, WrapIcon } from "@/components/ui/Icons";
import type { AlgoMeta } from "@/types/algorithms";

hljs.registerLanguage("cpp", cpp);
hljs.registerLanguage("java", java);
hljs.registerLanguage("python", python);
hljs.registerLanguage("javascript", javascript);

type Lang = "cpp" | "java" | "python" | "javascript";

export default function CodePanel({
  meta,
  activePcLine,
  explain,
  fillHeight = true,
  onTabChange,
  isMobile = false,
  breakpoints,
  onToggleBreakpoint,
}: {
  meta: AlgoMeta;
  activePcLine?: number;
  explain?: string;
  fillHeight?: boolean;
  onTabChange?: (tab: "pseudocode" | "code") => void;
  isMobile?: boolean;
  /** Set of 1-based pseudocode line numbers with active breakpoints. */
  breakpoints?: Set<number>;
  /** Called when the user clicks a pseudocode line to toggle a breakpoint. */
  onToggleBreakpoint?: (pcLine: number) => void;
}) {
  const [tab, setTab] = useState<"pseudocode" | "code">("pseudocode");
  const [lang, setLang] = useState<Lang>("cpp");
  const [copied, setCopied] = useState(false);
  const [wrap, setWrap] = useState(false);
  const [collapsed, setCollapsed] = useState(isMobile); // Collapsed by default on mobile

  useEffect(() => {
    onTabChange?.(tab);
  }, [tab, onTabChange]);

  const raw = (meta.code as Record<string, string>)[lang] ?? "";
  const html = useMemo(
    () => hljs.highlight(raw, { language: lang, ignoreIllegals: true }).value,
    [raw, lang]
  );
  const lines = useMemo(() => html.split("\n"), [html]);

  const codeLine = meta.codeLineMap?.[lang]?.[(activePcLine ?? 0) - 1];

  async function copy() {
    try {
      await navigator.clipboard.writeText(raw);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch (err) {
      console.warn("Failed to copy code to clipboard:", err);
    }
  }

  return (
    <div
      className={`card relative overflow-hidden ${fillHeight ? "h-full" : ""} border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900`}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-2 py-1 dark:border-slate-700 dark:bg-slate-800">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <div className="flex gap-2">
            <button
              role="tab"
              aria-selected={tab === "pseudocode"}
              className={`rounded px-2 py-1 ${
                tab === "pseudocode"
                  ? "border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
                  : "hover:bg-slate-100 dark:hover:bg-slate-700/60"
              }`}
              onClick={() => setTab("pseudocode")}
            >
              Pseudocode
            </button>
            <button
              role="tab"
              aria-selected={tab === "code"}
              className={`rounded px-2 py-1 ${
                tab === "code"
                  ? "border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
                  : "hover:bg-slate-100 dark:hover:bg-slate-700/60"
              }`}
              onClick={() => setTab("code")}
            >
              Code
            </button>
          </div>
          {!collapsed && tab === "code" && (
            <select
              className="ml-4 w-20 rounded border border-slate-200 bg-white px-1 py-1 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              value={lang}
              onChange={(e) => setLang(e.target.value as Lang)}
            >
              <option value="cpp">C++</option>
              <option value="java">Java</option>
              <option value="python">Python</option>
              <option value="javascript">JS</option>
            </select>
          )}
        </div>
        <button
          className="inline-flex items-center justify-center rounded border border-slate-200 bg-white px-2 py-1 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800/70"
          onClick={() => setCollapsed((v) => !v)}
          aria-expanded={!collapsed}
          aria-controls="codepanel-body"
          title={collapsed ? "Expand" : "Collapse"}
        >
          <ChevronDownIcon open={!collapsed} />
          <span className="sr-only">{collapsed ? "Expand" : "Collapse"}</span>
        </button>
      </div>

      {/* Body (collapsible) */}
      {!collapsed && (
        <div id="codepanel-body">
          {tab === "pseudocode" ? (
            <div
              className="overflow-auto"
              style={{ maxHeight: fillHeight ? "100%" : "auto" }}
            >
              <ol className="p-2 font-mono text-sm leading-6">
                {meta.pseudocode.map((line: string, i: number) => {
                  const lineNumber = i + 1;
                  const isActive = (activePcLine ?? -1) - 1 === i;
                  const hasBreakpoint = breakpoints?.has(lineNumber) ?? false;
                  const clickable = !!onToggleBreakpoint;
                  return (
                    <li
                      key={`pc-${i}`}
                      className={`mb-1 rounded px-2 transition-colors ${
                        isActive
                          ? "bg-yellow-100 ring-1 ring-yellow-300 dark:bg-yellow-900/30 dark:ring-yellow-700"
                          : "hover:bg-slate-100 dark:hover:bg-slate-800/70"
                      } ${clickable ? "cursor-pointer" : ""}`}
                      onClick={
                        clickable
                          ? () => onToggleBreakpoint?.(lineNumber)
                          : undefined
                      }
                      onKeyDown={
                        clickable
                          ? (e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                onToggleBreakpoint?.(lineNumber);
                              }
                            }
                          : undefined
                      }
                      role={clickable ? "button" : undefined}
                      tabIndex={clickable ? 0 : undefined}
                      aria-pressed={clickable ? hasBreakpoint : undefined}
                      title={
                        clickable
                          ? hasBreakpoint
                            ? `Remove breakpoint on line ${lineNumber}`
                            : `Set breakpoint on line ${lineNumber}`
                          : undefined
                      }
                    >
                      <div className="flex items-start">
                        <span
                          className={`mr-1 inline-block w-3 select-none ${
                            hasBreakpoint ? "text-red-500" : "text-transparent"
                          }`}
                          aria-hidden="true"
                        >
                          {hasBreakpoint ? "\u25CF" : "\u00A0"}
                        </span>
                        <span className="mr-2 text-gray-400 select-none dark:text-gray-500">
                          {String(lineNumber).padStart(2, "0")}
                        </span>
                        <span className="text-slate-900 dark:text-slate-200">
                          {line}
                        </span>
                      </div>
                      {isActive && explain && (
                        <div className="mt-1 rounded border border-yellow-200 bg-yellow-50 px-2 py-1 text-xs text-gray-800 dark:border-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-50">
                          {explain}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ol>
            </div>
          ) : (
            <div
              className={`codeblock relative overflow-auto ${
                wrap ? "code-wrap" : "code-nowrap"
              } bg-white dark:bg-slate-900`}
              style={{ maxHeight: fillHeight ? "100%" : "auto" }}
            >
              {/* inline toolbar */}
              <div className="sticky top-0 z-10 flex justify-end gap-2 bg-gradient-to-b from-white/90 to-transparent p-2 dark:from-slate-900/90">
                <button
                  className="inline-flex items-center rounded border border-slate-200 px-2 py-1 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800/70"
                  onClick={() => setWrap((w) => !w)}
                  title="Toggle word wrap"
                  aria-pressed={wrap}
                >
                  <WrapIcon />
                </button>
                <button
                  className="inline-flex items-center rounded border border-slate-200 px-2 py-1 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800/70"
                  onClick={copy}
                  title="Copy code"
                  aria-label="Copy code to clipboard"
                >
                  <CopyIcon />
                </button>
              </div>

              {lines.map((l, i) => (
                <div
                  key={`code-${i}`}
                  className={`code-row ${
                    codeLine === i + 1 ? "active" : ""
                  } text-slate-900 dark:text-slate-200`}
                >
                  <span className="ln text-slate-600 dark:text-slate-400">
                    {i + 1}
                  </span>
                  <span
                    className="code"
                    dangerouslySetInnerHTML={{ __html: l || "&nbsp;" }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {copied && (
        <div
          className="absolute top-2 right-2 rounded bg-black/80 px-2 py-1 text-xs text-white shadow dark:bg-black/70"
          role="status"
          aria-live="polite"
        >
          Code copied!
        </div>
      )}
    </div>
  );
}
