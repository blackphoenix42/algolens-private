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
import DebugToggle from "@/components/debug/DebugToggle";
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
import { makeRandomArray, cn } from "@/utils";

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

  const meta = findAlgo(topic, slug);

  // Log algorithm resolution
  useEffect(() => {
    if (meta) {
      logger.info(LogCategory.ALGORITHM, "Algorithm found", {
        topic,
        slug,
        title: meta.title,
        algoTopic: meta.topic,
      });
    } else {
      logger.warn(LogCategory.ALGORITHM, "Algorithm not found", {
        topic,
        slug,
      });
    }
  }, [meta, topic, slug]);

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

  if (!meta)
    return (
      <div className="p-4">
        {t("errors.algorithmNotFound", {
          defaultValue: "Algorithm not found.",
        })}
      </div>
    );

  return (
    <div className="min-h-screen overflow-hidden grid grid-rows-[auto_1fr] gap-3 p-3 max-h-screen">
      {/* Top bar */}
      <div className="flex items-center justify-between shrink-0">
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
        className="viz-surface min-h-0 grid grid-cols-[320px_minmax(0,1fr)_360px] items-stretch gap-3 overflow-hidden"
      >
        {/* LEFT COLUMN (panels scroll, player pinned bottom) */}
        <div className="min-h-0 flex flex-col min-w-0 overflow-hidden">
          {/* scrollable stack */}
          <div className="min-h-0 overflow-auto grid content-start gap-3 pr-1">
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
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
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
                    className="w-full px-3 py-2 border rounded-md
                             bg-white dark:bg-slate-800
                             border-slate-300 dark:border-slate-600
                             text-slate-900 dark:text-slate-100"
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
          <div className="pt-3 shrink-0">
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
        <div className="min-h-0 flex flex-col">
          {/* Tab Navigation */}
          <div className="flex bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 rounded-t-xl">
            <button
              onClick={() => setActiveTab("canvas")}
              className={cn(
                "flex-1 px-4 py-3 text-sm font-medium rounded-tl-xl transition-colors",
                activeTab === "canvas"
                  ? "bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 border-b-2 border-primary-500"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
              )}
            >
              🎨 Visualization
            </button>
            <button
              onClick={() => setActiveTab("complexity")}
              className={cn(
                "flex-1 px-4 py-3 text-sm font-medium rounded-tr-xl transition-colors",
                activeTab === "complexity"
                  ? "bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 border-b-2 border-primary-500"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
              )}
            >
              📊 Complexity Analysis
            </button>
          </div>

          {/* Tab Content */}
          <div className="min-h-0 flex-1 bg-white dark:bg-slate-900 rounded-b-xl flex flex-col">
            {activeTab === "canvas" ? (
              <>
                {/* Enhanced Visualization Toggle */}
                <div className="flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-700">
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Visualization Mode
                  </div>
                  <button
                    onClick={() => setEnhancedMode(!enhancedMode)}
                    className={cn(
                      "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                      enhancedMode
                        ? "bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                    )}
                  >
                    {enhancedMode ? "📊" : "🎨"}
                    {enhancedMode ? "Enhanced Charts" : "Classic Canvas"}
                  </button>
                </div>

                {/* Visualization Content */}
                <div className="flex-1 min-h-0">
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
              <div className="p-6 h-full overflow-auto">
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
        <div className="min-h-0 flex flex-col gap-3 overflow-hidden">
          <div className="shrink-0 max-h-[65vh] overflow-auto">
            <CodePanel
              meta={meta}
              activePcLine={frame.pcLine}
              explain={frame.explain}
              fillHeight={false}
            />
          </div>
          {/* ExportPanel moved below AboutPanel and made collapsible */}
          <div className="min-h-0 flex-1 overflow-auto grid gap-3 content-start">
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
              watermarkUrl="/brand/AlgoLens.png"
            />
          </div>
        </div>
      </div>

      {/* Debug and Keyboard Shortcuts */}
      {import.meta.env.DEV && <DebugToggle />}
      <KeyboardShortcutsButton />
    </div>
  );
}
