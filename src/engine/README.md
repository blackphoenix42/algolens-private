# Algorithm Engine

This directory contains the high-level algorithm execution engine that orchestrates algorithm running, state management, and integration with the visualization system. It provides the main interface between the UI and the core algorithm implementations.

## 📁 Directory Structure

```
src/engine/
├── registry.ts        # Algorithm registration and discovery
├── runner.ts          # High-level algorithm execution
├── types.ts           # Engine-specific type definitions
└── urlState.ts        # URL state management for algorithm parameters
```

## 🎯 Purpose

The engine directory serves as the orchestration layer for AlgoLens, providing:

- **Algorithm Discovery**: Registry system for available algorithms
- **Execution Management**: High-level control over algorithm running
- **State Synchronization**: URL state management and persistence
- **Performance Monitoring**: Execution metrics and optimization
- **User Experience**: Smooth integration with UI components

## 📋 Core Files

### `registry.ts` - Algorithm Registration System

The registry manages all available algorithms and provides discovery mechanisms.

```typescript
interface AlgorithmRegistryEntry {
  id: string;
  name: string;
  category: string;
  description: string;
  algorithm: new () => Algorithm;
  complexity: {
    time: string;
    space: string;
  };
  tags: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
  prerequisites?: string[];
}

class AlgorithmRegistry {
  private algorithms = new Map<string, AlgorithmRegistryEntry>();

  register(entry: AlgorithmRegistryEntry): void {
    this.algorithms.set(entry.id, entry);
  }

  get(id: string): AlgorithmRegistryEntry | undefined {
    return this.algorithms.get(id);
  }

  getByCategory(category: string): AlgorithmRegistryEntry[] {
    return Array.from(this.algorithms.values()).filter(
      (entry) => entry.category === category
    );
  }

  search(query: string): AlgorithmRegistryEntry[] {
    const searchTerm = query.toLowerCase();
    return Array.from(this.algorithms.values()).filter(
      (entry) =>
        entry.name.toLowerCase().includes(searchTerm) ||
        entry.description.toLowerCase().includes(searchTerm) ||
        entry.tags.some((tag) => tag.toLowerCase().includes(searchTerm))
    );
  }

  getAllCategories(): string[] {
    const categories = new Set<string>();
    this.algorithms.forEach((entry) => categories.add(entry.category));
    return Array.from(categories).sort();
  }
}

export const algorithmRegistry = new AlgorithmRegistry();

// Register sorting algorithms
algorithmRegistry.register({
  id: "bubble-sort",
  name: "Bubble Sort",
  category: "Sorting",
  description: "Simple comparison-based sorting with adjacent element swaps",
  algorithm: BubbleSortAlgorithm,
  complexity: { time: "O(n²)", space: "O(1)" },
  tags: ["comparison", "stable", "in-place", "simple"],
  difficulty: "beginner",
});

algorithmRegistry.register({
  id: "merge-sort",
  name: "Merge Sort",
  category: "Sorting",
  description:
    "Divide-and-conquer sorting with guaranteed O(n log n) performance",
  algorithm: MergeSortAlgorithm,
  complexity: { time: "O(n log n)", space: "O(n)" },
  tags: ["divide-conquer", "stable", "optimal"],
  difficulty: "intermediate",
  prerequisites: ["bubble-sort", "insertion-sort"],
});
```

**Key Features:**

- Dynamic algorithm registration
- Category-based organization
- Search and filtering capabilities
- Difficulty progression tracking
- Prerequisite management

### `runner.ts` - Algorithm Execution Engine

The runner provides high-level control over algorithm execution with advanced features.

