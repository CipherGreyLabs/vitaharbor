// Vercel Cron Job - Reddit port scanner (Edge runtime, read-only).
// Fetches the configured Vita Reddit RSS feeds, applies the same quarantine boundary
// as the local scanner, and returns only a sanitized review-queue projection.
// Schedule: 0 7,13,19 * * * (UTC) = 09:00, 15:00, 21:00 Brussels.
// Does NOT write to disk on Vercel - runs locally via node scripts/cron-reddit-scan.mjs.

export const config = { runtime: "edge" };

import { REDDIT_SUBREDDITS } from "../scripts/reddit-sources.mjs";
import { classify, classifyCandidateType, parseEntries } from "../scripts/reddit-classifier.mjs";
import { assessCandidate, publicCandidate } from "../scripts/reddit-provenance.mjs";

const USER_AGENT = "web:vitaharbor.app:v1.0.0 (by /u/VitaHarborLedger)";

async function scanSub(sub: string) {
  try {
    const r = await fetch("https://www.reddit.com/r/"+sub+"/new.rss",
      { headers:{"User-Agent":USER_AGENT} });
    if (!r.ok) return { sub, error:"HTTP "+r.status, entries:[] };
    const entries = parseEntries(await r.text());
    const accepted = entries.flatMap(e => {
      const cls = classify(e);
      const assessment = assessCandidate(e, {
        subreddit: sub,
        classification: cls,
        candidateType: classifyCandidateType(e)
      });
      return assessment.record ? [publicCandidate(assessment.record)] : [];
    });
    return { sub, total:entries.length, accepted: accepted.filter(Boolean) };
  } catch(e) {
    return { sub, error:String(e), entries:[] };
  }
}

export default async function handler() {
  const scans = await Promise.all(REDDIT_SUBREDDITS.map(scanSub));
  const result = {
    scanned_at: new Date().toISOString(),
    sources: scans,
    ...Object.fromEntries(scans.map((scan) => [scan.sub.toLowerCase(), scan]))
  };
  console.log("[cron-scan]", JSON.stringify(result));
  return Response.json(result);
}
