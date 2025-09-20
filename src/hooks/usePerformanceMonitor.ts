// src/hooks/usePerformanceMonitor.ts
// Performance monitoring disabled to eliminate localStorage usage

// Stub implementation - performance monitoring disabled
export function usePerformanceMonitor(_componentName: string) {
  // Performance monitoring disabled
  return {
    getMetrics: () => ({
      renderCount: 0,
      lastRenderTime: 0,
      averageRenderTime: 0,
      totalRenderTime: 0,
      componentName: _componentName,
    }),
    reset: () => {
      // No-op
    },
  };
}

// Disabled hook stubs
export function useAsyncPerformance() {
  return {
    measureAsync: async <T>(
      _operationName: string,
      asyncOperation: () => Promise<T>
    ): Promise<T> => {
      // Just execute without measurement
      return asyncOperation();
    },
  };
}

export function useRenderPerformance(_componentName: string) {
  return {
    measureRender: () => {
      // No-op
    },
  };
}

export function useInteractionPerformance(_componentName: string) {
  return {
    measureInteraction: <T>(_interactionName: string, callback: () => T): T => {
      // Just execute callback without measurement
      return callback();
    },
  };
}

export function useFrameRateMonitor() {
  return {
    startMonitoring: () => {
      // No-op
    },
    stopMonitoring: () => {
      // No-op
    },
  };
}
