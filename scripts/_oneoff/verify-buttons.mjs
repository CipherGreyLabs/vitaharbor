import { chromium } from 'playwright';

const base = 'https://vitaharbor.vercel.app';
const html = await (await fetch(base + '/?v=' + Date.now())).text();
const main = (html.match(/\/assets\/(index-[A-Za-z0-9_-]+\.js)/) || [])[1];
const mainJs = await (await fetch(base + '/assets/' + main)).text();
const scene = (mainJs.match(/VitaConsoleScene-[A-Za-z0-9_-]+\.js/) || [])[0];
const js = await (await fetch(base + '/assets/' + scene)).text();
console.log('scene chunk:', scene);
console.log('pressTravel marker:', js.includes('pressTravel'));
console.log('pressBaseZ marker:', js.includes('pressBaseZ'));
console.log('intersectObjects:', js.includes('intersectObjects'));
console.log('ps colors:', ['00ff66','ff3333','3399ff','ff3399'].every(c => js.includes(c)));

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(base + '/?v=' + Date.now(), { waitUntil: 'networkidle' });
await page.waitForTimeout(3500);

const box = await page.evaluate(() => {
  const c = document.querySelector('canvas');
  if (!c) return null;
  const r = c.getBoundingClientRect();
  return { w: Math.round(r.width), h: Math.round(r.height), top: Math.round(r.top) };
});
console.log('canvas size on screen:', JSON.stringify(box));

await page.evaluate(() => window.scrollTo(0, 260));
await page.waitForTimeout(1200);
await page.screenshot({ path: 'vita-size.jpg', type: 'jpeg', quality: 68 });
await browser.close();

