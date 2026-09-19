import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

for (const slug of ['d2vita', 'hollow-knight-vita']) {
  await page.goto('https://vitaharbor.vercel.app/projects/' + slug + '/?t=' + Date.now(), {
    waitUntil: 'networkidle'
  });
  await page.waitForTimeout(3000);

  const info = await page.evaluate(() => ({
    rows: document.querySelectorAll('li[id^="entry-"]').length,
    selected: document.querySelector('li[id^="entry-"].bg-sunken\\/60')?.id || null,
    onDisplay: document.body.innerText.includes('On the display'),
    canvas: document.querySelectorAll('canvas').length,
    pendingSection: document.body.innerText.includes('Detected, pending review'),
    pendingCount: document.querySelectorAll('[aria-labelledby="detected-heading"] li').length,
  }));

  console.log(slug + ' -> ' + JSON.stringify(info));
}

await browser.close();

