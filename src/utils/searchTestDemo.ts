// Enhanced Search Test Example
// This file demonstrates the enhanced search capabilities

import type { AlgoMeta } from "@/types/algorithms";
import {
  advancedSearch,
  createSearchableFromAlgoMeta,
  getDidYouMeanSuggestions,
} from "@/utils/searchUtils";

// Example algorithm data (simplified)
const exampleAlgorithms = [
  {
    slug: "bubble-sort",
    title: "Bubble Sort",
    topic: "sorting",
    summary:
      "A simple sorting algorithm that repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.",
    about:
      "Bubble sort is a simple sorting algorithm that works by repeatedly swapping adjacent elements if they are in wrong order.",
    pros: [
      "Simple to understand and implement",
      "Stable sorting algorithm",
      "In-place sorting",
    ],
    cons: ["Poor time complexity O(n²)", "Not suitable for large datasets"],
    complexity: {
      time: { best: "O(n)", average: "O(n²)", worst: "O(n²)" },
      space: "O(1)",
      stable: true,
      inPlace: true,
    },
    pseudocode: [
      "for i = 0 to n-2",
      "  for j = 0 to n-i-2",
      "    if arr[j] > arr[j+1]",
      "      swap arr[j] and arr[j+1]",
    ],
    code: {},
    load: () => Promise.resolve({ run: () => {} }),
  },
  {
    slug: "quick-sort",
    title: "Quick Sort",
    topic: "sorting",
    summary:
      "An efficient, divide-and-conquer sorting algorithm that works by selecting a pivot element and partitioning the array.",
    about:
      "Quick sort is a divide-and-conquer algorithm that sorts by selecting a pivot and partitioning.",
    pros: [
      "Fast average case O(n log n)",
      "In-place sorting",
      "Cache efficient",
    ],
    cons: [
      "Worst case O(n²)",
      "Not stable",
      "Poor performance on already sorted data",
    ],
    complexity: {
      time: { best: "O(n log n)", average: "O(n log n)", worst: "O(n²)" },
      space: "O(log n)",
      stable: false,
      inPlace: true,
    },
    pseudocode: [
      "quicksort(arr, low, high)",
      "  if low < high",
      "    pi = partition(arr, low, high)",
      "    quicksort(arr, low, pi-1)",
      "    quicksort(arr, pi+1, high)",
    ],
    code: {},
    load: () => Promise.resolve({ run: () => {} }),
  },
  {
    slug: "binary-search",
    title: "Binary Search",
    topic: "searching",
    summary:
      "An efficient searching algorithm that works on sorted arrays by repeatedly dividing the search interval in half.",
    about:
      "Binary search is a search algorithm that finds the position of a target value within a sorted array.",
    pros: ["Very fast O(log n)", "Simple to implement", "Memory efficient"],
    cons: ["Requires sorted data", "Not suitable for linked lists"],
    complexity: {
      time: { best: "O(1)", average: "O(log n)", worst: "O(log n)" },
      space: "O(1)",
      stable: true,
      inPlace: false,
    },
    pseudocode: [
      "left = 0, right = n-1",
      "while left <= right",
      "  mid = (left + right) / 2",
      "  if arr[mid] == target",
      "    return mid",
    ],
    code: {},
    load: () => Promise.resolve({ run: () => {} }),
  },
];

// Test the search functionality
export function testEnhancedSearch() {
  console.log("🔍 Testing Enhanced Search Features");
  console.log("=====================================\n");

  // Convert to searchable items
  const searchableItems = createSearchableFromAlgoMeta(
    exampleAlgorithms as unknown as AlgoMeta[]
  );

  // Test 1: Exact match
  console.log("1. Exact Match Test:");
  const exactResults = advancedSearch("Binary Search", searchableItems);
  console.log('Query: "Binary Search"');
  console.log(
    "Results:",
    exactResults.map((r) => ({
      title: r.item.title,
      score: r.score,
      type: r.type,
    }))
  );
  console.log("");

  // Test 2: Partial match
  console.log("2. Partial Match Test:");
  const partialResults = advancedSearch("sort", searchableItems);
  console.log('Query: "sort"');
  console.log(
    "Results:",
    partialResults.map((r) => ({
      title: r.item.title,
      score: r.score,
      type: r.type,
    }))
  );
  console.log("");

  // Test 3: Fuzzy search
  console.log("3. Fuzzy Search Test:");
  const fuzzyResults = advancedSearch("bubbel", searchableItems); // Typo: "bubbel" instead of "bubble"
  console.log('Query: "bubbel" (typo)');
  console.log(
    "Results:",
    fuzzyResults.map((r) => ({
      title: r.item.title,
      score: r.score,
      type: r.type,
    }))
  );
  console.log("");

  // Test 4: "Did you mean?" suggestions
  console.log('4. "Did You Mean?" Test:');
  const suggestions = getDidYouMeanSuggestions("quik", searchableItems); // Typo: "quik" instead of "quick"
  console.log('Query: "quik" (typo)');
  console.log("Suggestions:", suggestions);
  console.log("");

  // Test 5: Category-based search
  console.log("5. Category Search Test:");
  const categoryResults = advancedSearch("searching", searchableItems);
  console.log('Query: "searching"');
  console.log(
    "Results:",
    categoryResults.map((r) => ({
      title: r.item.title,
      category: r.item.category,
      score: r.score,
    }))
  );
  console.log("");

  // Test 6: Complex search with pros/cons
  console.log("6. Complex Search Test (searching in pros/cons):");
  const complexResults = advancedSearch("fast", searchableItems);
  console.log('Query: "fast"');
  console.log(
    "Results:",
    complexResults.map((r) => ({
      title: r.item.title,
      score: r.score,
      matches: r.matches,
    }))
  );
  console.log("");

  console.log("✅ All tests completed!");
}

// Example usage for demonstration
export const SEARCH_EXAMPLES = {
  exact: "Binary Search",
  partial: "sort",
  fuzzy: "bubbel", // typo
  typoSuggestion: "quik", // typo
  category: "searching",
  complex: "fast",
  empty: "xyz123", // no results
};

export const SEARCH_FEATURES = [
  "🎯 Exact match scoring with highest relevance",
  "🔄 Fuzzy matching for typos and variations",
  '💡 "Did you mean?" suggestions for corrections',
  "🏷️ Category-based search and filtering",
  "🔍 Multi-field search (title, summary, tags, pros/cons)",
  "⚡ Relevance-based ranking with smart scoring",
  "🎨 Highlighted search terms in results",
  "📊 Search result metadata (score, type, matches)",
  "🚫 Empty state handling with suggestions",
  "⌨️ Full keyboard navigation support",
];

export default {
  testEnhancedSearch,
  SEARCH_EXAMPLES,
  SEARCH_FEATURES,
};
