// src/components/ai/AIChatPanel.tsx
import {
  Maximize2,
  MessageCircle,
  Minimize2,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import LazyMarkdown from "@/components/ui/LazyMarkdown";
import { useAIChat } from "@/hooks/useGPT";
import type { AlgoMeta } from "@/types/algorithms";

interface AIChatPanelProps {
  meta: AlgoMeta;
  isOpen: boolean;
  onClose: () => void;
  currentStep?: number;
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
}

export function AIChatPanel({
  meta,
  isOpen,
  onClose,
  currentStep,
  isMinimized = false,
  onToggleMinimize,
}: AIChatPanelProps) {
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Context for AI
  const context = {
    algorithmSlug: meta.slug,
    algorithmTitle: meta.title,
    topic: meta.topic,
    currentStep,
    pseudocode: meta.pseudocode,
  };

  const { conversationHistory, sendMessage, clearHistory, isLoading, error } =
    useAIChat(context);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversationHistory]);

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

  if (!isOpen) return null;

  return (
    <div
      className={`fixed right-4 bottom-4 z-50 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900 ${
        isMinimized ? "h-16 w-80" : "h-96 w-96"
      } transition-all duration-200`}
    >
      {/* Header */}
      <div className="flex items-center justify-between rounded-t-lg border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-3 dark:border-gray-700 dark:from-blue-900/20 dark:to-indigo-900/20">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            AI Assistant
          </span>
          <div className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
            {meta.title}
          </div>
        </div>

        <div className="flex items-center gap-1">
          {onToggleMinimize && (
            <button
              onClick={onToggleMinimize}
              className="rounded p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              title={isMinimized ? "Maximize" : "Minimize"}
            >
              {isMinimized ? (
                <Maximize2 className="h-4 w-4" />
              ) : (
                <Minimize2 className="h-4 w-4" />
              )}
            </button>
          )}
          <button
            onClick={onClose}
            className="rounded p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            title="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="h-64 flex-1 space-y-3 overflow-y-auto p-3">
            {conversationHistory.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <Sparkles className="mb-2 h-8 w-8 text-blue-400" />
                <p className="mb-1 text-sm text-gray-600 dark:text-gray-400">
                  Ask me anything about {meta.title}!
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Examples: "How does this work?", "What's the complexity?",
                  "When should I use this?"
                </p>
              </div>
            ) : (
              conversationHistory.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-2 text-sm ${
                      msg.role === "user"
                        ? "bg-blue-500 text-white"
                        : "border border-gray-200 bg-gray-100 text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                    }`}
                  >
                    {msg.role === "user" ? (
                      <p>{msg.content}</p>
                    ) : (
                      <LazyMarkdown>{msg.content}</LazyMarkdown>
                    )}
                  </div>
                </div>
              ))
            )}

            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-lg border border-gray-200 bg-gray-100 p-2 dark:border-gray-700 dark:bg-gray-800">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
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

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-3 dark:border-gray-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about this algorithm..."
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={!message.trim() || isLoading}
                className="rounded-lg bg-blue-500 px-3 py-2 text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-gray-300"
                title="Send message"
              >
                <Send className="h-4 w-4" />
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
        </>
      )}
    </div>
  );
}
