/**
 * Grapheme visual contracts in a real browser (PixelPerfect spec §16.3).
 *
 * JSDOM cannot prove shaping safety, so this spec runs the production
 * renderer in Chromium and asserts the structural guarantees pixel-perfection
 * rests on:
 * - one intact text run per grapheme (no per-codepoint spans),
 * - identical font/size/line-height/letter-spacing on base and overlay,
 * - overlay box aligned with the base box (no double-glyph drift),
 * - sim-box presence exactly where the resolved plan says so,
 * - font engine ready before any visual assertion.
 *
 * Full-page screenshots are attached as artifacts for human review; strict
 * pixel baselines are intentionally NOT committed (font rasterization differs
 * per OS/runner — spec §16.3).
 */

import { test, expect } from "@playwright/test";

test.describe("grapheme visual contracts", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/grapheme-lab");
    await page.getByTestId("gv-fixture").first().waitFor();
    const fontsStatus = await page.evaluate(() =>
      document.fonts.ready.then(() => document.fonts.status),
    );
    expect(fontsStatus).toBe("loaded");
  });

  test("every cell keeps one intact text run", async ({ page }) => {
    const cells = page.getByTestId("gv-cell");
    const count = await cells.count();
    expect(count).toBeGreaterThan(40);

    for (let i = 0; i < count; i++) {
      const cell = cells.nth(i);
      const grapheme = (await cell.getAttribute("data-grapheme")) ?? "";
      if (!grapheme) continue;
      // The intact cluster text must appear as one run (base), never chopped
      // into lone halant/kar child spans.
      const base = cell.locator('[data-part="base"]');
      await expect(base).toHaveText(grapheme, { useInnerText: true });
      const loneMarks = await cell
        .locator("span")
        .evaluateAll((spans) =>
          spans.filter((s) => s.textContent === "্" || s.textContent === "া").length,
        );
      expect(loneMarks).toBe(0);
    }
  });

  test("overlay never drifts from its base (no double glyph)", async ({ page }) => {
    const overlays = page.locator('[data-part="overlay"]');
    const count = await overlays.count();
    expect(count).toBeGreaterThan(5);

    for (let i = 0; i < count; i++) {
      const overlay = overlays.nth(i);
      const cell = overlay.locator('xpath=ancestor::*[@data-testid="gv-cell"]');
      const base = cell.locator('[data-part="base"]');

      const sameFont = await overlay.evaluate((el, baseEl) => {
        const a = getComputedStyle(el);
        const b = getComputedStyle(baseEl as Element);
        return (
          a.fontFamily === b.fontFamily &&
          a.fontSize === b.fontSize &&
          a.lineHeight === b.lineHeight &&
          a.letterSpacing === b.letterSpacing &&
          a.fontWeight === b.fontWeight
        );
      }, await base.elementHandle());
      expect(sameFont).toBe(true);

      const baseBox = await base.boundingBox();
      const overlayBox = await overlay.boundingBox();
      expect(baseBox).not.toBeNull();
      expect(overlayBox).not.toBeNull();
      for (const key of ["x", "y", "width", "height"] as const) {
        expect(Math.abs(baseBox![key] - overlayBox![key])).toBeLessThanOrEqual(1.5);
      }
    }
  });

  test("simulation card appears exactly where the plan says so", async ({ page }) => {
    const simFixtures = page.locator(
      '[data-testid="gv-fixture"][data-strategy="simulation"], [data-testid="gv-fixture"][data-strategy="safe-fallback"]',
    );
    const simCount = await simFixtures.count();
    expect(simCount).toBeGreaterThan(3);
    for (let i = 0; i < simCount; i++) {
      await expect(
        simFixtures.nth(i).getByLabel("যুক্তাক্ষর সিমুলেশন স্ক্রিন"),
      ).toBeVisible();
    }

    const clipFixtures = page.locator(
      '[data-testid="gv-fixture"][data-strategy="heuristic-clip"]',
    );
    expect(await clipFixtures.count()).toBeGreaterThan(3);
    for (let i = 0; i < (await clipFixtures.count()); i++) {
      await expect(
        clipFixtures.nth(i).getByLabel("যুক্তাক্ষর সিমুলেশন স্ক্রিন"),
      ).toHaveCount(0);
    }
  });

  test("dark mode keeps the contracts", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.reload();
    await page.getByTestId("gv-fixture").first().waitFor();
    const overlays = page.locator('[data-part="overlay"]');
    const count = await overlays.count();
    expect(count).toBeGreaterThan(5);
    for (let i = 0; i < Math.min(count, 10); i++) {
      const overlay = overlays.nth(i);
      const cell = overlay.locator('xpath=ancestor::*[@data-testid="gv-cell"]');
      const base = cell.locator('[data-part="base"]');
      const baseBox = await base.boundingBox();
      const overlayBox = await overlay.boundingBox();
      expect(baseBox).not.toBeNull();
      expect(overlayBox).not.toBeNull();
      expect(Math.abs(baseBox!.x - overlayBox!.x)).toBeLessThanOrEqual(1.5);
      expect(Math.abs(baseBox!.width - overlayBox!.width)).toBeLessThanOrEqual(1.5);
    }
  });

  test("attach review screenshots (artifact, not pixel gate)", async ({ page }, testInfo) => {
    await testInfo.attach("grapheme-lab-light", {
      body: await page.screenshot({ fullPage: true }),
      contentType: "image/png",
    });
    await page.emulateMedia({ colorScheme: "dark" });
    await page.reload();
    await page.getByTestId("gv-fixture").first().waitFor();
    await testInfo.attach("grapheme-lab-dark", {
      body: await page.screenshot({ fullPage: true }),
      contentType: "image/png",
    });
  });
});
