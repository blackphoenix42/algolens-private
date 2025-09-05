# Home Components

This directory contains React components specifically designed for the AlgoLens homepage and landing experience. These components provide the first impression for users, showcase platform capabilities, and guide users toward algorithm exploration.

## 📁 Directory Structure

```
src/components/home/
├── Hero.tsx                # Main hero section with CTAs
├── FeatureCards.tsx        # Platform feature highlights
├── AlgorithmPreview.tsx    # Interactive algorithm demos
├── QuickStart.tsx          # Getting started guide
├── Stats.tsx               # Platform usage statistics
├── Testimonials.tsx        # User testimonials and reviews
├── TechStack.tsx           # Technology showcase
├── Footer.tsx              # Site footer with links
└── index.ts                # Component exports
```

## 🎯 Purpose

This directory provides homepage components that serve multiple objectives:

- **User Onboarding**: Welcome new users and explain platform value
- **Feature Discovery**: Showcase key algorithm visualization capabilities
- **Quick Engagement**: Provide immediate interactive experiences
- **Education Goals**: Communicate learning objectives and outcomes
- **Community Building**: Display testimonials and usage statistics
- **Technical Transparency**: Show underlying technology stack

## 📋 Core Components

### `Hero.tsx` - Main Landing Section

Primary hero section with compelling value proposition and call-to-action.

```typescript
interface HeroProps {
  onGetStarted?: () => void;
  onExploreAlgorithms?: () => void;
  showVideo?: boolean;
  animated?: boolean;
}

export function Hero({
  onGetStarted,
  onExploreAlgorithms,
  showVideo = true,
  animated = true
}: HeroProps) {
  const [currentDemo, setCurrentDemo] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const demoAlgorithms = [
    { name: 'Bubble Sort', color: 'blue', complexity: 'O(n²)' },
    { name: 'Quick Sort', color: 'green', complexity: 'O(n log n)' },
    { name: 'Merge Sort', color: 'purple', complexity: 'O(n log n)' }
  ];

  // Auto-cycle through demo algorithms
  useEffect(() => {
    if (!animated) return;

    const interval = setInterval(() => {
      setCurrentDemo(prev => (prev + 1) % demoAlgorithms.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [animated]);

  return (
    <section className="relative min-h-screen flex items-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
        {animated && (
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-200 rounded-full opacity-20 animate-pulse" />
        )}
        {animated && (
          <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-purple-200 rounded-full opacity-20 animate-pulse delay-1000" />
        )}
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content Side */}
          <div className="text-center lg:text-left">
            <div className="space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                <Sparkles className="w-4 h-4 mr-2" />
                Interactive Algorithm Learning
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Master{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  Algorithms
                </span>
                <br />
                Through{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                  Visualization
                </span>
              </h1>

              {/* Description */}
              <p className="text-xl text-gray-600 max-w-2xl">
                Experience algorithms like never before. AlgoLens transforms complex
                computer science concepts into interactive, visual learning experiences
                that make understanding effortless.
              </p>

              {/* Features List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                {[
                  { icon: <Eye className="w-5 h-5" />, text: 'Visual Step-by-Step Execution' },
                  { icon: <Play className="w-5 h-5" />, text: 'Interactive Playback Controls' },
                  { icon: <BarChart className="w-5 h-5" />, text: 'Real-Time Complexity Analysis' },
                  { icon: <Code className="w-5 h-5" />, text: 'Multiple Programming Languages' }
                ].map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3 text-gray-700">
                    <div className="text-blue-600">{feature.icon}</div>
                    <span>{feature.text}</span>
                  </div>
                ))}
              </div>

              {/* Call to Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  onClick={onGetStarted}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
                >
                  Start Learning Now
                </button>
                <button
                  onClick={onExploreAlgorithms}
                  className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
                >
                  Explore Algorithms
                </button>
              </div>

              {/* Stats */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6 pt-8 text-center">
                <div>
                  <div className="text-2xl font-bold text-gray-900">50+</div>
                  <div className="text-sm text-gray-600">Algorithms</div>
                </div>
                <div className="hidden sm:block w-px h-8 bg-gray-300" />
                <div>
                  <div className="text-2xl font-bold text-gray-900">10k+</div>
                  <div className="text-sm text-gray-600">Students</div>
                </div>
                <div className="hidden sm:block w-px h-8 bg-gray-300" />
                <div>
                  <div className="text-2xl font-bold text-gray-900">95%</div>
                  <div className="text-sm text-gray-600">Success Rate</div>
                </div>
              </div>
            </div>
          </div>

          {/* Visual Side */}
          <div className="relative">
            {showVideo ? (
              <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden">
                <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 relative">
                  {isVideoPlaying ? (
                    <video
                      className="w-full h-full object-cover"
                      autoPlay
                      muted
                      loop
                      onLoadStart={() => setIsVideoPlaying(true)}
                    >
                      <source src="/video/demo.mp4" type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <button
                        onClick={() => setIsVideoPlaying(true)}
                        className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors shadow-lg"
                      >
                        <Play className="w-8 h-8 ml-1" />
                      </button>
                    </div>
                  )}

                  {/* Algorithm Demo Overlay */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-gray-900">
                            {demoAlgorithms[currentDemo].name}
                          </div>
                          <div className="text-sm text-gray-600">
                            Complexity: {demoAlgorithms[currentDemo].complexity}
                          </div>
                        </div>
                        <div className={`w-3 h-3 rounded-full bg-${demoAlgorithms[currentDemo].color}-500`} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Demo Controls */}
                <div className="p-4 bg-gray-50 flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-3 h-3 bg-red-500 rounded-full" />
                    <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                  </div>
                  <div className="flex-1 text-center text-sm text-gray-600">
                    AlgoLens - Interactive Algorithm Visualization
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-2xl p-8">
                <div className="text-center space-y-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto flex items-center justify-center">
                    <Zap className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    Ready to Start Learning?
                  </h3>
                  <p className="text-gray-600">
                    Join thousands of students who have mastered algorithms through visualization.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="flex flex-col items-center space-y-2 text-gray-400">
          <span className="text-sm">Scroll to explore</span>
          <ChevronDown className="w-5 h-5 animate-bounce" />
        </div>
      </div>
    </section>
  );
}
```

