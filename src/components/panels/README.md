# Panel Components

This directory contains React components that provide informational panels, code displays, and educational content alongside algorithm visualizations. These panels enhance the learning experience by showing algorithm details, complexity analysis, and step-by-step explanations.

## 📁 Directory Structure

```
src/components/panels/
├── CodePanel.tsx           # Algorithm source code display
├── InfoPanel.tsx           # Algorithm information and metadata
├── StepPanel.tsx           # Current step explanation
├── ComplexityPanel.tsx     # Time/space complexity analysis
├── HistoryPanel.tsx        # Execution history and metrics
├── ComparisonPanel.tsx     # Algorithm comparison tools
├── NotesPanel.tsx          # User notes and bookmarks
├── HelpPanel.tsx           # Interactive help and tutorials
└── index.ts                # Component exports
```

## 🎯 Purpose

This directory provides educational and informational panel components for AlgoLens:

- **Code Visualization**: Syntax-highlighted algorithm source code
- **Educational Content**: Algorithm explanations and complexity analysis
- **Step Tracking**: Detailed current step information
- **Performance Analysis**: Execution metrics and comparisons
- **User Interaction**: Notes, bookmarks, and help system
- **Learning Support**: Tutorials and guided experiences

## 📋 Core Components

### `CodePanel.tsx` - Algorithm Source Code Display

Displays syntax-highlighted algorithm source code with step tracking.

```typescript
interface CodePanelProps {
  algorithm: Algorithm;
  currentStep?: AlgorithmStep;
  highlightCurrentLine?: boolean;
  showLineNumbers?: boolean;
  language?: 'typescript' | 'javascript' | 'python' | 'java' | 'cpp';
  theme?: 'light' | 'dark' | 'github' | 'monokai';
  onLineClick?: (lineNumber: number) => void;
}

export function CodePanel({
  algorithm,
  currentStep,
  highlightCurrentLine = true,
  showLineNumbers = true,
  language = 'typescript',
  theme = 'light',
  onLineClick
}: CodePanelProps) {
  const [selectedTab, setSelectedTab] = useState<'implementation' | 'pseudocode' | 'explanation'>('implementation');
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');

  // Get algorithm source code
  const sourceCode = useMemo(() => {
    switch (selectedTab) {
      case 'implementation':
        return algorithm.getSourceCode?.() || algorithm.toString();
      case 'pseudocode':
        return algorithm.getPseudocode?.() || generatePseudocode(algorithm);
      case 'explanation':
        return algorithm.getExplanation?.() || generateExplanation(algorithm);
      default:
        return '';
    }
  }, [algorithm, selectedTab]);

  // Track current line based on step
  const currentLine = useMemo(() => {
    if (!currentStep || !algorithm.getLineMapping) return null;
    return algorithm.getLineMapping(currentStep);
  }, [currentStep, algorithm]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(sourceCode);
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 2000);
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-lg shadow-sm border">
      {/* Panel Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-4">
          <h3 className="font-semibold text-gray-900">Algorithm Code</h3>

          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-gray-100 rounded-md p-1">
            {['implementation', 'pseudocode', 'explanation'].map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab as any)}
                className={`
                  px-3 py-1 rounded text-sm font-medium transition-colors
                  ${selectedTab === tab
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                  }
                `}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={copyToClipboard}
            className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-900 border rounded"
          >
            {copyStatus === 'copied' ? (
              <>
                <Check className="w-4 h-4" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy</span>
              </>
            )}
          </button>

          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as any)}
            className="px-2 py-1 text-sm border rounded"
          >
            <option value="typescript">TypeScript</option>
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
          </select>
        </div>
      </div>

      {/* Code Display */}
      <div className="flex-1 overflow-hidden">
        <SyntaxHighlighter
          language={language}
          style={theme === 'dark' ? darcula : github}
          showLineNumbers={showLineNumbers}
          lineNumberStyle={{
            minWidth: '3em',
            paddingRight: '1em',
            textAlign: 'right',
            color: '#6b7280'
          }}
          customStyle={{
            margin: 0,
            height: '100%',
            fontSize: '14px',
            lineHeight: '1.5'
          }}
          lineProps={(lineNumber) => {
            const isCurrentLine = highlightCurrentLine && lineNumber === currentLine;
            const isClickable = !!onLineClick;

            return {
              style: {
                backgroundColor: isCurrentLine ? '#fef3c7' : 'transparent',
                cursor: isClickable ? 'pointer' : 'default',
                borderLeft: isCurrentLine ? '3px solid #f59e0b' : '3px solid transparent',
                paddingLeft: '0.5rem'
              },
              onClick: isClickable ? () => onLineClick(lineNumber) : undefined
            };
          }}
        >
          {sourceCode}
        </SyntaxHighlighter>
      </div>

      {/* Current Step Info */}
      {currentStep && currentLine && (
        <div className="p-3 bg-yellow-50 border-t border-yellow-200">
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
            <div>
              <div className="text-sm font-medium text-yellow-800">
                Line {currentLine}: Current Execution
              </div>
              <div className="text-sm text-yellow-700 mt-1">
                {currentStep.description}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Code Annotations */}
      <div className="p-3 border-t bg-gray-50">
        <div className="text-xs text-gray-600">
          <div className="flex items-center space-x-4">
            <span>• Click lines to set breakpoints</span>
            <span>• Yellow highlight shows current execution</span>
            <span>• Copy code for external use</span>
          </div>
        </div>
      </div>
    </div>
  );
}
```

