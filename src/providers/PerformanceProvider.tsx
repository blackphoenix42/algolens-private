/**
 * Performance Provider
 * Provides global performance monitoring and optimization
 */

import React, { createContext, useContext, useEffect, useState } from "react";

import { PerformanceMonitor } from "../components/debug/PerformanceMonitor";

import { trackWebVitals, performanceMetrics } from "@/services/performance";

interface PerformanceContextType {
  isMonitoringEnabled: boolean;
  isMonitorVisible: boolean;
  toggleMonitoring: () => void;
  toggleMonitorVisibility: () => void;
  performanceData: {
    fps: number;
    lcp: number;
    cls: number;
    memory?: {
      used: number;
      total: number;
      limit: number;
    };
  };
}

const PerformanceContext = createContext<PerformanceContextType | null>(null);

export function usePerformance() {
  const context = useContext(PerformanceContext);
  if (!context) {
    throw new Error("usePerformance must be used within PerformanceProvider");
  }
  return context;
}

interface PerformanceProviderProps {
  children: React.ReactNode;
}

export function PerformanceProvider({ children }: PerformanceProviderProps) {
  const [isMonitoringEnabled, setIsMonitoringEnabled] = useState(
    process.env.NODE_ENV === "development"
  );
  const [isMonitorVisible, setIsMonitorVisible] = useState(false);
  const [performanceData, setPerformanceData] = useState<{
    fps: number;
    lcp: number;
    cls: number;
    memory?: {
      used: number;
      total: number;
      limit: number;
    };
  }>({
    fps: 60,
    lcp: 0,
    cls: 0,
    memory: undefined,
  });

  const toggleMonitoring = () => setIsMonitoringEnabled((prev) => !prev);
  const toggleMonitorVisibility = () => setIsMonitorVisible((prev) => !prev);

  useEffect(() => {
    if (isMonitoringEnabled) {
      // Initialize performance tracking
      trackWebVitals();

      // Update performance data periodically
      const interval = setInterval(() => {
        setPerformanceData((prev) => ({
          ...prev,
          lcp: performanceMetrics.lcp,
          cls: performanceMetrics.cls,
          memory: getMemoryInfo(),
        }));
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isMonitoringEnabled]);

  // Keyboard shortcut to toggle performance monitor
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key === "P") {
        event.preventDefault();
        toggleMonitorVisibility();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <PerformanceContext.Provider
      value={{
        isMonitoringEnabled,
        isMonitorVisible,
        toggleMonitoring,
        toggleMonitorVisibility,
        performanceData,
      }}
    >
      {children}
      {isMonitoringEnabled && (
        <PerformanceMonitor
          isVisible={isMonitorVisible}
          onToggle={toggleMonitorVisibility}
          className="z-[60]"
        />
      )}
    </PerformanceContext.Provider>
  );
}

interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

function getMemoryInfo() {
  if ("memory" in performance) {
    const memory = (performance as Performance & { memory?: MemoryInfo })
      .memory;
    if (memory) {
      return {
        used: Math.round(memory.usedJSHeapSize / 1048576),
        total: Math.round(memory.totalJSHeapSize / 1048576),
        limit: Math.round(memory.jsHeapSizeLimit / 1048576),
      };
    }
  }
  return undefined;
}