```typescript
interface RunnerOptions {
  speed: number; // Steps per second
  pauseOnStep?: boolean; // Manual step-through mode
  breakpoints?: Set<number>; // Step indices to pause on
  maxSteps?: number; // Execution limit
  onStep?: (step: AlgorithmStep, index: number) => void;
  onComplete?: (metrics: ExecutionMetrics) => void;
  onError?: (error: Error) => void;
}

interface ExecutionMetrics {
  totalSteps: number;
  executionTime: number;
  memoryUsage: number;
  operationCounts: Record<string, number>;
  complexity: {
    timeActual: number;
    spaceActual: number;
  };
}

class AlgorithmRunner {
  private algorithm: Algorithm;
  private steps: AlgorithmStep[] = [];
  private currentStepIndex = 0;
  private isRunning = false;
  private isPaused = false;
  private options: RunnerOptions;
  private startTime = 0;
  private metrics: ExecutionMetrics;

  constructor(algorithm: Algorithm, options: RunnerOptions = {}) {
    this.algorithm = algorithm;
    this.options = {
      speed: 1,
      pauseOnStep: false,
      breakpoints: new Set(),
      maxSteps: 10000,
      ...options,
    };
  }

  async execute(data: any[]): Promise<ExecutionMetrics> {
    this.reset();
    this.isRunning = true;
    this.startTime = performance.now();

    try {
      // Generate algorithm steps
      this.steps = this.algorithm.execute(data, this.options);

      if (this.steps.length > this.options.maxSteps) {
        throw new Error(
          `Algorithm exceeded maximum steps (${this.options.maxSteps})`
        );
      }

      // Execute steps with timing and visualization
      for (let i = 0; i < this.steps.length && this.isRunning; i++) {
        this.currentStepIndex = i;
        const step = this.steps[i];

        // Check for breakpoints
        if (this.options.breakpoints?.has(i)) {
          await this.pause();
        }

        // Execute step callback
        if (this.options.onStep) {
          this.options.onStep(step, i);
        }

        // Apply timing delay
        if (!this.options.pauseOnStep) {
          await this.wait(1000 / this.options.speed);
        } else {
          await this.waitForResume();
        }

        // Update metrics
        this.updateMetrics(step);
      }

      // Calculate final metrics
      this.metrics = this.calculateMetrics();

      if (this.options.onComplete) {
        this.options.onComplete(this.metrics);
      }

      return this.metrics;
    } catch (error) {
      if (this.options.onError) {
        this.options.onError(error as Error);
      }
      throw error;
    } finally {
      this.isRunning = false;
    }
  }

  pause(): void {
    this.isPaused = true;
  }

  resume(): void {
    this.isPaused = false;
  }

  stop(): void {
    this.isRunning = false;
    this.isPaused = false;
  }

  stepForward(): boolean {
    if (this.currentStepIndex < this.steps.length - 1) {
      this.currentStepIndex++;
      const step = this.steps[this.currentStepIndex];
      if (this.options.onStep) {
        this.options.onStep(step, this.currentStepIndex);
      }
      return true;
    }
    return false;
  }

  stepBackward(): boolean {
    if (this.currentStepIndex > 0) {
      this.currentStepIndex--;
      const step = this.steps[this.currentStepIndex];
      if (this.options.onStep) {
        this.options.onStep(step, this.currentStepIndex);
      }
      return true;
    }
    return false;
  }

  jumpToStep(index: number): boolean {
    if (index >= 0 && index < this.steps.length) {
      this.currentStepIndex = index;
      const step = this.steps[index];
      if (this.options.onStep) {
        this.options.onStep(step, index);
      }
      return true;
    }
    return false;
  }

  setSpeed(speed: number): void {
    this.options.speed = Math.max(0.1, Math.min(10, speed));
  }

  addBreakpoint(stepIndex: number): void {
    this.options.breakpoints?.add(stepIndex);
  }

  removeBreakpoint(stepIndex: number): void {
    this.options.breakpoints?.delete(stepIndex);
  }

  getCurrentStep(): AlgorithmStep | null {
    return this.steps[this.currentStepIndex] || null;
  }

  getProgress(): number {
    return this.steps.length > 0
      ? this.currentStepIndex / this.steps.length
      : 0;
  }

  private async wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async waitForResume(): Promise<void> {
    return new Promise((resolve) => {
      const checkResume = () => {
        if (!this.isPaused || !this.isRunning) {
          resolve();
        } else {
          setTimeout(checkResume, 100);
        }
      };
      checkResume();
    });
  }

  private updateMetrics(step: AlgorithmStep): void {
    // Update operation counts
    this.metrics.operationCounts[step.type] =
      (this.metrics.operationCounts[step.type] || 0) + 1;
  }

  private calculateMetrics(): ExecutionMetrics {
    const endTime = performance.now();
    return {
      totalSteps: this.steps.length,
      executionTime: endTime - this.startTime,
      memoryUsage: this.estimateMemoryUsage(),
      operationCounts: this.metrics.operationCounts,
      complexity: {
        timeActual: this.steps.length,
        spaceActual: this.estimateSpaceComplexity(),
      },
    };
  }

  private estimateMemoryUsage(): number {
    // Estimate memory usage based on step data
    return this.steps.reduce((total, step) => {
      return total + JSON.stringify(step).length;
    }, 0);
  }

  private estimateSpaceComplexity(): number {
    // Analyze space usage patterns from steps
    const maxIndicesUsed = Math.max(
      ...this.steps.map((step) => Math.max(...step.indices))
    );
    return maxIndicesUsed + 1;
  }

  private reset(): void {
    this.steps = [];
    this.currentStepIndex = 0;
    this.isPaused = false;
    this.metrics = {
      totalSteps: 0,
      executionTime: 0,
      memoryUsage: 0,
      operationCounts: {},
      complexity: { timeActual: 0, spaceActual: 0 },
    };
  }
}
```

