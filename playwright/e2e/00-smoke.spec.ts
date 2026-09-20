import { test, expect } from "@playwright/test";
import { preparePage } from "./support";

test.describe("Public navigation smoke", () => {
  test("home exposes the main learning and arcade entry points", async ({ page }) => {
    await preparePage(page);
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: /বাংলা টাইপিং মাস্টার ও স্পিড টেস্ট/i }),
    ).toBeVisible();

    await expect(page.getByRole("link", { name: "টাইপিং টেস্ট" })).toBeVisible();
    await expect(page.getByRole("link", { name: "অনুশীলন" })).toBeVisible();
    await expect(page.getByRole("link", { name: "শিখুন" })).toBeVisible();
    await expect(page.getByRole("link", { name: "গেম" })).toBeVisible();

    await page.getByRole("link", { name: "গেম" }).click();
    await expect(
      page.getByRole("heading", { name: /বাংলা টাইপিং আর্কেড/i }),
    ).toBeVisible();
  });

  test("login page offers guest practice without requiring an account", async ({ page }) => {
    await preparePage(page);
    await page.goto("/login");

    await expect(page.getByRole("heading", { name: "লগইন করুন" })).toBeVisible();

    await page.getByRole("link", { name: /গেস্ট হিসেবে অনুশীলন করুন/i }).click();
    await expect(page).toHaveURL(/\/dashboard\/lessons$/);
    await expect(
      page.getByRole("heading", { name: /টাইপিং পাঠক্রম ও দক্ষতা মানচিত্র/i }),
    ).toBeVisible();
  });
});