**Key Features:**

- Compelling value proposition with clear benefits
- Interactive video demo showcase
- Animated algorithm cycling
- Strong call-to-action buttons
- Platform statistics display
- Responsive design for all devices

### `FeatureCards.tsx` - Platform Capabilities Showcase

Highlight key platform features with engaging visual cards.

```typescript
interface FeatureCard {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
  color: string;
  demo?: string;
}

interface FeatureCardsProps {
  onFeatureClick?: (featureId: string) => void;
  showDemos?: boolean;
}

export function FeatureCards({ onFeatureClick, showDemos = true }: FeatureCardsProps) {
  const [activeFeature, setActiveFeature] = useState<string | null>(null);

  const features: FeatureCard[] = [
    {
      id: 'visualization',
      title: 'Interactive Visualization',
      description: 'Watch algorithms come to life with step-by-step visual execution',
      icon: <Eye className="w-8 h-8" />,
      color: 'blue',
      features: [
        'Real-time step visualization',
        'Customizable animation speeds',
        'Color-coded operation types',
        'Zoom and pan capabilities'
      ],
      demo: 'sorting-demo'
    },
    {
      id: 'algorithms',
      title: 'Comprehensive Algorithm Library',
      description: 'Explore 50+ algorithms across multiple categories and difficulty levels',
      icon: <BookOpen className="w-8 h-8" />,
      color: 'green',
      features: [
        'Sorting algorithms',
        'Graph algorithms',
        'Search algorithms',
        'Dynamic programming'
      ],
      demo: 'algorithm-grid'
    },
    {
      id: 'analysis',
      title: 'Complexity Analysis',
      description: 'Understand time and space complexity with visual performance metrics',
      icon: <BarChart className="w-8 h-8" />,
      color: 'purple',
      features: [
        'Big O notation explanations',
        'Performance comparisons',
        'Best/worst case scenarios',
        'Memory usage tracking'
      ],
      demo: 'complexity-chart'
    },
    {
      id: 'code',
      title: 'Multi-Language Support',
      description: 'View algorithm implementations in your preferred programming language',
      icon: <Code className="w-8 h-8" />,
      color: 'orange',
      features: [
        'JavaScript/TypeScript',
        'Python',
        'Java',
        'C++ implementations'
      ],
      demo: 'code-switcher'
    },
    {
      id: 'learning',
      title: 'Guided Learning Paths',
      description: 'Structured curriculum from beginner to advanced algorithm concepts',
      icon: <GraduationCap className="w-8 h-8" />,
      color: 'teal',
      features: [
        'Progressive difficulty levels',
        'Prerequisite tracking',
        'Achievement system',
        'Personalized recommendations'
      ],
      demo: 'learning-path'
    },
    {
      id: 'collaboration',
      title: 'Share & Collaborate',
      description: 'Share algorithm visualizations and collaborate with peers',
      icon: <Users className="w-8 h-8" />,
      color: 'pink',
      features: [
        'Shareable visualization links',
        'Classroom integration',
        'Discussion forums',
        'Code sharing'
      ],
      demo: 'share-modal'
    }
  ];

  const handleFeatureHover = (featureId: string) => {
    if (showDemos) {
      setActiveFeature(featureId);
    }
  };

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Master Algorithms
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            AlgoLens provides a comprehensive platform for learning algorithms through
            interactive visualization, detailed explanations, and hands-on practice.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div
              key={feature.id}
              className={`
                group relative bg-white rounded-xl shadow-lg hover:shadow-xl
                transition-all duration-300 cursor-pointer transform hover:-translate-y-2
                ${activeFeature === feature.id ? 'ring-2 ring-blue-500' : ''}
              `}
              onMouseEnter={() => handleFeatureHover(feature.id)}
              onMouseLeave={() => setActiveFeature(null)}
              onClick={() => onFeatureClick?.(feature.id)}
            >
              {/* Card Content */}
              <div className="p-6">
                {/* Icon */}
                <div className={`
                  inline-flex items-center justify-center w-16 h-16 rounded-lg mb-4
                  bg-${feature.color}-100 text-${feature.color}-600
                  group-hover:bg-${feature.color}-600 group-hover:text-white
                  transition-colors duration-300
                `}>
                  {feature.icon}
                </div>

                {/* Title & Description */}
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 mb-4">
                  {feature.description}
                </p>

                {/* Feature List */}
                <ul className="space-y-2">
                  {feature.features.map((item, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-600">
                      <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>

                {/* Learn More Link */}
                <div className="mt-6 flex items-center text-blue-600 font-medium">
                  <span>Learn more</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Hover Overlay */}
              <div className={`
                absolute inset-0 bg-gradient-to-br from-${feature.color}-500 to-${feature.color}-600
                rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300
              `} />
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-gray-600 mb-6">
            Ready to experience the future of algorithm learning?
          </p>
          <button
            onClick={() => onFeatureClick?.('get-started')}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
          >
            Start Your Journey Today
          </button>
        </div>
      </div>
    </section>
  );
}
```

