import { chromium } from 'playwright';
const url = process.argv[2];
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(3500);

const canvas = await page.$('canvas');
if (canvas) {
  const box = await canvas.boundingBox();
  console.log('CANVAS BOX:', JSON.stringify(box));
  const el = await page.evaluateHandle(c => c.closest('div'), canvas);
  await el.asElement().screenshot({ path: 'shot-console.png' });
} else {
  console.log('NO CANVAS');
}
await browser.close();

