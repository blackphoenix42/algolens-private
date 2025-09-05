# Custom React Hooks

This directory contains custom React hooks that encapsulate reusable logic, state management, and side effects for the AlgoLens application.

## 📁 Hook Categories

### Algorithm Hooks

- **useAlgorithm** - Main algorithm execution and state management
- **useAlgorithmRunner** - Algorithm runner integration
- **useAlgorithmHistory** - Step history and navigation
- **useAlgorithmComparison** - Side-by-side algorithm comparison

### Visualization Hooks

- **useCanvas** - Canvas management and rendering
- **useAnimation** - Animation control and timing
- **useVisualization** - Visualization state and configuration
- **useInteraction** - Mouse/touch interaction handling

### Data Hooks

- **useDataGenerator** - Random data generation and seeding
- **useDataValidation** - Input data validation and transformation
- **useDataPersistence** - Local storage and session management
- **useDataExport** - Export functionality for data and visualizations

### UI Hooks

- **useTheme** - Theme switching and color scheme management
- **useResponsive** - Responsive design utilities
- **useKeyboard** - Keyboard shortcuts and navigation
- **useModal** - Modal state management

### Performance Hooks

- **usePerformanceMonitor** - Performance metrics tracking
- **useDebounce** - Input debouncing and throttling
- **useMemoization** - Advanced memoization strategies
- **useWorker** - Web Worker integration

## 🧮 Algorithm Hooks

### useAlgorithm Hook

Main hook for algorithm execution and state management:

```typescript
interface UseAlgorithmOptions {
  autoRun?: boolean;
  playbackSpeed?: number;
  enableHistory?: boolean;
  maxHistorySize?: number;
}

interface UseAlgorithmReturn {
  // Current state
  algorithm: Algorithm | null;
  data: number[];
  currentStep: number;
  totalSteps: number;
  isRunning: boolean;
  isComplete: boolean;

  // Performance metrics
  performance: PerformanceMetrics;

  // Control actions
  setAlgorithm: (algorithm: Algorithm) => void;
  setData: (data: number[]) => void;
  play: () => void;
  pause: () => void;
  step: () => void;
  stepBack: () => void;
  reset: () => void;
  jumpToStep: (step: number) => void;

  // Configuration
  setSpeed: (speed: number) => void;
  setPlaybackSpeed: (speed: number) => void;

  // Export functions
  exportSteps: () => AlgorithmStep[];
  exportData: () => ExportData;
}

export const useAlgorithm = (
  options: UseAlgorithmOptions = {}
): UseAlgorithmReturn => {
  const [algorithm, setAlgorithm] = useState<Algorithm | null>(null);
  const [data, setData] = useState<number[]>([]);
  const [steps, setSteps] = useState<AlgorithmStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(
    options.playbackSpeed || 1
  );

  const runner = useAlgorithmRunner();
  const history = useAlgorithmHistory({ enabled: options.enableHistory });
  const performance = usePerformanceMonitor();

  // Execute algorithm when algorithm or data changes
  useEffect(() => {
    if (algorithm && data.length > 0) {
      const executeAlgorithm = async () => {
        try {
          const result = await runner.run(algorithm, data);
          setSteps(result.steps);
          performance.updateMetrics(result.performance);

          if (options.autoRun) {
            play();
          }
        } catch (error) {
          console.error("Algorithm execution failed:", error);
        }
      };

      executeAlgorithm();
    }
  }, [algorithm, data]);

  // Playback control
  const play = useCallback(() => {
    setIsRunning(true);
  }, []);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const step = useCallback(() => {
    if (currentStep < steps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      history.addStep(steps[nextStep]);
    }
  }, [currentStep, steps, history]);

  const stepBack = useCallback(() => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      history.goBack();
    }
  }, [currentStep, history]);

  const reset = useCallback(() => {
    setCurrentStep(0);
    setIsRunning(false);
    history.clear();
  }, [history]);

  // Auto-advance steps when playing
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      if (currentStep < steps.length - 1) {
        step();
      } else {
        setIsRunning(false);
      }
    }, 1000 / playbackSpeed);

    return () => clearInterval(interval);
  }, [isRunning, currentStep, steps.length, playbackSpeed, step]);

  return {
    algorithm,
    data,
    currentStep,
    totalSteps: steps.length,
    isRunning,
    isComplete: currentStep >= steps.length - 1,
    performance: performance.metrics,
    setAlgorithm,
    setData,
    play,
    pause,
    step,
    stepBack,
    reset,
    jumpToStep: setCurrentStep,
    setSpeed: setPlaybackSpeed,
    setPlaybackSpeed,
    exportSteps: () => [...steps],
    exportData: () => ({ algorithm, data, steps, currentStep }),
  };
};
```

