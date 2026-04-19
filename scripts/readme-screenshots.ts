import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const OUT_DIR = resolve(process.cwd(), 'public/readme');
const URL = 'https://nim-kaleb.vercel.app';

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  console.log(`[screenshots] navigating to ${URL}`);
  await page.goto(URL, { waitUntil: 'networkidle', timeout: 30_000 });

  // let boot/typewriter sequence finish
  await page.waitForTimeout(6_000);

  const heroPath = resolve(OUT_DIR, 'hero.png');
  await page.screenshot({ path: heroPath, fullPage: false });
  console.log(`[screenshots] wrote ${heroPath}`);

  // try to trigger connecting state (menu option 1)
  try {
    await page.keyboard.type('1', { delay: 80 });
    await page.keyboard.press('Enter');
    await page.waitForTimeout(2_000);
    const connectingPath = resolve(OUT_DIR, 'connecting.png');
    await page.screenshot({ path: connectingPath, fullPage: false });
    console.log(`[screenshots] wrote ${connectingPath}`);
  } catch (err) {
    console.warn('[screenshots] skipped connecting shot:', (err as Error).message);
  }

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