**Key Features:**

- Variable speed execution control
- Step-by-step debugging capabilities
- Breakpoint system for detailed analysis
- Performance metrics collection
- Resume/pause functionality
- Error handling and recovery

### `types.ts` - Engine Type Definitions

Defines types specific to the engine layer.

```typescript
export interface AlgorithmMetadata {
  id: string;
  name: string;
  category: string;
  description: string;
  complexity: ComplexityInfo;
  tags: string[];
  difficulty: DifficultyLevel;
  prerequisites: string[];
  version: string;
  author: string;
  lastUpdated: Date;
}

export interface ComplexityInfo {
  time: {
    best: string;
    average: string;
    worst: string;
  };
  space: string;
  explanation: string;
}

export type DifficultyLevel =
  | "beginner"
  | "intermediate"
  | "advanced"
  | "expert";

export interface ExecutionContext {
  data: any[];
  options: AlgorithmOptions;
  runner: AlgorithmRunner;
  visualizer: AlgorithmVisualizer;
  analytics: AnalyticsCollector;
}

export interface AlgorithmVisualizer {
  renderStep(step: AlgorithmStep, context: RenderContext): void;
  reset(): void;
  highlight(indices: number[], color: string): void;
  animate(animation: AnimationConfig): Promise<void>;
}

export interface RenderContext {
  canvas: HTMLCanvasElement;
  data: any[];
  stepIndex: number;
  totalSteps: number;
  theme: VisualizationTheme;
}

export interface VisualizationTheme {
  colors: {
    default: string;
    compare: string;
    swap: string;
    sorted: string;
    pivot: string;
    highlight: string;
  };
  fonts: {
    size: number;
    family: string;
  };
  animation: {
    duration: number;
    easing: string;
  };
}

export interface AnalyticsCollector {
  recordExecution(metadata: AlgorithmMetadata, metrics: ExecutionMetrics): void;
  recordUserInteraction(action: string, details: any): void;
  generateReport(): AnalyticsReport;
}

export interface AnalyticsReport {
  mostUsedAlgorithms: string[];
  averageExecutionTimes: Record<string, number>;
  userEngagementMetrics: {
    sessionDuration: number;
    stepsCompleted: number;
    algorithmsExplored: number;
  };
  performanceInsights: {
    slowestOperations: string[];
    memoryIntensiveAlgorithms: string[];
  };
}
```

### `urlState.ts` - URL State Management

Manages algorithm parameters and state in the URL for sharing and persistence.

```typescript
interface UrlState {
  algorithm: string;
  data: string; // Base64 encoded array
  speed: number;
  step: number;
  options: Record<string, any>;
  view: "canvas" | "code" | "split";
  theme: "light" | "dark" | "high-contrast";
}

class UrlStateManager {
  private currentState: UrlState;
  private listeners: ((state: UrlState) => void)[] = [];

  constructor() {
    this.currentState = this.parseUrlState();
    this.setupListeners();
  }

  getState(): UrlState {
    return { ...this.currentState };
  }

  updateState(updates: Partial<UrlState>): void {
    this.currentState = { ...this.currentState, ...updates };
    this.updateUrl();
    this.notifyListeners();
  }

  subscribe(listener: (state: UrlState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  generateShareableUrl(state?: Partial<UrlState>): string {
    const targetState = state
      ? { ...this.currentState, ...state }
      : this.currentState;
    return `${window.location.origin}${window.location.pathname}?${this.encodeState(targetState)}`;
  }

  resetToDefaults(): void {
    this.currentState = this.getDefaultState();
    this.updateUrl();
    this.notifyListeners();
  }

  private parseUrlState(): UrlState {
    const params = new URLSearchParams(window.location.search);

    return {
      algorithm: params.get("alg") || "bubble-sort",
      data: params.get("data") || this.encodeData([64, 34, 25, 12, 22, 11, 90]),
      speed: parseInt(params.get("speed") || "1"),
      step: parseInt(params.get("step") || "0"),
      options: this.parseOptions(params.get("opts") || "{}"),
      view: (params.get("view") as any) || "canvas",
      theme: (params.get("theme") as any) || "light",
    };
  }

  private encodeState(state: UrlState): string {
    const params = new URLSearchParams();
    params.set("alg", state.algorithm);
    params.set("data", state.data);
    params.set("speed", state.speed.toString());
    params.set("step", state.step.toString());
    params.set("opts", JSON.stringify(state.options));
    params.set("view", state.view);
    params.set("theme", state.theme);
    return params.toString();
  }

  private encodeData(data: any[]): string {
    return btoa(JSON.stringify(data));
  }

  private decodeData(encoded: string): any[] {
    try {
      return JSON.parse(atob(encoded));
    } catch {
      return [64, 34, 25, 12, 22, 11, 90]; // Default data
    }
  }

  private parseOptions(optionsString: string): Record<string, any> {
    try {
      return JSON.parse(optionsString);
    } catch {
      return {};
    }
  }

  private updateUrl(): void {
    const newUrl = `${window.location.pathname}?${this.encodeState(this.currentState)}`;
    window.history.replaceState(null, "", newUrl);
  }

  private setupListeners(): void {
    window.addEventListener("popstate", () => {
      this.currentState = this.parseUrlState();
      this.notifyListeners();
    });
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.currentState));
  }

  private getDefaultState(): UrlState {
    return {
      algorithm: "bubble-sort",
      data: this.encodeData([64, 34, 25, 12, 22, 11, 90]),
      speed: 1,
      step: 0,
      options: {},
      view: "canvas",
      theme: "light",
    };
  }
}

export const urlStateManager = new UrlStateManager();

// React hook for URL state
export function useUrlState() {
  const [state, setState] = useState(urlStateManager.getState());

  useEffect(() => {
    return urlStateManager.subscribe(setState);
  }, []);

  const updateState = useCallback((updates: Partial<UrlState>) => {
    urlStateManager.updateState(updates);
  }, []);

  return [state, updateState] as const;
}
```

