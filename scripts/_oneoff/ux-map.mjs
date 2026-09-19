import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('https://vitaharbor.vercel.app/?ux=' + Date.now(), { waitUntil: 'networkidle' });
await page.waitForTimeout(3500);

const map = await page.evaluate(() => {
  const sections = [...document.querySelectorAll('main > section, main > div, header, footer')];
  const out = [];
  for (const el of sections) {
    const r = el.getBoundingClientRect();
    if (r.height < 20) continue;
    out.push({
      tag: el.tagName,
      id: el.id || '',
      label: (el.querySelector('h1, h2')?.innerText || el.className || '').toString().slice(0, 46),
      top: Math.round(r.top + window.scrollY),
      height: Math.round(r.height),
    });
  }
  return {
    pageHeight: document.body.scrollHeight,
    viewports: Math.round(document.body.scrollHeight / 900),
    sections: out,
    h1Size: getComputedStyle(document.querySelector('h1')).fontSize,
    bodyFont: getComputedStyle(document.body).fontFamily.split(',')[0],
  };
});

console.log(JSON.stringify(map, null, 1));

await page.screenshot({ path: 'ux-full.jpg', type: 'jpeg', quality: 55, fullPage: true });
await browser.close();

