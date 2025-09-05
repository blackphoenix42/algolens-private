# Control Components

This directory contains React components that provide user interface controls for algorithm execution, playback management, and parameter adjustment. These components offer intuitive ways for users to interact with and control algorithm visualizations.

## 📁 Directory Structure

```
src/components/controls/
├── PlaybackControls.tsx    # Play, pause, step controls
├── SpeedControl.tsx        # Execution speed adjustment
├── ProgressBar.tsx         # Execution progress display
├── BreakpointManager.tsx   # Step breakpoint management
├── AlgorithmSelector.tsx   # Algorithm selection dropdown
├── DataControls.tsx        # Input data manipulation
├── ViewControls.tsx        # Visualization view options
├── SettingsPanel.tsx       # Global settings management
└── index.ts                # Component exports
```

## 🎯 Purpose

This directory provides essential control components for the AlgoLens platform:

- **Playback Management**: Play, pause, step-through controls
- **Speed Control**: Variable execution speed adjustment
- **Progress Tracking**: Visual progress indicators and navigation
- **Algorithm Selection**: Discovery and switching between algorithms
- **Data Manipulation**: Input generation and editing capabilities
- **View Customization**: Layout and visualization options
- **Settings Management**: Global preferences and configurations

## 📋 Core Components

### `PlaybackControls.tsx` - Main Playback Interface

Primary controls for algorithm execution management.

```typescript
interface PlaybackControlsProps {
  isPlaying: boolean;
  isPaused: boolean;
  canStepForward: boolean;
  canStepBackward: boolean;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onStepForward: () => void;
  onStepBackward: () => void;
  onReset: () => void;
  disabled?: boolean;
}

export function PlaybackControls({
  isPlaying,
  isPaused,
  canStepForward,
  canStepBackward,
  onPlay,
  onPause,
  onStop,
  onStepForward,
  onStepBackward,
  onReset,
  disabled = false
}: PlaybackControlsProps) {
  const [showTooltips, setShowTooltips] = useState(false);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    ' ': () => isPlaying ? onPause() : onPlay(),  // Spacebar
    'ArrowRight': onStepForward,                   // Right arrow
    'ArrowLeft': onStepBackward,                   // Left arrow
    'r': onReset,                                  // R key
    's': onStop                                    // S key
  });

  const buttonClass = `
    px-4 py-2 rounded-md border transition-all duration-200
    disabled:opacity-50 disabled:cursor-not-allowed
    hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500
  `;

  return (
    <div className="flex items-center space-x-2 p-4 bg-white rounded-lg shadow-sm border">
      {/* Reset Button */}
      <button
        onClick={onReset}
        disabled={disabled}
        className={`${buttonClass} bg-gray-100 hover:bg-gray-200 text-gray-700`}
        title="Reset (R)"
        aria-label="Reset algorithm"
      >
        <RotateCcw className="w-4 h-4" />
      </button>

      {/* Step Backward */}
      <button
        onClick={onStepBackward}
        disabled={disabled || !canStepBackward}
        className={`${buttonClass} bg-blue-100 hover:bg-blue-200 text-blue-700`}
        title="Step Backward (←)"
        aria-label="Step backward"
      >
        <SkipBack className="w-4 h-4" />
      </button>

      {/* Play/Pause Toggle */}
      <button
        onClick={isPlaying ? onPause : onPlay}
        disabled={disabled}
        className={`${buttonClass} bg-green-500 hover:bg-green-600 text-white px-6`}
        title={isPlaying ? "Pause (Space)" : "Play (Space)"}
        aria-label={isPlaying ? "Pause algorithm" : "Play algorithm"}
      >
        {isPlaying ? (
          <Pause className="w-5 h-5" />
        ) : (
          <Play className="w-5 h-5" />
        )}
      </button>

      {/* Step Forward */}
      <button
        onClick={onStepForward}
        disabled={disabled || !canStepForward}
        className={`${buttonClass} bg-blue-100 hover:bg-blue-200 text-blue-700`}
        title="Step Forward (→)"
        aria-label="Step forward"
      >
        <SkipForward className="w-4 h-4" />
      </button>

      {/* Stop Button */}
      <button
        onClick={onStop}
        disabled={disabled || (!isPlaying && !isPaused)}
        className={`${buttonClass} bg-red-100 hover:bg-red-200 text-red-700`}
        title="Stop (S)"
        aria-label="Stop algorithm"
      >
        <Square className="w-4 h-4" />
      </button>

      {/* Keyboard Shortcuts Help */}
      <button
        onClick={() => setShowTooltips(!showTooltips)}
        className={`${buttonClass} bg-gray-100 hover:bg-gray-200 text-gray-600`}
        title="Keyboard shortcuts"
      >
        <Keyboard className="w-4 h-4" />
      </button>

      {showTooltips && (
        <div className="absolute top-full mt-2 p-3 bg-black text-white text-sm rounded-md shadow-lg z-10">
          <div className="space-y-1">
            <div>Space: Play/Pause</div>
            <div>← →: Step backward/forward</div>
            <div>R: Reset</div>
            <div>S: Stop</div>
          </div>
        </div>
      )}
    </div>
  );
}
```

