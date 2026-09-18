import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
await page.goto('https://vitaharbor.vercel.app/?t=' + Date.now(), { waitUntil: 'networkidle' });
await page.waitForTimeout(3000);

const info = await page.evaluate(() => {
  const sec = document.getElementById('directory');
  const row = document.querySelector('li[id^="entry-"]');
  return {
    sectionOpacity: sec ? getComputedStyle(sec).opacity : 'n/a',
    sectionDataReveal: sec ? sec.getAttribute('data-reveal') : 'n/a',
    rowCount: document.querySelectorAll('li[id^="entry-"]').length,
    fixedBlue: [...document.querySelectorAll('*')].filter(el => {
      const s = getComputedStyle(el);
      return s.position === 'fixed' && s.backgroundColor === 'rgb(0, 210, 255)';
    }).length,
  };
});
console.log(JSON.stringify(info, null, 2));

await page.evaluate(() => document.getElementById('directory').scrollIntoView({ block: 'start' }));
await page.waitForTimeout(1200);
await page.screenshot({ path: 'final-list.png' });
await browser.close();

