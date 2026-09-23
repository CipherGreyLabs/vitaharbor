// Detects *active development* threads on the configured Vita Reddit communities and records
// them as quarantined provenance records. The public discovery file is only a sanitized
// review-queue projection; it is never a source for curated ledger writes.
//
// Deliberately conservative: this script never invents stage, framerate, or credit
// data. It only records that a thread exists, with a real detection timestamp.
// Promotion into the curated ledger stays a human decision.
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { REDDIT_SOURCE_LABEL, REDDIT_SUBREDDITS, redditRssUrl } from "./reddit-sources.mjs";
import { buildScannerHealth } from "./reddit-scan-health.mjs";
import { classify, classifyCandidateType, isTrackableCandidateType, keyOf, parseEntries } from "./reddit-classifier.mjs";
import {
  assessCandidate,
  correlateCampaigns,
  markCrosspostDuplicates,
  migrateLegacyCandidate,
  publicDocument,
  PROVENANCE_SCHEMA_VERSION,
  TERMINAL_STATES,
  upgradeProvenanceRecord
} from "./reddit-provenance.mjs";
const USER_AGENT = "web:vitaharbor.app:v1.0.0 (by /u/VitaHarborLedger)";
const INTERNAL_OUT = path.resolve(process.cwd(), "data/quarantine.json");
const PUBLIC_OUT = path.resolve(process.cwd(), "public/data/discovered.json");
const HEALTH_OUT = path.resolve(process.cwd(), "public/data/scanner-health.json");
const LEDGER = path.resolve(process.cwd(), "src/shared/constants/fallbackData.ts");
const MAX_ITEMS = 100;

function knownLeadUrls() {
  try {
    const source = fs.readFileSync(LEDGER, "utf8");
    return new Set((source.match(/https:\/\/(www\.)?reddit\.com\/[^"']+/g) || []).map(keyOf));
  } catch {
    return new Set();
  }
}

function hashEntry(entry) {
  return createHash("sha256")
    .update(JSON.stringify({
      title: entry.title,
      body: entry.body,
      outbound_urls: entry.outbound_urls || [],
      media_urls: entry.media_urls || [],
      media_hashes: entry.media_hashes || []
    }))
    .digest("hex");
}

function previous() {
  try {
    const parsed = JSON.parse(fs.readFileSync(INTERNAL_OUT, "utf8"));
    if (parsed.schema_version === PROVENANCE_SCHEMA_VERSION && Array.isArray(parsed.items)) return parsed.items.map(upgradeProvenanceRecord);
  } catch {
    // The first hardened run migrates the legacy public queue below.
  }
  try {
    const legacy = JSON.parse(fs.readFileSync(PUBLIC_OUT, "utf8"));
    return (Array.isArray(legacy.items) ? legacy.items : [])
      .map((item) => migrateLegacyCandidate(item, { detectedAt: legacy.generated_at }))
      .filter((result) => result.record)
      .map((result) => result.record);
  } catch {
    return [];
  }
}

async function fetchFeed(subreddit) {
  const url = redditRssUrl(subreddit);
  let failureStatus = "unavailable";
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
      if (res.ok) return { entries: parseEntries(await res.text()), status: "available" };
      if (res.status === 429) failureStatus = "rate_limited";
      console.warn("r/" + subreddit + " returned HTTP " + res.status + (attempt === 1 ? ", retrying" : ""));
    } catch (error) {
      console.warn("r/" + subreddit + " fetch failed:", error.message);
    }
    await new Promise((resolve) => setTimeout(resolve, attempt * 1500));
  }
  return { entries: [], status: failureStatus };
}

const known = knownLeadUrls();
const previousItems = previous();
// A candidate can become curated between scans. Remove those stale entries from
// the persisted review queue instead of carrying them forward forever. Terminal
// decisions remain internal provenance even after their source becomes curated.
const seen = new Map(
  previousItems
    .map((item) => [keyOf(item.source?.canonical_url || item.url), item])
    .filter(([key, item]) => {
      if (!key) return false;
      if (TERMINAL_STATES.includes(item.state)) return true;
      if (known.has(key)) return false;
      if (item.state !== "QUARANTINED") return true;
      const classification = classify(item.source || {});
      const candidateType = classifyCandidateType(item.source || {});
      return classification.accept && isTrackableCandidateType(candidateType);
    })
);
const detectedAt = new Date().toISOString();

let fetched = 0;
const feedResults = [];
for (const subreddit of REDDIT_SUBREDDITS) {
  const result = await fetchFeed(subreddit);
  feedResults.push({ subreddit, status: result.status });
  const entries = result.entries;
  fetched += entries.length;
  console.log("r/" + subreddit + ": " + entries.length + " entries parsed");

  for (const entry of entries) {
    const cls = classify(entry);
    const candidateType = classifyCandidateType(entry);
    if (!isTrackableCandidateType(candidateType)) {
      console.log("  skip [out-of-scope " + candidateType + "] " + entry.title);
      continue;
    }
    const assessment = assessCandidate(entry, {
      subreddit,
      detectedAt,
      classification: cls,
      candidateType,
      contentHash: hashEntry(entry)
    });
    const key = keyOf(assessment.record?.source?.canonical_url || entry.url);
    if (!key || known.has(key)) continue;
    if (seen.has(key)) continue;

    if (!assessment.accepted) {
      console.log("  skip [" + cls.confidence + "] " + entry.title + " — " + cls.reason);
      continue;
    }

    console.log("  quarantine [" + cls.confidence + "] " + entry.title + (assessment.explicitPoison ? " [poison signal]" : ""));
    seen.set(key, assessment.record);
  }
}

const correlated = correlateCampaigns([...seen.values()]);
const ordered = markCrosspostDuplicates(correlated)
  .sort((a, b) => new Date(b.source?.published_at || b.state_history?.[0]?.at) - new Date(a.source?.published_at || a.state_history?.[0]?.at));
const activeItems = ordered.filter((item) => !TERMINAL_STATES.includes(item.state)).slice(0, MAX_ITEMS);
const terminalItems = ordered.filter((item) => TERMINAL_STATES.includes(item.state));
const items = [...activeItems, ...terminalItems]
  .sort((a, b) => new Date(b.source?.published_at || b.state_history?.[0]?.at) - new Date(a.source?.published_at || a.state_history?.[0]?.at));

fs.mkdirSync(path.dirname(INTERNAL_OUT), { recursive: true });
fs.mkdirSync(path.dirname(PUBLIC_OUT), { recursive: true });
fs.writeFileSync(
  INTERNAL_OUT,
  JSON.stringify(
    {
      schema_version: PROVENANCE_SCHEMA_VERSION,
      generated_at: detectedAt,
      source: REDDIT_SOURCE_LABEL + " RSS",
      items,
    },
    null,
    2
  ) + "\n",
  "utf8"
);

fs.writeFileSync(
  PUBLIC_OUT,
  JSON.stringify(publicDocument(items, detectedAt, REDDIT_SOURCE_LABEL), null, 2) + "\n",
  "utf8"
);

fs.writeFileSync(
  HEALTH_OUT,
  JSON.stringify(buildScannerHealth(REDDIT_SUBREDDITS, feedResults, detectedAt), null, 2) + "\n",
  "utf8"
);

console.log(
  "wrote " + path.relative(process.cwd(), INTERNAL_OUT) + " and sanitized " + path.relative(process.cwd(), PUBLIC_OUT) +
  " with " + items.length + " provenance records (" + activeItems.length + " active review candidates, " + terminalItems.length +
  " terminal decisions; " + fetched + " entries scanned)"
);
