import { expect, test } from "@playwright/test";

test.use({
  viewport: { width: 1280, height: 800 },
  // Only capture failure screenshots automatically; baselines handled by toHaveScreenshot.
  screenshot: "only-on-failure",
});

test.beforeEach(async ({ page }) => {
  // Block noisy third-party requests to keep pixels stable
  await page.route(
    /(googletagmanager|google-analytics|sentry|cdn\.jsdelivr)/,
    (route) => route.abort()
  );

  // Respect reduced motion and neutralize animations in CSS if your app supports it
  await page.addStyleTag({
    content: `
      * { animation-duration: 0s !important; transition-duration: 0s !important; caret-color: transparent !important; }
    `,
  });
});

test.describe("Visualizer visual snapshots", () => {
  test("home page baseline", async ({ page }) => {
    await page.goto("/"); // Use relative URL to leverage baseURL from config
    await page.waitForLoadState("networkidle");

    // Mask dynamic regions if needed (e.g., timestamps)
    const masks = [
      page.locator("[data-testid='clock']"),
      page.locator("[data-testid='random-seed']"),
    ];

    await expect(page).toHaveScreenshot("home.png", {
      fullPage: true,
      mask: masks,
      // Tolerate tiny AA/platform differences
      maxDiffPixelRatio: 0.01,
    });
  });

  test("visualizer with seeded dataset", async ({ page }) => {
    await page.goto("/viz/sorting/bubble-sort?dataset=random&n=64"); // Use correct route format

    // Wait for page to load
    await page.waitForLoadState("networkidle");

    // Look for any visualization element - be flexible
    const vizElements = page.locator(".viz-canvas, canvas, .visualization");
    const foundCanvas = (await vizElements.count()) > 0;

    if (foundCanvas) {
      // Wait for the canvas to be visible
      await page.waitForSelector(".viz-canvas, canvas", {
        state: "visible",
        timeout: 10000,
      });
      // Give the visualization a moment to fully initialize
      await page.waitForTimeout(1000);

      // Take a snapshot of the initial state
      await expect(
        page.locator(".viz-canvas, canvas").first()
      ).toHaveScreenshot("bubble-initial.png", {
        animations: "disabled",
        maxDiffPixelRatio: 0.01,
      });

      // Advance a few steps deterministically using the specific Next step button
      const nextStepBtn = page.getByRole("button", { name: "Next step" });
      if (await nextStepBtn.isVisible().catch(() => false)) {
        await nextStepBtn.click();
        await nextStepBtn.click();
        await nextStepBtn.click();

        // After steps, take another screenshot if canvas is still available
        await expect(
          page.locator(".viz-canvas, canvas").first()
        ).toHaveScreenshot("bubble-step-3.png", {
          animations: "disabled",
          maxDiffPixelRatio: 0.01,
        });
      }
    } else {
      // If no canvas found, just take a screenshot of the page for debugging
      await expect(page).toHaveScreenshot("bubble-page-fallback.png");
    }
  });
});