**Key Features:**

- Six core feature categories with detailed explanations
- Interactive hover effects and demonstrations
- Comprehensive feature lists with checkmarks
- Responsive grid layout
- Strong visual hierarchy with icons and colors
- Call-to-action integration

### `AlgorithmPreview.tsx` - Interactive Mini Demos

Provide hands-on algorithm previews directly on the homepage.

```typescript
interface AlgorithmPreviewProps {
  selectedAlgorithm?: string;
  onAlgorithmSelect?: (algorithmId: string) => void;
  showControls?: boolean;
}

export function AlgorithmPreview({
  selectedAlgorithm = 'bubble-sort',
  onAlgorithmSelect,
  showControls = true
}: AlgorithmPreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState([64, 34, 25, 12, 22, 11, 90]);
  const [steps, setSteps] = useState<AlgorithmStep[]>([]);

  const algorithms = [
    { id: 'bubble-sort', name: 'Bubble Sort', color: 'blue' },
    { id: 'selection-sort', name: 'Selection Sort', color: 'green' },
    { id: 'insertion-sort', name: 'Insertion Sort', color: 'purple' }
  ];

  // Generate algorithm steps
  useEffect(() => {
    const algorithm = algorithmRegistry.get(selectedAlgorithm);
    if (algorithm) {
      const algorithmInstance = new algorithm.algorithm();
      const generatedSteps = algorithmInstance.execute([...data]);
      setSteps(generatedSteps);
      setCurrentStep(0);
    }
  }, [selectedAlgorithm, data]);

  // Animation loop
  useEffect(() => {
    if (!isPlaying || currentStep >= steps.length - 1) {
      setIsPlaying(false);
      return;
    }

    const timer = setTimeout(() => {
      setCurrentStep(prev => prev + 1);
    }, 800);

    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, steps.length]);

  const play = () => {
    if (currentStep >= steps.length - 1) {
      setCurrentStep(0);
    }
    setIsPlaying(true);
  };

  const reset = () => {
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const generateNewData = () => {
    const newData = Array.from({ length: 8 }, () => Math.floor(Math.random() * 90) + 10);
    setData(newData);
    setCurrentStep(0);
    setIsPlaying(false);
  };

  // Get current data state
  const getCurrentDataState = () => {
    if (currentStep === 0) return data;

    // Apply steps up to current step to get data state
    let currentData = [...data];
    for (let i = 0; i <= currentStep && i < steps.length; i++) {
      const step = steps[i];
      if (step.type === 'swap' && step.indices.length === 2) {
        const [a, b] = step.indices;
        [currentData[a], currentData[b]] = [currentData[b], currentData[a]];
      }
    }
    return currentData;
  };

  const currentData = getCurrentDataState();
  const currentStep_obj = steps[currentStep];
  const maxValue = Math.max(...data);

  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Try It{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Right Now
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience interactive algorithm visualization with this live demo.
            Watch how sorting algorithms work step by step.
          </p>
        </div>

        <div className="bg-gray-50 rounded-2xl p-8">
          {/* Algorithm Selector */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {algorithms.map(algorithm => (
              <button
                key={algorithm.id}
                onClick={() => onAlgorithmSelect?.(algorithm.id)}
                className={`
                  px-6 py-3 rounded-lg font-medium transition-all duration-200
                  ${selectedAlgorithm === algorithm.id
                    ? `bg-${algorithm.color}-600 text-white shadow-lg`
                    : 'bg-white text-gray-700 hover:bg-gray-100 shadow'
                  }
                `}
              >
                {algorithm.name}
              </button>
            ))}
          </div>

          {/* Visualization Area */}
          <div className="bg-white rounded-xl p-6 mb-6">
            <div className="flex items-end justify-center space-x-2 h-64">
              {currentData.map((value, index) => {
                const height = (value / maxValue) * 200;
                const isActive = currentStep_obj?.indices.includes(index);
                const isComparing = currentStep_obj?.type === 'compare' && isActive;
                const isSwapping = currentStep_obj?.type === 'swap' && isActive;

                return (
                  <div
                    key={index}
                    className={`
                      flex flex-col items-center transition-all duration-500
                      ${isSwapping ? 'transform scale-110' : ''}
                    `}
                  >
                    <div
                      className={`
                        w-8 rounded-t-lg transition-all duration-500 flex items-end justify-center text-white text-sm font-medium
                        ${isComparing ? 'bg-yellow-500' :
                          isSwapping ? 'bg-red-500' :
                          'bg-blue-500'}
                      `}
                      style={{ height: `${height}px` }}
                    >
                      {value}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{index}</div>
                  </div>
                );
              })}
            </div>

            {/* Step Information */}
            <div className="mt-6 text-center">
              {currentStep_obj ? (
                <div className="bg-gray-100 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">
                    Step {currentStep + 1} of {steps.length}
                  </div>
                  <div className="font-medium text-gray-900">
                    {currentStep_obj.description}
                  </div>
                </div>
              ) : (
                <div className="text-gray-500">
                  Click play to start the algorithm visualization
                </div>
              )}
            </div>
          </div>

          {/* Controls */}
          {showControls && (
            <div className="flex flex-wrap justify-center items-center gap-4">
              <button
                onClick={play}
                disabled={isPlaying}
                className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Play className="w-4 h-4" />
                <span>{currentStep >= steps.length - 1 ? 'Restart' : 'Play'}</span>
              </button>

              <button
                onClick={reset}
                className="flex items-center space-x-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset</span>
              </button>

              <button
                onClick={generateNewData}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Shuffle className="w-4 h-4" />
                <span>New Data</span>
              </button>

              <div className="text-sm text-gray-600">
                {isPlaying ? 'Playing...' : 'Ready to play'}
              </div>
            </div>
          )}

          {/* Call to Action */}
          <div className="text-center mt-8 p-6 bg-blue-50 rounded-xl">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Want to explore more algorithms?
            </h3>
            <p className="text-blue-700 mb-4">
              Get access to 50+ algorithms with advanced features, code examples, and detailed explanations.
            </p>
            <button
              onClick={() => onAlgorithmSelect?.('explore-all')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Explore All Algorithms
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
```

