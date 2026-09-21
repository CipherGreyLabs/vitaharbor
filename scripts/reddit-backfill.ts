// Bounded historical discovery pass. The regular scanner only sees Reddit's
// current /new.rss window, so this searches recent subreddit history for port
// development wording and merges new candidates through the same quarantine
// boundary. It never promotes records into the curated ledger.
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { REDDIT_SOURCE_LABEL, REDDIT_SUBREDDITS, redditSearchRssUrl } from "./reddit-sources.mjs";
import { classify, classifyCandidateType, isTrackableCandidateType, keyOf, parseEntries } from "./reddit-classifier.mjs";
import type { RedditEntry } from "./reddit-classifier.mjs";
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
import type { ProvenanceRecord } from "./reddit-provenance.mjs";

const USER_AGENT = "web:vitaharbor.app:v1.0.0 (by /u/VitaHarborLedger)";
const INTERNAL_OUT = path.resolve(process.cwd(), "data/quarantine.json");
const PUBLIC_OUT = path.resolve(process.cwd(), "public/data/discovered.json");
const LEDGER = path.resolve(process.cwd(), "src/shared/constants/fallbackData.ts");
const MAX_ITEMS = 100;
const DEFAULT_DAYS = 21;
const SEARCH_QUERY = 'port OR recompiled OR recomp OR decomp OR decompilation OR wrapper OR "work in progress"';
const BACKFILL_TITLE_SIGNAL = /\bport(?:ed|ing)?\b|\brecompil(?:e|ed|er|ation)\b|\bdecomp(?:ilation)?\b|\bwrapper\b|\bw\.?i\.?p\.?\b/i;

function boundedDays() {
  const requested = Number.parseInt(process.env.REDDIT_BACKFILL_DAYS || String(DEFAULT_DAYS), 10);
  if (!Number.isFinite(requested)) return DEFAULT_DAYS;
  return Math.min(90, Math.max(7, requested));
}

