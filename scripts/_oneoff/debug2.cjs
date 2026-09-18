const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://vitaharbor-75vsatz65-anonymusv1605-8308.vercel.app');
  await page.waitForTimeout(2000);
  
  const entries = await page.('li[id^="entry-"]');
  console.log("Total entries in DOM after JS load:", entries.length);
  
  const errorText = await page.evaluate(() => {
    return document.body.innerHTML.substring(0, 150);
  });
  console.log("Body text:", errorText);

  await browser.close();
})();

