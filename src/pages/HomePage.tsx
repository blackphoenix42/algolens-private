import { useMemo, useState, useEffect } from "react";
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
import { CATALOG } from "@/engine/registry";
import { usePreferences } from "@/hooks/usePreferences";
import { LanguageSwitcher, useI18n } from "@/i18n";
import { LogCategory, logger, useComponentLogger } from "@/services/monitoring";
import { cn, formatDifficulty, scrollToElement } from "@/utils";

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

function useSafeCatalog(): Record<string, AlgoItem[]> {
  return useMemo(() => {
    const safe: Record<string, AlgoItem[]> = {};
    for (const [topic, items] of Object.entries(CATALOG ?? {})) {
      safe[topic] = Array.isArray(items) ? (items as AlgoItem[]) : [];
    }
    return safe;
  }, []);
}

export default function HomePage() {
  const { t } = useI18n();
  const componentLogger = useComponentLogger("HomePage");
  const navigate = useNavigate();
  const catalog = useSafeCatalog();
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

  const clearFilters = () => {
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
  };

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 overflow-x-hidden overflow-y-auto">
      {/* Hero Section */}
      {showHero && (
        <section
          data-tour="hero-section"
          className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-secondary-600 to-primary-800 dark:from-primary-800 dark:via-secondary-800 dark:to-primary-950 min-h-[100vh] flex items-center"
        >
          {/* Animated Background */}
          <div className="absolute inset-0">
            {/* Floating Particles */}
            <FloatingParticles particleCount={60} />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>

            {/* Animated Background Pattern */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDYwIDAgTCAwIDAgMCA2MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiIC8+PC9zdmc+')] opacity-30 animate-pulse-soft"></div>

            {/* Glowing Orbs */}
            <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-float animation-delay-1000"></div>
            <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-gradient-to-r from-orange-400/20 to-pink-400/20 rounded-full blur-3xl animate-float animation-delay-2000"></div>

            {/* Algorithm-themed floating icons */}
            <div className="hidden sm:block absolute top-20 left-20 animate-float animation-delay-500">
              <AlgorithmIcon
                variant="sorting"
                className="w-12 h-12 opacity-20"
              />
            </div>
            <div className="hidden md:block absolute top-32 right-32 animate-float animation-delay-1500">
              <AlgorithmIcon variant="graph" className="w-10 h-10 opacity-15" />
            </div>
            <div className="hidden lg:block absolute bottom-40 left-16 animate-float animation-delay-2500">
              <AlgorithmIcon variant="tree" className="w-14 h-14 opacity-25" />
            </div>
            <div className="hidden sm:block absolute bottom-20 right-20 animate-float animation-delay-3000">
              <AlgorithmIcon variant="array" className="w-11 h-11 opacity-20" />
            </div>

            {/* Mobile-friendly smaller icons */}
            <div className="block sm:hidden absolute top-16 right-8 animate-float animation-delay-500">
              <AlgorithmIcon variant="sorting" className="w-8 h-8 opacity-15" />
            </div>
            <div className="block sm:hidden absolute bottom-32 left-8 animate-float animation-delay-2000">
              <AlgorithmIcon variant="graph" className="w-7 h-7 opacity-20" />
            </div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-32 w-full">
            <div className="text-center">
              {/* Enhanced Main Title */}
              <div className="mb-8 md:mb-12 animate-fade-in-up">
                <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black mb-4 md:mb-6 leading-tight">
                  <span className="bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent drop-shadow-2xl">
                    {t("app.name")}
                  </span>
                </h1>
                <div className="h-1 w-24 md:w-32 bg-gradient-to-r from-blue-400 to-purple-400 mx-auto rounded-full animate-shimmer"></div>
              </div>

              {/* Enhanced Subtitle */}
              <div className="mb-12 md:mb-16 animate-fade-in-up animation-delay-200">
                <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-white/90 mb-4 md:mb-6 max-w-4xl mx-auto font-light leading-relaxed px-4">
                  {t("app.tagline")}
                </p>
                <p className="text-sm sm:text-base md:text-xl text-white/70 max-w-3xl mx-auto leading-relaxed px-4">
                  {t("app.description")}
                </p>
              </div>

              {/* Enhanced Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-12 md:mb-16 animate-fade-in-up animation-delay-400 px-4">
                <div className="group text-center p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105">
                  <div className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-2 group-hover:text-blue-200 transition-colors">
                    {stats.algorithms}
                  </div>
                  <div className="text-white/80 text-xs sm:text-sm md:text-base font-medium uppercase tracking-wider">
                    {t("navigation.algorithms")}
                  </div>
                  <div className="mt-2 h-0.5 w-8 sm:w-12 bg-gradient-to-r from-blue-400 to-transparent mx-auto opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <div className="group text-center p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105">
                  <div className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-2 group-hover:text-purple-200 transition-colors">
                    {stats.categories}
                  </div>
                  <div className="text-white/80 text-xs sm:text-sm md:text-base font-medium uppercase tracking-wider">
                    Categories
                  </div>
                  <div className="mt-2 h-0.5 w-8 sm:w-12 bg-gradient-to-r from-purple-400 to-transparent mx-auto opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <div className="group text-center p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 sm:col-span-3 md:col-span-1">
                  <div className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-2 group-hover:text-orange-200 transition-colors">
                    {stats.tags}
                  </div>
                  <div className="text-white/80 text-xs sm:text-sm md:text-base font-medium uppercase tracking-wider">
                    {t("navigation.algorithms")}{" "}
                    {t("common.topics", { defaultValue: "Topics" })}
                  </div>
                  <div className="mt-2 h-0.5 w-8 sm:w-12 bg-gradient-to-r from-orange-400 to-transparent mx-auto opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
              </div>

              {/* Enhanced CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center animate-fade-in-up animation-delay-600 px-4">
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
                  className="group bg-white text-primary-700 hover:bg-blue-50 shadow-xl hover:shadow-2xl transition-all duration-300 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-lg sm:rounded-xl border-2 border-transparent hover:border-blue-200 w-full sm:w-auto"
                >
                  <span className="mr-2 text-lg sm:text-xl group-hover:animate-bounce-subtle">
                    🚀
                  </span>
                  <span className="truncate">
                    {t("home.exploreAlgorithms")}
                  </span>
                  <span className="ml-2 group-hover:translate-x-1 transition-transform">
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
                  className="group border-2 border-white/50 text-white hover:bg-white/10 hover:border-white shadow-xl hover:shadow-2xl transition-all duration-300 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-lg sm:rounded-xl backdrop-blur-sm w-full sm:w-auto"
                >
                  <span className="mr-2 text-lg sm:text-xl group-hover:animate-pulse">
                    📚
                  </span>
                  <span className="truncate">
                    {t("common.learnMore", { defaultValue: "Learn More" })}
                  </span>
                  <span className="ml-2 group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </Button>
              </div>
            </div>
          </div>

          {/* Enhanced Close Hero Button */}
          <button
            onClick={() => toggleHeroSection()}
            className="absolute top-6 right-6 p-3 text-white/60 hover:text-white transition-all duration-300 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm border border-white/20 hover:border-white/40 group"
            title="Close hero section"
          >
            <svg
              className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300"
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
          "sticky top-0 z-30 bg-white/95 backdrop-blur-xl border-b border-slate-200/60 dark:bg-slate-900/95 dark:border-slate-700/60 shadow-sm",
          "transition-all duration-300"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3 group">
                <div className="text-2xl md:text-3xl group-hover:scale-110 transition-transform duration-300">
                  🔬
                </div>
                <h2 className="text-xl md:text-2xl font-black bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                  AlgoLens
                </h2>
              </div>
              {!showHero && (
                <button
                  onClick={() => toggleHeroSection()}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-800/30 rounded-full transition-all duration-200 hover:scale-105"
                >
                  <span className="text-xs">✨</span>
                  Show Hero
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 md:gap-6">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <div className="text-sm text-slate-700 dark:text-slate-300">
                  <span className="font-semibold text-primary-600 dark:text-primary-400">
                    {totalShown}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 ml-1">
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
                <span className="mr-2 group-hover:animate-bounce-subtle">
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
          <section className="px-4 py-12 bg-gradient-to-br from-slate-50 via-white to-slate-100/50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
            <div className="max-w-7xl mx-auto">
              <div
                className="text-center mb-12 animate-fade-in-up"
                data-about-section
              >
                <div className="inline-flex items-center gap-3 mb-6 px-4 py-2 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-full border border-primary-200/30 dark:border-primary-700/30">
                  <span className="text-2xl animate-bounce-subtle">✨</span>
                  <span className="text-lg font-semibold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                    Featured Algorithms
                  </span>
                </div>

                <h3 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-slate-100 mb-6 leading-tight">
                  Start Your Journey with
                  <span className="bg-gradient-to-r from-primary-600 via-secondary-600 to-primary-700 bg-clip-text text-transparent">
                    {" "}
                    Popular Algorithms
                  </span>
                </h3>

                <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-8 leading-relaxed">
                  Discover the fundamental algorithms that every developer
                  should master. Each one comes with
                  <span className="font-semibold text-primary-600 dark:text-primary-400">
                    {" "}
                    interactive visualizations
                  </span>{" "}
                  and
                  <span className="font-semibold text-secondary-600 dark:text-secondary-400">
                    {" "}
                    real-time analysis
                  </span>
                  .
                </p>

                {/* Enhanced Value Proposition Pills */}
                <div className="flex flex-wrap justify-center gap-4 text-sm">
                  <div className="group bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/30 text-primary-700 dark:text-primary-300 px-4 py-2 rounded-full border border-primary-200/50 dark:border-primary-700/50 hover:scale-105 transition-all duration-300 cursor-default">
                    <span className="mr-2 group-hover:animate-bounce-subtle">
                      🚀
                    </span>
                    Interactive Learning
                  </div>
                  <div className="group bg-gradient-to-r from-green-50 to-emerald-100 dark:from-green-900/30 dark:to-emerald-800/30 text-green-700 dark:text-green-300 px-4 py-2 rounded-full border border-green-200/50 dark:border-green-700/50 hover:scale-105 transition-all duration-300 cursor-default">
                    <span className="mr-2 group-hover:animate-bounce-subtle">
                      📊
                    </span>
                    Step-by-Step Visualization
                  </div>
                  <div className="group bg-gradient-to-r from-purple-50 to-violet-100 dark:from-purple-900/30 dark:to-violet-800/30 text-purple-700 dark:text-purple-300 px-4 py-2 rounded-full border border-purple-200/50 dark:border-purple-700/50 hover:scale-105 transition-all duration-300 cursor-default">
                    <span className="mr-2 group-hover:animate-bounce-subtle">
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
                    className="group relative overflow-hidden bg-gradient-to-br from-white via-slate-50 to-slate-100/50 dark:from-slate-800 dark:via-slate-900 dark:to-slate-950/50 border-2 border-transparent hover:border-primary-200/50 dark:hover:border-primary-700/50 hover:scale-105 hover:-translate-y-2 transition-all duration-500 cursor-pointer shadow-lg hover:shadow-2xl"
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
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary-50/30 dark:to-primary-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    <div className="relative p-6 text-center">
                      <div className="text-4xl mb-4 group-hover:scale-125 transition-transform duration-300 filter group-hover:drop-shadow-lg">
                        {TOPIC_META[topic]?.icon ?? "📘"}
                      </div>

                      <h4 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-3 group-hover:text-primary-700 dark:group-hover:text-primary-300 transition-colors duration-300">
                        {item.title}
                      </h4>

                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 min-h-[3rem] leading-relaxed">
                        {item.summary ||
                          `Master the fundamentals of ${pretty(topic)}`}
                      </p>

                      <div className="space-y-3">
                        {/* Difficulty Badge */}
                        <div
                          className={cn(
                            "inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border",
                            item.difficulty === "Easy"
                              ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800"
                              : item.difficulty === "Medium"
                                ? "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800"
                                : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800"
                          )}
                        >
                          <div
                            className={cn(
                              "w-2 h-2 rounded-full",
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
                          className="w-full min-h-[44px] touch-target group-hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700"
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
                          <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300">
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
        <div className="max-w-7xl mx-auto">
          {Object.keys(filteredGrouped).length === 0 ? (
            <div className="text-center py-16 animate-fade-in-up">
              <div className="relative mb-8">
                {/* Animated Search Illustration */}
                <div className="text-8xl mb-4 animate-bounce-subtle">🔍</div>
                <div className="absolute -top-2 -right-2 text-2xl animate-float animation-delay-500">
                  ✨
                </div>
                <div className="absolute -bottom-2 -left-2 text-xl animate-float animation-delay-1000">
                  💫
                </div>
              </div>

              <div className="max-w-md mx-auto mb-8">
                <h3 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                  {t("common.noAlgorithmsFound", {
                    defaultValue: "No algorithms found",
                  })}
                </h3>

                <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                  {t("common.adjustSearchTerms", {
                    defaultValue:
                      "Don't worry! Try adjusting your search terms or filters to discover the perfect algorithm.",
                  })}
                </p>

                {/* Helpful suggestions */}
                <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 mb-6">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 font-medium">
                    Try searching for:
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {["sorting", "search", "graph", "tree", "dynamic"].map(
                      (suggestion) => (
                        <button
                          key={suggestion}
                          onClick={() => setQ(suggestion)}
                          className="px-3 py-1.5 text-xs font-medium bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full border border-slate-300 dark:border-slate-600 hover:border-primary-400 dark:hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-200 hover:scale-105"
                        >
                          {suggestion}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={clearFilters}
                  variant="primary"
                  className="bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 shadow-lg hover:shadow-xl transition-all duration-300"
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
                  className="border-slate-300 dark:border-slate-600 hover:border-primary-400 dark:hover:border-primary-500"
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
                  <div className="flex items-center gap-4 mb-8 group">
                    <div className="text-3xl group-hover:scale-110 transition-transform duration-300 cursor-default">
                      {TOPIC_META[topic]?.icon ?? "📘"}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-slate-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300">
                        {pretty(topic)}
                      </h3>
                      <div className="h-0.5 w-0 group-hover:w-24 bg-gradient-to-r from-primary-500 to-secondary-500 transition-all duration-500 mt-1"></div>
                    </div>
                    <div className="bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 px-4 py-2 rounded-full text-sm font-bold text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 shadow-sm">
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
      <footer className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 border-t border-slate-700 dark:border-slate-800 mt-16 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZm9vdGVyR3JpZCIgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIxIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2Zvb3RlckdyaWQpIiAvPjwvc3ZnPg==')] opacity-30"></div>

        {/* Gradient Overlays */}
        <div className="absolute top-0 left-1/4 w-32 h-32 bg-gradient-to-r from-primary-600/10 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-40 h-40 bg-gradient-to-r from-secondary-600/10 to-transparent rounded-full blur-3xl"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Brand Section */}
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                <span className="text-3xl">🔬</span>
                <h3 className="text-xl font-black bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                  AlgoLens
                </h3>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed max-w-xs mx-auto md:mx-0">
                Making algorithms and data structures accessible through
                interactive visualizations and hands-on learning.
              </p>
            </div>

            {/* Features Section */}
            <div className="text-center">
              <h4 className="text-white font-semibold mb-4">What We Offer</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
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
              <h4 className="text-white font-semibold mb-4">Learning Stats</h4>
              <div className="space-y-3">
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-3 border border-slate-700/50">
                  <div className="text-2xl font-bold text-primary-400">
                    {stats.algorithms}
                  </div>
                  <div className="text-slate-400 text-xs uppercase tracking-wider">
                    Algorithms
                  </div>
                </div>
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-3 border border-slate-700/50">
                  <div className="text-2xl font-bold text-secondary-400">
                    {stats.categories}
                  </div>
                  <div className="text-slate-400 text-xs uppercase tracking-wider">
                    Categories
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="border-t border-slate-700/50 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-slate-400 text-sm text-center sm:text-left">
              <p className="flex items-center justify-center sm:justify-start gap-2">
                Built with
                <span className="text-red-400 animate-pulse">❤️</span>
                for learning algorithms and data structures
              </p>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  resetOnboardingTour();
                  setShowOnboarding(true);
                }}
                className="text-slate-400 hover:text-white text-sm transition-colors duration-200 flex items-center gap-2"
              >
                <span>🎯</span>
                Take the Tour
              </button>

              <button
                onClick={() => toggleHeroSection()}
                className="text-slate-400 hover:text-white text-sm transition-colors duration-200 flex items-center gap-2"
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
