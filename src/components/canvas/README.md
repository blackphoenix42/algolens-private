# Algorithm Visualization Canvas

This directory contains components responsible for rendering algorithm visualizations on HTML5 Canvas, providing smooth animations and interactive displays.

## 📁 Contents

This directory typically contains:

- **AlgorithmCanvas** - Main canvas component for algorithm rendering
- **DataRenderer** - Component for rendering data structures (arrays, trees, graphs)
- **AnimationEngine** - Canvas animation and frame management
- **InteractionHandler** - Mouse/touch interaction handling for canvas
- **CanvasUtilities** - Canvas drawing utilities and helpers

## 🎯 Purpose

The canvas components provide:

- High-performance visualization rendering
- Smooth 60fps animations
- Interactive elements (hover, click, drag)
- Responsive canvas sizing
- Multiple visualization modes (bars, dots, networks)
- Export capabilities (PNG, SVG, video)

## 🖼️ Core Components

### AlgorithmCanvas

Main canvas component that orchestrates the entire visualization:

```typescript
interface AlgorithmCanvasProps {
  data: number[] | TreeNode[] | GraphNode[];
  algorithm: Algorithm;
  currentStep: number;
  isPlaying: boolean;
  highlightElements?: number[];
  colorScheme: ColorScheme;
  viewMode: 'bars' | 'dots' | 'circles' | 'network';
  width?: number;
  height?: number;
  interactive?: boolean;
  onElementClick?: (index: number) => void;
  onElementHover?: (index: number | null) => void;
}

export const AlgorithmCanvas: React.FC<AlgorithmCanvasProps> = ({
  data,
  algorithm,
  currentStep,
  isPlaying,
  highlightElements = [],
  colorScheme,
  viewMode,
  width = 800,
  height = 400,
  interactive = true,
  onElementClick,
  onElementHover,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  const { renderFrame, handleInteraction } = useCanvasRenderer({
    algorithm,
    colorScheme,
    viewMode,
  });

  // Animation loop
  useEffect(() => {
    if (!canvasRef.current) return;

    const animate = () => {
      renderFrame(canvasRef.current!, {
        data,
        currentStep,
        highlightElements,
        isPlaying,
      });

      if (isPlaying) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [data, currentStep, isPlaying, highlightElements]);

  // Interactive event handlers
  const handleCanvasClick = useCallback((event: React.MouseEvent) => {
    if (!interactive || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const elementIndex = handleInteraction.getElementAtPosition(x, y);
    if (elementIndex !== -1) {
      onElementClick?.(elementIndex);
    }
  }, [interactive, onElementClick, handleInteraction]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="algorithm-canvas"
      onClick={handleCanvasClick}
      data-testid="algorithm-canvas"
      style={{ cursor: interactive ? 'pointer' : 'default' }}
    />
  );
};
```

### DataRenderer

Specialized rendering for different data structures:

```typescript
interface DataRendererProps {
  type: "array" | "tree" | "graph" | "matrix";
  data: any[];
  canvas: HTMLCanvasElement;
  viewport: Viewport;
  style: RenderStyle;
  animations?: Animation[];
}

export class DataRenderer {
  constructor(private ctx: CanvasRenderingContext2D) {}

  renderArray(data: number[], style: ArrayStyle): void {
    data.forEach((value, index) => {
      this.drawArrayElement(value, index, style);
    });
  }

  renderTree(root: TreeNode, style: TreeStyle): void {
    this.drawTreeNode(root, style);
    root.children?.forEach((child) => {
      this.drawTreeEdge(root, child, style);
      this.renderTree(child, style);
    });
  }

  renderGraph(nodes: GraphNode[], edges: Edge[], style: GraphStyle): void {
    // Draw edges first
    edges.forEach((edge) => this.drawEdge(edge, style));

    // Draw nodes on top
    nodes.forEach((node) => this.drawNode(node, style));
  }

  private drawArrayElement(
    value: number,
    index: number,
    style: ArrayStyle
  ): void {
    const { x, y, width, height } = this.calculateElementBounds(index, style);

    // Draw element background
    this.ctx.fillStyle = style.getColor(value, index);
    this.ctx.fillRect(x, y, width, height);

    // Draw element border
    this.ctx.strokeStyle = style.borderColor;
    this.ctx.lineWidth = style.borderWidth;
    this.ctx.strokeRect(x, y, width, height);

    // Draw value text
    this.ctx.fillStyle = style.textColor;
    this.ctx.font = style.font;
    this.ctx.textAlign = "center";
    this.ctx.fillText(value.toString(), x + width / 2, y + height / 2);
  }
}
```

