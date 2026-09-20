import { chromium } from 'playwright';

const url = process.argv[2] || 'https://vitaharbor.vercel.app/';
const viewports = [
  { name: 'iphone-se', w: 375, h: 667 },
  { name: 'iphone-12', w: 390, h: 844 },
  { name: 'pixel-7', w: 412, h: 915 },
  { name: 'tablet', w: 768, h: 1024 },
];

const browser = await chromium.launch();

for (const vp of viewports) {
  const page = await browser.newPage({
    viewport: { width: vp.w, height: vp.h },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  await page.goto(url + '?audit=' + Date.now(), { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  const report = await page.evaluate(() => {
    const docW = document.documentElement.clientWidth;
    const scrollW = document.documentElement.scrollWidth;
    const overflowers = [];
    const smallTargets = [];

    for (const el of document.querySelectorAll('body *')) {
      const s = getComputedStyle(el);
      if (s.display === 'none' || s.visibility === 'hidden' || s.position === 'fixed') continue;
      if (el.matches('.sr-only, [aria-hidden="true"]')) continue;
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;

      if (r.right > docW + 1 || r.left < -1) {
        const cls = (el.className || '').toString().slice(0, 60);
        if (overflowers.length < 12) {
          overflowers.push({ tag: el.tagName, cls, left: Math.round(r.left), right: Math.round(r.right) });
        }
      }

      const clickable = el.closest('button, a, input, select, [role="button"]');
      if (clickable === el) {
        if (r.height < 32 || r.width < 24) {
          const cls = (el.className || '').toString().slice(0, 50);
          if (smallTargets.length < 12) {
            smallTargets.push({ tag: el.tagName, cls, w: Math.round(r.width), h: Math.round(r.height) });
          }
        }
      }
    }

    const canvas = document.querySelector('canvas');
    const table = document.getElementById('directory');
    return {
      docWidth: docW,
      scrollWidth: scrollW,
      horizontalOverflow: scrollW > docW + 1,
      overflowers,
      smallTargets,
      canvas: canvas ? { w: Math.round(canvas.getBoundingClientRect().width), h: Math.round(canvas.getBoundingClientRect().height) } : null,
      tableWidth: table ? Math.round(table.getBoundingClientRect().width) : null,
      bodyFontSize: getComputedStyle(document.body).fontSize,
    };
  });

  console.log('==== ' + vp.name + ' (' + vp.w + 'x' + vp.h + ') ====');
  console.log(JSON.stringify(report, null, 1));

  await page.screenshot({ path: 'mobile-' + vp.name + '.jpg', type: 'jpeg', quality: 70, fullPage: false });
  await page.close();
}

await browser.close();
