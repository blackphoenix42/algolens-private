/**
 * Performance optimization utilities for AlgoLens
 * Targets: LCP < 2.5s, INP < 200ms, CLS < 0.1
 */

import { useCallback, useEffect, useRef, useState } from "react";

// Enhanced performance monitoring with alerts
export const performanceMetrics = {
  lcp: 0,
  fid: 0,
  cls: 0,
  inp: 0,
  // New metrics
  ttfb: 0, // Time to First Byte
  fcp: 0, // First Contentful Paint
  totalBlockingTime: 0,
};

// Performance alerts system
export interface PerformanceAlert {
  id: string;
  type: "warning" | "error" | "info";
  metric: string;
  message: string;
  timestamp: number;
  value: number;
  threshold: number;
}

let performanceAlerts: PerformanceAlert[] = [];
let alertCallbacks: ((alert: PerformanceAlert) => void)[] = [];

export function addPerformanceAlert(
  alert: Omit<PerformanceAlert, "id" | "timestamp">
) {
  const fullAlert: PerformanceAlert = {
    ...alert,
    id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
  };

  performanceAlerts = [...performanceAlerts.slice(-19), fullAlert]; // Keep last 20 alerts
  alertCallbacks.forEach((callback) => callback(fullAlert));
}

export function getPerformanceAlerts(): PerformanceAlert[] {
  return performanceAlerts;
}

export function onPerformanceAlert(
  callback: (alert: PerformanceAlert) => void
) {
  alertCallbacks.push(callback);
  return () => {
    alertCallbacks = alertCallbacks.filter((cb) => cb !== callback);
  };
}

export function clearPerformanceAlerts() {
  performanceAlerts = [];
}

// Track Core Web Vitals with enhanced monitoring
export function trackWebVitals() {
  if (typeof window === "undefined") return;

  // Track LCP (Largest Contentful Paint)
  if ("PerformanceObserver" in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries() as PerformanceEntry[];
        const lastEntry = entries[entries.length - 1] as PerformanceEntry & {
          startTime: number;
        };
        performanceMetrics.lcp = lastEntry.startTime;

        if (lastEntry.startTime > 4000) {
          console.warn(`LCP is ${lastEntry.startTime}ms (target: <2500ms)`);
          addPerformanceAlert({
            type: "warning",
            metric: "LCP",
            message:
              "Largest Contentful Paint is slow. Consider optimizing images and critical resources.",
            value: lastEntry.startTime,
            threshold: 2500,
          });
        }
      });
      observer.observe({ type: "largest-contentful-paint", buffered: true });
    } catch (e) {
      console.warn("LCP tracking failed:", e);
    }

    // Track FCP (First Contentful Paint)
    try {
      const fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        for (const entry of entries) {
          if (entry.name === "first-contentful-paint") {
            performanceMetrics.fcp = entry.startTime;

            if (entry.startTime > 3000) {
              addPerformanceAlert({
                type: "warning",
                metric: "FCP",
                message:
                  "First Contentful Paint is slow. Optimize your initial page load.",
                value: entry.startTime,
                threshold: 1800,
              });
            }
          }
        }
      });
      fcpObserver.observe({ type: "paint", buffered: true });
    } catch (e) {
      console.warn("FCP tracking failed:", e);
    }

    // Track CLS (Cumulative Layout Shift)
    try {
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0;
        for (const entry of list.getEntries() as (PerformanceEntry & {
          value?: number;
          hadRecentInput?: boolean;
        })[]) {
          if (!entry.hadRecentInput && typeof entry.value === "number") {
            clsValue += entry.value;
          }
        }
        performanceMetrics.cls = clsValue;

        if (clsValue > 0.25) {
          console.warn(`CLS is ${clsValue} (target: <0.1)`);
          addPerformanceAlert({
            type: "error",
            metric: "CLS",
            message:
              "High Cumulative Layout Shift detected. Set dimensions for dynamic content.",
            value: clsValue,
            threshold: 0.1,
          });
        } else if (clsValue > 0.1) {
          addPerformanceAlert({
            type: "warning",
            metric: "CLS",
            message:
              "Moderate layout shift detected. Consider improving layout stability.",
            value: clsValue,
            threshold: 0.1,
          });
        }
      });
      clsObserver.observe({ type: "layout-shift", buffered: true });
    } catch (e) {
      console.warn("CLS tracking failed:", e);
    }

    // Track Total Blocking Time and Long Tasks
    try {
      const longTaskObserver = new PerformanceObserver((list) => {
        let totalBlockingTime = 0;
        for (const entry of list.getEntries()) {
          // Tasks longer than 50ms are considered blocking
          if (entry.duration > 50) {
            totalBlockingTime += entry.duration - 50;
          }
        }

        if (totalBlockingTime > 0) {
          performanceMetrics.totalBlockingTime += totalBlockingTime;

          if (totalBlockingTime > 300) {
            addPerformanceAlert({
              type: "warning",
              metric: "TBT",
              message:
                "Long tasks detected. Break up JavaScript execution to improve responsiveness.",
              value: totalBlockingTime,
              threshold: 300,
            });
          }
        }
      });
      longTaskObserver.observe({ type: "longtask", buffered: true });
    } catch (e) {
      console.warn("Long task tracking failed:", e);
    }

    // Track Navigation Timing for TTFB
    try {
      const navigationObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === "navigation") {
            const navEntry = entry as PerformanceNavigationTiming;
            const ttfb = navEntry.responseStart - navEntry.requestStart;
            performanceMetrics.ttfb = ttfb;

            if (ttfb > 800) {
              addPerformanceAlert({
                type: "warning",
                metric: "TTFB",
                message:
                  "Slow server response time. Consider optimizing your backend or CDN.",
                value: ttfb,
                threshold: 200,
              });
            }
          }
        }
      });
      navigationObserver.observe({ type: "navigation", buffered: true });
    } catch (e) {
      console.warn("Navigation timing failed:", e);
    }
  }
}

