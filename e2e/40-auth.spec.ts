import { test, expect } from "@playwright/test";
import { preparePage } from "./support";

test.describe("Authentication smoke", () => {
  test("login form renders and rejects an empty submission", async ({ page }) => {
    await preparePage(page);
    await page.goto("/login");

    await expect(page.getByLabel("ইমেল")).toBeVisible();
    await expect(page.getByLabel("পাসওয়ার্ড")).toBeVisible();

    // HTML required validation prevents submission; URL therefore stays on login.
    await page.getByRole("button", { name: "লগইন করুন", exact: true }).click();
    await expect(page).toHaveURL(/\/login$/);
  });

  test("real credential login is available as an opt-in E2E check", async ({ page }) => {
    test.skip(
      !process.env.E2E_TEST_EMAIL || !process.env.E2E_TEST_PASSWORD,
      "Set E2E_TEST_EMAIL and E2E_TEST_PASSWORD to enable the live Supabase login check.",
    );

    await preparePage(page);
    await page.goto("/login");

    await page.getByLabel("ইমেল").fill(process.env.E2E_TEST_EMAIL!);
    await page.getByLabel("পাসওয়ার্ড").fill(process.env.E2E_TEST_PASSWORD!);
    await page.getByRole("button", { name: "লগইন করুন", exact: true }).click();

    await expect(page).toHaveURL(/\/dashboard$/);
  });
});
