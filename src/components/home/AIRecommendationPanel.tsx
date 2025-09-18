// src/components/home/AIRecommendationPanel.tsx
import { Lightbulb, MessageSquare, Sparkles, TrendingUp } from "lucide-react";
import { useCallback, useState } from "react";

import { Card } from "@/components/ui/Card";
import LazyMarkdown from "@/components/ui/LazyMarkdown";
import { useGPT } from "@/hooks/useGPT";

interface AIRecommendationPanelProps {
  onAlgorithmSelect?: (slug: string) => void;
  className?: string;
}

export function AIRecommendationPanel({
  onAlgorithmSelect,
  className,
}: AIRecommendationPanelProps) {
  const [userInput, setUserInput] = useState("");
  const gpt = useGPT();

  const handleGetRecommendation = useCallback(async () => {
    if (!userInput.trim()) return;

    await gpt.recommend(userInput);
  }, [userInput, gpt]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleGetRecommendation();
    }
  };

  const quickPrompts = [
    "I need to sort a large dataset efficiently",
    "Find the shortest path in a graph",
    "Search through a binary tree",
    "Solve optimization problems",
    "Handle dynamic programming challenges",
  ];

  return (
    <Card
      className={`border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 dark:border-blue-800 dark:from-blue-900/20 dark:to-indigo-900/20 ${className}`}
    >
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 p-2 text-white">
          <Sparkles className="h-6 w-6" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            🤖 AI Algorithm Assistant
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Get personalized algorithm recommendations
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Input Section */}
        <div className="relative">
          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Describe your problem or what you want to learn... (e.g., 'I need to sort 1 million numbers quickly')"
            className="min-h-[100px] w-full resize-none rounded-lg border border-gray-300 p-4 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            disabled={gpt.isLoading}
          />
          <button
            onClick={handleGetRecommendation}
            disabled={!userInput.trim() || gpt.isLoading}
            className="absolute right-3 bottom-3 flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {gpt.isLoading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Thinking...</span>
              </>
            ) : (
              <>
                <TrendingUp className="h-4 w-4" />
                <span>Get Recommendation</span>
              </>
            )}
          </button>
        </div>

        {/* Quick Prompts */}
        <div>
          <p className="mb-3 text-sm font-medium text-gray-600 dark:text-gray-400">
            💡 Quick Examples:
          </p>
          <div className="flex flex-wrap gap-2">
            {quickPrompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() => setUserInput(prompt)}
                className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs transition-colors hover:border-blue-300 hover:bg-blue-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-blue-900/20"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* AI Response */}
        {(gpt.response || gpt.error) && (
          <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            {gpt.error ? (
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <MessageSquare className="h-4 w-4" />
                <span>Error: {gpt.error}</span>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <Lightbulb className="h-4 w-4" />
                  <span className="font-medium">AI Recommendation:</span>
                </div>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <LazyMarkdown>{gpt.response?.content || ""}</LazyMarkdown>
                </div>
                {gpt.response?.suggestions &&
                  gpt.response.suggestions.length > 0 && (
                    <div className="mt-4">
                      <p className="mb-2 font-medium text-gray-700 dark:text-gray-300">
                        Suggested Actions:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {gpt.response.suggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => onAlgorithmSelect?.(suggestion)}
                            className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700 transition-colors hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            )}
          </div>
        )}

        {/* Features Highlight */}
        <div className="mt-6 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 p-4 dark:from-purple-900/20 dark:to-pink-900/20">
          <div className="mb-2 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <span className="font-medium text-purple-700 dark:text-purple-300">
              AI Features Available:
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm text-purple-600 dark:text-purple-400">
            <div>• Algorithm recommendations</div>
            <div>• Complexity analysis</div>
            <div>• Learning paths</div>
            <div>• Problem-solving tips</div>
          </div>
        </div>
      </div>
    </Card>
  );
}
