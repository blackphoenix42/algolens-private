// src/pages/VisualizerPage.tsx
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";

// import { AIChatPanel } from "@/components/ai/AIChatPanel";
import ArrayCanvas, {
  ArrayCanvasHandle,
} from "@/components/canvas/Array/ArrayCanvas";
import CanvasToolbar from "@/components/canvas/Array/CanvasToolbar";
// import EnhancedArrayVisualization, {
//   EnhancedArrayVisualizationHandle,
// } from "@/components/canvas/Array/EnhancedArrayVisualization";
import ArrayViewPanel from "@/components/controls/ArrayViewPanel";
import DatasetPanel from "@/components/controls/DatasetPanel";
import Transport from "@/components/controls/Transport";
// import DebugPanel from "@/components/debug/DebugPanel";
// import { usePerformanceMonitor } from "@/components/debug/PerformanceMonitor";
import AboutPanel from "@/components/panels/AboutPanel";
import CodePanel from "@/components/panels/CodePanel";
import CollapsibleExportPanel from "@/components/panels/CollapsibleExportPanel";
import ComplexityExplorer from "@/components/panels/ComplexityExplorer";
// import { KeyboardShortcutsButton } from "@/components/panels/KeyboardShortcutsPanel";
import HomeButton from "@/components/ui/HomeButton";
import LoadingScreen from "@/components/ui/LoadingScreen";
import MobilePortraitWarning from "@/components/ui/MobilePortraitWarning";
// import ThemeToggle from "@/components/ui/ThemeToggle";
// import { ENABLE_AI_UI } from "@/config/featureFlags";
import { findAlgo } from "@/engine/registry";
import { useRunner } from "@/engine/runner";
import * as url from "@/engine/urlState";
import { useMobileOrientation } from "@/hooks/useOrientation";
// import { LanguageSwitcher, useI18n } from "@/i18n";
// import { LogCategory, logger, useComponentLogger } from "@/services/monitoring";
import type { AlgoMeta } from "@/types/algorithms";
import { cn, makeRandomArray } from "@/utils";

// Frame type definitions for algorithm visualization
interface BaseFrame {
  array?: number[];
  highlights?: {
    compared?: [number, number];
    swapped?: [number, number];
    pivot?: number;
    indices?: number[];
  };
  pcLine?: number;
  explain?: string;
}

// Constants for the visualizer
const VISUALIZER_CONSTANTS = {
  LOADING_DELAY: 200,
  DEFAULT_ARRAY_SIZE: 16,
  DEFAULT_SEED: 42,
  DEFAULT_SPEED: 1,
  DEFAULT_SEARCH_TARGET: 25,
  VALUE_RANGE: { min: 5, max: 99 },
  MOBILE_MIN_HEIGHT: "50vh",
  MOBILE_MAX_CODE_HEIGHT: "30vh",
  DESKTOP_MAX_CODE_HEIGHT: "65vh",
  CANVAS_EXPORT: {
    width: 1200,
    height: 360,
  },
} as const;

