const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  console.log("Navigating to https://vitaharbor-ads4w9iyl-anonymusv1605-8308.vercel.app ...");
  await page.goto('https://vitaharbor-ads4w9iyl-anonymusv1605-8308.vercel.app');
  
  // Wait for the page to be fully hydrated
  await page.waitForTimeout(2000);
  
  // Check if CustomCursor is there
  const cursorExists = await page.evaluate(() => {
    return document.body.innerHTML.includes('CustomCursor');
  });
  console.log("CustomCursor exists in DOM:", cursorExists);
  
  // Check for the list items
  const items = await page.('li[id^="entry-"]');
  console.log("List items visible on screen:", items.length);
  
  // Check browser console for errors
  page.on('pageerror', error => {
    console.log("PAGE ERROR:", error.message);
  });
  
  await browser.close();
})();

