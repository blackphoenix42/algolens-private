import React, { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/Button";
import { SearchInput } from "@/components/ui/SearchInput";
import { useI18n } from "@/i18n";
import type { AlgoMeta } from "@/types/algorithms";
import { cn, createSearchableFromAlgoMeta } from "@/utils";
import {
  getFilterTermSuggestions,
  getSearchableFilterTerms,
} from "@/utils/searchFilters";

export type SortKey =
  | "relevance"
  | "title"
  | "difficulty"
  | "recent"
  | "popularity";

export type AlgorithmType =
  | "sorting"
  | "searching"
  | "graph"
  | "tree"
  | "dynamic-programming"
  | "greedy"
  | "backtracking"
  | "divide-conquer";

export type ComplexityLevel =
  | "constant"
  | "logarithmic"
  | "linear"
  | "linearithmic"
  | "quadratic"
  | "cubic"
  | "exponential";

export type DataStructureType =
  | "array"
  | "linked-list"
  | "stack"
  | "queue"
  | "tree"
  | "graph"
  | "hash-table"
  | "heap";

type Props = {
  q: string;
  setQ: (v: string) => void;
  categories: string[];
  selectedCategories: string[];
  setSelectedCategories: (v: string[]) => void;
  tags: string[];
  selectedTags: string[];
  setSelectedTags: (v: string[]) => void;
  difficulties: string[];
  selectedDifficulties: string[];
  setSelectedDifficulties: (v: string[]) => void;
  sortKey: SortKey;
  setSortKey: (s: SortKey) => void;
  onClear: () => void;
  catalog: Record<string, AlgoMeta[]>; // Add catalog as a prop
  showTagsOnCards: boolean;
  setShowTagsOnCards: (show: boolean) => void;
  onTagClick: (tag: string) => void;
  // New filter type props
  selectedAlgorithmTypes: AlgorithmType[];
  setSelectedAlgorithmTypes: (v: AlgorithmType[]) => void;
  selectedComplexityLevels: ComplexityLevel[];
  setSelectedComplexityLevels: (v: ComplexityLevel[]) => void;
  selectedDataStructures: DataStructureType[];
  setSelectedDataStructures: (v: DataStructureType[]) => void;
};

export default function FilterBar(props: Props) {
  const { t } = useI18n();
  const {
    q,
    setQ,
    categories: _categories,
    selectedCategories: _selectedCategories,
    setSelectedCategories: _setSelectedCategories,
    tags: _tags,
    selectedTags: _selectedTags,
    setSelectedTags: _setSelectedTags,
    difficulties: _difficulties,
    selectedDifficulties: _selectedDifficulties,
    setSelectedDifficulties: _setSelectedDifficulties,
    sortKey,
    setSortKey,
    onClear,
    catalog,
    showTagsOnCards,
    setShowTagsOnCards,
    onTagClick: _onTagClick,
    selectedAlgorithmTypes,
    setSelectedAlgorithmTypes,
    selectedComplexityLevels,
    setSelectedComplexityLevels,
    selectedDataStructures,
    setSelectedDataStructures,
  } = props;

  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Create searchable algorithm data
  const allAlgorithms = useMemo(() => {
    const algorithms: AlgoMeta[] = [];
    Object.values(catalog).forEach((categoryAlgos) => {
      algorithms.push(...categoryAlgos);
    });
    return algorithms;
  }, [catalog]);

  const searchableItems = useMemo(() => {
    const algorithmItems = createSearchableFromAlgoMeta(allAlgorithms);

    // Add filter terms as searchable items with proper structure
    const filterTerms = getSearchableFilterTerms();
    const filterItems = filterTerms.map((term) => ({
      id: `filter-${term}`,
      title: term,
      category: "Filter Terms",
      tags: ["filter", "search", term],
      summary: `Filter by ${term}`,
      searchableText: `${term} filter complexity algorithm data structure search`,
    }));

    return [...algorithmItems, ...filterItems];
  }, [allAlgorithms]);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const _toggleIn = (arr: string[], v: string) =>
    arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];

  const toggleAlgorithmType = (type: AlgorithmType) => {
    setSelectedAlgorithmTypes(
      selectedAlgorithmTypes.includes(type)
        ? selectedAlgorithmTypes.filter((t) => t !== type)
        : [...selectedAlgorithmTypes, type]
    );
  };

  const toggleComplexityLevel = (level: ComplexityLevel) => {
    setSelectedComplexityLevels(
      selectedComplexityLevels.includes(level)
        ? selectedComplexityLevels.filter((l) => l !== level)
        : [...selectedComplexityLevels, level]
    );
  };

  const toggleDataStructure = (structure: DataStructureType) => {
    setSelectedDataStructures(
      selectedDataStructures.includes(structure)
        ? selectedDataStructures.filter((s) => s !== structure)
        : [...selectedDataStructures, structure]
    );
  };

  const hasActiveFilters =
    selectedAlgorithmTypes.length > 0 ||
    selectedComplexityLevels.length > 0 ||
    selectedDataStructures.length > 0 ||
    q.length > 0;

  const activeFilterCount = useMemo(() => {
    // Only count the filters that are actually shown in the current UI
    // We removed tags and difficulties from the FilterBar UI, so don't count them
    const count =
      selectedAlgorithmTypes.length +
      selectedComplexityLevels.length +
      selectedDataStructures.length +
      (q.length > 0 ? 1 : 0);

    // Temporary debug logging to understand the issue
    const totalCount =
      count + _selectedTags.length + _selectedDifficulties.length;
    if (totalCount > 10) {
      console.log("Filter count analysis:", {
        algorithmTypes: selectedAlgorithmTypes.length,
        complexityLevels: selectedComplexityLevels.length,
        dataStructures: selectedDataStructures.length,
        search: q.length > 0 ? 1 : 0,
        visibleCount: count,
        tags: _selectedTags.length,
        difficulties: _selectedDifficulties.length,
        totalWithHidden: totalCount,
        tagValues: _selectedTags.slice(0, 5), // Show first 5 tags
        difficultyValues: _selectedDifficulties.slice(0, 5), // Show first 5 difficulties
      });
    }

    return count;
  }, [
    selectedAlgorithmTypes,
    selectedComplexityLevels,
    selectedDataStructures,
    q,
    _selectedTags,
    _selectedDifficulties,
  ]);

  return (
    <div
      className={cn(
        "sticky top-0 z-40 mb-6 transition-all duration-300"
        // Background removed for clean appearance
      )}
      style={{ overflow: "visible", position: "sticky" }} // Ensure proper sticky behavior and overflow
    >
      {/* Main Search and Controls */}
      <div className="relative rounded-2xl border border-transparent p-4 md:p-6">
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center">
          {/* Search Input */}
          <div className="relative z-50 flex-1">
            <SearchInput
              value={q}
              onChange={setQ}
              placeholder={t("common.searchPlaceholder", {
                defaultValue:
                  "Search algorithms, complexity (O(1), O(log n)), data structures...",
              })}
              aria-label="Search algorithms by name, tags, concepts, or difficulty. Try searching for complexity like O(1) or constant time."
              // Performance optimization for fast typing
              debounceMs={20}
              // Enhanced search props
              searchableItems={searchableItems}
              // Add filter term suggestions
              suggestions={[
                // Filter terms for complexity
                ...getFilterTermSuggestions(q, 5),
                // Add popular and trending queries
                "comparison",
                "in-place",
                "stable",
                "logarithmic",
                "linear",
                "O(1)",
                "O(log n)",
                "O(n)",
                "constant time",
                "divide-conquer",
                "dynamic-programming",
                "greedy",
                "backtrack",
                "recursive",
                "iterative",
                "sorting algorithms",
                "searching algorithms",
                "graph algorithms",
                "tree algorithms",
                "optimization",
                "efficient algorithms",
                "time complexity",
                "space complexity",
                "fastest sorting",
                "shortest path",
                "minimum spanning tree",
              ]}
              showSuggestions={true}
              enableFuzzySearch={true}
              enableTypoCorrection={true}
              showCategories={true}
              maxDisplayedResults={8}
              // Enhanced UI features
              showResultPreviews={true}
              showSearchStats={false} // Keep false for cleaner UI in production
              _enableSearchHistory={true}
              showKeyboardHints={true}
              searchOptions={{
                fuzzyThreshold: 0.4,
                maxResults: 15,
                minScore: 0.05, // Lower threshold for advanced matches
                highlightMatches: true,
                enableSemanticSearch: true,
                enablePhoneticSearch: true,
                enableContextualSearch: true,
                enableAbbreviationSearch: true,
                enableSynonymSearch: true,
              }}
              className="w-full"
              autoFocus={!isMobile}
              data-testid="search-input"
              data-keyboard-shortcut="/"
            />
          </div>

          {/* Quick Actions */}
          <div className="flex flex-shrink-0 items-center gap-2">
            {/* Enhanced Filter Toggle */}
            <div className="group relative">
              <div className="absolute inset-0 -z-10 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 blur-sm transition-opacity duration-300 group-hover:opacity-100"></div>
              <Button
                variant={isExpanded ? "primary" : "outline"}
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className={cn(
                  "relative font-medium shadow-sm transition-all duration-300",
                  isExpanded
                    ? "scale-105 transform border-blue-500 bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                    : "hover:scale-102 hover:border-blue-400 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:border-blue-600 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20"
                )}
              >
                <svg
                  className={cn(
                    "mr-2 h-4 w-4 transition-all duration-300",
                    isExpanded
                      ? "rotate-180 text-white"
                      : "text-slate-600 group-hover:text-blue-600 dark:text-slate-300 dark:group-hover:text-blue-400"
                  )}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
                <span className="flex items-center gap-2">
                  <span>{t("common.filter", { defaultValue: "Filters" })}</span>
                  {hasActiveFilters && (
                    <span className="flex items-center gap-1">
                      <span className="text-xs opacity-90">•</span>
                      <span
                        className="text-xs font-bold"
                        title={`Types: ${selectedAlgorithmTypes.length}, Complexity: ${selectedComplexityLevels.length}, Data: ${selectedDataStructures.length}, Search: ${q.length > 0 ? 1 : 0}, Tags: ${_selectedTags.length}, Diff: ${_selectedDifficulties.length}`}
                      >
                        {activeFilterCount}
                      </span>
                    </span>
                  )}
                </span>
                {hasActiveFilters && (
                  <div className="absolute -top-2 -right-2 flex">
                    <span className="relative flex h-3 w-3">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gradient-to-r from-blue-400 to-purple-400 opacity-75"></span>
                      <span className="relative inline-flex h-3 w-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 shadow-sm"></span>
                    </span>
                  </div>
                )}
              </Button>
            </div>

            {/* Tag Visibility Toggle */}
            <Button
              variant={showTagsOnCards ? "primary" : "outline"}
              size="sm"
              onClick={() => setShowTagsOnCards(!showTagsOnCards)}
              title={
                showTagsOnCards ? "Hide tags on cards" : "Show tags on cards"
              }
            >
              <span className="mr-1">🏷️</span>
              <span className="hidden sm:inline">Tags</span>
            </Button>

            {/* Clear Button */}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClear}
                className="text-slate-600 dark:text-slate-400"
              >
                {t("common.clear")}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Expanded Filters */}
      {isExpanded && (
        <div className="animate-fade-in-down scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent hover:scrollbar-thumb-slate-400 dark:scrollbar-thumb-slate-600 dark:hover:scrollbar-thumb-slate-500 relative mt-1 max-h-[70vh] space-y-6 overflow-y-auto overscroll-contain rounded-2xl border border-white/20 bg-white/80 px-4 pb-6 shadow-lg backdrop-blur-sm md:px-6 dark:border-slate-700/30 dark:bg-slate-900/80">
          <div className="relative z-10 space-y-8 pt-4">
            {/* Sort & Relevance Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2">
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Sort & Relevance
                </h4>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {[
                  {
                    key: "relevance",
                    icon: "🎯",
                    label: "Relevance",
                    desc: "Smart AI-powered ranking",
                  },
                  {
                    key: "title",
                    icon: "📝",
                    label: "A-Z",
                    desc: "Alphabetical order",
                  },
                  {
                    key: "difficulty",
                    icon: "📊",
                    label: "Complexity",
                    desc: "By difficulty level",
                  },
                  {
                    key: "recent",
                    icon: "🕐",
                    label: "Recent",
                    desc: "Recently updated",
                  },
                  {
                    key: "popularity",
                    icon: "❤️",
                    label: "Popular",
                    desc: "Most liked",
                  },
                ].map((option) => (
                  <button
                    key={option.key}
                    onClick={() => setSortKey(option.key as SortKey)}
                    className={cn(
                      "group relative overflow-hidden rounded-xl border px-4 py-3 text-left transition-all duration-300",
                      sortKey === option.key
                        ? "scale-105 border-blue-500/50 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 shadow-md"
                        : "border-white/20 bg-white/5 hover:scale-102 hover:border-blue-500/30 hover:bg-white/10 dark:bg-white/5"
                    )}
                    title={option.desc}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{option.icon}</span>
                      <span className="text-sm font-medium">
                        {option.label}
                      </span>
                    </div>
                    {sortKey === option.key && (
                      <div className="absolute top-1 right-1 h-2 w-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 shadow-sm"></div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Algorithm Types Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2">
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Algorithm Types
                </h4>
                {selectedAlgorithmTypes.length > 0 && (
                  <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-700 dark:bg-green-900/30 dark:text-green-300">
                    {selectedAlgorithmTypes.length} selected
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {[
                  {
                    key: "sorting",
                    label: "Sorting",
                    icon: "🔢",
                    desc: "Arrange data in order",
                  },
                  {
                    key: "searching",
                    label: "Searching",
                    icon: "🔍",
                    desc: "Find specific elements",
                  },
                  {
                    key: "graph",
                    label: "Graph",
                    icon: "🕸️",
                    desc: "Graph-based algorithms",
                  },
                  {
                    key: "tree",
                    label: "Tree",
                    icon: "🌳",
                    desc: "Tree data structures",
                  },
                  {
                    key: "dynamic-programming",
                    label: "Dynamic Programming",
                    icon: "🧩",
                    desc: "Optimal subproblems",
                  },
                  {
                    key: "greedy",
                    label: "Greedy",
                    icon: "🎯",
                    desc: "Local optimal choices",
                  },
                  {
                    key: "backtracking",
                    label: "Backtracking",
                    icon: "↩️",
                    desc: "Trial and error",
                  },
                  {
                    key: "divide-conquer",
                    label: "Divide & Conquer",
                    icon: "⚡",
                    desc: "Split and solve",
                  },
                ].map((type) => (
                  <button
                    key={type.key}
                    onClick={() =>
                      toggleAlgorithmType(type.key as AlgorithmType)
                    }
                    className={cn(
                      "group relative overflow-hidden rounded-xl border px-4 py-3 text-left transition-all duration-300",
                      selectedAlgorithmTypes.includes(type.key as AlgorithmType)
                        ? "border-green-500/50 bg-gradient-to-br from-green-500/20 to-emerald-500/20 shadow-md"
                        : "border-white/20 bg-white/5 hover:border-green-500/30 hover:bg-white/10 dark:bg-white/5"
                    )}
                    title={type.desc}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{type.icon}</span>
                      <span className="text-sm font-medium">{type.label}</span>
                    </div>
                    {selectedAlgorithmTypes.includes(
                      type.key as AlgorithmType
                    ) && (
                      <div className="absolute top-1 right-1 h-2 w-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 shadow-sm"></div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Complexity Levels Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2">
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Complexity Levels
                </h4>
                {selectedComplexityLevels.length > 0 && (
                  <span className="rounded-full bg-orange-100 px-2 py-1 text-xs text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
                    {selectedComplexityLevels.length} selected
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {[
                  {
                    key: "constant",
                    label: "O(1)",
                    desc: "Constant time",
                    icon: "⚡",
                    color: "green",
                  },
                  {
                    key: "logarithmic",
                    label: "O(log n)",
                    desc: "Logarithmic",
                    icon: "📈",
                    color: "blue",
                  },
                  {
                    key: "linear",
                    label: "O(n)",
                    desc: "Linear time",
                    icon: "📏",
                    color: "yellow",
                  },
                  {
                    key: "linearithmic",
                    label: "O(n log n)",
                    desc: "Linearithmic",
                    icon: "📊",
                    color: "orange",
                  },
                  {
                    key: "quadratic",
                    label: "O(n²)",
                    desc: "Quadratic",
                    icon: "🔥",
                    color: "red",
                  },
                  {
                    key: "cubic",
                    label: "O(n³)",
                    desc: "Cubic",
                    icon: "🌶️",
                    color: "purple",
                  },
                  {
                    key: "exponential",
                    label: "O(2ⁿ)",
                    desc: "Exponential",
                    icon: "💣",
                    color: "gray",
                  },
                ].map((level) => (
                  <button
                    key={level.key}
                    onClick={() =>
                      toggleComplexityLevel(level.key as ComplexityLevel)
                    }
                    className={cn(
                      "group relative overflow-hidden rounded-xl border px-4 py-3 text-left transition-all duration-300",
                      selectedComplexityLevels.includes(
                        level.key as ComplexityLevel
                      )
                        ? "border-orange-500/50 bg-gradient-to-br from-orange-500/20 to-amber-500/20 shadow-md"
                        : "border-white/20 bg-white/5 hover:border-orange-500/30 hover:bg-white/10 dark:bg-white/5"
                    )}
                    title={level.desc}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{level.icon}</span>
                      <span className="font-mono text-sm font-bold">
                        {level.label}
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                      {level.desc}
                    </div>
                    {selectedComplexityLevels.includes(
                      level.key as ComplexityLevel
                    ) && (
                      <div className="absolute top-1 right-1 h-2 w-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 shadow-sm"></div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Data Structures Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2">
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Data Structures
                </h4>
                {selectedDataStructures.length > 0 && (
                  <span className="rounded-full bg-purple-100 px-2 py-1 text-xs text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                    {selectedDataStructures.length} selected
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {[
                  {
                    key: "array",
                    label: "Array",
                    icon: "📊",
                    desc: "Indexed collections",
                  },
                  {
                    key: "linked-list",
                    label: "Linked List",
                    icon: "🔗",
                    desc: "Linked nodes",
                  },
                  {
                    key: "stack",
                    label: "Stack",
                    icon: "📚",
                    desc: "LIFO structure",
                  },
                  {
                    key: "queue",
                    label: "Queue",
                    icon: "🚶",
                    desc: "FIFO structure",
                  },
                  {
                    key: "tree",
                    label: "Tree",
                    icon: "🌳",
                    desc: "Hierarchical structure",
                  },
                  {
                    key: "graph",
                    label: "Graph",
                    icon: "🕸️",
                    desc: "Connected vertices",
                  },
                  {
                    key: "hash-table",
                    label: "Hash Table",
                    icon: "🗂️",
                    desc: "Key-value pairs",
                  },
                  {
                    key: "heap",
                    label: "Heap",
                    icon: "⛰️",
                    desc: "Priority structure",
                  },
                ].map((structure) => (
                  <button
                    key={structure.key}
                    onClick={() =>
                      toggleDataStructure(structure.key as DataStructureType)
                    }
                    className={cn(
                      "group relative overflow-hidden rounded-xl border px-4 py-3 text-left transition-all duration-300",
                      selectedDataStructures.includes(
                        structure.key as DataStructureType
                      )
                        ? "border-purple-500/50 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 shadow-md"
                        : "border-white/20 bg-white/5 hover:border-purple-500/30 hover:bg-white/10 dark:bg-white/5"
                    )}
                    title={structure.desc}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{structure.icon}</span>
                      <span className="text-sm font-medium">
                        {structure.label}
                      </span>
                    </div>
                    {selectedDataStructures.includes(
                      structure.key as DataStructureType
                    ) && (
                      <div className="absolute top-1 right-1 h-2 w-2 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 shadow-sm"></div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