## 🎨 Rendering Features

### Multiple View Modes

#### Bar Chart Visualization

```typescript
const renderBars = (data: number[], style: BarStyle) => {
  const maxValue = Math.max(...data);
  const barWidth = canvas.width / data.length;

  data.forEach((value, index) => {
    const barHeight = (value / maxValue) * canvas.height * 0.8;
    const x = index * barWidth;
    const y = canvas.height - barHeight;

    // Gradient fill for visual appeal
    const gradient = ctx.createLinearGradient(x, y, x, y + barHeight);
    gradient.addColorStop(0, style.colors.start);
    gradient.addColorStop(1, style.colors.end);

    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, barWidth - 2, barHeight);
  });
};
```

#### Dot Plot Visualization

```typescript
const renderDots = (data: number[], style: DotStyle) => {
  const maxValue = Math.max(...data);
  const dotSpacing = canvas.width / data.length;

  data.forEach((value, index) => {
    const x = index * dotSpacing + dotSpacing / 2;
    const y = canvas.height - (value / maxValue) * canvas.height * 0.8;
    const radius = style.dotSize;

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = style.getColor(value, index);
    ctx.fill();

    // Add glow effect for highlighted elements
    if (style.highlighted) {
      ctx.shadowBlur = 10;
      ctx.shadowColor = style.highlightColor;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  });
};
```

### Animation System

#### Smooth Transitions

```typescript
interface Animation {
  id: string;
  type: "move" | "color" | "scale" | "fade";
  startTime: number;
  duration: number;
  fromValue: any;
  toValue: any;
  easing: EasingFunction;
  element: number;
}

class AnimationEngine {
  private animations: Map<string, Animation> = new Map();

  addAnimation(animation: Animation): void {
    this.animations.set(animation.id, animation);
  }

  updateAnimations(currentTime: number): void {
    this.animations.forEach((animation, id) => {
      const elapsed = currentTime - animation.startTime;
      const progress = Math.min(elapsed / animation.duration, 1);

      if (progress >= 1) {
        this.animations.delete(id);
        return;
      }

      const easedProgress = animation.easing(progress);
      const currentValue = this.interpolate(
        animation.fromValue,
        animation.toValue,
        easedProgress
      );

      this.applyAnimationValue(animation, currentValue);
    });
  }

  private interpolate(from: any, to: any, progress: number): any {
    if (typeof from === "number" && typeof to === "number") {
      return from + (to - from) * progress;
    }
    // Handle other value types (colors, positions, etc.)
  }
}
```

### Interactive Features

#### Element Selection and Highlighting

```typescript
class InteractionHandler {
  private hoveredElement: number | null = null;
  private selectedElements: Set<number> = new Set();

  handleMouseMove(x: number, y: number): void {
    const elementIndex = this.getElementAtPosition(x, y);

    if (elementIndex !== this.hoveredElement) {
      this.hoveredElement = elementIndex;
      this.onElementHover?.(elementIndex);
      this.requestRedraw();
    }
  }

  handleClick(x: number, y: number): void {
    const elementIndex = this.getElementAtPosition(x, y);

    if (elementIndex !== -1) {
      if (this.selectedElements.has(elementIndex)) {
        this.selectedElements.delete(elementIndex);
      } else {
        this.selectedElements.add(elementIndex);
      }

      this.onElementClick?.(elementIndex);
      this.requestRedraw();
    }
  }

  getElementAtPosition(x: number, y: number): number {
    // Implementation depends on current view mode
    switch (this.viewMode) {
      case "bars":
        return this.getBarElementAtPosition(x, y);
      case "dots":
        return this.getDotElementAtPosition(x, y);
      default:
        return -1;
    }
  }
}
```

## 🎨 Color Schemes and Themes

### Dynamic Color Generation

