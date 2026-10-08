import fs from "node:fs";
import path from "node:path";

const QUARANTINE_FILE = path.resolve(process.cwd(), "data/quarantine.json");
const HEALTH_FILE = path.resolve(process.cwd(), "data/scanner-health.json");
const VITADB_CACHE = path.resolve(process.cwd(), "data/vitadb-cache.json");

export function generateTriageSummary() {
  if (!fs.existsSync(QUARANTINE_FILE)) {
    console.error("Quarantine file not found at " + QUARANTINE_FILE);
    return null;
  }

  const q = JSON.parse(fs.readFileSync(QUARANTINE_FILE, "utf8"));
  let health = null;
  if (fs.existsSync(HEALTH_FILE)) {
    try { health = JSON.parse(fs.readFileSync(HEALTH_FILE, "utf8")); } catch {}
  }

  let vitadb = null;
  if (fs.existsSync(VITADB_CACHE)) {
    try { vitadb = JSON.parse(fs.readFileSync(VITADB_CACHE, "utf8")); } catch {}
  }

  const items = q.items || [];
  const byState = {
    VERIFIED_FOR_REVIEW: [],
    QUARANTINED: [],
    PROMOTED: [],
    REJECTED: [],
    BLOCKED_UNVERIFIED: [],
    GRADUATED_TO_VITADB: []
  };

  for (const item of items) {
    if (byState[item.state]) {
      byState[item.state].push(item);
    } else {
      byState.QUARANTINED.push(item);
    }
  }

  console.log("================================================================================");
  console.log("              VITAHARBOR DISCOVERY & TRIAGE SUMMARY                             ");
  console.log("================================================================================");
  console.log("Generated: " + new Date().toISOString() + " | Quarantine items: " + items.length);
  if (health) {
    console.log("Last scanner attempt: " + health.attempted_at + " | State: " + health.state + " (" + health.successful_sources + "/" + health.total_sources + " sources)");
  }
  if (vitadb) {
    console.log("VitaDB catalogue cache: " + vitadb.total_items + " entries synced at " + vitadb.synced_at);
  }
  console.log("--------------------------------------------------------------------------------");
  console.log("Breakdown by state:");
  console.log("  - VERIFIED_FOR_REVIEW : " + byState.VERIFIED_FOR_REVIEW.length);
  console.log("  - QUARANTINED (New)   : " + byState.QUARANTINED.length);
  console.log("  - PROMOTED (Curated)  : " + byState.PROMOTED.length);
  console.log("  - REJECTED            : " + byState.REJECTED.length);
  console.log("  - BLOCKED_UNVERIFIED  : " + byState.BLOCKED_UNVERIFIED.length);
  console.log("  - GRADUATED_TO_VITADB : " + byState.GRADUATED_TO_VITADB.length);
  console.log("================================================================================");

  console.log("\n[1] VERIFIED FOR REVIEW (Actionable - Awaiting Curation):");
  if (byState.VERIFIED_FOR_REVIEW.length === 0) {
    console.log("    (No items currently awaiting curation)");
  } else {
    for (const item of byState.VERIFIED_FOR_REVIEW) {
      console.log("  * [" + (item.evidence_type || "verified") + "] " + (item.source?.title || item.title));
      console.log("    Author: /u/" + (item.source?.author || item.author) + " | Sub: r/" + (item.source?.subreddit || item.subreddit));
      console.log("    URL: " + (item.source?.canonical_url || item.url));
      if (item.evidence_notes) console.log("    Evidence: " + item.evidence_notes);
    }
  }

  console.log("\n[2] RECENT QUARANTINED CANDIDATES (Pending Initial Review):");
  if (byState.QUARANTINED.length === 0) {
    console.log("    (Queue clean - no unreviewed candidates)");
  } else {
    for (const item of byState.QUARANTINED.slice(0, 10)) {
      console.log("  ? [" + (item.classification?.category || "candidate") + " | " + (item.classification?.confidence || "medium") + "] " + (item.source?.title || item.title));
      console.log("    Author: /u/" + (item.source?.author || item.author) + " | Sub: r/" + (item.source?.subreddit || item.subreddit));
      console.log("    URL: " + (item.source?.canonical_url || item.url));
    }
    if (byState.QUARANTINED.length > 10) {
      console.log("    ... and " + (byState.QUARANTINED.length - 10) + " older quarantined items.");
    }
  }

  console.log("================================================================================\n");
  return { itemsCount: items.length, byState };
}

if (process.argv[1] && process.argv[1].includes("triage-summary.mjs")) {
  generateTriageSummary();
}
