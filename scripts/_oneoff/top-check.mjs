import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('https://vitaharbor.vercel.app/?v=' + Date.now(), { waitUntil: 'networkidle' });
await page.waitForTimeout(3500);
const overlap = await page.evaluate(() => {
  const h1 = document.querySelector('h1');
  const p = h1 && h1.nextElementSibling;
  const c = document.querySelector('canvas');
  const r = (el) => el ? el.getBoundingClientRect() : null;
  return { h1: r(h1), tagline: r(p), canvas: r(c) };
});
console.log(JSON.stringify(overlap, null, 2));
await page.screenshot({ path: 'top-check.jpg', type: 'jpeg', quality: 68 });
await browser.close();

