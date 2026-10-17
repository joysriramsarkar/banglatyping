import { test, expect, Page } from "@playwright/test";
import { preparePage, waitForLessonReady } from "./support";

// NOTE: @axe-core/playwright is intentionally NOT a dependency (avoids
// lockfile churn), so this spec performs the same baseline checks with pure
// Playwright assertions: document lang, heading order, image alts, button
// names, visible focus, live regions, and keyboard-only lesson start.

async function expectNoSkippedHeadingLevels(page: Page) {
  const violations = await page.evaluate(() => {
    const headings = Array.from(
      document.querySelectorAll("h1, h2, h3, h4, h5, h6"),
    );
    const bad: string[] = [];
    let prev = 0;
    for (const h of headings) {
      const level = Number(h.tagName.slice(1));
      if (prev > 0 && level > prev + 1) {
        bad.push(`${h.tagName}: ${(h.textContent ?? "").slice(0, 60)}`);
      }
      prev = level;
    }
    return bad;
  });
  expect(violations).toEqual([]);
}

test.describe("Accessibility smoke (pure Playwright, no axe dep)", () => {
  test("home: lang, single h1, heading order, alts, button names, focus ring", async ({
    page,
  }) => {
    await preparePage(page);
    await page.goto("/");

    // html lang must be Bengali.
    expect(await page.evaluate(() => document.documentElement.lang)).toBe(
      "bn",
    );

    // Exactly one h1, no skipped heading levels.
    expect(await page.locator("h1").count()).toBe(1);
    await expectNoSkippedHeadingLevels(page);

    // Every image needs alt (empty alt is fine for decorative).
    const imagesWithoutAlt = await page.locator("img:not([alt])").count();
    expect(imagesWithoutAlt).toBe(0);

    // Every button must expose an accessible name.
    const unnamedButtons = await page.evaluate(() => {
      const bad: string[] = [];
      for (const b of Array.from(document.querySelectorAll("button"))) {
        const name = (b.getAttribute("aria-label") ?? b.textContent ?? "").trim();
        if (!name && !b.getAttribute("aria-labelledby")) {
          bad.push(b.outerHTML.slice(0, 120));
        }
      }
      return bad;
    });
    expect(unnamedButtons).toEqual([]);

    // Keyboard focus must be visible: Tab to the skip link and assert the
    // global :focus-visible floor (3px outline from globals.css) applies.
    const skipLink = page.getByRole("link", { name: /skip to main content/i });
    await expect(skipLink).toBeAttached();
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press("Tab");
      if (await skipLink.evaluate((el) => document.activeElement === el)) break;
    }
    await expect(skipLink).toBeFocused();
    const outlineWidth = await skipLink.evaluate(
      (el) => getComputedStyle(el).outlineWidth,
    );
    expect(outlineWidth).not.toBe("0px");
  });

  test("learn hub: lang, heading order, and keyboard-operable topic cards", async ({
    page,
  }) => {
    await preparePage(page);
    await page.goto("/learn");

    expect(await page.evaluate(() => document.documentElement.lang)).toBe(
      "bn",
    );
    expect(await page.locator("h1").count()).toBe(1);
    await expectNoSkippedHeadingLevels(page);

    // Keyboard-only navigation: focus the first topic card link and open it
    // with Enter (no mouse).
    const firstTopic = page.locator('a[href^="/learn/"]').first();
    await firstTopic.focus();
    await expect(firstTopic).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/learn\/.+/, { timeout: 25_000 });
    expect(await page.locator("h1").count()).toBe(1);
  });

  test("lesson player exposes live progress/result regions for screen readers", async ({
    page,
  }) => {
    await preparePage(page);
    await page.goto("/dashboard/practice/lesson-0-1");

    // Keyboard-only lesson start (intro control via Enter, no click).
    const startButton = page
      .getByRole("button", { name: /পরবর্তী ধাপে যান/i })
      .first();
    await startButton.focus();
    await expect(startButton).toBeFocused();
    await page.keyboard.press("Enter");
    await waitForLessonReady(page);

    // Typing progress must be announced: LessonPlayer renders an sr-only
    // role=status drill counter, and the shared word display carries
    // aria-live="polite".
    const liveRegions = page.locator(
      '[aria-live], [role="status"], [role="alert"]',
    );
    expect(await liveRegions.count()).toBeGreaterThan(0);
  });
});
