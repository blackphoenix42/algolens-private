import {
  Activity,
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  MemoryStick,
  Monitor,
  TrendingDown,
  TrendingUp,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";

import { usePerformance } from "@/providers/PerformanceProvider";
import { cn } from "@/utils";

interface PerformanceTooltipProps {
  fps: number;
  memory: number;
  lcp: number;
  cls: number;
}

function PerformanceTooltip({
  fps,
  memory,
  lcp,
  cls,
}: PerformanceTooltipProps) {
  const getStatusIcon = (metric: string, value: number) => {
    let isGood = false;
    switch (metric) {
      case "fps":
        isGood = value >= 50;
        break;
      case "memory":
        isGood = value <= 100;
        break;
      case "lcp":
        isGood = value <= 2500;
        break;
      case "cls":
        isGood = value <= 0.1;
        break;
    }

    return isGood ? (
      <CheckCircle className="h-3 w-3 text-green-400" />
    ) : (
      <AlertTriangle className="h-3 w-3 text-yellow-400" />
    );
  };

  const overall = fps >= 50 && memory <= 100 && lcp <= 2500 && cls <= 0.1;

  return (
    <div className="min-w-[240px] rounded-lg border border-white/20 bg-black/90 p-3 text-white shadow-xl backdrop-blur-sm">
      <div className="mb-2 flex items-center gap-2">
        <Activity className="h-4 w-4 text-blue-400" />
        <span className="text-sm font-medium">Performance Status</span>
        <div
          className={`ml-auto flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${
            overall
              ? "bg-green-500/20 text-green-400"
              : "bg-yellow-500/20 text-yellow-400"
          }`}
        >
          {overall ? (
            <CheckCircle className="h-3 w-3" />
          ) : (
            <AlertTriangle className="h-3 w-3" />
          )}
          {overall ? "Excellent" : "Needs Attention"}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center justify-between rounded bg-white/5 px-2 py-1">
          <div className="flex items-center gap-1">
            <Monitor className="h-3 w-3 text-gray-400" />
            <span>FPS</span>
          </div>
          <div className="flex items-center gap-1">
            <span
              className={
                fps >= 50
                  ? "text-green-400"
                  : fps >= 30
                    ? "text-yellow-400"
                    : "text-red-400"
              }
            >
              {fps}
            </span>
            {getStatusIcon("fps", fps)}
          </div>
        </div>

        <div className="flex items-center justify-between rounded bg-white/5 px-2 py-1">
          <div className="flex items-center gap-1">
            <MemoryStick className="h-3 w-3 text-gray-400" />
            <span>Memory</span>
          </div>
          <div className="flex items-center gap-1">
            <span
              className={
                memory <= 50
                  ? "text-green-400"
                  : memory <= 100
                    ? "text-yellow-400"
                    : "text-red-400"
              }
            >
              {memory}MB
            </span>
            {getStatusIcon("memory", memory)}
          </div>
        </div>

        {lcp > 0 && (
          <div className="flex items-center justify-between rounded bg-white/5 px-2 py-1">
            <span>LCP</span>
            <div className="flex items-center gap-1">
              <span
                className={
                  lcp <= 2500
                    ? "text-green-400"
                    : lcp <= 4000
                      ? "text-yellow-400"
                      : "text-red-400"
                }
              >
                {lcp}ms
              </span>
              {getStatusIcon("lcp", lcp)}
            </div>
          </div>
        )}

        {cls > 0 && (
          <div className="flex items-center justify-between rounded bg-white/5 px-2 py-1">
            <span>CLS</span>
            <div className="flex items-center gap-1">
              <span
                className={
                  cls <= 0.1
                    ? "text-green-400"
                    : cls <= 0.25
                      ? "text-yellow-400"
                      : "text-red-400"
                }
              >
                {cls.toFixed(3)}
              </span>
              {getStatusIcon("cls", cls)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function PerformanceMonitorToggle() {
  const { isMonitorVisible, toggleMonitorVisibility, performanceData } =
    usePerformance();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [previousFPS, setPreviousFPS] = useState(performanceData.fps);

  useEffect(() => {
    setPreviousFPS(performanceData.fps);
  }, [performanceData.fps]);

  const getFPSColor = (fps: number) => {
    if (fps >= 55) return "text-green-400";
    if (fps >= 30) return "text-yellow-400";
    return "text-red-400";
  };

  const getMemoryColor = (memory: number) => {
    if (memory <= 50) return "text-green-400";
    if (memory <= 100) return "text-yellow-400";
    return "text-red-400";
  };

  const getFPSTrend = () => {
    if (performanceData.fps > previousFPS) return "up";
    if (performanceData.fps < previousFPS) return "down";
    return "stable";
  };

  const fpsTrend = getFPSTrend();
  const memoryUsage = performanceData.memory?.used || 0;

  return (
    <div className="fixed top-4 right-4 z-50">
      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute top-full right-0 z-10 mt-2">
          <PerformanceTooltip
            fps={performanceData.fps}
            memory={memoryUsage}
            lcp={performanceData.lcp}
            cls={performanceData.cls}
          />
        </div>
      )}

      {/* Main Toggle */}
      <div
        className={cn(
          "transition-all duration-300 ease-out",
          isMonitorVisible
            ? "translate-x-0 opacity-100"
            : "translate-x-0 opacity-100"
        )}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <div
          className={cn(
            "overflow-hidden rounded-lg border border-white/20 bg-black/80 text-white shadow-xl backdrop-blur-sm transition-all duration-300",
            isExpanded ? "min-w-[280px]" : "min-w-[200px]",
            // Pulse animation for poor performance
            performanceData.fps < 30 ? "animate-pulse" : ""
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-3">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Activity
                  className={cn(
                    "h-4 w-4 transition-colors duration-300",
                    performanceData.fps >= 55
                      ? "text-green-400"
                      : performanceData.fps >= 30
                        ? "text-yellow-400"
                        : "text-red-400"
                  )}
                />
                {/* Performance indicator dot */}
                <div
                  className={cn(
                    "absolute -top-1 -right-1 h-2 w-2 rounded-full transition-colors duration-300",
                    performanceData.fps >= 55 && memoryUsage <= 50
                      ? "bg-green-400"
                      : performanceData.fps >= 30 && memoryUsage <= 100
                        ? "bg-yellow-400"
                        : "bg-red-400"
                  )}
                />
              </div>
              <span className="text-sm font-medium">Performance</span>

              {/* Overall status badge */}
              <div
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs font-medium transition-colors duration-300",
                  performanceData.fps >= 55 &&
                    memoryUsage <= 50 &&
                    performanceData.lcp <= 2500 &&
                    performanceData.cls <= 0.1
                    ? "bg-green-500/20 text-green-400"
                    : performanceData.fps >= 30 && memoryUsage <= 100
                      ? "bg-yellow-500/20 text-yellow-400"
                      : "bg-red-500/20 text-red-400"
                )}
              >
                {performanceData.fps >= 55 &&
                memoryUsage <= 50 &&
                performanceData.lcp <= 2500 &&
                performanceData.cls <= 0.1
                  ? "Excellent"
                  : performanceData.fps >= 30 && memoryUsage <= 100
                    ? "Good"
                    : "Poor"}
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="rounded p-1 transition-colors duration-200 hover:bg-white/20"
                title={isExpanded ? "Collapse" : "Expand"}
              >
                {isExpanded ? (
                  <ChevronUp className="h-3 w-3" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                )}
              </button>
              <button
                onClick={toggleMonitorVisibility}
                className="rounded p-1 transition-colors duration-200 hover:bg-white/20"
                title="Close Performance Monitor"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div
            className={cn(
              "overflow-hidden transition-all duration-300 ease-out",
              isExpanded
                ? "max-h-[200px] opacity-100"
                : "max-h-[60px] opacity-100"
            )}
          >
            {/* Quick Stats */}
            <div className="px-3 pb-2">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex items-center justify-between rounded bg-white/5 px-2 py-1">
                  <div className="flex items-center gap-1">
                    <Monitor className="h-3 w-3 text-gray-400" />
                    <span>FPS</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={getFPSColor(performanceData.fps)}>
                      {performanceData.fps}
                    </span>
                    {fpsTrend !== "stable" && (
                      <div
                        className={
                          fpsTrend === "up" ? "text-green-400" : "text-red-400"
                        }
                      >
                        {fpsTrend === "up" ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between rounded bg-white/5 px-2 py-1">
                  <div className="flex items-center gap-1">
                    <MemoryStick className="h-3 w-3 text-gray-400" />
                    <span>Memory</span>
                  </div>
                  <span className={getMemoryColor(memoryUsage)}>
                    {memoryUsage}MB
                  </span>
                </div>
              </div>
            </div>

            {/* Expanded Content */}
            {isExpanded && (
              <div className="border-t border-white/10 px-3 pt-2 pb-3">
                <div className="space-y-2 text-xs">
                  {performanceData.lcp > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">LCP (Load):</span>
                      <span
                        className={
                          performanceData.lcp > 2500
                            ? "text-red-400"
                            : "text-green-400"
                        }
                      >
                        {performanceData.lcp}ms
                      </span>
                    </div>
                  )}

                  {performanceData.cls > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">CLS (Shift):</span>
                      <span
                        className={
                          performanceData.cls > 0.1
                            ? "text-red-400"
                            : "text-green-400"
                        }
                      >
                        {performanceData.cls.toFixed(3)}
                      </span>
                    </div>
                  )}

                  {performanceData.memory && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Memory Limit:</span>
                      <span className="text-blue-400">
                        {performanceData.memory.limit}MB
                      </span>
                    </div>
                  )}

                  {/* Quick Actions */}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => {
                        // Force garbage collection if available
                        if ("gc" in window) {
                          (window as typeof window & { gc: () => void }).gc();
                        }
                      }}
                      className="flex-1 rounded bg-white/10 px-2 py-1 text-xs transition-colors hover:bg-white/20"
                      title="Force Garbage Collection (if available)"
                    >
                      Clean Memory
                    </button>
                    <button
                      onClick={() => window.location.reload()}
                      className="flex-1 rounded bg-white/10 px-2 py-1 text-xs transition-colors hover:bg-white/20"
                      title="Reload to reset performance"
                    >
                      Reload
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Performance indicator bar */}
          <div className="h-1 bg-black/20">
            <div
              className={cn(
                "h-full transition-all duration-300",
                performanceData.fps >= 55
                  ? "bg-green-400"
                  : performanceData.fps >= 30
                    ? "bg-yellow-400"
                    : "bg-red-400"
              )}
              style={{
                width: `${Math.min((performanceData.fps / 60) * 100, 100)}%`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function PerformanceMonitorButton() {
  const { isMonitorVisible, toggleMonitorVisibility, performanceData } =
    usePerformance();

  if (isMonitorVisible) return null;

  const memoryUsage = performanceData.memory?.used || 0;
  const isPerformanceGood = performanceData.fps >= 50 && memoryUsage <= 100;

  return (
    <button
      onClick={toggleMonitorVisibility}
      className={cn(
        "fixed top-4 right-4 z-40",
        "border border-white/20 bg-black/80 text-white backdrop-blur-sm",
        "rounded-lg p-3 shadow-xl",
        "transition-all duration-200 hover:bg-black/90",
        "group flex items-center gap-2",
        // Pulse animation for poor performance
        !isPerformanceGood && "animate-pulse"
      )}
      title="Show Performance Monitor (Ctrl+Shift+P)"
    >
      <div className="relative">
        <Activity
          className={cn(
            "h-4 w-4 transition-colors duration-300",
            isPerformanceGood ? "text-green-400" : "text-yellow-400"
          )}
        />
        {/* Performance indicator dot */}
        <div
          className={cn(
            "absolute -top-1 -right-1 h-2 w-2 rounded-full transition-colors duration-300",
            isPerformanceGood ? "bg-green-400" : "bg-yellow-400"
          )}
        />
      </div>
      <div className="text-left">
        <div className="text-xs font-medium">Performance</div>
        <div className="text-xs text-gray-300 transition-colors group-hover:text-white">
          {performanceData.fps}fps • {memoryUsage}MB
        </div>
      </div>
    </button>
  );
}
