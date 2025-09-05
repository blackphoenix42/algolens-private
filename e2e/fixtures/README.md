# Test Fixtures

This directory contains reusable test utilities, page object models, and helper functions for Playwright E2E tests.

## 📁 Contents

- **[test.ts](test.ts)** - Extended test fixture with custom functionality
- **[selectors.ts](selectors.ts)** - Centralized element selectors and test IDs

## 🎯 Purpose

Fixtures provide a way to:

- Share common setup code across tests
- Create reusable page object models
- Centralize selector definitions
- Extend Playwright's base functionality
- Maintain consistent test patterns

## 🔧 Test Fixture Extensions

### Custom Test Instance

```typescript
// test.ts example structure
import { test as base, expect } from "@playwright/test";
import { AlgorithmPage } from "./pages/algorithm-page";
import { NavigationHelper } from "./helpers/navigation";

// Define custom fixtures
type CustomFixtures = {
  algorithmPage: AlgorithmPage;
  navigation: NavigationHelper;
};

// Extend base test with custom fixtures
export const test = base.extend<CustomFixtures>({
  algorithmPage: async ({ page }, use) => {
    const algorithmPage = new AlgorithmPage(page);
    await use(algorithmPage);
  },

  navigation: async ({ page }, use) => {
    const navigation = new NavigationHelper(page);
    await use(navigation);
  },
});

export { expect };
```

### Page Object Models

```typescript
// Example: AlgorithmPage class
export class AlgorithmPage {
  constructor(private page: Page) {}

  // Navigation methods
  async goto(algorithmType: string) {
    await this.page.goto(`/algorithms/${algorithmType}`);
    await this.page.waitForLoadState("networkidle");
  }

  // Interaction methods
  async play() {
    await this.page.click('[data-testid="play-button"]');
  }

  async pause() {
    await this.page.click('[data-testid="pause-button"]');
  }

  async step() {
    await this.page.click('[data-testid="step-button"]');
  }

  async reset() {
    await this.page.click('[data-testid="reset-button"]');
  }

  // Assertion helpers
  async expectStatus(status: string) {
    await expect(this.page.locator('[data-testid="status"]')).toContainText(
      status
    );
  }

  async expectElementCount(count: number) {
    await expect(
      this.page.locator('[data-testid="array-element"]')
    ).toHaveCount(count);
  }

  // Utility methods
  async waitForAnimationComplete() {
    await this.page.waitForSelector('[data-testid="animation-complete"]', {
      timeout: 10000,
    });
  }

  async getArrayValues(): Promise<number[]> {
    const elements = await this.page
      .locator('[data-testid="array-element"]')
      .all();
    const values = await Promise.all(
      elements.map((el) => el.getAttribute("data-value"))
    );
    return values.map(Number);
  }
}
```

## 🎛️ Selector Management

### Centralized Selectors

```typescript
// selectors.ts example structure
export const selectors = {
  // Navigation
  nav: {
    home: '[data-testid="nav-home"]',
    algorithms: '[data-testid="nav-algorithms"]',
    about: '[data-testid="nav-about"]',
  },

  // Algorithm controls
  controls: {
    play: '[data-testid="play-button"]',
    pause: '[data-testid="pause-button"]',
    step: '[data-testid="step-button"]',
    reset: '[data-testid="reset-button"]',
    speed: '[data-testid="speed-slider"]',
  },

  // Algorithm visualization
  visualization: {
    canvas: '[data-testid="algorithm-canvas"]',
    arrayElement: '[data-testid="array-element"]',
    status: '[data-testid="status"]',
    stepCounter: '[data-testid="step-counter"]',
  },

  // Algorithm settings
  settings: {
    arraySize: '[data-testid="array-size-input"]',
    algorithm: '[data-testid="algorithm-selector"]',
    colorScheme: '[data-testid="color-scheme-selector"]',
  },

  // Code panels
  code: {
    pseudocode: '[data-testid="pseudocode-panel"]',
    typescript: '[data-testid="typescript-panel"]',
    python: '[data-testid="python-panel"]',
    currentLine: '[data-testid="current-line"]',
  },

  // Common UI elements
  ui: {
    modal: '[data-testid="modal"]',
    toast: '[data-testid="toast"]',
    loading: '[data-testid="loading"]',
    error: '[data-testid="error-message"]',
  },
} as const;

// Export specific selector groups
export const { nav, controls, visualization, settings, code, ui } = selectors;
```

### Selector Best Practices

```typescript
// Type-safe selector usage
export type SelectorPath = keyof typeof selectors;

export class SelectorHelper {
  static get(path: string): string {
    const keys = path.split(".");
    let selector: any = selectors;

    for (const key of keys) {
      selector = selector[key];
      if (!selector) {
        throw new Error(`Selector not found: ${path}`);
      }
    }

    return selector;
  }

  static waitFor(page: Page, path: string, options?: { timeout?: number }) {
    return page.waitForSelector(this.get(path), options);
  }
}
```

## 🛠️ Helper Functions

### Common Test Utilities

