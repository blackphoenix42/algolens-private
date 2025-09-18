// src/components/home/AISearchHelper.tsx
import { MessageCircle, Search, Sparkles, X } from "lucide-react";
import { useState } from "react";

import LazyMarkdown from "@/components/ui/LazyMarkdown";
import { useAIChat } from "@/hooks/useGPT";

interface AISearchHelperProps {
  className?: string;
}

export function AISearchHelper({ className }: AISearchHelperProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");

  const context = {
    algorithmSlug: "home",
    algorithmTitle: "AlgoLens Home",
    topic: "General",
    pseudocode: ["Navigate and explore algorithms"],
  };

  const { conversationHistory, sendMessage, clearHistory, isLoading, error } =
    useAIChat(context);

  const handleSend = async () => {
    if (!message.trim() || isLoading) return;

    const userMessage = message;
    setMessage("");
    await sendMessage(userMessage);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestedQuestions = [
    "What's the difference between sorting algorithms?",
    "Which graph algorithm should I learn first?",
    "How do I choose between different search methods?",
    "What are the most important data structures?",
    "Can you explain time complexity?",
  ];

  return (
    <div className={`relative ${className}`}>
      {/* AI Helper Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-blue-500 px-4 py-2 text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
      >
        <MessageCircle className="h-4 w-4 group-hover:animate-bounce" />
        <span className="font-medium">Ask AI Helper</span>
        <Sparkles className="h-4 w-4 animate-pulse" />
      </button>

      {/* AI Chat Panel */}
      {isOpen && (
        <div className="absolute top-12 right-0 z-50 w-96 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-blue-50 p-3 dark:border-gray-700 dark:from-emerald-900/20 dark:to-blue-900/20">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-gradient-to-br from-emerald-500 to-blue-500 p-1 text-white">
                <Search className="h-3 w-3" />
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                AI Algorithm Helper
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="h-64 space-y-3 overflow-y-auto p-3">
            {conversationHistory.length === 0 ? (
              <div className="py-4 text-center">
                <Sparkles className="mx-auto mb-2 h-8 w-8 text-emerald-400" />
                <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
                  Hi! I'm your AI algorithm assistant. Ask me anything about
                  algorithms, data structures, or computer science concepts!
                </p>

                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-500">
                    Try asking:
                  </p>
                  {suggestedQuestions.slice(0, 3).map((question, index) => (
                    <button
                      key={index}
                      onClick={() => setMessage(question)}
                      className="block w-full rounded bg-gray-50 p-2 text-left text-xs transition-colors hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700"
                    >
                      "{question}"
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              conversationHistory.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg p-2 text-sm ${
                      msg.role === "user"
                        ? "bg-gradient-to-r from-emerald-500 to-blue-500 text-white"
                        : "border border-gray-200 bg-gray-100 text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                    }`}
                  >
                    {msg.role === "user" ? (
                      <p>{msg.content}</p>
                    ) : (
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <LazyMarkdown>{msg.content}</LazyMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}

            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-lg border border-gray-200 bg-gray-100 p-2 dark:border-gray-700 dark:bg-gray-800">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-300 border-t-emerald-600" />
                    <span>AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="rounded bg-red-50 p-2 text-center text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                {error}
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-3 dark:border-gray-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about algorithms..."
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={!message.trim() || isLoading}
                className="rounded-lg bg-gradient-to-r from-emerald-500 to-blue-500 px-3 py-2 text-white transition-colors hover:from-emerald-600 hover:to-blue-600 disabled:cursor-not-allowed disabled:from-gray-300 disabled:to-gray-300"
              >
                <Search className="h-4 w-4" />
              </button>
            </div>

            {conversationHistory.length > 0 && (
              <button
                onClick={clearHistory}
                className="mt-2 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Clear conversation
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
