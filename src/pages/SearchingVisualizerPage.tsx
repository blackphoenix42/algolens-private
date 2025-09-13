// src/pages/SearchingVisualizerPage.tsx
import { useEffect, useRef, useState } from "react";

import ArrayCanvas, {
  ArrayCanvasHandle,
} from "@/components/canvas/Array/ArrayCanvas";
import DatasetPanel from "@/components/controls/DatasetPanel";
import Transport from "@/components/controls/Transport";
import DebugToggle from "@/components/debug/DebugToggle";
import AboutPanel from "@/components/panels/AboutPanel";
import CodePanel from "@/components/panels/CodePanel";
import { KeyboardShortcutsButton } from "@/components/panels/KeyboardShortcutsPanel";
import HomeButton from "@/components/ui/HomeButton";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { useRunner } from "@/engine/runner";
import * as url from "@/engine/urlState";
import { LanguageSwitcher } from "@/i18n";
import { useComponentLogger } from "@/services/monitoring";
import type { AlgoMeta } from "@/types/algorithms";
import { cn, makeRandomArray } from "@/utils";

interface SearchingVisualizerPageProps {
  meta: AlgoMeta;
}

export default function SearchingVisualizerPage({
  meta,
}: SearchingVisualizerPageProps) {
  const componentLogger = useComponentLogger("SearchingVisualizerPage");

  // Log page mount
  useEffect(() => {
    componentLogger.mount();
    return () => componentLogger.unmount();
  }, [componentLogger]);

  const [target, setTarget] = useState(5);
  const urlParams = url.read();

  // Parse URL parameters
  const N = Number(urlParams.get("n")) || 16;
  const MIN_VAL = Number(urlParams.get("min")) || 1;
  const MAX_VAL = Number(urlParams.get("max")) || 100;
  const initialSeed = Number(urlParams.get("seed")) || 42;

  const [input, setInput] = useState<number[]>(() => {
    // For searching algorithms, we typically want a sorted array for binary search
    const arr =
      meta.slug === "binary-search"
        ? Array.from({ length: N }, (_, i) => i + 1)
        : makeRandomArray(N, MIN_VAL, MAX_VAL);

    if (meta.slug === "binary-search") {
      // Ensure the array is sorted for binary search
      arr.sort((a, b) => a - b);
    }
    return arr;
  });

  // Make sure target is valid for binary search
  useEffect(() => {
    if (meta.slug === "binary-search" && !input.includes(target)) {
      setTarget(input[Math.floor(input.length / 2)] || 5);
    }
  }, [input, target, meta.slug]);

  const [frames, setFrames] = useState<unknown[]>([]);

  // Generate frames when inputs change
  useEffect(() => {
    let mounted = true;
    (async () => {
      const { run } = await meta.load();
      const algorithmInput = { array: input, target };

      const it = run(algorithmInput, { seed: initialSeed });
      const all: unknown[] = [];
      for (let f = it.next(); !f.done; f = it.next()) all.push(f.value);
      if (mounted) setFrames(all);
    })();
    return () => {
      mounted = false;
    };
  }, [meta, input, target, initialSeed]);

  const total = frames.length;
  const runner = useRunner(total, 1);

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
  const explain = frame?.explain || "";

  const arrayCanvasRef = useRef<ArrayCanvasHandle>(null);

  const handleTargetChange = (newTarget: number) => {
    setTarget(newTarget);
  };

  const [vizMode, setVizMode] = useState<"simple" | "enhanced">("simple");
  const [showComplexity] = useState(false);

  const exportTargetRef = useRef<HTMLDivElement | null>(null);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="border-b bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <HomeButton />
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {meta.title}
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {meta.summary}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <KeyboardShortcutsButton />
            {import.meta.env.DEV && <DebugToggle />}
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto p-4">
        <div className="grid h-[calc(100vh-120px)] grid-cols-1 gap-4 xl:grid-cols-3">
          {/* Left Panel: Controls */}
          <div className="space-y-4 overflow-y-auto xl:col-span-1">
            {/* Dataset Controls */}
            <DatasetPanel value={input} onChange={setInput} />

            {/* Target Input for Searching */}
            <div className="rounded-lg border bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                  Search Target
                </h3>
              </div>
              <div className="space-y-2">
                <label className="block text-sm text-slate-600 dark:text-slate-400">
                  Value to search for:
                </label>
                <input
                  type="number"
                  value={target}
                  onChange={(e) => handleTargetChange(Number(e.target.value))}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                  min={MIN_VAL}
                  max={MAX_VAL}
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

            {/* About Panel */}
            <AboutPanel meta={meta} />
          </div>

          {/* Center Panel: Visualization */}
          <div className="space-y-4 xl:col-span-1">
            <div ref={exportTargetRef} className="space-y-4">
              {/* Canvas Toolbar - removed problematic props */}
              <div className="rounded-lg border bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                    Visualization Mode
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setVizMode("simple")}
                      className={`rounded px-3 py-1 text-sm ${
                        vizMode === "simple"
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-200"
                      }`}
                    >
                      Simple
                    </button>
                    <button
                      onClick={() => setVizMode("enhanced")}
                      className={`rounded px-3 py-1 text-sm ${
                        vizMode === "enhanced"
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-200"
                      }`}
                    >
                      Enhanced
                    </button>
                  </div>
                </div>
              </div>

              {/* Array Visualization */}
              {vizMode === "simple" ? (
                <ArrayCanvas
                  ref={arrayCanvasRef}
                  array={frame?.array || input}
                  highlights={frame?.highlights || {}}
                />
              ) : (
                <div className="rounded-lg border bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
                  <p className="text-slate-600 dark:text-slate-400">
                    Enhanced visualization not available
                  </p>
                </div>
              )}

              {/* Algorithm Status */}
              <div className="rounded-lg border bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
                <h3 className="mb-2 font-semibold text-slate-900 dark:text-slate-100">
                  Algorithm Status
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {explain || "Ready to search"}
                </p>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-500">
                  Array size: {input.length} | Target: {target}
                </p>
              </div>

              {/* Complexity Explorer - simplified */}
              {showComplexity && (
                <div className="rounded-lg border bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
                  <h3 className="mb-2 font-semibold text-slate-900 dark:text-slate-100">
                    Complexity Analysis
                  </h3>
                  <div className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
                    <p>
                      <strong>Time:</strong>{" "}
                      {meta.complexity?.time?.average || "N/A"}
                    </p>
                    <p>
                      <strong>Space:</strong> {meta.complexity?.space || "N/A"}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Transport Controls - simplified */}
            <div
              className={cn(
                "sticky bottom-4 bg-white dark:bg-slate-900",
                "rounded-lg border p-4 shadow-lg dark:border-slate-700"
              )}
            >
              <Transport
                playing={runner.playing}
                direction={runner.direction}
                onPlayForward={() => runner.playForward()}
                onPlayBackward={() => runner.playBackward()}
                onPause={() => runner.pause()}
                onPrev={() => runner.stepPrev()}
                onNext={() => runner.stepNext()}
                onToStart={() => runner.toStart()}
                onToEnd={() => runner.toEnd()}
                speed={runner.speed}
                onSpeedChange={(speed) => runner.setSpeed(speed)}
                idx={runner.idx}
                total={total}
                onSeek={(idx) => runner.setIdx(idx)}
              />
            </div>
          </div>

          {/* Right Panel: Code */}
          <div className="xl:col-span-1">
            <CodePanel
              meta={meta}
              activePcLine={frame?.pcLine}
              explain={explain}
              fillHeight={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
