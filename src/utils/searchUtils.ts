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
  type:
    | "exact"
    | "fuzzy"
    | "partial"
    | "suggested"
    | "semantic"
    | "phonetic"
    | "contextual";
  highlightedTitle?: string;
  matches?: string[];
  explanation?: string; // Why this result was suggested
}

export interface SearchOptions {
  fuzzyThreshold?: number; // 0-1, lower is more strict
  maxResults?: number;
  includeScore?: boolean;
  minScore?: number;
  highlightMatches?: boolean;
  suggestTypos?: boolean;
  maxSuggestionDistance?: number;
  enableSemanticSearch?: boolean;
  enablePhoneticSearch?: boolean;
  enableContextualSearch?: boolean;
  enableAbbreviationSearch?: boolean;
  enableSynonymSearch?: boolean;
}

const defaultOptions: Required<SearchOptions> = {
  fuzzyThreshold: 0.6,
  maxResults: 10,
  includeScore: true,
  minScore: 0.1,
  highlightMatches: true,
  suggestTypos: true,
  maxSuggestionDistance: 2,
  enableSemanticSearch: true,
  enablePhoneticSearch: true,
  enableContextualSearch: true,
  enableAbbreviationSearch: true,
  enableSynonymSearch: true,
};

/**
 * Common abbreviations and acronyms in computer science
 */
const ABBREVIATION_MAPPINGS: Record<string, string[]> = {
  // Search algorithms
  dfs: ["depth first search", "depth-first"],
  bfs: ["breadth first search", "breadth-first"],
  ucs: ["uniform cost search"],
  iddfs: ["iterative deepening depth first search"],

  // Tree structures
  bst: ["binary search tree"],
  avl: ["adelson velsky landis"],
  rbt: ["red black tree"],
  bt: ["binary tree"],

  // Graph algorithms
  mst: ["minimum spanning tree"],
  scc: ["strongly connected components"],
  dag: ["directed acyclic graph"],

  // String algorithms
  lcs: ["longest common subsequence"],
  lis: ["longest increasing subsequence"],
  kmp: ["knuth morris pratt"],

  // Dynamic programming
  dp: ["dynamic programming"],
  memo: ["memoization"],

  // Other algorithms
  bf: ["brute force", "bellman ford"],
  dc: ["divide and conquer"],
  greedy: ["greedy algorithm"],

  // Data structures
  ll: ["linked list"],
  dll: ["doubly linked list"],
  heap: ["heap", "priority queue"],
  stack: ["stack", "lifo"],
  queue: ["queue", "fifo"],

  // Cache algorithms
  lru: ["least recently used"],
  lfu: ["least frequently used"],
  fifo: ["first in first out"],
  lifo: ["last in first out"],

  // Complexity notation
  "big o": ["time complexity", "space complexity"],
  "o(1)": ["constant time"],
  "o(n)": ["linear time"],
  "o(log n)": ["logarithmic time"],
  "o(n log n)": ["linearithmic time"],
  "o(n²)": ["quadratic time", "o(n^2)"],

  // System terms
  api: ["application programming interface"],
  ui: ["user interface"],
  db: ["database"],
  os: ["operating system"],
  fs: ["file system"],
  gc: ["garbage collection"],
  jit: ["just in time"],
  cpu: ["central processing unit"],
  gpu: ["graphics processing unit"],
  ram: ["random access memory"],
  ssd: ["solid state drive"],
  hdd: ["hard disk drive"],
  url: ["uniform resource locator"],
  http: ["hypertext transfer protocol"],
  tcp: ["transmission control protocol"],
  udp: ["user datagram protocol"],
  ip: ["internet protocol"],
  dns: ["domain name system"],
};

/**
 * Synonym mappings for common terms
 */
