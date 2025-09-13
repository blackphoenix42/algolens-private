/**
 * Advanced search utilities for fuzzy matching, typo correction, and intelligent search ranking
 */

import type { AlgoMeta } from "@/types/algorithms";

export interface SearchableItem {
  id: string;
  title: string;
  category?: string;
  tags?: string[];
  summary?: string;
  searchableText?: string;
}

export interface SearchResult<T = SearchableItem> {
  item: T;
  score: number;
  type: "exact" | "fuzzy" | "partial" | "suggested";
  highlightedTitle?: string;
  matches?: string[];
}

export interface SearchOptions {
  fuzzyThreshold?: number; // 0-1, lower is more strict
  maxResults?: number;
  includeScore?: boolean;
  minScore?: number;
  highlightMatches?: boolean;
  suggestTypos?: boolean;
  maxSuggestionDistance?: number;
}

const defaultOptions: Required<SearchOptions> = {
  fuzzyThreshold: 0.6,
  maxResults: 10,
  includeScore: true,
  minScore: 0.1,
  highlightMatches: true,
  suggestTypos: true,
  maxSuggestionDistance: 2,
};

/**
 * Calculate Levenshtein distance between two strings
 */
export function levenshteinDistance(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix: number[][] = Array(a.length + 1)
    .fill(null)
    .map(() => Array(b.length + 1).fill(0));

  // Initialize first row and column
  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

  // Fill the matrix
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return matrix[a.length][b.length];
}

/**
 * Calculate similarity score between two strings (0-1, where 1 is identical)
 */
export function similarityScore(a: string, b: string): number {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  return 1 - levenshteinDistance(a.toLowerCase(), b.toLowerCase()) / maxLen;
}

/**
 * Check if query is a fuzzy match for target string
 */
export function isFuzzyMatch(
  query: string,
  target: string,
  threshold = 0.6
): boolean {
  return similarityScore(query, target) >= threshold;
}

/**
 * Calculate relevance score for a searchable item
 * Optimized for performance with early returns
 */
function calculateRelevanceScore(query: string, item: SearchableItem): number {
  const lowerQuery = query.toLowerCase();
  const lowerTitle = item.title.toLowerCase();

  let score = 0;

  // Exact title match (highest priority) - early return
  if (lowerTitle === lowerQuery) return 1.0;

  // Title starts with query (very high priority) - early return for high scores
  if (lowerTitle.startsWith(lowerQuery)) return 0.9;

  // Title contains query (high priority)
  if (lowerTitle.includes(lowerQuery)) {
    score += 0.7;
  } else {
    // Only do fuzzy matching if no direct match - expensive operation
    const titleSimilarity = similarityScore(lowerQuery, lowerTitle);
    if (titleSimilarity >= 0.6) {
      score += titleSimilarity * 0.6;
    } else if (titleSimilarity < 0.3) {
      // Early exit for very low similarity
      return 0;
    }
  }

  // Category match - quick check
  const lowerCategory = item.category?.toLowerCase() || "";
  if (lowerCategory.includes(lowerQuery)) score += 0.4;

  // Only check other fields if we have a reasonable base score or very short query
  if (score > 0.3 || query.length <= 3) {
    // Summary contains query
    const lowerSummary = item.summary?.toLowerCase() || "";
    if (lowerSummary.includes(lowerQuery)) score += 0.2;

    // Tags match - only if we need more score
    if (score < 0.8) {
      const lowerTags = item.tags?.join(" ").toLowerCase() || "";
      const tagWords = lowerTags.split(/\s+/);
      for (const tag of tagWords) {
        if (tag.includes(lowerQuery)) {
          score += 0.3;
          break; // Only count first tag match for performance
        }
      }
    }

    // Additional searchable text - only for low scores
    if (score < 0.5) {
      const lowerSearchable = item.searchableText?.toLowerCase() || "";
      if (lowerSearchable.includes(lowerQuery)) score += 0.1;
    }
  }

  // Boost score for shorter matches (more specific) - simplified calculation
  if (score > 0) {
    const lengthBoost = Math.min(0.2, (query.length / item.title.length) * 0.2);
    score *= 1 + lengthBoost;
  }

  return Math.min(score, 1.0);
}

/**
 * Highlight matching text in a string
 */
