// src/hooks/usePerformanceMonitor.ts
import { useEffect, useRef } from "react";

import { LogCategory, logger } from "@/services/monitoring";

interface PerformanceMetrics {
  renderCount: number;
  lastRenderTime: number;
  averageRenderTime: number;
  totalRenderTime: number;
  componentName: string;
}

export function usePerformanceMonitor(componentName: string) {
  const metrics = useRef<PerformanceMetrics>({
    renderCount: 0,
    lastRenderTime: 0,
    averageRenderTime: 0,
    totalRenderTime: 0,
    componentName,
  });

  const renderStartTime = useRef<number>(0);

  // Mark render start
  renderStartTime.current = performance.now();

  useEffect(() => {
    // Calculate render time
    const renderTime = performance.now() - renderStartTime.current;

    metrics.current.renderCount++;
    metrics.current.lastRenderTime = renderTime;
    metrics.current.totalRenderTime += renderTime;
    metrics.current.averageRenderTime =
      metrics.current.totalRenderTime / metrics.current.renderCount;

    // Log performance metrics
    if (renderTime > 16) {
      // > 1 frame at 60fps
      logger.warn(
        LogCategory.PERFORMANCE,
        `Slow render detected: ${componentName}`,
        {
          renderTime: `${renderTime.toFixed(2)}ms`,
          renderCount: metrics.current.renderCount,
          averageRenderTime: `${metrics.current.averageRenderTime.toFixed(2)}ms`,
        }
      );
    } else {
      logger.trace(
        LogCategory.PERFORMANCE,
        `Render completed: ${componentName}`,
        {
          renderTime: `${renderTime.toFixed(2)}ms`,
          renderCount: metrics.current.renderCount,
        }
      );
    }

    // Log periodic performance summary
    if (metrics.current.renderCount % 100 === 0) {
      logger.info(
        LogCategory.PERFORMANCE,
        `Performance summary: ${componentName}`,
        {
          totalRenders: metrics.current.renderCount,
          averageRenderTime: `${metrics.current.averageRenderTime.toFixed(2)}ms`,
          totalRenderTime: `${metrics.current.totalRenderTime.toFixed(2)}ms`,
        }
      );
    }
  });

  return {
    getCurrentMetrics: () => ({ ...metrics.current }),
    resetMetrics: () => {
      logger.debug(
        LogCategory.PERFORMANCE,
        `Performance metrics reset: ${componentName}`
      );
      metrics.current = {
        renderCount: 0,
        lastRenderTime: 0,
        averageRenderTime: 0,
        totalRenderTime: 0,
        componentName,
      };
    },
  };
}

// Hook for monitoring async operations
export function useAsyncOperationMonitor() {
  return {
    measure: async <T>(
      operation: () => Promise<T>,
      operationName: string,
      category: LogCategory = LogCategory.PERFORMANCE
    ): Promise<T> => {
      const startTime = performance.now();
      logger.debug(category, `Async operation started: ${operationName}`);

      try {
        const result = await operation();
        const duration = performance.now() - startTime;

        logger.info(category, `Async operation completed: ${operationName}`, {
          duration: `${duration.toFixed(2)}ms`,
          status: "success",
        });

        return result;
      } catch (error) {
        const duration = performance.now() - startTime;

        logger.error(category, `Async operation failed: ${operationName}`, {
          duration: `${duration.toFixed(2)}ms`,
          status: "error",
          error,
        });

        throw error;
      }
    },
  };
}

// Hook for monitoring memory usage
export function useMemoryMonitor(componentName: string, intervalMs = 30000) {
  useEffect(() => {
    if (!("memory" in performance)) {
      logger.debug(
        LogCategory.PERFORMANCE,
        "Memory monitoring not available in this browser"
      );
      return;
    }

    const checkMemory = () => {
      const memory = (
        performance as unknown as {
          memory?: {
            usedJSHeapSize: number;
            totalJSHeapSize: number;
            jsHeapSizeLimit: number;
          };
        }
      ).memory;

      if (memory) {
        logger.debug(
          LogCategory.PERFORMANCE,
          `Memory usage: ${componentName}`,
          {
            usedJSHeapSize: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
            totalJSHeapSize: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
            jsHeapSizeLimit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB`,
            usage: `${((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100).toFixed(1)}%`,
          }
        );
      }
    };

    // Initial check
    checkMemory();

    // Periodic checks
    const interval = setInterval(checkMemory, intervalMs);

    return () => clearInterval(interval);
  }, [componentName, intervalMs]);
}

// Hook for frame rate monitoring
export function useFrameRateMonitor() {
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const fpsHistory = useRef<number[]>([]);

  useEffect(() => {
    let animationFrame: number;

    const updateFPS = (currentTime: number) => {
      frameCount.current++;

      if (currentTime - lastTime.current >= 1000) {
        const fps = Math.round(
          (frameCount.current * 1000) / (currentTime - lastTime.current)
        );

        fpsHistory.current.push(fps);
        if (fpsHistory.current.length > 60) {
          // Keep last 60 seconds
          fpsHistory.current.shift();
        }

        const averageFPS =
          fpsHistory.current.reduce((a, b) => a + b, 0) /
          fpsHistory.current.length;

        if (fps < 30) {
          logger.warn(LogCategory.PERFORMANCE, "Low frame rate detected", {
            currentFPS: fps,
            averageFPS: Math.round(averageFPS),
            targetFPS: 60,
          });
        } else {
          logger.trace(LogCategory.PERFORMANCE, "Frame rate update", {
            currentFPS: fps,
            averageFPS: Math.round(averageFPS),
          });
        }

        frameCount.current = 0;
        lastTime.current = currentTime;
      }

      animationFrame = requestAnimationFrame(updateFPS);
    };

    animationFrame = requestAnimationFrame(updateFPS);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, []);

  return {
    getCurrentFPS: () => {
      if (fpsHistory.current.length === 0) return 0;
      return fpsHistory.current[fpsHistory.current.length - 1];
    },
    getAverageFPS: () => {
      if (fpsHistory.current.length === 0) return 0;
      return Math.round(
        fpsHistory.current.reduce((a, b) => a + b, 0) /
          fpsHistory.current.length
      );
    },
  };
}
