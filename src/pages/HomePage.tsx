import { X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import DebugPanel from "@/components/debug/DebugPanel";
import { usePerformanceMonitor } from "@/components/debug/PerformanceMonitor";
import { AIRecommendationPanel } from "@/components/home/AIRecommendationPanel";
import { AISearchHelper } from "@/components/home/AISearchHelper";
import AlgoCard, { AlgoItem } from "@/components/home/AlgoCard";
import FilterBar from "@/components/home/FilterBar";
import OnboardingTour from "@/components/onboarding/OnboardingTour";
import { KeyboardShortcutsButton } from "@/components/panels/KeyboardShortcutsPanel";
import { AlgorithmIcon } from "@/components/ui/AlgorithmIcon";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import FloatingParticles from "@/components/ui/FloatingParticles";
import { SearchInput } from "@/components/ui/SearchInput";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { ENABLE_AI_UI } from "@/config/featureFlags";
import { loadAllTopics } from "@/engine/registry";
import { usePreferences } from "@/hooks/usePreferences";
import { LanguageSwitcher, useI18n } from "@/i18n";
import { LogCategory, logger, useComponentLogger } from "@/services/monitoring";
import type { AlgoMeta } from "@/types/algorithms";
import {
  cn,
  createSearchableFromAlgoMeta,
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
  isLoading: boolean;
} {
  const [catalog, setCatalog] = useState<Record<string, AlgoItem[]>>({});
  const [metaCatalog, setMetaCatalog] = useState<Record<string, AlgoMeta[]>>(
    {}
  );
  const [isLoading, setIsLoading] = useState(true);

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
      } finally {
        setIsLoading(false);
      }
    };

    // Use idle callback for non-critical loading
    runWhenIdle(loadCatalog);
  }, []);

  return { catalog, metaCatalog, isLoading };
}

