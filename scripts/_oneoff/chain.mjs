import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
await page.goto('https://vitaharbor.vercel.app/?t=' + Date.now(), { waitUntil: 'networkidle' });
await page.waitForTimeout(3000);

const out = await page.evaluate(() => {
  const row = document.querySelector('li[id^="entry-"]');
  const chain = [];
  let el = row;
  while (el && el !== document.documentElement) {
    const s = getComputedStyle(el);
    chain.push({
      tag: el.tagName,
      cls: (el.className || '').toString().slice(0, 70),
      opacity: s.opacity,
      visibility: s.visibility,
      display: s.display,
      transform: s.transform === 'none' ? 'none' : 'set',
      dataReveal: el.getAttribute('data-reveal'),
    });
    el = el.parentElement;
  }
  return chain;
});
console.log(JSON.stringify(out, null, 2));
await browser.close();