**Key Features:**

- URL-based state persistence
- Shareable algorithm configurations
- Browser history integration
- React hooks for easy integration
- Base64 encoding for data arrays

## 🚀 Usage Examples

### Basic Algorithm Execution

```typescript
import { algorithmRegistry, AlgorithmRunner } from "../engine";

// Discover available algorithms
const sortingAlgorithms = algorithmRegistry.getByCategory("Sorting");
console.log(sortingAlgorithms.map((alg) => alg.name));

// Execute an algorithm
const bubbleSort = algorithmRegistry.get("bubble-sort");
if (bubbleSort) {
  const algorithm = new bubbleSort.algorithm();
  const runner = new AlgorithmRunner(algorithm, {
    speed: 2,
    onStep: (step, index) => {
      console.log(`Step ${index}: ${step.description}`);
    },
    onComplete: (metrics) => {
      console.log(`Completed in ${metrics.executionTime}ms`);
    },
  });

  await runner.execute([64, 34, 25, 12, 22, 11, 90]);
}
```

### Interactive Step-Through

```typescript
const runner = new AlgorithmRunner(algorithm, {
  pauseOnStep: true,
  onStep: (step, index) => {
    renderVisualization(step);
    updateStepCounter(index);
  },
});

// Manual controls
document.getElementById("step-forward").onclick = () => runner.stepForward();
document.getElementById("step-backward").onclick = () => runner.stepBackward();
document.getElementById("play").onclick = () => runner.resume();
document.getElementById("pause").onclick = () => runner.pause();
```

### Breakpoint Debugging

```typescript
const runner = new AlgorithmRunner(algorithm);

// Add breakpoints at interesting steps
runner.addBreakpoint(10); // Pause at step 10
runner.addBreakpoint(25); // Pause at step 25

await runner.execute(data);
```

### URL State Integration

```typescript
import { useUrlState } from '../engine/urlState';

function AlgorithmComponent() {
  const [urlState, updateUrlState] = useUrlState();

  const handleAlgorithmChange = (algorithmId: string) => {
    updateUrlState({ algorithm: algorithmId, step: 0 });
  };

  const handleSpeedChange = (speed: number) => {
    updateUrlState({ speed });
  };

  return (
    <div>
      <select
        value={urlState.algorithm}
        onChange={e => handleAlgorithmChange(e.target.value)}
      >
        {/* Algorithm options */}
      </select>
      <input
        type="range"
        min="0.1"
        max="5"
        step="0.1"
        value={urlState.speed}
        onChange={e => handleSpeedChange(parseFloat(e.target.value))}
      />
    </div>
  );
}
```

## 📊 Performance Monitoring

### Real-time Metrics

