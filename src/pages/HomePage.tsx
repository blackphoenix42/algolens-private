import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import DebugToggle from "@/components/debug/DebugToggle";
import AlgoCard, { AlgoItem } from "@/components/home/AlgoCard";
import FilterBar from "@/components/home/FilterBar";
import OnboardingTour from "@/components/onboarding/OnboardingTour";
import { KeyboardShortcutsButton } from "@/components/panels/KeyboardShortcutsPanel";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { CATALOG } from "@/engine/registry";
import { usePreferences } from "@/hooks/usePreferences";
import { LanguageSwitcher, useI18n } from "@/i18n/exports";
import { LogCategory, logger, useComponentLogger } from "@/services/monitoring";
import { smoothScrollTo } from "@/services/performance";
import { cn, formatDifficulty } from "@/utils";

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

  const clearFilters = () => {
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
          className="relative overflow-hidden bg-gradient-to-r from-primary-600 via-primary-700 to-secondary-600 dark:from-primary-800 dark:via-primary-900 dark:to-secondary-800 min-h-[100vh] flex items-center"
        >
          <div className="absolute inset-0 opacity-50">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50"></div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 py-12 md:py-20 w-full">
            <div className="text-center">
              {/* Main Title */}
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 animate-fade-in-up">
                <span className="bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
                  {t("app.name")}
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-xl md:text-2xl text-primary-100 mb-8 max-w-3xl mx-auto animate-fade-in-up animation-delay-200">
                {t("app.tagline")} - {t("app.description")}
              </p>

              {/* Stats */}
              <div className="flex flex-wrap justify-center gap-6 md:gap-12 mb-8 animate-fade-in-up animation-delay-400">
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-white">
                    {stats.algorithms}
                  </div>
                  <div className="text-primary-200 text-sm md:text-base">
                    {t("navigation.algorithms")}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-white">
                    {stats.categories}
                  </div>
                  <div className="text-primary-200 text-sm md:text-base">
                    Categories
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-white">
                    {stats.tags}
                  </div>
                  <div className="text-primary-200 text-sm md:text-base">
                    {t("navigation.algorithms")}{" "}
                    {t("common.topics", { defaultValue: "Topics" })}
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animation-delay-600">
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={() => {
                    toggleHeroSection();
                    const mainElement = document.querySelector("main");
                    if (mainElement) {
                      smoothScrollTo(mainElement, 100);
                    }
                  }}
                  className="bg-white text-primary-600 hover:bg-slate-50 shadow-xl"
                >
                  🚀 {t("home.exploreAlgorithms")}
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
                      smoothScrollTo(aboutSection as Element, 100);
                    } else {
                      // Navigate to documentation or feature section
                      const featuresSection = document.querySelector(
                        ".grid.gap-6.sm\\:grid-cols-2.lg\\:grid-cols-4"
                      );
                      if (featuresSection) {
                        smoothScrollTo(featuresSection as Element, 100);
                      } else {
                        // Fallback - navigate to GitHub docs
                        window.open(
                          "https://github.com/blackphoenix42/AlgoLens#readme",
                          "_blank"
                        );
                      }
                    }
                  }}
                  className="border-white text-white hover:bg-white/10 shadow-xl"
                >
                  📚 {t("common.learnMore", { defaultValue: "Learn More" })}
                </Button>
              </div>
            </div>
          </div>

          {/* Close Hero Button */}
          <button
            onClick={() => toggleHeroSection()}
            className="absolute top-4 right-4 p-2 text-white/70 hover:text-white transition-colors"
            title="Close hero section"
          >
            <svg
              className="h-6 w-6"
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

      {/* Navigation Header */}
      <header
        className={cn(
          "sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-slate-200 dark:bg-slate-900/90 dark:border-slate-700",
          "transition-all duration-300"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100">
                🔬 AlgoLens
              </h2>
              {!showHero && (
                <button
                  onClick={() => toggleHeroSection()}
                  className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                >
                  Show Hero
                </button>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="text-sm text-slate-600 dark:text-slate-400">
                <span className="font-medium">{totalShown}</span> algorithms
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  resetOnboardingTour();
                  setShowOnboarding(true);
                }}
                className="text-primary-600 hover:text-primary-700"
                title={t("common.quickTour", {
                  defaultValue: "Show quick tour",
                })}
              >
                🎯 {t("common.quickTour", { defaultValue: "Quick Tour" })}
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

      {/* Featured Algorithms (when no filters) */}
      {!q &&
        selectedCategories.length === 0 &&
        selectedTags.length === 0 &&
        selectedDifficulties.length === 0 && (
          <section className="px-4 py-8 bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-8" data-about-section>
                <h3 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                  ✨ Featured Algorithms
                </h3>
                <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-4">
                  Start your journey with these popular algorithms that every
                  developer should know.
                </p>
                {/* Clear Value Proposition */}
                <div className="flex flex-wrap justify-center gap-4 text-sm">
                  <div className="bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 px-3 py-1 rounded-full">
                    🚀 Interactive Learning
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 px-3 py-1 rounded-full">
                    📊 Step-by-Step Visualization
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full">
                    ⚡ Real-time Performance Analysis
                  </div>
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {featuredAlgorithms.map(({ topic, item }) => (
                  <Card
                    key={`${topic}/${item.slug}`}
                    variant="elevated"
                    className="group hover:scale-105 transition-transform duration-300 cursor-pointer"
                    onClick={() => navigate(`/viz/${topic}/${item.slug}`)}
                  >
                    <div className="p-6 text-center">
                      <div className="text-3xl mb-3">
                        {TOPIC_META[topic]?.icon ?? "📘"}
                      </div>
                      <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                        {item.title}
                      </h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                        {item.summary || pretty(topic)}
                      </p>
                      <Button
                        size="sm"
                        variant="primary"
                        className="w-full min-h-[44px] touch-target"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/viz/${topic}/${item.slug}?autostart=true`);
                        }}
                      >
                        Try Now
                      </Button>
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
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                {t("common.noAlgorithmsFound", {
                  defaultValue: "No algorithms found",
                })}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                {t("common.adjustSearchTerms", {
                  defaultValue:
                    "Try adjusting your search terms or filters to find what you're looking for.",
                })}
              </p>
              <Button onClick={clearFilters} variant="primary">
                {t("common.clearAllFilters", {
                  defaultValue: "Clear All Filters",
                })}
              </Button>
            </div>
          ) : (
            <div className="space-y-12">
              {Object.entries(filteredGrouped).map(([topic, rows]) => (
                <section key={topic} className="animate-fade-in-up">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="text-2xl">
                      {TOPIC_META[topic]?.icon ?? "📘"}
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                      {pretty(topic)}
                    </h3>
                    <div className="bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded-full text-sm text-slate-600 dark:text-slate-400">
                      {rows.length}
                    </div>
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {rows.map(({ item }, index) => (
                      <AlgoCard
                        key={`${topic}/${item.slug}`}
                        topic={topic}
                        item={item}
                        titleMap={titleMap}
                        accent={TOPIC_META[topic]?.color}
                        data-tour={index === 0 ? "algorithm-card" : undefined}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center text-slate-600 dark:text-slate-400">
            <p>Built with ❤️ for learning algorithms and data structures</p>
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
