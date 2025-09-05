# E2E Test Cases

This directory contains the actual test files that verify AlgoLens functionality through automated browser testing.

## 📁 Contents

- **[home.spec.ts](home.spec.ts)** - Homepage functionality and navigation tests
- **[percy.spec.ts](percy.spec.ts)** - Visual regression tests using Percy
- **[visual-regression.spec.ts](visual-regression.spec.ts)** - Screenshot-based visual testing

## 🎯 Test Categories

### Homepage Tests (home.spec.ts)

Tests for the main landing page and initial user experience:

- Page loading and rendering
- Navigation functionality
- Hero section interactions
- Feature showcase elements
- Responsive design behavior
- Accessibility compliance

### Visual Regression Tests

- **Percy Tests**: Cloud-based visual testing across browsers
- **Local Screenshots**: Playwright-based screenshot comparisons
- **Component Visuals**: Individual component appearance testing
- **Cross-browser Consistency**: Visual parity across browsers

## 📝 Test Structure

### Basic Test Organization

```typescript
import { test, expect } from "../fixtures/test";

test.describe("Homepage Functionality", () => {
  test.beforeEach(async ({ page }) => {
    // Common setup for all tests in this group
    await page.goto("/");
  });

  test("should load homepage successfully", async ({ page }) => {
    // Test implementation
  });

  test("should navigate to algorithms page", async ({ page }) => {
    // Test implementation
  });
});
```

### Test Tags and Grouping

```typescript
// Smoke tests - critical functionality
test("homepage loads @smoke", async ({ page }) => {
  // Implementation
});

// Visual tests - appearance and layout
test("homepage visual appearance @visual", async ({ page }) => {
  // Implementation
});

// Accessibility tests - WCAG compliance
test("homepage accessibility @a11y", async ({ page }) => {
  // Implementation
});

// Performance tests - loading and rendering speed
test("homepage performance @perf", async ({ page }) => {
  // Implementation
});
```

## 🏠 Homepage Test Examples

### Navigation Testing

```typescript
test.describe("Navigation", () => {
  test("should navigate to algorithms section", async ({ page }) => {
    await page.goto("/");

    // Click navigation link
    await page.click('[data-testid="nav-algorithms"]');

    // Verify navigation
    await expect(page).toHaveURL(/\/algorithms/);
    await expect(page.locator("h1")).toContainText("Algorithms");
  });

  test("should handle responsive navigation", async ({ page }) => {
    // Test mobile navigation
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    // Open mobile menu
    await page.click('[data-testid="mobile-menu-button"]');
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();

    // Test menu item
    await page.click('[data-testid="mobile-nav-algorithms"]');
    await expect(page).toHaveURL(/\/algorithms/);
  });
});
```

### Interactive Elements

```typescript
test.describe("Interactive Elements", () => {
  test("should interact with algorithm preview", async ({ page }) => {
    await page.goto("/");

    // Find and interact with preview
    const preview = page.locator('[data-testid="algorithm-preview"]');
    await preview.hover();

    // Verify hover effects
    await expect(preview).toHaveClass(/hovered/);

    // Click to view details
    await preview.click();
    await expect(page).toHaveURL(/\/algorithms\/.*detail/);
  });

  test("should handle theme switching", async ({ page }) => {
    await page.goto("/");

    // Toggle theme
    await page.click('[data-testid="theme-toggle"]');

    // Verify dark theme applied
    await expect(page.locator("html")).toHaveClass(/dark/);

    // Toggle back
    await page.click('[data-testid="theme-toggle"]');
    await expect(page.locator("html")).not.toHaveClass(/dark/);
  });
});
```

## 📸 Visual Testing Examples

### Percy Visual Tests

```typescript
import { percySnapshot } from "@percy/playwright";

test.describe("Visual Regression with Percy", () => {
  test("homepage visual appearance", async ({ page }) => {
    await page.goto("/");

    // Wait for content to load
    await page.waitForSelector('[data-testid="hero-section"]');

    // Take Percy snapshot
    await percySnapshot(page, "Homepage - Desktop");
  });

  test("responsive homepage views", async ({ page }) => {
    await page.goto("/");

    // Desktop view
    await page.setViewportSize({ width: 1920, height: 1080 });
    await percySnapshot(page, "Homepage - Desktop Wide");

    // Tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await percySnapshot(page, "Homepage - Tablet");

    // Mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await percySnapshot(page, "Homepage - Mobile");
  });
});
```

### Local Screenshot Testing

