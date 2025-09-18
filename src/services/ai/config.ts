// src/services/ai/config.ts
export type AIProvider = "ollama" | "groq" | "gemini" | "openai";

export interface AIConfig {
  provider: AIProvider;
  apiKey: string; // Not needed for Ollama
  model: string;
  maxTokens: number;
  temperature: number;
  baseURL: string;
  enableFeatures: {
    codeExplanations: boolean;
    interactiveTutor: boolean;
    codeAnalysis: boolean;
    chatAssistant: boolean;
    adaptiveLearning: boolean;
  };
  rateLimit: {
    requestsPerMinute: number;
    requestsPerHour: number;
  };
}

// Provider configurations
export const PROVIDER_CONFIGS = {
  ollama: {
    baseURL: "http://localhost:11434/v1",
    model: "llama3.2:latest",
    apiKey: "", // Not needed for Ollama
  },
  groq: {
    baseURL: "https://api.groq.com/openai/v1",
    model: "llama-3.1-8b-instant",
    apiKey: import.meta.env.VITE_GROQ_API_KEY || "",
  },
  gemini: {
    baseURL: "https://generativelanguage.googleapis.com/v1beta",
    model: "gemini-1.5-flash",
    apiKey: import.meta.env.VITE_GEMINI_API_KEY || "",
  },
  openai: {
    baseURL: "https://api.openai.com/v1",
    model: "gpt-4o-mini",
    apiKey: import.meta.env.VITE_OPENAI_API_KEY || "",
  },
};

export const DEFAULT_AI_CONFIG: AIConfig = {
  provider: "ollama", // Default to free local option
  apiKey: "",
  model: PROVIDER_CONFIGS.ollama.model,
  baseURL: PROVIDER_CONFIGS.ollama.baseURL,
  maxTokens: 1500,
  temperature: 0.3,
  enableFeatures: {
    codeExplanations: true,
    interactiveTutor: true,
    codeAnalysis: true,
    chatAssistant: true,
    adaptiveLearning: false,
  },
  rateLimit: {
    requestsPerMinute: 30, // Higher limits for local models
    requestsPerHour: 200,
  },
};

// Environment validation
export function validateAIConfig(): boolean {
  const provider = (import.meta.env.VITE_AI_PROVIDER as AIProvider) || "ollama";

  if (provider === "ollama") {
    // No API key needed for local Ollama
    return true;
  }

  const providerConfig = PROVIDER_CONFIGS[provider];
  if (!providerConfig?.apiKey) {
    console.warn(
      `${provider.toUpperCase()} API key not found. Please add VITE_${provider.toUpperCase()}_API_KEY to your .env file.`
    );
    return false;
  }

  return true;
}

// Get current config based on environment
export function getCurrentAIConfig(): AIConfig {
  const provider = (import.meta.env.VITE_AI_PROVIDER as AIProvider) || "ollama";
  const providerConfig = PROVIDER_CONFIGS[provider];

  return {
    ...DEFAULT_AI_CONFIG,
    provider,
    apiKey: providerConfig.apiKey,
    model: providerConfig.model,
    baseURL: providerConfig.baseURL,
  };
}
