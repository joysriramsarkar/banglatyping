import { test, expect } from "@playwright/test";
import { LAYOUT_STORAGE_KEY, preparePage, readLocalStorage } from "./support";

test.describe("Keyboard layout selection", () => {
  test.beforeEach(async ({ page }) => {
    await preparePage(page);
    await page.goto("/layouts");
  });

  test("switches to Probhat and keeps the choice after reload", async ({ page }) => {
    await page.getByRole("heading", { name: "প্রভাত (Probhat)", exact: true }).click();

    await expect.poll(() => readLocalStorage(page, LAYOUT_STORAGE_KEY)).toBe("probhat");
    await page.reload();

    await expect(
      page.getByText(/লাইভ কীবোর্ড প্রিভিউ:\s*প্রভাত/i),
    ).toBeVisible();

    await page.goto("/game");
    await expect(
      page.getByText(/সক্রিয় কীবোর্ড লেআউট:/i).locator(".."),
    ).toContainText("প্রভাত");
  });

  test("can cycle through all supported layout values", async ({ page }) => {
    const layouts = [
      ["লিপিঘর বাংলাওয়ার্ড (BanglaWord)", "banglaword"],
      ["ক্ষিপ্র (Khipro)", "khipro"],
      ["প্রভাত (Probhat)", "probhat"],
      ["বিজয় ক্লাসিক (Bijoy Classic)", "bijoy"],
      ["অভ্র ফোনেটিক (Avro Phonetic)", "avro"],
      ["ইউনিজয় (Unijoy)", "unijoy"],
    ] as const;

    for (const [label, value] of layouts) {
      await page.getByRole("heading", { name: label, exact: true }).click();
      await expect.poll(() => readLocalStorage(page, LAYOUT_STORAGE_KEY)).toBe(value);
    }
  });
});
