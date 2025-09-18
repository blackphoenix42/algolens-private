// src/components/ai/AlgorithmRecommendation.tsx
import { AlertCircle, Clock, Lightbulb, TrendingUp, Zap } from "lucide-react";
import { useState } from "react";

import LazyMarkdown from "@/components/ui/LazyMarkdown";
import { useGPT } from "@/hooks/useGPT";

interface AlgorithmRecommendationProps {
  currentDataSize?: number;
  dataCharacteristics?: string[];
  constraints?: string[];
  onAlgorithmSelect?: (algorithm: string) => void;
}

export function AlgorithmRecommendation({
  currentDataSize,
  dataCharacteristics = [],
  constraints = [],
  onAlgorithmSelect: _onAlgorithmSelect,
}: AlgorithmRecommendationProps) {
  const [problemDescription, setProblemDescription] = useState("");
  const [showRecommendations, setShowRecommendations] = useState(false);
  const gpt = useGPT();

  const handleGetRecommendations = async () => {
    if (!problemDescription.trim()) return;

    const allConstraints = [
      ...constraints,
      currentDataSize ? `Data size: ~${currentDataSize} elements` : "",
      ...dataCharacteristics.map((char) => `Data characteristic: ${char}`),
    ].filter(Boolean);

    setShowRecommendations(true);
    await gpt.recommend(problemDescription, allConstraints);
  };

  const quickProblems = [
    "I need to sort a large dataset efficiently",
    "I need to find an element in a sorted array",
    "I need to find the shortest path between nodes",
    "I need to find connected components in a graph",
  ];

  return (
    <div className="card border border-amber-200/60 bg-gradient-to-br from-amber-50/80 via-yellow-50/60 to-orange-50/40 dark:border-amber-700/40 dark:from-amber-900/20 dark:via-yellow-900/15 dark:to-orange-900/20">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-amber-200/50 bg-gradient-to-r from-amber-100/60 to-yellow-100/40 px-3 py-2 dark:border-amber-700/50 dark:from-amber-800/30 dark:to-yellow-800/20">
        <Lightbulb className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        <span className="text-sm font-medium text-amber-900 dark:text-amber-100">
          AI Algorithm Recommendations
        </span>
        {gpt.isLoading && (
          <div className="h-3 w-3 animate-spin rounded-full border-2 border-amber-300 border-t-amber-600" />
        )}
      </div>

      <div className="space-y-3 p-3">
        {/* Problem Input */}
        <div>
          <label className="mb-2 block text-sm font-medium text-amber-900 dark:text-amber-100">
            Describe your problem:
          </label>
          <textarea
            value={problemDescription}
            onChange={(e) => setProblemDescription(e.target.value)}
            placeholder="E.g., I need to efficiently sort a million integers..."
            className="w-full rounded-lg border border-amber-300 px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none dark:border-amber-600 dark:bg-amber-900/20 dark:text-amber-100"
            rows={3}
          />
        </div>

        {/* Quick Problem Buttons */}
        <div>
          <div className="mb-2 text-xs font-medium text-amber-700 dark:text-amber-300">
            Or try these common problems:
          </div>
          <div className="grid grid-cols-1 gap-1 text-xs">
            {quickProblems.map((problem, index) => (
              <button
                key={index}
                onClick={() => setProblemDescription(problem)}
                className="rounded border border-amber-200/60 bg-white/60 p-2 text-left text-amber-800 transition-colors hover:bg-amber-100/80 dark:border-amber-700/40 dark:bg-amber-900/20 dark:text-amber-200 dark:hover:bg-amber-800/30"
              >
                {problem}
              </button>
            ))}
          </div>
        </div>

        {/* Get Recommendations Button */}
        <button
          onClick={handleGetRecommendations}
          disabled={!problemDescription.trim() || gpt.isLoading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-2 text-white transition-colors hover:from-amber-600 hover:to-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {gpt.isLoading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              <span>Getting recommendations...</span>
            </>
          ) : (
            <>
              <TrendingUp className="h-4 w-4" />
              <span>Get AI Recommendations</span>
            </>
          )}
        </button>

        {/* Current Context Info */}
        {(currentDataSize ||
          dataCharacteristics.length > 0 ||
          constraints.length > 0) && (
          <div className="rounded-lg border border-amber-200/60 bg-amber-100/60 p-3 dark:border-amber-700/40 dark:bg-amber-900/30">
            <div className="mb-2 text-xs font-medium text-amber-900 dark:text-amber-100">
              Context that will be considered:
            </div>
            <div className="space-y-1 text-xs text-amber-700 dark:text-amber-300">
              {currentDataSize && (
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  <span>Data size: ~{currentDataSize} elements</span>
                </div>
              )}
              {dataCharacteristics.map((char, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Zap className="h-3 w-3" />
                  <span>{char}</span>
                </div>
              ))}
              {constraints.map((constraint, index) => (
                <div key={index} className="flex items-center gap-2">
                  <AlertCircle className="h-3 w-3" />
                  <span>{constraint}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations Display */}
        {showRecommendations && (
          <div className="rounded-lg border border-amber-200/60 bg-white/60 p-3 dark:border-amber-700/40 dark:bg-amber-900/20">
            {gpt.error ? (
              <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                <AlertCircle className="h-4 w-4" />
                <span>Failed to get recommendations: {gpt.error}</span>
              </div>
            ) : gpt.response?.content ? (
              <div className="space-y-3">
                <div className="text-sm font-medium text-amber-900 dark:text-amber-100">
                  AI Recommendations:
                </div>
                <div className="prose prose-sm prose-amber dark:prose-invert max-w-none">
                  <LazyMarkdown>{gpt.response.content}</LazyMarkdown>
                </div>

                {/* Follow-up questions */}
                {gpt.response.followUpQuestions &&
                  gpt.response.followUpQuestions.length > 0 && (
                    <div className="border-t border-amber-200 pt-2 dark:border-amber-700">
                      <div className="mb-2 text-xs font-medium text-amber-700 dark:text-amber-300">
                        Follow-up questions:
                      </div>
                      <div className="space-y-1">
                        {gpt.response.followUpQuestions.map(
                          (question, index) => (
                            <button
                              key={index}
                              onClick={() => setProblemDescription(question)}
                              className="block w-full rounded border border-amber-200 bg-amber-50 p-2 text-left text-xs text-amber-700 hover:bg-amber-100 dark:border-amber-700/60 dark:bg-amber-900/30 dark:text-amber-300 dark:hover:bg-amber-800/40"
                            >
                              {question}
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  )}
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
