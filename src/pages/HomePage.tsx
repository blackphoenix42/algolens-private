import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

// import DebugPanel from "@/components/debug/DebugPanel";
// import { usePerformanceMonitor } from "@/components/debug/PerformanceMonitor";
// import { AIRecommendationPanel } from "@/components/home/AIRecommendationPanel";
// import { AISearchHelper } from "@/components/home/AISearchHelper";
import AlgoCard, { AlgoItem } from "@/components/home/AlgoCard";
import FilterBar from "@/components/home/FilterBar";
// import OnboardingTour from "@/components/onboarding/OnboardingTour";
// import { KeyboardShortcutsButton } from "@/components/panels/KeyboardShortcutsPanel";
import { Button } from "@/components/ui/Button";
// import { SearchInput } from "@/components/ui/SearchInput";
// import ThemeToggle from "@/components/ui/ThemeToggle";
// import { ENABLE_AI_UI } from "@/config/featureFlags";
import { loadAllTopics } from "@/engine/registry";
import { usePreferences } from "@/hooks/usePreferences";
// import { LanguageSwitcher, useI18n } from "@/i18n";
// import { LogCategory, logger, useComponentLogger } from "@/services/monitoring";
import type { AlgoMeta } from "@/types/algorithms";
import {
  cn,
  // createSearchableFromAlgoMeta,
  formatDifficulty,
  scrollToElement,
} from "@/utils";
import { getAllAlgorithmTags } from "@/utils/algorithmTags";
import {
  processInChunks,
  runWhenIdle,
  yieldToMain,
} from "@/utils/taskScheduler";

type SortKey = "relevance" | "title" | "difficulty" | "recent" | "popularity";

const normDiff = (v?: AlgoItem["difficulty"]) =>
  v == null
    ? 3
    : typeof v === "number"
      ? v
      : v === "Easy"
        ? 1
        : v === "Medium"
          ? 3
          : 5;

const pretty = (t: string) =>
  t.replace(/[-_]/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());

/** topic → emoji + accent color for the thumbnail */
const TOPIC_META: Record<string, { icon: string; color: string }> = {
  sorting: { icon: "↕️", color: "emerald" },
  "data-structures": { icon: "🧱", color: "violet" },
  arrays: { icon: "📊", color: "sky" },
  searching: { icon: "🔎", color: "indigo" },
  graph: { icon: "🕸️", color: "cyan" },
  trees: { icon: "🌲", color: "green" },
  dp: { icon: "🧩", color: "fuchsia" },
  geometry: { icon: "📐", color: "rose" },
  "number-theory": { icon: "🔢", color: "amber" },
};

function useSafeCatalog(): {
  catalog: Record<string, AlgoItem[]>;
  metaCatalog: Record<string, AlgoMeta[]>;
} {
  const [catalog, setCatalog] = useState<Record<string, AlgoItem[]>>({});
  const [metaCatalog, setMetaCatalog] = useState<Record<string, AlgoMeta[]>>(
    {}
  );

  useEffect(() => {
    const loadCatalog = async () => {
      try {
        const loadedCatalog = await loadAllTopics();
        const safe: Record<string, AlgoItem[]> = {};

        // Store the full metadata catalog for search functionality
        setMetaCatalog(loadedCatalog);

        // Process topics in chunks to avoid blocking main thread
        const topics = Object.entries(loadedCatalog);
        await processInChunks(
          topics,
          async ([topic, items]) => {
            // Yield to main thread for heavy processing
            await yieldToMain();
            safe[topic] = Array.isArray(items) ? (items as AlgoItem[]) : [];
          },
          2 // Process 2 topics at a time
        );

        setCatalog(safe);
      } catch (error) {
        console.error("Failed to load algorithm catalog:", error);
        setCatalog({});
        setMetaCatalog({});
      }
    };

    // Use idle callback for non-critical loading
    runWhenIdle(loadCatalog);
  }, []);

  return { catalog, metaCatalog };
}