export function highlightMatches(text: string, query: string): string {
  if (!query || query.trim() === "") return text;

  const regex = new RegExp(
    `(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
    "gi"
  );
  return text.replace(
    regex,
    '<mark class="bg-yellow-200 dark:bg-yellow-800">$1</mark>'
  );
}

/**
 * Find potential typo corrections for a query
 */
export function findTypoSuggestions(
  query: string,
  items: SearchableItem[],
  maxDistance = 2
): string[] {
  const suggestions: Array<{ text: string; score: number }> = [];
  const lowerQuery = query.toLowerCase();

  for (const item of items) {
    const words = [
      item.title,
      ...(item.tags || []),
      item.category || "",
      ...(item.searchableText?.split(/\s+/) || []),
    ].filter(Boolean);

    for (const word of words) {
      const lowerWord = word.toLowerCase();
      const distance = levenshteinDistance(lowerQuery, lowerWord);

      if (
        distance > 0 &&
        distance <= maxDistance &&
        word.length >= query.length - 1
      ) {
        const score = 1 - distance / Math.max(query.length, word.length);
        suggestions.push({ text: word, score });
      }
    }
  }

  // Sort by score and remove duplicates
  return [
    ...new Set(
      suggestions
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map((s) => s.text)
    ),
  ];
}

/**
 * Advanced search function with fuzzy matching, typo correction, and relevance ranking
 * Optimized for fast typing with early returns and performance improvements
 */
export function advancedSearch<T extends SearchableItem>(
  query: string,
  items: T[],
  options: SearchOptions = {}
): SearchResult<T>[] {
  const opts = { ...defaultOptions, ...options };

  if (!query || query.trim() === "") {
    return [];
  }

  const results: SearchResult<T>[] = [];
  const lowerQuery = query.toLowerCase().trim();

  // Fast path for very short queries - only check title starts and exact matches
  if (query.length <= 2) {
    for (const item of items) {
      const lowerTitle = item.title.toLowerCase();

      // Exact match
      if (lowerTitle === lowerQuery) {
        results.push({
          item,
          score: 1.0,
          type: "exact",
          highlightedTitle: opts.highlightMatches
            ? highlightMatches(item.title, query)
            : undefined,
          matches: ["title"],
        });
      }
      // Starts with query
      else if (lowerTitle.startsWith(lowerQuery)) {
        results.push({
          item,
          score: 0.9,
          type: "exact",
          highlightedTitle: opts.highlightMatches
            ? highlightMatches(item.title, query)
            : undefined,
          matches: ["title"],
        });
      }
      // Category match for short queries
      else if (item.category?.toLowerCase().includes(lowerQuery)) {
        results.push({
          item,
          score: 0.7,
          type: "partial",
          highlightedTitle: opts.highlightMatches
            ? highlightMatches(item.title, query)
            : undefined,
          matches: ["category"],
        });
      }

      // Limit results for performance
      if (results.length >= opts.maxResults) break;
    }

    return results.sort((a, b) => b.score - a.score);
  }

  // Full search for longer queries
  for (const item of items) {
    const score = calculateRelevanceScore(query, item);

    if (score >= opts.minScore) {
      const result: SearchResult<T> = {
        item,
        score,
        type: score >= 0.8 ? "exact" : score >= 0.4 ? "partial" : "fuzzy",
      };

      if (opts.highlightMatches) {
        result.highlightedTitle = highlightMatches(item.title, query);
        result.matches = [];

        // Find what matched (optimized - early exit when enough matches found)
        const lowerTitle = item.title.toLowerCase();
        const lowerCategory = item.category?.toLowerCase() || "";
        const lowerSummary = item.summary?.toLowerCase() || "";

        if (lowerTitle.includes(lowerQuery)) result.matches.push("title");
        if (lowerCategory.includes(lowerQuery)) result.matches.push("category");
        if (result.matches.length < 2 && lowerSummary.includes(lowerQuery))
          result.matches.push("summary");

        // Check tags only if we don't have enough matches yet
        if (
          result.matches.length < 2 &&
          item.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery))
        ) {
          result.matches.push("tags");
        }
      }

      results.push(result);
    }

    // Early exit if we have enough high-quality results
    if (results.length >= opts.maxResults * 1.5) {
      results.sort((a, b) => b.score - a.score);
      results.splice(opts.maxResults);
      break;
    }
  }

  // Sort by relevance score
  results.sort((a, b) => b.score - a.score);

  // Phase 2: If no good results and typo suggestions enabled, find suggestions
  if (results.length === 0 && opts.suggestTypos && query.length > 2) {
    const suggestions = findTypoSuggestions(
      query,
      items,
      opts.maxSuggestionDistance
    );

    for (const suggestion of suggestions) {
      const suggestionResults = advancedSearch(suggestion, items, {
        ...opts,
        suggestTypos: false, // Prevent infinite recursion
        maxResults: Math.ceil(opts.maxResults / 2),
      });

      for (const result of suggestionResults) {
        results.push({
          ...result,
          type: "suggested",
          score: result.score * 0.8, // Lower score for suggestions
        });
      }
    }
  }

  return results.slice(0, opts.maxResults);
}

/**
 * Get "Did you mean?" suggestions
 */
export function getDidYouMeanSuggestions(
  query: string,
  items: SearchableItem[],
  threshold = 0.6
): string[] {
  if (!query || query.trim() === "") return [];

  return findTypoSuggestions(query, items, 2)
    .filter(
      (suggestion) =>
        suggestion.toLowerCase() !== query.toLowerCase() &&
        similarityScore(query, suggestion) >= threshold
    )
    .slice(0, 3);
}

/**
 * Create searchable items from algorithm metadata
 */
export function createSearchableFromAlgoMeta(
  algos: AlgoMeta[]
): SearchableItem[] {
  return algos.map((algo) => ({
    id: `${algo.topic}-${algo.slug}`,
    title: algo.title,
    category: algo.topic,
    tags: [
      ...(algo.pros || []),
      ...(algo.cons || []),
      algo.complexity?.stable ? "stable" : "unstable",
      algo.complexity?.inPlace ? "in-place" : "not-in-place",
      ...(algo.pseudocode || []),
    ].filter(Boolean),
    summary: algo.summary,
    searchableText: [
      algo.about || "",
      ...(algo.pros || []),
      ...(algo.cons || []),
      ...Object.values(algo.complexity?.time || {}),
      algo.complexity?.space || "",
    ].join(" "),
  }));
}
