// src/services/ai/GPTService.ts
import { type AIConfig, getCurrentAIConfig, validateAIConfig } from "./config";
import { PromptTemplates } from "./prompts";
import type {
  AlgorithmContext,
  APIErrorData,
  APIResponseData,
  CodeAnalysis,
  GPTFeature,
  GPTMessage,
  GPTResponse,
} from "./types";

export class GPTService {
  private static instance: GPTService;
  private config: AIConfig;
  private requestCounts: Map<string, number> = new Map();

  constructor(config?: Partial<AIConfig>) {
    this.config = { ...getCurrentAIConfig(), ...config };

    if (!validateAIConfig()) {
      console.warn(
        "AI service not properly configured, some features may be limited"
      );
    }
  }

  static getInstance(config?: Partial<AIConfig>): GPTService {
    if (!GPTService.instance) {
      GPTService.instance = new GPTService(config);
    }
    return GPTService.instance;
  }

  async explainAlgorithmStep(
    context: AlgorithmContext,
    step: number
  ): Promise<GPTResponse> {
    if (!this.config.enableFeatures.codeExplanations) {
      throw new Error("Code explanations are disabled");
    }

    const messages: GPTMessage[] = [
      {
        role: "system",
        content: PromptTemplates.SYSTEM_MESSAGES.ALGORITHM_TUTOR,
      },
      {
        role: "user",
        content: PromptTemplates.explainAlgorithmStep(context, step),
      },
    ];

    return this.makeRequest(messages, "explain");
  }

  async generateCodeExplanation(
    context: AlgorithmContext
  ): Promise<GPTResponse> {
    if (!this.config.enableFeatures.codeExplanations) {
      throw new Error("Code explanations are disabled");
    }

    const messages: GPTMessage[] = [
      {
        role: "system",
        content: PromptTemplates.SYSTEM_MESSAGES.ALGORITHM_TUTOR,
      },
      {
        role: "user",
        content: PromptTemplates.generateCodeExplanation(context),
      },
    ];

    return this.makeRequest(messages, "explain");
  }

  async analyzeCode(
    code: string,
    language: string,
    algorithmType: string
  ): Promise<CodeAnalysis> {
    if (!this.config.enableFeatures.codeAnalysis) {
      throw new Error("Code analysis is disabled");
    }

    const messages: GPTMessage[] = [
      {
        role: "system",
        content: PromptTemplates.SYSTEM_MESSAGES.CODE_ANALYZER,
      },
      {
        role: "user",
        content: PromptTemplates.analyzeUserCode(code, language, algorithmType),
      },
    ];

    const response = await this.makeRequest(messages, "analyze");

    // Parse the response into CodeAnalysis structure
    return this.parseCodeAnalysis(response.content);
  }

  async chatWithUser(
    context: AlgorithmContext,
    userMessage: string,
    conversationHistory: GPTMessage[] = []
  ): Promise<GPTResponse> {
    if (!this.config.enableFeatures.chatAssistant) {
      throw new Error("Chat assistant is disabled");
    }

    const messages: GPTMessage[] = [
      {
        role: "system",
        content: PromptTemplates.SYSTEM_MESSAGES.INTERACTIVE_ASSISTANT,
      },
      ...conversationHistory,
      {
        role: "user",
        content: PromptTemplates.answerQuestion(context, userMessage),
      },
    ];

    return this.makeRequest(messages, "chat");
  }

  async recommendAlgorithm(
    problemDescription: string,
    constraints: string[] = []
  ): Promise<GPTResponse> {
    const messages: GPTMessage[] = [
      {
        role: "system",
        content: PromptTemplates.SYSTEM_MESSAGES.INTERACTIVE_ASSISTANT,
      },
      {
        role: "user",
        content: PromptTemplates.recommendAlgorithm(
          problemDescription,
          constraints
        ),
      },
    ];

    return this.makeRequest(messages, "tutor");
  }

  async generateQuiz(
    context: AlgorithmContext,
    difficulty: "easy" | "medium" | "hard" = "medium"
  ): Promise<GPTResponse> {
    const messages: GPTMessage[] = [
      {
        role: "system",
        content: PromptTemplates.SYSTEM_MESSAGES.ALGORITHM_TUTOR,
      },
      {
        role: "user",
        content: PromptTemplates.generateQuiz(context, difficulty),
      },
    ];

    return this.makeRequest(messages, "quiz");
  }

