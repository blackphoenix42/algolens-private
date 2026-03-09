# Contributing to AlgoLens

Thanks for considering a contribution! This guide helps you get productive quickly.

## Quick Start

```sh
# Node version is read from .node-version
npm ci
npm run dev
```

**Useful scripts**

- `npm run dev` — Vite dev server
- `npm run build` — production build
- `npm run lint` / `npm run typecheck` — quality gates
- `npm run test` — unit tests (Vitest)
- `npx playwright test` — E2E (Playwright)
- `npx changeset` — create a release note & bump proposal

## Git Hygiene

- Branches: `feat/<topic>`, `fix/<bug>`, `chore/<thing>`.
- Commits: **Conventional Commits** (e.g., `feat(canvas): add bar hover`).
- PRs: small, focused; fill out the PR template; include screenshots for UI.

## Pre-commit Hooks

We use **Husky**. After `npm ci`:

```sh
bash scripts/husky.sh
```

This enables `pre-commit` (lint/format) and `commit-msg` (commitlint).

## Adding a New Algorithm

Algorithms live in `src/algorithms/<topic>/algos/`. Current topics:

| Topic        | Directory                            | Algorithms    |
| ------------ | ------------------------------------ | ------------- |
| sorting      | `src/algorithms/sorting/algos/`      | 10 algorithms |
| searching    | `src/algorithms/searching/algos/`    | 5 algorithms  |
| graphs       | `src/algorithms/graphs/algos/`       | 6 algorithms  |
| trees        | `src/algorithms/trees/algos/`        | 2 algorithms  |
| strings      | `src/algorithms/strings/algos/`      | 2 algorithms  |
| dp           | `src/algorithms/dp/algos/`           | 3 algorithms  |
| linked-lists | `src/algorithms/linked-lists/algos/` | 2 algorithms  |
| arrays       | `src/algorithms/arrays/algos/`       | 2 algorithms  |

### Steps

1. Create `src/algorithms/<topic>/algos/<name>.ts`:

   ```typescript
   import type { Algorithm } from "@/engine/types";

   export const run: Algorithm = function* myAlgo(input: unknown) {
     const arr = input as number[];
     yield {
       array: [...arr],
       highlights: {},
       explain: "Starting...",
       pcLine: 1,
     };
     // ... algorithm steps yielding Frame objects ...
     yield { array: [...arr], highlights: {}, explain: "Done!", pcLine: -1 };
   };
   ```

2. Add an `AlgoMeta` entry in `src/algorithms/<topic>/algos/index.ts` with: slug, title, topic, summary, pseudocode, complexity, about, pros/cons, code (JS/Python/Java/C++), codeLineMap, and `load: () => import("./<name>")`.

3. For **new topics**, also register in `src/engine/registry.ts` and add to the topic union in `src/types/index.ts`.

4. Add unit tests in `src/tests/unit/`. Use `testSortingAlgorithm` helper for sorting algorithms, or write manual frame checks for other categories.

5. Each yielded frame must include `array` (spread copy), `explain`, and `pcLine`. Use `highlights` (`compared`, `swapped`, `indices`, `pivot`) for visual feedback.

## Canvas / Rendering

- Keep React state minimal; draw to `<canvas>` inside `ArrayCanvas`.
- Use the `ArrayCanvasHandle` methods from `VisualizerPage` to trigger redraws on runner ticks.

## Tests

- Unit: `vitest run` for lib and hooks (151+ tests).
- E2E: run against `vite preview` (CI does this automatically).
- Avoid flakes (`await page.getByTestId(...).waitFor()`).

## Accessibility & i18n

- Keyboard reachable controls; visible focus rings.
- Use semantic roles (`role="slider"`, etc.) and ARIA attributes.
- Strings are centralized via i18next (`src/i18n/`); 5 languages supported.

## Performance

- Avoid unnecessary re-renders; prefer memoized selectors.
- Keep per-frame work in canvas only; no heavy allocations on each tick.

## Docs & ADRs

- Significant decisions → add an ADR in `docs/ADR/` (see template).
- High-level architecture → `docs/ARCHITECTURE.md`.

## Security

- Report vulnerabilities to **<security@algolens.app>**. Do **not** open public issues for sensitive reports.

## Releases

- Use Changesets:
  - `npx changeset` to propose a bump.
  - CI opens/updates a **Version Packages** PR.
  - Merging to `master` publishes to npm and creates the GitHub release.

Thanks for helping make AlgoLens better!
