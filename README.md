# AlgoLens

Interactive algorithm visualizer that brings data structures and algorithms to life through step-by-step animation, multi-language code, and real-time complexity analysis.

[![CI](https://github.com/blackphoenix42/AlgoLens/actions/workflows/ci.yml/badge.svg)](https://github.com/blackphoenix42/AlgoLens/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## Features

- **30+ algorithms** across 8 categories with animated step-by-step visualization
- **Multi-language code** — JavaScript, Python, Java, C++ with synchronized line highlighting
- **Rich controls** — play/pause, step forward/back, speed slider (0.1×–4×), timeline scrubbing, rewind
- **Multiple views** — bar chart, dot plot, table with zoom/pan/grid/snap
- **Data generators** — random, Gaussian, sorted, nearly-sorted, reversed, few-unique, sawtooth, custom input
- **Complexity explorer** — theoretical O(·) curves with interactive Recharts plots
- **Export** — PNG, JPG, SVG, GIF, MP4 with configurable scale and watermark
- **Dark/light theme**, keyboard shortcuts, full ARIA accessibility
- **PWA** — installable, works offline
- **i18n** — English, Hindi, Japanese, Russian, Chinese

## Algorithm Coverage

| Category                | Algorithms                                                                       |
| ----------------------- | -------------------------------------------------------------------------------- |
| **Sorting**             | Bubble, Selection, Insertion, Merge, Quick, Heap, Shell, Counting, Radix, Bucket |
| **Searching**           | Linear, Binary, Interpolation, Ternary, Exponential                              |
| **Graphs**              | DFS, BFS, Dijkstra, Bellman-Ford, Topological Sort (Kahn), Kruskal MST           |
| **Trees**               | BST Insert, BST Search                                                           |
| **Strings**             | KMP, Rabin-Karp                                                                  |
| **Dynamic Programming** | 0/1 Knapsack, Longest Increasing Subsequence, Edit Distance                      |
| **Linked Lists**        | Traversal, Reverse                                                               |
| **Arrays**              | Find Maximum, Reverse Array                                                      |

## Quick Start

```bash
# Install dependencies
npm ci

# Start dev server
npm run dev

# Run tests
npm test

# Production build
npm run build
```

## Tech Stack

| Layer         | Technology                                       |
| ------------- | ------------------------------------------------ |
| Framework     | React 19, TypeScript 5.9                         |
| Build         | Vite 7                                           |
| Styling       | Tailwind CSS 4, CSS custom properties            |
| Visualization | Canvas (Konva/React-Konva), D3, Recharts         |
| Routing       | React Router DOM 7                               |
| i18n          | i18next                                          |
| Testing       | Vitest (unit), Playwright (E2E), pa11y-ci (a11y) |
| CI/CD         | GitHub Actions, Changesets                       |
| Linting       | ESLint 9, Prettier, Stylelint, Commitlint        |

## Project Structure

```
src/
├── algorithms/          # Algorithm implementations (generator-based)
│   ├── sorting/algos/   # 10 sorting algorithms
│   ├── searching/algos/ # 5 searching algorithms
│   ├── graphs/algos/    # 6 graph algorithms
│   ├── trees/algos/     # 2 tree algorithms
│   ├── strings/algos/   # 2 string algorithms
│   ├── dp/algos/        # 3 DP algorithms
│   ├── linked-lists/algos/ # 2 linked list algorithms
│   └── arrays/algos/    # 2 array algorithms
├── components/          # React components
│   ├── canvas/          # Visualization canvas (ArrayCanvas, toolbar)
│   ├── controls/        # Player transport, dataset, view controls
│   ├── panels/          # Code, About, Complexity, Export panels
│   ├── home/            # Catalog, filter bar, algo cards
│   └── ui/              # Shared UI primitives
├── engine/              # Runner (useRunner hook), registry, URL state
├── pages/               # HomePage, VisualizerPage
├── providers/           # Theme, Keyboard, Performance contexts
├── services/            # AI, storage, export, monitoring, PWA
├── i18n/                # Translations (en, hi, ja, ru, zh)
├── styles/              # Global CSS, Tailwind config
├── tests/               # Unit tests (Vitest), fixtures, helpers
└── types/               # TypeScript type definitions
```

## Adding an Algorithm

1. Create `src/algorithms/<topic>/algos/<name>.ts`:

   ```typescript
   import type { Algorithm } from "@/engine/types";

   export const run: Algorithm = function* myAlgorithm(input: unknown) {
     const arr = input as number[];
     yield {
       array: [...arr],
       highlights: {},
       explain: "Starting...",
       pcLine: 1,
     };
     // ... algorithm steps with yields ...
     yield { array: [...arr], highlights: {}, explain: "Done!", pcLine: -1 };
   };
   ```

2. Add `AlgoMeta` entry in `src/algorithms/<topic>/algos/index.ts`
3. Add tests in `src/tests/unit/`
4. The registry auto-discovers topics via lazy imports

See [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) for full details.

## Scripts

| Command             | Description              |
| ------------------- | ------------------------ |
| `npm run dev`       | Start dev server         |
| `npm run build`     | Production build         |
| `npm run preview`   | Preview production build |
| `npm test`          | Run Vitest (watch mode)  |
| `npm run test:e2e`  | Run Playwright E2E       |
| `npm run test:a11y` | Run pa11y accessibility  |
| `npm run lint`      | ESLint                   |
| `npm run format`    | Prettier                 |
| `npm run typecheck` | TypeScript check         |
| `npm run check:all` | Full CI check            |

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Contributing](docs/CONTRIBUTING.md)
- [Roadmap](docs/ROADMAP.md)
- [Design Guide](docs/DESIGN_GUIDE.md)
- [ADRs](docs/ADR/)

## License

[MIT](LICENSE)
