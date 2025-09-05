import { Activity, X } from "lucide-react";
import React from "react";

import { usePerformance } from "@/providers/PerformanceProvider";
import { cn } from "@/utils";

export function PerformanceMonitorToggle() {
  const { isMonitorVisible, toggleMonitorVisibility, performanceData } =
    usePerformance();

  const getFPSColor = (fps: number) => {
    if (fps >= 55) return "text-green-500";
    if (fps >= 30) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div
      className={cn(
        "fixed top-4 right-4 z-50 transition-all duration-300",
        isMonitorVisible ? "translate-x-0" : "translate-x-full"
      )}
    >
      <div className="bg-black/80 backdrop-blur-sm text-white rounded-lg p-3 shadow-lg min-w-[200px]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            <span className="text-sm font-medium">Performance</span>
          </div>
          <button
            onClick={toggleMonitorVisibility}
            className="p-1 rounded hover:bg-white/20 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>

        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span>FPS:</span>
            <span className={getFPSColor(performanceData.fps)}>
              {performanceData.fps}
            </span>
          </div>

          <div className="flex justify-between">
            <span>Memory:</span>
            <span className="text-blue-400">
              {performanceData.memory?.used || 0}MB
            </span>
          </div>

          <div className="flex justify-between">
            <span>LCP:</span>
            <span
              className={
                performanceData.lcp > 2500 ? "text-red-400" : "text-green-400"
              }
            >
              {performanceData.lcp}ms
            </span>
          </div>

          <div className="flex justify-between">
            <span>CLS:</span>
            <span
              className={
                performanceData.cls > 0.1 ? "text-red-400" : "text-green-400"
              }
            >
              {performanceData.cls.toFixed(3)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PerformanceMonitorButton() {
  const { isMonitorVisible, toggleMonitorVisibility } = usePerformance();

  if (isMonitorVisible) return null;

  return (
    <button
      onClick={toggleMonitorVisibility}
      className={cn(
        "fixed top-4 right-4 z-40",
        "bg-black/80 backdrop-blur-sm text-white",
        "p-2 rounded-lg shadow-lg",
        "hover:bg-black/90 transition-all duration-200",
        "flex items-center gap-2"
      )}
      title="Show Performance Monitor"
    >
      <Activity className="w-4 h-4" />
      <span className="text-xs">Performance</span>
    </button>
  );
}