const SYNONYM_MAPPINGS: Record<string, string[]> = {
  // Action words
  find: ["search", "locate", "discover", "seek", "lookup"],
  search: ["find", "lookup", "seek", "hunt", "explore"],
  sort: ["order", "arrange", "organize", "rank", "sequence"],
  order: ["sort", "arrange", "sequence", "rank"],
  traverse: ["visit", "walk", "iterate", "explore", "navigate"],
  insert: ["add", "include", "append", "place", "put"],
  remove: ["delete", "eliminate", "erase", "extract", "take out"],
  update: ["modify", "change", "alter", "edit", "revise"],
  compare: ["contrast", "match", "check", "evaluate", "assess"],

  // Performance descriptors
  fast: ["quick", "rapid", "speedy", "efficient", "swift", "optimal"],
  slow: ["sluggish", "inefficient", "poor", "suboptimal", "bad"],
  optimal: ["best", "ideal", "perfect", "efficient", "maximum"],
  efficient: ["fast", "optimal", "good", "effective", "streamlined"],

  // Size descriptors
  big: ["large", "huge", "massive", "enormous", "giant"],
  small: ["tiny", "little", "minimal", "compact", "micro"],

  // Quality descriptors
  best: ["optimal", "ideal", "perfect", "excellent", "top"],
  worst: ["poor", "bad", "terrible", "awful", "suboptimal"],
  good: ["excellent", "great", "fine", "solid", "decent"],
  bad: ["poor", "terrible", "awful", "suboptimal", "inefficient"],

  // Difficulty descriptors
  simple: ["easy", "basic", "elementary", "straightforward", "trivial"],
  complex: ["complicated", "difficult", "hard", "intricate", "sophisticated"],
  easy: ["simple", "basic", "straightforward", "trivial", "elementary"],
  hard: ["difficult", "complex", "challenging", "tough", "intricate"],

  // Structure terms
  path: ["route", "way", "connection", "link", "trail"],
  distance: ["length", "cost", "weight", "span", "measure"],
  connect: ["link", "join", "attach", "bind", "associate"],
  node: ["vertex", "element", "item", "point"],
  edge: ["connection", "link", "arc", "branch"],

  // Algorithm properties
  stable: ["consistent", "reliable", "predictable"],
  unstable: ["inconsistent", "unreliable", "unpredictable"],
  recursive: ["self-calling", "iterative approach"],
  iterative: ["looping", "repetitive", "cyclical"],

  // Data structure terms
  array: ["list", "collection", "sequence", "vector"],
  list: ["array", "sequence", "collection"],
  tree: ["hierarchy", "structure", "branching"],
  graph: ["network", "connections", "relationships"],
  stack: ["pile", "lifo", "last in first out"],
  queue: ["line", "fifo", "first in first out"],
  heap: ["priority queue", "binary heap"],
};

/**
 * Soundex algorithm for phonetic matching
 */
function soundex(word: string): string {
  if (!word) return "";

  word = word.toUpperCase();
  let soundexCode = word[0];

  // Soundex mapping
  const mapping: Record<string, string> = {
    B: "1",
    F: "1",
    P: "1",
    V: "1",
    C: "2",
    G: "2",
    J: "2",
    K: "2",
    Q: "2",
    S: "2",
    X: "2",
    Z: "2",
    D: "3",
    T: "3",
    L: "4",
    M: "5",
    N: "5",
    R: "6",
  };

  for (let i = 1; i < word.length; i++) {
    const code = mapping[word[i]] || "";
    if (code && code !== soundexCode[soundexCode.length - 1]) {
      soundexCode += code;
    }
  }

  // Pad with zeros and return first 4 characters
  return (soundexCode + "000").substring(0, 4);
}

/**
 * Double Metaphone algorithm (simplified) for better phonetic matching
 */
function doubleMetaphone(word: string): [string, string] {
  if (!word) return ["", ""];

  word = word.toUpperCase();
  let primary = "";
  let secondary = "";
  let pos = 0;

  // Simplified rules - in a real implementation, this would be much more complex
  const vowels = "AEIOUY";

  while (pos < word.length && primary.length < 4) {
    const char = word[pos];
    const next = word[pos + 1] || "";
    const prev = word[pos - 1] || "";

    switch (char) {
      case "B":
        primary += "1";
        break;
      case "C":
        if (next === "H") {
          primary += "X";
          pos++;
        } else {
          primary += "K";
        }
        break;
      case "D":
        primary += "T";
        break;
      case "F":
      case "V":
        primary += "F";
        break;
      case "G":
      case "J":
        primary += "J";
        break;
      case "H":
        if (vowels.includes(prev) && vowels.includes(next)) {
          primary += "H";
        }
        break;
      case "K":
      case "Q":
        primary += "K";
        break;
      case "L":
        primary += "L";
        break;
      case "M":
      case "N":
        primary += "M";
        break;
      case "P":
        if (next === "H") {
          primary += "F";
          pos++;
        } else {
          primary += "P";
        }
        break;
      case "R":
        primary += "R";
        break;
      case "S":
        if (next === "H") {
          primary += "X";
          pos++;
        } else {
          primary += "S";
        }
        break;
      case "T":
        if (next === "H") {
          primary += "0";
          pos++;
        } else {
          primary += "T";
        }
        break;
      case "W":
        if (vowels.includes(next)) {
          primary += "W";
        }
        break;
      case "X":
        primary += "KS";
        break;
      case "Z":
        primary += "S";
        break;
      default:
        if (vowels.includes(char) && pos === 0) {
          primary += "A";
        }
        break;
    }
    pos++;
  }

  secondary = primary; // Simplified - normally would have different rules
  return [primary.substring(0, 4), secondary.substring(0, 4)];
}

/**
 * N-gram similarity for better fuzzy matching
 */
function ngramSimilarity(str1: string, str2: string, n: number = 2): number {
  if (!str1 || !str2) return 0;

  const getNgrams = (str: string): Set<string> => {
    const ngrams = new Set<string>();
    const s = ` ${str.toLowerCase()} `;
    for (let i = 0; i <= s.length - n; i++) {
      ngrams.add(s.substring(i, i + n));
    }
    return ngrams;
  };

  const ngrams1 = getNgrams(str1);
  const ngrams2 = getNgrams(str2);

  const intersection = new Set([...ngrams1].filter((x) => ngrams2.has(x)));
  const union = new Set([...ngrams1, ...ngrams2]);

  return intersection.size / union.size;
}

