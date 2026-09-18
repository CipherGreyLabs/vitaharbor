import { chromium } from 'playwright';

const url = process.argv[2];
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(2500);

await page.screenshot({ path: 'shot-top.png' });

const dir = await page.$('#directory');
if (dir) {
  await dir.scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);
  await page.screenshot({ path: 'shot-list.png' });
}

const info = await page.evaluate(() => {
  const rows = [...document.querySelectorAll('li[id^="entry-"]')];
  return {
    rows: rows.length,
    firstRowText: rows[0] ? rows[0].innerText.slice(0, 80) : 'none',
    navText: [...document.querySelectorAll('header a, nav a')].map(a => a.textContent.trim()).join(' | '),
    heading: document.querySelector('h1') ? document.querySelector('h1').innerText : 'none',
  };
});
console.log(JSON.stringify(info, null, 2));
await browser.close();

