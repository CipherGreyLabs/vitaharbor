import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
await page.goto('https://vitaharbor.vercel.app/?ux4=' + Date.now(), { waitUntil: 'networkidle' });
await page.waitForTimeout(3000);
await page.evaluate(() => window.scrollTo(0, 3850));
await page.waitForTimeout(900);
await page.screenshot({ path: 'ux-bottom.jpg', type: 'jpeg', quality: 50 });
await browser.close();

