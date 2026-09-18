import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('https://vitaharbor.vercel.app/?v=' + Date.now(), { waitUntil: 'networkidle' });
await page.waitForTimeout(3500);

const info = await page.evaluate(() => ({
  rows: document.querySelectorAll('li[id^="entry-"]').length,
  hasRcCars: document.body.innerText.includes('RC Cars'),
  indexed: (document.body.innerText.match(/\d+\s*INDEXED/i) || ['n/a'])[0],
  bg: getComputedStyle(document.body).backgroundColor,
  h1Color: getComputedStyle(document.querySelector('h1')).color,
  fixedBlue: [...document.querySelectorAll('*')].filter(el => {
    const s = getComputedStyle(el);
    return s.position === 'fixed' && s.backgroundColor === 'rgb(0, 210, 255)';
  }).length,
}));
console.log(JSON.stringify(info, null, 2));

await page.screenshot({ path: 'new-top.jpg', type: 'jpeg', quality: 70 });

await page.evaluate(() => document.getElementById('directory').scrollIntoView({ block: 'start' }));
await page.waitForTimeout(1000);
await page.screenshot({ path: 'new-list.jpg', type: 'jpeg', quality: 70 });
await browser.close();