```typescript
class PerformanceMonitor {
  private metrics: Map<string, PerformanceEntry[]> = new Map();

  startMeasurement(name: string): void {
    performance.mark(`${name}-start`);
  }

  endMeasurement(name: string): void {
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);

    const entries = performance.getEntriesByName(name);
    this.metrics.set(name, entries);
  }

  getAverageTime(name: string): number {
    const entries = this.metrics.get(name) || [];
    const total = entries.reduce((sum, entry) => sum + entry.duration, 0);
    return entries.length > 0 ? total / entries.length : 0;
  }

  generateReport(): PerformanceReport {
    return {
      measurements: Array.from(this.metrics.entries()).map(
        ([name, entries]) => ({
          name,
          count: entries.length,
          average: this.getAverageTime(name),
          min: Math.min(...entries.map((e) => e.duration)),
          max: Math.max(...entries.map((e) => e.duration)),
        })
      ),
    };
  }
}
```

### Memory Usage Tracking

```typescript
class MemoryTracker {
  private samples: number[] = [];

  takeSample(): void {
    if ("memory" in performance) {
      this.samples.push((performance as any).memory.usedJSHeapSize);
    }
  }

  getPeakUsage(): number {
    return Math.max(...this.samples);
  }

  getAverageUsage(): number {
    return this.samples.reduce((a, b) => a + b, 0) / this.samples.length;
  }
}
```

## 🧪 Testing Strategies

### Engine Integration Tests

```typescript
describe("Algorithm Engine Integration", () => {
  test("registry and runner integration", async () => {
    const entry = algorithmRegistry.get("bubble-sort");
    expect(entry).toBeDefined();

    const algorithm = new entry!.algorithm();
    const runner = new AlgorithmRunner(algorithm);

    const metrics = await runner.execute([3, 1, 4]);
    expect(metrics.totalSteps).toBeGreaterThan(0);
    expect(metrics.executionTime).toBeGreaterThan(0);
  });

  test("URL state persistence", () => {
    const initialState = urlStateManager.getState();

    urlStateManager.updateState({
      algorithm: "merge-sort",
      speed: 3,
    });

    const newState = urlStateManager.getState();
    expect(newState.algorithm).toBe("merge-sort");
    expect(newState.speed).toBe(3);
  });
});
```

### Performance Tests

```typescript
describe("Engine Performance", () => {
  test("large dataset handling", async () => {
    const largeArray = Array.from({ length: 1000 }, () => Math.random());
    const algorithm = new (algorithmRegistry.get("merge-sort")!.algorithm)();
    const runner = new AlgorithmRunner(algorithm);

    const startTime = performance.now();
    await runner.execute(largeArray);
    const duration = performance.now() - startTime;

    expect(duration).toBeLessThan(5000); // 5 second limit
  });
});
```

## 🔧 Configuration

### Engine Configuration

```typescript
interface EngineConfig {
  maxStepsPerAlgorithm: number;
  defaultExecutionSpeed: number;
  enableMetrics: boolean;
  enableUrlPersistence: boolean;
  enableAnalytics: boolean;
  visualizationDefaults: {
    theme: string;
    animationDuration: number;
    soundEnabled: boolean;
  };
}

const defaultConfig: EngineConfig = {
  maxStepsPerAlgorithm: 10000,
  defaultExecutionSpeed: 1,
  enableMetrics: true,
  enableUrlPersistence: true,
  enableAnalytics: false,
  visualizationDefaults: {
    theme: "light",
    animationDuration: 300,
    soundEnabled: true,
  },
};
```

## 🔗 Related Resources

- **Core Algorithms**: `../algorithms/` - Algorithm implementations
- **Core Engine**: `../core/` - Low-level algorithm execution
- **UI Components**: `../components/` - Algorithm control interfaces
- **Visualization**: `../core/render/` - Canvas and rendering system
- **State Management**: `../store/` - Global application state
- **Hooks**: `../hooks/` - React hooks for algorithm integration

## 🛠️ Best Practices

### Performance Optimization

1. **Lazy Load Algorithms**: Only instantiate when needed
2. **Step Buffering**: Batch step generation for large datasets
3. **Memory Management**: Clean up resources after execution
4. **Efficient State Updates**: Minimize unnecessary re-renders

### User Experience

1. **Responsive Controls**: Immediate feedback for user interactions
2. **Progress Indication**: Clear visualization of execution progress
3. **Error Recovery**: Graceful handling of algorithm failures
4. **Accessibility**: Support for keyboard navigation and screen readers

### Maintainability

1. **Clear Interfaces**: Well-defined contracts between components
2. **Extensible Design**: Easy addition of new algorithms and features
3. **Comprehensive Testing**: Unit, integration, and performance tests
4. **Documentation**: Clear examples and usage patterns

This engine directory provides the high-level orchestration needed to deliver a smooth, educational algorithm visualization experience while maintaining flexibility for future enhancements and algorithm additions.
