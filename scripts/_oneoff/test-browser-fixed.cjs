const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error') console.log("BROWSER ERROR:", msg.text());
  });
  page.on('pageerror', error => {
    console.log("PAGE ERROR:", error.message);
  });
  
  await page.goto('https://vitaharbor-ads4w9iyl-anonymusv1605-8308.vercel.app');
  await page.waitForTimeout(2000);
  
  const html = await page.content();
  const rows = (html.match(/<li[^>]*id="entry-/g) || []).length;
  console.log("Rows rendered in browser DOM after JS load:", rows);
  
  await browser.close();
})();

