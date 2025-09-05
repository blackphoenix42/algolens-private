# UI Components

This directory contains all the reusable UI components for the AlgoLens application, organized by feature and functionality.

## 📁 Directory Structure

### Component Categories

- **[ui/](ui/)** - Basic, reusable UI components (buttons, inputs, modals)
- **[canvas/](canvas/)** - Algorithm visualization canvas and rendering components
- **[controls/](controls/)** - Playback controls, settings panels, and interactive elements
- **[panels/](panels/)** - Information panels, code viewers, and sidebar components
- **[home/](home/)** - Homepage-specific components and sections

## 🎯 Component Architecture

### Component Hierarchy

```
components/
├── ui/               # Base components
│   ├── Button/
│   ├── Input/
│   ├── Modal/
│   └── ...
├── canvas/           # Visualization components
│   ├── AlgorithmCanvas/
│   ├── DataRenderer/
│   └── ...
├── controls/         # Interactive controls
│   ├── PlaybackControls/
│   ├── SpeedSlider/
│   └── ...
├── panels/           # Information panels
│   ├── CodePanel/
│   ├── InfoPanel/
│   └── ...
└── home/             # Page-specific components
    ├── HeroSection/
    ├── FeatureGrid/
    └── ...
```

### Component Design Patterns

#### Atomic Design Methodology

- **Atoms**: Basic UI elements (Button, Input, Icon)
- **Molecules**: Simple component combinations (SearchBox, FormField)
- **Organisms**: Complex UI sections (Header, AlgorithmViewer)
- **Templates**: Page layouts and structures
- **Pages**: Complete page implementations

#### Component Structure

```typescript
// Standard component file structure
ComponentName/
├── index.ts          # Barrel export
├── ComponentName.tsx # Main component
├── ComponentName.types.ts # TypeScript interfaces
├── ComponentName.styles.css # Component styles
├── ComponentName.stories.tsx # Storybook stories
├── ComponentName.test.tsx # Unit tests
└── hooks/            # Component-specific hooks
    └── useComponentName.ts
```

## 🧩 UI Components (ui/)

### Base Components

#### Button Component

```typescript
// ui/Button/Button.tsx
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'outline' | 'ghost';
  size: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  children,
  onClick,
  ...rest
}) => {
  return (
    <button
      className={cn('btn', `btn-${variant}`, `btn-${size}`, {
        'btn-loading': loading,
        'btn-disabled': disabled
      })}
      disabled={disabled || loading}
      onClick={onClick}
      {...rest}
    >
      {loading ? <Spinner /> : icon}
      {children}
    </button>
  );
};
```

#### Input Component

```typescript
// ui/Input/Input.tsx
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helpText,
  startIcon,
  endIcon,
  className,
  ...rest
}) => {
  return (
    <div className="input-group">
      {label && <label className="input-label">{label}</label>}
      <div className="input-wrapper">
        {startIcon && <span className="input-icon start">{startIcon}</span>}
        <input
          className={cn('input', className, {
            'input-error': error,
            'input-with-start-icon': startIcon,
            'input-with-end-icon': endIcon
          })}
          {...rest}
        />
        {endIcon && <span className="input-icon end">{endIcon}</span>}
      </div>
      {error && <span className="input-error-text">{error}</span>}
      {helpText && <span className="input-help-text">{helpText}</span>}
    </div>
  );
};
```

## 🖼️ Canvas Components (canvas/)

### Algorithm Visualization

#### AlgorithmCanvas Component

```typescript
// canvas/AlgorithmCanvas/AlgorithmCanvas.tsx
interface AlgorithmCanvasProps {
  data: number[];
  currentStep: number;
  highlightIndices?: number[];
  colorScheme: 'rainbow' | 'value' | 'custom';
  viewMode: 'bars' | 'dots' | 'table';
  width?: number;
  height?: number;
}

export const AlgorithmCanvas: React.FC<AlgorithmCanvasProps> = ({
  data,
  currentStep,
  highlightIndices = [],
  colorScheme,
  viewMode,
  width = 800,
  height = 400
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { renderVisualization } = useCanvasRenderer();

  useEffect(() => {
    if (canvasRef.current) {
      renderVisualization(canvasRef.current, {
        data,
        currentStep,
        highlightIndices,
        colorScheme,
        viewMode,
        width,
        height
      });
    }
  }, [data, currentStep, highlightIndices, colorScheme, viewMode, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="algorithm-canvas"
      data-testid="algorithm-canvas"
    />
  );
};
```

