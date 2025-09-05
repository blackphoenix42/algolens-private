# AlgoLens

🔍 **AlgoLens** is an interactive algorithm visualization platform that makes computer science concepts come alive through real-time animations, step-by-step execution, and multi-language code examples.

Built with **Vite + React + TypeScript + TailwindCSS**, AlgoLens provides a modern, accessible learning experience for students, educators, and developers.

## ✨ Features

### 🎯 **Interactive Visualizations**

- **Real-time Canvas Rendering**: Smooth 2D canvas animations with zoom, pan, and full-screen support
- **Multiple View Modes**: Visualize algorithms as bar charts, dot plots, or data tables
- **Color-coded Elements**: Rainbow, value-based, or custom color schemes with accessibility-friendly palettes
- **Interactive Elements**: Hover tooltips showing values and indices

### ⏯️ **Powerful Playback Controls**

- **Transport Controls**: Play, pause, step forward/backward, jump to start/end
- **Variable Speed**: Adjustable playback speed (1-10x)
- **Timeline Scrubbing**: Navigate directly to any step in the algorithm
- **Deterministic Execution**: Reproducible runs with seed-based randomization

### 📚 **Learning-Focused Design**

- **Synchronized Code Views**: Pseudocode and real code (TypeScript, JavaScript, C++, Java, Python) with line-by-line highlighting
- **Algorithm Metadata**: Complexity analysis, stability, in-place properties
- **About Panels**: Detailed explanations, pros/cons, and use cases
- **Accessible UI**: Full keyboard navigation and screen reader support

### 🎨 **Customization & Export**

- **Theme Support**: Light/dark themes with high-contrast options
- **Export Capabilities**: Save visualizations as PNG, JPG, SVG, GIF, or MP4
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **PWA Ready**: Offline-capable progressive web app

### 🔧 **Developer Experience**

- **Modular Architecture**: Clean separation between UI and algorithm engine
- **Type-Safe**: Full TypeScript coverage with strict type checking
- **Testing Suite**: Unit tests (Vitest), E2E tests (Playwright), accessibility testing
- **Performance Monitoring**: Sentry integration, Lighthouse CI, bundle analysis

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/blackphoenix42/AlgoLens.git
cd AlgoLens

# Install dependencies
npm install

# Start development server
npm run dev

# Open in browser
open http://localhost:5173
```

## 🧩 Currently Supported Algorithms

### Sorting Algorithms

- **Bubble Sort** - Simple comparison-based sorting with adjacent swaps
- **Selection Sort** - Find minimum element and swap to correct position

_More algorithms coming soon! See our [roadmap](docs/ROADMAP.md) for planned additions._

## 🏗️ Tech Stack

- **Frontend**: React 18, TypeScript, TailwindCSS
- **Build Tool**: Vite with fast HMR and optimized builds
- **Routing**: React Router with dynamic `/viz/:topic/:slug` patterns
- **Canvas**: Custom 2D rendering engine with pan/zoom/touch support
- **State Management**: React hooks with URL-synced state
- **Testing**: Vitest (unit), Playwright (E2E), Pa11y (accessibility)
- **Monitoring**: Sentry error tracking, Web Vitals analytics
- **Deployment**: Vercel with automatic previews and CI/CD

## 📖 Documentation

- [**Architecture Overview**](docs/ARCHITECTURE.md) - System design and component structure
- [**Contributing Guide**](docs/CONTRIBUTING.md) - How to contribute to the project
- [**Roadmap**](docs/ROADMAP.md) - Planned features and timeline
- [**Design Guide**](docs/DESIGN_GUIDE.md) - UI/UX principles and patterns

## 🔧 Adding New Algorithms

1. **Create Algorithm Implementation**

   ```typescript
   // src/algorithms/sorting/mergeSort.ts
   export const run: Algorithm = function* (array: number[]) {
     // Your algorithm implementation
     yield { array: [...array], highlights: { compared: [i, j] } };
   };
   ```

2. **Define Metadata**

   ```typescript
   // src/algorithms/sorting/mergeSort.meta.ts
   export const mergeSortMeta: AlgoMeta = {
     slug: "merge-sort",
     title: "Merge Sort",
     topic: "sorting",
     complexity: {
       time: { best: "O(n log n)", average: "O(n log n)", worst: "O(n log n)" },
     },
     // ... more metadata
   };
   ```

3. **Register Algorithm**
   ```typescript
   // src/algorithms/sorting/index.ts
   export const sortingAlgos: AlgoMeta[] = [
     bubbleSortMeta,
     selectionSortMeta,
     mergeSortMeta, // Add your algorithm
   ];
   ```

## 🌐 URL Parameters

AlgoLens supports shareable URLs with algorithm state:

- `?n=16` - Array size (default: 16)
- `?seed=42` - Random seed for reproducible datasets
- `?speed=8` - Playback speed (1-10x)
- `?step=12` - Start at specific step

Example: `/viz/sorting/bubble-sort?n=32&seed=123&speed=2`

## 🧪 Development Scripts

```bash
# Development
npm run dev              # Start dev server
npm run build           # Production build
npm run preview         # Preview production build

# Quality Assurance
npm run typecheck       # TypeScript checking
npm run lint            # ESLint analysis
npm run test            # Unit tests
npm run test:e2e        # End-to-end tests
npm run test:a11y       # Accessibility tests

# Performance & Analysis
npm run lhci            # Lighthouse CI
npm run analyze:bundle  # Bundle size analysis
npm run perf            # Performance benchmarks

# Utilities
npm run clean           # Clean build artifacts
npm run licenses        # Check license compatibility
npm run sitemap         # Generate sitemap
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](docs/CONTRIBUTING.md) for details on:

- Setting up the development environment
- Code style and conventions
- Testing requirements
- Pull request process

## 📊 Project Status

![Build Status](https://github.com/blackphoenix42/AlgoLens/workflows/CI/badge.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue)
![License](https://img.shields.io/github/license/blackphoenix42/AlgoLens)

**Current Version**: v0.1.x (MVP Phase)  
**Next Release**: Q4 2025 - More sorting algorithms, graph algorithms, improved a11y

## 📄 License

This project is licensed under the [MIT License](LICENSE).

## 🙋 Support

- 📚 Check our [documentation](docs/)
- 🐛 Report bugs via [GitHub Issues](https://github.com/blackphoenix42/AlgoLens/issues)
- 💬 Join discussions in [GitHub Discussions](https://github.com/blackphoenix42/AlgoLens/discussions)

---

Made with ❤️ for the computer science learning community.