**Key Features:**

- Syntax highlighting for multiple languages
- Current line tracking during execution
- Tabbed view for implementation/pseudocode/explanation
- Copy-to-clipboard functionality
- Interactive line selection for breakpoints
- Responsive design with theme support

### `InfoPanel.tsx` - Algorithm Information Display

Comprehensive algorithm metadata and educational information.

```typescript
interface InfoPanelProps {
  algorithm: Algorithm;
  showComplexity?: boolean;
  showMetadata?: boolean;
  showTags?: boolean;
  expandable?: boolean;
}

export function InfoPanel({
  algorithm,
  showComplexity = true,
  showMetadata = true,
  showTags = true,
  expandable = true
}: InfoPanelProps) {
  const [expandedSections, setExpandedSections] = useState(new Set(['overview']));
  const algorithmInfo = algorithmRegistry.get(algorithm.id);

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const sections = [
    {
      id: 'overview',
      title: 'Overview',
      icon: <Info className="w-4 h-4" />,
      content: (
        <div className="space-y-3">
          <p className="text-gray-700">{algorithmInfo?.description}</p>

          {showTags && algorithmInfo?.tags && (
            <div className="flex flex-wrap gap-2">
              {algorithmInfo.tags.map(tag => (
                <span
                  key={tag}
                  className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-600">Category:</span>
              <span className="ml-2 text-gray-900">{algorithmInfo?.category}</span>
            </div>
            <div>
              <span className="font-medium text-gray-600">Difficulty:</span>
              <span className={`ml-2 px-2 py-1 rounded text-xs ${
                algorithmInfo?.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                algorithmInfo?.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {algorithmInfo?.difficulty}
              </span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'complexity',
      title: 'Complexity Analysis',
      icon: <TrendingUp className="w-4 h-4" />,
      content: showComplexity && algorithmInfo?.complexity && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Time Complexity</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700">Best Case:</span>
                  <code className="bg-blue-100 px-2 py-1 rounded text-blue-800">
                    {algorithmInfo.complexity.time.best}
                  </code>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Average:</span>
                  <code className="bg-blue-100 px-2 py-1 rounded text-blue-800">
                    {algorithmInfo.complexity.time.average}
                  </code>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Worst Case:</span>
                  <code className="bg-blue-100 px-2 py-1 rounded text-blue-800">
                    {algorithmInfo.complexity.time.worst}
                  </code>
                </div>
              </div>
            </div>

            <div className="bg-green-50 p-3 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">Space Complexity</h4>
              <div className="text-sm">
                <div className="flex justify-between">
                  <span className="text-green-700">Memory Usage:</span>
                  <code className="bg-green-100 px-2 py-1 rounded text-green-800">
                    {algorithmInfo.complexity.space}
                  </code>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-3 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Explanation</h4>
            <p className="text-sm text-gray-700">
              {algorithmInfo.complexity.explanation}
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'properties',
      title: 'Algorithm Properties',
      icon: <CheckCircle className="w-4 h-4" />,
      content: (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { property: 'Stable', value: algorithm.isStable?.() ?? false },
              { property: 'In-Place', value: algorithm.isInPlace?.() ?? false },
              { property: 'Adaptive', value: algorithm.isAdaptive?.() ?? false },
              { property: 'Online', value: algorithm.isOnline?.() ?? false }
            ].map(({ property, value }) => (
              <div key={property} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-gray-700">{property}</span>
                <span className={`flex items-center space-x-1 ${value ? 'text-green-600' : 'text-red-600'}`}>
                  {value ? <CheckCircle className="w-4 h-4" /> : <X className="w-4 h-4" />}
                  <span className="text-sm">{value ? 'Yes' : 'No'}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'applications',
      title: 'Real-World Applications',
      icon: <Globe className="w-4 h-4" />,
      content: (
        <div className="space-y-3">
          <ul className="space-y-2 text-sm text-gray-700">
            {algorithmInfo?.applications?.map((app, index) => (
              <li key={index} className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2"></div>
                <span>{app}</span>
              </li>
            )) || (
              <li className="text-gray-500 italic">No specific applications listed</li>
            )}
          </ul>
        </div>
      )
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Panel Header */}
      <div className="p-4 border-b">
        <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
          <BookOpen className="w-5 h-5" />
          <span>{algorithmInfo?.name || 'Algorithm Information'}</span>
        </h3>
      </div>

      {/* Content Sections */}
      <div className="divide-y">
        {sections.map(section => (
          <div key={section.id}>
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
              disabled={!expandable}
            >
              <div className="flex items-center space-x-3">
                {section.icon}
                <span className="font-medium text-gray-900">{section.title}</span>
              </div>
              {expandable && (
                <ChevronDown
                  className={`w-4 h-4 text-gray-500 transition-transform ${
                    expandedSections.has(section.id) ? 'rotate-180' : ''
                  }`}
                />
              )}
            </button>

            {(expandedSections.has(section.id) || !expandable) && (
              <div className="px-4 pb-4">
                {section.content}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Metadata Footer */}
      {showMetadata && algorithmInfo && (
        <div className="p-4 border-t bg-gray-50 text-xs text-gray-600">
          <div className="grid grid-cols-2 gap-4">
            {algorithmInfo.author && (
              <div>
                <span className="font-medium">Author:</span> {algorithmInfo.author}
              </div>
            )}
            {algorithmInfo.version && (
              <div>
                <span className="font-medium">Version:</span> {algorithmInfo.version}
              </div>
            )}
            {algorithmInfo.lastUpdated && (
              <div>
                <span className="font-medium">Updated:</span> {
                  new Date(algorithmInfo.lastUpdated).toLocaleDateString()
                }
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
```

**Key Features:**

- Comprehensive algorithm metadata display
- Expandable/collapsible sections
- Complexity analysis with visual formatting
- Algorithm properties checklist
- Real-world applications listing
- Responsive layout with theme support

### `StepPanel.tsx` - Current Step Information

Detailed information about the current algorithm execution step.

```typescript
interface StepPanelProps {
  currentStep: AlgorithmStep | null;
  stepIndex: number;
  totalSteps: number;
  algorithm: Algorithm;
  showVariables?: boolean;
  showDataState?: boolean;
  showPrevious?: boolean;
}

export function StepPanel({
  currentStep,
  stepIndex,
  totalSteps,
  algorithm,
  showVariables = true,
  showDataState = true,
  showPrevious = false
}: StepPanelProps) {
  const [previousSteps, setPreviousSteps] = useState<AlgorithmStep[]>([]);

  // Track step history
  useEffect(() => {
    if (currentStep && !previousSteps.find(step => step.id === currentStep.id)) {
      setPreviousSteps(prev => [...prev.slice(-4), currentStep]); // Keep last 5 steps
    }
  }, [currentStep]);

  const getStepTypeIcon = (type: string) => {
    switch (type) {
      case 'compare': return <Search className="w-4 h-4 text-blue-600" />;
      case 'swap': return <ArrowLeftRight className="w-4 h-4 text-orange-600" />;
      case 'assign': return <Edit className="w-4 h-4 text-green-600" />;
      case 'highlight': return <Zap className="w-4 h-4 text-yellow-600" />;
      default: return <Circle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStepTypeColor = (type: string) => {
    switch (type) {
      case 'compare': return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'swap': return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'assign': return 'bg-green-50 border-green-200 text-green-800';
      case 'highlight': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  if (!currentStep) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
        <div className="text-gray-500">
          <PlayCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No active step</p>
          <p className="text-sm mt-1">Start algorithm execution to see step details</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Current Step</h3>
          <div className="text-sm text-gray-500">
            {stepIndex + 1} of {totalSteps}
          </div>
        </div>
      </div>

      {/* Current Step Details */}
      <div className="p-4">
        <div className={`p-4 rounded-lg border-2 ${getStepTypeColor(currentStep.type)}`}>
          <div className="flex items-start space-x-3">
            {getStepTypeIcon(currentStep.type)}
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <span className="font-medium capitalize">{currentStep.type}</span>
                {currentStep.indices.length > 0 && (
                  <span className="text-sm opacity-75">
                    at {currentStep.indices.length === 1
                      ? `index ${currentStep.indices[0]}`
                      : `indices ${currentStep.indices.join(', ')}`
                    }
                  </span>
                )}
              </div>
              <p className="text-sm mb-3">{currentStep.description}</p>

              {/* Step Data */}
              {currentStep.values && currentStep.values.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-medium opacity-75">Values:</span>
                  <div className="flex flex-wrap gap-2">
                    {currentStep.values.map((value, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-white bg-opacity-50 rounded text-sm font-mono"
                      >
                        {JSON.stringify(value)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Metadata */}
              {currentStep.metadata && (
                <div className="mt-3 pt-3 border-t border-opacity-30">
                  <div className="text-xs space-y-1">
                    {Object.entries(currentStep.metadata).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="opacity-75">{key}:</span>
                        <span className="font-mono">{JSON.stringify(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Variable State */}
      {showVariables && currentStep.variables && (
        <div className="px-4 pb-4">
          <h4 className="font-medium text-gray-900 mb-2">Variables</h4>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="grid grid-cols-2 gap-2 text-sm">
              {Object.entries(currentStep.variables).map(([name, value]) => (
                <div key={name} className="flex justify-between">
                  <span className="text-gray-600 font-mono">{name}:</span>
                  <span className="font-mono text-gray-900">{JSON.stringify(value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Data State Visualization */}
      {showDataState && currentStep.dataState && (
        <div className="px-4 pb-4">
          <h4 className="font-medium text-gray-900 mb-2">Array State</h4>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex flex-wrap gap-1">
              {currentStep.dataState.map((value, index) => (
                <div
                  key={index}
                  className={`
                    w-10 h-10 flex items-center justify-center rounded border text-sm font-mono
                    ${currentStep.indices.includes(index)
                      ? 'bg-blue-200 border-blue-400 text-blue-800'
                      : 'bg-white border-gray-300 text-gray-700'
                    }
                  `}
                >
                  {value}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Previous Steps */}
      {showPrevious && previousSteps.length > 0 && (
        <div className="px-4 pb-4">
          <h4 className="font-medium text-gray-900 mb-2">Recent Steps</h4>
          <div className="space-y-2">
            {previousSteps.slice(-3).map((step, index) => (
              <div
                key={step.id || index}
                className="flex items-center space-x-2 text-sm p-2 bg-gray-50 rounded"
              >
                {getStepTypeIcon(step.type)}
                <span className="flex-1 truncate">{step.description}</span>
                <span className="text-xs text-gray-500">
                  -{previousSteps.length - index} steps
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

**Key Features:**

- Detailed current step information
- Step type visualization with icons and colors
- Variable state tracking
- Array state visualization
- Step history display
- Metadata and additional context

## 🚀 Usage Examples

### Basic Panel Layout

```typescript
function AlgorithmDashboard() {
  const [algorithm, setAlgorithm] = useState<Algorithm>();
  const [currentStep, setCurrentStep] = useState<AlgorithmStep | null>(null);
  const [stepIndex, setStepIndex] = useState(0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-screen">
      {/* Main visualization area */}
      <div className="lg:col-span-2">
        <AlgorithmVisualization />
      </div>

      {/* Information panels */}
      <div className="space-y-4 overflow-y-auto">
        <InfoPanel algorithm={algorithm} />
        <StepPanel
          currentStep={currentStep}
          stepIndex={stepIndex}
          totalSteps={totalSteps}
          algorithm={algorithm}
        />
        <CodePanel algorithm={algorithm} currentStep={currentStep} />
      </div>
    </div>
  );
}
```

### Tabbed Panel Interface

```typescript
function TabbedPanels() {
  const [activeTab, setActiveTab] = useState('info');

  const tabs = [
    { id: 'info', label: 'Info', icon: <Info className="w-4 h-4" /> },
    { id: 'code', label: 'Code', icon: <Code className="w-4 h-4" /> },
    { id: 'step', label: 'Step', icon: <Play className="w-4 h-4" /> },
    { id: 'complexity', label: 'Analysis', icon: <TrendingUp className="w-4 h-4" /> }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="flex border-b">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex items-center space-x-2 px-4 py-3 border-b-2 transition-colors
              ${activeTab === tab.id
                ? 'border-blue-500 text-blue-600 bg-blue-50'
                : 'border-transparent text-gray-500 hover:text-gray-700'
              }
            `}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="p-4">
        {activeTab === 'info' && <InfoPanel algorithm={algorithm} />}
        {activeTab === 'code' && <CodePanel algorithm={algorithm} />}
        {activeTab === 'step' && <StepPanel currentStep={currentStep} />}
        {activeTab === 'complexity' && <ComplexityPanel algorithm={algorithm} />}
      </div>
    </div>
  );
}
```

## 🎨 Styling and Responsive Design

### Mobile-First Responsive Layout

```typescript
const responsiveClasses = {
  mobile: "space-y-4",
  tablet: "md:grid md:grid-cols-2 md:gap-4 md:space-y-0",
  desktop: "lg:grid-cols-3 xl:grid-cols-4",
};
```

### Theme-Aware Components

```typescript
const getThemeStyles = (theme: Theme) => ({
  panel: `bg-${theme.surface} border-${theme.border}`,
  text: `text-${theme.text}`,
  accent: `text-${theme.accent}`,
});
```

## 🧪 Testing Strategies

### Component Testing

```typescript
describe('InfoPanel', () => {
  test('displays algorithm information correctly', () => {
    const mockAlgorithm = createMockAlgorithm();
    render(<InfoPanel algorithm={mockAlgorithm} />);

    expect(screen.getByText(mockAlgorithm.name)).toBeInTheDocument();
    expect(screen.getByText(mockAlgorithm.description)).toBeInTheDocument();
  });

  test('toggles sections when expandable', () => {
    render(<InfoPanel algorithm={mockAlgorithm} expandable />);

    const complexityButton = screen.getByText('Complexity Analysis');
    fireEvent.click(complexityButton);

    expect(screen.getByText(/Time Complexity/)).toBeInTheDocument();
  });
});
```

### Integration Testing

```typescript
describe('Panel Integration', () => {
  test('updates step panel when algorithm step changes', () => {
    const { rerender } = render(
      <StepPanel currentStep={null} stepIndex={0} totalSteps={10} />
    );

    expect(screen.getByText('No active step')).toBeInTheDocument();

    rerender(
      <StepPanel
        currentStep={mockStep}
        stepIndex={1}
        totalSteps={10}
      />
    );

    expect(screen.getByText(mockStep.description)).toBeInTheDocument();
  });
});
```

## 🔧 Configuration Options

### Panel Configuration

```typescript
interface PanelConfig {
  defaultExpanded: string[];
  showLineNumbers: boolean;
  syntaxTheme: string;
  maxStepHistory: number;
  enableCodeCopy: boolean;
  showComplexityGraphs: boolean;
}
```

## 🔗 Related Resources

- **Algorithm Engine**: `../../engine/` - Algorithm execution and metadata
- **UI Components**: `../ui/` - Base component library
- **Canvas Components**: `../canvas/` - Visualization components
- **Syntax Highlighting**: External library (react-syntax-highlighter)
- **Icons**: Lucide React or similar icon library

## 🛠️ Best Practices

### Performance Optimization

1. Lazy load code syntax highlighting
2. Virtualize long step histories
3. Memoize expensive computations
4. Debounce rapid step updates

### Accessibility

1. Provide alternative text for visual elements
2. Support keyboard navigation in tabbed interfaces
3. Use semantic HTML structures
4. Maintain focus management in collapsible sections

### Educational Design

1. Use progressive disclosure for complex information
2. Provide multiple viewing modes (beginner/advanced)
3. Include contextual help and tooltips
4. Support different learning styles with varied content formats

This panel components directory provides the educational foundation that transforms algorithm visualizations from simple animations into comprehensive learning experiences.
