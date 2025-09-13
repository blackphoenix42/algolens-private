import type { AlgoMeta } from "@/types/algorithms";

// Lazy load algorithm catalogs to reduce initial bundle size
const lazyImports = {
  sorting: () =>
    import("@/algorithms/sorting/algos").then((m) => m.sortingAlgos),
  searching: () =>
    import("@/algorithms/searching/algos").then((m) => m.searchingAlgos),
  graphs: () => import("@/algorithms/graphs/algos").then((m) => m.graphAlgos),
  arrays: () => import("@/algorithms/arrays/algos").then((m) => m.arrayAlgos),
};

// Cache for loaded catalogs
const catalogCache = new Map<string, AlgoMeta[]>();

// Get all available topics (synchronous for HomePage)
export const TOPICS = Object.keys(lazyImports);

// Initialize with empty catalog for initial render - will be populated by loadAllTopics
export const CATALOG: Record<string, AlgoMeta[]> = {};

// Load a specific topic's algorithms
export async function loadTopic(topic: string): Promise<AlgoMeta[]> {
  if (catalogCache.has(topic)) {
    return catalogCache.get(topic)!;
  }

  const loader = lazyImports[topic as keyof typeof lazyImports];
  if (!loader) {
    return [];
  }

  try {
    const algos = await loader();
    catalogCache.set(topic, algos);
    CATALOG[topic] = algos; // Update the global catalog
    return algos;
  } catch (error) {
    console.error(`Failed to load ${topic} algorithms:`, error);
    return [];
  }
}

// Load all topics (for HomePage initial render)
export async function loadAllTopics(): Promise<Record<string, AlgoMeta[]>> {
  const results = await Promise.allSettled(
    TOPICS.map(async (topic) => {
      const algos = await loadTopic(topic);
      return { topic, algos };
    })
  );

  const catalog: Record<string, AlgoMeta[]> = {};
  results.forEach((result, index) => {
    if (result.status === "fulfilled") {
      catalog[result.value.topic] = result.value.algos;
    } else {
      catalog[TOPICS[index]] = [];
    }
  });

  // Update global catalog
  Object.assign(CATALOG, catalog);
  return catalog;
}

export async function findAlgo(
  topic: string,
  slug: string
): Promise<AlgoMeta | null> {
  // Ensure topic is loaded
  const algos = await loadTopic(topic);
  return algos.find((a) => a.slug === slug) ?? null;
}
