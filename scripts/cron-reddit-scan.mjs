// Detects port-related threads on r/vitahacks and r/VitaPiracy and records them as
// unverified candidates in public/data/discovered.json.
//
// Deliberately conservative: this script never invents stage, framerate or credit
// data. It only records that a thread exists, with a real detection timestamp.
// Promotion into the curated ledger stays a human decision.
import fs from "node:fs";
import path from "node:path";

const SUBREDDITS = ["vitahacks", "VitaPiracy"];
const USER_AGENT = "web:vitaharbor.app:v1.0.0 (by /u/VitaHarborLedger)";
const OUT = path.resolve(process.cwd(), "public/data/discovered.json");
const LEDGER = path.resolve(process.cwd(), "src/shared/constants/fallbackData.ts");
const MAX_ITEMS = 30;

const PORT_TERMS = [
  "port", "ports", "ported", "decomp", "decompilation", "wrapper", "vitagl",
  "armv7", "engine", "unity", "unreal", "release", "wip", "in-game", "playable",
  "boots", "homebrew"
];

function parseEntries(xml) {
  const entries = [];
  for (const chunk of xml.split("<entry>").slice(1)) {
    const pick = (re) => {
      const match = chunk.match(re);
      return match ? match[1].trim() : "";
    };
    const title = pick(/<title>([\s\S]*?)<\/title>/).replace(/<!\[CDATA\[|\]\]>/g, "");
    const url = pick(/<link href="([^"]+)"/);
    const author = pick(/<name>([^<]+)<\/name>/).replace("/u/", "");
    const published = pick(/<updated>([^<]+)<\/updated>/);
    const body = pick(/<content[^>]*>([\s\S]*?)<\/content>/).replace(/<[^>]+>/g, " ").slice(0, 600);
    if (title && url) entries.push({ title, url, author, published, body });
  }
  return entries;
}

function keyOf(url) {
  return String(url).replace(/https?:\/\/(www\.)?reddit\.com/i, "").replace(/\/?$/, "").toLowerCase();
}

function knownLeadUrls() {
  try {
    const source = fs.readFileSync(LEDGER, "utf8");
    return new Set((source.match(/https:\/\/(www\.)?reddit\.com\/[^"']+/g) || []).map(keyOf));
  } catch {
    return new Set();
  }
}

function previous() {
  try {
    const parsed = JSON.parse(fs.readFileSync(OUT, "utf8"));
    return Array.isArray(parsed.items) ? parsed.items : [];
  } catch {
    return [];
  }
}

async function fetchFeed(subreddit) {
  const url = "https://www.reddit.com/r/" + subreddit + "/new.rss";
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
      if (res.ok) return parseEntries(await res.text());
      console.warn("r/" + subreddit + " returned HTTP " + res.status + (attempt === 1 ? ", retrying" : ""));
    } catch (error) {
      console.warn("r/" + subreddit + " fetch failed:", error.message);
    }
    await new Promise((resolve) => setTimeout(resolve, attempt * 1500));
  }
  return [];
}

function looksPortRelated(entry) {
  const haystack = (entry.title + " " + entry.body).toLowerCase();
  const hits = PORT_TERMS.filter((term) => haystack.includes(term)).length;
  return hits >= 2;
}

const known = knownLeadUrls();
const previousItems = previous();
const seen = new Map(previousItems.map((item) => [keyOf(item.url), item]));
const detectedAt = new Date().toISOString();

let fetched = 0;
for (const subreddit of SUBREDDITS) {
  const entries = await fetchFeed(subreddit);
  fetched += entries.length;
  console.log("r/" + subreddit + ": " + entries.length + " entries parsed");

  for (const entry of entries) {
    const key = keyOf(entry.url);
    if (!key || known.has(key)) continue;
    if (!looksPortRelated(entry)) continue;
    if (seen.has(key)) continue;
    seen.set(key, {
      id: key.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      title: entry.title,
      url: entry.url,
      subreddit,
      author: entry.author ? "u/" + entry.author : "unknown",
      published_at: entry.published || null,
      detected_at: detectedAt
    });
  }
}

const items = [...seen.values()]
  .sort((a, b) => new Date(b.published_at || b.detected_at) - new Date(a.published_at || a.detected_at))
  .slice(0, MAX_ITEMS);

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(
  OUT,
  JSON.stringify(
    {
      generated_at: detectedAt,
      source: "r/vitahacks + r/VitaPiracy RSS",
      note: "Unverified candidates. Not part of the curated ledger until reviewed.",
      items
    },
    null,
    2
  ) + "\n",
  "utf8"
);

console.log(
  "wrote " + path.relative(process.cwd(), OUT) + " with " + items.length + " candidates (" + fetched + " entries scanned)"
);
