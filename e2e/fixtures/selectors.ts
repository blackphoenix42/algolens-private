// e2e/fixtures/selectors.ts
export const S = {
  // Use the actual canvas class name from ArrayCanvas component
  canvas: ".viz-canvas, canvas",

  // Transport controls (prefer explicit testids, else aria-labels/text)
  play: "[data-testid='play'], [aria-label='Play'], button:has-text('Play')",
  step: "[data-testid='step'], [aria-label='Step'], button:has-text('Step')",

  // Algorithm cards on homepage - look for any link that goes to /viz route
  toVisualizer:
    "a[href*='/viz/'], [data-testid='algorithm-card'] a, [data-tour='algorithm-card'] a",
} as const;