**Key Features:**

- Live algorithm demonstrations with real-time visualization
- Multiple algorithm options with easy switching
- Interactive controls (play, reset, new data)
- Step-by-step execution display
- Visual feedback with color coding
- Call-to-action for full platform access

## 🚀 Usage Examples

### Complete Homepage Assembly

```typescript
function HomePage() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/getting-started');
  };

  const handleExploreAlgorithms = () => {
    navigate('/algorithms');
  };

  const handleFeatureClick = (featureId: string) => {
    navigate(`/features/${featureId}`);
  };

  return (
    <div className="min-h-screen">
      <Hero
        onGetStarted={handleGetStarted}
        onExploreAlgorithms={handleExploreAlgorithms}
      />

      <FeatureCards
        onFeatureClick={handleFeatureClick}
      />

      <AlgorithmPreview
        onAlgorithmSelect={(id) => navigate(`/algorithm/${id}`)}
      />

      <QuickStart />
      <Stats />
      <Testimonials />
      <Footer />
    </div>
  );
}
```

### Customizable Homepage Sections

```typescript
interface HomePageConfig {
  showHero: boolean;
  showFeatures: boolean;
  showPreview: boolean;
  showStats: boolean;
  showTestimonials: boolean;
  theme: 'light' | 'dark';
}

function ConfigurableHomePage({ config }: { config: HomePageConfig }) {
  return (
    <div className={`min-h-screen ${config.theme === 'dark' ? 'dark' : ''}`}>
      {config.showHero && <Hero />}
      {config.showFeatures && <FeatureCards />}
      {config.showPreview && <AlgorithmPreview />}
      {config.showStats && <Stats />}
      {config.showTestimonials && <Testimonials />}
    </div>
  );
}
```