#### DataRenderer Component

```typescript
// canvas/DataRenderer/DataRenderer.tsx
interface DataRendererProps {
  data: number[];
  renderMode: 'static' | 'animated';
  highlightColor?: string;
  backgroundColor?: string;
}

export const DataRenderer: React.FC<DataRendererProps> = ({
  data,
  renderMode,
  highlightColor = '#ff6b6b',
  backgroundColor = '#f8f9fa'
}) => {
  const { renderData } = useDataVisualization();

  return (
    <div className="data-renderer">
      {renderData(data, {
        mode: renderMode,
        highlightColor,
        backgroundColor
      })}
    </div>
  );
};
```

## 🎛️ Control Components (controls/)

### Playback Controls

#### PlaybackControls Component

```typescript
// controls/PlaybackControls/PlaybackControls.tsx
interface PlaybackControlsProps {
  isPlaying: boolean;
  currentStep: number;
  totalSteps: number;
  canPlay: boolean;
  onPlay: () => void;
  onPause: () => void;
  onStep: () => void;
  onReset: () => void;
  onJumpToStep: (step: number) => void;
}

export const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  isPlaying,
  currentStep,
  totalSteps,
  canPlay,
  onPlay,
  onPause,
  onStep,
  onReset,
  onJumpToStep
}) => {
  return (
    <div className="playback-controls">
      <Button
        variant="primary"
        onClick={isPlaying ? onPause : onPlay}
        disabled={!canPlay}
        icon={isPlaying ? <PauseIcon /> : <PlayIcon />}
        data-testid={isPlaying ? "pause-button" : "play-button"}
      >
        {isPlaying ? 'Pause' : 'Play'}
      </Button>

      <Button
        variant="secondary"
        onClick={onStep}
        disabled={currentStep >= totalSteps - 1}
        icon={<StepIcon />}
        data-testid="step-button"
      >
        Step
      </Button>

      <Button
        variant="outline"
        onClick={onReset}
        icon={<ResetIcon />}
        data-testid="reset-button"
      >
        Reset
      </Button>

      <ProgressSlider
        value={currentStep}
        max={totalSteps - 1}
        onChange={onJumpToStep}
        className="step-slider"
      />

      <span className="step-counter" data-testid="step-counter">
        Step {currentStep + 1} of {totalSteps}
      </span>
    </div>
  );
};
```

#### SpeedSlider Component

```typescript
// controls/SpeedSlider/SpeedSlider.tsx
interface SpeedSliderProps {
  speed: number;
  onSpeedChange: (speed: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export const SpeedSlider: React.FC<SpeedSliderProps> = ({
  speed,
  onSpeedChange,
  min = 0.1,
  max = 10,
  step = 0.1
}) => {
  return (
    <div className="speed-slider">
      <label className="speed-label">
        Speed: {speed.toFixed(1)}x
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={speed}
        onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
        className="speed-input"
        data-testid="speed-slider"
      />
      <div className="speed-marks">
        <span>Slow</span>
        <span>Fast</span>
      </div>
    </div>
  );
};
```

## 📋 Panel Components (panels/)

### Information Panels

#### CodePanel Component

```typescript
// panels/CodePanel/CodePanel.tsx
interface CodePanelProps {
  language: 'pseudocode' | 'typescript' | 'python' | 'java' | 'cpp';
  code: string;
  currentLine?: number;
  title?: string;
  showLineNumbers?: boolean;
}

export const CodePanel: React.FC<CodePanelProps> = ({
  language,
  code,
  currentLine,
  title,
  showLineNumbers = true
}) => {
  const { highlightedCode } = useSyntaxHighlighting(code, language);

  return (
    <div className="code-panel" data-testid={`${language}-panel`}>
      {title && <h3 className="code-panel-title">{title}</h3>}
      <div className="code-container">
        <pre className="code-content">
          {highlightedCode.map((line, index) => (
            <div
              key={index}
              className={cn('code-line', {
                'code-line-current': index === currentLine,
                'code-line-highlighted': index === currentLine
              })}
              data-testid={index === currentLine ? "current-line" : undefined}
            >
              {showLineNumbers && (
                <span className="line-number">{index + 1}</span>
              )}
              <span className="line-content">{line}</span>
            </div>
          ))}
        </pre>
      </div>
    </div>
  );
};
```

