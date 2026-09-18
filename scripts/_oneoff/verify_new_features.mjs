import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('https://vitaharbor.vercel.app/?v=' + Date.now(), { waitUntil: 'networkidle' });
await page.waitForTimeout(3000);

const checks = await page.evaluate(() => {
  const filterTexts = [...document.querySelectorAll('#directory button')].map(b => b.innerText.trim());
  const prevBtn = document.querySelector('button[aria-label= Previous project]');
  const nextBtn = document.querySelector('button[aria-label=Next project]');
  return {
    filterTexts: filterTexts.slice(0, 8),
    hasPrevBtn: !!prevBtn,
    hasNextBtn: !!nextBtn,
    rows: document.querySelectorAll('li[id^=entry-]').length
  };
});
console.log(JSON.stringify(checks, null, 2));

await page.screenshot({ path: 'updated-stage.jpg', type: 'jpeg', quality: 72 });

await page.evaluate(() => document.getElementById('directory').scrollIntoView({ block: 'start' }));
await page.waitForTimeout(1000);
await page.screenshot({ path: 'updated-directory.jpg', type: 'jpeg', quality: 72 });
await browser.close();