### useAlgorithmComparison Hook

For comparing multiple algorithms side-by-side:

```typescript
interface ComparisonState {
  algorithms: Algorithm[];
  results: AlgorithmResult[];
  currentStep: number;
  isRunning: boolean;
  syncPlayback: boolean;
}

export const useAlgorithmComparison = (
  algorithms: Algorithm[],
  data: number[]
) => {
  const [state, setState] = useState<ComparisonState>({
    algorithms,
    results: [],
    currentStep: 0,
    isRunning: false,
    syncPlayback: true,
  });

  const runComparison = useCallback(async () => {
    const results = await Promise.all(
      algorithms.map((algorithm) => {
        const runner = new AlgorithmRunner();
        return runner.run(algorithm, [...data]);
      })
    );

    setState((prev) => ({ ...prev, results }));
  }, [algorithms, data]);

  const play = useCallback(() => {
    setState((prev) => ({ ...prev, isRunning: true }));
  }, []);

  const step = useCallback(() => {
    setState((prev) => {
      const maxSteps = Math.max(...prev.results.map((r) => r.steps.length));
      if (prev.currentStep < maxSteps - 1) {
        return { ...prev, currentStep: prev.currentStep + 1 };
      }
      return { ...prev, isRunning: false };
    });
  }, []);

  return {
    ...state,
    runComparison,
    play,
    step,
    pause: () => setState((prev) => ({ ...prev, isRunning: false })),
    reset: () =>
      setState((prev) => ({ ...prev, currentStep: 0, isRunning: false })),
  };
};
```

## 🎨 Visualization Hooks

### useCanvas Hook

Canvas management and rendering utilities:

```typescript
interface UseCanvasOptions {
  width?: number;
  height?: number;
  responsive?: boolean;
  enableInteraction?: boolean;
  backgroundColor?: string;
}

export const useCanvas = (options: UseCanvasOptions = {}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({
    width: options.width || 800,
    height: options.height || 400,
  });

  const contextRef = useRef<CanvasRenderingContext2D | null>(null);

  // Initialize canvas context
  useEffect(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        contextRef.current = ctx;

        // Set up high-DPI support
        const devicePixelRatio = window.devicePixelRatio || 1;
        const canvas = canvasRef.current;

        canvas.width = dimensions.width * devicePixelRatio;
        canvas.height = dimensions.height * devicePixelRatio;
        canvas.style.width = `${dimensions.width}px`;
        canvas.style.height = `${dimensions.height}px`;

        ctx.scale(devicePixelRatio, devicePixelRatio);
      }
    }
  }, [dimensions]);

  // Responsive canvas sizing
  useEffect(() => {
    if (!options.responsive) return;

    const handleResize = () => {
      if (canvasRef.current?.parentElement) {
        const { width } =
          canvasRef.current.parentElement.getBoundingClientRect();
        setDimensions({
          width: Math.min(width, 1200),
          height: Math.min(width * 0.5, 600),
        });
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [options.responsive]);

  const clear = useCallback(() => {
    if (contextRef.current) {
      contextRef.current.clearRect(0, 0, dimensions.width, dimensions.height);

      if (options.backgroundColor) {
        contextRef.current.fillStyle = options.backgroundColor;
        contextRef.current.fillRect(0, 0, dimensions.width, dimensions.height);
      }
    }
  }, [dimensions, options.backgroundColor]);

  const drawElement = useCallback(
    (
      x: number,
      y: number,
      width: number,
      height: number,
      color: string,
      value?: string | number
    ) => {
      if (!contextRef.current) return;

      const ctx = contextRef.current;

      // Draw element
      ctx.fillStyle = color;
      ctx.fillRect(x, y, width, height);

      // Draw border
      ctx.strokeStyle = "#333";
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, width, height);

      // Draw value text
      if (value !== undefined) {
        ctx.fillStyle = "#fff";
        ctx.font = "14px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(value.toString(), x + width / 2, y + height / 2);
      }
    },
    []
  );

  const exportImage = useCallback((format: "png" | "jpeg" | "webp" = "png") => {
    if (!canvasRef.current) return null;
    return canvasRef.current.toDataURL(`image/${format}`);
  }, []);

  return {
    canvasRef,
    context: contextRef.current,
    dimensions,
    clear,
    drawElement,
    exportImage,
  };
};
```