/**
 * Advanced search analytics and insights
 */
class SearchAnalytics {
  private static searchQueries: Map<string, number> = new Map();
  private static failedQueries: Map<string, number> = new Map();
  private static queryTimestamps: Array<{
    query: string;
    timestamp: number;
    resultCount: number;
  }> = [];
  private static userSessions: Map<
    string,
    { queries: string[]; selections: string[] }
  > = new Map();
  private static currentSessionId: string = this.generateSessionId();

  private static generateSessionId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  static trackSearchQuery(query: string, resultCount: number): void {
    const normalizedQuery = query.toLowerCase().trim();
    if (normalizedQuery.length < 2) return;

    // Track query frequency
    const currentCount = this.searchQueries.get(normalizedQuery) || 0;
    this.searchQueries.set(normalizedQuery, currentCount + 1);

    // Track failed searches
    if (resultCount === 0) {
      const failedCount = this.failedQueries.get(normalizedQuery) || 0;
      this.failedQueries.set(normalizedQuery, failedCount + 1);
    }

    // Track query patterns over time
    this.queryTimestamps.push({
      query: normalizedQuery,
      timestamp: Date.now(),
      resultCount,
    });

    // Keep only recent queries (last 1000)
    if (this.queryTimestamps.length > 1000) {
      this.queryTimestamps = this.queryTimestamps.slice(-1000);
    }

    // Track session queries
    const session = this.userSessions.get(this.currentSessionId) || {
      queries: [],
      selections: [],
    };
    session.queries.push(normalizedQuery);
    this.userSessions.set(this.currentSessionId, session);
  }

  static trackSearchSelection(
    query: string,
    selectedItem: SearchableItem
  ): void {
    const session = this.userSessions.get(this.currentSessionId) || {
      queries: [],
      selections: [],
    };
    session.selections.push(selectedItem.id);
    this.userSessions.set(this.currentSessionId, session);
  }

