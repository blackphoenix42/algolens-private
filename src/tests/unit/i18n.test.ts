// src/tests/unit/i18n.test.ts
import { describe, expect, it } from "vitest";

import en from "@/i18n/en/common.json";

/**
 * String-extraction guards: any user-facing string introduced through
 * the i18n layer must exist (at least) in the English bundle. These
 * tests are kept deliberately literal so PRs that move or rename keys
 * surface as test failures rather than runtime "missing key" warnings.
 */
describe("i18n English bundle", () => {
  const bundle = en as Record<string, unknown>;

  const get = (path: string): unknown =>
    path
      .split(".")
      .reduce<unknown>(
        (acc, key) =>
          acc && typeof acc === "object" && key in (acc as object)
            ? (acc as Record<string, unknown>)[key]
            : undefined,
        bundle
      );

  const requiredKeys = [
    "app.name",
    "navigation.home",
    "panels.advantages",
    "panels.disadvantages",
    "panels.about",
    "panels.code",
    "panels.pseudocode",
    "debugger.title",
    "debugger.breakpoints",
    "debugger.watch",
    "debugger.callStack",
    "debugger.noBreakpoints",
    "debugger.noWatch",
    "debugger.noCallStack",
    "authoring.title",
    "authoring.sourceCode",
    "authoring.input",
    "authoring.run",
    "authoring.ready",
    "authoring.framesEmitted",
    "authoring.parseError",
    "authoring.runtimeError",
  ];

  for (const key of requiredKeys) {
    it(`has \`${key}\``, () => {
      const v = get(key);
      expect(v).toBeDefined();
      expect(typeof v).toBe("string");
      expect((v as string).length).toBeGreaterThan(0);
    });
  }

  it("does not contain stray TODO markers", () => {
    const flat = JSON.stringify(bundle);
    expect(flat).not.toMatch(/TODO|FIXME|XXX/i);
  });
});
