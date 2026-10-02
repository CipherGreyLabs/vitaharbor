import fs from "node:fs";

const content = fs.readFileSync("src/shared/constants/fallbackData.ts", "utf8");
const matches = content.match(/https?:\/\/[^"'\s,)]+/g) || [];
const uniqueUrls = [...new Set(matches)];

console.log(`Checking ${uniqueUrls.length} unique URLs in fallbackData.ts...`);

async function checkUrl(url) {
  try {
    const res = await fetch(url, {
      method: "HEAD",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      },
      redirect: "follow",
      signal: AbortSignal.timeout(8000)
    });
    return { url, status: res.status, ok: res.status < 400 };
  } catch (err) {
    // Retry with GET if HEAD was blocked/method not allowed
    try {
      const res = await fetch(url, {
        method: "GET",
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        },
        redirect: "follow",
        signal: AbortSignal.timeout(8000)
      });
      return { url, status: res.status, ok: res.status < 400 };
    } catch (e) {
      return { url, status: "ERROR", error: e.message, ok: false };
    }
  }
}

// Check in parallel chunks
const results = [];
const chunkSize = 10;
for (let i = 0; i < uniqueUrls.length; i += chunkSize) {
  const chunk = uniqueUrls.slice(i, i + chunkSize);
  const chunkResults = await Promise.all(chunk.map(checkUrl));
  results.push(...chunkResults);
}

const dead = results.filter(r => !r.ok);
console.log(`Audit complete: ${results.length - dead.length} OK, ${dead.length} FAILED/DEAD`);
dead.forEach(d => console.log(`DEAD: [${d.status}] ${d.url} (${d.error || ""})`));