  static getPopularQueries(
    limit = 10
  ): Array<{ query: string; count: number }> {
    return Array.from(this.searchQueries.entries())
      .map(([query, count]) => ({ query, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  static getFailedQueries(limit = 10): Array<{ query: string; count: number }> {
    return Array.from(this.failedQueries.entries())
      .map(([query, count]) => ({ query, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  static getTrendingQueries(
    hoursBack = 24
  ): Array<{ query: string; count: number }> {
    const cutoff = Date.now() - hoursBack * 60 * 60 * 1000;
    const recentQueries = this.queryTimestamps.filter(
      (q) => q.timestamp > cutoff
    );

    const trendingCounts = new Map<string, number>();
    recentQueries.forEach((q) => {
      const count = trendingCounts.get(q.query) || 0;
      trendingCounts.set(q.query, count + 1);
    });

    return Array.from(trendingCounts.entries())
      .map(([query, count]) => ({ query, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  static getSearchSuggestions(currentQuery = ""): string[] {
    const suggestions = new Set<string>();

    // Add popular queries that match current input
    const popular = this.getPopularQueries(20);
    popular.forEach((p) => {
      if (!currentQuery || p.query.includes(currentQuery.toLowerCase())) {
        suggestions.add(p.query);
      }
    });

    // Add trending queries
    const trending = this.getTrendingQueries(48);
    trending.forEach((t) => {
      if (!currentQuery || t.query.includes(currentQuery.toLowerCase())) {
        suggestions.add(t.query);
      }
    });

    // Add category-based suggestions
    const categoryQueries = [
      "sorting algorithms",
      "graph algorithms",
      "search algorithms",
      "dynamic programming",
      "greedy algorithms",
      "divide and conquer",
      "tree traversal",
      "shortest path",
      "minimum spanning tree",
    ];

    categoryQueries.forEach((cat) => {
      if (!currentQuery || cat.includes(currentQuery.toLowerCase())) {
        suggestions.add(cat);
      }
    });

    return Array.from(suggestions).slice(0, 8);
  }

  static getSearchInsights() {
    const totalQueries = Array.from(this.searchQueries.values()).reduce(
      (sum, count) => sum + count,
      0
    );
    const totalFailed = Array.from(this.failedQueries.values()).reduce(
      (sum, count) => sum + count,
      0
    );
    const successRate =
      totalQueries > 0
        ? ((totalQueries - totalFailed) / totalQueries) * 100
        : 100;

    return {
      totalQueries,
      totalFailed,
      successRate: Math.round(successRate * 100) / 100,
      uniqueQueries: this.searchQueries.size,
      mostPopular: this.getPopularQueries(5),
      mostFailed: this.getFailedQueries(5),
      trending: this.getTrendingQueries(24),
    };
  }

  static newSession(): string {
    this.currentSessionId = this.generateSessionId();
    return this.currentSessionId;
  }
}
class SearchContext {
  private static searchHistory: string[] = [];
  private static algorithmPreferences: Map<string, number> = new Map();
  private static categoryPreferences: Map<string, number> = new Map();
  private static searchCache: Map<string, SearchResult<SearchableItem>[]> =
    new Map();
  private static maxCacheSize = 100;
  private static cacheHitCount = 0;
  private static cacheMissCount = 0;

  static addSearch(query: string, selectedResult?: SearchableItem): void {
    this.searchHistory.unshift(query.toLowerCase());
    if (this.searchHistory.length > 50) {
      this.searchHistory.pop();
    }

    if (selectedResult) {
      const currentCount =
        this.algorithmPreferences.get(selectedResult.id) || 0;
      this.algorithmPreferences.set(selectedResult.id, currentCount + 1);

      if (selectedResult.category) {
        const categoryCount =
          this.categoryPreferences.get(selectedResult.category) || 0;
        this.categoryPreferences.set(
          selectedResult.category,
          categoryCount + 1
        );
      }
    }
  }

  static getContextualBoost(item: SearchableItem, query: string): number {
    let boost = 0;

    // Boost based on algorithm usage frequency
    const algorithmUsage = this.algorithmPreferences.get(item.id) || 0;
    boost += Math.min(algorithmUsage * 0.1, 0.3);

    // Boost based on category preferences
    if (item.category) {
      const categoryUsage = this.categoryPreferences.get(item.category) || 0;
      boost += Math.min(categoryUsage * 0.05, 0.2);
    }

    // Boost based on search history patterns
    const relatedSearches = this.searchHistory.filter(
      (hist) =>
        hist.includes(query.toLowerCase()) || query.toLowerCase().includes(hist)
    );
    boost += Math.min(relatedSearches.length * 0.02, 0.1);

    return boost;
  }

  static getSearchSuggestions(): string[] {
    const recentSearches = this.searchHistory.slice(0, 10);
    const popularCategories = Array.from(this.categoryPreferences.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([category]) => category);

    return [...recentSearches, ...popularCategories];
  }

  static cacheSearchResults(
    query: string,
    results: SearchResult<SearchableItem>[]
  ): void {
    const normalizedQuery = query.toLowerCase().trim();

    // Don't cache very short queries or empty results
    if (normalizedQuery.length < 2 || results.length === 0) {
      return;
    }

    // Clear cache if it gets too large
    if (this.searchCache.size >= this.maxCacheSize) {
      const keysToDelete = Array.from(this.searchCache.keys()).slice(0, 20);
      keysToDelete.forEach((key) => this.searchCache.delete(key));
    }

    this.searchCache.set(normalizedQuery, [...results]);
  }

  static getCachedResults(
    query: string
  ): SearchResult<SearchableItem>[] | null {
    const normalizedQuery = query.toLowerCase().trim();
    const cached = this.searchCache.get(normalizedQuery);

    if (cached) {
      this.cacheHitCount++;
      return [...cached]; // Return a copy to prevent mutation
    }

    this.cacheMissCount++;
    return null;
  }

  static getCacheStats(): { hits: number; misses: number; ratio: number } {
    const total = this.cacheHitCount + this.cacheMissCount;
    return {
      hits: this.cacheHitCount,
      misses: this.cacheMissCount,
      ratio: total > 0 ? this.cacheHitCount / total : 0,
    };
  }

  static clearCache(): void {
    this.searchCache.clear();
  }
}

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
/**
 * Technical term and jargon mappings to algorithm concepts
 */
const JARGON_MAPPINGS: Record<string, string[]> = {
  // Performance related
  fast: [
    "quick",
    "merge",
    "heap",
    "radix",
    "binary",
    "hash",
    "logarithmic",
    "efficient",
  ],
  slow: [
    "bubble",
    "selection",
    "insertion",
    "linear",
    "sequential",
    "brute force",
  ],
  efficient: [
    "binary",
    "quick",
    "merge",
    "heap",
    "hash",
    "optimal",
    "logarithmic",
  ],
  inefficient: ["bubble", "selection", "linear", "brute force", "exponential"],
  optimal: ["binary", "merge", "dijkstra", "a star", "efficient"],

  // Stability and properties
  stable: ["merge", "bubble", "insertion", "counting", "preserves order"],
  unstable: ["quick", "heap", "selection", "does not preserve"],

  // Space complexity
  inplace: [
    "quick",
    "heap",
    "bubble",
    "selection",
    "insertion",
    "constant space",
  ],
  extra: ["merge", "counting", "radix", "requires additional"],
  memory: ["merge", "counting", "radix", "space complexity"],
  "constant space": ["inplace", "no extra memory", "o(1) space"],

  // Algorithm paradigms
  divide: ["quick", "merge", "binary", "divide and conquer"],
  conquer: ["quick", "merge", "binary", "divide and conquer"],
  recursive: ["merge", "quick", "binary", "dfs", "fibonacci", "self calling"],
  iterative: ["bubble", "selection", "insertion", "bfs", "loops"],
  greedy: ["dijkstra", "prim", "kruskal", "huffman", "local optimal"],
  dynamic: [
    "longest common subsequence",
    "knapsack",
    "fibonacci",
    "memoization",
  ],
  backtrack: ["n queens", "sudoku", "maze", "trial and error"],

  // Search related
  "breadth first": ["bfs", "level order", "queue based", "layer by layer"],
  "depth first": ["dfs", "stack based", "go deep", "recursive"],
  "best first": ["a star", "dijkstra", "heuristic", "priority"],
  "binary search": ["logarithmic", "sorted array", "divide and conquer"],

  // Graph algorithms
  "shortest path": ["dijkstra", "bellman ford", "floyd warshall", "a star"],
  "minimum spanning tree": ["prim", "kruskal", "mst", "connects all"],
  "strongly connected": ["tarjan", "kosaraju", "scc", "bidirectional"],
  "topological sort": ["dfs", "bfs", "dependency", "ordering"],
  cycle: ["floyd", "dfs", "union find", "loop detection"],

  // Tree algorithms
  balanced: ["avl", "red black", "height balanced", "logarithmic"],
  "binary tree": ["bst", "traversal", "inorder", "preorder", "postorder"],
  traversal: ["inorder", "preorder", "postorder", "level order", "dfs", "bfs"],

  // Complexity terms
  "time complexity": ["big o", "runtime", "performance", "efficiency"],
  "space complexity": ["memory", "storage", "auxiliary space"],
  "constant time": ["o(1)", "immediate", "fixed time"],
  "linear time": ["o(n)", "proportional", "sequential"],
  logarithmic: ["o(log n)", "binary search", "tree height"],
  quadratic: ["o(n²)", "nested loops", "bubble sort"],
  exponential: ["o(2^n)", "brute force", "very slow"],

  // Data structures
  array: ["list", "vector", "sequence", "indexed"],
  "linked list": ["nodes", "pointers", "dynamic", "sequential access"],
  stack: ["lifo", "last in first out", "push", "pop"],
  queue: ["fifo", "first in first out", "enqueue", "dequeue"],
  heap: ["priority queue", "binary heap", "max heap", "min heap"],
  "hash table": ["dictionary", "map", "key value", "constant lookup"],
  tree: ["hierarchy", "nodes", "edges", "root", "leaf"],
  graph: ["vertices", "edges", "network", "connections"],

  // Algorithm approach
  sequential: ["linear", "brute force"],
  binary: ["binary search", "binary tree"],
  hash: ["hash table", "hash map"],

  // Sorting specific
  comparison: ["bubble", "selection", "insertion", "merge", "quick", "heap"],
  "non-comparison": ["counting", "radix", "bucket"],
  adaptive: ["insertion", "bubble"],

  // Problem types
  optimization: ["dijkstra", "dynamic programming", "greedy"],
  search: ["linear", "binary", "dfs", "bfs"],
  sort: ["bubble", "selection", "insertion", "merge", "quick", "heap"],
  matrix: ["floyd", "matrix multiplication"],
  string: ["pattern matching", "edit distance", "longest common subsequence"],
};

/**
 * Enhanced word-order flexible matching
 * Matches queries like "search linear" to "Linear Search"
 */
function calculateFlexibleScore(query: string, item: SearchableItem): number {
  const queryWords = query.toLowerCase().trim().split(/\s+/);
  const titleWords = item.title.toLowerCase().split(/\s+/);
  const categoryWords = (item.category?.toLowerCase() || "").split(/\s+/);
  const summaryWords = (item.summary?.toLowerCase() || "").split(/\s+/);
  const allItemWords = [...titleWords, ...categoryWords, ...summaryWords];

  if (queryWords.length === 1) return 0; // Skip single words for this function

  let matchedWords = 0;
  let titleMatches = 0;
  let exactMatches = 0;

  for (const queryWord of queryWords) {
    // Skip very short words (articles, prepositions)
    if (queryWord.length <= 2) continue;

    // Check exact word matches in title (highest priority)
    const titleExactMatch = titleWords.some((word) => word === queryWord);
    const titlePartialMatch = titleWords.some(
      (word) => word.includes(queryWord) && word.length > queryWord.length
    );

    if (titleExactMatch) {
      titleMatches++;
      matchedWords++;
      exactMatches++;
    } else if (titlePartialMatch) {
      titleMatches++;
      matchedWords++;
    }
    // Check matches in other fields
    else if (allItemWords.some((word) => word.includes(queryWord))) {
      matchedWords++;
    }
  }

  if (matchedWords === 0) return 0;

  const meaningfulWords = queryWords.filter((word) => word.length > 2).length;
  if (meaningfulWords === 0) return 0;

  // Calculate score based on word match ratio and title preference
  const wordMatchRatio = matchedWords / meaningfulWords;
  const titleMatchRatio = titleMatches / meaningfulWords;
  const exactMatchRatio = exactMatches / meaningfulWords;

  // Higher score for exact matches and title matches
  return wordMatchRatio * 0.5 + titleMatchRatio * 0.3 + exactMatchRatio * 0.2;
}

/**
 * Jargon-aware search that suggests related algorithms for technical terms
 */
function calculateJargonScore(query: string, item: SearchableItem): number {
  const lowerQuery = query.toLowerCase().trim();
  const lowerTitle = item.title.toLowerCase();
  const lowerCategory = item.category?.toLowerCase() || "";
  const lowerSummary = item.summary?.toLowerCase() || "";

  let score = 0;

  // Check if query matches any jargon terms
  for (const [jargon, relatedTerms] of Object.entries(JARGON_MAPPINGS)) {
    if (lowerQuery.includes(jargon)) {
      // Check if item contains any related terms
      for (const term of relatedTerms) {
        if (
          lowerTitle.includes(term) ||
          lowerCategory.includes(term) ||
          lowerSummary.includes(term)
        ) {
          score += 0.4; // Moderate score for jargon matches
          break; // Only count first match per jargon term
        }
      }
    }
  }

  return Math.min(score, 0.8); // Cap jargon score
}

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
      // Check flexible word order matching (e.g., "search linear" -> "Linear Search")
      const flexibleScore = calculateFlexibleScore(query, item);
      if (flexibleScore > 0) {
        score += flexibleScore;
      } else {
        // Check jargon/technical term matching
        const jargonScore = calculateJargonScore(query, item);
        if (jargonScore > 0) {
          score += jargonScore;
        } else if (titleSimilarity < 0.3) {
          // Early exit for very low similarity and no flexible/jargon matches
          return 0;
        }
      }
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
 * Abbreviation and acronym matching
 */
function calculateAbbreviationScore(
  query: string,
  item: SearchableItem
): number {
  const lowerQuery = query.toLowerCase().trim();
  let score = 0;

  // Check if query is a known abbreviation
  const expandedTerms = ABBREVIATION_MAPPINGS[lowerQuery] || [];
  for (const term of expandedTerms) {
    if (
      item.title.toLowerCase().includes(term) ||
      item.summary?.toLowerCase().includes(term) ||
      item.category?.toLowerCase().includes(term)
    ) {
      score += 0.6;
      break;
    }
  }

  // Check if any item text contains abbreviations that match the query
  const itemText =
    `${item.title} ${item.summary || ""} ${item.category || ""}`.toLowerCase();
  for (const [abbrev, expansions] of Object.entries(ABBREVIATION_MAPPINGS)) {
    if (
      itemText.includes(abbrev) &&
      expansions.some((exp) => lowerQuery.includes(exp))
    ) {
      score += 0.5;
      break;
    }
  }

  return Math.min(score, 0.8);
}

/**
 * Synonym-aware search
 */
function calculateSynonymScore(query: string, item: SearchableItem): number {
  const queryWords = query.toLowerCase().split(/\s+/);
  const itemText =
    `${item.title} ${item.summary || ""} ${item.category || ""}`.toLowerCase();
  let score = 0;

  for (const word of queryWords) {
    const synonyms = SYNONYM_MAPPINGS[word] || [];
    for (const synonym of synonyms) {
      if (itemText.includes(synonym)) {
        score += 0.3;
        break;
      }
    }
  }

  return Math.min(score, 0.6);
}

/**
 * Phonetic matching using Soundex and Double Metaphone
 */
function calculatePhoneticScore(query: string, item: SearchableItem): number {
  const queryWords = query.toLowerCase().split(/\s+/);
  const titleWords = item.title.toLowerCase().split(/\s+/);
  let score = 0;

  for (const queryWord of queryWords) {
    if (queryWord.length < 3) continue; // Skip very short words

    const querySoundex = soundex(queryWord);
    const queryMetaphone = doubleMetaphone(queryWord);

    for (const titleWord of titleWords) {
      const titleSoundex = soundex(titleWord);
      const titleMetaphone = doubleMetaphone(titleWord);

      // Soundex match
      if (querySoundex === titleSoundex && querySoundex !== "") {
        score += 0.4;
      }

      // Double Metaphone match (primary or secondary)
      if (
        (queryMetaphone[0] === titleMetaphone[0] && queryMetaphone[0] !== "") ||
        (queryMetaphone[1] === titleMetaphone[1] && queryMetaphone[1] !== "")
      ) {
        score += 0.5;
      }
    }
  }

  return Math.min(score, 0.7);
}

/**
 * Semantic search using N-gram similarity and contextual understanding
 */
function calculateSemanticScore(query: string, item: SearchableItem): number {
  let score = 0;

  // N-gram similarity with title
  const titleNgramScore = ngramSimilarity(query, item.title, 2);
  score += titleNgramScore * 0.4;

  // N-gram similarity with summary
  if (item.summary) {
    const summaryNgramScore = ngramSimilarity(query, item.summary, 2);
    score += summaryNgramScore * 0.2;
  }

  // Contextual understanding - check for conceptual relationships
  const conceptWords = query.toLowerCase().split(/\s+/);
  const itemConcepts =
    `${item.title} ${item.summary || ""} ${item.tags?.join(" ") || ""}`.toLowerCase();

  // Look for conceptual relationships
  const conceptPairs = [
    ["sort", "order"],
    ["search", "find"],
    ["tree", "node"],
    ["graph", "vertex"],
    ["hash", "map"],
    ["queue", "stack"],
    ["recursive", "iteration"],
    ["optimal", "efficient"],
  ];

  for (const [concept1, concept2] of conceptPairs) {
    if (
      (conceptWords.some((w) => w.includes(concept1)) &&
        itemConcepts.includes(concept2)) ||
      (conceptWords.some((w) => w.includes(concept2)) &&
        itemConcepts.includes(concept1))
    ) {
      score += 0.2;
    }
  }

  return Math.min(score, 0.8);
}

/**
 * Contextual search based on user behavior and preferences
 */
function calculateContextualScore(query: string, item: SearchableItem): number {
  return SearchContext.getContextualBoost(item, query);
}

/**
 * Advanced multi-modal search combining all techniques
 */
function calculateAdvancedRelevanceScore(
  query: string,
  item: SearchableItem,
  options: SearchOptions
): number {
  // Start with base relevance score
  let score = calculateRelevanceScore(query, item);

  // Add advanced search scores if enabled
  if (options.enableAbbreviationSearch && score < 0.8) {
    const abbrevScore = calculateAbbreviationScore(query, item);
    if (abbrevScore > 0) {
      score = Math.max(score, abbrevScore);
    }
  }

  if (options.enableSynonymSearch && score < 0.7) {
    const synonymScore = calculateSynonymScore(query, item);
    score += synonymScore * 0.5; // Weight synonym matches less
  }

  if (options.enablePhoneticSearch && score < 0.6) {
    const phoneticScore = calculatePhoneticScore(query, item);
    if (phoneticScore > 0) {
      score = Math.max(score, phoneticScore * 0.8); // Slightly lower weight for phonetic
    }
  }

  if (options.enableSemanticSearch && score < 0.7) {
    const semanticScore = calculateSemanticScore(query, item);
    score += semanticScore * 0.6; // Medium weight for semantic matching
  }

  if (options.enableContextualSearch) {
    const contextualBoost = calculateContextualScore(query, item);
    score += contextualBoost; // Additive boost based on user behavior
  }

  return Math.min(score, 1.0);
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

  // Performance optimization: precompute query characteristics
  const isShortQuery = query.length <= 2;

  // Fast path for very short queries - only check title starts and exact matches
  if (isShortQuery) {
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

  // Performance optimization: batch process items for better cache utilization
  const batchSize = 50;
  const batches = [];
  for (let i = 0; i < items.length; i += batchSize) {
    batches.push(items.slice(i, i + batchSize));
  }

  // Process batches with early termination
  let processedItems = 0;
  for (const batch of batches) {
    for (const item of batch) {
      processedItems++;

      // Performance checkpoint - if we have enough high-quality results, can exit early
      if (results.length >= opts.maxResults * 2 && results.length > 10) {
        const highQualityResults = results.filter((r) => r.score >= 0.7).length;
        if (highQualityResults >= opts.maxResults) {
          break;
        }
      }

      const score = calculateAdvancedRelevanceScore(query, item, opts);

      if (score >= opts.minScore) {
        let resultType: SearchResult<T>["type"] = "fuzzy";
        let explanation = "";

        // Determine result type and explanation based on score and matching methods
        if (score >= 0.9) {
          resultType = "exact";
        } else if (score >= 0.6) {
          resultType = "partial";
        } else if (score >= 0.4) {
          resultType = "fuzzy";
          explanation = "Fuzzy match based on similarity";
        } else {
          resultType = "semantic";
          explanation =
            "Found through advanced matching (phonetic, semantic, or contextual)";
        }

        const result: SearchResult<T> = {
          item,
          score,
          type: resultType,
          explanation: explanation || undefined,
        };

        if (opts.highlightMatches) {
          result.highlightedTitle = highlightMatches(item.title, query);
          result.matches = [];

          // Find what matched (optimized - early exit when enough matches found)
          const lowerTitle = item.title.toLowerCase();
          const lowerCategory = item.category?.toLowerCase() || "";
          const lowerSummary = item.summary?.toLowerCase() || "";

          if (lowerTitle.includes(lowerQuery)) result.matches.push("title");
          if (lowerCategory.includes(lowerQuery))
            result.matches.push("category");
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

      // Throttling for very large datasets
      if (processedItems % 100 === 0) {
        // Allow other operations to run
        setTimeout(() => {}, 0);
      }
    }
  }

  // Sort by relevance score (stable sort for consistent results)
  results.sort((a, b) => {
    if (Math.abs(a.score - b.score) < 0.001) {
      // If scores are very close, prefer exact matches, then partial, then others
      const typeOrder = {
        exact: 0,
        partial: 1,
        fuzzy: 2,
        semantic: 3,
        suggested: 4,
        phonetic: 5,
        contextual: 6,
      };
      return typeOrder[a.type] - typeOrder[b.type];
    }
    return b.score - a.score;
  });

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

/**
 * Track search interaction for contextual learning
 */
export function trackSearchInteraction(
  query: string,
  selectedResult?: SearchableItem
): void {
  SearchContext.addSearch(query, selectedResult);
}

/**
 * Get search suggestions based on context and history
 */
export function getSearchSuggestions(): string[] {
  return SearchContext.getSearchSuggestions();
}

/**
 * Cache search results for performance optimization
 */
export function cacheSearchResults(
  query: string,
  results: SearchResult<SearchableItem>[]
): void {
  SearchContext.cacheSearchResults(query, results);
}

/**
 * Get cached search results
 */
export function getCachedSearchResults(
  query: string
): SearchResult<SearchableItem>[] | null {
  return SearchContext.getCachedResults(query);
}

/**
 * Get cache performance statistics
 */
export function getSearchCacheStats(): {
  hits: number;
  misses: number;
  ratio: number;
} {
  return SearchContext.getCacheStats();
}

/**
 * Clear search result cache
 */
export function clearSearchCache(): void {
  SearchContext.clearCache();
}

/**
 * Track search query for analytics
 */
export function trackSearchQuery(query: string, resultCount: number): void {
  SearchAnalytics.trackSearchQuery(query, resultCount);
}

/**
 * Track search result selection
 */
export function trackSearchSelection(
  query: string,
  selectedItem: SearchableItem
): void {
  SearchAnalytics.trackSearchSelection(query, selectedItem);
}

/**
 * Get popular search queries
 */
export function getPopularQueries(
  limit = 10
): Array<{ query: string; count: number }> {
  return SearchAnalytics.getPopularQueries(limit);
}

/**
 * Get trending search queries
 */
export function getTrendingQueries(
  hoursBack = 24
): Array<{ query: string; count: number }> {
  return SearchAnalytics.getTrendingQueries(hoursBack);
}

/**
 * Get enhanced search suggestions with analytics
 */
export function getEnhancedSearchSuggestions(currentQuery = ""): string[] {
  return SearchAnalytics.getSearchSuggestions(currentQuery);
}

/**
 * Get comprehensive search analytics
 */
export function getSearchAnalytics() {
  return SearchAnalytics.getSearchInsights();
}

/**
 * Advanced search with all features enabled
 */
export function superSearch<T extends SearchableItem>(
  query: string,
  items: T[],
  customOptions: Partial<SearchOptions> = {}
): SearchResult<T>[] {
  const options: SearchOptions = {
    ...defaultOptions,
    enableSemanticSearch: true,
    enablePhoneticSearch: true,
    enableContextualSearch: true,
    enableAbbreviationSearch: true,
    enableSynonymSearch: true,
    maxResults: 15,
    minScore: 0.05, // Lower threshold to catch more advanced matches
    ...customOptions,
  };

  return advancedSearch(query, items, options);
}

/**
 * Get explanation for why a search result was returned
 */
export function getSearchResultExplanation(
  result: SearchResult<SearchableItem>
): string {
  if (result.explanation) return result.explanation;

  switch (result.type) {
    case "exact":
      return "Exact match found in title or content";
    case "partial":
      return "Partial match found";
    case "fuzzy":
      return "Similar match found using fuzzy matching";
    case "semantic":
      return "Found through advanced semantic analysis";
    case "phonetic":
      return "Found through phonetic matching (sounds similar)";
    case "contextual":
      return "Suggested based on your search history and preferences";
    default:
      return "Match found";
  }
}

/**
 * Smart search that automatically adjusts search strategy based on query
 */
export function smartSearch<T extends SearchableItem>(
  query: string,
  items: T[],
  options: Partial<SearchOptions> = {}
): SearchResult<T>[] {
  const queryLength = query.trim().length;
  const hasNumbers = /\d/.test(query);
  const hasSpecialChars = /[^a-zA-Z0-9\s]/.test(query);
  const isAcronym = query.length <= 5 && query === query.toUpperCase();

  // Adjust search strategy based on query characteristics
  const smartOptions: SearchOptions = {
    ...defaultOptions,
    ...options,
  };

  if (queryLength <= 3) {
    // For very short queries, prefer exact matches
    smartOptions.fuzzyThreshold = 0.9;
    smartOptions.enableSemanticSearch = false;
    smartOptions.enablePhoneticSearch = false;
  } else if (isAcronym) {
    // For acronyms, enable abbreviation search
    smartOptions.enableAbbreviationSearch = true;
    smartOptions.enablePhoneticSearch = false;
  } else if (hasNumbers || hasSpecialChars) {
    // For technical queries, enable all advanced features
    smartOptions.enableSemanticSearch = true;
    smartOptions.enableAbbreviationSearch = true;
    smartOptions.enableSynonymSearch = false; // Less useful for technical terms
  } else {
    // For natural language queries, enable semantic and synonym search
    smartOptions.enableSemanticSearch = true;
    smartOptions.enableSynonymSearch = true;
    smartOptions.enablePhoneticSearch = true;
  }

  return advancedSearch(query, items, smartOptions);
}
