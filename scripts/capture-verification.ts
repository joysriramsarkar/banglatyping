import { chromium } from 'playwright';

const ITEM_KEYS: Record<string, string[]> = {
  'া': ['KeyA'],
  'স': ['KeyS'],
  'ড': ['KeyD'],
  'ফ': ['KeyF'],
  'ফা': ['KeyF', 'KeyA'],
  'সা': ['KeyS', 'KeyA'],
  'ডা': ['KeyD', 'KeyA'],
  'সফ': ['KeyS', 'KeyF'],
  'ফদ': ['KeyF', 'KeyV'],
  'সাদা': ['KeyS', 'KeyA', 'KeyV', 'KeyA'],
  'ফাস': ['KeyF', 'KeyA', 'KeyS'],
  'দাফ': ['KeyV', 'KeyA', 'KeyF'],
  'সাফ': ['KeyS', 'KeyA', 'KeyF'],
  'দাদা': ['KeyV', 'KeyA', 'KeyV', 'KeyA'],
  'ফালা': ['KeyF', 'KeyA', 'KeyL', 'KeyA'],
  'দাদ': ['KeyV', 'KeyA', 'KeyV'],
  'ফাদ': ['KeyF', 'KeyA', 'KeyV'],
  'সাদ': ['KeyS', 'KeyA', 'KeyV'],
};

async function main() {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  const page = await context.newPage();

  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));

  const brainDir = 'C:/Users/joysr/.gemini/antigravity-ide/brain/b5bda058-3d48-4d6f-9f7b-890b36c3f608';

  console.log('Navigating to lesson-1-1...');
  await page.goto('http://localhost:3000/dashboard/practice/lesson-1-1', { waitUntil: 'networkidle' });

  // 1. Advance to section 3 (Mastery drill)
  const sec3Pill = page.locator('button:has-text("HR-01 মাস্টারি টেস্ট")').first();
  if (await sec3Pill.isVisible()) {
    await sec3Pill.click();
    await page.waitForTimeout(500);
  }

  // Ensure focus is on page/input
  await page.click('body');
  await page.waitForTimeout(200);

  const items = [
    'া', 'স', 'ড', 'ফ', 'ফা', 'সা', 'ডা', 'সফ', 'ফদ', 'সাদা',
    'ফাস', 'দাফ', 'সাফ', 'দাদা', 'ফালা', 'দাদ', 'ফাদ', 'সাদ',
    'ফা', 'সা', 'ডা', 'ফা', 'সা', 'ডা', 'ফাস', 'সাদা', 'দাফ',
    'া', 'স', 'ড'
  ];

  console.log('Typing through all 30 items...');
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const keyCodes = ITEM_KEYS[item] || [];
    for (const code of keyCodes) {
      await page.keyboard.press(code);
      await page.waitForTimeout(30);
    }
    await page.waitForTimeout(30);
  }

  // Wait for section passed banner to appear
  await page.waitForSelector('text=ধাপটি সফলভাবে সম্পন্ন হয়েছে', { timeout: 5000 });
  console.log('Section passed banner appeared! Clicking "পরবর্তী ধাপে যান"...');

  const advanceBtn = page.locator('button:has-text("পরবর্তী ধাপে যান")').first();
  await advanceBtn.click();
  await page.waitForTimeout(1000);

  // Check for Lesson completion card
  const finishHeading = page.locator('text=অভিনন্দন! পাঠ সম্পন্ন হয়েছে');
  const isFinished = await finishHeading.isVisible();
  console.log('Is lesson finished visible?', isFinished);

  if (isFinished) {
    // 2. Capture completion screen showing "পরবর্তী লেসন" button with Enter badge
    await page.screenshot({ path: `${brainDir}/curriculum_lesson_completion.png`, fullPage: false });
    console.log('Captured curriculum_lesson_completion.png');

    // 3. Press Enter key on completion screen
    console.log('Pressing Enter key on completion screen to advance to next lesson...');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1500);

    console.log('Current URL after Enter:', page.url());
    // 4. Capture next lesson screen (lesson-1-2)
    await page.screenshot({ path: `${brainDir}/curriculum_next_lesson.png`, fullPage: false });
    console.log('Captured curriculum_next_lesson.png');
  } else {
    await page.screenshot({ path: `${brainDir}/curriculum_after_click.png`, fullPage: false });
    console.log('Captured curriculum_after_click.png');
  }

  await browser.close();
}

main().catch(err => {
  console.error('Capture error:', err);
  process.exit(1);
});
