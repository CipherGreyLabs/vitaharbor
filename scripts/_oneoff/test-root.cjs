const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('https://vitaharbor-gkbheduy8-anonymusv1605-8308.vercel.app');
  await page.waitForTimeout(2000);
  
  const rootContent = await page.evaluate(() => document.getElementById('root')?.innerHTML || 'NOT_FOUND');
  console.log("Root length:", rootContent.length);
  if (rootContent.length < 100) {
    console.log("Root content:", rootContent);
  }
  
  const errorBoundary = await page.evaluate(() => document.body.innerHTML.includes('Error') || document.body.innerHTML.includes('Exception'));
  console.log("Found error text:", errorBoundary);
  
  await browser.close();
})();