### useAnimation Hook

Animation timing and control:

```typescript
interface UseAnimationOptions {
  duration?: number;
  easing?: (t: number) => number;
  autoStart?: boolean;
}

export const useAnimation = (options: UseAnimationOptions = {}) => {
  const [isPlaying, setIsPlaying] = useState(options.autoStart || false);
  const [progress, setProgress] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const duration = options.duration || 1000;
  const easing = options.easing || ((t: number) => t); // Linear by default

  const animate = useCallback(
    (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const rawProgress = Math.min(elapsed / duration, 1);
      const easedProgress = easing(rawProgress);

      setProgress(easedProgress);

      if (rawProgress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setIsPlaying(false);
        startTimeRef.current = null;
      }
    },
    [duration, easing]
  );

  const start = useCallback(() => {
    setIsPlaying(true);
    startTimeRef.current = null;
    animationFrameRef.current = requestAnimationFrame(animate);
  }, [animate]);

  const stop = useCallback(() => {
    setIsPlaying(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    startTimeRef.current = null;
    setProgress(0);
  }, []);

  const pause = useCallback(() => {
    setIsPlaying(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return {
    isPlaying,
    progress,
    start,
    stop,
    pause,
  };
};
```

## 📊 Data Hooks

### useDataGenerator Hook

Generate and manage test data:

```typescript
interface DataGeneratorOptions {
  size?: number;
  min?: number;
  max?: number;
  seed?: string;
  type?: "random" | "sorted" | "reversed" | "nearly-sorted" | "duplicates";
}

export const useDataGenerator = () => {
  const [currentData, setCurrentData] = useState<number[]>([]);
  const [generationHistory, setGenerationHistory] = useState<number[][]>([]);

  const generateData = useCallback((options: DataGeneratorOptions = {}) => {
    const { size = 50, min = 1, max = 100, seed, type = "random" } = options;

    let data: number[];

    // Seed random number generator if provided
    if (seed) {
      Math.seedrandom(seed);
    }

    switch (type) {
      case "random":
        data = Array.from(
          { length: size },
          () => Math.floor(Math.random() * (max - min + 1)) + min
        );
        break;

      case "sorted":
        data = Array.from(
          { length: size },
          (_, i) => Math.floor((i / (size - 1)) * (max - min)) + min
        );
        break;

      case "reversed":
        data = Array.from(
          { length: size },
          (_, i) =>
            Math.floor(((size - 1 - i) / (size - 1)) * (max - min)) + min
        );
        break;

      case "nearly-sorted":
        data = Array.from(
          { length: size },
          (_, i) => Math.floor((i / (size - 1)) * (max - min)) + min
        );
        // Introduce some swaps
        for (let i = 0; i < Math.floor(size * 0.1); i++) {
          const idx1 = Math.floor(Math.random() * size);
          const idx2 = Math.floor(Math.random() * size);
          [data[idx1], data[idx2]] = [data[idx2], data[idx1]];
        }
        break;

      case "duplicates":
        const uniqueCount = Math.floor(size / 3);
        const uniqueValues = Array.from(
          { length: uniqueCount },
          () => Math.floor(Math.random() * (max - min + 1)) + min
        );
        data = Array.from(
          { length: size },
          () => uniqueValues[Math.floor(Math.random() * uniqueValues.length)]
        );
        break;

      default:
        data = [];
    }

    setCurrentData(data);
    setGenerationHistory((prev) => [...prev.slice(-9), data]); // Keep last 10

    return data;
  }, []);

  const regenerateLastData = useCallback(() => {
    if (generationHistory.length > 0) {
      const lastData = generationHistory[generationHistory.length - 1];
      setCurrentData([...lastData]);
      return lastData;
    }
    return [];
  }, [generationHistory]);

  const getHistoryItem = useCallback(
    (index: number) => {
      if (index >= 0 && index < generationHistory.length) {
        const data = generationHistory[index];
        setCurrentData([...data]);
        return data;
      }
      return [];
    },
    [generationHistory]
  );

  return {
    currentData,
    generateData,
    regenerateLastData,
    getHistoryItem,
    history: generationHistory,
  };
};
```

## ⚡ Performance Hooks

### usePerformanceMonitor Hook

Track and analyze performance metrics:

```typescript
interface PerformanceMetrics {
  executionTime: number;
  memoryUsage: number;
  frameRate: number;
  operationCounts: {
    comparisons: number;
    swaps: number;
    assignments: number;
  };
}

export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    executionTime: 0,
    memoryUsage: 0,
    frameRate: 0,
    operationCounts: {
      comparisons: 0,
      swaps: 0,
      assignments: 0,
    },
  });

  const [isMonitoring, setIsMonitoring] = useState(false);
  const startTimeRef = useRef<number | null>(null);
  const frameCountRef = useRef(0);
  const lastFrameTimeRef = useRef<number | null>(null);

  const startMonitoring = useCallback(() => {
    setIsMonitoring(true);
    startTimeRef.current = performance.now();
    frameCountRef.current = 0;
    lastFrameTimeRef.current = performance.now();

    setMetrics((prev) => ({
      ...prev,
      operationCounts: { comparisons: 0, swaps: 0, assignments: 0 },
    }));
  }, []);

  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);

    if (startTimeRef.current) {
      const executionTime = performance.now() - startTimeRef.current;
      setMetrics((prev) => ({ ...prev, executionTime }));
    }
  }, []);

  const recordFrame = useCallback(() => {
    if (!isMonitoring) return;

    frameCountRef.current++;
    const now = performance.now();

    if (lastFrameTimeRef.current) {
      const deltaTime = now - lastFrameTimeRef.current;
      const currentFPS = 1000 / deltaTime;

      setMetrics((prev) => ({
        ...prev,
        frameRate: Math.round(currentFPS * 10) / 10,
      }));
    }

    lastFrameTimeRef.current = now;
  }, [isMonitoring]);

  const recordOperation = useCallback(
    (type: "comparison" | "swap" | "assignment") => {
      setMetrics((prev) => ({
        ...prev,
        operationCounts: {
          ...prev.operationCounts,
          [`${type}s`]:
            prev.operationCounts[
              `${type}s` as keyof typeof prev.operationCounts
            ] + 1,
        },
      }));
    },
    []
  );

  // Memory usage monitoring
  useEffect(() => {
    if (!isMonitoring) return;

    const updateMemoryUsage = () => {
      if ("memory" in performance) {
        const memInfo = (performance as any).memory;
        setMetrics((prev) => ({
          ...prev,
          memoryUsage: memInfo.usedJSHeapSize,
        }));
      }
    };

    const interval = setInterval(updateMemoryUsage, 1000);
    return () => clearInterval(interval);
  }, [isMonitoring]);

  return {
    metrics,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    recordFrame,
    recordOperation,
  };
};
```

### useDebounce Hook

Debounce rapid state changes:

```typescript
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Advanced debounce with cancellation
export const useAdvancedDebounce = <T>(
  value: T,
  delay: number,
  options: { leading?: boolean; trailing?: boolean } = {}
) => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousValueRef = useRef<T>(value);
  const { leading = false, trailing = true } = options;

  useEffect(() => {
    const isFirstCall = previousValueRef.current === value;

    if (leading && isFirstCall) {
      setDebouncedValue(value);
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      if (trailing) {
        setDebouncedValue(value);
      }
    }, delay);

    previousValueRef.current = value;

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay, leading, trailing]);

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const flush = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      setDebouncedValue(value);
    }
  }, [value]);

  return { debouncedValue, cancel, flush };
};
```

## 🧪 Testing Hooks

### Hook Testing Utilities

```typescript
// Custom render hook for testing
export const renderHookWithProviders = <T>(
  hook: () => T,
  providers: React.ComponentType<{ children: React.ReactNode }>[]
) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    return providers.reduce(
      (acc, Provider) => <Provider>{acc}</Provider>,
      children as React.ReactElement
    );
  };

  return renderHook(hook, { wrapper: Wrapper });
};

// Test algorithm hook
describe('useAlgorithm', () => {
  it('should execute algorithm correctly', async () => {
    const { result } = renderHookWithProviders(
      () => useAlgorithm(),
      [AlgorithmProvider, ThemeProvider]
    );

    act(() => {
      result.current.setAlgorithm(new BubbleSortAlgorithm());
      result.current.setData([3, 1, 4, 1, 5]);
    });

    await waitFor(() => {
      expect(result.current.totalSteps).toBeGreaterThan(0);
    });

    act(() => {
      result.current.play();
    });

    await waitFor(() => {
      expect(result.current.isComplete).toBe(true);
    });
  });
});
```

## 🔗 Related Resources

- **Components**: `../components/` - Components that use these hooks
- **Core Engine**: `../core/` - Core algorithm engine
- **Context**: `../contexts/` - React context providers
- **Utils**: `../lib/` - Utility functions used by hooks
- **Types**: `../types/` - TypeScript definitions for hook interfaces
