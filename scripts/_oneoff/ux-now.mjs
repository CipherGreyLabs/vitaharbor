import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1100, height: 620 } });
await page.goto('https://vitaharbor.vercel.app/?s=' + Date.now(), { waitUntil: 'networkidle' });
await page.waitForTimeout(3200);
await page.evaluate(() => window.scrollTo(0, 980));
await page.waitForTimeout(900);
await page.screenshot({ path: 'ux-now.jpg', type: 'jpeg', quality: 38 });
await browser.close();

