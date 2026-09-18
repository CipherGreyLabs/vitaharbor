import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
});

await page.goto('https://vitaharbor.vercel.app/?m=' + Date.now(), { waitUntil: 'networkidle' });
await page.waitForTimeout(3000);

const measure = await page.evaluate(() => {
  const out = [];
  const selectors = [
    ['header nav a', 'header nav link'],
    ['button[title="Previous project"]', 'console prev'],
    ['button[title="Next project"]', 'console next'],
    ['#directory button', 'filter pill'],
    ['#directory input', 'search input'],
    ['#directory select', 'sort select'],
    ['#directory li[id^="entry-"] [role="button"]', 'table row'],
  ];
  for (const [sel, label] of selectors) {
    const els = [...document.querySelectorAll(sel)];
    if (els.length === 0) { out.push({ label, count: 0 }); continue; }
    const r = els[0].getBoundingClientRect();
    out.push({ label, count: els.length, w: Math.round(r.width), h: Math.round(r.height) });
  }
  return out;
});
console.log(JSON.stringify(measure, null, 1));

await page.evaluate(() => document.getElementById('directory')?.scrollIntoView({ block: 'start' }));
await page.waitForTimeout(900);
await page.screenshot({ path: 'mobile-directory.jpg', type: 'jpeg', quality: 72 });

await browser.close();

