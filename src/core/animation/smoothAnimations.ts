/**
 * High-performance animation utilities for 60 FPS target
 * Includes frame dropping strategy under load
 */

import { useCallback, useEffect, useRef, useState } from "react";

interface AnimationConfig {
  targetFPS: number;
  enableFrameDropping: boolean;
  maxFrameTime: number; // milliseconds
  adaptiveQuality: boolean;
}

interface AnimationFrame {
  timestamp: number;
  frameNumber: number;
  shouldRender: boolean;
  quality: "high" | "medium" | "low";
}

class SmoothAnimationManager {
  private config: AnimationConfig;
  private lastFrameTime = 0;
  private frameCount = 0;
  private droppedFrames = 0;
  private fpsHistory: number[] = [];
  private isRunning = false;
  private animationId: number | null = null;
  private frameCallback: ((frame: AnimationFrame) => void) | null = null;

  constructor(config: Partial<AnimationConfig> = {}) {
    this.config = {
      targetFPS: 60,
      enableFrameDropping: true,
      maxFrameTime: 16.67, // 60fps = 16.67ms per frame
      adaptiveQuality: true,
      ...config,
    };
  }

  start(callback: (frame: AnimationFrame) => void) {
    this.frameCallback = callback;
    this.isRunning = true;
    this.lastFrameTime = performance.now();
    this.frameCount = 0;
    this.droppedFrames = 0;
    this.animate();
  }

  stop() {
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    this.frameCallback = null;
  }

  private animate = () => {
    if (!this.isRunning || !this.frameCallback) return;

    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastFrameTime;

    // Calculate current FPS
    const currentFPS = 1000 / deltaTime;
    this.updateFPSHistory(currentFPS);

    // Determine if we should render this frame
    const shouldRender = this.shouldRenderFrame(deltaTime);

    // Determine quality level based on performance
    const quality = this.getQualityLevel();

    if (shouldRender) {
      const frame: AnimationFrame = {
        timestamp: currentTime,
        frameNumber: this.frameCount,
        shouldRender: true,
        quality,
      };

      this.frameCallback(frame);
      this.frameCount++;
    } else {
      this.droppedFrames++;
    }

    this.lastFrameTime = currentTime;
    this.animationId = requestAnimationFrame(this.animate);
  };

  private shouldRenderFrame(deltaTime: number): boolean {
    if (!this.config.enableFrameDropping) return true;

    // If we're running behind, consider dropping frames
    if (deltaTime > this.config.maxFrameTime * 1.5) {
      return false;
    }

    // If FPS is consistently low, drop every other frame
    const averageFPS = this.getAverageFPS();
    if (averageFPS < this.config.targetFPS * 0.7) {
      return this.frameCount % 2 === 0;
    }

    return true;
  }

  private getQualityLevel(): "high" | "medium" | "low" {
    if (!this.config.adaptiveQuality) return "high";

    const averageFPS = this.getAverageFPS();
    const targetFPS = this.config.targetFPS;

    if (averageFPS >= targetFPS * 0.9) return "high";
    if (averageFPS >= targetFPS * 0.6) return "medium";
    return "low";
  }

  private updateFPSHistory(fps: number) {
    this.fpsHistory.push(fps);
    if (this.fpsHistory.length > 60) {
      this.fpsHistory.shift();
    }
  }

  private getAverageFPS(): number {
    if (this.fpsHistory.length === 0) return this.config.targetFPS;
    return (
      this.fpsHistory.reduce((sum, fps) => sum + fps, 0) /
      this.fpsHistory.length
    );
  }

  getStats() {
    return {
      frameCount: this.frameCount,
      droppedFrames: this.droppedFrames,
      averageFPS: Math.round(this.getAverageFPS()),
      dropRate:
        this.frameCount > 0
          ? (this.droppedFrames / (this.frameCount + this.droppedFrames)) * 100
          : 0,
      currentQuality: this.getQualityLevel(),
    };
  }

  updateConfig(newConfig: Partial<AnimationConfig>) {
    this.config = { ...this.config, ...newConfig };
  }
}

// React hook for smooth animations
export function useSmoothAnimation(config?: Partial<AnimationConfig>) {
  const managerRef = useRef<SmoothAnimationManager | null>(null);
  const [stats, setStats] = useState<{
    frameCount: number;
    droppedFrames: number;
    averageFPS: number;
    dropRate: number;
    currentQuality: "high" | "medium" | "low";
  }>({
    frameCount: 0,
    droppedFrames: 0,
    averageFPS: 60,
    dropRate: 0,
    currentQuality: "high",
  });

  useEffect(() => {
    managerRef.current = new SmoothAnimationManager(config);

    return () => {
      managerRef.current?.stop();
    };
  }, [config]);

  const startAnimation = useCallback(
    (callback: (frame: AnimationFrame) => void) => {
      managerRef.current?.start((frame) => {
        callback(frame);
        // Update stats periodically
        if (frame.frameNumber % 30 === 0) {
          setStats(managerRef.current?.getStats() || stats);
        }
      });
    },
    [stats]
  );

  const stopAnimation = useCallback(() => {
    managerRef.current?.stop();
  }, []);

  const updateConfig = useCallback((newConfig: Partial<AnimationConfig>) => {
    managerRef.current?.updateConfig(newConfig);
  }, []);

  return {
    startAnimation,
    stopAnimation,
    updateConfig,
    stats,
  };
}

// Optimized CSS transitions
export const optimizedTransitions = {
  fast: "transform 150ms cubic-bezier(0.4, 0, 0.2, 1), opacity 150ms cubic-bezier(0.4, 0, 0.2, 1)",
  smooth:
    "transform 300ms cubic-bezier(0.4, 0, 0.2, 1), opacity 300ms cubic-bezier(0.4, 0, 0.2, 1)",
  bounce: "transform 500ms cubic-bezier(0.68, -0.55, 0.265, 1.55)",
  elastic: "transform 600ms cubic-bezier(0.68, 0, 0.265, 1)",
};

// Performance-optimized style utilities
export const performanceStyles = {
  // Enable hardware acceleration
  willChange: "transform, opacity",
  transform: "translateZ(0)", // Force GPU layer
  backfaceVisibility: "hidden" as const,
  perspective: 1000,

  // Optimize for animations
  contain: "layout style paint" as const,
  isolation: "isolate" as const,
};

// Frame rate limiter for specific operations
export function createFrameLimiter(targetFPS: number) {
  let lastFrameTime = 0;
  const frameInterval = 1000 / targetFPS;

  return (callback: () => void) => {
    const currentTime = performance.now();

    if (currentTime - lastFrameTime >= frameInterval) {
      lastFrameTime = currentTime;
      callback();
    }
  };
}

// Debounced animation trigger
export function createAnimationDebouncer(delay: number = 16) {
  let timeoutId: number | null = null;

  return (callback: () => void) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = window.setTimeout(() => {
      requestAnimationFrame(callback);
    }, delay);
  };
}

export { SmoothAnimationManager };
export type { AnimationConfig, AnimationFrame };
