// Function to get relevant tags for algorithms based on their title/slug
export function getRelevantTags(
  slug: string,
  title: string,
  topic: string
): string[] {
  const slugLower = slug.toLowerCase();
  const titleLower = title.toLowerCase();
  const topicLower = topic.toLowerCase();

  const tagMap: Record<string, string[]> = {
    // Sorting algorithms
    "bubble-sort": ["comparison", "in-place", "stable", "quadratic"],
    "quick-sort": ["divide-conquer", "in-place", "unstable", "fast"],
    "merge-sort": ["divide-conquer", "stable", "out-place", "optimal"],
    "heap-sort": ["heap", "in-place", "unstable", "optimal"],
    "insertion-sort": ["comparison", "in-place", "stable", "adaptive"],
    "selection-sort": ["comparison", "in-place", "unstable", "simple"],
    "counting-sort": ["non-comparison", "stable", "linear", "integer"],
    "radix-sort": ["non-comparison", "stable", "linear", "digit"],
    "bucket-sort": ["non-comparison", "stable", "average-linear"],

    // Searching algorithms
    "linear-search": ["brute-force", "simple", "unsorted", "sequential"],
    "binary-search": ["divide-conquer", "sorted", "logarithmic", "efficient"],
    "exponential-search": ["divide-conquer", "sorted", "unbounded"],
    "interpolation-search": ["divide-conquer", "sorted", "uniform"],
    "jump-search": ["sorted", "block-search", "optimal-jump"],
    "fibonacci-search": ["divide-conquer", "sorted", "fibonacci"],

    // Graph algorithms
    dfs: ["traversal", "recursive", "stack", "backtrack"],
    bfs: ["traversal", "queue", "level-order", "shortest"],
    dijkstra: ["shortest-path", "weighted", "greedy", "single-source"],
    "bellman-ford": ["shortest-path", "negative-weights", "dynamic"],
    "floyd-warshall": ["all-pairs", "shortest-path", "dynamic"],
    kruskal: ["minimum-spanning", "greedy", "union-find", "edge-based"],
    prim: ["minimum-spanning", "greedy", "vertex-based", "priority-queue"],
    "topological-sort": ["dag", "ordering", "dfs", "kahn"],
    tarjan: ["strongly-connected", "dfs", "stack", "components"],
    kosaraju: ["strongly-connected", "dfs", "transpose"],

    // Tree algorithms
    "binary-search-tree": ["balanced", "ordered", "logarithmic", "recursive"],
    "avl-tree": ["self-balancing", "rotations", "height-balanced"],
    "red-black-tree": ["self-balancing", "color-property", "insert-delete"],
    "b-tree": ["multi-way", "disk-based", "balanced", "database"],
    trie: ["prefix-tree", "string", "autocomplete", "dictionary"],
    "segment-tree": ["range-queries", "update", "binary-tree", "divide"],
    "fenwick-tree": ["binary-indexed", "range-sum", "update", "efficient"],

    // Dynamic Programming
    fibonacci: ["memoization", "overlapping", "optimal-substructure"],
    knapsack: ["optimization", "dp", "subset", "weight-value"],
    lcs: ["sequence", "dp", "table", "backtrack"],
    "edit-distance": ["string", "dp", "levenshtein", "transformation"],
    "coin-change": ["denomination", "dp", "minimum", "greedy"],
    "matrix-chain": ["parenthesization", "dp", "multiplication", "cost"],

    // Array algorithms
    kadane: ["subarray", "maximum-sum", "linear", "dynamic"],
    "dutch-flag": ["three-way", "partition", "in-place", "colors"],
    "two-pointer": ["linear", "space-efficient", "sorted", "pair"],
    "sliding-window": ["subarray", "range", "efficient", "continuous"],

    // String algorithms
    kmp: ["pattern-matching", "failure-function", "linear", "preprocessing"],
    "rabin-karp": ["pattern-matching", "hashing", "rolling", "multiple"],
    "boyer-moore": ["pattern-matching", "skip", "backward", "efficient"],
    "z-algorithm": ["pattern-matching", "preprocessing", "linear", "z-array"],

    // Geometric algorithms
    "convex-hull": ["computational-geometry", "points", "jarvis", "graham"],
    "line-intersection": ["computational-geometry", "segments", "slope"],
    "closest-pair": ["computational-geometry", "divide-conquer", "distance"],

    // Number theory
    euclidean: ["gcd", "recursive", "number-theory", "ancient"],
    sieve: ["prime-numbers", "factorization", "array", "marking"],
    "modular-exponentiation": ["power", "modular", "fast", "binary"],
  };

  // Get specific tags for the algorithm
  let tags = tagMap[slugLower] || [];

  // Add general tags based on topic
  const topicTags: Record<string, string[]> = {
    sorting: ["sorting", "comparison"],
    searching: ["searching", "lookup"],
    graphs: ["graph-theory", "vertices", "edges"],
    trees: ["tree-structure", "hierarchical"],
    "linked-lists": ["pointer", "dynamic"],
    arrays: ["indexing", "contiguous"],
    dp: ["dynamic-programming", "optimization"],
    geometry: ["computational-geometry", "coordinates"],
    strings: ["text-processing", "characters"],
    heaps: ["priority-queue", "complete-tree"],
    "union-find": ["disjoint-sets", "forest"],
  };

  if (topicTags[topicLower]) {
    tags = [...tags, ...topicTags[topicLower]];
  }

  // Add algorithm-specific tags based on common patterns
  if (titleLower.includes("binary")) tags.push("binary");
  if (titleLower.includes("linear")) tags.push("linear");
  if (titleLower.includes("hash")) tags.push("hashing");
  if (titleLower.includes("tree")) tags.push("tree");
  if (titleLower.includes("graph")) tags.push("graph");
  if (titleLower.includes("sort")) tags.push("sorting");
  if (titleLower.includes("search")) tags.push("searching");

  // Remove duplicates and return first 4 most relevant tags
  return [...new Set(tags)].slice(0, 4);
}

// Function to get all tags for an algorithm (original + generated)
export function getAllAlgorithmTags(
  item: { tags?: string[]; slug: string; title: string },
  topic: string
): string[] {
  const originalTags = item.tags || [];
  const generatedTags = getRelevantTags(item.slug, item.title, topic);

  // Combine and deduplicate
  return [...new Set([...originalTags, ...generatedTags])];
}
