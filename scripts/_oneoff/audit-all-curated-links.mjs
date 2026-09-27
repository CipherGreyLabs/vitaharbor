import fs from "node:fs";
import path from "node:path";

const filePath = path.resolve(process.cwd(), "src/shared/constants/fallbackData.ts");
const content = fs.readFileSync(filePath, "utf8");

const matches = [...content.matchAll(/https?:\/\/[^\s"',)]+/g)].map(m => m[0]);
const unique = [...new Set(matches)];

console.log("Total unique URLs in fallbackData.ts:", unique.length);

const results = [];
for (const url of unique) {
  let domain = "";
  try {
    domain = new URL(url).hostname;
  } catch (e) {
    domain = "invalid";
  }
  results.push({ url, domain });
}

const byDomain = {};
for (const r of results) {
  byDomain[r.domain] = (byDomain[r.domain] || 0) + 1;
}

console.log("URLs by domain:", JSON.stringify(byDomain, null, 2));
fs.writeFileSync("all_curated_urls.json", JSON.stringify(results, null, 2), "utf8");
console.log("Written to all_curated_urls.json");
