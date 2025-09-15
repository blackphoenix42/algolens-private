import percySnapshot from "@percy/playwright";
import { test } from "@playwright/test";

test("Home snapshot", async ({ page }) => {
  await page.goto("/"); // Use relative URL
  await percySnapshot(page, "Home");
});
