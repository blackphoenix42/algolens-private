// src/components/ai/EnhancedCodePanel.tsx
import hljs from "highlight.js";
import { Copy, MessageCircle, Sparkles, Wand2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import LazyMarkdown from "@/components/ui/LazyMarkdown";
import { useGPT } from "@/hooks/useGPT";
import type { AlgoMeta } from "@/types/algorithms";

type Lang = "cpp" | "java" | "python" | "javascript";

function ChevronDownIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`h-4 w-4 transition-transform duration-200 ${
        open ? "rotate-180" : "rotate-0"
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

interface EnhancedCodePanelProps {
  meta: AlgoMeta;
  activePcLine?: number;
  explain?: string;
  fillHeight?: boolean;
  onTabChange?: (tab: "pseudocode" | "code") => void;
}

export function EnhancedCodePanel({
  meta,
  activePcLine,
  explain,
  fillHeight = true,
  onTabChange,
}: EnhancedCodePanelProps) {
  const [tab, setTab] = useState<"pseudocode" | "code">("pseudocode");
  const [lang, setLang] = useState<Lang>("cpp");
  const [copied, setCopied] = useState(false);
  const [wrap, setWrap] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [showAIExplanation, setShowAIExplanation] = useState(false);

  useEffect(() => {
    onTabChange?.(tab);
  }, [tab, onTabChange]);

  const raw = (meta.code as Record<string, string>)[lang] ?? "";
  const html = useMemo(
    () => hljs.highlight(raw, { language: lang, ignoreIllegals: true }).value,
    [raw, lang]
  );
  const lines = useMemo(() => html.split("\n"), [html]);

  // AI Context for code explanation
  const aiContext = {
    algorithmSlug: meta.slug,
    algorithmTitle: meta.title,
    topic: meta.topic,
    pseudocode: meta.pseudocode,
    codeSnippet: tab === "code" ? raw : meta.pseudocode.join("\n"),
    language: tab === "code" ? lang : "pseudocode",
  };

  const gpt = useGPT();
  // Note: We're not using useCodeExplanation here as we handle it manually with gpt.explainCode

  const codeLine = meta.codeLineMap?.[lang]?.[(activePcLine ?? 0) - 1];

  async function copy() {
    try {
      await navigator.clipboard.writeText(raw);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      /* noop */
    }
  }

  const handleAIExplain = async () => {
    if (gpt.isFeatureEnabled("explain")) {
      setShowAIExplanation(true);
      await gpt.explainCode(aiContext);
    }
  };

  return (
    <div
      className={`card relative overflow-hidden ${fillHeight ? "h-full" : ""} border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900`}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-2 py-1 dark:border-slate-700 dark:bg-slate-800">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <div className="flex gap-2">
            <button
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

          {/* AI Enhancement Buttons */}
          {!collapsed && gpt.isFeatureEnabled("explain") && (
            <div className="ml-4 flex gap-1">
              <button
                onClick={handleAIExplain}
                disabled={gpt.isLoading}
                className="flex items-center gap-1 rounded bg-gradient-to-r from-blue-500 to-indigo-600 px-2 py-1 text-xs text-white hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50"
                title="Get AI explanation"
              >
                {gpt.isLoading ? (
                  <div className="h-3 w-3 animate-spin rounded-full border border-white/30 border-t-white" />
                ) : (
                  <Sparkles className="h-3 w-3" />
                )}
                <span>AI Explain</span>
              </button>

              <button
                onClick={() => setShowAIExplanation(!showAIExplanation)}
                className={`flex items-center gap-1 rounded px-2 py-1 text-xs transition-colors ${
                  showAIExplanation
                    ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                }`}
                title="Toggle AI explanation"
              >
                <MessageCircle className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!collapsed && tab === "code" && (
            <>
              <button
                onClick={copy}
                className="flex items-center gap-1 rounded border border-slate-200 bg-white px-2 py-1 text-xs hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800/70"
                title="Copy code"
              >
                <Copy className="h-3 w-3" />
                {copied ? "Copied!" : "Copy"}
              </button>

              <button
                onClick={() => setWrap(!wrap)}
                className={`rounded border px-2 py-1 text-xs ${
                  wrap
                    ? "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                    : "border-slate-200 bg-white hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800/70"
                }`}
                title="Toggle word wrap"
              >
                Wrap
              </button>
            </>
          )}

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
      </div>

      {/* Body (collapsible) */}
      {!collapsed && (
        <div id="codepanel-body" className="flex h-full flex-col">
          {/* AI Explanation Section */}
          {showAIExplanation && gpt.isFeatureEnabled("explain") && (
            <div className="border-b border-slate-200 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 p-3 dark:border-slate-700 dark:from-blue-900/20 dark:via-indigo-900/15 dark:to-purple-900/20">
              <div className="mb-2 flex items-center gap-2">
                <Wand2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-sm font-medium text-indigo-900 dark:text-indigo-100">
                  AI Code Explanation
                </span>
              </div>

              {gpt.error ? (
                <div className="rounded bg-red-50 p-2 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                  {gpt.error}
                </div>
              ) : gpt.isLoading ? (
                <div className="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-300 border-t-indigo-600" />
                  <span>Generating explanation...</span>
                </div>
              ) : gpt.response?.content ? (
                <div className="rounded bg-white/60 p-2 text-sm dark:bg-indigo-900/20">
                  <LazyMarkdown>{gpt.response.content}</LazyMarkdown>
                </div>
              ) : (
                <p className="text-sm text-indigo-600 dark:text-indigo-400">
                  Click "AI Explain" to get a detailed explanation of this{" "}
                  {tab === "code" ? "code" : "pseudocode"}.
                </p>
              )}
            </div>
          )}

          {/* Code/Pseudocode Content */}
          <div className="flex-1 overflow-auto">
            {tab === "pseudocode" ? (
              <ol className="p-2 font-mono text-sm leading-6">
                {meta.pseudocode.map((line: string, i: number) => {
                  const isActive = (activePcLine ?? -1) - 1 === i;
                  return (
                    <li
                      key={i}
                      className={`rounded px-2 py-1 ${
                        isActive
                          ? "bg-yellow-100 text-yellow-900 dark:bg-yellow-900/20 dark:text-yellow-300"
                          : ""
                      }`}
                    >
                      <span className="text-slate-400 select-none dark:text-slate-600">
                        {String(i + 1).padStart(2, "0")}.
                      </span>{" "}
                      {line}
                    </li>
                  );
                })}
              </ol>
            ) : (
              <div
                className={`p-2 font-mono text-sm leading-6 ${wrap ? "" : "whitespace-nowrap"} overflow-auto`}
              >
                <ol>
                  {lines.map((line, i) => {
                    const isActive = codeLine === i + 1;
                    return (
                      <li
                        key={i}
                        className={`rounded px-2 py-1 ${
                          isActive
                            ? "bg-yellow-100 text-yellow-900 dark:bg-yellow-900/20 dark:text-yellow-300"
                            : ""
                        }`}
                      >
                        <span className="mr-4 text-slate-400 select-none dark:text-slate-600">
                          {String(i + 1).padStart(2, "0")}.
                        </span>
                        <span
                          dangerouslySetInnerHTML={{ __html: line || "&nbsp;" }}
                        />
                      </li>
                    );
                  })}
                </ol>
              </div>
            )}
          </div>

          {/* Current Step Explanation */}
          {explain && (
            <div className="border-t border-slate-200 bg-slate-50/80 p-2 dark:border-slate-700 dark:bg-slate-800/50">
              <div className="mb-1 text-xs font-medium text-slate-600 dark:text-slate-400">
                Current step:
              </div>
              <div className="text-sm text-slate-800 dark:text-slate-200">
                {explain}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
