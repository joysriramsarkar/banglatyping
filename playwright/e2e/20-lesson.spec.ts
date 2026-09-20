import { test, expect } from "@playwright/test";
import {
  expectLessonTypingInput,
  preparePage,
  pressBanglaWordChar,
  typeBanglaWordText,
  waitForLessonReady,
  withInsertedSpaces,
} from "./support";

test.describe("Curriculum lesson end-to-end flows", () => {
  test("guest can complete the Level 0 lesson with physical BanglaWord keys", async ({ page }) => {
    await preparePage(page);
    await page.goto("/dashboard/practice/lesson-0-1");

    await expect(page.getByText(/হাতের সঠিক পজিশন/i)).toBeVisible();
    await page.getByRole("button", { name: /পরবর্তী ধাপে যান/i }).first().click();
    await waitForLessonReady(page);

    const guidedItems = [
      "ক", " ", "ল", " ", "স", " ", "া", " ", "ক", "ল", " ", "স", "া",
      " ", "ড", "ফ", " ", "গ", "হ", " ", "জ", "ক", " ", "ল", "স", " ",
      "ক", " ", "স", " ", "ল", " ", "া", " ", "ড", " ", "ফ", " ",
    ];
    await typeBanglaWordText(page, guidedItems.join(""));

    await expect(page.getByText(/ধাপটি সফলভাবে সম্পন্ন হয়েছে/i)).toBeVisible();

    await page.getByRole("button", { name: /পরবর্তী ধাপে যান/i }).last().click();
    await waitForLessonReady(page);

    const masteryItems = [
      "ক", "ল", "স", "া", "ড", "ফ", "গ", "হ", "জ", "ক", "া", "ল", "স", "া",
      "ড", "ফ", "া", "গ", "জ", "ক", "ল", "া", "স", "ড", "ফ", "গ", "হ",
      "ক", "ল", "স", "া", "দ", "া", "ক", "া", "ল",
    ];

    await typeBanglaWordText(page, withInsertedSpaces(masteryItems, 3).join(""));

    await expect(page.getByText(/ধাপটি সফলভাবে সম্পন্ন হয়েছে/i)).toBeVisible();

    await page.getByRole("button", { name: /পরবর্তী ধাপে যান/i }).last().click();
    await expect(
      page.getByRole("heading", { name: /অভিনন্দন! পাঠ সম্পন্ন হয়েছে/i }),
    ).toBeVisible();

    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/dashboard\/practice\/lesson-1-1$/);
  });

  test("wrong physical key does not advance the target, and the correct key then advances", async ({ page }) => {
    await preparePage(page);
    await page.goto("/dashboard/practice/lesson-0-1");

    await page.getByRole("button", { name: /পরবর্তী ধাপে যান/i }).first().click();
    const input = await expectLessonTypingInput(page);

    await pressBanglaWordChar(page, "স");
    await expect(page.getByText(/অক্ষর\s+১\s*\/\s*৩৮/i)).toBeVisible();

    await pressBanglaWordChar(page, "ক");
    await expect(page.getByText(/অক্ষর\s+২\s*\/\s*৩৮/i)).toBeVisible();

    await expect(input).toBeAttached();
  });

  test("backspace removes a partial multi-key syllable before it is committed", async ({ page }) => {
    // lesson-1-1 is unlocked by seeding the prerequisite completion.
    await preparePage(page, { completedLessons: ["lesson-0-1"] });
    await page.goto("/dashboard/practice/lesson-1-1");

    await expect(page.getByText(/বাম হাতের হোম কী/i)).toBeVisible();
    await page.getByRole("button", { name: /অনুশীলন শুরু করুন/i }).click();
    await waitForLessonReady(page);

    // First four targets in HR-01 sec-1-1-2 are: া, স, ড, ফ.
    for (const char of ["া", "স", "ড", "ফ"]) {
      await pressBanglaWordChar(page, char);
    }

    // Fifth target is ফা. Type ফ partially, then undo it.
    await pressBanglaWordChar(page, "ফ");
    await page.keyboard.press("Backspace");

    // Now complete ফা. The next target is সা.
    await pressBanglaWordChar(page, "ফ");
    await pressBanglaWordChar(page, "া");

    await expect(page.getByText(/অক্ষর\s+৬\s*\/\s*\d+/)).toBeVisible();
  });

  test("future lesson section bypass is blocked", async ({ page }) => {
    test.fail(
      true,
      "Known defect: LessonPlayer currently lets users click future section pills.",
    );

    await preparePage(page, { completedLessons: ["lesson-0-1"] });
    await page.goto("/dashboard/practice/lesson-1-1");

    await expect(page.getByText(/বাম হাতের হোম কী/i)).toBeVisible();
    await page.getByRole("button", { name: /আইসোলেটেড প্যাটার্ন ড্রিল/i }).click();

    await expect(page.getByText(/বাম হাতের হোম কী/i)).toBeVisible();
  });
});
