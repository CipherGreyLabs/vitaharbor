const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('pageerror', err => {
    console.log("CRASH ERROR:", err.message, err.stack);
  });
  
  page.on('console', msg => {
    console.log("CONSOLE:", msg.type(), msg.text());
  });
  
  await page.goto('https://vitaharbor-ads4w9iyl-anonymusv1605-8308.vercel.app');
  await page.waitForTimeout(2000);
  
  // Try to find the Directory element to see if it even renders
  const dirText = await page.evaluate(() => {
    const el = document.getElementById('directory');
    return el ? el.innerText.substring(0, 100) : "DIRECTORY NOT FOUND";
  });
  console.log("Directory text:", dirText);
  
  await browser.close();
})();

