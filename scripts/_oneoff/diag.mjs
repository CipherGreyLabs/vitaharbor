import { chromium, firefox } from 'playwright';

const url = 'https://vitaharbor.vercel.app/?diag=' + Date.now();

for (const [name, engine] of [['chromium', chromium], ['firefox', firefox]]) {
  let browser;
  try { browser = await engine.launch(); }
  catch (e) { console.log(name.toUpperCase() + ': engine not available - ' + e.message.split('\n')[0]); continue; }

  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = [];
  page.on('pageerror', e => errs.push(e.message));
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  const info = await page.evaluate(() => {
    const rows = [...document.querySelectorAll('li[id^="entry-"]')];
    const dir = document.getElementById('directory');
    const fixed = [...document.querySelectorAll('*')].filter(el => {
      const s = getComputedStyle(el);
      return s.position === 'fixed' && s.display !== 'none' && s.visibility !== 'hidden';
    }).map(el => {
      const r = el.getBoundingClientRect();
      return el.tagName + '.' + (el.className || '').toString().slice(0, 60) + ' [' + Math.round(r.width) + 'x' + Math.round(r.height) + '] bg=' + getComputedStyle(el).backgroundColor;
    });
    return {
      rowCount: rows.length,
      directoryFound: !!dir,
      directoryHeight: dir ? Math.round(dir.getBoundingClientRect().height) : 0,
      bodyCursor: getComputedStyle(document.body).cursor,
      fixedElements: fixed,
      hasBlueDotAnywhere: [...document.querySelectorAll('*')].some(el => (el.className || '').toString().includes('cursor')),
    };
  });

  console.log('==== ' + name.toUpperCase() + ' ====');
  console.log(JSON.stringify(info, null, 2));
  console.log('errors:', errs.slice(0, 5).join(' | ') || 'none');

  if (info.directoryFound) {
    await page.evaluate(() => document.getElementById('directory').scrollIntoView());
    await page.waitForTimeout(1200);
    await page.screenshot({ path: 'diag-' + name + '-list.png' });
  }
  await browser.close();
}

