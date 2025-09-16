// e2e/fixtures/test.ts
import { expect, test as base } from "@playwright/test";

type Fixtures = {
  /** Navigate to the app (defaults to "/"), with animations disabled & noisy requests blocked */
  gotoApp: (path?: string) => Promise<void>;
};

const test = base.extend<Fixtures>({
  // Rename second arg from `use` → `provide` to avoid react-hooks false positive
  gotoApp: async ({ page }, provide) => {
    // One-time route & CSS setup per test
    await page.route(
      /(googletagmanager|google-analytics|sentry|cdn\.jsdelivr|stats\.js|vitals)/,
      (route) => route.abort()
    );

    await page.addStyleTag({
      content: `
        * { animation-duration: 0ms !important; transition-duration: 0ms !important; caret-color: transparent !important; }
        html { scroll-behavior: auto !important; }
      `,
    });

    await provide(async (path = "/") => {
      // Use Playwright's baseURL which already handles GitHub Actions base path
      // Don't add additional base path logic here
      await page.goto(path);
      await page.waitForLoadState("networkidle");
    });
  },
});

test.use({
  baseURL: (() => {
    // Use same logic as playwright.config.ts
    const isGitHubActions = process.env.GITHUB_ACTIONS === "true";
    const repoName =
      process.env.GITHUB_REPOSITORY?.split("/")[1] || "algolens-private";
    const basePath = isGitHubActions ? `/${repoName}` : "";
    return process.env.PW_BASE_URL || `http://localhost:4173${basePath}`;
  })(),
});

export { expect, test };
