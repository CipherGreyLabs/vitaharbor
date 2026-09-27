import fs from "node:fs";

const urls = JSON.parse(fs.readFileSync("all_curated_urls.json", "utf8"));
const githubUrls = urls.filter(u => u.domain.includes("github"));

console.log("Checking", githubUrls.length, "GitHub URLs...");

const results = [];
for (const item of githubUrls) {
  try {
    const res = await fetch(item.url, {
      method: "HEAD",
      headers: { "User-Agent": "vitaharbor-link-audit" },
      redirect: "follow"
    });
    results.push({ url: item.url, status: res.status, ok: res.ok, redirected: res.redirected, finalUrl: res.url });
  } catch (err) {
    results.push({ url: item.url, status: 0, ok: false, error: err.message });
  }
}

console.log(JSON.stringify(results, null, 2));
const dead = results.filter(r => !r.ok);
console.log("Total dead/failed GitHub URLs:", dead.length);
if (dead.length > 0) {
  console.log("Failed items:", JSON.stringify(dead, null, 2));
}