```typescript
test.describe("Screenshot Comparisons", () => {
  test("homepage sections visual consistency", async ({ page }) => {
    await page.goto("/");

    // Hero section
    await expect(page.locator('[data-testid="hero-section"]')).toHaveScreenshot(
      "hero-section.png"
    );

    // Features section
    await expect(
      page.locator('[data-testid="features-section"]')
    ).toHaveScreenshot("features-section.png");

    // Footer
    await expect(page.locator("footer")).toHaveScreenshot("footer.png");
  });

  test("algorithm preview cards", async ({ page }) => {
    await page.goto("/");

    // Individual algorithm cards
    const cards = page.locator('[data-testid="algorithm-card"]');
    const count = await cards.count();

    for (let i = 0; i < count; i++) {
      await expect(cards.nth(i)).toHaveScreenshot(`algorithm-card-${i}.png`);
    }
  });
});
```

## 🎭 Cross-Browser Testing

### Browser-Specific Tests

```typescript
test.describe("Cross-Browser Compatibility", () => {
  ["chromium", "firefox", "webkit"].forEach((browserName) => {
    test(`homepage functionality in ${browserName}`, async ({ page }) => {
      // Browser-specific test logic
      await page.goto("/");

      // Test core functionality
      await expect(page.locator("h1")).toBeVisible();
      await page.click('[data-testid="nav-algorithms"]');
      await expect(page).toHaveURL(/\/algorithms/);
    });
  });
});
```

## ♿ Accessibility Testing

### A11y Test Examples

```typescript
import { injectAxe, checkA11y } from "axe-playwright";

test.describe("Accessibility", () => {
  test("homepage accessibility compliance", async ({ page }) => {
    await page.goto("/");
    await injectAxe(page);

    // Check full page accessibility
    await checkA11y(page);
  });

  test("keyboard navigation", async ({ page }) => {
    await page.goto("/");

    // Test tab navigation
    await page.keyboard.press("Tab");
    await expect(page.locator(":focus")).toBeVisible();

    // Navigate through interactive elements
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press("Tab");
      const focused = page.locator(":focus");
      await expect(focused).toBeVisible();
    }
  });

  test("screen reader support", async ({ page }) => {
    await page.goto("/");

    // Check ARIA labels and roles
    await expect(page.locator('[role="main"]')).toBeVisible();
    await expect(page.locator("[aria-label]")).toHaveCount.greaterThan(0);

    // Check heading hierarchy
    const headings = page.locator("h1, h2, h3, h4, h5, h6");
    await expect(headings.first()).toHaveText(/AlgoLens/);
  });
});
```

## ⚡ Performance Testing

### Load Time Testing

```typescript
test.describe("Performance", () => {
  test("homepage load performance", async ({ page }) => {
    const startTime = Date.now();

    await page.goto("/", { waitUntil: "networkidle" });

    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000); // 3 second max
  });

  test("largest contentful paint", async ({ page }) => {
    await page.goto("/");

    const lcp = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          resolve(lastEntry.startTime);
        }).observe({ entryTypes: ["largest-contentful-paint"] });
      });
    });

    expect(lcp).toBeLessThan(2500); // LCP under 2.5s
  });
});
```

## 🔧 Test Configuration

### Test-Specific Settings

```typescript
// Slow test configuration
test.describe.configure({ mode: "serial", timeout: 60000 });

// Retry configuration for flaky tests
test.describe("Flaky Tests", () => {
  test.describe.configure({ retries: 3 });

  test("potentially flaky interaction", async ({ page }) => {
    // Test implementation
  });
});
```

### Conditional Tests

```typescript
test.describe("Feature-Specific Tests", () => {
  test.skip(
    ({ browserName }) => browserName === "webkit",
    "Safari not supported"
  );

  test("browser-specific feature", async ({ page }) => {
    // Test that only runs on supported browsers
  });
});
```

## 📊 Test Data Management

### Test Data Setup

```typescript
test.describe("Data-Driven Tests", () => {
  const testCases = [
    { algorithm: "bubble-sort", expectedSteps: 100 },
    { algorithm: "quick-sort", expectedSteps: 50 },
    { algorithm: "merge-sort", expectedSteps: 75 },
  ];

  testCases.forEach(({ algorithm, expectedSteps }) => {
    test(`${algorithm} performance`, async ({ page }) => {
      await page.goto(`/algorithms/sorting/${algorithm}`);
      // Test implementation using test data
    });
  });
});
```

## 🔄 Maintenance Best Practices

### Test Organization

- Group related tests in describe blocks
- Use clear, descriptive test names
- Keep tests focused and atomic
- Avoid test interdependencies

### Performance Optimization

- Use `test.beforeEach` for common setup
- Minimize page navigations
- Use appropriate wait strategies
- Clean up resources after tests

### Regular Tasks

- Update tests when UI changes
- Review and remove obsolete tests
- Optimize slow-running tests
- Update test data and expectations

## 🔗 Related Resources

- **Fixtures**: `../fixtures/` - Reusable test utilities and page objects
- **Screenshots**: `../__screenshots__/` - Visual regression reference images
- **Configuration**: `../../playwright.config.ts` - Test runner configuration
- **Source Code**: `../../src/` - Application code being tested
