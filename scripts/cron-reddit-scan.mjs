// Detects *active development* threads on r/vitahacks and r/VitaPiracy and records
// them as unverified candidates in public/data/discovered.json.
//
// Deliberately conservative: this script never invents stage, framerate, or credit
// data. It only records that a thread exists, with a real detection timestamp.
// Promotion into the curated ledger stays a human decision.
import fs from "node:fs";
import path from "node:path";

const SUBREDDITS = ["vitahacks", "VitaPiracy"];
const USER_AGENT = "web:vitaharbor.app:v1.0.0 (by /u/VitaHarborLedger)";
const OUT = path.resolve(process.cwd(), "public/data/discovered.json");
const LEDGER = path.resolve(process.cwd(), "src/shared/constants/fallbackData.ts");
const MAX_ITEMS = 30;

// ── Classifier ────────────────────────────────────────────────────────────────
// We score every post on three axes and require a net positive result.
// This prevents question posts ("is X ported?") from polluting the ledger.

// Strong evidence that the author is doing active port work or announcing a result.
const DEVELOPMENT_SIGNALS = [
  /\[wip\]/i, /\[release\]/i, /\[port\]/i, /\bwip\b/i, /\brelease\b/i,
  /\bin.?game\b/i, /\bplayable\b/i, /\bboots\b/i, /\bcompiled\b/i,
  /\bported\b/i, /\bdecomp(ilation)?\b/i, /\barm.?wrapper\b/i, /\bvitagl\b/i,
  /\barmv7\b/i, /\bhomebrew\b/i, /\bfps\b/i, /\bframerate\b/i,
  /\bprogress\b/i, /\bupdate\b/i, /\bdemo\b/i, /\bbeta\b/i, /\bv\d+\.\d+\b/i,
  /\bpull.?request\b/i, /github\.com\b/i,
  /\bvitasdk\b/i, /\bnative\b/i, /\bbounty\b/i,
  /\bfork\b/i, /\bbuild\b/i, /\bpatch\b/i, /\bplugin\b/i,
  /arrived!/i, /is here/i, /\bfinally\b.*\breleased\b/i, /\bjust\s+released\b/i,
  /\bhas arrived\b/i, /\bport\s+progress\b/i,
];

// Phrases that strongly indicate the post is a question or request, not development.
const QUESTION_SIGNALS = [
  /\?/,
  /\bany(one|body)\b.*\b(port|know|working|made|tried)\b/i,
  /\bcan (someone|anyone|we|you|i)\b/i,
  /\bwould (be|love|like)\b.*\bport\b/i,
  /\bplease\b.*\bport\b/i,
  /\bwish\b.*\bport\b/i,
  /\bhope\b.*\bport\b/i,
  /\bis (it|there|this) (possible|a port|being ported|ported)\b/i,
  /\bhas (anyone|someone)\b/i,
  /\bwhy (isn'?t|is there no|hasn'?t)\b/i,
  /\bwhen (will|is)\b/i,
  /\bhow (to|do I|can I|would)\b.*\bport\b/i,
  /\blooking for\b/i,
  /\bneed help\b/i,
  /\bhelp (me|with)\b/i,
  /\bany (luck|chance|info|news|update)\b/i,
  /\bwhat.*\bport(s)?\b.*\b(exist|available|work|run)\b/i,
];

// Neutral port-adjacent terms counted only when not in a question context.
const PASSIVE_PORT_TERMS = [
  "port", "ports", "engine", "unity", "unreal", "wrapper", "release", "homebrew",
];

/**
 * Returns { accept, confidence, reason }
 * Only "high" and "medium" are accepted into the candidate list.
 */
function classify(entry) {
  const title = entry.title.toLowerCase();
  const body = (entry.body || "").toLowerCase();
  const titleRaw = entry.title;
  const full = title + " " + body;

  const devHits = DEVELOPMENT_SIGNALS.filter((re) => re.test(title) || re.test(body));
  const qHits   = QUESTION_SIGNALS.filter((re) => re.test(title) || re.test(body));
  const passiveHits = PASSIVE_PORT_TERMS.filter((t) => full.includes(t));

  // A question pattern in the raw title dominates unless dev signals are very strong.
  const titleIsQuestion = QUESTION_SIGNALS.some((re) => re.test(titleRaw));

  if (titleIsQuestion && devHits.length < 3) {
    return { accept: false, confidence: "low", reason: "question title with insufficient dev signals (" + devHits.length + ")" };
  }
  if (devHits.length >= 3) {
    const sample = devHits.slice(0, 3).map((r) => r.source).join(", ");
    return { accept: true, confidence: "high", reason: devHits.length + " dev signals: " + sample };
  }
  if (devHits.length >= 1 && qHits.length === 0 && passiveHits.length >= 1) {
    return { accept: true, confidence: "medium", reason: devHits.length + " dev signal(s), " + passiveHits.length + " passive term(s), no question markers" };
  }
  return { accept: false, confidence: "low", reason: "devHits=" + devHits.length + ", qHits=" + qHits.length + ", passive=" + passiveHits.length };
}

function parseEntries(xml) {
  const entries = [];
  for (const chunk of xml.split("<entry>").slice(1)) {
    const pick = (re) => { const m = chunk.match(re); return m ? m[1].trim() : ""; };
    const title = pick(/<title>([\s\S]*?)<\/title>/).replace(/<!\[CDATA\[|\]\]>/g, "");
    const url   = pick(/<link href="([^"]+)"/);
    const author = pick(/<name>([^<]+)<\/name>/).replace("/u/", "");
    const published = pick(/<updated>([^<]+)<\/updated>/);
    const body  = pick(/<content[^>]*>([\s\S]*?)<\/content>/).replace(/<[^>]+>/g, " ").slice(0, 600);
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
    if (seen.has(key)) continue;

    const cls = classify(entry);
    if (!cls.accept) {
      console.log("  skip [" + cls.confidence + "] " + entry.title + " — " + cls.reason);
      continue;
    }

    console.log("  accept [" + cls.confidence + "] " + entry.title);
    seen.set(key, {
      id: key.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      title: entry.title,
      url: entry.url,
      subreddit,
      author: entry.author ? "u/" + entry.author : "unknown",
      published_at: entry.published || null,
      detected_at: detectedAt,
      confidence: cls.confidence,
      classification_reason: cls.reason,
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
      items,
    },
    null,
    2
  ) + "\n",
  "utf8"
);

console.log(
  "wrote " + path.relative(process.cwd(), OUT) + " with " + items.length + " candidates (" + fetched + " entries scanned)"
);
