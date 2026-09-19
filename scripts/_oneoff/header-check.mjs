import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page.goto('https://vitaharbor.vercel.app/?h=' + Date.now(), { waitUntil: 'networkidle' });
await page.waitForTimeout(3000);

const info = await page.evaluate(() => {
  const header = document.querySelector('header nav div');
  const filters = [...document.querySelectorAll('#directory button')].map((b) => b.innerText.trim());
  return {
    headerBadge: header ? header.innerText.replace(/\n/g, ' | ') : 'none',
    filters: filters.slice(0, 8),
    rows: document.querySelectorAll('li[id^="entry-"]').length,
  };
});
console.log(JSON.stringify(info, null, 1));
await browser.close();

