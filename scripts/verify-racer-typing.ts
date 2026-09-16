import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 920 } });
  await page.goto('http://localhost:3000/game', { waitUntil: 'networkidle' });

  // Open Speed Racer
  const racerPlayBtn = page.locator('button:has-text("খেলুন")').nth(2);
  await racerPlayBtn.click();
  await page.waitForTimeout(1000);

  // Focus body to ensure input is active
  await page.click('body');

  // Type matching sentence prefix
  await page.keyboard.type('জ্ঞানহীন মানুষ ');
  await page.waitForTimeout(500);

  const brainDir = 'C:/Users/joysr/.gemini/antigravity-ide/brain/b5bda058-3d48-4d6f-9f7b-890b36c3f608';
  await page.screenshot({ path: `${brainDir}/racer_typing_clean.png` });
  console.log('Successfully captured racer_typing_clean.png');

  await browser.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