## 🎨 Design Principles

### Visual Hierarchy

- Large, attention-grabbing headlines
- Progressive information disclosure
- Clear call-to-action placement
- Consistent spacing and typography

### Engagement Strategy

- Interactive elements on first impression
- Multiple entry points for different user types
- Social proof through testimonials and statistics
- Clear value proposition communication

## 🧪 Testing Strategies

### Homepage Testing

```typescript
describe('Homepage Components', () => {
  test('hero section renders with correct CTAs', () => {
    const onGetStarted = jest.fn();
    render(<Hero onGetStarted={onGetStarted} />);

    fireEvent.click(screen.getByText('Start Learning Now'));
    expect(onGetStarted).toHaveBeenCalled();
  });

  test('algorithm preview is interactive', () => {
    render(<AlgorithmPreview />);

    fireEvent.click(screen.getByText('Play'));
    expect(screen.getByText('Playing...')).toBeInTheDocument();
  });
});
```

### User Journey Testing

```typescript
describe('Homepage User Journey', () => {
  test('user can navigate from hero to algorithm exploration', () => {
    const navigate = jest.fn();
    render(<HomePage navigate={navigate} />);

    fireEvent.click(screen.getByText('Explore Algorithms'));
    expect(navigate).toHaveBeenCalledWith('/algorithms');
  });
});
```

## 🔧 Performance Optimization

### Lazy Loading

```typescript
const LazyAlgorithmPreview = lazy(() => import('./AlgorithmPreview'));

function HomePage() {
  return (
    <div>
      <Hero />
      <FeatureCards />
      <Suspense fallback={<div>Loading...</div>}>
        <LazyAlgorithmPreview />
      </Suspense>
    </div>
  );
}
```

### Image Optimization

```typescript
const optimizedImages = {
  hero: "/images/hero-optimized.webp",
  features: "/images/features-optimized.webp",
  demo: "/video/demo-compressed.mp4",
};
```

## 🔗 Related Resources

- **Algorithm Engine**: `../../engine/` - Powers algorithm demonstrations
- **UI Components**: `../ui/` - Base component library
- **Canvas Components**: `../canvas/` - Visualization components
- **Routing**: `../../app/router.tsx` - Navigation setup
- **Analytics**: `../../services/analytics.ts` - User behavior tracking

## 🛠️ Best Practices

### Conversion Optimization

1. Multiple clear call-to-action buttons
2. Social proof through testimonials and stats
3. Interactive demos for immediate engagement
4. Progressive disclosure of complex information

### Performance

1. Optimize images and videos for web
2. Lazy load below-the-fold content
3. Minimize initial bundle size
4. Use efficient animation libraries

### Accessibility

1. Provide alternative text for visual content
2. Ensure keyboard navigation support
3. Maintain proper heading hierarchy
4. Include screen reader announcements for dynamic content

### SEO Optimization

1. Semantic HTML structure
2. Meta tags and descriptions
3. Structured data markup
4. Fast loading times

This home components directory creates an engaging, educational, and conversion-focused landing experience that effectively introduces users to the power of algorithm visualization while encouraging deeper platform exploration.
