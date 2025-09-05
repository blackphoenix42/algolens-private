import React, { useState, useEffect } from "react";

import { Button } from "@/components/ui/Button";
import { SearchInput } from "@/components/ui/SearchInput";
import { useI18n } from "@/i18n/exports";
import { cn } from "@/utils";

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
  } = props;

  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

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
        "rounded-2xl border backdrop-blur-xl",
        "bg-white/80 dark:bg-slate-900/80",
        "border-slate-200/80 dark:border-slate-700/80",
        "shadow-xl"
      )}
    >
      {/* Main Search and Controls */}
      <div className="p-4 md:p-6">
        <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
          {/* Search Input */}
          <div className="flex-1">
            <SearchInput
              value={q}
              onChange={setQ}
              placeholder={t("common.searchPlaceholder", {
                defaultValue:
                  "Search algorithms, data structures, or concepts...",
              })}
              suggestions={[...categories, ...tags]}
              showSuggestions={true}
              className="w-full"
              autoFocus={!isMobile}
              data-testid="search-input"
              data-keyboard-shortcut="/"
            />
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as SortKey)}
                className="ui-select text-sm min-w-[120px] appearance-none cursor-pointer"
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
                <span className="absolute -top-1 -right-1 h-2 w-2 bg-primary-500 rounded-full animate-pulse" />
              )}
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
        <div className="px-4 pb-4 md:px-6 md:pb-6 space-y-4 border-t border-slate-200/50 dark:border-slate-700/50 animate-fade-in-down">
          {/* Categories */}
          {categories.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
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
                      "px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-200 border",
                      selectedCategories.includes(cat)
                        ? "bg-primary-100 text-primary-700 border-primary-200 dark:bg-primary-900 dark:text-primary-300"
                        : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
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
              <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
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
                      "px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-200 border",
                      selectedDifficulties.includes(diff)
                        ? "bg-secondary-100 text-secondary-700 border-secondary-200 dark:bg-secondary-900 dark:text-secondary-300"
                        : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
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
              <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Tags
              </h4>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                {tags.slice(0, 20).map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSelectedTags(toggleIn(selectedTags, tag))}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-200 border",
                      selectedTags.includes(tag)
                        ? "bg-secondary-100 text-secondary-700 border-secondary-200 dark:bg-secondary-900 dark:text-secondary-300"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
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
