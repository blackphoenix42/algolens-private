import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import DebugToggle from "@/components/debug/DebugToggle";
import AlgoCard, { AlgoItem } from "@/components/home/AlgoCard";
import FilterBar from "@/components/home/FilterBar";
import OnboardingTour from "@/components/onboarding/OnboardingTour";
import { KeyboardShortcutsButton } from "@/components/panels/KeyboardShortcutsPanel";
import { AlgorithmIcon } from "@/components/ui/AlgorithmIcon";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import FloatingParticles from "@/components/ui/FloatingParticles";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { loadAllTopics } from "@/engine/registry";
import { usePreferences } from "@/hooks/usePreferences";
import { LanguageSwitcher, useI18n } from "@/i18n";
import { LogCategory, logger, useComponentLogger } from "@/services/monitoring";
import { cn, formatDifficulty, scrollToElement } from "@/utils";
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
  isLoading: boolean;
} {
  const [catalog, setCatalog] = useState<Record<string, AlgoItem[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCatalog = async () => {
      try {
        const loadedCatalog = await loadAllTopics();
        const safe: Record<string, AlgoItem[]> = {};

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
      } finally {
        setIsLoading(false);
      }
    };

    // Use idle callback for non-critical loading
    runWhenIdle(loadCatalog);
  }, []);

  return { catalog, isLoading };
}

