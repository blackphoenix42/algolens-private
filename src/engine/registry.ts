import { arrayAlgos } from "@/algorithms/arrays/algos";
import { graphAlgos } from "@/algorithms/graphs/algos";
import { searchingAlgos } from "@/algorithms/searching/algos";
import { sortingAlgos } from "@/algorithms/sorting/algos";
import type { AlgoMeta } from "@/types/algorithms";

export const CATALOG: Record<string, AlgoMeta[]> = {
  sorting: sortingAlgos,
  searching: searchingAlgos,
  graphs: graphAlgos,
  arrays: arrayAlgos,
};

export function findAlgo(topic: string, slug: string): AlgoMeta | null {
  const group = (CATALOG as Record<string, AlgoMeta[] | undefined>)[topic];
  return group?.find((a) => a.slug === slug) ?? null;
}
