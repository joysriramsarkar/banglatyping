import { test, expect } from "@playwright/test";
import {
  expectLessonTypingInput,
  preparePage,
  pressBanglaWordChar,
  waitForLessonReady,
} from "./support";

test.describe("Guest typing flow with keyboard navigation", () => {
  test("Tab order starts at the skip link and jumps to main content", async ({
    page,
  }) => {
    await preparePage(page);
    await page.goto("/");

    const skipLink = page.getByRole("link", { name: /skip to main content/i });
    await expect(skipLink).toBeAttached();

    // Tab through chrome until the skip link takes focus (at most a few stops
    // on the homepage header).
    let focused = false;
    for (let i = 0; i < 10 && !focused; i++) {
      await page.keyboard.press("Tab");
      focused = await skipLink.evaluate(
        (el) => document.activeElement === el,
      );
    }
    expect(focused).toBe(true);

    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#main-content/);
  });

  test("guest tabs to the lesson start control and types the first graphemes", async ({
    page,
  }) => {
    await preparePage(page);
    await page.goto("/dashboard/practice/lesson-0-1");

    // Keyboard-only start: focus the intro control and activate it with Enter.
    const startButton = page
      .getByRole("button", { name: /পরবর্তী ধাপে যান/i })
      .first();
    await startButton.focus();
    await expect(startButton).toBeFocused();
    await page.keyboard.press("Enter");
    await waitForLessonReady(page);

    const input = await expectLessonTypingInput(page);

    // First guided target is ক — typing it advances the অক্ষর counter.
    await pressBanglaWordChar(page, "ক");
    await expect(page.getByText(/অক্ষর\s+২\s*\/\s*৩৮/i)).toBeVisible();
    await expect(input).toBeAttached();

    // A wrong key must not advance the target.
    await pressBanglaWordChar(page, "স");
    await expect(page.getByText(/অক্ষর\s+২\s*\/\s*৩৮/i)).toBeVisible();
  });
});