// Enhanced debounce with immediate execution option
export function useDebounce<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number,
  immediate = false
): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef(callback);
  const immediateRef = useRef(immediate);

  useEffect(() => {
    callbackRef.current = callback;
    immediateRef.current = immediate;
  });

  return useCallback(
    ((...args: Parameters<T>) => {
      const executeCallback = () => callbackRef.current(...args);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      if (immediateRef.current && !timeoutRef.current) {
        executeCallback();
      }

      timeoutRef.current = setTimeout(
        immediateRef.current ? () => {} : executeCallback,
        delay
      );
    }) as T,
    [delay]
  );
}

// Enhanced throttle for smooth animations
export function useThrottle<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): T {
  const lastCall = useRef(0);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  });

  return useCallback(
    ((...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastCall.current >= delay) {
        lastCall.current = now;
        return callbackRef.current(...args);
      }
    }) as T,
    [delay]
  );
}

// Intersection Observer hook for lazy loading
export function useIntersectionObserver(
  elementRef: React.RefObject<Element | null>,
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        if (entry.isIntersecting && !hasIntersected) {
          setHasIntersected(true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: "50px",
        ...options,
      }
    );

    observer.observe(element);

    return () => observer.unobserve(element);
  }, [hasIntersected, elementRef, options]);

  return { isIntersecting, hasIntersected };
}

// Performance-optimized image loading
export function useImageLoader(src: string) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!src) return;

    const img = new Image();
    img.onload = () => setLoaded(true);
    img.onerror = () => setError(true);
    img.src = src;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  return { loaded, error };
}