```typescript
// helpers/test-utils.ts
export class TestUtils {
  static async login(page: Page, username: string, password: string) {
    await page.fill('[data-testid="username"]', username);
    await page.fill('[data-testid="password"]', password);
    await page.click('[data-testid="login-button"]');
    await page.waitForURL("/dashboard");
  }

  static async waitForNetworkIdle(page: Page, timeout = 5000) {
    await page.waitForLoadState("networkidle", { timeout });
  }

  static async takeFullPageScreenshot(page: Page, name: string) {
    await page.screenshot({
      path: `test-results/screenshots/${name}.png`,
      fullPage: true,
    });
  }

  static async mockApiResponse(page: Page, url: string, response: any) {
    await page.route(url, (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(response),
      });
    });
  }
}
```

### Performance Helpers

```typescript
// helpers/performance.ts
export class PerformanceHelper {
  static async measureLoadTime(page: Page, url: string): Promise<number> {
    const startTime = Date.now();
    await page.goto(url);
    await page.waitForLoadState("networkidle");
    return Date.now() - startTime;
  }

  static async getWebVitals(page: Page) {
    return await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const vitals = entries.reduce(
            (acc, entry) => {
              acc[entry.name] = entry.value;
              return acc;
            },
            {} as Record<string, number>
          );
          resolve(vitals);
        }).observe({ entryTypes: ["measure"] });
      });
    });
  }
}
```

## 🎨 Visual Testing Helpers

```typescript
// helpers/visual.ts
export class VisualHelper {
  static async compareScreenshot(
    page: Page,
    elementSelector: string,
    name: string,
    options?: { threshold?: number }
  ) {
    const element = page.locator(elementSelector);
    await expect(element).toHaveScreenshot(`${name}.png`, {
      threshold: options?.threshold || 0.2,
    });
  }

  static async waitForAnimation(page: Page, selector: string) {
    await page.waitForFunction((sel) => {
      const element = document.querySelector(sel);
      return (
        element && getComputedStyle(element).animationPlayState !== "running"
      );
    }, selector);
  }

  static async hideElementsForScreenshot(page: Page, selectors: string[]) {
    for (const selector of selectors) {
      await page.addStyleTag({
        content: `${selector} { visibility: hidden !important; }`,
      });
    }
  }
}
```

## 🔍 Data Helpers

```typescript
// helpers/data.ts
export class DataHelper {
  static generateRandomArray(size: number, min = 1, max = 100): number[] {
    return Array.from(
      { length: size },
      () => Math.floor(Math.random() * (max - min + 1)) + min
    );
  }

  static createSortedArray(size: number): number[] {
    return Array.from({ length: size }, (_, i) => i + 1);
  }

  static createReverseSortedArray(size: number): number[] {
    return Array.from({ length: size }, (_, i) => size - i);
  }

  static createAlmostSortedArray(size: number, swaps = 2): number[] {
    const array = this.createSortedArray(size);
    for (let i = 0; i < swaps; i++) {
      const idx1 = Math.floor(Math.random() * size);
      const idx2 = Math.floor(Math.random() * size);
      [array[idx1], array[idx2]] = [array[idx2], array[idx1]];
    }
    return array;
  }
}
```

## 📝 Usage Examples

### Using Fixtures in Tests

```typescript
import { test, expect } from "./fixtures/test";

test.describe("Algorithm Visualization", () => {
  test("should control playback using fixtures", async ({ algorithmPage }) => {
    await algorithmPage.goto("bubble-sort");
    await algorithmPage.play();
    await algorithmPage.waitForAnimationComplete();
    await algorithmPage.expectStatus("Complete");
  });

  test("should interact with elements using selectors", async ({ page }) => {
    await page.goto("/algorithms/sorting");
    await page.click(controls.play);
    await page.waitForSelector(visualization.status);
    await expect(page.locator(visualization.status)).toContainText("Running");
  });
});
```

### Complex Test Scenarios

```typescript
test("should handle algorithm comparison", async ({ page }) => {
  // Setup test data
  const testArray = DataHelper.generateRandomArray(20);

  // Navigate and configure
  await page.goto("/algorithms/sorting/comparison");
  await page.fill(settings.arraySize, "20");

  // Mock API for consistent data
  await TestUtils.mockApiResponse(page, "/api/generate-array", testArray);

  // Run test scenario
  await page.click(controls.play);
  await VisualHelper.waitForAnimation(page, visualization.canvas);

  // Verify results
  await VisualHelper.compareScreenshot(
    page,
    visualization.canvas,
    "comparison-result"
  );
});
```

## 🔄 Maintenance

### Best Practices

- Keep fixtures focused and single-purpose
- Update selectors when UI changes
- Remove unused fixtures and selectors
- Document complex helper functions
- Use TypeScript for better maintainability

### Regular Tasks

- Review and update page object models
- Optimize slow helper functions
- Validate selector accuracy
- Update documentation and examples
- Test fixture compatibility with Playwright updates

## 🔗 Related Resources

- **Test Files**: `../tests/` - Test files using these fixtures
- **Playwright Config**: `../../playwright.config.ts` - Base test configuration
- **Source Components**: `../../src/components/` - Components being tested
- **Test Documentation**: `../README.md` - Main E2E testing guide
