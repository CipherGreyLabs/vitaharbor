import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('https://vitaharbor.vercel.app/?ux2=' + Date.now(), { waitUntil: 'networkidle' });
await page.waitForTimeout(3500);

const shots = [
  ['ux-a', 0],
  ['ux-b', 1300],
  ['ux-c', 3900],
];

for (const [name, y] of shots) {
  await page.evaluate((top) => window.scrollTo(0, top), y);
  await page.waitForTimeout(900);
  await page.screenshot({ path: name + '.jpg', type: 'jpeg', quality: 62 });
}

await browser.close();

