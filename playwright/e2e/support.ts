import { expect, Page } from "@playwright/test";

export const CURRICULUM_STORAGE_KEY = "banglatyping_curriculum_state";
export const LAYOUT_STORAGE_KEY = "banglatyping_active_layout";

type CurriculumState = {
  completedLessons: Record<
    string,
    {
      lessonId: string;
      completed: boolean;
      mastered: boolean;
      bestAccuracy: number;
      bestWpm: number;
      bestGpm: number;
      timesCompleted: number;
      lastAttemptAt: string;
    }
  >;
  currentLessonId: string;
  unlockedLevel: number;
};

const BANGLAWORD_KEYS: Record<string, string> = {
  "া": "KeyA",
  "স": "KeyS",
  "ড": "KeyD",
  "ফ": "KeyF",
  "গ": "KeyG",
  "জ": "KeyJ",
  "ক": "KeyK",
  "ল": "KeyL",
  "দ": "KeyV",
  "ত": "KeyX",
  "হ": "Shift+KeyH",
  "ব": "KeyB",
  "ন": "KeyN",
  "ম": "KeyM",
  "র": "KeyR",
  "য": "KeyY",
  "্": "KeyH",
  "ি": "KeyI",
  "ী": "Shift+KeyI",
  "ু": "KeyU",
  "ূ": "Shift+KeyU",
  "ে": "KeyE",
  "ৈ": "Shift+KeyE",
  "ো": "KeyO",
  "ৌ": "Shift+KeyO",
  "ৃ": "Backslash",
  "ঁ": "Shift+KeyQ",
  "ং": "Shift+KeyM",
  "ঃ": "Shift+KeyW",
  "।": "Period",
  " ": "Space",
};

export function emptyCurriculumState(): CurriculumState {
  return {
    completedLessons: {},
    currentLessonId: "lesson-0-1",
    unlockedLevel: 0,
  };
}

export function stateWithCompletedLessons(ids: string[]): CurriculumState {
  const now = new Date().toISOString();
  const state = emptyCurriculumState();

  for (const id of ids) {
    state.completedLessons[id] = {
      lessonId: id,
      completed: true,
      mastered: true,
      bestAccuracy: 100,
      bestWpm: 30,
      bestGpm: 120,
      timesCompleted: 1,
      lastAttemptAt: now,
    };
  }

  state.currentLessonId = ids.length ? ids[ids.length - 1] : "lesson-0-1";
  state.unlockedLevel = ids.some((id) => id.startsWith("lesson-1-")) ? 1 : 0;
  return state;
}

export async function preparePage(
  page: Page,
  options: { completedLessons?: string[]; layout?: string } = {},
) {
  const state = stateWithCompletedLessons(options.completedLessons ?? []);

  await page.addInitScript(
    ({ curriculumKey, layoutKey, curriculumState, layout }) => {
      localStorage.removeItem(curriculumKey);
      localStorage.removeItem(layoutKey);
      localStorage.setItem(curriculumKey, JSON.stringify(curriculumState));
      if (layout) localStorage.setItem(layoutKey, layout);
    },
    {
      curriculumKey: CURRICULUM_STORAGE_KEY,
      layoutKey: LAYOUT_STORAGE_KEY,
      curriculumState: state,
      layout: options.layout ?? "banglaword",
    },
  );
}

export async function readLocalStorage(page: Page, key: string) {
  return page.evaluate((storageKey) => localStorage.getItem(storageKey), key);
}

export async function pressBanglaWordChar(page: Page, char: string) {
  const key = BANGLAWORD_KEYS[char];
  if (!key) {
    throw new Error(`No BanglaWord E2E key mapping for ${JSON.stringify(char)}`);
  }
  await page.keyboard.press(key);
}

export async function typeBanglaWordText(page: Page, text: string) {
  for (const char of text) {
    await pressBanglaWordChar(page, char);
  }
}

export function withInsertedSpaces(items: string[], interval = 3): string[] {
  const result: string[] = [];
  let sinceSpace = 0;

  for (const item of items) {
    result.push(item);
    sinceSpace += 1;

    if (sinceSpace >= interval && item !== " ") {
      result.push(" ");
      sinceSpace = 0;
    }
  }

  return result;
}

export async function expectLessonTypingInput(page: Page) {
  const input = page.locator('input[type="text"][autocomplete="off"]').first();
  await expect(input).toBeAttached();
  return input;
}

export async function waitForLessonReady(page: Page) {
  await expect(page.getByText(/অক্ষর\s+১\s*\/\s*\d+/)).toBeVisible();
  await expectLessonTypingInput(page);
}
