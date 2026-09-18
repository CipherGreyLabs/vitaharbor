import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
await page.goto('https://vitaharbor.vercel.app/?t=' + Date.now(), { waitUntil: 'networkidle' });
await page.waitForTimeout(3000);

const info = await page.evaluate(() => {
  const first = document.querySelector('li[id^="entry-"]');
  const cs = first ? getComputedStyle(first) : null;
  const rowText = first ? first.innerText.replace(/\n+/g, ' / ').slice(0, 120) : 'none';
  const box = first ? first.getBoundingClientRect() : null;
  return {
    rowText,
    opacity: cs ? cs.opacity : null,
    color: cs ? cs.color : null,
    bg: cs ? cs.backgroundColor : null,
    rowTopInPage: box ? Math.round(box.top + window.scrollY) : null,
    rowWidth: box ? Math.round(box.width) : null,
    rowHeight: box ? Math.round(box.height) : null,
    pageHeight: document.body.scrollHeight,
  };
});
console.log(JSON.stringify(info, null, 2));

await page.evaluate(() => document.getElementById('directory').scrollIntoView());
await page.waitForTimeout(1000);
await page.screenshot({ path: 'list-now.png' });
await browser.close();