export default function VisualizerPage() {
  // const { t } = useI18n();
  // const componentLogger = useComponentLogger("VisualizerPage");
  const { topic = "", slug = "" } = useParams();

  // Mobile orientation detection
  const { isMobile, isMobilePortrait } = useMobileOrientation();

  // Log page navigation
  useEffect(() => {
    // componentLogger.mount();
    // return () => componentLogger.unmount();
  }, [topic, slug, isMobile, isMobilePortrait]);

  const [meta, setMeta] = useState<AlgoMeta | null>(null);
  const [isLoadingMeta, setIsLoadingMeta] = useState(true);
  const [showLoadingUI, setShowLoadingUI] = useState(true); // Show immediately
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingPhase, setLoadingPhase] = useState<string>("Initializing...");
  const [algorithmError, setAlgorithmError] = useState<Error | null>(null);

  // Debug panel state (Dev Mode)
  // const [showDebugPanel, setShowDebugPanel] = useState(false);

  // Performance monitor hook (Dev Mode)
  // const performanceMonitor = usePerformanceMonitor();

  // Load algorithm metadata asynchronously
  useEffect(() => {
    const loadMeta = async () => {
      setIsLoadingMeta(true);
      setShowLoadingUI(true);
      setLoadingProgress(0);
      setLoadingPhase("Initializing...");

      const startTime = Date.now();
      const minLoadingTime = 800; // Minimum 800ms to show loading screen

      try {
        // Simulate progress phases
        setLoadingPhase("Loading algorithm metadata...");
        setLoadingProgress(25);

        await new Promise((resolve) => setTimeout(resolve, 150)); // Small delay for UX

        setLoadingPhase("Parsing algorithm structure...");
        setLoadingProgress(50);

        const loadedMeta = await findAlgo(topic, slug);

        setLoadingPhase("Setting up visualization...");
        setLoadingProgress(75);

        await new Promise((resolve) => setTimeout(resolve, 100)); // Small delay for UX

        setMeta(loadedMeta);

        setLoadingPhase("Finalizing...");
        setLoadingProgress(100);

        // Ensure minimum loading time for better UX
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, minLoadingTime - elapsedTime);
        await new Promise((resolve) => setTimeout(resolve, remainingTime));

        if (!loadedMeta) {
          console.warn("Algorithm not found:", { topic, slug });
        }
      } catch (error) {
        console.error("Error loading algorithm:", error);
        setMeta(null);
        setLoadingPhase("Error occurred");
        setLoadingProgress(0);
      } finally {
        setIsLoadingMeta(false);
        setShowLoadingUI(false);
      }
    };

    loadMeta();
  }, [topic, slug]);

  const params = useMemo(() => {
    const urlParams = url.read();
    return urlParams;
  }, []);

  const initialN = Number(
    params.get("n") ?? VISUALIZER_CONSTANTS.DEFAULT_ARRAY_SIZE
  );
  const initialSeed = Number(
    params.get("seed") ?? VISUALIZER_CONSTANTS.DEFAULT_SEED
  );
  const initialSpeed = Number(
    params.get("speed") ?? VISUALIZER_CONSTANTS.DEFAULT_SPEED
  );

  const [frames, setFrames] = useState<BaseFrame[]>([]);
  const [input, setInput] = useState<number[]>(() => {
    // For searching algorithms, we need a sorted array for binary search
    let array = makeRandomArray(
      initialN,
      VISUALIZER_CONSTANTS.VALUE_RANGE.min,
      VISUALIZER_CONSTANTS.VALUE_RANGE.max,
      initialSeed
    );
    if (meta?.topic === "searching" && meta.slug === "binary-search") {
      array = array.sort((a, b) => a - b);
    }

    return array;
  });

  // Additional state for search algorithms
  const [searchTarget, setSearchTarget] = useState<number>(
    VISUALIZER_CONSTANTS.DEFAULT_SEARCH_TARGET
  );

  // Optimized algorithm input preparation
  const algorithmInput = useMemo(() => {
    if (!meta) return null;

    switch (meta.topic) {
      case "searching":
        return { array: input, target: searchTarget };
      case "graphs":
        return {
          graph: input.map((_, i) =>
            input
              .slice(i + 1, Math.min(i + 4, input.length))
              .map((_, j) => i + j + 1)
          ),
          startNode: 0,
        };
      default:
        return input;
    }
  }, [meta, input, searchTarget]);

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
  // const [enhancedMode, setEnhancedMode] = useState(false);

  // AI Chat Panel state
  // const [showAIChat, setShowAIChat] = useState(false);

  // Refs must be declared unconditionally (before any early return)
  const surfaceRef = useRef<HTMLDivElement | null>(null);
  const canvasHandle = useRef<ArrayCanvasHandle>(null);
  // const enhancedCanvasHandle = useRef<EnhancedArrayVisualizationHandle>(null);

  useEffect(() => {
    if (!meta) return;
    let mounted = true;
    (async () => {
      try {
        setAlgorithmError(null);
        const { run } = await meta.load();

        // Use the memoized algorithm input
        const preparedInput = algorithmInput ?? input;

        const it = run(preparedInput, { seed: initialSeed });
        const all: BaseFrame[] = [];
        for (let f = it.next(); !f.done; f = it.next())
          all.push(f.value as BaseFrame);
        if (mounted) setFrames(all);
      } catch (error) {
        console.error("Algorithm execution error:", error);
        if (mounted) {
          setAlgorithmError(
            error instanceof Error
              ? error
              : new Error("Algorithm execution failed")
          );
          setFrames([]);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, [meta, input, initialSeed, searchTarget, algorithmInput]);

  const total = frames.length;
  const runner = useRunner(total, initialSpeed);

  const frame = (frames[runner.idx] as BaseFrame) ?? {};

  // Optimized event handlers with useCallback
  const handleDatasetChange = useCallback(
    (newArray: number[]) => {
      setInput(newArray);
      runner.toStart();
    },
    [runner]
  );

  const handleSearchTargetChange = useCallback(
    (value: number) => {
      setSearchTarget(value);
      runner.toStart();
    },
    [runner]
  );

  const handleArrayReorder = useCallback(
    (next: number[]) => {
      setInput(next);
      runner.toStart();
    },
    [runner]
  );

  const handleViewChange = useCallback(
    (settings: { grid: boolean; snap: boolean }) => {
      setGridOn(settings.grid);
      setSnapOn(settings.snap);
    },
    []
  );

  useEffect(() => {
    url.write({
      step: runner.idx,
      speed: runner.speed,
      n: input.length,
      seed: initialSeed,
      theme: document.documentElement.getAttribute("data-theme") || undefined,
    });
  }, [runner.idx, runner.speed, input.length, initialSeed]);

  // Handle custom algolens events from KeyboardProvider and clickable shortcuts
  useEffect(() => {
    const handlePlayPause = () => {
      if (runner.playing) {
        runner.pause();
      } else {
        runner.playForward();
      }
    };

    const handleStepForward = () => {
      runner.stepNext();
    };

    const handleStepBackward = () => {
      runner.stepPrev();
    };

    const handleReset = () => {
      runner.toStart();
      runner.pause();
    };

    const handleSpeedUp = () => {
      const newSpeed = Math.min(runner.speed * 1.5, 8);
      runner.setSpeed(newSpeed);
    };

    const handleSpeedDown = () => {
      const newSpeed = Math.max(runner.speed / 1.5, 0.1);
      runner.setSpeed(newSpeed);
    };

    const handleGoToStart = () => {
      runner.toStart();
    };

    const handleGoToEnd = () => {
      runner.toEnd();
    };

    const handleSetSpeed = (event: CustomEvent) => {
      const speed = event.detail;
      runner.setSpeed(speed);
    };

    // Add event listeners
    document.addEventListener("algolens:play-pause", handlePlayPause);
    document.addEventListener("algolens:step-forward", handleStepForward);
    document.addEventListener("algolens:step-backward", handleStepBackward);
    document.addEventListener("algolens:reset", handleReset);
    document.addEventListener("algolens:speed-up", handleSpeedUp);
    document.addEventListener("algolens:speed-down", handleSpeedDown);
    document.addEventListener("algolens:go-to-start", handleGoToStart);
    document.addEventListener("algolens:go-to-end", handleGoToEnd);
    document.addEventListener(
      "algolens:set-speed",
      handleSetSpeed as EventListener
    );

    return () => {
      document.removeEventListener("algolens:play-pause", handlePlayPause);
      document.removeEventListener("algolens:step-forward", handleStepForward);
      document.removeEventListener(
        "algolens:step-backward",
        handleStepBackward
      );
      document.removeEventListener("algolens:reset", handleReset);
      document.removeEventListener("algolens:speed-up", handleSpeedUp);
      document.removeEventListener("algolens:speed-down", handleSpeedDown);
      document.removeEventListener("algolens:go-to-start", handleGoToStart);
      document.removeEventListener("algolens:go-to-end", handleGoToEnd);
      document.removeEventListener(
        "algolens:set-speed",
        handleSetSpeed as EventListener
      );
    };
  }, [runner]);

  // Show loading state while algorithm is being loaded
  if (isLoadingMeta && showLoadingUI) {
    return (
      <LoadingScreen
        progress={loadingProgress}
        phase={loadingPhase}
        topic={topic}
        slug={slug}
        isMobile={isMobile}
      />
    );
  }

  // Show error state for algorithm execution errors
  if (algorithmError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="max-w-md text-center">
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
            Algorithm Error
          </h2>
          <p className="mb-2 text-sm text-slate-600 dark:text-slate-400">
            There was an error executing the algorithm:
          </p>
          <p className="mb-4 rounded bg-red-50 p-2 font-mono text-xs text-red-600 dark:bg-red-900/10 dark:text-red-400">
            {algorithmError.message}
          </p>
          <div className="space-x-2">
            <button
              onClick={() => {
                setAlgorithmError(null);
                setFrames([]);
              }}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none dark:focus:ring-offset-slate-900"
            >
              Try Again
            </button>
            <button
              onClick={() => window.history.back()}
              className="rounded-lg bg-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-400 focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:outline-none dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500 dark:focus:ring-offset-slate-900"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Portrait Warning Overlay for Mobile */}
      <MobilePortraitWarning isVisible={isMobilePortrait} />

      <div
        className={cn(
          "animate-fade-in grid min-h-screen",
          // Mobile responsive: allow scrolling, remove overflow-hidden
          isMobile
            ? "grid-rows-[auto_1fr] gap-2 p-2"
            : "max-h-screen grid-rows-[auto_1fr] gap-3 overflow-hidden p-3"
        )}
        style={{
          animation: "fadeIn 0.5s ease-out forwards",
        }}
      >
        {/* Top bar */}
        <div
          className={cn(
            "flex shrink-0 items-center justify-between",
            isMobile ? "px-1" : "px-0"
          )}
        >
          <HomeButton />
          <h1
            className={cn(
              "font-bold tracking-tight",
              isMobile ? "text-lg sm:text-xl" : "text-2xl"
            )}
          >
            {meta?.title ||
              /* t("navigation.visualizer", { defaultValue: "Visualizer" }) */
              "Visualizer"}
          </h1>
          <div className="flex items-center gap-2">
            {/* <LanguageSwitcher variant="dropdown" /> */}
            {/* <ThemeToggle /> */}
            {/* {ENABLE_AI_UI && meta && (
              <button
                onClick={() => setShowAIChat(true)}
                className="flex items-center gap-2 rounded bg-gradient-to-r from-blue-500 to-indigo-600 px-3 py-1.5 text-sm text-white transition-colors hover:from-blue-600 hover:to-indigo-700"
                title="AI Assistant - Get help with this algorithm"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <span className="hidden sm:inline">AI Help</span>
              </button>
            )} */}
          </div>
        </div>

        {/* 3-column surface. Single row; center stretches. */}
        <div
          ref={surfaceRef}
          className={cn(
            "viz-surface min-h-0 items-stretch",
            isMobile
              ? // Mobile: Single column, scrollable without height constraints, add bottom padding
                "flex flex-col gap-3 overflow-y-auto pb-6"
              : // Desktop: 3-column layout with overflow hidden
                "grid grid-cols-[320px_minmax(0,1fr)_360px] gap-3 overflow-hidden"
          )}
        >
          {/* LEFT COLUMN (panels scroll, player pinned bottom) */}
          <div
            className={cn(
              "flex min-h-0 min-w-0 flex-col",
              isMobile
                ? "order-2 flex-shrink-0" // On mobile, show after canvas, natural height
                : "overflow-hidden"
            )}
          >
            {/* scrollable stack */}
            <div
              className={cn(
                "grid min-h-0 content-start gap-3 pr-1",
                isMobile
                  ? "gap-2" // Smaller gaps on mobile, no overflow constraints
                  : "overflow-auto"
              )}
            >
              <DatasetPanel value={input} onChange={handleDatasetChange} />

              {/* Search Target Control for searching algorithms */}
              {meta?.topic === "searching" && (
                <div className={cn("card p-4", isMobile && "p-3")}>
                  <div className="mb-3">
                    <h3
                      className={cn(
                        "font-medium text-slate-900 dark:text-slate-100",
                        isMobile && "text-sm"
                      )}
                    >
                      Search Target
                    </h3>
                    <p
                      className={cn(
                        "mt-1 text-sm text-slate-600 dark:text-slate-400",
                        isMobile && "text-xs"
                      )}
                    >
                      Value to search for in the array
                    </p>
                  </div>
                  <div className="space-y-2">
                    <input
                      type="number"
                      value={searchTarget}
                      onChange={(e) =>
                        handleSearchTargetChange(Number(e.target.value))
                      }
                      className={cn(
                        "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100",
                        isMobile && "text-sm" // Smaller text on mobile
                      )}
                      min={VISUALIZER_CONSTANTS.VALUE_RANGE.min}
                      max={VISUALIZER_CONSTANTS.VALUE_RANGE.max}
                      placeholder="Enter target value"
                      title="Target value to search for"
                      aria-label="Search target value"
                    />
                    {meta.slug === "binary-search" && (
                      <p
                        className={cn(
                          "text-xs text-slate-500 dark:text-slate-400",
                          isMobile && "text-xs" // Already small
                        )}
                      >
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
                canvasHandle={
                  // enhancedMode ? enhancedCanvasHandle :
                  canvasHandle
                }
                panMode={panMode}
                onPanMode={setPanMode}
                dragging={dragging}
                onDragging={setDragging}
                gridOn={gridOn}
                snapOn={snapOn}
              />
            </div>

            {/* player pinned at the very bottom of LEFT */}
            <div
              className={cn(
                "shrink-0 pt-3",
                isMobile && "pt-2" // Smaller top padding on mobile
              )}
            >
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
          <div
            className={cn(
              "flex min-h-0 flex-col",
              isMobile
                ? "order-1 min-h-[50vh] flex-shrink-0" // On mobile, minimum height but allow growth
                : ""
            )}
          >
            {/* Tab Navigation */}
            <div className="flex rounded-t-xl border-b border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
              <button
                onClick={() => setActiveTab("canvas")}
                className={cn(
                  "flex-1 rounded-tl-xl px-4 py-3 text-sm font-medium transition-colors",
                  // Mobile: smaller padding and text
                  isMobile && "px-3 py-2 text-xs",
                  activeTab === "canvas"
                    ? "bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 border-primary-500 border-b-2"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                )}
              >
                {isMobile ? "🎨 Viz" : "🎨 Visualization"}
              </button>
              <button
                onClick={() => setActiveTab("complexity")}
                className={cn(
                  "flex-1 rounded-tr-xl px-4 py-3 text-sm font-medium transition-colors",
                  // Mobile: smaller padding and text
                  isMobile && "px-3 py-2 text-xs",
                  activeTab === "complexity"
                    ? "bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 border-primary-500 border-b-2"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                )}
              >
                {isMobile ? "📊 Analysis" : "📊 Complexity Analysis"}
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex min-h-0 flex-1 flex-col rounded-b-xl bg-white dark:bg-slate-900">
              {activeTab === "canvas" ? (
                <>
                  {/* Enhanced Visualization Toggle */}
                  {/*
                  <div
                    className={cn(
                      "flex items-center justify-between border-b border-slate-200 p-3 dark:border-slate-700",
                      isMobile && "p-2" // Smaller padding on mobile
                    )}
                  >
                    <div
                      className={cn(
                        "text-sm text-slate-600 dark:text-slate-400",
                        isMobile && "text-xs" // Smaller text on mobile
                      )}
                    >
                      {isMobile ? "Mode" : "Visualization Mode"}
                    </div>
                    <button
                      onClick={() => setEnhancedMode(!enhancedMode)}
                      className={cn(
                        "inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                        isMobile && "gap-1 px-2 py-1 text-xs", // Smaller on mobile
                        enhancedMode
                          ? "bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300"
                          : "bg-slate-100 text-slate-600 hover:text-slate-900 dark:bg-slate-800 dark:text-slate-400 dark:hover:text-slate-100"
                      )}
                    >
                      {enhancedMode ? "📊" : "🎨"}
                      {isMobile
                        ? enhancedMode
                          ? "Enhanced"
                          : "Classic"
                        : enhancedMode
                          ? "Enhanced Charts"
                          : "Classic Canvas"}
                    </button>
                  </div>
                  */}

                  {/* Visualization Content */}
                  <div className="min-h-0 flex-1">
                    {/*
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
                    ) : ( */}
                    <ArrayCanvas
                      ref={canvasHandle}
                      array={frame.array ?? input}
                      highlights={frame.highlights}
                      onReorder={handleArrayReorder}
                      height="100%"
                      colors={colors}
                      panModeExternal={panMode}
                      dragEnabled={dragging}
                      onViewChange={handleViewChange}
                      viewMode={view}
                      colorMode={colorMode}
                      showPlane={showPlane}
                      showLabels={showLabels}
                    />
                    {/* )} */}
                  </div>
                </>
              ) : (
                <div className="h-full overflow-auto p-6">
                  {meta && (
                    <ComplexityExplorer
                      algorithmName={meta.title}
                      complexity={{
                        time: meta.complexity.time,
                        space: meta.complexity.space,
                        stable: meta.complexity.stable,
                        inPlace: meta.complexity.inPlace,
                      }}
                    />
                  )}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div
            className={cn(
              "flex min-h-0 flex-col gap-3",
              isMobile
                ? "order-3 flex-shrink-0 gap-2" // On mobile, show last, natural height
                : "overflow-hidden"
            )}
          >
            <div
              className={cn(
                "shrink-0",
                isMobile
                  ? "max-h-[30vh] overflow-auto" // Scrollable on mobile
                  : "max-h-[65vh] overflow-auto"
              )}
            >
              {meta && (
                <CodePanel
                  meta={meta}
                  activePcLine={frame.pcLine}
                  explain={frame.explain}
                  fillHeight={false}
                />
              )}
            </div>
            {/* ExportPanel moved below AboutPanel and made collapsible */}
            <div
              className={cn(
                "grid content-start gap-3",
                isMobile
                  ? "min-h-0 gap-2" // Remove flex-1 constraints on mobile
                  : "min-h-0 flex-1 overflow-auto"
              )}
            >
              {meta && <AboutPanel meta={meta} />}
              <CollapsibleExportPanel
                array={frame.array ?? input}
                view={view}
                colorMode={colorMode}
                colors={colors}
                showPlane={showPlane}
                showLabels={showLabels}
                framesProvider={() =>
                  (frames as BaseFrame[]).map((f: BaseFrame) => ({
                    array: f.array ?? input,
                    highlights: f.highlights,
                    view,
                    colorMode,
                    colors,
                    showPlane,
                    showLabels,
                    width: VISUALIZER_CONSTANTS.CANVAS_EXPORT.width,
                    height: VISUALIZER_CONSTANTS.CANVAS_EXPORT.height,
                  }))
                }
                watermarkUrl="/brand/AlgoLens.webp"
              />
            </div>
          </div>
        </div>

        {/* Debug Panel (Dev Mode) */}
        {/* {import.meta.env.DEV && (
          <DebugPanel
            isOpen={showDebugPanel}
            onClose={() => {
              logger.info(LogCategory.USER_INTERACTION, "Debug panel closed", {
                timestamp: new Date().toISOString(),
              });
              setShowDebugPanel(false);
            }}
          />
        )} */}

        {/* Performance Monitor (Dev Mode) */}
        {/* {import.meta.env.DEV && <performanceMonitor.PerformanceMonitor />} */}

        {/* Keyboard Shortcuts - Hidden on mobile */}
        {/* {!isMobile && <KeyboardShortcutsButton />} */}

        {/* Floating Debug Tools (Dev Mode) */}
        {import.meta.env.DEV && !isMobile && (
          <>
            {/* Performance Monitor Button */}
            {/*
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
            */}

            {/* Debug Toggle Button */}
            {/*
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
            */}
          </>
        )}

        {/* AI Chat Panel (feature flagged) */}
        {/* {ENABLE_AI_UI && meta && (
          <AIChatPanel
            meta={meta}
            isOpen={showAIChat}
            onClose={() => setShowAIChat(false)}
            currentStep={frame.pcLine}
          />
        )} */}
      </div>
    </>
  );
}
