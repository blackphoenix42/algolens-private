import React, { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/Button";
import { SearchInput } from "@/components/ui/SearchInput";
import { useI18n } from "@/i18n";
import type { AlgoMeta } from "@/types/algorithms";
import { cn, createSearchableFromAlgoMeta } from "@/utils";

export type SortKey =
  | "relevance"
  | "title"
  | "difficulty"
  | "recent"
  | "popularity";

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
};

export default function FilterBar(props: Props) {
  const { t } = useI18n();
  const {
    q,
    setQ,
    categories,
    selectedCategories,
    setSelectedCategories,
    tags,
    selectedTags,
    setSelectedTags,
    difficulties,
    selectedDifficulties,
    setSelectedDifficulties,
    sortKey,
    setSortKey,
    onClear,
    catalog,
    showTagsOnCards,
    setShowTagsOnCards,
    onTagClick,
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
    return createSearchableFromAlgoMeta(allAlgorithms);
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

  const toggleIn = (arr: string[], v: string) =>
    arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];

  const hasActiveFilters =
    selectedCategories.length > 0 ||
    selectedTags.length > 0 ||
    selectedDifficulties.length > 0 ||
    q.length > 0;

  return (
    <div
      className={cn(
        "sticky top-4 z-40 mb-6 transition-all duration-300",
        "liquid-glass-card shadow-xl"
      )}
      style={{ overflow: "visible" }} // Force override overflow:hidden
    >
      {/* Main Search and Controls */}
      <div className="p-4 md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          {/* Search Input */}
          <div className="relative z-50 flex-1">
            <SearchInput
              value={q}
              onChange={setQ}
              placeholder={t("common.searchPlaceholder", {
                defaultValue:
                  "Search by algorithm, tags, concepts, or difficulty...",
              })}
              // Performance optimization for fast typing
              debounceMs={20}
              // Enhanced search props
              searchableItems={searchableItems}
              enableFuzzySearch={true}
              enableTypoCorrection={true}
              showCategories={true}
              maxDisplayedResults={8}
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
              // Legacy fallback for backward compatibility
              suggestions={[
                ...categories,
                ...tags,
                // Add popular search terms for better discoverability
                "comparison",
                "in-place",
                "stable",
                "logarithmic",
                "linear",
                "divide-conquer",
                "dynamic-programming",
                "greedy",
                "backtrack",
                "recursive",
                "iterative",
                "sorting",
                "searching",
                "graph-theory",
                "tree-structure",
                "optimization",
                "efficient",
              ]}
              showSuggestions={true}
              className="w-full"
              autoFocus={!isMobile}
              data-testid="search-input"
              data-keyboard-shortcut="/"
            />
          </div>

          {/* Quick Actions */}
          <div className="flex flex-shrink-0 items-center gap-2">
            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as SortKey)}
                className="ui-select min-w-[120px] cursor-pointer appearance-none text-sm"
                title={t("controls.sort")}
              >
                <option value="relevance">
                  ⭐ {t("controls.relevance", { defaultValue: "Relevance" })}
                </option>
                <option value="title">
                  🔤 {t("controls.title", { defaultValue: "Title" })}
                </option>
                <option value="difficulty">
                  📊 {t("controls.difficulty", { defaultValue: "Difficulty" })}
                </option>
                <option value="recent">
                  🕐 {t("controls.recent", { defaultValue: "Recent" })}
                </option>
                <option value="popularity">
                  ❤️ {t("controls.popular", { defaultValue: "Popular" })}
                </option>
              </select>
            </div>

            {/* Filter Toggle */}
            <Button
              variant={isExpanded ? "primary" : "outline"}
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="relative"
            >
              <span className="ml-1">{t("common.filter")}</span>
              {hasActiveFilters && (
                <span className="bg-primary-500 absolute -top-1 -right-1 h-2 w-2 animate-pulse rounded-full" />
              )}
            </Button>

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

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="animate-fade-in-down space-y-4 border-t border-white/20 px-4 pb-4 md:px-6 md:pb-6 dark:border-white/10">
          {/* Categories */}
          {categories.length > 0 && (
            <div>
              <h4 className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                Categories
              </h4>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() =>
                      setSelectedCategories(toggleIn(selectedCategories, cat))
                    }
                    className={cn(
                      "liquid-glass-filter px-3 py-1.5 text-sm font-medium transition-all duration-200",
                      selectedCategories.includes(cat)
                        ? "active text-primary-700 dark:text-primary-300"
                        : "text-slate-700 dark:text-slate-300"
                    )}
                  >
                    {cat.replace("-", " ").toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Difficulties */}
          {difficulties.length > 0 && (
            <div>
              <h4 className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                Difficulty
              </h4>
              <div className="flex flex-wrap gap-2">
                {difficulties.map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() =>
                      setSelectedDifficulties(
                        toggleIn(selectedDifficulties, diff)
                      )
                    }
                    className={cn(
                      "liquid-glass-filter px-3 py-1.5 text-sm font-medium transition-all duration-200",
                      selectedDifficulties.includes(diff)
                        ? "active text-secondary-700 dark:text-secondary-300"
                        : "text-slate-700 dark:text-slate-300"
                    )}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div>
              <h4 className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                Tags
              </h4>
              <div className="flex max-h-32 flex-wrap gap-2 overflow-y-auto">
                {tags.slice(0, 20).map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      setSelectedTags(toggleIn(selectedTags, tag));
                      onTagClick(tag);
                    }}
                    className={cn(
                      "liquid-glass-filter px-2.5 py-1 text-xs font-medium transition-all duration-200 hover:scale-105",
                      selectedTags.includes(tag)
                        ? "active text-secondary-700 dark:text-secondary-300"
                        : "hover:text-secondary-600 dark:hover:text-secondary-400 text-slate-600 dark:text-slate-400"
                    )}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
