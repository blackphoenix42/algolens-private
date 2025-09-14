// src/pages/VisualizerPage.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";

import ArrayCanvas, {
  ArrayCanvasHandle,
} from "@/components/canvas/Array/ArrayCanvas";
import CanvasToolbar from "@/components/canvas/Array/CanvasToolbar";
import EnhancedArrayVisualization, {
  EnhancedArrayVisualizationHandle,
} from "@/components/canvas/Array/EnhancedArrayVisualization";
import ArrayViewPanel from "@/components/controls/ArrayViewPanel";
import DatasetPanel from "@/components/controls/DatasetPanel";
import Transport from "@/components/controls/Transport";
import DebugPanel from "@/components/debug/DebugPanel";
import { usePerformanceMonitor } from "@/components/debug/PerformanceMonitor";
import AboutPanel from "@/components/panels/AboutPanel";
import CodePanel from "@/components/panels/CodePanel";
import CollapsibleExportPanel from "@/components/panels/CollapsibleExportPanel";
import ComplexityExplorer from "@/components/panels/ComplexityExplorer";
import { KeyboardShortcutsButton } from "@/components/panels/KeyboardShortcutsPanel";
import HomeButton from "@/components/ui/HomeButton";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { findAlgo } from "@/engine/registry";
import { useRunner } from "@/engine/runner";
import * as url from "@/engine/urlState";
import { LanguageSwitcher, useI18n } from "@/i18n";
import { LogCategory, logger, useComponentLogger } from "@/services/monitoring";
import type { AlgoMeta } from "@/types/algorithms";
import { cn, makeRandomArray } from "@/utils";

