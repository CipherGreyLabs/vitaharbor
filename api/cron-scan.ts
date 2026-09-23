// Vercel Cron fallback. Operational details stay in provider logs; the HTTP response
// does not expose source outcomes or community-post data. This route does not write to disk.

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
  return new Response(null, { status: 204 });
}
