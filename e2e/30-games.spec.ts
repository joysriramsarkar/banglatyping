import { test, expect } from "@playwright/test";
import { preparePage } from "./support";

test.describe("Typing arcade end-to-end smoke", () => {
  test.beforeEach(async ({ page }) => {
    await preparePage(page);
    await page.goto("/game");
    await expect(
      page.getByRole("heading", { name: /বাংলা টাইপিং আর্কেড/i }),
    ).toBeVisible();
  });

  test("opens Falling Words and exposes the active typing control", async ({ page }) => {
    await page.getByRole("button", { name: "খেলুন" }).nth(0).click();

    await expect(
      page.getByText(/ঝরন্ত শব্দ \(Falling Meteors\)/i),
    ).toBeVisible();
    await expect(page.getByPlaceholder("শব্দ টাইপ করুন...")).toBeVisible();

    await page.getByRole("button", { name: /আর্কেড মেন্যু/i }).click();
    await expect(
      page.getByRole("heading", { name: /বাংলা টাইপিং আর্কেড/i }),
    ).toBeVisible();
  });

  test("opens Space Defender and exposes the target input", async ({ page }) => {
    await page.getByRole("button", { name: "খেলুন" }).nth(1).click();

    await expect(
      page.getByText(/শব্দ শিকারী \(Space Defender\)/i),
    ).toBeVisible();
    await expect(
      page.getByPlaceholder(/শত্রু জাহাজ লক করে টাইপ করুন/i),
    ).toBeVisible();
  });

  test("opens Speed Racer and accepts the first sentence prefix", async ({ page }) => {
    await page.getByRole("button", { name: "খেলুন" }).nth(2).click();

    await expect(
      page.getByText(/টাইপ দৌড় \(Speed Racer\)/i),
    ).toBeVisible();

    // The racer intentionally captures keyboard input through an invisible input.
    // Send real keyboard events rather than locator.fill(), so this tests the
    // same browser event path a user uses.
    await page.keyboard.type("জ্ঞান");

    await expect(page.getByText(/গতি:/i).first().locator("..")).toContainText("WPM");
    await expect(page.getByText(/রেস টেক্সট/i)).toBeVisible();
  });

  test("Falling Words and Space Defender expose a reset path", async ({ page }) => {
    const games = [
      {
        index: 0,
        heading: /ঝরন্ত শব্দ \(Falling Meteors\)/i,
        resetTitle: "নতুন করে শুরু",
      },
      {
        index: 1,
        heading: /শব্দ শিকারী \(Space Defender\)/i,
        resetTitle: "নতুন করে শুরু",
      },
    ];

    for (const game of games) {
      await page.goto("/game");
      await page.getByRole("button", { name: "খেলুন" }).nth(game.index).click();

      await expect(page.getByText(game.heading)).toBeVisible();
      await expect(page.getByTitle(game.resetTitle)).toBeVisible();
    }
  });
});