**Key Features:**

- Intuitive play/pause/stop controls
- Step-by-step navigation
- Keyboard shortcut support
- Accessibility compliance
- Visual feedback states

### `SpeedControl.tsx` - Execution Speed Management

Allows users to adjust algorithm execution speed dynamically.

```typescript
interface SpeedControlProps {
  speed: number;
  minSpeed: number;
  maxSpeed: number;
  onSpeedChange: (speed: number) => void;
  disabled?: boolean;
  showLabels?: boolean;
}

export function SpeedControl({
  speed,
  minSpeed = 0.1,
  maxSpeed = 5.0,
  onSpeedChange,
  disabled = false,
  showLabels = true
}: SpeedControlProps) {
  const [localSpeed, setLocalSpeed] = useState(speed);
  const [isEditing, setIsEditing] = useState(false);

  const speedPresets = [
    { value: 0.25, label: 'Very Slow' },
    { value: 0.5, label: 'Slow' },
    { value: 1.0, label: 'Normal' },
    { value: 2.0, label: 'Fast' },
    { value: 4.0, label: 'Very Fast' }
  ];

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSpeed = parseFloat(e.target.value);
    setLocalSpeed(newSpeed);
    onSpeedChange(newSpeed);
  };

  const handlePresetClick = (presetSpeed: number) => {
    setLocalSpeed(presetSpeed);
    onSpeedChange(presetSpeed);
  };

  const formatSpeed = (speed: number): string => {
    if (speed < 1) return `${(speed * 100).toFixed(0)}%`;
    return `${speed.toFixed(1)}x`;
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm border">
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm font-medium text-gray-700">
          Execution Speed
        </label>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">
            {formatSpeed(localSpeed)}
          </span>
          {isEditing ? (
            <input
              type="number"
              value={localSpeed.toFixed(2)}
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                if (value >= minSpeed && value <= maxSpeed) {
                  setLocalSpeed(value);
                  onSpeedChange(value);
                }
              }}
              onBlur={() => setIsEditing(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') setIsEditing(false);
              }}
              className="w-16 px-2 py-1 text-xs border rounded"
              step="0.1"
              min={minSpeed}
              max={maxSpeed}
            />
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              Edit
            </button>
          )}
        </div>
      </div>

      {/* Speed Slider */}
      <div className="mb-4">
        <input
          type="range"
          min={minSpeed}
          max={maxSpeed}
          step={0.1}
          value={localSpeed}
          onChange={handleSliderChange}
          disabled={disabled}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
        />

        {showLabels && (
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Slow</span>
            <span>Normal</span>
            <span>Fast</span>
          </div>
        )}
      </div>

      {/* Speed Presets */}
      <div className="grid grid-cols-5 gap-1">
        {speedPresets.map((preset) => (
          <button
            key={preset.value}
            onClick={() => handlePresetClick(preset.value)}
            disabled={disabled}
            className={`
              px-2 py-1 text-xs rounded border transition-colors
              ${localSpeed === preset.value
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
              }
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Speed Impact Info */}
      <div className="mt-3 text-xs text-gray-600">
        <p>
          {localSpeed < 0.5 && "Slower speeds help understand each step in detail."}
          {localSpeed >= 0.5 && localSpeed <= 2 && "Good speed for following the algorithm logic."}
          {localSpeed > 2 && "Faster speeds show overall algorithm behavior."}
        </p>
      </div>
    </div>
  );
}
```

**Key Features:**

- Continuous speed adjustment slider
- Preset speed buttons for quick selection
- Real-time speed display and editing
- Educational guidance for speed selection
- Responsive design for different screen sizes

### `ProgressBar.tsx` - Execution Progress Display

Visual progress indicator with navigation capabilities.

```typescript
interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  onStepClick?: (step: number) => void;
  breakpoints?: Set<number>;
  onBreakpointToggle?: (step: number) => void;
  showStepNumbers?: boolean;
  className?: string;
}

