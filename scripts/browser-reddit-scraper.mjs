import { chromium } from "playwright";

export async function scrapeRedditSubreddit(subreddit, limit = 25) {
  let browser = null;
  try {
    browser = await chromium.launch({ headless: true });
    const ctx = await browser.newContext({
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
      locale: "en-US",
      viewport: { width: 1280, height: 900 }
    });
    const page = await ctx.newPage();
    const targetUrl = "https://www.reddit.com/r/" + subreddit + "/new/";
    await page.goto(targetUrl, { waitUntil: "networkidle", timeout: 30000 }).catch(async () => {
      await page.goto(targetUrl, { waitUntil: "domcontentloaded", timeout: 25000 });
    });

    await page.waitForSelector("shreddit-post", { timeout: 8000 }).catch(() => {});
    await page.waitForTimeout(1500);

    const rawPosts = await page.evaluate((maxCount) => {
      const elements = [...document.querySelectorAll("shreddit-post")].slice(0, maxCount);
      return elements.map((el) => {
        const fullUrl = el.getAttribute("permalink")
          ? "https://www.reddit.com" + el.getAttribute("permalink")
          : "";
        return {
          id: el.id?.replace(/^t3_/, "") || "",
          title: el.getAttribute("post-title") || el.querySelector("h1, h2, a[slot='title']")?.innerText || "",
          author: el.getAttribute("author") || "",
          url: fullUrl,
          canonical_url: fullUrl,
          body: el.querySelector("div[slot='text-body'], p")?.innerText || "",
          published_at: el.getAttribute("created-timestamp") || new Date().toISOString()
        };
      });
    }, limit);

    return rawPosts.filter((p) => p.title && p.url);
  } catch (err) {
    console.warn("[browser-scraper] r/" + subreddit + " scraping failed:", err.message);
    return [];
  } finally {
    if (browser) {
      await browser.close().catch(() => {});
    }
  }
}