  private async makeRequest(
    messages: GPTMessage[],
    feature: GPTFeature
  ): Promise<GPTResponse> {
    if (!this.checkRateLimit(feature)) {
      throw new Error("Rate limit exceeded. Please try again later.");
    }

    return this.makeRequestWithRetry(messages, feature, 0);
  }

  private async makeRequestWithRetry(
    messages: GPTMessage[],
    feature: GPTFeature,
    attempt: number
  ): Promise<GPTResponse> {
    const maxRetries = 3;
    const baseDelay = 1000; // 1 second

    try {
      const endpoint =
        this.config.provider === "gemini"
          ? `${this.config.baseURL}/models/${this.config.model}:generateContent`
          : `${this.config.baseURL}/chat/completions`;

      const requestBody =
        this.config.provider === "gemini"
          ? this.buildGeminiRequest(messages)
          : this.buildOpenAIRequest(messages);

      const headers = this.buildHeaders();

      const response = await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        return this.handleErrorResponse(
          response,
          data,
          feature,
          attempt,
          maxRetries,
          baseDelay
        );
      }

      const content = this.extractContent(data);
      if (!content) {
        throw new Error("Invalid response from AI service");
      }

      this.incrementRequestCount(feature);

      return {
        content,
        suggestions: this.extractSuggestions(content),
        followUpQuestions: this.extractFollowUpQuestions(content),
      };
    } catch (error) {
      // If it's a network error, retry
      if (
        error instanceof Error &&
        (error.name === "NetworkError" || error.message.includes("fetch"))
      ) {
        if (attempt < maxRetries) {
          const delay = baseDelay * Math.pow(2, attempt);
          console.warn(
            `Network error, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`
          );
          await this.delay(delay);
          return this.makeRequestWithRetry(messages, feature, attempt + 1);
        }
      }

      console.error("AI Service error:", error);
      throw new Error(
        `AI service unavailable: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  private buildHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (this.config.provider === "ollama") {
      // Ollama doesn't need authorization
    } else if (this.config.provider === "gemini") {
      headers["x-goog-api-key"] = this.config.apiKey;
    } else {
      headers["Authorization"] = `Bearer ${this.config.apiKey}`;
    }

    return headers;
  }

  private buildOpenAIRequest(messages: GPTMessage[]) {
    return {
      model: this.config.model,
      messages,
      max_tokens: this.config.maxTokens,
      temperature: this.config.temperature,
    };
  }

  private buildGeminiRequest(messages: GPTMessage[]) {
    const contents = messages.map((msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    return {
      contents,
      generationConfig: {
        maxOutputTokens: this.config.maxTokens,
        temperature: this.config.temperature,
      },
    };
  }

  private extractContent(data: APIResponseData): string | null {
    if (this.config.provider === "gemini") {
      const geminiResponse = data as import("./types").GeminiResponse;
      return geminiResponse.candidates?.[0]?.content?.parts?.[0]?.text || null;
    } else {
      const openAIResponse = data as import("./types").OpenAIResponse;
      return openAIResponse.choices?.[0]?.message?.content || null;
    }
  }

  private async handleErrorResponse(
    response: Response,
    data: APIErrorData,
    feature: GPTFeature,
    attempt: number,
    maxRetries: number,
    baseDelay: number
  ): Promise<GPTResponse> {
    if (response.status === 429) {
      const resetTime =
        response.headers.get("x-ratelimit-reset-requests") ||
        response.headers.get("retry-after");
      const errorMessage = this.getDetailedRateLimitError(data, resetTime);

      // Retry with exponential backoff for rate limits
      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
        console.warn(
          `Rate limited, retrying in ${Math.round(delay)}ms (attempt ${attempt + 1}/${maxRetries})`
        );
        await this.delay(delay);
        return this.makeRequestWithRetry(
          [
            /* messages will be passed from caller */
          ],
          feature,
          attempt + 1
        );
      }

      throw new Error(errorMessage);
    } else if (response.status === 401) {
      throw new Error(
        `Invalid API key for ${this.config.provider}. Please check your configuration.`
      );
    } else if (response.status === 403) {
      throw new Error(
        `API access forbidden for ${this.config.provider}. Please check your account status.`
      );
    } else if (response.status >= 500) {
      throw new Error(
        `${this.config.provider} service temporarily unavailable (${response.status}). Please try again later.`
      );
    } else {
      const errorMsg =
        data.error?.message || data.message || response.statusText;
      throw new Error(
        `${this.config.provider} API error: ${response.status} - ${errorMsg}`
      );
    }
  }

  private getDetailedRateLimitError(
    errorData: APIErrorData,
    resetTime: string | null
  ): string {
    const errorMessage = errorData.error?.message || "";

    if (errorMessage.includes("quota")) {
      return "OpenAI API quota exceeded. Please check your billing and usage limits at https://platform.openai.com/usage";
    } else if (errorMessage.includes("insufficient_quota")) {
      return "Insufficient OpenAI credits. Please add billing information at https://platform.openai.com/account/billing";
    } else if (resetTime) {
      const resetDate = new Date(parseInt(resetTime) * 1000);
      return `OpenAI rate limit exceeded. Try again after ${resetDate.toLocaleTimeString()}`;
    } else {
      return "OpenAI rate limit exceeded. Please wait a moment before trying again.";
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private checkRateLimit(feature: GPTFeature): boolean {
    const now = Date.now();
    const minute = Math.floor(now / 60000);
    const hour = Math.floor(now / 3600000);

    const minuteKey = `${feature}-${minute}`;
    const hourKey = `${feature}-${hour}`;

    const minuteCount = this.requestCounts.get(minuteKey) || 0;
    const hourCount = this.requestCounts.get(hourKey) || 0;

    return (
      minuteCount < this.config.rateLimit.requestsPerMinute &&
      hourCount < this.config.rateLimit.requestsPerHour
    );
  }

  private incrementRequestCount(feature: GPTFeature): void {
    const now = Date.now();
    const minute = Math.floor(now / 60000);
    const hour = Math.floor(now / 3600000);

    const minuteKey = `${feature}-${minute}`;
    const hourKey = `${feature}-${hour}`;

    this.requestCounts.set(
      minuteKey,
      (this.requestCounts.get(minuteKey) || 0) + 1
    );
    this.requestCounts.set(hourKey, (this.requestCounts.get(hourKey) || 0) + 1);
  }

  private extractSuggestions(content: string): string[] {
    // Simple regex to extract suggestions (can be improved)
    const suggestionMatch = content.match(
      /suggestions?:?\s*\n((?:[-•]\s*.+\n?)+)/i
    );
    if (suggestionMatch) {
      return suggestionMatch[1]
        .split("\n")
        .map((s) => s.replace(/^[-•]\s*/, "").trim())
        .filter((s) => s.length > 0);
    }
    return [];
  }

  private extractFollowUpQuestions(content: string): string[] {
    // Simple regex to extract follow-up questions
    const questionMatch = content.match(
      /follow.?up questions?:?\s*\n((?:[-•]\s*.+\n?)+)/i
    );
    if (questionMatch) {
      return questionMatch[1]
        .split("\n")
        .map((s) => s.replace(/^[-•]\s*/, "").trim())
        .filter((s) => s.length > 0 && s.endsWith("?"));
    }
    return [];
  }

  private parseCodeAnalysis(content: string): CodeAnalysis {
    // Parse the structured response into CodeAnalysis
    // This is a simplified parser - you might want to use a more robust solution
    const timeComplexityMatch = content.match(/time:\s*o?\(?([^)]+)\)?/i);
    const spaceComplexityMatch = content.match(/space:\s*o?\(?([^)]+)\)?/i);
    const scoreMatch = content.match(/rate.*?(\d+)(?:\/10)?/i);

    const improvements: string[] = [];
    const improvementsSection = content.match(
      /improvements?:?\s*\n((?:[-•*]\s*.+\n?)+)/i
    );
    if (improvementsSection) {
      improvements.push(
        ...improvementsSection[1]
          .split("\n")
          .map((s) => s.replace(/^[-•*]\s*/, "").trim())
          .filter((s) => s.length > 0)
      );
    }

    const bestPractices: string[] = [];
    const practicesSection = content.match(
      /best practices?:?\s*\n((?:[-•*]\s*.+\n?)+)/i
    );
    if (practicesSection) {
      bestPractices.push(
        ...practicesSection[1]
          .split("\n")
          .map((s) => s.replace(/^[-•*]\s*/, "").trim())
          .filter((s) => s.length > 0)
      );
    }

    return {
      complexity: {
        time: timeComplexityMatch
          ? `O(${timeComplexityMatch[1].trim()})`
          : "Unknown",
        space: spaceComplexityMatch
          ? `O(${spaceComplexityMatch[1].trim()})`
          : "Unknown",
      },
      improvements,
      bestPractices,
      score: scoreMatch ? parseInt(scoreMatch[1], 10) : 5,
    };
  }

  isFeatureEnabled(feature: keyof AIConfig["enableFeatures"]): boolean {
    return this.config.enableFeatures[feature];
  }

  updateConfig(newConfig: Partial<AIConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}
