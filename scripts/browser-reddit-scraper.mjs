import { chromium } from "playwright";

export async function scrapeRedditSubreddit(subreddit, limit = 25) {
  let browser = null;
  try {
    browser = await chromium.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"]
    });
    const ctx = await browser.newContext({
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
      locale: "en-US",
      viewport: { width: 1280, height: 900 }
    });
    const page = await ctx.newPage();
    const targetUrl = "https://www.reddit.com/r/" + subreddit + "/new/";
    await page.goto(targetUrl, { waitUntil: "domcontentloaded", timeout: 25000 }).catch(() => {});

    try {
      const continueBtn = await page.$("button:has-text('Yes'), button:has-text('Continue'), button:has-text('I am 18+'), button[value='yes']");
      if (continueBtn) {
        await continueBtn.click();
        await page.waitForTimeout(1000);
      }
    } catch {}

    await page.waitForSelector("shreddit-post, .thing.link", { timeout: 8000 }).catch(() => {});
    await page.waitForTimeout(1000);

    const rawPosts = await page.evaluate((maxCount) => {
      const shredditElements = [...document.querySelectorAll("shreddit-post")];
      if (shredditElements.length > 0) {
        return shredditElements.slice(0, maxCount).map((el) => {
          const permalink = el.getAttribute("permalink") || "";
          const fullUrl = permalink.startsWith("http") ? permalink : permalink ? "https://www.reddit.com" + permalink : "";
          return {
            id: el.id?.replace(/^t3_/, "") || "",
            title: el.getAttribute("post-title") || el.querySelector("h1, h2, a[slot='title']")?.innerText?.trim() || "",
            author: el.getAttribute("author") || "",
            url: fullUrl,
            canonical_url: fullUrl,
            body: el.querySelector("div[slot='text-body'], p")?.innerText?.trim() || "",
            published_at: el.getAttribute("created-timestamp") || new Date().toISOString()
          };
        });
      }

      const classicElements = [...document.querySelectorAll(".thing.link")];
      if (classicElements.length > 0) {
        return classicElements.slice(0, maxCount).map((el) => {
          const titleEl = el.querySelector("a.title");
          const permalink = el.getAttribute("data-permalink") || titleEl?.getAttribute("href") || "";
          const fullUrl = permalink.startsWith("http") ? permalink : permalink ? "https://www.reddit.com" + permalink : "";
          return {
            id: el.getAttribute("data-fullname")?.replace(/^t3_/, "") || "",
            title: titleEl?.innerText?.trim() || "",
            author: el.getAttribute("data-author") || "",
            url: fullUrl,
            canonical_url: fullUrl,
            body: "",
            published_at: new Date().toISOString()
          };
        });
      }
      return [];
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