export default function HomePage() {
  // const { t } = useI18n();
  // const componentLogger = useComponentLogger("HomePage");
  const _navigate = useNavigate();
  const { catalog, metaCatalog } = useSafeCatalog();
  const {
    // shouldShowOnboardingTour,
    resetOnboardingTour,
    // markOnboardingTourSeen,
  } = usePreferences();

  // Log homepage access
  useEffect(() => {
    // // logger.info(LogCategory.ROUTER, "HomePage accessed");
    // componentLogger.mount();

    // Log catalog contents
    const _catalogStats = Object.entries(catalog).map(([topic, items]) => ({
      topic,
      count: items.length,
    }));
    // logger.debug(LogCategory.GENERAL, "Algorithm catalog loaded", {
    //   catalogStats,
    //   totalAlgorithms: Object.values(catalog).reduce(
    //     (acc, items) => acc + items.length,
    //     0
    //   ),
    //   timestamp: new Date().toISOString(),
    // });

    // return () => componentLogger.unmount();
  }, [catalog]);

  const [q, setQ] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>(
    []
  );
  const [sortKey, setSortKey] = useState<SortKey>("relevance");
  // const [showOnboarding, setShowOnboarding] = useState(false);
  const [showTagsOnCards, setShowTagsOnCards] = useState(true);
  // const [showFeaturedAlgorithms, setShowFeaturedAlgorithms] = useState(true);
  // const [showDebugPanel, setShowDebugPanel] = useState(false);

  // Performance Monitor
  // const performanceMonitor = usePerformanceMonitor();

  // Hero section visibility from preferences
  const { preferences: _preferences, toggleHeroSection } = usePreferences();
  // const showHero = preferences.showHeroSection;

  // Check if this is a first-time user
  /*
  useEffect(() => {
    const shouldShow = shouldShowOnboardingTour();
    if (shouldShow) {
      setShowOnboarding(true);
    }
  }, [
    shouldShowOnboardingTour,
    preferences.showOnboardingTour,
    preferences.lastSeenOnboardingVersion,
  ]);
  */

  // Keyboard shortcut for toggling featured algorithms
  /*
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.ctrlKey &&
        event.shiftKey &&
        event.key === "F" &&
        !event.altKey &&
        !event.metaKey
      ) {
        // Check if we're not in an input field
        const target = event.target as HTMLElement;
        if (
          target.tagName !== "INPUT" &&
          target.tagName !== "TEXTAREA" &&
          !target.isContentEditable
        ) {
          event.preventDefault();
          setShowFeaturedAlgorithms((prev) => !prev);

          // Log the action
          // logger.info(
          //   LogCategory.USER_INTERACTION,
          //   "Featured algorithms toggled via keyboard",
          //   {
          //     showFeatured: !showFeaturedAlgorithms,
          //     source: "keyboard_shortcut",
          //     shortcut: "Ctrl+Shift+F",
          //     timestamp: new Date().toISOString(),
          //   }
          // );
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showFeaturedAlgorithms]);
  */

  // Keyboard shortcut for toggling debug panel (Dev Mode)
  useEffect(() => {
    if (!import.meta.env.DEV) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.ctrlKey &&
        event.shiftKey &&
        event.key === "D" &&
        !event.altKey &&
        !event.metaKey
      ) {
        // Check if we're not in an input field
        const target = event.target as HTMLElement;
        if (
          target.tagName !== "INPUT" &&
          target.tagName !== "TEXTAREA" &&
          !target.isContentEditable
        ) {
          event.preventDefault();
          // setShowDebugPanel((prev) => {
          //   const newState = !prev;
          //   // logger.info(
          //   //   LogCategory.USER_INTERACTION,
          //   //   `Debug panel ${newState ? "opened" : "closed"} via keyboard shortcut`,
          //   //   {
          //     //     method: "keyboard_shortcut",
          //     //     key: "Ctrl+Shift+D",
          //     //     timestamp: new Date().toISOString(),
          //     //   }
          //     // );
          //     return newState;
          //   });
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const topics = useMemo(() => Object.keys(catalog), [catalog]);
  const difficulties = ["Easy", "Medium", "Hard"];

  const allItems = useMemo(
    () =>
      Object.entries(catalog).flatMap(([topic, items]) =>
        (items ?? []).map((item) => ({ topic, item }))
      ),
    [catalog]
  );

  // Create searchable algorithm data for mini search dropdown
  // const searchableItems = useMemo(() => {
  //   const allAlgorithms = Object.values(metaCatalog).flat();
  //   return createSearchableFromAlgoMeta(allAlgorithms);
  // }, [metaCatalog]);

  const tagUniverse = useMemo(() => {
    const s = new Set<string>();
    allItems.forEach(({ topic, item }) => {
      // Add original tags
      item.tags?.forEach((t) => s.add(t));
      // Add generated tags
      const allTags = getAllAlgorithmTags(item, topic);
      allTags.forEach((t) => s.add(t));
    });
    return Array.from(s).sort((a, b) => a.localeCompare(b));
  }, [allItems]);

  const titleMap = useMemo(() => {
    const m: Record<string, { title: string; topic: string }> = {};
    for (const [topic, items] of Object.entries(catalog)) {
      (items ?? []).forEach((it) => (m[it.slug] = { title: it.title, topic }));
    }
    return m;
  }, [catalog]);

  const filteredGrouped = useMemo(() => {
    const ql = q.trim().toLowerCase();
    const activeTagSet = new Set(selectedTags);
    const activeCategorySet = new Set(selectedCategories);
    const activeDifficultySet = new Set(selectedDifficulties);

    const allow = (d?: AlgoItem["difficulty"]) => {
      if (selectedDifficulties.length === 0) return true;
      const label = formatDifficulty(d);
      return activeDifficultySet.has(label);
    };

    const score = (t: string, it: AlgoItem) => {
      if (!ql) return 0;
      let s = 0;
      const title = it.title.toLowerCase();
      const summary = (it.summary || "").toLowerCase();
      const originalTags = (it.tags || []).join(" ").toLowerCase();

      // Get all tags (original + generated) for comprehensive search
      const allTags = getAllAlgorithmTags(it, t);
      const allTagsText = allTags.join(" ").toLowerCase();

      // Exact matches get highest scores
      if (title === ql) s += 500;
      if (allTags.some((tag) => tag.toLowerCase() === ql)) s += 450; // Exact tag match

      // Prefix matches
      if (title.startsWith(ql)) s += 250;
      if (allTags.some((tag) => tag.toLowerCase().startsWith(ql))) s += 200; // Tag prefix match

      // Contains matches
      if (title.includes(ql)) s += 120;
      if (summary.includes(ql)) s += 60;
      if (allTagsText.includes(ql)) s += 100; // Higher score for tag matches
      if (originalTags.includes(ql)) s += 80; // Still score original tags for backward compatibility
      if (t.toLowerCase().includes(ql)) s += 20; // Topic match

      return s;
    };

    const out: Record<
      string,
      Array<{ topic: string; item: AlgoItem; _score: number }>
    > = {};

    for (const [topic, items] of Object.entries(catalog)) {
      // Filter by category
      if (selectedCategories.length > 0 && !activeCategorySet.has(topic))
        continue;

      const pool = Array.isArray(items) ? items : [];
      const keep = pool.filter((it) => {
        if (!allow(it.difficulty)) return false;
        if (activeTagSet.size) {
          // Get all tags for this algorithm (original + generated)
          const allTags = getAllAlgorithmTags(it, topic);
          const algorithmTagSet = new Set(allTags);

          // Check if all selected tags are present in the algorithm's tags
          for (const tag of activeTagSet) {
            if (!algorithmTagSet.has(tag)) return false;
          }
        }
        if (!ql) return true;

        // Get all tags for comprehensive search
        const allTags = getAllAlgorithmTags(it, topic);
        const allTagsText = allTags.join(" ").toLowerCase();

        const hay = `${it.title} ${it.summary} ${(it.tags || []).join(
          " "
        )} ${allTagsText} ${topic}`.toLowerCase();
        return hay.includes(ql);
      });

      const adorned = keep.map((it) => ({
        topic,
        item: it,
        _score: score(topic, it),
      }));

      adorned.sort((a, b) => {
        if (sortKey === "title")
          return a.item.title.localeCompare(b.item.title);
        if (sortKey === "difficulty")
          return normDiff(a.item.difficulty) - normDiff(b.item.difficulty);
        if (sortKey === "recent")
          return b.item.title.localeCompare(a.item.title); // placeholder
        if (sortKey === "popularity")
          return b.item.title.localeCompare(a.item.title); // placeholder
        return b._score - a._score || a.item.title.localeCompare(b.item.title);
      });

      if (adorned.length) out[topic] = adorned;
    }
    return out;
  }, [
    q,
    selectedCategories,
    selectedTags,
    selectedDifficulties,
    sortKey,
    catalog,
  ]);

  const totalShown = useMemo(
    () =>
      Object.values(filteredGrouped).reduce(
        (acc, arr) => acc + (Array.isArray(arr) ? arr.length : 0),
        0
      ),
    [filteredGrouped]
  );

  // Log search and filter changes
  useEffect(() => {
    if (
      q ||
      selectedCategories.length ||
      selectedTags.length ||
      selectedDifficulties.length ||
      sortKey !== "relevance"
    ) {
      // logger.info(LogCategory.USER_INTERACTION, "Search/filter applied", {
      //   query: q,
      //   categories: selectedCategories,
      //   tags: selectedTags,
      //   difficulties: selectedDifficulties,
      //   sortKey,
      //   resultsCount: totalShown,
      //   totalAlgorithms: Object.values(catalog).reduce(
      //     (acc, items) => acc + items.length,
      //     0
      //   ),
      //   timestamp: new Date().toISOString(),
      // });
    }
  }, [
    q,
    selectedCategories,
    selectedTags,
    selectedDifficulties,
    sortKey,
    totalShown,
    catalog,
  ]);

  const clearFilters = useCallback(() => {
    // logger.info(LogCategory.USER_INTERACTION, "Filters cleared", {
    //   previousFilters: {
    //     query: q,
    //     categories: selectedCategories,
    //     tags: selectedTags,
    //     difficulties: selectedDifficulties,
    //     sortKey,
    //   },
    //   resultsBeforeClearing: totalShown,
    //   timestamp: new Date().toISOString(),
    // });

    setQ("");
    setSelectedCategories([]);
    setSelectedTags([]);
    setSelectedDifficulties([]);
    setSortKey("relevance");
  }, []);

  const handleTagClick = useCallback((tag: string) => {
    // Toggle the tag in selected tags if not already selected, or just select it
    setSelectedTags((prev) => {
      if (prev.includes(tag)) {
        return prev; // Already selected, don't change
      } else {
        return [...prev, tag]; // Add to selection
      }
    });

    // logger.info(LogCategory.USER_INTERACTION, "Tag clicked from card", {
    //   tag,
    //   selectedTags: selectedTags.includes(tag)
    //     ? selectedTags
    //     : [...selectedTags, tag],
    //   timestamp: new Date().toISOString(),
    // });
  }, []);

  // Home page keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't handle shortcuts when typing in inputs
      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        // Allow specific global shortcuts even in inputs
        if (
          !["Escape", "F1"].includes(event.key) &&
          !event.ctrlKey &&
          !event.metaKey
        ) {
          return;
        }
      }

      // Handle home page specific shortcuts
      switch (true) {
        // Filter Management
        case event.ctrlKey && event.shiftKey && event.key === "C":
          event.preventDefault();
          clearFilters();
          break;

        case event.ctrlKey && event.shiftKey && event.key === "F": {
          event.preventDefault();
          // Show featured algorithms
          clearFilters();
          const featuresSection = document.querySelector(
            "[data-about-section]"
          );
          if (featuresSection) {
            scrollToElement(featuresSection as Element, 100);
          }
          break;
        }

        // Difficulty filters
        case event.altKey && event.key === "1":
          event.preventDefault();
          setSelectedDifficulties((prev) =>
            prev.includes("Easy")
              ? prev.filter((d) => d !== "Easy")
              : [...prev, "Easy"]
          );
          break;

        case event.altKey && event.key === "2":
          event.preventDefault();
          setSelectedDifficulties((prev) =>
            prev.includes("Medium")
              ? prev.filter((d) => d !== "Medium")
              : [...prev, "Medium"]
          );
          break;

        case event.altKey && event.key === "3":
          event.preventDefault();
          setSelectedDifficulties((prev) =>
            prev.includes("Hard")
              ? prev.filter((d) => d !== "Hard")
              : [...prev, "Hard"]
          );
          break;

        // Quick category access
        case event.ctrlKey && event.key === "1":
          event.preventDefault();
          setSelectedCategories(["sorting"]);
          setQ("");
          break;

        case event.ctrlKey && event.key === "2":
          event.preventDefault();
          setSelectedCategories(["searching"]);
          setQ("");
          break;

        case event.ctrlKey && event.key === "3":
          event.preventDefault();
          setSelectedCategories(["graphs"]);
          setQ("");
          break;

        case event.ctrlKey && event.key === "4":
          event.preventDefault();
          setSelectedCategories(["trees"]);
          setQ("");
          break;

        case event.ctrlKey && event.key === "0":
          event.preventDefault();
          clearFilters();
          break;

        // Page controls
        case event.ctrlKey && event.key === "h":
          event.preventDefault();
          toggleHeroSection();
          break;

        case event.ctrlKey && event.key === "t":
          event.preventDefault();
          resetOnboardingTour();
          // setShowOnboarding(true);
          break;

        case event.ctrlKey && event.key === "r":
          event.preventDefault();
          // Refresh catalog by clearing filters and scrolling to top
          clearFilters();
          window.scrollTo({ top: 0, behavior: "smooth" });
          break;

        // Page navigation
        case event.key === "PageDown": {
          event.preventDefault();
          const nextSection = document.querySelector("main");
          if (nextSection) {
            scrollToElement(nextSection as Element, 100);
          }
          break;
        }

        case event.key === "PageUp":
          event.preventDefault();
          window.scrollTo({ top: 0, behavior: "smooth" });
          break;

        // Search enhancements
        case event.key === "Enter" && !event.ctrlKey && !event.metaKey: {
          // If search is focused and has content, blur to trigger search
          const searchInput = document.querySelector(
            '[data-testid="search-input"]'
          ) as HTMLInputElement;
          if (
            searchInput &&
            document.activeElement === searchInput &&
            searchInput.value
          ) {
            searchInput.blur();
          }
          break;
        }

        case event.key === "Escape":
          event.preventDefault();
          // Clear search and close any open panels
          if (q) {
            setQ("");
          } else {
            clearFilters();
          }
          // Remove focus from any active element
          if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
          }
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [
    clearFilters,
    toggleHeroSection,
    resetOnboardingTour,
    // setShowOnboarding,
    setSelectedCategories,
    setSelectedDifficulties,
    setQ,
    q,
  ]);

  /*
  const featuredAlgorithms = useMemo(() => {
    const featured = [
      { category: "sorting", slug: "bubble-sort" },
      { category: "searching", slug: "binary-search" },
      { category: "graph", slug: "dijkstra" },
      { category: "trees", slug: "binary-search-tree" },
    ];

    return featured
      .map(({ category, slug }) => {
        const items = catalog[category] || [];
        const item = items.find((i) => i.slug === slug);
        return item ? { topic: category, item } : null;
      })
      .filter(Boolean) as Array<{ topic: string; item: AlgoItem }>;
  }, [catalog]);
  */

  const stats = useMemo(() => {
    const totalAlgorithms = allItems.length;
    const categoriesCount = Object.keys(catalog).length;
    const tagsCount = tagUniverse.length;

    return {
      algorithms: totalAlgorithms,
      categories: categoriesCount,
      tags: tagsCount,
    };
  }, [allItems.length, catalog, tagUniverse.length]);

  return (
    <div className="grid h-screen grid-rows-[auto,1fr] overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      {/* Background sits behind everything */}
      <div
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
        style={{ contain: "layout style" }}
      ></div>
      {/* Header now lives in row 1 and sticks at top */}
      <header
        className={cn(
          "liquid-glass-header sticky top-0 z-50 border-b border-white/10 shadow-sm",
          "backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-900/60",
          "transition-all duration-300"
        )}
      >
        <div className="mx-auto max-w-7xl px-4 pt-0 pb-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Left Section - Brand & Navigation */}
            <div className="flex items-center gap-4 lg:gap-6">
              {/* Logo/Brand */}
              <div className="group mr-2 flex items-center gap-3">
                <div className="text-2xl transition-transform duration-300 group-hover:scale-110 md:text-3xl">
                  🔬
                </div>
                <h1 className="from-primary-600 to-secondary-600 bg-gradient-to-r bg-clip-text text-xl font-black text-transparent md:text-2xl">
                  AlgoLens
                </h1>
              </div>

              {/* Navigation Controls */}
              <div className="hidden items-center gap-2 sm:flex lg:gap-3">
                {/*
                {!showHero && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleHeroSection()}
                    className="text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20"
                    title="Show hero section"
                  >
                    <span className="mr-1.5 text-sm">✨</span>
                    <span className="hidden text-sm lg:inline">Show Hero</span>
                  </Button>
                )}
                */}
                {/* Featured algorithms button */}
                {/*
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFeaturedAlgorithms((prev) => !prev)}
                  className="text-secondary-600 dark:text-secondary-400 hover:bg-secondary-50 dark:hover:bg-secondary-900/20"
                  title={`${showFeaturedAlgorithms ? "Hide" : "Show"} featured algorithms (Ctrl+Shift+F)`}
                  aria-label={`${showFeaturedAlgorithms ? "Hide" : "Show"} featured algorithms section`}
                >
                  <span className="mr-1.5 text-sm">⭐</span>
                  <span className="hidden text-sm lg:inline">
                    {showFeaturedAlgorithms ? "Hide" : "Show"} Featured
                  </span>
                </Button>
                */}
                {/* Quick Tour button */}
                {/*
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    resetOnboardingTour();
                    setShowOnboarding(true);
                  }}
                  className="group text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-white dark:hover:bg-white/20 dark:hover:text-white"
                  title={t("common.quickTour", {
                    defaultValue: "Show quick tour",
                  })}
                >
                  <span className="group-hover:animate-bounce-subtle mr-1.5 text-sm">
                    🎯
                  </span>
                  <span className="hidden text-sm lg:inline">
                    {t("common.quickTour", { defaultValue: "Tour" })}
                  </span>
                </Button>
                */}
              </div>
            </div>

            {/* Right Section - Status & Controls */}
            <div className="flex items-center gap-2 md:gap-3">
              {/* Action Controls */}
              <div className="flex items-center gap-2">
                {/* Mobile Menu Toggle - only show navigation controls on mobile */}
                <div className="sm:hidden">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      // Toggle mobile menu or show a simple inline menu
                      const mobileNav =
                        document.querySelector("[data-mobile-nav]");
                      if (mobileNav) {
                        mobileNav.classList.toggle("hidden");
                      }
                    }}
                    className="p-2 text-slate-700 hover:bg-slate-100 dark:text-white dark:hover:bg-white/20"
                    title="Show menu"
                  >
                    <span className="text-lg">☰</span>
                  </Button>
                </div>

                {/* Mini Search Input */}
                {/*
                <div className="hidden sm:block">
                  <SearchInput
                    value={q}
                    onChange={(value) => setQ(value)}
                    placeholder="Quick search..."
                    className="w-48 text-sm"
                    aria-label="Quick search algorithms"
                    // Enable dropdown with algorithm suggestions
                    searchableItems={searchableItems}
                    enableFuzzySearch={true}
                    showCategories={false}
                    maxDisplayedResults={6}
                    searchOptions={{
                      fuzzyThreshold: 0.3,
                      maxResults: 10,
                      minScore: 0.1,
                      highlightMatches: true,
                      enableSemanticSearch: false, // Disable for faster mini search
                      enablePhoneticSearch: false, // Disable for faster mini search
                    }}
                  />
                </div>
                */}

                {/* Language & Theme Controls */}
                <div className="flex items-center gap-1">
                  {/* {ENABLE_AI_UI && <AISearchHelper />} */}
                  {/* <LanguageSwitcher variant="dropdown" /> */}
                  {/* <ThemeToggle data-tour="theme-toggle" /> */}
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          <div
            data-mobile-nav
            className="mt-3 hidden border-t border-white/10 pt-3 sm:hidden"
          >
            <div className="flex flex-wrap items-center gap-2">
              {/* Show Hero button */}
              {/*
              {!showHero && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    toggleHeroSection();
                    // Hide mobile menu
                    document
                      .querySelector("[data-mobile-nav]")
                      ?.classList.add("hidden");
                  }}
                  className="text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20"
                  title="Show hero section"
                >
                  <span className="mr-1.5 text-sm">✨</span>
                  <span className="text-sm">Show Hero</span>
                </Button>
              )}
              */}
              {/* Featured algorithms mobile button */}
              {/*
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowFeaturedAlgorithms((prev) => !prev);
                  // Hide mobile menu
                  document
                    .querySelector("[data-mobile-nav]")
                    ?.classList.add("hidden");
                }}
                className="text-secondary-600 dark:text-secondary-400 hover:bg-secondary-50 dark:hover:bg-secondary-900/20"
                title={`${showFeaturedAlgorithms ? "Hide" : "Show"} featured algorithms (Ctrl+Shift+F)`}
              >
                <span className="mr-1.5 text-sm">⭐</span>
                <span className="text-sm">
                  {showFeaturedAlgorithms ? "Hide" : "Show"} Featured
                </span>
              </Button>
              */}
              {/* Quick Tour mobile button */}
              {/*
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  resetOnboardingTour();
                  // setShowOnboarding(true);
                  // Hide mobile menu
                  document
                    .querySelector("[data-mobile-nav]")
                    ?.classList.add("hidden");
                }}
                className="group text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-white dark:hover:bg-white/20 dark:hover:text-white"
                title={t("common.quickTour", {
                  defaultValue: "Show quick tour",
                })}
              >
                <span className="group-hover:animate-bounce-subtle mr-1.5 text-sm">
                  🎯
                </span>
                <span className="text-sm">
                  {t("common.quickTour", { defaultValue: "Tour" })}
                </span>
              </Button>
              */}
            </div>
          </div>
        </div>
      </header>
      {/* Row 2: the only scrollable area */}
      <div className="relative overflow-y-auto">
        {/* Enhanced Hero Section with better visuals */}
        {/*
        {showHero && (
          <section
            data-tour="hero-section"
            className="relative flex min-h-[100vh] items-center overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"
          >
            {/* Static Background */
        /*}
            <div className="absolute inset-0">
              {/* Single gradient overlay */
        /*}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/15 to-pink-900/20"></div>
            </div>

            {/* Hero Content */
        /*}
            <div className="relative z-10 mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
              {/* Hero Header */
        /*}
              <div className="mb-12 space-y-8">
                {/* Enhanced Title with better visual effects */
        /*}
                <div className="space-y-4">
                  <h1 className="text-5xl leading-tight font-extrabold tracking-tight text-gray-900 sm:text-6xl md:text-7xl lg:text-8xl dark:text-white">
                    <span className="relative inline-block">
                      <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent drop-shadow-lg">
                        AlgoLens
                      </span>
                    </span>
                  </h1>
                  {/* Subtitle tagline */
        /*}
                  <p className="text-lg font-medium text-gray-700 opacity-90 sm:text-xl md:text-2xl dark:text-gray-200">
                    Visualize • Learn • Master
                  </p>
                </div>

                <p className="mx-auto max-w-3xl text-xl leading-relaxed text-gray-600 sm:text-2xl md:text-3xl dark:text-gray-300">
                  {t("hero.subtitle")}
                </p>
                <div className="mx-auto max-w-4xl">
                  <p className="text-lg leading-relaxed text-gray-500 sm:text-xl dark:text-gray-400">
                    {t("hero.description")}
                  </p>
                </div>
              </div>

              {/* Enhanced CTA Buttons */
        /*}
              <div className="flex flex-col items-center justify-center gap-6 sm:flex-row sm:gap-8">
                <Button
                  onClick={() => scrollToElement("search-container")}
                  size="lg"
                  className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 px-10 py-5 text-lg font-semibold text-white shadow-2xl transition-all duration-300 hover:scale-105"
                >
                  <span className="relative z-10 flex items-center gap-3">
                    <span className="text-2xl">🚀</span>
                    <span>{t("hero.cta.explore")}</span>
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </span>
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => toggleHeroSection()}
                  className="group relative overflow-hidden rounded-2xl border-2 border-white/30 bg-white/10 px-10 py-5 text-lg font-semibold text-white transition-all duration-300 hover:scale-105 hover:border-white/50 hover:bg-white/20"
                >
                  <span className="flex items-center gap-3">
                    <span className="text-2xl">✨</span>
                    <span>{t("hero.cta.skip")}</span>
                  </span>
                </Button>
              </div>

              {/* Enhanced Stats Section */
        /*}
              <div className="mt-20 rounded-3xl border border-white/20 bg-white/5 p-8">
                <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 lg:gap-8">
                  <div className="group text-center transition-transform hover:scale-105">
                    <div className="mb-3 flex justify-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500/20 to-blue-600/30">
                        <span className="text-2xl">📊</span>
                      </div>
                    </div>
                    <div className="mb-2 text-3xl font-bold text-blue-400 transition-colors group-hover:text-blue-300 sm:text-4xl">
                      {allItems.length}
                    </div>
                    <div className="text-sm font-medium text-gray-300 opacity-80">
                      {t("hero.stats.algorithms")}
                    </div>
                  </div>

                  <div className="group text-center transition-transform hover:scale-105">
                    <div className="mb-3 flex justify-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-500/20 to-purple-600/30">
                        <span className="text-2xl">🗂️</span>
                      </div>
                    </div>
                    <div className="mb-2 text-3xl font-bold text-purple-400 transition-colors group-hover:text-purple-300 sm:text-4xl">
                      {topics.length}
                    </div>
                    <div className="text-sm font-medium text-gray-300 opacity-80">
                      {t("hero.stats.categories")}
                    </div>
                  </div>

                  <div className="group text-center transition-transform hover:scale-105">
                    <div className="mb-3 flex justify-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-pink-500/20 to-pink-600/30">
                        <span className="text-2xl">🏷️</span>
                      </div>
                    </div>
                    <div className="mb-2 text-3xl font-bold text-pink-400 transition-colors group-hover:text-pink-300 sm:text-4xl">
                      {tagUniverse.length}
                    </div>
                    <div className="text-sm font-medium text-gray-300 opacity-80">
                      {t("hero.stats.topics")}
                    </div>
                  </div>

                  <div className="group text-center transition-transform hover:scale-105">
                    <div className="mb-3 flex justify-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-600/30">
                        <span className="text-2xl">🌟</span>
                      </div>
                    </div>
                    <div className="mb-2 text-3xl font-bold text-emerald-400 transition-colors group-hover:text-emerald-300 sm:text-4xl">
                      ∞
                    </div>
                    <div className="text-sm font-medium text-gray-300 opacity-80">
                      {t("hero.stats.possibilities")}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Close Button */
        /*}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleHeroSection()}
              className="group absolute top-6 right-6 z-20 rounded-full border border-white/20 bg-white/10 p-3 text-white/70 backdrop-blur-md transition-all duration-300 hover:scale-110 hover:border-white/40 hover:bg-white/20 hover:text-white"
              aria-label="Close hero section"
            >
              <X className="h-6 w-6 transition-transform group-hover:rotate-90" />
            </Button>
          </section>
        )}
        */}

        {/* Enhanced Filter Bar */}
        <FilterBar
          data-tour="search-bar"
          q={q}
          setQ={setQ}
          categories={topics}
          selectedCategories={selectedCategories}
          setSelectedCategories={setSelectedCategories}
          tags={tagUniverse}
          selectedTags={selectedTags}
          setSelectedTags={setSelectedTags}
          difficulties={difficulties}
          selectedDifficulties={selectedDifficulties}
          setSelectedDifficulties={setSelectedDifficulties}
          sortKey={sortKey}
          setSortKey={setSortKey}
          onClear={clearFilters}
          catalog={metaCatalog}
          showTagsOnCards={showTagsOnCards}
          setShowTagsOnCards={setShowTagsOnCards}
          onTagClick={handleTagClick}
        />

        {/* AI Recommendation Panel - Show when no search/filters active */}
        {/*
        {ENABLE_AI_UI &&
          !q &&
          selectedCategories.length === 0 &&
          selectedTags.length === 0 &&
          selectedDifficulties.length === 0 && (
            <section className="px-4 py-8">
              <div className="mx-auto max-w-7xl">
                <AIRecommendationPanel
                  onAlgorithmSelect={(slug) => {
                    setQ(slug);
                    setTimeout(() => {
                      document
                        .getElementById("search-container")
                        ?.scrollIntoView({ behavior: "smooth" });
                    }, 100);
                  }}
                />
              </div>
            </section>
          )}
        */}

        {/* Main Content */}

        {/* Main Content */}
        <main className="px-4 py-8">
          <div className="mx-auto max-w-7xl">
            {Object.keys(filteredGrouped).length === 0 ? (
              <div className="animate-fade-in-up py-16 text-center">
                <div className="relative mb-8">
                  {/* Animated Search Illustration */}
                  <div className="animate-bounce-subtle mb-4 text-8xl">🔍</div>
                  <div className="animate-float animation-delay-500 absolute -top-2 -right-2 text-2xl">
                    ✨
                  </div>
                  <div className="animate-float animation-delay-1000 absolute -bottom-2 -left-2 text-xl">
                    💫
                  </div>
                </div>

                <div className="mx-auto mb-8 max-w-md">
                  <h3 className="mb-4 text-2xl font-bold text-slate-900 md:text-3xl dark:text-slate-100">
                    No algorithms found
                  </h3>

                  <p className="mb-6 leading-relaxed text-slate-600 dark:text-slate-400">
                    Don't worry! Try adjusting your search terms or filters to
                    discover the perfect algorithm.
                  </p>

                  {/* Helpful suggestions */}
                  <div className="liquid-glass-card mb-6 p-4">
                    <p className="mb-3 text-sm font-medium text-slate-600 dark:text-slate-400">
                      Try searching for algorithms, tags, or concepts:
                    </p>
                    <div className="space-y-2">
                      <div className="flex flex-wrap justify-center gap-2">
                        {["sorting", "search", "graph", "tree", "dynamic"].map(
                          (suggestion) => (
                            <button
                              key={suggestion}
                              onClick={() => setQ(suggestion)}
                              className="liquid-glass-filter hover:text-primary-600 dark:hover:text-primary-400 px-3 py-1.5 text-xs font-medium text-slate-700 transition-all duration-200 hover:scale-105 dark:text-slate-300"
                            >
                              {suggestion}
                            </button>
                          )
                        )}
                      </div>
                      <div className="flex flex-wrap justify-center gap-2">
                        {[
                          "comparison",
                          "in-place",
                          "stable",
                          "logarithmic",
                          "divide-conquer",
                          "recursive",
                        ].map((suggestion) => (
                          <button
                            key={suggestion}
                            onClick={() => setQ(suggestion)}
                            className="liquid-glass-filter hover:text-secondary-600 dark:hover:text-secondary-400 px-3 py-1.5 text-xs font-medium text-slate-600 transition-all duration-200 hover:scale-105 dark:text-slate-400"
                          >
                            #{suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-center gap-4 sm:flex-row">
                  <Button
                    onClick={clearFilters}
                    variant="primary"
                    className="from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 bg-gradient-to-r shadow-lg transition-all duration-300 hover:shadow-xl"
                  >
                    <span className="mr-2">✨</span>
                    Clear All Filters
                  </Button>

                  <Button
                    onClick={() => {
                      clearFilters();
                      const featuresSection = document.querySelector(
                        "[data-about-section]"
                      );
                      if (featuresSection) {
                        scrollToElement(featuresSection as Element, 100);
                      }
                    }}
                    variant="outline"
                    className="hover:border-primary-400 dark:hover:border-primary-500 border-slate-300 dark:border-slate-600"
                  >
                    <span className="mr-2">🎯</span>
                    View Featured
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-16">
                {Object.entries(filteredGrouped).map(([topic, rows]) => (
                  <section key={topic} className="animate-fade-in-up">
                    <div className="group mb-8 flex items-center gap-4">
                      <div className="cursor-default text-3xl transition-transform duration-300 group-hover:scale-110">
                        {TOPIC_META[topic]?.icon ?? "📘"}
                      </div>
                      <div className="flex-1">
                        <h3 className="group-hover:text-primary-600 dark:group-hover:text-primary-400 text-2xl font-black text-slate-900 transition-colors duration-300 md:text-3xl dark:text-slate-100">
                          {pretty(topic)}
                        </h3>
                        <div className="from-primary-500 to-secondary-500 mt-1 h-0.5 w-0 bg-gradient-to-r transition-all duration-500 group-hover:w-24"></div>
                      </div>
                      <div className="liquid-glass-card px-4 py-2 text-sm font-bold text-slate-700 shadow-sm dark:text-slate-300">
                        {rows.length} algorithms
                      </div>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {rows.map(({ item }, index) => (
                        <div
                          key={`${topic}/${item.slug}`}
                          className="group animate-fade-in-up"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <AlgoCard
                            topic={topic}
                            item={item}
                            titleMap={titleMap}
                            accent={TOPIC_META[topic]?.color}
                            showTags={showTagsOnCards}
                            onTagClick={handleTagClick}
                            data-tour={
                              index === 0 ? "algorithm-card" : undefined
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            )}
          </div>
        </main>

        {/* Enhanced Footer */}
        <footer className="liquid-glass-section relative mt-16 overflow-hidden border-t border-white/20 dark:border-white/10">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZm9vdGVyR3JpZCIgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIxIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2Zvb3RlckdyaWQpIiAvPjwvc3ZnPg==')] opacity-30"></div>

          {/* Gradient Overlays */}
          <div className="from-primary-600/10 absolute top-0 left-1/4 h-32 w-32 rounded-full bg-gradient-to-r to-transparent blur-3xl"></div>
          <div className="from-secondary-600/10 absolute right-1/4 bottom-0 h-40 w-40 rounded-full bg-gradient-to-r to-transparent blur-3xl"></div>

          <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-3">
              {/* Brand Section */}
              <div className="text-center md:text-left">
                <div className="mb-4 flex items-center justify-center gap-3 md:justify-start">
                  <span className="text-3xl">🔬</span>
                  <h3 className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-xl font-black text-transparent">
                    AlgoLens
                  </h3>
                </div>
                <p className="mx-auto max-w-xs text-sm leading-relaxed text-slate-400 md:mx-0">
                  Making algorithms and data structures accessible through
                  interactive visualizations and hands-on learning.
                </p>
              </div>

              {/* Features Section */}
              <div className="text-center">
                <h4 className="mb-4 font-semibold text-white">What We Offer</h4>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li className="flex items-center justify-center gap-2">
                    <span className="text-primary-400">📊</span>
                    Interactive Visualizations
                  </li>
                  <li className="flex items-center justify-center gap-2">
                    <span className="text-secondary-400">⚡</span>
                    Real-time Performance Analysis
                  </li>
                  <li className="flex items-center justify-center gap-2">
                    <span className="text-green-400">🎯</span>
                    Step-by-step Learning
                  </li>
                  <li className="flex items-center justify-center gap-2">
                    <span className="text-purple-400">🌟</span>
                    Multiple Programming Languages
                  </li>
                </ul>
              </div>

              {/* Stats Section */}
              <div className="text-center md:text-right">
                <h4 className="mb-4 font-semibold text-white">
                  Learning Stats
                </h4>
                <div className="space-y-3">
                  <div className="rounded-lg border border-slate-700/50 bg-slate-800/50 p-3 backdrop-blur-sm">
                    <div className="text-primary-400 text-2xl font-bold">
                      {stats.algorithms}
                    </div>
                    <div className="text-xs tracking-wider text-slate-400 uppercase">
                      Algorithms
                    </div>
                  </div>
                  <div className="rounded-lg border border-slate-700/50 bg-slate-800/50 p-3 backdrop-blur-sm">
                    <div className="text-secondary-400 text-2xl font-bold">
                      {stats.categories}
                    </div>
                    <div className="text-xs tracking-wider text-slate-400 uppercase">
                      Categories
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Section */}
            <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-700/50 pt-8 sm:flex-row">
              <div className="text-center text-sm text-slate-400 sm:text-left">
                <p className="flex items-center justify-center gap-2 sm:justify-start">
                  Built with
                  <span className="animate-pulse text-red-400">❤️</span>
                  for learning algorithms and data structures
                </p>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    resetOnboardingTour();
                    // setShowOnboarding(true);
                  }}
                  className="flex items-center gap-2 text-sm text-slate-400 transition-colors duration-200 hover:text-white"
                >
                  <span>🎯</span>
                  Take the Tour
                </button>

                {/*
                <button
                  onClick={() => toggleHeroSection()}
                  className="flex items-center gap-2 text-sm text-slate-400 transition-colors duration-200 hover:text-white"
                >
                  <span>✨</span>
                  {showHero ? "Hide Hero" : "Show Hero"}
                </button>

                <button
                  onClick={() => setShowFeaturedAlgorithms((prev) => !prev)}
                  className="flex items-center gap-2 text-sm text-slate-400 transition-colors duration-200 hover:text-white"
                  title={`${showFeaturedAlgorithms ? "Hide" : "Show"} featured algorithms (Ctrl+Shift+F)`}
                  aria-label={`${showFeaturedAlgorithms ? "Hide" : "Show"} featured algorithms section`}
                >
                  <span>⭐</span>
                  {showFeaturedAlgorithms ? "Hide Featured" : "Show Featured"}
                </button>
                */}
              </div>
            </div>
          </div>
        </footer>

        {/* Debug Panel (Dev Mode) */}
        {/* {import.meta.env.DEV && (
          <DebugPanel
            // isOpen={showDebugPanel}
            // onClose={() => {
            //   // logger.info(LogCategory.USER_INTERACTION, "Debug panel closed", {
            //   //   timestamp: new Date().toISOString(),
            //   // });
            //   setShowDebugPanel(false);
            // }}
          />
        )} */}

        {/* Performance Monitor (Dev Mode) */}
        {/* {import.meta.env.DEV && <performanceMonitor.PerformanceMonitor />} */}

        {/* Onboarding Tour */}
        {/*
        <OnboardingTour
          isOpen={showOnboarding}
          onClose={() => setShowOnboarding(false)}
          onComplete={() => {
            markOnboardingTourSeen();
            setShowOnboarding(false);
          }}
          tourType="homepage"
        />
        */}
      </div>
      {/* end scroll area */}
      {/* Keep "fixed" floating buttons outside the scroll area so they anchor to the viewport */}
      {/* Floating Action Buttons - Fixed to viewport */}
      {/* Performance Monitor Button */}
      {/*
      {import.meta.env.DEV && (
        <div className="fixed right-6 bottom-[100px] z-50">
          <div className="relative">
            <button
              className="group flex min-w-[3rem] transform items-center gap-3 overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-r from-emerald-600 to-teal-600 p-4 text-white shadow-xl backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:from-emerald-700 hover:to-teal-700 hover:shadow-2xl active:scale-95"
              title="Performance Monitor (Dev) - Ctrl+Shift+P"
              onClick={performanceMonitor.toggle}
            >
              ⚡
              <span className="max-w-0 overflow-hidden text-sm font-medium whitespace-nowrap opacity-0 transition-all duration-300 group-hover:max-w-[10rem] group-hover:opacity-100">
                Performance
              </span>
              <div className="absolute -top-1 -right-1 h-3 w-3 animate-pulse rounded-full bg-emerald-400"></div>
            </button>
          </div>
        </div>
      )}
      */}
      {/* Keyboard Shortcuts Button - Bottom position */}
      {/* <KeyboardShortcutsButton /> */}
      {/* Debug Tools (Dev Mode) */}
      {/*
      {import.meta.env.DEV && (
        <>
          <div className="fixed right-6 bottom-[160px] z-50">
            <div className="relative">
              <button
                className="group flex min-w-[3rem] transform items-center gap-3 overflow-hidden rounded-2xl border border-red-500/20 bg-gradient-to-r from-red-600 to-pink-600 p-4 text-white shadow-xl backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:from-red-700 hover:to-pink-700 hover:shadow-2xl active:scale-95"
                title="Debug Panel (Dev) - Ctrl+Shift+D"
                onClick={() => {
                  // logger.info(
                  //   LogCategory.USER_INTERACTION,
                  //   "Debug panel opened via floating button",
                  //   {
                  //     method: "floating_button_click",
                  //     timestamp: new Date().toISOString(),
                  //   }
                  // );
                  // setShowDebugPanel(true);
                }}
              >
                🐛
                <span className="max-w-0 overflow-hidden text-sm font-medium whitespace-nowrap opacity-0 transition-all duration-300 group-hover:max-w-[10rem] group-hover:opacity-100">
                  Debug
                </span>
                <div className="absolute -top-1 -right-1 h-3 w-3 animate-pulse rounded-full bg-red-400"></div>
              </button>
            </div>
          </div>
        </>
      )}
      */}
    </div>
  );
}
