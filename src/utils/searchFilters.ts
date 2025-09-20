/**
 * Search term to filter mapping utilities
 * Allows searching for complexity terms like "O(1)", "constant time", etc.
 * and automatically applying appropriate filters
 */

import type {
  AlgorithmType,
  ComplexityLevel,
  DataStructureType,
} from "@/components/home/FilterBar";

export interface FilterAction {
  type: "complexity" | "algorithmType" | "dataStructure" | "tag" | "difficulty";
  values: string[];
}

// Complexity mappings
const COMPLEXITY_MAPPINGS: Record<string, ComplexityLevel> = {
  // Big O notations -> descriptive names
  "o(1)": "constant",
  "o(log n)": "logarithmic",
  "o(n)": "linear",
  "o(n log n)": "linearithmic",
  "o(n²)": "quadratic",
  "o(n³)": "cubic",
  "o(2^n)": "exponential",

  // Alternative notations
  "o(log(n))": "logarithmic",
  "o(nlogn)": "linearithmic",
  "o(n^2)": "quadratic",
  "o(n2)": "quadratic",
  "o(n^3)": "cubic",
  "o(n3)": "cubic",
  "o(2n)": "exponential",

  // Natural language (direct mapping)
  constant: "constant",
  "constant time": "constant",
  logarithmic: "logarithmic",
  "logarithmic time": "logarithmic",
  linear: "linear",
  "linear time": "linear",
  linearithmic: "linearithmic",
  quasilinear: "linearithmic",
  quadratic: "quadratic",
  "quadratic time": "quadratic",
  cubic: "cubic",
  "cubic time": "cubic",
  exponential: "exponential",
  "exponential time": "exponential",
};

// Algorithm type mappings
const ALGORITHM_TYPE_MAPPINGS: Record<string, AlgorithmType> = {
  sort: "sorting",
  sorting: "sorting",
  bubble: "sorting",
  merge: "sorting",
  quick: "sorting",
  heap: "sorting",

  search: "searching",
  searching: "searching",
  "binary search": "searching",
  "linear search": "searching",
  "depth first": "searching",
  "breadth first": "searching",
  dfs: "searching",
  bfs: "searching",

  "dynamic programming": "dynamic-programming",
  dp: "dynamic-programming",
  memoization: "dynamic-programming",
  tabulation: "dynamic-programming",

  graph: "graph",
  graphs: "graph",
  dijkstra: "graph",
  bellman: "graph",
  floyd: "graph",

  tree: "tree",
  trees: "tree",
  "binary tree": "tree",
  bst: "tree",
  avl: "tree",
  "red black": "tree",

  greedy: "greedy",
  "greedy algorithm": "greedy",

  backtracking: "backtracking",
  backtrack: "backtracking",

  "divide and conquer": "divide-conquer",
  "divide-conquer": "divide-conquer",
  "divide conquer": "divide-conquer",
};

// Data structure mappings
const DATA_STRUCTURE_MAPPINGS: Record<string, DataStructureType> = {
  array: "array",
  arrays: "array",
  list: "array",
  vector: "array",

  "linked list": "linked-list",
  "linked lists": "linked-list",
  "singly linked": "linked-list",
  "doubly linked": "linked-list",

  stack: "stack",
  stacks: "stack",
  lifo: "stack",

  queue: "queue",
  queues: "queue",
  fifo: "queue",
  "priority queue": "queue",

  tree: "tree",
  trees: "tree",
  "binary tree": "tree",
  "n-ary tree": "tree",

  graph: "graph",
  graphs: "graph",
  "directed graph": "graph",
  "undirected graph": "graph",

  hash: "hash-table",
  "hash table": "hash-table",
  "hash map": "hash-table",
  dictionary: "hash-table",
  map: "hash-table",

  heap: "heap",
  heaps: "heap",
  "min heap": "heap",
  "max heap": "heap",
  "binary heap": "heap",
};

/**
 * Analyzes a search term and returns filter actions that should be applied
 */
export function parseSearchTermForFilters(searchTerm: string): FilterAction[] {
  const term = searchTerm.toLowerCase().trim();
  const actions: FilterAction[] = [];

  // Check for complexity matches
  if (COMPLEXITY_MAPPINGS[term]) {
    actions.push({
      type: "complexity",
      values: [COMPLEXITY_MAPPINGS[term]],
    });
  }

  // Check for algorithm type matches
  if (ALGORITHM_TYPE_MAPPINGS[term]) {
    actions.push({
      type: "algorithmType",
      values: [ALGORITHM_TYPE_MAPPINGS[term]],
    });
  }

  // Check for data structure matches
  if (DATA_STRUCTURE_MAPPINGS[term]) {
    actions.push({
      type: "dataStructure",
      values: [DATA_STRUCTURE_MAPPINGS[term]],
    });
  }

  // Check for partial matches (e.g., "o(n" should match "O(n)")
  const partialComplexityMatches = Object.keys(COMPLEXITY_MAPPINGS).filter(
    (key) =>
      key.startsWith(term) ||
      term.startsWith(key.substring(0, Math.min(3, key.length)))
  );

  if (partialComplexityMatches.length > 0) {
    const complexityValues = partialComplexityMatches.map(
      (key) => COMPLEXITY_MAPPINGS[key]
    );
    if (
      complexityValues.length > 0 &&
      !actions.some((a) => a.type === "complexity")
    ) {
      actions.push({
        type: "complexity",
        values: complexityValues,
      });
    }
  }

  return actions;
}

/**
 * Gets all searchable terms for auto-completion
 */
export function getSearchableFilterTerms(): string[] {
  return [
    ...Object.keys(COMPLEXITY_MAPPINGS),
    ...Object.keys(ALGORITHM_TYPE_MAPPINGS),
    ...Object.keys(DATA_STRUCTURE_MAPPINGS),
  ].sort();
}

/**
 * Gets suggestions for a partial search term
 */
export function getFilterTermSuggestions(
  partialTerm: string,
  limit = 5
): string[] {
  const term = partialTerm.toLowerCase().trim();
  if (term.length < 1) return [];

  const allTerms = getSearchableFilterTerms();
  const matches = allTerms.filter((t) => t.includes(term));

  // Prioritize exact matches and prefix matches
  const exactMatches = matches.filter((t) => t.startsWith(term));
  const otherMatches = matches.filter((t) => !t.startsWith(term));

  return [...exactMatches, ...otherMatches].slice(0, limit);
}
