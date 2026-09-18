import { chromium } from 'playwright';

const url = process.argv[2] || 'https://vitaharbor.vercel.app/';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

const errors = [];
page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
page.on('console', m => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text()); });

await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(2500);

const report = await page.evaluate(() => {
  const rows = document.querySelectorAll('li[id^="entry-"]');
  const dir = document.getElementById('directory');
  const root = document.getElementById('root');
  return {
    rootChildren: root ? root.children.length : -1,
    directoryExists: !!dir,
    directoryVisible: dir ? getComputedStyle(dir).display !== 'none' : false,
    rowCount: rows.length,
    firstRowVisible: rows.length ? getComputedStyle(rows[0]).opacity : 'n/a',
    bodyCursor: getComputedStyle(document.body).cursor,
    canvasCount: document.querySelectorAll('canvas').length,
    rootTextSample: root ? (root.innerText || '').slice(0, 200) : 'NO ROOT',
  };
});

console.log(JSON.stringify(report, null, 2));
console.log('ERRORS:', errors.slice(0, 8).join(' | ') || 'none');

await page.screenshot({ path: 'verify-shot.png', fullPage: false });
await browser.close();

