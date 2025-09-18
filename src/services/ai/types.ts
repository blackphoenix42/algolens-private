// src/services/ai/types.ts
export interface GPTMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AlgorithmContext {
  algorithmSlug: string;
  algorithmTitle: string;
  topic: string;
  currentStep?: number;
  pseudocode?: string[];
  codeSnippet?: string;
  language?: string;
  userQuery?: string;
}

export interface GPTResponse {
  content: string;
  suggestions?: string[];
  followUpQuestions?: string[];
}

export interface CodeAnalysis {
  complexity: {
    time: string;
    space: string;
  };
  improvements: string[];
  bestPractices: string[];
  errors?: string[];
  score: number; // 1-10
}

export type GPTFeature =
  | "explain"
  | "tutor"
  | "chat"
  | "analyze"
  | "optimize"
  | "quiz";

// API Response types for better type safety
export interface OpenAIError {
  error?: {
    message?: string;
    type?: string;
    code?: string;
  };
  message?: string;
}

export interface GeminiError {
  error?: {
    message?: string;
    status?: string;
    code?: number;
  };
  message?: string;
}

export interface OpenAIResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  error?: {
    message?: string;
    type?: string;
    code?: string;
  };
}

export interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
  error?: {
    message?: string;
    status?: string;
    code?: number;
  };
}

export type APIResponseData = OpenAIResponse | GeminiResponse;
export type APIErrorData = OpenAIError | GeminiError;
