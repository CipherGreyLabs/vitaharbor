import { chromium } from 'playwright';

function parseRgb(str) {
  const m = str.match(/rgba?\(([^)]+)\)/);
  if (!m) return null;
  const p = m[1].split(',').map((v) => parseFloat(v));
  return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
}

function lum({ r, g, b }) {
  const f = (v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

function ratio(a, b) {
  const l1 = lum(a), l2 = lum(b);
  const hi = Math.max(l1, l2), lo = Math.min(l1, l2);
  return (hi + 0.05) / (lo + 0.05);
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('https://vitaharbor.vercel.app/?c=' + Date.now(), { waitUntil: 'networkidle' });
await page.waitForTimeout(3500);

const samples = await page.evaluate(() => {
  const out = [];
  const seen = new Set();
  for (const el of document.querySelectorAll('body *')) {
    const direct = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 2);
    if (!direct) continue;
    const s = getComputedStyle(el);
    if (s.display === 'none' || s.visibility === 'hidden' || parseFloat(s.opacity) < 0.5) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) continue;

    let bg = 'rgba(0, 0, 0, 0)';
    let node = el;
    while (node && node !== document.documentElement) {
      const bs = getComputedStyle(node).backgroundColor;
      if (bs && !bs.includes('rgba(0, 0, 0, 0)')) { bg = bs; break; }
      node = node.parentElement;
    }
    if (bg.includes('rgba(0, 0, 0, 0)')) bg = getComputedStyle(document.body).backgroundColor;

    const key = s.color + '|' + bg + '|' + s.fontSize;
    if (seen.has(key)) continue;
    seen.add(key);

    out.push({
      text: (el.textContent || '').trim().slice(0, 40),
      color: s.color,
      bg,
      fontSize: parseFloat(s.fontSize),
      fontWeight: s.fontWeight,
      cls: (el.className || '').toString().slice(0, 40),
    });
  }
  return out;
});

let failures = 0;
for (const s of samples) {
  const fg = parseRgb(s.color);
  const bg = parseRgb(s.bg);
  if (!fg || !bg) continue;
  const cr = ratio(fg, bg);
  const large = s.fontSize >= 24 || (s.fontSize >= 18.66 && parseInt(s.fontWeight, 10) >= 700);
  const min = large ? 3.0 : 4.5;
  const ok = cr >= min;
  if (!ok) failures++;
  console.log(
    (ok ? 'PASS ' : 'FAIL ') + cr.toFixed(2) + ' (min ' + min + ') ' + s.fontSize + 'px ' + s.cls + ' :: ' + s.text
  );
}
console.log('---');
console.log('checked styles:', samples.length, 'failures:', failures);

await browser.close();

