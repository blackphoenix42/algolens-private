# AlgoLens — Architecture Overview

> Vite 7 + React 19 + TypeScript 5.9 + Tailwind CSS 4. Panels & canvas for algorithm visuals, with a generator-based engine/runner layer.

## Goals

- Clear separation of **UI (panels/controls)** and **simulation engine**.
- Deterministic, stepable execution (play/pause/seek) via generator functions.
- Shareable state via **URL** encoding and export (images/GIF/video).
- Internationalization (i18n) with multi-language support.

## Topology

```
[Browser]
   │
   ▼
React App (App shell, routing, theme, i18n)
   │
   ├─ Providers (ThemeProvider, KeyboardProvider, PerformanceProvider)
   ├─ Pages
   │    ├─ HomePage (catalog, filters, search)
   │    └─ VisualizerPage (algorithm visualization)
   │         ├─ Panels (Code / About / Export)
   │         ├─ Controls (Transport / DatasetPanel / ArrayViewPanel)
   │         └─ Canvas (ArrayCanvas + CanvasToolbar)
   │              │
   │              ▼
   │        Runner (useRunner)  ──> Engine (registry + algorithm impl)
   │              │                     │
   │              └── yields Frames ────┘
   │                     │
   │                     ▼
   │             Render to <canvas> (draw loop)
   │
   └─ Services (export, monitoring, performance, storage, PWA)
```

## Key Modules (by directory)

- `src/app/`
  - **AppLayout.tsx**: root layout with providers.
  - **router.tsx**: React Router config with GitHub Pages basename support.
- `src/pages/`
  - **HomePage**: algorithm catalog with search, filters (type/complexity/data structure), and keyboard shortcuts.
  - **VisualizerPage**: wires panels + canvas + runner with mobile-responsive layout.
- `src/algorithms/` — 32 algorithms across 8 categories:
  - **sorting/**: Bubble, Selection, Insertion, Merge, Quick, Heap, Shell, Counting, Radix (LSD), Bucket.
  - **searching/**: Linear, Binary, Interpolation, Ternary, Exponential.
  - **graphs/**: BFS, DFS, Dijkstra, Bellman-Ford, Topological Sort (Kahn), Kruskal MST.
  - **trees/**: BST Insert, BST Search.
  - **strings/**: KMP, Rabin-Karp.
  - **dp/**: 0/1 Knapsack, Longest Increasing Subsequence, Edit Distance.
  - **linked-lists/**: Traversal, Reverse.
  - **arrays/**: Find Maximum, Reverse Array.
  - Each algorithm exports a generator that yields `Frame` objects.
- `src/components/canvas/`
  - **ArrayCanvas**: imperative canvas renderer with bars/dots/table views, zoom, pan, drag support.
  - **CanvasToolbar**: zoom/pan/grid toggles, fullscreen, export shortcuts.
- `src/components/controls/`
  - **Transport**: play/pause/step/seek, speed control with slider.
  - **DatasetPanel**: dataset generators (random, gaussian, reversed, few-unique, custom).
  - **ArrayViewPanel**: view mode, color mode, and display settings.
- `src/components/panels/`
  - **CodePanel**: multi-language code (C++/Java/Python/JS) with syntax highlighting and active line tracking.
  - **AboutPanel**: algorithm description, complexity table, pros/cons.
  - **CollapsibleExportPanel**: image/GIF/video export.
  - **ComplexityExplorer**: interactive complexity analysis.
- `src/components/ui/`
  - Shared components: Button, Card, Modal, Icons (ChevronDown, Copy, Wrap, Expand, Home), SearchInput, LoadingScreen.
- `src/components/home/`
  - **AlgoCard**: algorithm card with thumbnail bars, tags, difficulty pill.
  - **FilterBar**: search input with fuzzy search, algorithm type/complexity/data structure filters.
- `src/engine/`
  - **registry.ts** (`findAlgo`, `loadAllTopics`): lazy-loaded algorithm catalog with caching.
  - **runner.ts** (`useRunner`): playhead state machine with play/pause/step/seek/speed control.
  - **urlState.ts**: simple URL query param read/write for shareable links.
- `src/providers/`
  - **ThemeProvider**: dark/light theme with system preference detection.
  - **KeyboardProvider**: global keyboard shortcuts with context-aware hints.
- `src/hooks/`
  - Custom hooks for preferences, orientation detection, etc.
- `src/i18n/`
  - **i18next** setup with browser language detection.
  - Translations: English, Chinese, Japanese, Russian.
- `src/services/`
  - **export/**: image, GIF, video export services.
  - **monitoring/**: Sentry error monitoring.
  - **performance/**: web vitals and performance tracking.
  - **pwa.ts**: service worker registration.
- `src/utils/`
  - Utility functions: cn, clamp, debounce, makeRandomArray, algorithmTags, searchFilters, taskScheduler.
  - **ErrorBoundary**: React error boundary component.
- `public/`
  - PWA files (manifest, service worker, offline page), sitemap, robots.txt, security.txt.

## Algorithm Contract

Algorithms are generator functions that yield `Frame` objects for deterministic step-by-step visualization:

```ts
interface Frame {
  array: number[];
  highlights?: {
    compared?: [number, number];
    swapped?: [number, number];
    pivot?: number;
    indices?: number[];
  };
  pcLine?: number;
  explain?: string;
}

// Each algorithm's run() is a generator:
function* run(input: number[] | object, options?: object): Generator<Frame> {
  // yield frames step by step
}
```

Algorithm metadata (`AlgoMeta`) includes: title, slug, topic, summary, pseudocode, code (multi-language), complexity, codeLineMap, and a `load()` function for lazy imports.

Register in `src/algorithms/<topic>/algos/index.ts` and the engine `registry.ts` discovers them.

## Runner Loop

- **Idle** until user hits Play.
- All frames are pre-computed by exhausting the generator on algorithm load.
- `useRunner` manages a frame index with `setInterval` for playback.
- Play/pause/step navigates through the pre-computed frame array.
- Auto-pauses at boundaries (start/end).

## Rendering

- `ArrayCanvas` renders the current frame with bars/dots/table views.
- Supports zoom, pan, drag-to-reorder, grid/snap toggles.
- Color modes: plain, rainbow, value-based, custom.
- Imperative handle exposes zoom/reset/center methods.

## URL State

- Shareable links encode: step index, speed, array size, seed, theme.
- Simple query param approach via `engine/urlState.ts`.

## Testing

- **Vitest** for unit tests (algorithms, utilities).
- **Playwright** for E2E flows (home page, visualization).
- **pa11y-ci** for accessibility testing.
- **Storybook** for component development and visual testing.

## CI/CD

- **GitHub Actions**: CI (lint/typecheck/test/build), E2E, a11y, Lighthouse, CodeQL, deploy to GitHub Pages.
- **Changesets** for versioning and releases.
- **Dependabot** for dependency updates.

## Observability

- **Sentry** error boundary and monitoring (configurable).
- **PostHog** analytics (opt-in).
- **Web Vitals** performance tracking.

## Extensibility

- New algorithm = new generator module + metadata in `src/algorithms/<topic>/algos/` + index registration.
- Canvas variants (graphs, trees) live under `components/canvas/`.
- i18n: add translation JSON in `src/i18n/<locale>/`.