function knownLeadUrls() {
  try {
    const source = fs.readFileSync(LEDGER, "utf8");
    return new Set((source.match(/https:\/\/(www\.)?reddit\.com\/[^"']+/g) || []).map(keyOf));
  } catch {
    return new Set();
  }
}

function hashEntry(entry: RedditEntry) {
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

function previous(): ProvenanceRecord[] {
  try {
    const parsed = JSON.parse(fs.readFileSync(INTERNAL_OUT, "utf8"));
    if (parsed.schema_version === PROVENANCE_SCHEMA_VERSION && Array.isArray(parsed.items)) {
      return parsed.items.map(upgradeProvenanceRecord);
    }
  } catch {
    // Fall through to the legacy public queue migration.
  }
  try {
    const legacy = JSON.parse(fs.readFileSync(PUBLIC_OUT, "utf8"));
    const legacyItems = (Array.isArray(legacy.items) ? legacy.items : []) as Record<string, unknown>[];
    return legacyItems
      .map((item) => migrateLegacyCandidate(item, { detectedAt: legacy.generated_at }))
      .filter((result) => result.record)
      .map((result) => result.record as ProvenanceRecord);
  } catch {
    return [];
  }
}

async function fetchSearchFeed(subreddit: string, timeRange: string): Promise<{ ok: boolean; entries: RedditEntry[] }> {
  const url = redditSearchRssUrl(subreddit, SEARCH_QUERY, timeRange);
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
      if (res.ok) return { ok: true, entries: parseEntries(await res.text()) };
      console.warn("r/" + subreddit + " backfill returned HTTP " + res.status + (attempt === 1 ? ", retrying" : ""));
    } catch (error) {
      console.warn("r/" + subreddit + " backfill fetch failed:", error instanceof Error ? error.message : String(error));
    }
    await new Promise((resolve) => setTimeout(resolve, attempt * 1800));
  }
  return { ok: false, entries: [] };
}

const days = boundedDays();
const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
const timeRange = days <= 31 ? "month" : "year";
const known = knownLeadUrls();
const previousItems = previous();
const seen = new Map<string, ProvenanceRecord>(
  previousItems
    .map((item) => [keyOf(item.source?.canonical_url), item] as [string, ProvenanceRecord])
    .filter(([key, item]) => key && (TERMINAL_STATES.includes(item.state) || !known.has(key)))
);
const detectedAt = new Date().toISOString();
let fetched = 0;
let successfulFeeds = 0;
let added = 0;

for (const subreddit of REDDIT_SUBREDDITS) {
  const result = await fetchSearchFeed(subreddit, timeRange);
  if (!result.ok) continue;
  successfulFeeds += 1;
  const entries = result.entries.filter((entry) => {
    const published = Date.parse(String(entry.published || ""));
    return Number.isFinite(published) && published >= cutoff;
  });
  fetched += entries.length;
  console.log("r/" + subreddit + ": " + entries.length + " recent search entries parsed");

  for (const entry of entries) {
    if (!BACKFILL_TITLE_SIGNAL.test(String(entry.title || ""))) continue;
    const classification = classify(entry);
    const candidateType = classifyCandidateType(entry);
    if (!classification.accept || !isTrackableCandidateType(candidateType)) continue;

    const assessment = assessCandidate(entry, {
      subreddit,
      detectedAt,
      classification,
      candidateType,
      contentHash: hashEntry(entry)
    });
    if (!assessment.accepted || !assessment.record) continue;
    const key = keyOf(assessment.record.source?.canonical_url || entry.url);
    if (!key || known.has(key) || seen.has(key)) continue;

    const record = {
      ...assessment.record,
      state_history: assessment.record.state_history.map((event) => ({
        ...event,
        reason: event.state === "DETECTED"
          ? "Canonical Reddit search RSS entry accepted during bounded historical backfill"
          : event.reason
      }))
    };
    seen.set(key, record);
    added += 1;
    console.log("  backfill quarantine [" + classification.confidence + "] " + entry.title);
  }
}

if (successfulFeeds === 0) {
  console.warn("Backfill could not read any subreddit search feed; existing provenance was left untouched.");
  process.exit(0);
}

if (added === 0) {
  console.log("Backfill scanned " + fetched + " recent entries across " + successfulFeeds + " feeds; no new candidates.");
  process.exit(0);
}

const correlated = correlateCampaigns([...seen.values()]);
const ordered = markCrosspostDuplicates(correlated)
  .sort((a, b) => new Date(String(b.source?.published_at || b.state_history?.[0]?.at || 0)).getTime() - new Date(String(a.source?.published_at || a.state_history?.[0]?.at || 0)).getTime());
const activeItems = ordered.filter((item) => !TERMINAL_STATES.includes(item.state)).slice(0, MAX_ITEMS);
const terminalItems = ordered.filter((item) => TERMINAL_STATES.includes(item.state));
const items = [...activeItems, ...terminalItems]
  .sort((a, b) => new Date(String(b.source?.published_at || b.state_history?.[0]?.at || 0)).getTime() - new Date(String(a.source?.published_at || a.state_history?.[0]?.at || 0)).getTime());

fs.mkdirSync(path.dirname(INTERNAL_OUT), { recursive: true });
fs.mkdirSync(path.dirname(PUBLIC_OUT), { recursive: true });
fs.writeFileSync(INTERNAL_OUT, JSON.stringify({
  schema_version: PROVENANCE_SCHEMA_VERSION,
  generated_at: detectedAt,
  source: REDDIT_SOURCE_LABEL + " RSS",
  items
}, null, 2) + "\n", "utf8");
fs.writeFileSync(PUBLIC_OUT, JSON.stringify(publicDocument(items, detectedAt, REDDIT_SOURCE_LABEL), null, 2) + "\n", "utf8");
console.log("Backfill added " + added + " candidate(s) from " + fetched + " recent search entries.");