// Enhanced FPS monitoring with trend analysis
export function useFPSMonitor() {
  const [fps, setFps] = useState(60);
  const [fpsHistory, setFpsHistory] = useState<number[]>([]);
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const animationFrame = useRef<number | null>(null);

  useEffect(() => {
    const updateFPS = () => {
      frameCount.current++;
      const currentTime = performance.now();

      if (currentTime - lastTime.current >= 1000) {
        const currentFPS = Math.round(
          (frameCount.current * 1000) / (currentTime - lastTime.current)
        );
        setFps(currentFPS);

        // Update FPS history
        setFpsHistory((prev) => [...prev.slice(-29), currentFPS]);

        // Performance alerts for FPS
        if (currentFPS < 20) {
          console.warn(
            `Very low FPS detected: ${currentFPS}fps (target: 60fps)`
          );
          addPerformanceAlert({
            type: "error",
            metric: "FPS",
            message:
              "Very low frame rate detected. Consider reducing animation complexity or using requestIdleCallback.",
            value: currentFPS,
            threshold: 30,
          });
        } else if (currentFPS < 30) {
          addPerformanceAlert({
            type: "warning",
            metric: "FPS",
            message:
              "Low frame rate detected. Performance optimizations recommended.",
            value: currentFPS,
            threshold: 30,
          });
        }

        frameCount.current = 0;
        lastTime.current = currentTime;
      }

      animationFrame.current = requestAnimationFrame(updateFPS);
    };

    animationFrame.current = requestAnimationFrame(updateFPS);

    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, []);

  return { fps, fpsHistory };
}

// Optimized state updater to prevent unnecessary re-renders
export function useOptimizedState<T>(initialState: T) {
  const [state, setState] = useState(initialState);

  const setOptimizedState = useCallback((newState: T | ((prev: T) => T)) => {
    setState((prevState) => {
      const nextState =
        typeof newState === "function"
          ? (newState as (prev: T) => T)(prevState)
          : newState;
      // Only update if the state actually changed
      return JSON.stringify(nextState) === JSON.stringify(prevState)
        ? prevState
        : nextState;
    });
  }, []);

  return [state, setOptimizedState] as const;
}

// RequestAnimationFrame hook for smooth animations
export function useAnimationFrame(callback: (deltaTime: number) => void) {
  const requestRef = useRef<number | null>(null);
  const previousTimeRef = useRef<number | null>(null);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  });

  const animate = useCallback((time: number) => {
    if (previousTimeRef.current !== null) {
      const deltaTime = time - previousTimeRef.current;
      callbackRef.current(deltaTime);
    }
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [animate]);
}

// Memory usage monitoring
interface MemoryInfo {
  used: number;
  total: number;
  limit: number;
}

export function useMemoryMonitor() {
  const [memoryInfo, setMemoryInfo] = useState<MemoryInfo | null>(null);

  useEffect(() => {
    const updateMemory = () => {
      if ("memory" in performance) {
        const mem = (
          performance as unknown as {
            memory: {
              usedJSHeapSize: number;
              totalJSHeapSize: number;
              jsHeapSizeLimit: number;
            };
          }
        ).memory;
        setMemoryInfo({
          used: Math.round(mem.usedJSHeapSize / 1048576),
          total: Math.round(mem.totalJSHeapSize / 1048576),
          limit: Math.round(mem.jsHeapSizeLimit / 1048576),
        });
      }
    };

    updateMemory();
    const interval = setInterval(updateMemory, 5000);
    return () => clearInterval(interval);
  }, []);

  return memoryInfo;
}

// Preload resources
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
}

export function preloadFont(fontFamily: string, weight = "400"): Promise<void> {
  if (!("fonts" in document)) {
    return Promise.resolve();
  }
  // TypeScript lib.dom doesn't include the FontFaceSet load signature in some configs
  return (
    document as unknown as {
      fonts: { load: (font: string) => Promise<unknown> };
    }
  ).fonts
    .load(`${weight} 1em ${fontFamily}`)
    .then(() => undefined);
}

// Batch DOM updates
export function batchDOMUpdates(callback: () => void) {
  try {
    callback();
  } catch {
    // fail silently
  }
}
