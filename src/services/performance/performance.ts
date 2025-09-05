/**
 * Performance optimization utilities for AlgoLens
 * Targets: LCP < 2.5s, INP < 200ms, CLS < 0.1
 */

import { useCallback, useEffect, useRef, useState } from "react";

// Performance monitoring
export const performanceMetrics = {
  lcp: 0,
  fid: 0,
  cls: 0,
  inp: 0,
};

// Track Core Web Vitals
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
        }
      });
      observer.observe({ type: "largest-contentful-paint", buffered: true });
    } catch (e) {
      console.warn("LCP tracking failed:", e);
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

        if (clsValue > 0.1) {
          console.warn(`CLS is ${clsValue} (target: <0.1)`);
        }
      });
      clsObserver.observe({ type: "layout-shift", buffered: true });
    } catch (e) {
      console.warn("CLS tracking failed:", e);
    }
  }
}

// Enhanced debounce with immediate execution option
export function useDebounce<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number,
  immediate = false
): T {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const callbackRef = useRef(callback);
  const immediateRef = useRef(immediate);

  useEffect(() => {
    callbackRef.current = callback;
    immediateRef.current = immediate;
  });

  return useCallback(
    ((...args: Parameters<T>) => {
      const executeCallback = () => callbackRef.current(...args);

      clearTimeout(timeoutRef.current);

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
  elementRef: React.RefObject<Element>,
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

// Smooth scroll utility
export function smoothScrollTo(element: Element | string, offset = 0) {
  const target =
    typeof element === "string" ? document.querySelector(element) : element;
  if (!target) return;

  const targetPosition =
    target.getBoundingClientRect().top + window.pageYOffset - offset;

  window.scrollTo({
    top: targetPosition,
    behavior: "smooth",
  });
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

// FPS monitoring
export function useFPSMonitor() {
  const [fps, setFps] = useState(60);
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const animationFrame = useRef<number>();

  useEffect(() => {
    const updateFPS = () => {
      frameCount.current++;
      const currentTime = performance.now();

      if (currentTime - lastTime.current >= 1000) {
        const currentFPS = Math.round(
          (frameCount.current * 1000) / (currentTime - lastTime.current)
        );
        setFps(currentFPS);

        if (currentFPS < 30) {
          console.warn(`Low FPS detected: ${currentFPS}fps (target: 60fps)`);
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

  return fps;
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
  const requestRef = useRef<number>();
  const previousTimeRef = useRef<number>();
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  });

  const animate = useCallback((time: number) => {
    if (previousTimeRef.current !== undefined) {
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