export default function HomePage() {
  const { t } = useI18n();
  const componentLogger = useComponentLogger("HomePage");
  const navigate = useNavigate();
  const { catalog, metaCatalog } = useSafeCatalog();
  const {
    shouldShowOnboardingTour,
    resetOnboardingTour,
    markOnboardingTourSeen,
  } = usePreferences();

  // Log homepage access
  useEffect(() => {
    logger.info(LogCategory.ROUTER, "HomePage accessed");
    componentLogger.mount();

    // Log catalog contents
    const catalogStats = Object.entries(catalog).map(([topic, items]) => ({
      topic,
      count: items.length,
    }));
    logger.debug(LogCategory.GENERAL, "Algorithm catalog loaded", {
      catalogStats,
      totalAlgorithms: Object.values(catalog).reduce(
        (acc, items) => acc + items.length,
        0
      ),
      timestamp: new Date().toISOString(),
    });

    return () => componentLogger.unmount();
  }, [catalog, componentLogger]);

  const [q, setQ] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>(
    []
  );
  const [sortKey, setSortKey] = useState<SortKey>("relevance");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showTagsOnCards, setShowTagsOnCards] = useState(true);
  const [showFeaturedAlgorithms, setShowFeaturedAlgorithms] = useState(true);
  const [showDebugPanel, setShowDebugPanel] = useState(false);

  // Performance Monitor
  const performanceMonitor = usePerformanceMonitor();

  // Hero section visibility from preferences
  const { preferences, toggleHeroSection } = usePreferences();
  const showHero = preferences.showHeroSection;

  // Check if this is a first-time user
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

  // Keyboard shortcut for toggling featured algorithms
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
          logger.info(
            LogCategory.USER_INTERACTION,
            "Featured algorithms toggled via keyboard",
            {
              showFeatured: !showFeaturedAlgorithms,
              source: "keyboard_shortcut",
              shortcut: "Ctrl+Shift+F",
              timestamp: new Date().toISOString(),
            }
          );
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showFeaturedAlgorithms]);

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
          setShowDebugPanel((prev) => {
            const newState = !prev;
            logger.info(
              LogCategory.USER_INTERACTION,
              `Debug panel ${newState ? "opened" : "closed"} via keyboard shortcut`,
              {
                method: "keyboard_shortcut",
                key: "Ctrl+Shift+D",
                timestamp: new Date().toISOString(),
              }
            );
            return newState;
          });
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
  const searchableItems = useMemo(() => {
    const allAlgorithms = Object.values(metaCatalog).flat();
    return createSearchableFromAlgoMeta(allAlgorithms);
  }, [metaCatalog]);

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
      logger.info(LogCategory.USER_INTERACTION, "Search/filter applied", {
        query: q,
        categories: selectedCategories,
        tags: selectedTags,
        difficulties: selectedDifficulties,
        sortKey,
        resultsCount: totalShown,
        totalAlgorithms: Object.values(catalog).reduce(
          (acc, items) => acc + items.length,
          0
        ),
        timestamp: new Date().toISOString(),
      });
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
    logger.info(LogCategory.USER_INTERACTION, "Filters cleared", {
      previousFilters: {
        query: q,
        categories: selectedCategories,
        tags: selectedTags,
        difficulties: selectedDifficulties,
        sortKey,
      },
      resultsBeforeClearing: totalShown,
      timestamp: new Date().toISOString(),
    });

    setQ("");
    setSelectedCategories([]);
    setSelectedTags([]);
    setSelectedDifficulties([]);
    setSortKey("relevance");
  }, [
    q,
    selectedCategories,
    selectedTags,
    selectedDifficulties,
    sortKey,
    totalShown,
  ]);

  const handleTagClick = useCallback(
    (tag: string) => {
      // Toggle the tag in selected tags if not already selected, or just select it
      setSelectedTags((prev) => {
        if (prev.includes(tag)) {
          return prev; // Already selected, don't change
        } else {
          return [...prev, tag]; // Add to selection
        }
      });

      logger.info(LogCategory.USER_INTERACTION, "Tag clicked from card", {
        tag,
        selectedTags: selectedTags.includes(tag)
          ? selectedTags
          : [...selectedTags, tag],
        timestamp: new Date().toISOString(),
      });
    },
    [selectedTags]
  );

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
          setShowOnboarding(true);
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
    setShowOnboarding,
    setSelectedCategories,
    setSelectedDifficulties,
    setQ,
    q,
  ]);

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
      >
        <div
          className="liquid-glass-hero animate-float absolute rounded-full opacity-30"
          style={{
            top: "25%",
            left: "25%",
            width: "384px",
            height: "384px",
            willChange: "transform",
          }}
        ></div>
        <div
          className="liquid-glass-hero animate-float absolute rounded-full opacity-20"
          style={{
            right: "25%",
            bottom: "25%",
            width: "288px",
            height: "288px",
            animationDelay: "2s",
            willChange: "transform",
          }}
        ></div>
        <div
          className="liquid-glass-hero animate-float absolute rounded-full opacity-25"
          style={{
            top: "75%",
            left: "75%",
            width: "192px",
            height: "192px",
            animationDelay: "4s",
            willChange: "transform",
          }}
        ></div>
      </div>
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

                {/* Language & Theme Controls */}
                <div className="flex items-center gap-1">
                  {ENABLE_AI_UI && <AISearchHelper />}
                  <LanguageSwitcher variant="dropdown" />
                  <ThemeToggle data-tour="theme-toggle" />
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
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  resetOnboardingTour();
                  setShowOnboarding(true);
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
            </div>
          </div>
        </div>
      </header>
      {/* Row 2: the only scrollable area */}
      <div className="relative overflow-y-auto">
        {/* Enhanced Hero Section with better visuals */}
        {showHero && (
          <section
            data-tour="hero-section"
            className="liquid-glass-hero relative flex min-h-[100vh] items-center overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"
          >
            {/* Enhanced Animated Background */}
            <div className="absolute inset-0">
              {/* Floating Particles */}
              <FloatingParticles particleCount={80} />

              {/* Multi-layered Gradient Overlays */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 via-purple-900/20 to-pink-900/30"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>

              {/* Enhanced Animated Background Pattern */}
              <div className="animate-pulse-soft absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDYwIDAgTCAwIDAgMCA2MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDgpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiIC8+PC9zdmc+')] opacity-40"></div>

              {/* Enhanced Glowing Orbs with better colors and sizes */}
              <div className="animate-float animation-delay-1000 absolute top-1/4 left-1/4 h-40 w-40 rounded-full bg-gradient-to-r from-blue-500/30 to-cyan-500/20 blur-3xl"></div>
              <div className="animate-float animation-delay-2000 absolute right-1/4 bottom-1/3 h-48 w-48 rounded-full bg-gradient-to-r from-purple-500/25 to-pink-500/30 blur-3xl"></div>
              <div className="animate-float animation-delay-3500 absolute top-1/3 right-1/3 h-36 w-36 rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/25 blur-3xl"></div>

              {/* Additional depth orbs */}
              <div className="animate-float animation-delay-4000 absolute bottom-1/4 left-1/3 h-32 w-32 rounded-full bg-gradient-to-r from-orange-500/20 to-red-500/15 blur-2xl"></div>
              <div className="animate-float animation-delay-1500 absolute top-1/2 left-1/2 h-28 w-28 rounded-full bg-gradient-to-r from-indigo-500/25 to-purple-500/20 blur-2xl"></div>

              {/* Enhanced Algorithm-themed floating icons */}
              <div className="animate-float animation-delay-500 absolute top-20 left-20 hidden sm:block">
                <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                  <AlgorithmIcon
                    variant="sorting"
                    className="h-12 w-12 text-blue-400/60"
                  />
                </div>
              </div>
              <div className="animate-float animation-delay-1500 absolute top-32 right-32 hidden md:block">
                <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                  <AlgorithmIcon
                    variant="graph"
                    className="h-16 w-16 text-purple-400/60"
                  />
                </div>
              </div>
              <div className="animate-float animation-delay-3000 absolute bottom-32 left-1/3 hidden lg:block">
                <div className="rounded-2xl bg-white/10 p-3 backdrop-blur-sm">
                  <AlgorithmIcon
                    variant="array"
                    className="h-10 w-10 text-pink-400/60"
                  />
                </div>
              </div>
              <div className="animate-float animation-delay-2500 absolute top-2/3 right-20 hidden lg:block">
                <div className="rounded-2xl bg-white/10 p-3 backdrop-blur-sm">
                  <AlgorithmIcon
                    variant="tree"
                    className="h-12 w-12 text-emerald-400/60"
                  />
                </div>
              </div>
            </div>

            {/* Hero Content */}
            <div className="relative z-10 mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
              {/* Hero Header */}
              <div className="mb-12 space-y-8">
                {/* Enhanced Title with better visual effects */}
                <div className="animate-fade-in-up space-y-4">
                  <h1 className="text-5xl leading-tight font-extrabold tracking-tight text-gray-900 sm:text-6xl md:text-7xl lg:text-8xl dark:text-white">
                    <span className="relative inline-block">
                      <span className="animate-gradient-x bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent drop-shadow-lg">
                        AlgoLens
                      </span>
                      {/* Glowing underline effect */}
                      <div className="absolute -bottom-2 left-1/2 h-1 w-24 -translate-x-1/2 animate-pulse rounded-full bg-gradient-to-r from-blue-500 to-purple-500 opacity-60 blur-sm md:w-32"></div>
                    </span>
                  </h1>
                  {/* Subtitle tagline */}
                  <p className="text-lg font-medium text-gray-700 opacity-90 sm:text-xl md:text-2xl dark:text-gray-200">
                    Visualize • Learn • Master
                  </p>
                </div>

                <p className="animate-fade-in-up animation-delay-300 mx-auto max-w-3xl text-xl leading-relaxed text-gray-600 sm:text-2xl md:text-3xl dark:text-gray-300">
                  {t("hero.subtitle")}
                </p>
                <div className="animate-fade-in-up animation-delay-600 mx-auto max-w-4xl">
                  <p className="text-lg leading-relaxed text-gray-500 sm:text-xl dark:text-gray-400">
                    {t("hero.description")}
                  </p>
                </div>
              </div>

              {/* Enhanced CTA Buttons */}
              <div className="animate-fade-in-up animation-delay-900 flex flex-col items-center justify-center gap-6 sm:flex-row sm:gap-8">
                <Button
                  onClick={() => scrollToElement("search-container")}
                  size="lg"
                  className="group hover:shadow-3xl relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 px-10 py-5 text-lg font-semibold text-white shadow-2xl transition-all duration-300 hover:scale-110 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700"
                >
                  <span className="relative z-10 flex items-center gap-3">
                    <span className="text-2xl group-hover:animate-bounce">
                      🚀
                    </span>
                    <span>{t("hero.cta.explore")}</span>
                    <svg
                      className="h-5 w-5 transition-transform group-hover:translate-x-1"
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
                  {/* Animated shimmer effect */}
                  <div className="group-hover:animate-shimmer absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100"></div>
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => toggleHeroSection()}
                  className="group relative overflow-hidden rounded-2xl border-2 border-white/30 bg-white/10 px-10 py-5 text-lg font-semibold text-white backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-white/50 hover:bg-white/20 hover:shadow-xl"
                >
                  <span className="flex items-center gap-3">
                    <span className="text-2xl group-hover:animate-pulse">
                      ✨
                    </span>
                    <span>{t("hero.cta.skip")}</span>
                  </span>
                  {/* Subtle glow effect */}
                  <div className="absolute inset-0 rounded-2xl bg-white/5 opacity-0 transition-opacity group-hover:opacity-100"></div>
                </Button>
              </div>

              {/* Enhanced Stats Section */}
              <div className="animate-fade-in-up animation-delay-1200 mt-20 rounded-3xl border border-white/20 bg-white/5 p-8 backdrop-blur-md">
                <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 lg:gap-8">
                  <div className="group text-center transition-transform hover:scale-105">
                    <div className="mb-3 flex justify-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500/20 to-blue-600/30 backdrop-blur-sm">
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
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-500/20 to-purple-600/30 backdrop-blur-sm">
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
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-pink-500/20 to-pink-600/30 backdrop-blur-sm">
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
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-600/30 backdrop-blur-sm">
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

            {/* Enhanced Close Button */}
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

        {/* Enhanced Featured Algorithms */}
        {!q &&
          selectedCategories.length === 0 &&
          selectedTags.length === 0 &&
          selectedDifficulties.length === 0 &&
          showFeaturedAlgorithms && (
            <section className="liquid-glass-section relative px-4 py-12">
              <div className="mx-auto max-w-7xl">
                <div
                  className="animate-fade-in-up mb-12 text-center"
                  data-about-section
                >
                  {/* Close button in top-right corner */}
                  <button
                    onClick={() => setShowFeaturedAlgorithms(false)}
                    className="absolute top-4 right-4 rounded-full p-2 text-slate-400 transition-all duration-200 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                    title="Hide featured algorithms (Ctrl+Shift+F to show again)"
                    aria-label="Hide featured algorithms section"
                  >
                    <X className="h-5 w-5" />
                  </button>

                  <div className="liquid-glass-filter mb-6 inline-flex items-center gap-3 px-4 py-2">
                    <span className="animate-bounce-subtle text-2xl">✨</span>
                    <span className="from-primary-600 to-secondary-600 bg-gradient-to-r bg-clip-text text-lg font-semibold text-transparent">
                      Featured Algorithms
                    </span>
                  </div>

                  <h3 className="mb-6 text-3xl leading-tight font-black text-slate-900 md:text-4xl dark:text-slate-100">
                    Start Your Journey with
                    <span className="from-primary-600 via-secondary-600 to-primary-700 bg-gradient-to-r bg-clip-text text-transparent">
                      {" "}
                      Popular Algorithms
                    </span>
                  </h3>

                  <p className="mx-auto mb-8 max-w-3xl text-lg leading-relaxed text-slate-600 dark:text-slate-400">
                    Discover the fundamental algorithms that every developer
                    should master. Each one comes with
                    <span className="text-primary-600 dark:text-primary-400 font-semibold">
                      {" "}
                      interactive visualizations
                    </span>{" "}
                    and
                    <span className="text-secondary-600 dark:text-secondary-400 font-semibold">
                      {" "}
                      real-time analysis
                    </span>
                    .
                  </p>

                  {/* Enhanced Value Proposition Pills */}
                  <div className="flex flex-wrap justify-center gap-4 text-sm">
                    <div className="group liquid-glass-filter text-primary-700 dark:text-primary-300 cursor-default px-4 py-2 transition-all duration-300 hover:scale-105">
                      <span className="group-hover:animate-bounce-subtle mr-2">
                        🚀
                      </span>
                      Interactive Learning
                    </div>
                    <div className="group liquid-glass-filter cursor-default px-4 py-2 text-green-700 transition-all duration-300 hover:scale-105 dark:text-green-300">
                      <span className="group-hover:animate-bounce-subtle mr-2">
                        📊
                      </span>
                      Step-by-Step Visualization
                    </div>
                    <div className="group liquid-glass-filter cursor-default px-4 py-2 text-purple-700 transition-all duration-300 hover:scale-105 dark:text-purple-300">
                      <span className="group-hover:animate-bounce-subtle mr-2">
                        ⚡
                      </span>
                      Performance Analysis
                    </div>
                  </div>
                </div>

                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                  {featuredAlgorithms.map(({ topic, item }) => (
                    <Card
                      key={`${topic}/${item.slug}`}
                      variant="elevated"
                      className="group liquid-glass-card liquid-glass-glow relative cursor-pointer overflow-hidden shadow-lg transition-all duration-500 hover:-translate-y-2 hover:scale-105 hover:shadow-2xl"
                      onClick={() => {
                        logger.info(
                          LogCategory.USER_INTERACTION,
                          "Featured algorithm clicked",
                          {
                            algorithm: item.title,
                            topic,
                            slug: item.slug,
                            difficulty: item.difficulty,
                            section: "featured",
                            timestamp: new Date().toISOString(),
                          }
                        );

                        navigate(`/viz/${topic}/${item.slug}`);
                      }}
                    >
                      {/* Gradient overlay */}
                      <div className="to-primary-50/30 dark:to-primary-900/20 absolute inset-0 bg-gradient-to-br from-transparent via-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                      <div className="relative p-6 text-center">
                        <div className="mb-4 text-4xl filter transition-transform duration-300 group-hover:scale-125 group-hover:drop-shadow-lg">
                          {TOPIC_META[topic]?.icon ?? "📘"}
                        </div>

                        <h4 className="group-hover:text-primary-700 dark:group-hover:text-primary-300 mb-3 text-lg font-bold text-slate-900 transition-colors duration-300 dark:text-slate-100">
                          {item.title}
                        </h4>

                        <p className="mb-6 min-h-[3rem] text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                          {item.summary ||
                            `Master the fundamentals of ${pretty(topic)}`}
                        </p>

                        <div className="space-y-3">
                          {/* Difficulty Badge */}
                          <div
                            className={cn(
                              "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium",
                              item.difficulty === "Easy"
                                ? "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300"
                                : item.difficulty === "Medium"
                                  ? "border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300"
                                  : "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300"
                            )}
                          >
                            <div
                              className={cn(
                                "h-2 w-2 rounded-full",
                                item.difficulty === "Easy"
                                  ? "bg-green-500"
                                  : item.difficulty === "Medium"
                                    ? "bg-yellow-500"
                                    : "bg-red-500"
                              )}
                            />
                            {formatDifficulty(item.difficulty)}
                          </div>

                          <Button
                            size="sm"
                            variant="primary"
                            className="touch-target from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 min-h-[44px] w-full bg-gradient-to-r transition-all duration-300 group-hover:shadow-lg"
                            onClick={(e) => {
                              e.stopPropagation();

                              logger.info(
                                LogCategory.USER_INTERACTION,
                                "Algorithm try now clicked",
                                {
                                  algorithm: item.title,
                                  topic,
                                  slug: item.slug,
                                  difficulty: item.difficulty,
                                  autostart: true,
                                  source: "main_grid",
                                  timestamp: new Date().toISOString(),
                                }
                              );

                              navigate(
                                `/viz/${topic}/${item.slug}?autostart=true`
                              );
                            }}
                          >
                            <span className="mr-2">🎯</span>
                            Try Now
                            <span className="ml-2 transition-transform duration-300 group-hover:translate-x-1">
                              →
                            </span>
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </section>
          )}

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
                    {t("common.noAlgorithmsFound", {
                      defaultValue: "No algorithms found",
                    })}
                  </h3>

                  <p className="mb-6 leading-relaxed text-slate-600 dark:text-slate-400">
                    {t("common.adjustSearchTerms", {
                      defaultValue:
                        "Don't worry! Try adjusting your search terms or filters to discover the perfect algorithm.",
                    })}
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
                    {t("common.clearAllFilters", {
                      defaultValue: "Clear All Filters",
                    })}
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
                    setShowOnboarding(true);
                  }}
                  className="flex items-center gap-2 text-sm text-slate-400 transition-colors duration-200 hover:text-white"
                >
                  <span>🎯</span>
                  Take the Tour
                </button>

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
              </div>
            </div>
          </div>
        </footer>

        {/* Debug Panel (Dev Mode) */}
        {import.meta.env.DEV && (
          <DebugPanel
            isOpen={showDebugPanel}
            onClose={() => {
              logger.info(LogCategory.USER_INTERACTION, "Debug panel closed", {
                timestamp: new Date().toISOString(),
              });
              setShowDebugPanel(false);
            }}
          />
        )}

        {/* Performance Monitor (Dev Mode) */}
        {import.meta.env.DEV && <performanceMonitor.PerformanceMonitor />}

        {/* Onboarding Tour */}
        <OnboardingTour
          isOpen={showOnboarding}
          onClose={() => setShowOnboarding(false)}
          onComplete={() => {
            markOnboardingTourSeen();
            setShowOnboarding(false);
          }}
          tourType="homepage"
        />
      </div>{" "}
      {/* end scroll area */}
      {/* Keep "fixed" floating buttons outside the scroll area so they anchor to the viewport */}
      {/* Floating Action Buttons - Fixed to viewport */}
      {/* Performance Monitor Button */}
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
      {/* Keyboard Shortcuts Button - Bottom position */}
      <KeyboardShortcutsButton />
      {/* Debug Tools (Dev Mode) */}
      {import.meta.env.DEV && (
        <>
          {/* Debug Toggle Button */}
          <div className="fixed right-6 bottom-[160px] z-50">
            <div className="relative">
              <button
                className="group flex min-w-[3rem] transform items-center gap-3 overflow-hidden rounded-2xl border border-red-500/20 bg-gradient-to-r from-red-600 to-pink-600 p-4 text-white shadow-xl backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:from-red-700 hover:to-pink-700 hover:shadow-2xl active:scale-95"
                title="Debug Panel (Dev) - Ctrl+Shift+D"
                onClick={() => {
                  logger.info(
                    LogCategory.USER_INTERACTION,
                    "Debug panel opened via floating button",
                    {
                      method: "floating_button_click",
                      timestamp: new Date().toISOString(),
                    }
                  );
                  setShowDebugPanel(true);
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
    </div>
  );
}