export default function HomePage() {
  const { t } = useI18n();
  const componentLogger = useComponentLogger("HomePage");
  const navigate = useNavigate();
  const { catalog } = useSafeCatalog();
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

  const topics = useMemo(() => Object.keys(catalog), [catalog]);
  const difficulties = ["Easy", "Medium", "Hard"];

  const allItems = useMemo(
    () =>
      Object.entries(catalog).flatMap(([topic, items]) =>
        (items ?? []).map((item) => ({ topic, item }))
      ),
    [catalog]
  );

  const tagUniverse = useMemo(() => {
    const s = new Set<string>();
    allItems.forEach(({ item }) => item.tags?.forEach((t) => s.add(t)));
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
      const tags = (it.tags || []).join(" ").toLowerCase();
      if (title === ql) s += 500;
      if (title.startsWith(ql)) s += 250;
      if (title.includes(ql)) s += 120;
      if (summary.includes(ql)) s += 60;
      if (tags.includes(ql)) s += 80;
      if (t.toLowerCase().includes(ql)) s += 20;
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
          const t = new Set(it.tags || []);
          for (const tag of activeTagSet) if (!t.has(tag)) return false;
        }
        if (!ql) return true;
        const hay = `${it.title} ${it.summary} ${(it.tags || []).join(
          " "
        )} ${topic}`.toLowerCase();
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
    <div className="relative min-h-screen overflow-x-hidden overflow-y-auto bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      {/* Liquid Glass Background Elements */}
      <div
        className="pointer-events-none fixed inset-0 overflow-hidden"
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

      {/* Hero Section */}
      {showHero && (
        <section
          data-tour="hero-section"
          className="liquid-glass-hero relative flex min-h-[100vh] items-center overflow-hidden"
        >
          {/* Animated Background */}
          <div className="absolute inset-0">
            {/* Floating Particles */}
            <FloatingParticles particleCount={60} />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>

            {/* Animated Background Pattern */}
            <div className="animate-pulse-soft absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDYwIDAgTCAwIDAgMCA2MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiIC8+PC9zdmc+')] opacity-30"></div>

            {/* Glowing Orbs */}
            <div className="animate-float animation-delay-1000 absolute top-1/4 left-1/4 h-32 w-32 rounded-full bg-gradient-to-r from-blue-400/20 to-purple-400/20 blur-3xl"></div>
            <div className="animate-float animation-delay-2000 absolute right-1/4 bottom-1/4 h-40 w-40 rounded-full bg-gradient-to-r from-orange-400/20 to-pink-400/20 blur-3xl"></div>

            {/* Algorithm-themed floating icons */}
            <div className="animate-float animation-delay-500 absolute top-20 left-20 hidden sm:block">
              <AlgorithmIcon
                variant="sorting"
                className="h-12 w-12 opacity-20"
              />
            </div>
            <div className="animate-float animation-delay-1500 absolute top-32 right-32 hidden md:block">
              <AlgorithmIcon variant="graph" className="h-10 w-10 opacity-15" />
            </div>
            <div className="animate-float animation-delay-2500 absolute bottom-40 left-16 hidden lg:block">
              <AlgorithmIcon variant="tree" className="h-14 w-14 opacity-25" />
            </div>
            <div className="animate-float animation-delay-3000 absolute right-20 bottom-20 hidden sm:block">
              <AlgorithmIcon variant="array" className="h-11 w-11 opacity-20" />
            </div>

            {/* Mobile-friendly smaller icons */}
            <div className="animate-float animation-delay-500 absolute top-16 right-8 block sm:hidden">
              <AlgorithmIcon variant="sorting" className="h-8 w-8 opacity-15" />
            </div>
            <div className="animate-float animation-delay-2000 absolute bottom-32 left-8 block sm:hidden">
              <AlgorithmIcon variant="graph" className="h-7 w-7 opacity-20" />
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8 lg:py-32">
            <div className="text-center">
              {/* Enhanced Main Title */}
              <div className="animate-fade-in-up mb-8 md:mb-12">
                <h1 className="mb-4 text-4xl leading-tight font-black sm:text-5xl md:mb-6 md:text-7xl lg:text-8xl">
                  <span className="bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent drop-shadow-2xl">
                    {t("app.name")}
                  </span>
                </h1>
                <div className="animate-shimmer mx-auto h-1 w-24 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 md:w-32"></div>
              </div>

              {/* Enhanced Subtitle with fixed dimensions to prevent layout shift */}
              <div className="animate-fade-in-up animation-delay-200 mb-12 md:mb-16">
                <p className="mx-auto mb-4 min-h-[2.5rem] max-w-4xl px-4 text-lg leading-relaxed font-light text-white/90 sm:min-h-[3rem] sm:text-xl md:mb-6 md:min-h-[4rem] md:text-2xl lg:min-h-[5rem] lg:text-3xl">
                  {t("app.tagline")}
                </p>
                <p className="mx-auto min-h-[3rem] max-w-3xl px-4 text-sm leading-relaxed text-white/70 sm:min-h-[4rem] sm:text-base md:min-h-[5rem] md:text-xl">
                  {t("app.description")}
                </p>
              </div>

              {/* Enhanced Stats with fixed dimensions to prevent layout shift */}
              <div className="animate-fade-in-up animation-delay-400 mb-12 grid grid-cols-1 gap-4 px-4 sm:grid-cols-3 sm:gap-6 md:mb-16 md:gap-8">
                <div className="group liquid-glass-card hover:liquid-glass-glow p-4 text-center transition-all duration-300 hover:scale-105 sm:p-6">
                  <div className="mb-2 flex min-h-[3rem] items-center justify-center text-3xl font-black text-white transition-colors group-hover:text-blue-200 sm:min-h-[3.5rem] sm:text-4xl md:min-h-[4rem] md:text-5xl">
                    {stats.algorithms || "..."}
                  </div>
                  <div className="flex min-h-[1.5rem] items-center justify-center text-xs font-medium tracking-wider text-white/80 uppercase sm:text-sm md:text-base">
                    {t("navigation.algorithms")}
                  </div>
                  <div className="mx-auto mt-2 h-0.5 w-8 bg-gradient-to-r from-blue-400 to-transparent opacity-0 transition-opacity group-hover:opacity-100 sm:w-12"></div>
                </div>
                <div className="group liquid-glass-card hover:liquid-glass-glow p-4 text-center transition-all duration-300 hover:scale-105 sm:p-6">
                  <div className="mb-2 flex min-h-[3rem] items-center justify-center text-3xl font-black text-white transition-colors group-hover:text-purple-200 sm:min-h-[3.5rem] sm:text-4xl md:min-h-[4rem] md:text-5xl">
                    {stats.categories || "..."}
                  </div>
                  <div className="flex min-h-[1.5rem] items-center justify-center text-xs font-medium tracking-wider text-white/80 uppercase sm:text-sm md:text-base">
                    Categories
                  </div>
                  <div className="mx-auto mt-2 h-0.5 w-8 bg-gradient-to-r from-purple-400 to-transparent opacity-0 transition-opacity group-hover:opacity-100 sm:w-12"></div>
                </div>
                <div className="group liquid-glass-card hover:liquid-glass-glow p-4 text-center transition-all duration-300 hover:scale-105 sm:col-span-3 sm:p-6 md:col-span-1">
                  <div className="mb-2 text-3xl font-black text-white transition-colors group-hover:text-orange-200 sm:text-4xl md:text-5xl">
                    {stats.tags}
                  </div>
                  <div className="text-xs font-medium tracking-wider text-white/80 uppercase sm:text-sm md:text-base">
                    {t("navigation.algorithms")}{" "}
                    {t("common.topics", { defaultValue: "Topics" })}
                  </div>
                  <div className="mx-auto mt-2 h-0.5 w-8 bg-gradient-to-r from-orange-400 to-transparent opacity-0 transition-opacity group-hover:opacity-100 sm:w-12"></div>
                </div>
              </div>

              {/* Enhanced CTA Buttons */}
              <div className="animate-fade-in-up animation-delay-600 flex flex-col justify-center gap-4 px-4 sm:flex-row sm:gap-6">
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={() => {
                    logger.info(
                      LogCategory.USER_INTERACTION,
                      "Hero explore button clicked",
                      {
                        action: "scroll_to_algorithms",
                        heroVisible: showHero,
                        timestamp: new Date().toISOString(),
                      }
                    );

                    toggleHeroSection();
                    const mainElement = document.querySelector("main");
                    if (mainElement) {
                      scrollToElement(mainElement, 100);
                    }
                  }}
                  className="group liquid-glass-button w-full px-6 py-3 text-base font-semibold text-slate-900 hover:scale-105 sm:w-auto sm:px-8 sm:py-4 sm:text-lg dark:text-white"
                >
                  <span className="group-hover:animate-bounce-subtle mr-2 text-lg sm:text-xl">
                    🚀
                  </span>
                  <span className="truncate">
                    {t("home.exploreAlgorithms")}
                  </span>
                  <span className="ml-2 transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => {
                    // Create an about section or navigate to docs
                    const aboutSection = document.querySelector(
                      "[data-about-section]"
                    );
                    if (aboutSection) {
                      scrollToElement(aboutSection as Element, 100);
                    } else {
                      // Navigate to documentation or feature section
                      const featuresSection = document.querySelector(
                        ".grid.gap-6.sm\\:grid-cols-2.lg\\:grid-cols-4"
                      );
                      if (featuresSection) {
                        scrollToElement(featuresSection as Element, 100);
                      } else {
                        // Fallback - navigate to GitHub docs
                        window.open(
                          "https://github.com/blackphoenix42/AlgoLens#readme",
                          "_blank"
                        );
                      }
                    }
                  }}
                  className="group liquid-glass-button w-full px-6 py-3 text-base font-semibold text-white hover:scale-105 sm:w-auto sm:px-8 sm:py-4 sm:text-lg"
                >
                  <span className="mr-2 text-lg group-hover:animate-pulse sm:text-xl">
                    📚
                  </span>
                  <span className="truncate">
                    {t("common.learnMore", { defaultValue: "Learn More" })}
                  </span>
                  <span className="ml-2 transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </Button>
              </div>
            </div>
          </div>

          {/* Enhanced Close Hero Button */}
          <button
            onClick={() => toggleHeroSection()}
            className="group absolute top-6 right-6 rounded-full border border-white/20 bg-white/10 p-3 text-white/60 backdrop-blur-sm transition-all duration-300 hover:border-white/40 hover:bg-white/20 hover:text-white"
            title="Close hero section"
          >
            <svg
              className="h-5 w-5 transition-transform duration-300 group-hover:rotate-90"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </section>
      )}

      {/* Enhanced Navigation Header */}
      <header
        className={cn(
          "liquid-glass-header sticky top-0 z-30 shadow-sm",
          "transition-all duration-300"
        )}
      >
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div className="group flex items-center gap-3">
                <div className="text-2xl transition-transform duration-300 group-hover:scale-110 md:text-3xl">
                  🔬
                </div>
                <h2 className="from-primary-600 to-secondary-600 bg-gradient-to-r bg-clip-text text-xl font-black text-transparent md:text-2xl">
                  AlgoLens
                </h2>
              </div>
              {!showHero && (
                <button
                  onClick={() => toggleHeroSection()}
                  className="text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-800/30 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-all duration-200 hover:scale-105"
                >
                  <span className="text-xs">✨</span>
                  Show Hero
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 md:gap-6">
              <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-3 py-1.5 sm:flex dark:border-slate-700 dark:bg-slate-800">
                <div className="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
                <div className="text-sm text-slate-700 dark:text-slate-300">
                  <span className="text-primary-600 dark:text-primary-400 font-semibold">
                    {totalShown}
                  </span>
                  <span className="ml-1 text-slate-500 dark:text-slate-400">
                    algorithms
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  resetOnboardingTour();
                  setShowOnboarding(true);
                }}
                className="group text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-200"
                title={t("common.quickTour", {
                  defaultValue: "Show quick tour",
                })}
              >
                <span className="group-hover:animate-bounce-subtle mr-2">
                  🎯
                </span>
                <span className="hidden sm:inline">
                  {t("common.quickTour", { defaultValue: "Quick Tour" })}
                </span>
              </Button>
              <LanguageSwitcher className="mr-2" variant="dropdown" />
              <ThemeToggle data-tour="theme-toggle" />
            </div>
          </div>
        </div>
      </header>

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
      />

      {/* Enhanced Featured Algorithms */}
      {!q &&
        selectedCategories.length === 0 &&
        selectedTags.length === 0 &&
        selectedDifficulties.length === 0 && (
          <section className="liquid-glass-section relative px-4 py-12">
            <div className="mx-auto max-w-7xl">
              <div
                className="animate-fade-in-up mb-12 text-center"
                data-about-section
              >
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
                    Try searching for:
                  </p>
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
                          data-tour={index === 0 ? "algorithm-card" : undefined}
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
              <h4 className="mb-4 font-semibold text-white">Learning Stats</h4>
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
            </div>
          </div>
        </div>
      </footer>

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

      {/* Debug and Keyboard Shortcuts */}
      {import.meta.env.DEV && <DebugToggle />}
      <KeyboardShortcutsButton />
    </div>
  );
}
