import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('https://vitaharbor.vercel.app/?v=' + Date.now(), { waitUntil: 'networkidle' });
await page.waitForTimeout(4000);
const info = await page.evaluate(() => {
  const t = document.body.innerText;
  const row = document.getElementById('entry-d2vita');
  return {
    rows: document.querySelectorAll('li[id^="entry-"]').length,
    d2RowExists: !!row,
    d2RowText: row ? row.innerText.replace(/\n+/g, ' / ').slice(0, 140) : 'none',
    hasDiablo: t.includes('Diablo II'),
    hasRc: t.includes('RC Cars'),
    hasCod: t.includes('Call of Duty'),
    indexed: (t.match(/\d+\s*INDEXED/i) || ['n/a'])[0],
  };
});
console.log(JSON.stringify(info, null, 2));
await page.evaluate(() => document.getElementById('entry-d2vita').scrollIntoView({ block: 'center' }));
await page.waitForTimeout(900);
await page.screenshot({ path: 'scan-list.jpg', type: 'jpeg', quality: 70 });
await browser.close();

