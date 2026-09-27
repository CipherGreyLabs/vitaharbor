import fs from "node:fs";

const urls = JSON.parse(fs.readFileSync("all_curated_urls.json", "utf8"));
const redditUrls = urls.filter(u => u.domain.includes("reddit.com"));

console.log("Checking", redditUrls.length, "Reddit URLs...");

const results = [];
for (const item of redditUrls) {
  try {
    const res = await fetch(item.url + ".json", {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" }
    });
    results.push({ url: item.url, status: res.status });
  } catch (err) {
    results.push({ url: item.url, status: 0, error: err.message });
  }
}

console.log(JSON.stringify(results, null, 2));