export function ProgressBar({
  currentStep,
  totalSteps,
  onStepClick,
  breakpoints = new Set(),
  onBreakpointToggle,
  showStepNumbers = true,
  className = ""
}: ProgressBarProps) {
  const progressPercentage = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0;
  const [isHovering, setIsHovering] = useState(false);
  const [hoverPosition, setHoverPosition] = useState(0);

  const handleBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onStepClick || totalSteps === 0) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickPercentage = clickX / rect.width;
    const targetStep = Math.floor(clickPercentage * totalSteps);

    onStepClick(Math.max(0, Math.min(targetStep, totalSteps - 1)));
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mousePercentage = mouseX / rect.width;
    const hoverStep = Math.floor(mousePercentage * totalSteps);
    setHoverPosition(Math.max(0, Math.min(hoverStep, totalSteps - 1)));
  };

  const formatTime = (steps: number): string => {
    // Estimate time based on average step duration
    const estimatedSeconds = steps * 0.5; // 500ms per step average
    if (estimatedSeconds < 60) return `${estimatedSeconds.toFixed(1)}s`;
    const minutes = Math.floor(estimatedSeconds / 60);
    const seconds = Math.floor(estimatedSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Progress Info */}
      <div className="flex justify-between items-center text-sm">
        <div className="flex items-center space-x-3">
          {showStepNumbers && (
            <span className="font-medium text-gray-700">
              Step {currentStep + 1} of {totalSteps}
            </span>
          )}
          <span className="text-gray-500">
            {formatTime(currentStep)} / {formatTime(totalSteps)}
          </span>
        </div>

        <div className="text-gray-500">
          {progressPercentage.toFixed(1)}%
        </div>
      </div>

      {/* Progress Bar */}
      <div
        className="relative h-6 bg-gray-200 rounded-full cursor-pointer overflow-hidden"
        onClick={handleBarClick}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {/* Background Progress */}
        <div
          className="absolute top-0 left-0 h-full bg-blue-500 transition-all duration-200 ease-out rounded-full"
          style={{ width: `${progressPercentage}%` }}
        />

        {/* Breakpoint Indicators */}
        {Array.from(breakpoints).map(breakpoint => {
          const breakpointPercentage = (breakpoint / totalSteps) * 100;
          return (
            <div
              key={breakpoint}
              className="absolute top-0 w-1 h-full bg-red-500 cursor-pointer z-10"
              style={{ left: `${breakpointPercentage}%` }}
              onClick={(e) => {
                e.stopPropagation();
                onBreakpointToggle?.(breakpoint);
              }}
              title={`Breakpoint at step ${breakpoint + 1}`}
            />
          );
        })}

        {/* Current Position Indicator */}
        <div
          className="absolute top-0 w-1 h-full bg-white shadow-md z-20"
          style={{ left: `${progressPercentage}%` }}
        />

        {/* Hover Indicator */}
        {isHovering && onStepClick && (
          <div
            className="absolute top-0 w-0.5 h-full bg-gray-700 opacity-50 z-15"
            style={{ left: `${(hoverPosition / totalSteps) * 100}%` }}
          />
        )}

        {/* Step Markers (for small step counts) */}
        {totalSteps <= 50 && (
          <div className="absolute top-0 left-0 w-full h-full">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div
                key={i}
                className="absolute top-0 w-px h-full bg-gray-300 opacity-50"
                style={{ left: `${(i / totalSteps) * 100}%` }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Hover Tooltip */}
      {isHovering && onStepClick && (
        <div className="text-xs text-gray-600 text-center">
          Click to jump to step {hoverPosition + 1}
        </div>
      )}

      {/* Quick Navigation */}
      <div className="flex justify-between text-xs">
        <button
          onClick={() => onStepClick?.(0)}
          className="text-blue-600 hover:text-blue-800"
          disabled={currentStep === 0}
        >
          Start
        </button>
        <button
          onClick={() => onStepClick?.(Math.floor(totalSteps * 0.25))}
          className="text-blue-600 hover:text-blue-800"
        >
          25%
        </button>
        <button
          onClick={() => onStepClick?.(Math.floor(totalSteps * 0.5))}
          className="text-blue-600 hover:text-blue-800"
        >
          50%
        </button>
        <button
          onClick={() => onStepClick?.(Math.floor(totalSteps * 0.75))}
          className="text-blue-600 hover:text-blue-800"
        >
          75%
        </button>
        <button
          onClick={() => onStepClick?.(totalSteps - 1)}
          className="text-blue-600 hover:text-blue-800"
          disabled={currentStep === totalSteps - 1}
        >
          End
        </button>
      </div>
    </div>
  );
}
```

**Key Features:**

- Visual progress indication
- Click-to-navigate functionality
- Breakpoint visualization
- Quick navigation shortcuts
- Time estimation display
- Responsive hover interactions

### `AlgorithmSelector.tsx` - Algorithm Discovery and Selection

Comprehensive algorithm selection interface with filtering and categorization.

```typescript
interface AlgorithmSelectorProps {
  selectedAlgorithm: string;
  onAlgorithmChange: (algorithmId: string) => void;
  disabled?: boolean;
  showDetails?: boolean;
}

export function AlgorithmSelector({
  selectedAlgorithm,
  onAlgorithmChange,
  disabled = false,
  showDetails = true
}: AlgorithmSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filteredAlgorithms, setFilteredAlgorithms] = useState<AlgorithmEntry[]>([]);

  const algorithms = algorithmRegistry.getAll();
  const categories = ['all', ...algorithmRegistry.getAllCategories()];

  // Filter algorithms based on search and category
  useEffect(() => {
    let filtered = algorithms;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(alg => alg.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = algorithmRegistry.search(searchQuery);
      if (selectedCategory !== 'all') {
        filtered = filtered.filter(alg => alg.category === selectedCategory);
      }
    }

    setFilteredAlgorithms(filtered);
  }, [searchQuery, selectedCategory, algorithms]);

  const selectedAlgorithmInfo = algorithmRegistry.get(selectedAlgorithm);

  return (
    <div className="relative">
      {/* Algorithm Selector Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          flex items-center justify-between w-full px-4 py-3
          bg-white border rounded-lg shadow-sm hover:shadow-md
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-all duration-200
        `}
      >
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <Code className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-left">
            <div className="font-medium text-gray-900">
              {selectedAlgorithmInfo?.name || 'Select Algorithm'}
            </div>
            {showDetails && selectedAlgorithmInfo && (
              <div className="text-sm text-gray-500">
                {selectedAlgorithmInfo.category} • {selectedAlgorithmInfo.complexity.time}
              </div>
            )}
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border rounded-lg shadow-lg z-50 max-h-96 overflow-hidden">
          {/* Search and Filter */}
          <div className="p-4 border-b">
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search algorithms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`
                    px-3 py-1 text-sm rounded-full border transition-colors
                    ${selectedCategory === category
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                    }
                  `}
                >
                  {category === 'all' ? 'All' : category}
                </button>
              ))}
            </div>
          </div>

          {/* Algorithm List */}
          <div className="max-h-64 overflow-y-auto">
            {filteredAlgorithms.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No algorithms found matching your criteria
              </div>
            ) : (
              filteredAlgorithms.map(algorithm => (
                <button
                  key={algorithm.id}
                  onClick={() => {
                    onAlgorithmChange(algorithm.id);
                    setIsOpen(false);
                  }}
                  className={`
                    w-full p-4 text-left hover:bg-gray-50 border-b last:border-b-0
                    ${selectedAlgorithm === algorithm.id ? 'bg-blue-50' : ''}
                  `}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">
                          {algorithm.name}
                        </span>
                        <span className={`
                          px-2 py-1 text-xs rounded-full
                          ${algorithm.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                            algorithm.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'}
                        `}>
                          {algorithm.difficulty}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {algorithm.description}
                      </div>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span>Time: {algorithm.complexity.time}</span>
                        <span>Space: {algorithm.complexity.space}</span>
                        <span className="text-blue-600">{algorithm.category}</span>
                      </div>
                      {algorithm.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {algorithm.tags.map(tag => (
                            <span
                              key={tag}
                              className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    {selectedAlgorithm === algorithm.id && (
                      <Check className="w-5 h-5 text-blue-600 ml-2" />
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
```

**Key Features:**

- Comprehensive algorithm discovery
- Search and filter capabilities
- Category-based organization
- Difficulty level indication
- Complexity information display
- Tag-based classification
- Responsive design

## 🚀 Usage Examples

### Basic Control Integration

```typescript
function AlgorithmVisualization() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [speed, setSpeed] = useState(1.0);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('bubble-sort');

  return (
    <div className="space-y-4">
      <AlgorithmSelector
        selectedAlgorithm={selectedAlgorithm}
        onAlgorithmChange={setSelectedAlgorithm}
      />

      <PlaybackControls
        isPlaying={isPlaying}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        canStepForward={currentStep < totalSteps - 1}
        canStepBackward={currentStep > 0}
        onStepForward={() => setCurrentStep(prev => prev + 1)}
        onStepBackward={() => setCurrentStep(prev => prev - 1)}
      />

      <SpeedControl
        speed={speed}
        onSpeedChange={setSpeed}
      />

      <ProgressBar
        currentStep={currentStep}
        totalSteps={totalSteps}
        onStepClick={setCurrentStep}
      />
    </div>
  );
}
```

### Advanced Control Configuration

```typescript
function AdvancedControls() {
  const [breakpoints, setBreakpoints] = useState(new Set<number>());
  const [settings, setSettings] = useState({
    soundEnabled: true,
    theme: 'light',
    autoReset: false
  });

  const toggleBreakpoint = (step: number) => {
    const newBreakpoints = new Set(breakpoints);
    if (newBreakpoints.has(step)) {
      newBreakpoints.delete(step);
    } else {
      newBreakpoints.add(step);
    }
    setBreakpoints(newBreakpoints);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-4">
        <PlaybackControls {...playbackProps} />
        <ProgressBar
          breakpoints={breakpoints}
          onBreakpointToggle={toggleBreakpoint}
          {...progressProps}
        />
      </div>

      <div className="space-y-4">
        <SpeedControl {...speedProps} />
        <SettingsPanel
          settings={settings}
          onSettingsChange={setSettings}
        />
      </div>
    </div>
  );
}
```

## 🎨 Styling and Themes

### Component Styling Guidelines

- Consistent spacing using Tailwind CSS classes
- Focus states for accessibility
- Hover effects for interactive elements
- Disabled states with reduced opacity
- Color coding for different action types

### Theme Support

Components support multiple themes through CSS variables and conditional classes:

```typescript
const getThemeClasses = (theme: "light" | "dark" | "high-contrast") =>
  ({
    light: "bg-white text-gray-900 border-gray-300",
    dark: "bg-gray-800 text-white border-gray-600",
    "high-contrast": "bg-black text-white border-white",
  })[theme];
```

## 🧪 Testing Strategies

### Component Testing

```typescript
describe('PlaybackControls', () => {
  test('triggers correct callbacks on button clicks', () => {
    const onPlay = jest.fn();
    const onPause = jest.fn();

    render(<PlaybackControls onPlay={onPlay} onPause={onPause} isPlaying={false} />);

    fireEvent.click(screen.getByLabelText('Play algorithm'));
    expect(onPlay).toHaveBeenCalled();
  });

  test('handles keyboard shortcuts correctly', () => {
    const onPlay = jest.fn();
    render(<PlaybackControls onPlay={onPlay} isPlaying={false} />);

    fireEvent.keyDown(document, { key: ' ' });
    expect(onPlay).toHaveBeenCalled();
  });
});
```

### Integration Testing

```typescript
describe("Control Integration", () => {
  test("speed changes affect algorithm execution", async () => {
    const { algorithmRunner } = renderAlgorithmVisualization();

    // Change speed to 3x
    fireEvent.change(screen.getByRole("slider"), { target: { value: "3" } });

    // Verify runner speed updated
    expect(algorithmRunner.getSpeed()).toBe(3);
  });
});
```

## 🔧 Configuration Options

### Default Control Settings

```typescript
interface ControlDefaults {
  playback: {
    autoPlay: boolean;
    loop: boolean;
    resetOnComplete: boolean;
  };
  speed: {
    default: number;
    min: number;
    max: number;
    presets: number[];
  };
  progress: {
    showStepNumbers: boolean;
    enableClickNavigation: boolean;
    showTimeEstimates: boolean;
  };
}
```

## 🔗 Related Resources

- **Algorithm Engine**: `../../engine/` - Algorithm execution control
- **UI Components**: `../ui/` - Base component library
- **Hooks**: `../../hooks/` - Custom React hooks for state management
- **Store**: `../../store/` - Global state management
- **Types**: `../../types/` - TypeScript definitions

## 🛠️ Best Practices

### Performance Optimization

1. Use React.memo for expensive components
2. Debounce frequent updates (speed changes)
3. Virtualize long algorithm lists
4. Optimize re-renders with useCallback

### Accessibility

1. Provide keyboard navigation for all controls
2. Include ARIA labels and descriptions
3. Support screen readers with meaningful announcements
4. Ensure sufficient color contrast

### User Experience

1. Provide visual feedback for all interactions
2. Include helpful tooltips and hints
3. Maintain consistent interaction patterns
4. Support undo/redo operations where appropriate

This control components directory provides the essential interface elements that make algorithm visualization interactive, educational, and accessible to users of all experience levels.
