import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('https://vitaharbor.vercel.app/?v=' + Date.now(), { waitUntil: 'networkidle' });
await page.waitForTimeout(3500);
const info = await page.evaluate(() => {
  const t = document.body.innerText;
  return {
    rows: document.querySelectorAll('li[id^="entry-"]').length,
    d2vita: t.includes('D2Vita'),
    rcCars: t.includes('RC Cars'),
    codZombies: t.includes('Call of Duty: Zombies'),
    indexed: (t.match(/\d+\s*INDEXED/i) || ['n/a'])[0],
    tickerHasD2: t.includes('D2Vita is here'),
  };
});
nodeReplWrite(info);
async function nodeReplWrite(x) {}
console.log(JSON.stringify(info, null, 2));
await page.screenshot({ path: 'scan-top.jpg', type: 'jpeg', quality: 70 });
await page.evaluate(() => window.scrollBy(0, 420));
await page.waitForTimeout(900);
await page.screenshot({ path: 'scan-mid.jpg', type: 'jpeg', quality: 70 });
await browser.close();

