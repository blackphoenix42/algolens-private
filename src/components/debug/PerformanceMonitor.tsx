/**
 * Performance Monitor Component
 * Displays real-time performance metrics and optimization suggestions
 */

import {
  Activity,
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Cpu,
  Download,
  MemoryStick,
  Monitor,
  RefreshCcw,
  TrendingDown,
  TrendingUp,
  X,
} from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  performanceMetrics,
  trackWebVitals,
  useFPSMonitor,
  useMemoryMonitor,
} from "@/services/performance";

interface PerformanceMonitorProps {
  className?: string;
  isVisible?: boolean;
  onToggle?: () => void;
}

interface PerformanceHistory {
  timestamp: number;
  fps: number;
  memory: number;
  lcp: number;
  cls: number;
  fcp: number;
  ttfb: number;
  domContentLoaded: number;
  networkLatency: number;
}

// Mini chart component for performance history
function MiniChart({
  data,
  color = "#22c55e",
}: {
  data: number[];
  color?: string;
}) {
  if (data.length < 2) return null;

  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;

  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 100 - ((value - min) / range) * 100;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width="40" height="20" className="inline-block">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        points={points}
        className="opacity-80"
      />
    </svg>
  );
}

// Performance badge component
function PerformanceBadge({
  level,
  children,
}: {
  level: "excellent" | "good" | "poor" | "unknown";
  children: React.ReactNode;
}) {
  const colorMap = {
    excellent: "bg-green-100 text-green-800 border-green-200",
    good: "bg-yellow-100 text-yellow-800 border-yellow-200",
    poor: "bg-red-100 text-red-800 border-red-200",
    unknown: "bg-gray-100 text-gray-800 border-gray-200",
  };

  const iconMap = {
    excellent: <CheckCircle className="h-3 w-3" />,
    good: <AlertTriangle className="h-3 w-3" />,
    poor: <AlertTriangle className="h-3 w-3" />,
    unknown: <Clock className="h-3 w-3" />,
  };

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs ${colorMap[level]}`}
    >
      {iconMap[level]}
      {children}
    </div>
  );
}

export function PerformanceMonitor({
  className = "",
  isVisible = false,
  onToggle,
}: PerformanceMonitorProps) {
  const { fps } = useFPSMonitor();
  const memoryInfo = useMemoryMonitor();
  const [performanceHistory, setPerformanceHistory] = useState<
    PerformanceHistory[]
  >([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const historyRef = useRef<PerformanceHistory[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Update performance history
  const updateHistory = useCallback(() => {
    const now = Date.now();

    // Get additional performance metrics
    const getNetworkLatency = () => {
      if (performance.timing) {
        return performance.timing.responseEnd - performance.timing.requestStart;
      }
      return 0;
    };

    const getDOMContentLoaded = () => {
      if (performance.timing) {
        return (
          performance.timing.domContentLoadedEventEnd -
          performance.timing.navigationStart
        );
      }
      return 0;
    };

    const newEntry: PerformanceHistory = {
      timestamp: now,
      fps,
      memory: memoryInfo?.used || 0,
      lcp: performanceMetrics.lcp,
      cls: performanceMetrics.cls,
      fcp: performanceMetrics.fcp,
      ttfb: performanceMetrics.ttfb,
      domContentLoaded: getDOMContentLoaded(),
      networkLatency: getNetworkLatency(),
    };

    historyRef.current = [...historyRef.current.slice(-29), newEntry]; // Keep last 30 entries
    setPerformanceHistory(historyRef.current);
  }, [fps, memoryInfo]);
  useEffect(() => {
    trackWebVitals();
    const interval = setInterval(updateHistory, 1000);
    return () => clearInterval(interval);
  }, [updateHistory]);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isVisible &&
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        onToggle?.();
      }
    };

    if (isVisible) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isVisible, onToggle]);

  // Only show in development mode
  if (!import.meta.env.DEV) {
    return null;
  }

  if (!isVisible) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggle}
        className={`fixed right-4 bottom-4 z-50 border border-white/20 bg-black/80 text-white backdrop-blur-sm hover:bg-black/90 ${className}`}
        title="Show performance monitor (Ctrl+Shift+P)"
      >
        <Activity className="h-4 w-4" />
      </Button>
    );
  }

  const getPerformanceLevel = (
    metric: string,
    value: number
  ): { level: "excellent" | "good" | "poor" | "unknown"; color: string } => {
    switch (metric) {
      case "fps":
        if (value >= 55) return { level: "excellent", color: "text-green-500" };
        if (value >= 30) return { level: "good", color: "text-yellow-500" };
        return { level: "poor", color: "text-red-500" };

      case "lcp":
        if (value <= 2500)
          return { level: "excellent", color: "text-green-500" };
        if (value <= 4000) return { level: "good", color: "text-yellow-500" };
        return { level: "poor", color: "text-red-500" };

      case "cls":
        if (value <= 0.1)
          return { level: "excellent", color: "text-green-500" };
        if (value <= 0.25) return { level: "good", color: "text-yellow-500" };
        return { level: "poor", color: "text-red-500" };

      case "memory":
        if (value <= 50) return { level: "excellent", color: "text-green-500" };
        if (value <= 100) return { level: "good", color: "text-yellow-500" };
        return { level: "poor", color: "text-red-500" };

      default:
        return { level: "unknown", color: "text-gray-500" };
    }
  };

  const fpsStatus = getPerformanceLevel("fps", fps);
  const lcpStatus = getPerformanceLevel("lcp", performanceMetrics.lcp);
  const clsStatus = getPerformanceLevel("cls", performanceMetrics.cls);
  const memoryStatus = memoryInfo
    ? getPerformanceLevel("memory", memoryInfo.used)
    : { level: "unknown" as const, color: "text-gray-500" };

  // Get trend indicators
  const getTrend = (data: number[]) => {
    if (data.length < 2) return null;
    const recent = data.slice(-3);
    const avg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const prev = data.slice(-6, -3);
    if (prev.length === 0) return null;
    const prevAvg = prev.reduce((a, b) => a + b, 0) / prev.length;
    return avg > prevAvg ? "up" : avg < prevAvg ? "down" : "stable";
  };

  const fpsHistory = performanceHistory.map((h) => h.fps);
  const memoryHistory = performanceHistory.map((h) => h.memory);
  const fpsTrend = getTrend(fpsHistory);
  const memoryTrend = getTrend(memoryHistory);

  return (
    <Card
      ref={containerRef}
      className={`fixed right-4 bottom-4 z-50 border border-gray-200 bg-white/95 shadow-2xl backdrop-blur-sm dark:border-gray-700 dark:bg-gray-900/95 ${className}`}
    >
      <div className="max-h-[700px] min-h-[600px] w-[400px] overflow-y-auto p-4">
        {/* Fixed dimensions to prevent resizing */}
        {/* Header */}
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-blue-500" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Performance Monitor
            </h3>
            <PerformanceBadge
              level={
                fps >= 55 &&
                performanceMetrics.lcp <= 2500 &&
                performanceMetrics.cls <= 0.1
                  ? "excellent"
                  : fps >= 30 &&
                      performanceMetrics.lcp <= 4000 &&
                      performanceMetrics.cls <= 0.25
                    ? "good"
                    : "poor"
              }
            >
              Overall
            </PerformanceBadge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="h-8 w-8 rounded-full p-2 transition-colors duration-200 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400"
            title="Close performance monitor (click outside to close)"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* FPS */}
            <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
              <div className="mb-1 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Monitor className="h-3 w-3 text-gray-500" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    FPS
                  </span>
                </div>
                {fpsTrend && (
                  <div
                    className={`flex items-center ${fpsTrend === "up" ? "text-green-500" : fpsTrend === "down" ? "text-red-500" : "text-gray-500"}`}
                  >
                    {fpsTrend === "up" ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : fpsTrend === "down" ? (
                      <TrendingDown className="h-3 w-3" />
                    ) : null}
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-lg font-bold ${fpsStatus.color}`}>
                  {fps.toFixed(0)}
                </span>
                <MiniChart
                  data={fpsHistory}
                  color={
                    fps >= 50 ? "#22c55e" : fps >= 30 ? "#eab308" : "#ef4444"
                  }
                />
              </div>
              <div className="mt-1 h-1 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    fps >= 50
                      ? "bg-green-500"
                      : fps >= 30
                        ? "bg-yellow-500"
                        : "bg-red-500"
                  }`}
                  style={{ width: `${Math.min((fps / 60) * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* Memory */}
            <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
              <div className="mb-1 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <MemoryStick className="h-3 w-3 text-gray-500" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    Memory
                  </span>
                </div>
                {memoryTrend && (
                  <div
                    className={`flex items-center ${memoryTrend === "down" ? "text-green-500" : memoryTrend === "up" ? "text-red-500" : "text-gray-500"}`}
                  >
                    {memoryTrend === "up" ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : memoryTrend === "down" ? (
                      <TrendingDown className="h-3 w-3" />
                    ) : null}
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-lg font-bold ${memoryStatus.color}`}>
                  {memoryInfo?.used || 0}MB
                </span>
                <MiniChart
                  data={memoryHistory}
                  color={
                    memoryInfo && memoryInfo.used <= 50
                      ? "#22c55e"
                      : memoryInfo && memoryInfo.used <= 100
                        ? "#eab308"
                        : "#ef4444"
                  }
                />
              </div>
              <div className="mt-1 h-1 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    memoryInfo && memoryInfo.used <= 50
                      ? "bg-green-500"
                      : memoryInfo && memoryInfo.used <= 100
                        ? "bg-yellow-500"
                        : "bg-red-500"
                  }`}
                  style={{
                    width: `${memoryInfo ? Math.min((memoryInfo.used / 200) * 100, 100) : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Web Vitals */}
          {(performanceMetrics.lcp > 0 || performanceMetrics.cls > 0) && (
            <div className="space-y-2">
              <h4 className="flex items-center gap-1 text-xs font-medium text-gray-700 dark:text-gray-300">
                <Cpu className="h-3 w-3" />
                Web Vitals
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {performanceMetrics.lcp > 0 && (
                  <div className="flex items-center justify-between rounded bg-gray-50 px-2 py-1 dark:bg-gray-800">
                    <span className="text-gray-600 dark:text-gray-400">
                      LCP
                    </span>
                    <div className="flex items-center gap-1">
                      <span className={lcpStatus.color}>
                        {(performanceMetrics.lcp / 1000).toFixed(1)}s
                      </span>
                      <div
                        className={`h-2 w-2 rounded-full ${performanceMetrics.lcp <= 2500 ? "bg-green-500" : performanceMetrics.lcp <= 4000 ? "bg-yellow-500" : "bg-red-500"}`}
                      />
                    </div>
                  </div>
                )}
                {performanceMetrics.cls > 0 && (
                  <div className="flex items-center justify-between rounded bg-gray-50 px-2 py-1 dark:bg-gray-800">
                    <span className="text-gray-600 dark:text-gray-400">
                      CLS
                    </span>
                    <div className="flex items-center gap-1">
                      <span className={clsStatus.color}>
                        {performanceMetrics.cls.toFixed(3)}
                      </span>
                      <div
                        className={`h-2 w-2 rounded-full ${performanceMetrics.cls <= 0.1 ? "bg-green-500" : performanceMetrics.cls <= 0.25 ? "bg-yellow-500" : "bg-red-500"}`}
                      />
                    </div>
                  </div>
                )}
                {performanceMetrics.fcp > 0 && (
                  <div className="flex items-center justify-between rounded bg-gray-50 px-2 py-1 dark:bg-gray-800">
                    <span className="text-gray-600 dark:text-gray-400">
                      FCP
                    </span>
                    <div className="flex items-center gap-1">
                      <span
                        className={
                          performanceMetrics.fcp <= 1800
                            ? "text-green-500"
                            : performanceMetrics.fcp <= 3000
                              ? "text-yellow-500"
                              : "text-red-500"
                        }
                      >
                        {(performanceMetrics.fcp / 1000).toFixed(1)}s
                      </span>
                      <div
                        className={`h-2 w-2 rounded-full ${performanceMetrics.fcp <= 1800 ? "bg-green-500" : performanceMetrics.fcp <= 3000 ? "bg-yellow-500" : "bg-red-500"}`}
                      />
                    </div>
                  </div>
                )}
                {performanceMetrics.ttfb > 0 && (
                  <div className="flex items-center justify-between rounded bg-gray-50 px-2 py-1 dark:bg-gray-800">
                    <span className="text-gray-600 dark:text-gray-400">
                      TTFB
                    </span>
                    <div className="flex items-center gap-1">
                      <span
                        className={
                          performanceMetrics.ttfb <= 200
                            ? "text-green-500"
                            : performanceMetrics.ttfb <= 800
                              ? "text-yellow-500"
                              : "text-red-500"
                        }
                      >
                        {performanceMetrics.ttfb.toFixed(0)}ms
                      </span>
                      <div
                        className={`h-2 w-2 rounded-full ${performanceMetrics.ttfb <= 200 ? "bg-green-500" : performanceMetrics.ttfb <= 800 ? "bg-yellow-500" : "bg-red-500"}`}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Additional Performance Metrics */}
          <div className="space-y-2">
            <h4 className="flex items-center gap-1 text-xs font-medium text-gray-700 dark:text-gray-300">
              <Clock className="h-3 w-3" />
              Load Performance
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {performanceHistory.length > 0 &&
                performanceHistory[performanceHistory.length - 1]
                  .domContentLoaded > 0 && (
                  <div className="flex items-center justify-between rounded bg-gray-50 px-2 py-1 dark:bg-gray-800">
                    <span className="text-gray-600 dark:text-gray-400">
                      DOM Ready
                    </span>
                    <div className="flex items-center gap-1">
                      <span
                        className={
                          performanceHistory[performanceHistory.length - 1]
                            .domContentLoaded <= 1500
                            ? "text-green-500"
                            : performanceHistory[performanceHistory.length - 1]
                                  .domContentLoaded <= 3000
                              ? "text-yellow-500"
                              : "text-red-500"
                        }
                      >
                        {(
                          performanceHistory[performanceHistory.length - 1]
                            .domContentLoaded / 1000
                        ).toFixed(1)}
                        s
                      </span>
                      <div
                        className={`h-2 w-2 rounded-full ${performanceHistory[performanceHistory.length - 1].domContentLoaded <= 1500 ? "bg-green-500" : performanceHistory[performanceHistory.length - 1].domContentLoaded <= 3000 ? "bg-yellow-500" : "bg-red-500"}`}
                      />
                    </div>
                  </div>
                )}
              {performanceHistory.length > 0 &&
                performanceHistory[performanceHistory.length - 1]
                  .networkLatency > 0 && (
                  <div className="flex items-center justify-between rounded bg-gray-50 px-2 py-1 dark:bg-gray-800">
                    <span className="text-gray-600 dark:text-gray-400">
                      Network
                    </span>
                    <div className="flex items-center gap-1">
                      <span
                        className={
                          performanceHistory[performanceHistory.length - 1]
                            .networkLatency <= 100
                            ? "text-green-500"
                            : performanceHistory[performanceHistory.length - 1]
                                  .networkLatency <= 300
                              ? "text-yellow-500"
                              : "text-red-500"
                        }
                      >
                        {performanceHistory[
                          performanceHistory.length - 1
                        ].networkLatency.toFixed(0)}
                        ms
                      </span>
                      <div
                        className={`h-2 w-2 rounded-full ${performanceHistory[performanceHistory.length - 1].networkLatency <= 100 ? "bg-green-500" : performanceHistory[performanceHistory.length - 1].networkLatency <= 300 ? "bg-yellow-500" : "bg-red-500"}`}
                      />
                    </div>
                  </div>
                )}
              {performanceMetrics.totalBlockingTime > 0 && (
                <div className="flex items-center justify-between rounded bg-gray-50 px-2 py-1 dark:bg-gray-800">
                  <span className="text-gray-600 dark:text-gray-400">TBT</span>
                  <div className="flex items-center gap-1">
                    <span
                      className={
                        performanceMetrics.totalBlockingTime <= 200
                          ? "text-green-500"
                          : performanceMetrics.totalBlockingTime <= 600
                            ? "text-yellow-500"
                            : "text-red-500"
                      }
                    >
                      {performanceMetrics.totalBlockingTime.toFixed(0)}ms
                    </span>
                    <div
                      className={`h-2 w-2 rounded-full ${performanceMetrics.totalBlockingTime <= 200 ? "bg-green-500" : performanceMetrics.totalBlockingTime <= 600 ? "bg-yellow-500" : "bg-red-500"}`}
                    />
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between rounded bg-gray-50 px-2 py-1 dark:bg-gray-800">
                <span className="text-gray-600 dark:text-gray-400">
                  FPS Avg
                </span>
                <div className="flex items-center gap-1">
                  <span
                    className={
                      fpsHistory.length > 0
                        ? fpsHistory.reduce((a, b) => a + b, 0) /
                            fpsHistory.length >=
                          50
                          ? "text-green-500"
                          : fpsHistory.reduce((a, b) => a + b, 0) /
                                fpsHistory.length >=
                              30
                            ? "text-yellow-500"
                            : "text-red-500"
                        : "text-gray-500"
                    }
                  >
                    {fpsHistory.length > 0
                      ? (
                          fpsHistory.reduce((a, b) => a + b, 0) /
                          fpsHistory.length
                        ).toFixed(0)
                      : "--"}
                  </span>
                  <div
                    className={`h-2 w-2 rounded-full ${fpsHistory.length > 0 ? (fpsHistory.reduce((a, b) => a + b, 0) / fpsHistory.length >= 50 ? "bg-green-500" : fpsHistory.reduce((a, b) => a + b, 0) / fpsHistory.length >= 30 ? "bg-yellow-500" : "bg-red-500") : "bg-gray-500"}`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Advanced Metrics Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full text-xs text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            {showAdvanced ? "Hide" : "Show"} Advanced Metrics
            {showAdvanced ? (
              <ChevronUp className="ml-1 h-3 w-3" />
            ) : (
              <ChevronDown className="ml-1 h-3 w-3" />
            )}
          </Button>

          {/* Advanced Metrics */}
          {showAdvanced && (
            <div className="space-y-3 border-t border-gray-200 pt-2 dark:border-gray-700">
              {memoryInfo && (
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Used / Total Memory
                    </span>
                    <span className="font-mono">
                      {memoryInfo.used}MB / {memoryInfo.total}MB
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Memory Limit
                    </span>
                    <span className="font-mono">{memoryInfo.limit}MB</span>
                  </div>
                </div>
              )}

              <div className="text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Samples Collected
                  </span>
                  <span className="font-mono">{performanceHistory.length}</span>
                </div>
              </div>
            </div>
          )}

          {/* Performance Alerts - Fixed height container */}
          <div className="max-h-[120px] min-h-[80px] overflow-y-auto">
            <div className="space-y-1">
              {fps < 30 && (
                <div className="flex items-center gap-2 rounded border border-yellow-200 bg-yellow-50 p-2 text-xs text-yellow-700 dark:border-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300">
                  <AlertTriangle className="h-3 w-3 flex-shrink-0" />
                  <span>
                    Low FPS detected. Consider reducing animation complexity.
                  </span>
                </div>
              )}
              {performanceMetrics.lcp > 4000 && (
                <div className="flex items-center gap-2 rounded border border-red-200 bg-red-50 p-2 text-xs text-red-700 dark:border-red-700 dark:bg-red-900/20 dark:text-red-300">
                  <AlertTriangle className="h-3 w-3 flex-shrink-0" />
                  <span>
                    Slow loading detected. Optimize images and resources.
                  </span>
                </div>
              )}
              {memoryInfo && memoryInfo.used > 150 && (
                <div className="flex items-center gap-2 rounded border border-red-200 bg-red-50 p-2 text-xs text-red-700 dark:border-red-700 dark:bg-red-900/20 dark:text-red-300">
                  <AlertTriangle className="h-3 w-3 flex-shrink-0" />
                  <span>
                    High memory usage detected. Consider optimizing data
                    structures.
                  </span>
                </div>
              )}
              {fps >= 55 &&
                performanceMetrics.lcp <= 2500 &&
                performanceMetrics.cls <= 0.1 && (
                  <div className="flex items-center gap-2 rounded border border-green-200 bg-green-50 p-2 text-xs text-green-700 dark:border-green-700 dark:bg-green-900/20 dark:text-green-300">
                    <CheckCircle className="h-3 w-3 flex-shrink-0" />
                    <span>
                      Excellent performance! All metrics are within optimal
                      ranges.
                    </span>
                  </div>
                )}
              {/* Placeholder div to maintain minimum height when no alerts */}
              {fps >= 30 &&
                (!performanceMetrics.lcp || performanceMetrics.lcp <= 4000) &&
                (!memoryInfo || memoryInfo.used <= 150) &&
                !(
                  fps >= 55 &&
                  performanceMetrics.lcp <= 2500 &&
                  performanceMetrics.cls <= 0.1
                ) && (
                  <div className="flex items-center justify-center rounded border border-gray-200 p-2 text-xs text-gray-500 dark:border-gray-700 dark:text-gray-400">
                    <span>No performance issues detected</span>
                  </div>
                )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                performanceMetrics.lcp = 0;
                performanceMetrics.cls = 0;
                performanceMetrics.fid = 0;
                performanceMetrics.inp = 0;
                historyRef.current = [];
                setPerformanceHistory([]);
              }}
              className="flex items-center gap-1 px-3 py-1 text-xs"
            >
              <RefreshCcw className="h-3 w-3" />
              Reset
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const report = {
                  timestamp: new Date().toISOString(),
                  summary: {
                    fps: {
                      current: fps,
                      average:
                        fpsHistory.length > 0
                          ? fpsHistory.reduce((a, b) => a + b, 0) /
                            fpsHistory.length
                          : fps,
                    },
                    memory: memoryInfo,
                    lcp: performanceMetrics.lcp,
                    cls: performanceMetrics.cls,
                  },
                  history: performanceHistory,
                  url: window.location.href,
                  userAgent: navigator.userAgent,
                };

                const blob = new Blob([JSON.stringify(report, null, 2)], {
                  type: "application/json",
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `performance-report-${Date.now()}.json`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="flex items-center gap-1 px-3 py-1 text-xs"
            >
              <Download className="h-3 w-3" />
              Export
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

// Hook for easy integration
export function usePerformanceMonitor() {
  const [isVisible, setIsVisible] = useState(false);

  const toggle = () => setIsVisible((prev) => !prev);
  const show = () => setIsVisible(true);
  const hide = () => setIsVisible(false);

  return {
    isVisible,
    toggle,
    show,
    hide,
    PerformanceMonitor: (
      props: Omit<PerformanceMonitorProps, "isVisible" | "onToggle">
    ) => (
      <PerformanceMonitor {...props} isVisible={isVisible} onToggle={toggle} />
    ),
  };
}
