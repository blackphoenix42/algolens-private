// src/services/ai/index.ts
export { DEFAULT_AI_CONFIG, validateAIConfig } from "./config";
export { GPTService } from "./GPTService";
export { PromptTemplates } from "./prompts";
export type {
  AlgorithmContext,
  CodeAnalysis,
  GPTFeature,
  GPTMessage,
  GPTResponse,
} from "./types";

// Re-export for convenience
export type { AIConfig } from "./config";