#### InfoPanel Component

```typescript
// panels/InfoPanel/InfoPanel.tsx
interface InfoPanelProps {
  algorithm: Algorithm;
  isOpen: boolean;
  onToggle: () => void;
}

export const InfoPanel: React.FC<InfoPanelProps> = ({
  algorithm,
  isOpen,
  onToggle
}) => {
  return (
    <div className={cn('info-panel', { 'info-panel-open': isOpen })}>
      <button
        className="info-panel-toggle"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <InfoIcon />
        {algorithm.name} Info
      </button>

      {isOpen && (
        <div className="info-panel-content">
          <section>
            <h4>Description</h4>
            <p>{algorithm.description}</p>
          </section>

          <section>
            <h4>Complexity</h4>
            <div className="complexity-grid">
              <div>
                <strong>Time:</strong> {algorithm.timeComplexity}
              </div>
              <div>
                <strong>Space:</strong> {algorithm.spaceComplexity}
              </div>
            </div>
          </section>

          <section>
            <h4>Properties</h4>
            <ul className="properties-list">
              <li>Stable: {algorithm.stable ? 'Yes' : 'No'}</li>
              <li>In-place: {algorithm.inPlace ? 'Yes' : 'No'}</li>
              <li>Adaptive: {algorithm.adaptive ? 'Yes' : 'No'}</li>
            </ul>
          </section>
        </div>
      )}
    </div>
  );
};
```

## 🏠 Home Components (home/)

### Homepage Sections

#### HeroSection Component

```typescript
// home/HeroSection/HeroSection.tsx
export const HeroSection: React.FC = () => {
  const { t } = useI18n();

  return (
    <section className="hero-section" data-testid="hero-section">
      <div className="hero-content">
        <h1 className="hero-title">
          {t('hero.title', { name: 'AlgoLens' })}
        </h1>
        <p className="hero-description">
          {t('hero.description')}
        </p>
        <div className="hero-actions">
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate('/algorithms')}
          >
            {t('hero.getStarted')}
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate('/about')}
          >
            {t('hero.learnMore')}
          </Button>
        </div>
      </div>
      <div className="hero-visual">
        <AlgorithmPreview algorithm="bubble-sort" autoplay />
      </div>
    </section>
  );
};
```

## 🧪 Component Testing

### Testing Patterns

```typescript
// Button.test.tsx
import { render, screen, userEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('shows loading state', () => {
    render(<Button loading>Loading</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### Storybook Stories

```typescript
// Button.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button";

const meta: Meta<typeof Button> = {
  title: "UI/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: "primary",
    children: "Button",
  },
};

export const Loading: Story = {
  args: {
    loading: true,
    children: "Loading...",
  },
};
```

## 🎨 Styling Conventions

### CSS Classes

- Use BEM methodology for class naming
- Prefix with component name
- Use data attributes for testing

### Tailwind Integration

```typescript
// Use cn utility for conditional classes
const buttonClasses = cn("px-4 py-2 rounded-md font-medium transition-colors", {
  "bg-blue-600 text-white hover:bg-blue-700": variant === "primary",
  "bg-gray-200 text-gray-900 hover:bg-gray-300": variant === "secondary",
  "opacity-50 cursor-not-allowed": disabled,
});
```

## 🔧 Component Best Practices

### Props and Types

- Use TypeScript interfaces for props
- Extend HTML element props when appropriate
- Use discriminated unions for variants
- Provide sensible defaults

### Performance

- Use React.memo for expensive components
- Optimize re-renders with useMemo/useCallback
- Lazy load heavy components
- Implement virtualization for large lists

### Accessibility

- Include ARIA labels and roles
- Support keyboard navigation
- Provide focus indicators
- Test with screen readers

## 🔗 Related Resources

- **Hooks**: `../hooks/` - Custom hooks used by components
- **Styles**: `../styles/` - Global styles and CSS utilities
- **Theme**: `../theme/` - Design system and theme tokens
- **Types**: `../types/` - Component-related TypeScript types
- **Stories**: `../stories/` - Storybook documentation