export default function VisualizerPage() {
  const { t } = useI18n();
  const componentLogger = useComponentLogger("VisualizerPage");
  const { topic = "", slug = "" } = useParams();

  // Log page navigation
  useEffect(() => {
    logger.info(LogCategory.ROUTER, "VisualizerPage accessed", {
      topic,
      slug,
      url: window.location.href,
    });
    componentLogger.mount();

    return () => componentLogger.unmount();
  }, [topic, slug, componentLogger]);

  const [meta, setMeta] = useState<AlgoMeta | null>(null);
  const [isLoadingMeta, setIsLoadingMeta] = useState(true);

  // Debug panel state (Dev Mode)
  const [showDebugPanel, setShowDebugPanel] = useState(false);

  // Performance monitor hook (Dev Mode)
  const performanceMonitor = usePerformanceMonitor();

  // Load algorithm metadata asynchronously
  useEffect(() => {
    const loadMeta = async () => {
      setIsLoadingMeta(true);
      try {
        const loadedMeta = await findAlgo(topic, slug);
        setMeta(loadedMeta);

        // Log algorithm resolution
        if (loadedMeta) {
          logger.info(LogCategory.ALGORITHM, "Algorithm found", {
            topic,
            slug,
            title: loadedMeta.title,
            algoTopic: loadedMeta.topic,
          });
        } else {
          logger.warn(LogCategory.ALGORITHM, "Algorithm not found", {
            topic,
            slug,
          });
        }
      } catch (error) {
        logger.error(LogCategory.ALGORITHM, "Error loading algorithm", {
          error,
        });
        setMeta(null);
      } finally {
        setIsLoadingMeta(false);
      }
    };

    loadMeta();
  }, [topic, slug]);

  const params = useMemo(() => {
    const urlParams = url.read();
    logger.debug(LogCategory.STATE, "URL parameters parsed", {
      params: Object.fromEntries(urlParams.entries()),
    });
    return urlParams;
  }, []);

  const initialN = Number(params.get("n") ?? 16);
  const initialSeed = Number(params.get("seed") ?? 42);
  const initialSpeed = Number(params.get("speed") ?? 1);

  // Log initialization parameters
  useEffect(() => {
    logger.debug(LogCategory.ALGORITHM, "Initialization parameters", {
      arraySize: initialN,
      seed: initialSeed,
      speed: initialSpeed,
    });
  }, [initialN, initialSeed, initialSpeed]);

  const [frames, setFrames] = useState<unknown[]>([]);
  const [input, setInput] = useState<number[]>(() => {
    // For searching algorithms, we need a sorted array for binary search
    let array = makeRandomArray(initialN, 5, 99, initialSeed);
    if (meta?.topic === "searching" && meta.slug === "binary-search") {
      array = array.sort((a, b) => a - b);
    }

    logger.debug(LogCategory.ALGORITHM, "Initial array generated", {
      size: array.length,
      seed: initialSeed,
      array: array.slice(0, 10), // Log first 10 elements
      topic: meta?.topic,
      sorted: meta?.topic === "searching" && meta.slug === "binary-search",
    });
    return array;
  });

  // Additional state for search algorithms
  const [searchTarget, setSearchTarget] = useState(25);

  const [colors, setColors] = useState({
    base: "#1667b7",
    compared: "#eab308",
    swapped: "#ef4444",
    pivot: "#3b82f6",
    highlighted: "#a855f7",
  });
  const [panMode, setPanMode] = useState(false);
  const [dragging, setDragging] = useState(true);
  const [gridOn, setGridOn] = useState(true);
  const [snapOn, setSnapOn] = useState(true);
  const [view, setView] = useState<"bars" | "dots" | "table">("bars");
  const [colorMode, setColorMode] = useState<
    "plain" | "rainbow" | "value" | "custom"
  >("rainbow");
  const [showPlane, setShowPlane] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [activeTab, setActiveTab] = useState<"canvas" | "complexity">("canvas");
  const [enhancedMode, setEnhancedMode] = useState(false);

  // Refs must be declared unconditionally (before any early return)
  const surfaceRef = useRef<HTMLDivElement | null>(null);
  const canvasHandle = useRef<ArrayCanvasHandle>(null);
  const enhancedCanvasHandle = useRef<EnhancedArrayVisualizationHandle>(null);

  useEffect(() => {
    if (!meta) return;
    let mounted = true;
    (async () => {
      const { run } = await meta.load();

      // Prepare input based on algorithm type
      let algorithmInput: unknown;
      switch (meta.topic) {
        case "searching": {
          algorithmInput = { array: input, target: searchTarget };
          break;
        }
        case "graphs": {
          // For graph algorithms, we need to create a simple graph structure
          // For now, we'll convert the array to a simple adjacency list
          const graph = input.map((_, i) =>
            input
              .slice(i + 1, Math.min(i + 4, input.length))
              .map((_, j) => i + j + 1)
          );
          algorithmInput = { graph, startNode: 0 };
          break;
        }
        case "arrays":
        case "sorting":
        default: {
          algorithmInput = input;
          break;
        }
      }

      const it = run(algorithmInput, { seed: initialSeed });
      const all: unknown[] = [];
      for (let f = it.next(); !f.done; f = it.next()) all.push(f.value);
      if (mounted) setFrames(all);
    })();
    return () => {
      mounted = false;
    };
  }, [meta, input, initialSeed, searchTarget]);

  const total = frames.length;
  const runner = useRunner(total, initialSpeed);
  type Frame = {
    array?: number[];
    highlights?: {
      compared?: [number, number];
      swapped?: [number, number];
      pivot?: number;
      indices?: number[];
    };
    pcLine?: number;
    explain?: string;
  };

  const frame = (frames[runner.idx] as Frame) ?? {};

  useEffect(() => {
    url.write({
      step: runner.idx,
      speed: runner.speed,
      n: input.length,
      seed: initialSeed,
      theme: document.documentElement.getAttribute("data-theme") || undefined,
    });
  }, [runner.idx, runner.speed, input.length, initialSeed]);

  // Show loading state while algorithm is being loaded
  if (isLoadingMeta) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {t("loading.algorithm", { defaultValue: "Loading algorithm..." })}
          </p>
        </div>
      </div>
    );
  }

  // Show error state if algorithm is not found after loading
  if (!meta) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-red-100 p-4 dark:bg-red-900/20">
            <svg
              className="h-8 w-8 text-red-600 dark:text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
          </div>
          <h2 className="mb-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
            {t("errors.algorithmNotFound", {
              defaultValue: "Algorithm not found",
            })}
          </h2>
          <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
            The algorithm "{topic}/{slug}" could not be found.
          </p>
          <button
            onClick={() => window.history.back()}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none dark:focus:ring-offset-slate-900"
          >
            {t("navigation.goBack", { defaultValue: "Go Back" })}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid max-h-screen min-h-screen grid-rows-[auto_1fr] gap-3 overflow-hidden p-3">
      {/* Top bar */}
      <div className="flex shrink-0 items-center justify-between">
        <HomeButton />
        <h1 className="text-2xl font-bold tracking-tight">
          {meta.title ||
            t("navigation.visualizer", { defaultValue: "Visualizer" })}
        </h1>
        <div className="flex items-center gap-2">
          <LanguageSwitcher variant="dropdown" />
          <ThemeToggle />
        </div>
      </div>

      {/* 3-column surface. Single row; center stretches. */}
      <div
        ref={surfaceRef}
        className="viz-surface grid min-h-0 grid-cols-[320px_minmax(0,1fr)_360px] items-stretch gap-3 overflow-hidden"
      >
        {/* LEFT COLUMN (panels scroll, player pinned bottom) */}
        <div className="flex min-h-0 min-w-0 flex-col overflow-hidden">
          {/* scrollable stack */}
          <div className="grid min-h-0 content-start gap-3 overflow-auto pr-1">
            <DatasetPanel
              value={input}
              onChange={(a) => {
                setInput(a);
                runner.toStart();
              }}
            />

            {/* Search Target Control for searching algorithms */}
            {meta?.topic === "searching" && (
              <div className="card p-4">
                <div className="mb-3">
                  <h3 className="font-medium text-slate-900 dark:text-slate-100">
                    Search Target
                  </h3>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    Value to search for in the array
                  </p>
                </div>
                <div className="space-y-2">
                  <input
                    type="number"
                    value={searchTarget}
                    onChange={(e) => {
                      setSearchTarget(Number(e.target.value));
                      runner.toStart();
                    }}
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                    min={5}
                    max={99}
                    placeholder="Enter target value"
                    title="Target value to search for"
                  />
                  {meta.slug === "binary-search" && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Array is automatically sorted for binary search
                    </p>
                  )}
                </div>
              </div>
            )}
            <ArrayViewPanel
              view={view}
              onView={setView}
              colorMode={colorMode}
              onColorMode={setColorMode}
              colors={colors}
              onColorsChange={setColors}
              showLabels={showLabels}
              onShowLabels={setShowLabels}
              showPlane={showPlane}
              onShowPlane={setShowPlane}
            />
            <CanvasToolbar
              surfaceRef={surfaceRef}
              canvasHandle={enhancedMode ? enhancedCanvasHandle : canvasHandle}
              panMode={panMode}
              onPanMode={setPanMode}
              dragging={dragging}
              onDragging={setDragging}
              gridOn={gridOn}
              snapOn={snapOn}
            />
          </div>

          {/* player pinned at the very bottom of LEFT */}
          <div className="shrink-0 pt-3">
            <Transport
              playing={runner.playing}
              direction={runner.direction}
              onPlayForward={runner.playForward}
              onPlayBackward={runner.playBackward}
              onPause={runner.pause}
              onPrev={runner.stepPrev}
              onNext={runner.stepNext}
              onToStart={runner.toStart}
              onToEnd={runner.toEnd}
              speed={runner.speed}
              onSpeedChange={runner.setSpeed}
              idx={runner.idx}
              total={total}
              onSeek={runner.setIdx}
            />
          </div>
        </div>

        {/* CENTER (canvas/complexity with tabs) */}
        <div className="flex min-h-0 flex-col">
          {/* Tab Navigation */}
          <div className="flex rounded-t-xl border-b border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
            <button
              onClick={() => setActiveTab("canvas")}
              className={cn(
                "flex-1 rounded-tl-xl px-4 py-3 text-sm font-medium transition-colors",
                activeTab === "canvas"
                  ? "bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 border-primary-500 border-b-2"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
              )}
            >
              🎨 Visualization
            </button>
            <button
              onClick={() => setActiveTab("complexity")}
              className={cn(
                "flex-1 rounded-tr-xl px-4 py-3 text-sm font-medium transition-colors",
                activeTab === "complexity"
                  ? "bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 border-primary-500 border-b-2"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
              )}
            >
              📊 Complexity Analysis
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex min-h-0 flex-1 flex-col rounded-b-xl bg-white dark:bg-slate-900">
            {activeTab === "canvas" ? (
              <>
                {/* Enhanced Visualization Toggle */}
                <div className="flex items-center justify-between border-b border-slate-200 p-3 dark:border-slate-700">
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Visualization Mode
                  </div>
                  <button
                    onClick={() => setEnhancedMode(!enhancedMode)}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                      enhancedMode
                        ? "bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300"
                        : "bg-slate-100 text-slate-600 hover:text-slate-900 dark:bg-slate-800 dark:text-slate-400 dark:hover:text-slate-100"
                    )}
                  >
                    {enhancedMode ? "📊" : "🎨"}
                    {enhancedMode ? "Enhanced Charts" : "Classic Canvas"}
                  </button>
                </div>

                {/* Visualization Content */}
                <div className="min-h-0 flex-1">
                  {enhancedMode ? (
                    <EnhancedArrayVisualization
                      ref={enhancedCanvasHandle}
                      array={frame.array ?? input}
                      highlights={frame.highlights}
                      viewMode={view}
                      colorMode={colorMode}
                      colors={colors}
                      showLabels={showLabels}
                      height="100%"
                      className="h-full"
                      onReorder={(next) => {
                        setInput(next);
                        runner.toStart();
                      }}
                      panModeExternal={panMode}
                      dragEnabled={dragging}
                      onViewChange={(s) => {
                        setGridOn(s.grid);
                        setSnapOn(s.snap);
                      }}
                      showPlane={showPlane}
                    />
                  ) : (
                    <ArrayCanvas
                      ref={canvasHandle}
                      array={frame.array ?? input}
                      highlights={frame.highlights}
                      onReorder={(next: number[]) => {
                        setInput(next);
                        runner.toStart();
                      }}
                      height="100%"
                      colors={colors}
                      panModeExternal={panMode}
                      dragEnabled={dragging}
                      onViewChange={(s: { grid: boolean; snap: boolean }) => {
                        setGridOn(s.grid);
                        setSnapOn(s.snap);
                      }}
                      viewMode={view}
                      colorMode={colorMode}
                      showPlane={showPlane}
                      showLabels={showLabels}
                    />
                  )}
                </div>
              </>
            ) : (
              <div className="h-full overflow-auto p-6">
                <ComplexityExplorer
                  algorithmName={meta.title}
                  complexity={{
                    time: meta.complexity.time,
                    space: meta.complexity.space,
                    stable: meta.complexity.stable,
                    inPlace: meta.complexity.inPlace,
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="flex min-h-0 flex-col gap-3 overflow-hidden">
          <div className="max-h-[65vh] shrink-0 overflow-auto">
            <CodePanel
              meta={meta}
              activePcLine={frame.pcLine}
              explain={frame.explain}
              fillHeight={false}
            />
          </div>
          {/* ExportPanel moved below AboutPanel and made collapsible */}
          <div className="grid min-h-0 flex-1 content-start gap-3 overflow-auto">
            <AboutPanel meta={meta} />
            <CollapsibleExportPanel
              array={frame.array ?? input}
              view={view}
              colorMode={colorMode}
              colors={colors}
              showPlane={showPlane}
              showLabels={showLabels}
              framesProvider={() =>
                (frames as Frame[]).map((f: Frame) => ({
                  array: f.array ?? input,
                  highlights: f.highlights,
                  view,
                  colorMode,
                  colors,
                  showPlane,
                  showLabels,
                  width: 1200,
                  height: 360,
                }))
              }
              watermarkUrl="/brand/AlgoLens.webp"
            />
          </div>
        </div>
      </div>

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

      {/* Keyboard Shortcuts */}
      <KeyboardShortcutsButton />

      {/* Floating Debug Tools (Dev Mode) */}
      {import.meta.env.DEV && (
        <>
          {/* Performance Monitor Button */}
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
