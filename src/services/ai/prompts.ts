// src/services/ai/prompts.ts
import type { AlgorithmContext } from "./types";

export class PromptTemplates {
  static readonly SYSTEM_MESSAGES = {
    ALGORITHM_TUTOR: `You are an expert algorithm tutor for AlgoLens, an interactive algorithm visualization platform. Your role is to:
- Provide clear, educational explanations of algorithms and data structures
- Adapt explanations to the user's level (beginner/intermediate/advanced)
- Focus on intuitive understanding, not just technical details
- Use analogies and real-world examples when helpful
- Encourage learning through questions and exploration
- Be concise but thorough in your explanations

Keep responses under 500 words unless specifically asked for more detail.`,

    CODE_ANALYZER: `You are a code analysis expert for AlgoLens. Your role is to:
- Analyze algorithm implementations for correctness and efficiency
- Identify time and space complexity accurately
- Suggest optimizations and improvements
- Point out potential bugs or edge cases
- Follow best practices for the specific programming language
- Provide constructive feedback in a learning-focused manner

Always structure your analysis with: Complexity, Correctness, Improvements, and Best Practices sections.`,

    INTERACTIVE_ASSISTANT: `You are an AI assistant for AlgoLens algorithm visualization platform. You help users:
- Understand algorithm concepts and implementations
- Debug their code and solve problems
- Choose the right algorithm for their use case
- Learn computer science concepts step by step
- Navigate the platform and its features

Be friendly, patient, and educational. Ask clarifying questions when needed.`,
  };

  static explainAlgorithmStep(context: AlgorithmContext, step: number): string {
    return `Context: User is learning ${context.algorithmTitle} (${context.topic}).
Current step: ${step}
Pseudocode line: ${context.pseudocode?.[step - 1] || "N/A"}

Explain what happens in this step in simple terms. Focus on:
1. What operation is being performed
2. Why this step is necessary
3. How it contributes to the overall algorithm goal

User level: beginner. Keep explanation under 150 words.`;
  }

  static generateCodeExplanation(context: AlgorithmContext): string {
    return `Explain this ${context.language || "pseudocode"} implementation of ${context.algorithmTitle}:

${context.codeSnippet || "Code not provided"}

Provide:
1. High-level overview of the approach
2. Key insights about the algorithm
3. Time and space complexity
4. When to use this algorithm

Keep explanation educational and under 300 words.`;
  }

  static analyzeUserCode(
    code: string,
    language: string,
    algorithmType: string
  ): string {
    return `Analyze this ${language} implementation of a ${algorithmType} algorithm:

\`\`\`${language}
${code}
\`\`\`

Provide analysis in this format:
**Complexity:**
- Time: O(?)
- Space: O(?)

**Correctness:**
- Does it work correctly? 
- Any edge cases missed?

**Improvements:**
- Performance optimizations
- Code quality improvements

**Best Practices:**
- Language-specific recommendations
- Readability improvements

Rate the implementation 1-10 and explain the score.`;
  }

  static answerQuestion(context: AlgorithmContext, question: string): string {
    return `User is studying ${context.algorithmTitle} and asks: "${question}"

Context:
- Algorithm: ${context.algorithmTitle}
- Topic: ${context.topic}
- Current step: ${context.currentStep || "Not specified"}

Provide a clear, educational answer. If the question is unclear, ask for clarification.
Focus on helping them understand the concept better.`;
  }

  static recommendAlgorithm(
    problemDescription: string,
    constraints: string[]
  ): string {
    return `A user needs algorithm recommendations for: "${problemDescription}"

Constraints: ${constraints.join(", ") || "None specified"}

Recommend 2-3 suitable algorithms, explaining:
1. Why each algorithm fits the problem
2. Time/space complexity trade-offs
3. When to prefer one over others
4. Any implementation considerations

Be practical and educational.`;
  }

  static generateQuiz(
    context: AlgorithmContext,
    difficulty: "easy" | "medium" | "hard" = "medium"
  ): string {
    return `Generate a ${difficulty} quiz question about ${context.algorithmTitle}.

Question should test understanding of:
- How the algorithm works
- Time/space complexity
- When to use it
- Key insights

Provide:
1. The question
2. 4 multiple choice options (A, B, C, D)
3. Correct answer with explanation
4. Common misconceptions to avoid

Make it educational, not just memorization.`;
  }
}
