// src/hooks/useGPT.ts
import { useCallback, useEffect, useRef, useState } from "react";

import type {
  AlgorithmContext,
  CodeAnalysis,
  GPTFeature,
  GPTMessage,
  GPTResponse,
} from "@/services/ai";
import { GPTService } from "@/services/ai";

export interface UseGPTOptions {
  enabled?: boolean;
  autoExplain?: boolean;
  cacheResponses?: boolean;
}

export interface UseGPTResult {
  // State
  isLoading: boolean;
  error: string | null;
  response: GPTResponse | null;

  // Actions
  explainStep: (context: AlgorithmContext, step: number) => Promise<void>;
  explainCode: (context: AlgorithmContext) => Promise<void>;
  analyzeCode: (
    code: string,
    language: string,
    algorithmType: string
  ) => Promise<CodeAnalysis | null>;
  chat: (context: AlgorithmContext, message: string) => Promise<void>;
  recommend: (
    problemDescription: string,
    constraints?: string[]
  ) => Promise<void>;
  generateQuiz: (
    context: AlgorithmContext,
    difficulty?: "easy" | "medium" | "hard"
  ) => Promise<void>;

  // Utils
  clearError: () => void;
  isFeatureEnabled: (feature: GPTFeature) => boolean;
}

export function useGPT(options: UseGPTOptions = {}): UseGPTResult {
  const { enabled = true, cacheResponses = true } = options;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<GPTResponse | null>(null);

  const gptService = useRef<GPTService | null>(null);
  const cache = useRef<Map<string, GPTResponse>>(new Map());

  // Initialize GPT service
  useEffect(() => {
    try {
      gptService.current = GPTService.getInstance();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to initialize AI service"
      );
    }
  }, []);

  const handleRequest = useCallback(
    async <T>(
      requestFn: () => Promise<T>,
      cacheKey?: string
    ): Promise<T | null> => {
      if (!enabled || !gptService.current) {
        setError("AI service is not available");
        return null;
      }

      // Check cache first
      if (cacheResponses && cacheKey && cache.current.has(cacheKey)) {
        const cached = cache.current.get(cacheKey) as T;
        setResponse(cached as GPTResponse);
        return cached;
      }

      setIsLoading(true);
      setError(null);

      try {
        const result = await requestFn();

        // Cache the response if it's a GPTResponse
        if (
          cacheResponses &&
          cacheKey &&
          result &&
          typeof result === "object" &&
          "content" in result
        ) {
          cache.current.set(cacheKey, result as GPTResponse);
        }

        if (result && typeof result === "object" && "content" in result) {
          setResponse(result as GPTResponse);
        }

        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred";
        setError(errorMessage);
        console.error("GPT request failed:", err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [enabled, cacheResponses]
  );

  const explainStep = useCallback(
    async (context: AlgorithmContext, step: number) => {
      const cacheKey = `explain-${context.algorithmSlug}-${step}`;
      await handleRequest(
        () => gptService.current!.explainAlgorithmStep(context, step),
        cacheKey
      );
    },
    [handleRequest]
  );

  const explainCode = useCallback(
    async (context: AlgorithmContext) => {
      const cacheKey = `code-${context.algorithmSlug}-${context.language || "pseudo"}`;
      await handleRequest(
        () => gptService.current!.generateCodeExplanation(context),
        cacheKey
      );
    },
    [handleRequest]
  );

  const analyzeCode = useCallback(
    async (
      code: string,
      language: string,
      algorithmType: string
    ): Promise<CodeAnalysis | null> => {
      const cacheKey = `analyze-${algorithmType}-${code.slice(0, 50)}`;
      return handleRequest(
        () => gptService.current!.analyzeCode(code, language, algorithmType),
        cacheKey
      );
    },
    [handleRequest]
  );

  const chat = useCallback(
    async (context: AlgorithmContext, message: string) => {
      // Don't cache chat responses as they're contextual
      await handleRequest(() =>
        gptService.current!.chatWithUser(context, message)
      );
    },
    [handleRequest]
  );

  const recommend = useCallback(
    async (problemDescription: string, constraints: string[] = []) => {
      const cacheKey = `recommend-${problemDescription}-${constraints.join(",")}`;
      await handleRequest(
        () =>
          gptService.current!.recommendAlgorithm(
            problemDescription,
            constraints
          ),
        cacheKey
      );
    },
    [handleRequest]
  );

  const generateQuiz = useCallback(
    async (
      context: AlgorithmContext,
      difficulty: "easy" | "medium" | "hard" = "medium"
    ) => {
      const cacheKey = `quiz-${context.algorithmSlug}-${difficulty}`;
      await handleRequest(
        () => gptService.current!.generateQuiz(context, difficulty),
        cacheKey
      );
    },
    [handleRequest]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const isFeatureEnabled = useCallback((feature: GPTFeature): boolean => {
    if (!gptService.current) return false;

    // Map GPT features to service feature flags
    switch (feature) {
      case "explain":
        return gptService.current.isFeatureEnabled("codeExplanations");
      case "tutor":
        return gptService.current.isFeatureEnabled("interactiveTutor");
      case "chat":
        return gptService.current.isFeatureEnabled("chatAssistant");
      case "analyze":
      case "optimize":
        return gptService.current.isFeatureEnabled("codeAnalysis");
      case "quiz":
        return gptService.current.isFeatureEnabled("interactiveTutor");
      default:
        return false;
    }
  }, []);

  return {
    isLoading,
    error,
    response,
    explainStep,
    explainCode,
    analyzeCode,
    chat,
    recommend,
    generateQuiz,
    clearError,
    isFeatureEnabled,
  };
}

// Specialized hooks for common use cases
export function useCodeExplanation(context: AlgorithmContext) {
  const gpt = useGPT({ cacheResponses: true });

  // Only re-run when key properties change, not the entire context object
  useEffect(() => {
    if (context.codeSnippet) {
      gpt.explainCode(context);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context.algorithmSlug, context.language, context.codeSnippet]);

  return {
    explanation: gpt.response?.content,
    isLoading: gpt.isLoading,
    error: gpt.error,
  };
}

export function useStepExplanation(
  context: AlgorithmContext,
  currentStep?: number
) {
  const gpt = useGPT({ cacheResponses: true });

  useEffect(() => {
    if (currentStep !== undefined && currentStep > 0) {
      gpt.explainStep(context, currentStep);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context.algorithmSlug, currentStep]);

  return {
    explanation: gpt.response?.content,
    isLoading: gpt.isLoading,
    error: gpt.error,
  };
}

export function useAIChat(context: AlgorithmContext) {
  const [conversationHistory, setConversationHistory] = useState<GPTMessage[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const gptServiceRef = useRef<GPTService | null>(null);

  // Initialize GPT service
  useEffect(() => {
    try {
      gptServiceRef.current = GPTService.getInstance();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to initialize AI service"
      );
    }
  }, []);

  const sendMessage = useCallback(
    async (message: string) => {
      if (!gptServiceRef.current) {
        setError("AI service not available");
        return;
      }

      // Add user message to history immediately
      const userMessage: GPTMessage = { role: "user", content: message };
      setConversationHistory((prev) => [...prev, userMessage]);

      setIsLoading(true);
      setError(null);

      try {
        // Call the AI service directly
        const response = await gptServiceRef.current.chatWithUser(
          context,
          message
        );

        // Add AI response to history
        const aiMessage: GPTMessage = {
          role: "assistant",
          content: response.content,
        };
        setConversationHistory((prev) => [...prev, aiMessage]);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to get AI response";
        setError(errorMessage);
        console.error("AI chat error:", err);

        // Add error message to chat
        const errorResponse: GPTMessage = {
          role: "assistant",
          content:
            "Sorry, I encountered an error while processing your message. Please try again.",
        };
        setConversationHistory((prev) => [...prev, errorResponse]);
      } finally {
        setIsLoading(false);
      }
    },
    [context]
  );

  const clearHistory = useCallback(() => {
    setConversationHistory([]);
    setError(null);
  }, []);

  return {
    conversationHistory,
    sendMessage,
    clearHistory,
    isLoading,
    error,
  };
}
