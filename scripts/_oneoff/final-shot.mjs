import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 700 } });
await page.goto('https://vitaharbor.vercel.app/?t=' + Date.now(), { waitUntil: 'networkidle' });
await page.waitForTimeout(2500);
await page.evaluate(() => document.getElementById('directory').scrollIntoView({ block: 'start' }));
await page.waitForTimeout(1000);
await page.screenshot({ path: 'final-list.jpg', type: 'jpeg', quality: 65 });
await browser.close();

