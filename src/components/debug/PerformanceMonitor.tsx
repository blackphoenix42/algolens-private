/**
 * Performance Monitor Component
 * Displays real-time performance metrics and optimization suggestions
 */

import React, { useState, useEffect } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  useFPSMonitor,
  useMemoryMonitor,
  performanceMetrics,
  trackWebVitals,
} from "@/services/performance";

interface PerformanceMonitorProps {
  className?: string;
  isVisible?: boolean;
  onToggle?: () => void;
}

export function PerformanceMonitor({
  className = "",
  isVisible = false,
  onToggle,
}: PerformanceMonitorProps) {
  const fps = useFPSMonitor();
  const memoryInfo = useMemoryMonitor();
  const [isCollapsed, setIsCollapsed] = useState(true);

  useEffect(() => {
    trackWebVitals();
  }, []);

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
        className={`fixed bottom-4 right-4 z-20 bg-black/80 text-white hover:bg-black/90 ${className}`}
        title="Show performance monitor (Ctrl+Shift+P)"
      >
        📊
      </Button>
    );
  }

  const getPerformanceLevel = (metric: string, value: number) => {
    switch (metric) {
      case "fps":
        if (value >= 50) return { level: "excellent", color: "text-green-500" };
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
    : { level: "unknown", color: "text-gray-500" };

  return (
    <Card
      className={`fixed bottom-4 right-4 z-20 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm shadow-xl border ${className}`}
    >
      <div className="p-4 min-w-[280px]">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            📊 Performance Monitor
          </h3>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 h-6 w-6"
            >
              {isCollapsed ? "▼" : "▲"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="p-1 h-6 w-6"
            >
              ✕
            </Button>
          </div>
        </div>

        {!isCollapsed && (
          <div className="space-y-3">
            {/* FPS */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                FPS
              </span>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-mono ${fpsStatus.color}`}>
                  {fps.toFixed(0)}
                </span>
                <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      fps >= 50
                        ? "bg-green-500 w-5/6"
                        : fps >= 30
                          ? "bg-yellow-500 w-1/2"
                          : "bg-red-500 w-1/4"
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* LCP (Largest Contentful Paint) */}
            {performanceMetrics.lcp > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  LCP
                </span>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-mono ${lcpStatus.color}`}>
                    {(performanceMetrics.lcp / 1000).toFixed(1)}s
                  </span>
                  <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        performanceMetrics.lcp <= 2500
                          ? "bg-green-500 w-1/4"
                          : performanceMetrics.lcp <= 4000
                            ? "bg-yellow-500 w-1/2"
                            : "bg-red-500 w-3/4"
                      }`}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* CLS (Cumulative Layout Shift) */}
            {performanceMetrics.cls > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  CLS
                </span>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-mono ${clsStatus.color}`}>
                    {performanceMetrics.cls.toFixed(3)}
                  </span>
                  <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        performanceMetrics.cls <= 0.1
                          ? "bg-green-500 w-1/4"
                          : performanceMetrics.cls <= 0.25
                            ? "bg-yellow-500 w-1/2"
                            : "bg-red-500 w-3/4"
                      }`}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Memory Usage */}
            {memoryInfo && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Memory
                </span>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-mono ${memoryStatus.color}`}>
                    {memoryInfo.used}MB
                  </span>
                  <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        memoryInfo.used <= 50
                          ? "bg-green-500 w-1/3"
                          : memoryInfo.used <= 100
                            ? "bg-yellow-500 w-2/3"
                            : "bg-red-500 w-full"
                      }`}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Performance Tips */}
            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
              <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                {fps < 30 && (
                  <div className="text-yellow-600 dark:text-yellow-400">
                    ⚠️ Low FPS detected. Try reducing animation complexity.
                  </div>
                )}
                {performanceMetrics.lcp > 6000 && (
                  <div className="text-red-600 dark:text-red-400">
                    🚨 Slow loading detected. Optimize images and resources.
                  </div>
                )}
                {performanceMetrics.cls > 0.25 && (
                  <div className="text-red-600 dark:text-red-400">
                    🚨 Layout shifts detected. Set fixed dimensions for dynamic
                    content.
                  </div>
                )}
                {memoryInfo && memoryInfo.used > 100 && (
                  <div className="text-yellow-600 dark:text-yellow-400">
                    ⚠️ High memory usage. Consider reducing data retention.
                  </div>
                )}
                {fps >= 50 &&
                  performanceMetrics.lcp <= 2500 &&
                  performanceMetrics.cls <= 0.1 && (
                    <div className="text-green-600 dark:text-green-400">
                      ✅ Excellent performance!
                    </div>
                  )}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Clear performance metrics
                  performanceMetrics.lcp = 0;
                  performanceMetrics.cls = 0;
                  performanceMetrics.fid = 0;
                  performanceMetrics.inp = 0;
                }}
                className="text-xs px-2 py-1"
              >
                Reset
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Export performance report
                  const report = {
                    timestamp: new Date().toISOString(),
                    fps,
                    lcp: performanceMetrics.lcp,
                    cls: performanceMetrics.cls,
                    memory: memoryInfo,
                    url: window.location.href,
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
                className="text-xs px-2 py-1"
              >
                Export
              </Button>
            </div>
          </div>
        )}
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