```typescript
interface ColorScheme {
  name: string;
  getColor: (value: number, index: number, context: ColorContext) => string;
  getHighlightColor: (value: number, index: number) => string;
  getComparisonColor: (value: number, index: number) => string;
}

const rainbowScheme: ColorScheme = {
  name: "Rainbow",
  getColor: (value, index, context) => {
    const hue = (index / context.totalElements) * 360;
    return `hsl(${hue}, 70%, 60%)`;
  },
  getHighlightColor: () => "#FFD700",
  getComparisonColor: () => "#FF6B6B",
};

const valueBasedScheme: ColorScheme = {
  name: "Value-based",
  getColor: (value, index, context) => {
    const intensity = value / context.maxValue;
    const lightness = 30 + intensity * 40;
    return `hsl(220, 80%, ${lightness}%)`;
  },
  getHighlightColor: () => "#FF4444",
  getComparisonColor: () => "#44FF44",
};
```

## 📱 Responsive Canvas

### Adaptive Sizing

```typescript
const useResponsiveCanvas = (containerRef: RefObject<HTMLElement>) => {
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width } = containerRef.current.getBoundingClientRect();
        const aspectRatio = 2; // 2:1 aspect ratio
        setDimensions({
          width: Math.min(width, 1200),
          height: Math.min(width / aspectRatio, 600),
        });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);

    return () => window.removeEventListener("resize", updateDimensions);
  }, [containerRef]);

  return dimensions;
};
```

### High-DPI Support

```typescript
const setupHighDPICanvas = (
  canvas: HTMLCanvasElement
): CanvasRenderingContext2D => {
  const ctx = canvas.getContext("2d")!;
  const devicePixelRatio = window.devicePixelRatio || 1;

  // Set display size
  const displayWidth = canvas.clientWidth;
  const displayHeight = canvas.clientHeight;

  // Set actual size in memory
  canvas.width = displayWidth * devicePixelRatio;
  canvas.height = displayHeight * devicePixelRatio;

  // Scale the context to match device pixel ratio
  ctx.scale(devicePixelRatio, devicePixelRatio);

  return ctx;
};
```

## 🎬 Export Capabilities

### Image Export

```typescript
const exportCanvasAsImage = (
  canvas: HTMLCanvasElement,
  format: "png" | "jpg" | "webp" = "png"
): string => {
  return canvas.toDataURL(`image/${format}`, 0.95);
};

const downloadImage = (canvas: HTMLCanvasElement, filename: string): void => {
  const dataURL = exportCanvasAsImage(canvas);
  const link = document.createElement("a");
  link.download = filename;
  link.href = dataURL;
  link.click();
};
```

### Video Export

```typescript
const recordCanvasAnimation = (
  canvas: HTMLCanvasElement,
  duration: number
): Promise<Blob> => {
  return new Promise((resolve) => {
    const stream = canvas.captureStream(60); // 60fps
    const recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
    const chunks: Blob[] = [];

    recorder.ondataavailable = (event) => {
      chunks.push(event.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: "video/webm" });
      resolve(blob);
    };

    recorder.start();
    setTimeout(() => recorder.stop(), duration);
  });
};
```

## ⚡ Performance Optimization

### Efficient Rendering

- Use requestAnimationFrame for smooth animations
- Implement dirty region tracking for partial redraws
- Batch similar drawing operations
- Cache rendered elements when possible
- Use OffscreenCanvas for heavy computations

### Memory Management

- Clean up event listeners and animation frames
- Dispose of large canvas contexts when not needed
- Implement object pooling for frequently created objects
- Monitor memory usage in development

## 🧪 Testing Canvas Components

### Canvas Testing Utilities

```typescript
const getCanvasImageData = (canvas: HTMLCanvasElement): ImageData => {
  const ctx = canvas.getContext("2d")!;
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
};

const compareCanvasImages = (
  canvas1: HTMLCanvasElement,
  canvas2: HTMLCanvasElement
): number => {
  const data1 = getCanvasImageData(canvas1);
  const data2 = getCanvasImageData(canvas2);

  let differences = 0;
  for (let i = 0; i < data1.data.length; i += 4) {
    if (
      data1.data[i] !== data2.data[i] ||
      data1.data[i + 1] !== data2.data[i + 1] ||
      data1.data[i + 2] !== data2.data[i + 2]
    ) {
      differences++;
    }
  }

  return differences / (data1.data.length / 4);
};
```

## 🔗 Related Resources

- **Core Engine**: `../../core/render/` - Core rendering engine
- **Algorithm Data**: `../../algorithms/` - Algorithm implementations
- **UI Components**: `../ui/` - Supporting UI components
- **Hooks**: `../../hooks/` - Canvas-related custom hooks
- **Utils**: `../../lib/canvas/` - Canvas utility functions
