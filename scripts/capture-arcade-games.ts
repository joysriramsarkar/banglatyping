import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 920 } });
  const page = await context.newPage();

  const brainDir = 'C:/Users/joysr/.gemini/antigravity-ide/brain/b5bda058-3d48-4d6f-9f7b-890b36c3f608';

  console.log('1. Navigating to /game (Arcade Hub)...');
  await page.goto('http://localhost:3000/game', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Capture Arcade Hub with Settings button and Layout Banner
  await page.screenshot({ path: `${brainDir}/arcade_hub_main.png`, fullPage: false });
  console.log('Captured arcade_hub_main.png');

  // 2. Open Settings Panel
  console.log('2. Opening Settings Panel...');
  const settingsBtn = page.locator('button:has-text("সেটিংস ও লেআউট")').first();
  await settingsBtn.click();
  await page.waitForTimeout(1000);

  await page.screenshot({ path: `${brainDir}/arcade_settings_panel.png`, fullPage: false });
  console.log('Captured arcade_settings_panel.png');

  // Return to Hub
  const backToHubBtn = page.locator('button:has-text("আর্কেড মেন্যু")');
  await backToHubBtn.click();
  await page.waitForTimeout(800);

  // 3. Open Game 1: Falling Words (Enlarged downwards)
  console.log('3. Opening Falling Words (Enlarged downwards)...');
  const fallingPlayBtn = page.locator('button:has-text("খেলুন")').nth(0);
  await fallingPlayBtn.click();
  await page.waitForTimeout(2000);

  await page.screenshot({ path: `${brainDir}/arcade_falling_words.png`, fullPage: false });
  console.log('Captured arcade_falling_words.png');

  // 4. Return to Hub and open Game 2: Space Defender (Enlarged downwards)
  console.log('4. Opening Space Defender (Enlarged downwards)...');
  const backBtn1 = page.locator('button:has-text("আর্কেড মেন্যু")');
  await backBtn1.click();
  await page.waitForTimeout(800);

  const spacePlayBtn = page.locator('button:has-text("খেলুন")').nth(1);
  await spacePlayBtn.click();
  await page.waitForTimeout(2000);

  await page.screenshot({ path: `${brainDir}/arcade_space_defender.png`, fullPage: false });
  console.log('Captured arcade_space_defender.png');

  // 5. Return to Hub and open Game 3: Speed Racer (Enlarged track with clean text)
  console.log('5. Opening Speed Racer (Enlarged track & clean text)...');
  const backBtn2 = page.locator('button:has-text("আর্কেড মেন্যু")');
  await backBtn2.click();
  await page.waitForTimeout(800);

  const racerPlayBtn = page.locator('button:has-text("খেলুন")').nth(2);
  await racerPlayBtn.click();
  await page.waitForTimeout(1500);

  await page.screenshot({ path: `${brainDir}/arcade_speed_racer.png`, fullPage: false });
  console.log('Captured arcade_speed_racer.png');

  await browser.close();
  console.log('Arcade verification and screenshot capture completed successfully!');
}

main().catch(err => {
  console.error('Capture error:', err);
  process.exit(1);
});
