# End-to-End Testing

This directory contains end-to-end (E2E) tests for the AlgoLens application using Playwright. These tests verify that the entire application works correctly from a user's perspective.

## 📁 Directory Structure

- **[tests/](tests/)** - Test files containing E2E test scenarios
- **[fixtures/](fixtures/)** - Test utilities, helpers, and reusable components
- **[**screenshots**/](__screenshots__)** - Visual regression test screenshots and comparisons
- **[analyze.mjs](analyze.mjs)** - Test result analysis and reporting script
- **[pa11y-ci.json](pa11y-ci.json)** - Accessibility testing configuration
- **[percy.yml](percy.yml)** - Percy visual testing configuration

## 🎯 Testing Strategy

### Test Categories

1. **Functional Tests** - Core application functionality
2. **Visual Regression Tests** - UI consistency and appearance
3. **Accessibility Tests** - WCAG compliance and screen reader support
4. **Performance Tests** - Page load times and rendering performance
5. **Cross-browser Tests** - Compatibility across different browsers

### Browser Coverage

- **Chromium** (Chrome, Edge)
- **Firefox**
- **WebKit** (Safari)
- **Mobile browsers** (iOS Safari, Chrome Mobile)

## 🚀 Running Tests

### Basic Commands

```bash
# Run all E2E tests
npm run test:e2e

# Run tests with UI mode (interactive)
npm run test:e2e:ui

# Run tests in debug mode
npm run test:e2e:debug

# Run tests against development server
npm run test:e2e:dev

# Generate and view test report
npm run e2e:report
```

### Specific Test Execution

```bash
# Run specific test file
npx playwright test tests/home.spec.ts

# Run tests with specific browser
npx playwright test --project=chromium

# Run tests in headed mode (visible browser)
npx playwright test --headed

# Run tests with specific tag
npx playwright test --grep "@smoke"
```

## 🔧 Configuration

### Playwright Configuration

Located in `../playwright.config.ts`:

- Browser settings and versions
- Test timeouts and retries
- Base URL configuration
- Test output directories

### Environment Variables

```bash
# Base URL for testing
PW_BASE_URL=http://localhost:5173

# Enable debug mode
PWDEBUG=1

# Headed mode
PWHEADED=1
```

## 📝 Writing Tests

### Basic Test Structure

```typescript
import { test, expect } from "@playwright/test";

test.describe("Algorithm Visualization", () => {
  test("should load sorting algorithm page", async ({ page }) => {
    await page.goto("/algorithms/sorting");

    // Wait for algorithm to load
    await page.waitForSelector('[data-testid="algorithm-canvas"]');

    // Verify page elements
    await expect(page.locator("h1")).toContainText("Sorting Algorithms");
    await expect(page.locator('[data-testid="play-button"]')).toBeVisible();
  });

  test("should play algorithm animation", async ({ page }) => {
    await page.goto("/algorithms/sorting/bubble-sort");

    // Start animation
    await page.click('[data-testid="play-button"]');

    // Wait for animation to complete
    await page.waitForSelector('[data-testid="animation-complete"]');

    // Verify final state
    await expect(page.locator('[data-testid="status"]')).toContainText(
      "Complete"
    );
  });
});
```

### Using Fixtures

```typescript
import { test as base } from "@playwright/test";
import { AlgorithmPage } from "./fixtures/algorithm-page";

// Extend base test with custom fixtures
const test = base.extend<{ algorithmPage: AlgorithmPage }>({
  algorithmPage: async ({ page }, use) => {
    const algorithmPage = new AlgorithmPage(page);
    await use(algorithmPage);
  },
});

test("should control algorithm playback", async ({ algorithmPage }) => {
  await algorithmPage.goto("bubble-sort");
  await algorithmPage.play();
  await algorithmPage.pause();
  await algorithmPage.step();
  await algorithmPage.expectStatus("Paused");
});
```

## 📸 Visual Testing

### Visual Regression Tests

```typescript
test("homepage visual appearance", async ({ page }) => {
  await page.goto("/");

  // Take full page screenshot
  await expect(page).toHaveScreenshot("homepage.png");

  // Take element screenshot
  await expect(page.locator(".hero-section")).toHaveScreenshot("hero.png");
});
```

### Percy Integration

Percy provides cloud-based visual testing:

```typescript
import { percySnapshot } from "@percy/playwright";

test("visual regression with Percy", async ({ page }) => {
  await page.goto("/algorithms/sorting");
  await percySnapshot(page, "Sorting Algorithms Page");
});
```

## ♿ Accessibility Testing

### Built-in Accessibility Checks

```typescript
import { injectAxe, checkA11y } from "axe-playwright";

test("accessibility compliance", async ({ page }) => {
  await page.goto("/");
  await injectAxe(page);
  await checkA11y(page);
});
```

### Pa11y Integration

Configured in `pa11y-ci.json`:

```json
{
  "defaults": {
    "timeout": 30000,
    "wait": 2000,
    "chromeLaunchConfig": {
      "args": ["--no-sandbox"]
    }
  },
  "urls": ["http://localhost:5173/", "http://localhost:5173/algorithms/sorting"]
}
```

## 🔍 Test Analysis

### Test Result Analysis

The `analyze.mjs` script provides:

- Test execution summaries
- Performance metrics
- Failure analysis
- Trend reporting

```bash
# Run analysis on test results
node e2e/analyze.mjs
```

### Performance Testing

```typescript
test("page performance", async ({ page }) => {
  // Start performance monitoring
  await page.addListener("response", (response) => {
    console.log(`${response.status()} ${response.url()}`);
  });

  const startTime = Date.now();
  await page.goto("/");

  // Wait for network idle
  await page.waitForLoadState("networkidle");
  const loadTime = Date.now() - startTime;

  expect(loadTime).toBeLessThan(3000); // 3 second max load time
});
```

## 🐛 Debugging Tests

### Debug Mode

```bash
# Run with debug mode
PWDEBUG=1 npx playwright test

# Debug specific test
npx playwright test tests/home.spec.ts --debug
```

### Screenshots and Videos

```typescript
test("debug with media", async ({ page }) => {
  // Take screenshot on failure
  await page.screenshot({ path: "debug-screenshot.png" });

  // Record video (configured in playwright.config.ts)
  // Videos automatically saved on failure
});
```

### Browser Developer Tools

```typescript
test("debug with devtools", async ({ page }) => {
  // Pause execution for manual debugging
  await page.pause();

  // Open browser devtools
  await page.context().newPage();
});
```

## 🔄 CI/CD Integration

### GitHub Actions

```yaml
- name: Run Playwright tests
  run: npx playwright test

- name: Upload test results
  uses: actions/upload-artifact@v3
  if: always()
  with:
    name: playwright-report
    path: playwright-report/
```

### Test Parallelization

```bash
# Run tests in parallel across workers
npx playwright test --workers=4

# Run tests in specific shard
npx playwright test --shard=1/3
```

## 📊 Best Practices

### Test Organization

- Group related tests in describe blocks
- Use descriptive test names
- Keep tests focused and atomic
- Avoid test interdependencies

### Data Management

- Use test-specific data
- Clean up after tests
- Use database seeding for consistent states
- Avoid hardcoded test data

### Maintenance

- Regular test review and updates
- Remove obsolete tests
- Update selectors when UI changes
- Monitor test execution times

## 🔗 Related Resources

- **Playwright Documentation**: [playwright.dev](https://playwright.dev)
- **Test Configuration**: `../playwright.config.ts`
- **CI Configuration**: `../.github/workflows/`
- **Source Components**: `../src/components/` for testable elements
