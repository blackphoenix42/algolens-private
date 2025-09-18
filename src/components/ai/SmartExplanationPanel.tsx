// src/components/ai/SmartExplanationPanel.tsx
import {
  AlertCircle,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import { useState } from "react";

import LazyMarkdown from "@/components/ui/LazyMarkdown";
import { useCodeExplanation, useStepExplanation } from "@/hooks/useGPT";
import type { AlgoMeta } from "@/types/algorithms";

interface SmartExplanationPanelProps {
  meta: AlgoMeta;
  currentStep?: number;
  currentLanguage?: string;
  codeSnippet?: string;
  isCollapsed?: boolean;
}

export function SmartExplanationPanel({
  meta,
  currentStep,
  currentLanguage,
  codeSnippet,
  isCollapsed: initialCollapsed = false,
}: SmartExplanationPanelProps) {
  const [collapsed, setCollapsed] = useState(initialCollapsed);
  const [mode, setMode] = useState<"step" | "code">("step");

  // Context for AI
  const context = {
    algorithmSlug: meta.slug,
    algorithmTitle: meta.title,
    topic: meta.topic,
    currentStep,
    pseudocode: meta.pseudocode,
    codeSnippet,
    language: currentLanguage,
  };

  // Hook for step-by-step explanation
  const stepExplanation = useStepExplanation(context, currentStep);

  // Hook for code explanation
  const codeExplanation = useCodeExplanation({
    ...context,
    codeSnippet: mode === "code" ? codeSnippet : undefined,
  });

  const activeExplanation = mode === "step" ? stepExplanation : codeExplanation;
  const hasContent =
    activeExplanation.explanation &&
    activeExplanation.explanation.trim().length > 0;

  return (
    <div className="card relative min-w-0 border border-blue-200/40 bg-gradient-to-br from-blue-50/80 via-indigo-50/60 to-purple-50/40 dark:border-blue-700/40 dark:from-blue-900/20 dark:via-indigo-900/15 dark:to-purple-900/20">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-blue-200/50 bg-gradient-to-r from-blue-100/60 to-indigo-100/40 px-3 py-2 dark:border-blue-700/50 dark:from-blue-800/30 dark:to-indigo-800/20">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
            AI Explanation
          </span>
          {activeExplanation.isLoading && (
            <div className="h-3 w-3 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Mode Toggle */}
          <div className="flex rounded border border-blue-300/60 bg-white/80 dark:border-blue-600/60 dark:bg-blue-900/20">
            <button
              className={`rounded-l px-2 py-1 text-xs ${
                mode === "step"
                  ? "bg-blue-500 text-white"
                  : "text-blue-700 hover:bg-blue-100 dark:text-blue-300 dark:hover:bg-blue-800/40"
              }`}
              onClick={() => setMode("step")}
              disabled={!currentStep}
            >
              Step
            </button>
            <button
              className={`rounded-r px-2 py-1 text-xs ${
                mode === "code"
                  ? "bg-blue-500 text-white"
                  : "text-blue-700 hover:bg-blue-100 dark:text-blue-300 dark:hover:bg-blue-800/40"
              }`}
              onClick={() => setMode("code")}
              disabled={!codeSnippet}
            >
              Code
            </button>
          </div>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="rounded p-1 text-blue-600 hover:bg-blue-200/60 dark:text-blue-400 dark:hover:bg-blue-800/60"
            title={collapsed ? "Expand" : "Collapse"}
          >
            {collapsed ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronUp className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      {!collapsed && (
        <div className="p-3">
          {activeExplanation.error ? (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800/50 dark:bg-red-900/20 dark:text-red-300">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>AI explanation unavailable: {activeExplanation.error}</span>
            </div>
          ) : activeExplanation.isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex flex-col items-center gap-2 text-blue-600 dark:text-blue-400">
                <div className="h-8 w-8 animate-spin rounded-full border-3 border-blue-300 border-t-blue-600" />
                <span className="text-sm">Generating explanation...</span>
              </div>
            </div>
          ) : hasContent ? (
            <div className="space-y-3">
              <div className="prose prose-sm prose-blue dark:prose-invert max-w-none rounded-lg bg-white/60 p-3 dark:bg-blue-900/20">
                <LazyMarkdown>{activeExplanation.explanation!}</LazyMarkdown>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                  <MessageCircle className="h-3 w-3" />
                  <span>Powered by GPT-5</span>
                </div>

                <button
                  className="text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
                  onClick={() => {
                    // Note: For now, this is a placeholder. The specialized hooks don't expose the methods.
                    // In a full implementation, you'd need to use the main useGPT hook here.
                    console.log("Request more detail");
                  }}
                >
                  More detail
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <Sparkles className="mb-2 h-8 w-8 text-blue-400" />
              <p className="mb-1 text-sm text-blue-700 dark:text-blue-300">
                {mode === "step"
                  ? "Step through the algorithm to get AI explanations"
                  : "Select code view to get AI code explanation"}
              </p>
              <p className="text-xs text-blue-600/70 dark:text-blue-400/70">
                Powered by GPT-5
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
