/**
 * Consolidated type definitions for AlgoLens
 * This file contains all type definitions previously scattered across different files
 */

// Core Algorithm Types (previously from engine/types.ts)
export type Counters = Record<string, number>;

export type Highlights = {
  indices?: number[];
  compared?: [number, number];
  swapped?: [number, number];
  pivot?: number;
};

export type Frame = {
  array?: number[];
  pcLine?: number; // 1-based
  highlights?: Highlights;
  counters?: Counters;
  message?: string;
  explain?: string; // human text about this step
};

export type Algorithm = (
  input: unknown,
  opts?: { seed?: number }
) => Generator<Frame>;

// Algorithm Metadata Types (previously from types/algorithms.ts)
export type AlgoCode = {
  cpp?: string;
  java?: string;
  python?: string;
  javascript?: string;
};

export type CodeLineMap = Partial<
  Record<"cpp" | "java" | "python" | "javascript", number[]>
>;

export type AlgoMeta = {
  slug: string;
  title: string;
  topic: "sorting" | "searching" | "graphs" | "arrays";
  summary: string;
  pseudocode: string[];
  complexity: {
    time: { best: string; average: string; worst: string };
    space: string;
    stable?: boolean;
    inPlace?: boolean;
  };
  about: string;
  pros?: string[];
  cons?: string[];
  code: AlgoCode;
  codeLineMap?: CodeLineMap;
  load: () => Promise<{ run: Algorithm }>;
};

// Export types for better organization
export type {
  Frame as AlgoFrame, // Alias for backward compatibility
  Algorithm as AlgoFunction,
  Highlights as AlgoHighlights,
  Counters as AlgoCounters,
};
