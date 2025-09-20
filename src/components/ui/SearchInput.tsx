import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { cn, debounce } from "@/utils";
import {
  recordSearchMetrics,
  recordSearchSelection,
} from "@/utils/searchMonitor";
import {
  cacheSearchResults,
  getCachedSearchResults,
  getDidYouMeanSuggestions,
  type SearchableItem,
  type SearchOptions,
  type SearchResult,
  smartSearch,
  trackSearchQuery,
  trackSearchSelection,
} from "@/utils/searchUtils";

import { Input } from "./Input";

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  debounceMs?: number;
  onSearch?: (value: string) => void;
  onClear?: () => void;

  // Legacy props for backward compatibility
  suggestions?: string[];
  showSuggestions?: boolean;

  // New advanced search props
  searchableItems?: SearchableItem[];
  searchOptions?: SearchOptions;
  onResultSelect?: (result: SearchResult<SearchableItem>) => void;
  showCategories?: boolean;
  showScores?: boolean;
  enableTypoCorrection?: boolean;
  enableFuzzySearch?: boolean;
  maxDisplayedResults?: number;

  // Enhanced UI props
  showResultPreviews?: boolean;
  showSearchStats?: boolean;
  _enableSearchHistory?: boolean;
  showKeyboardHints?: boolean;

  // UI props
  loading?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;

  // Accessibility props
  "aria-label"?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Search algorithms, complexity (O(1), O(log n)), data structures...",
  className,
  debounceMs = 100,
  onSearch,
  onClear,

  // Legacy props
  suggestions = [],
  showSuggestions = false,

  // New advanced search props
  searchableItems = [],
  searchOptions = {},
  onResultSelect,
  showCategories = true,
  showScores = false,
  enableTypoCorrection = true,
  enableFuzzySearch = true,
  maxDisplayedResults = 8,

  // Enhanced UI props
  showResultPreviews = true,
  showSearchStats = false,
  _enableSearchHistory = true,
  showKeyboardHints = true,

  // UI props
  loading = false,
  disabled = false,
  autoFocus = false,

  // Accessibility props
  "aria-label": ariaLabel,
}: SearchInputProps) {
  const [internalValue, setInternalValue] = useState(value);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [searchResults, setSearchResults] = useState<
    SearchResult<SearchableItem>[]
  >([]);
  const [didYouMeanSuggestions, setDidYouMeanSuggestions] = useState<string[]>(
    []
  );
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Determine if we're using advanced search or legacy mode
  const useAdvancedSearch = searchableItems && searchableItems.length > 0;

  // Debounced search function (for actual search logic)
  const debouncedSearch = debounce((searchValue: string) => {
    if (useAdvancedSearch && searchValue.trim()) {
      setIsSearching(true);

      // Check cache first for performance boost
      const cachedResults = getCachedSearchResults(searchValue);
      if (cachedResults) {
        setSearchResults(cachedResults);
        setDidYouMeanSuggestions([]);
        setShowDropdown(true);
        setIsSearching(false);
        return;
      }

      // Use setTimeout to allow UI to update with loading state
      setTimeout(() => {
        try {
          // Start performance timer
          const startTime = performance.now();

          // Perform smart search with all advanced features
          const results = smartSearch(searchValue, searchableItems, {
            maxResults: maxDisplayedResults,
            suggestTypos: enableTypoCorrection,
            fuzzyThreshold: enableFuzzySearch ? 0.6 : 0.9,
            highlightMatches: true,
            enableSemanticSearch: true,
            enablePhoneticSearch: true,
            enableContextualSearch: true,
            enableAbbreviationSearch: true,
            enableSynonymSearch: true,
            ...searchOptions,
          });

          // Record performance metrics
          const searchTime = performance.now() - startTime;
          recordSearchMetrics(
            searchValue,
            results,
            searchTime,
            !!cachedResults
          );

          // Cache results for future searches
          cacheSearchResults(searchValue, results);

          // Track search analytics
          trackSearchQuery(searchValue, results.length);

          setSearchResults(results);

          // Get "Did you mean?" suggestions if no results
          if (results.length === 0 && enableTypoCorrection) {
            const suggestions = getDidYouMeanSuggestions(
              searchValue,
              searchableItems
            );
            setDidYouMeanSuggestions(suggestions);
          } else {
            setDidYouMeanSuggestions([]);
          }

          setShowDropdown(true);
        } finally {
          setIsSearching(false);
        }
      }, 0);
    } else if (!useAdvancedSearch && showSuggestions) {
      // Legacy mode - show dropdown if there are suggestions
      setShowDropdown(searchValue.length > 0 && suggestions.length > 0);
    }
  }, debounceMs);

  // Immediate feedback function (not debounced for UI responsiveness)
  const handleImmediateChange = (searchValue: string) => {
    // Always update the parent immediately for UI feedback
    onChange(searchValue);

    // For empty values, clear everything immediately
    if (searchValue.trim() === "") {
      setShowDropdown(false);
      setSearchResults([]);
      setDidYouMeanSuggestions([]);
      setIsSearching(false);
      onSearch?.(searchValue);
      return;
    }

    // Show that we're about to search
    if (searchValue.length > 2) {
      setIsSearching(true);
    }

    // For very short queries (1-2 chars), do a quick simple search
    if (searchValue.length <= 2 && useAdvancedSearch) {
      setIsSearching(false);
      const quickResults = searchableItems
        .filter(
          (item) =>
            item.title.toLowerCase().startsWith(searchValue.toLowerCase()) ||
            item.category?.toLowerCase().includes(searchValue.toLowerCase())
        )
        .slice(0, 5)
        .map((item) => ({
          item,
          score: 0.8,
          type: "partial" as const,
          highlightedTitle: item.title,
          matches: ["title"],
        }));

      setSearchResults(quickResults);
      setDidYouMeanSuggestions([]);
      setShowDropdown(quickResults.length > 0);
    }
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInternalValue(newValue);
    setSelectedIndex(-1);

    // Immediate feedback for UI responsiveness
    handleImmediateChange(newValue);

    // Debounced search for complex operations
    debouncedSearch(newValue);
  };

  // Handle clear - Memoized to prevent unnecessary re-renders
  const handleClear = useCallback(() => {
    setInternalValue("");
    setShowDropdown(false);
    setSelectedIndex(-1);
    setSearchResults([]);
    setDidYouMeanSuggestions([]);
    onChange("");
    onClear?.();
    inputRef.current?.focus();
  }, [onChange, onClear]);

  // Handle suggestion or result selection - Memoized
  const handleItemClick = useCallback(
    (item: string | SearchResult<SearchableItem>) => {
      if (typeof item === "string") {
        // Legacy suggestion
        setInternalValue(item);
        setShowDropdown(false);
        setSelectedIndex(-1);
        onChange(item);
        onSearch?.(item);
      } else {
        // Advanced search result
        const result = item as SearchResult<SearchableItem>;

        // Track analytics for result selection
        trackSearchSelection(internalValue, result.item);
        recordSearchSelection(internalValue, result.item);

        setInternalValue(result.item.title);
        setShowDropdown(false);
        setSelectedIndex(-1);
        onChange(result.item.title);
        onSearch?.(result.item.title);
        onResultSelect?.(result);
      }
    },
    [onChange, onSearch, onResultSelect, internalValue]
  );

  // Handle "Did you mean?" suggestion click - Memoized
  const handleDidYouMeanClick = useCallback(
    (suggestion: string) => {
      setInternalValue(suggestion);
      setSelectedIndex(-1);
      debouncedSearch(suggestion);
    },
    [debouncedSearch]
  );

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const totalItems = useAdvancedSearch
      ? searchResults.length + didYouMeanSuggestions.length
      : filteredSuggestions.length;

    if (!showDropdown || totalItems === 0) {
      if (e.key === "Enter") {
        onSearch?.(internalValue);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => (prev < totalItems - 1 ? prev + 1 : 0));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : totalItems - 1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < totalItems) {
          if (useAdvancedSearch) {
            if (selectedIndex < searchResults.length) {
              // Selected a search result
              handleItemClick(searchResults[selectedIndex]);
            } else {
              // Selected a "did you mean" suggestion
              const suggestionIndex = selectedIndex - searchResults.length;
              handleDidYouMeanClick(didYouMeanSuggestions[suggestionIndex]);
            }
          } else {
            // Legacy mode - selected a suggestion
            handleItemClick(filteredSuggestions[selectedIndex]);
          }
        } else {
          onSearch?.(internalValue);
        }
        break;
      case "Escape":
        setShowDropdown(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Filter suggestions based on input (legacy mode) - Memoized for performance
  const filteredSuggestions = useMemo(() => {
    if (useAdvancedSearch) return [];
    if (!internalValue.trim()) return suggestions.slice(0, 10);

    return suggestions
      .filter((suggestion) =>
        suggestion.toLowerCase().includes(internalValue.toLowerCase())
      )
      .slice(0, 10);
  }, [useAdvancedSearch, suggestions, internalValue]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowDropdown(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync internal value with prop value
  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  // Auto focus
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  return (
    <div className={cn("group relative w-full", className)}>
      <Input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={internalValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (useAdvancedSearch) {
            if (searchResults.length > 0 || didYouMeanSuggestions.length > 0) {
              setShowDropdown(true);
            }
          } else if (
            showSuggestions &&
            filteredSuggestions.length > 0 &&
            internalValue.length > 0
          ) {
            setShowDropdown(true);
          }
        }}
        disabled={disabled}
        loading={loading || isSearching}
        aria-label={ariaLabel}
        leftIcon={
          <svg
            className="h-4 w-4 text-slate-500 transition-colors duration-200 group-focus-within:text-blue-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        }
        rightIcon={
          internalValue && !loading ? (
            <button
              type="button"
              onClick={handleClear}
              className="text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-300"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          ) : undefined
        }
      />

      {/* Enhanced Dropdown */}
      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute z-[100] mt-1 max-h-80 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
        >
          {useAdvancedSearch ? (
            <div className="py-2">
              {/* Loading indicator */}
              {isSearching && (
                <div className="flex items-center gap-3 px-4 py-3">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    Searching...
                  </span>
                </div>
              )}

              {/* "Did you mean?" suggestions */}
              {didYouMeanSuggestions.length > 0 && !isSearching && (
                <div className="border-b border-slate-100 px-4 py-2 dark:border-slate-800">
                  <p className="mb-2 text-xs text-slate-500 dark:text-slate-400">
                    Did you mean:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {didYouMeanSuggestions.map((suggestion, index) => (
                      <button
                        key={suggestion}
                        type="button"
                        className={cn(
                          "rounded-full px-3 py-1 text-sm transition-colors",
                          "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
                          "hover:bg-blue-100 dark:hover:bg-blue-900/50",
                          selectedIndex === searchResults.length + index &&
                            "bg-blue-200 dark:bg-blue-800"
                        )}
                        onClick={() => handleDidYouMeanClick(suggestion)}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Search Results */}
              {searchResults.length > 0 && !isSearching ? (
                <div>
                  {/* Results header with stats */}
                  {showSearchStats && (
                    <div className="border-b border-slate-100 px-4 py-2 dark:border-slate-800">
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {searchResults.length} result
                        {searchResults.length !== 1 ? "s" : ""} found
                        {searchResults.length > 0 &&
                          ` • Best match: ${Math.round(searchResults[0].score * 100)}%`}
                      </p>
                    </div>
                  )}

                  {searchResults.map((result, index) => (
                    <button
                      key={result.item.id}
                      type="button"
                      className={cn(
                        "group w-full px-4 py-3 text-left transition-all duration-150",
                        "hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 dark:hover:from-blue-900/20 dark:hover:to-indigo-900/20",
                        "focus:bg-gradient-to-r focus:from-blue-50/50 focus:to-indigo-50/50 focus:outline-none dark:focus:from-blue-900/20 dark:focus:to-indigo-900/20",
                        selectedIndex === index &&
                          "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30",
                        "border-l-4 border-transparent",
                        result.score >= 0.9 && "border-l-green-400",
                        result.score >= 0.7 &&
                          result.score < 0.9 &&
                          "border-l-blue-400",
                        result.score >= 0.5 &&
                          result.score < 0.7 &&
                          "border-l-yellow-400",
                        result.score < 0.5 && "border-l-gray-300"
                      )}
                      onClick={() => handleItemClick(result)}
                      aria-label={`Select ${result.item.title}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="min-w-0 flex-1">
                          {/* Title and badges */}
                          <div className="mb-1 flex items-center gap-2">
                            <span
                              className="font-semibold text-slate-900 transition-colors group-hover:text-blue-600 dark:text-slate-100 dark:group-hover:text-blue-400"
                              dangerouslySetInnerHTML={{
                                __html:
                                  result.highlightedTitle || result.item.title,
                              }}
                            />

                            {/* Result type badge */}
                            {result.type === "exact" && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                                Exact
                              </span>
                            )}
                            {result.type === "fuzzy" && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                                <span className="h-1.5 w-1.5 rounded-full bg-yellow-500"></span>
                                Fuzzy
                              </span>
                            )}
                            {result.type === "semantic" && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                                <span className="h-1.5 w-1.5 rounded-full bg-purple-500"></span>
                                Smart
                              </span>
                            )}

                            {/* Category badge */}
                            {showCategories && result.item.category && (
                              <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 transition-colors group-hover:bg-blue-100 dark:bg-slate-700 dark:text-slate-300 dark:group-hover:bg-blue-900/50">
                                {result.item.category}
                              </span>
                            )}
                          </div>

                          {/* Enhanced preview with summary */}
                          {showResultPreviews && result.item.summary && (
                            <p className="mt-1 line-clamp-2 text-sm text-slate-600 transition-colors group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-300">
                              {result.item.summary}
                            </p>
                          )}

                          {/* Match indicators */}
                          {result.matches && result.matches.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {result.matches.slice(0, 3).map((match) => (
                                <span
                                  key={match}
                                  className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600 transition-colors group-hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:group-hover:bg-blue-900/50"
                                >
                                  matches: {match}
                                </span>
                              ))}
                              {result.matches.length > 3 && (
                                <span className="text-xs text-slate-400">
                                  +{result.matches.length - 3} more
                                </span>
                              )}
                            </div>
                          )}

                          {/* Result explanation */}
                          {result.explanation && (
                            <p className="mt-1 text-xs text-slate-500 italic dark:text-slate-500">
                              {result.explanation}
                            </p>
                          )}
                        </div>

                        {/* Score and keyboard hint */}
                        <div className="ml-3 flex flex-col items-end gap-1">
                          {showScores && (
                            <div
                              className={cn(
                                "text-xs font-medium",
                                result.score >= 0.9 &&
                                  "text-green-600 dark:text-green-400",
                                result.score >= 0.7 &&
                                  result.score < 0.9 &&
                                  "text-blue-600 dark:text-blue-400",
                                result.score >= 0.5 &&
                                  result.score < 0.7 &&
                                  "text-yellow-600 dark:text-yellow-400",
                                result.score < 0.5 && "text-slate-400"
                              )}
                            >
                              {Math.round(result.score * 100)}%
                            </div>
                          )}
                          {showKeyboardHints && selectedIndex === index && (
                            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-400 dark:bg-slate-700">
                              ↵
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}

                  {/* Footer with keyboard navigation hints */}
                  {showKeyboardHints && searchResults.length > 0 && (
                    <div className="border-t border-slate-100 px-4 py-2 dark:border-slate-800">
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        ↑↓ Navigate • ↵ Select • Esc Close
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                internalValue.trim() &&
                !isSearching && (
                  <div className="px-4 py-8 text-center">
                    <div className="mb-2 text-slate-400">
                      <svg
                        className="mx-auto h-8 w-8"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400">
                      No results found for "{internalValue}"
                    </p>
                    {!enableTypoCorrection && (
                      <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                        Try a different search term
                      </p>
                    )}
                  </div>
                )
              )}
            </div>
          ) : (
            /* Legacy dropdown for backward compatibility */
            filteredSuggestions.length > 0 && (
              <div>
                {filteredSuggestions.map((suggestion, index) => (
                  <button
                    key={suggestion}
                    type="button"
                    className={cn(
                      "w-full px-4 py-2 text-left text-sm transition-colors",
                      "hover:bg-slate-100 dark:hover:bg-slate-800",
                      "focus:bg-slate-100 focus:outline-none dark:focus:bg-slate-800",
                      index === selectedIndex &&
                        "bg-slate-100 dark:bg-slate-800",
                      index === 0 && "rounded-t-xl",
                      index === filteredSuggestions.length - 1 && "rounded-b-xl"
                    )}
                    onClick={() => handleItemClick(suggestion)}
                    aria-label={`Use suggestion ${suggestion}`}
                    title={`Use suggestion ${suggestion}`}
                  >
                    <span className="flex items-center">
                      <svg
                        className="mr-2 h-4 w-4 text-slate-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                      <span>{suggestion}</span>
                    </span>
                  </button>
                ))}
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
