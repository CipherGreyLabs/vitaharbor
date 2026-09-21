import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { classify, classifyCandidateType, keyOf } from "../reddit-classifier.mjs";
import {
  assessCandidate,
  correlateCampaigns,
  publicDocument,
  PROVENANCE_SCHEMA_VERSION
} from "../reddit-provenance.mjs";

const root = process.cwd();
const quarantinePath = path.resolve(root, "data/quarantine.json");
const publicPath = path.resolve(root, "public/data/discovered.json");
const auditPath = path.resolve(root, "data/provenance-audit.jsonl");
const ledgerPath = path.resolve(root, "src/shared/constants/fallbackData.ts");
const quarantine = JSON.parse(fs.readFileSync(quarantinePath, "utf8"));
if (quarantine.schema_version !== PROVENANCE_SCHEMA_VERSION || !Array.isArray(quarantine.items)) {
  throw new Error("Expected v2 data/quarantine.json");
}

const observations = [
  {
    subreddit: "vitahacks",
    title: "Test Drive (1987) native Vita port",
    body: "Thanks to the work of kylofon who created the Test Drive recompilation for windows I present to you the Vita native version of the original Test Drive. It's the initial release, it runs OK, i have not found any bugs so far. Open source, available here: https://github.com/smart-pickle/TestDrive-Vita. It requires the original files of the game; they are not bundled with the vpk.",
    author: "gainusha",
    url: "https://www.reddit.com/r/vitahacks/comments/1wlqxq4/test_drive_1987_native_vita_port/",
    published: "2026-09-20T19:50:09.288Z",
    outbound_urls: ["https://github.com/smart-pickle/TestDrive-Vita"]
  },
  {
    subreddit: "vitahacks",
    title: "TheForceEngine-VITA - Successfully booting into the menu",
    body: "Still have much work to do but i got the main menu working",
    author: "SnooLobsters311",
    url: "https://www.reddit.com/r/vitahacks/comments/1wlrv6x/theforceenginevita_successfully_booting_into_the/",
    published: "2026-09-20T20:24:59.820Z"
  },
  {
    subreddit: "PSVitaHomebrew",
    title: "Updates on RR2 Port",
    body: "The port is progressing on stability and features. It first booted four days ago, the menu is running at 60 fps, touch screen navigation now works and races can be played with touch controls. The author states the port is not public yet and physical button mapping is still incomplete.",
    author: "chutA7X",
    url: "https://www.reddit.com/r/PSVitaHomebrew/comments/1wmabvz/updates_on_rr2_port/",
    published: "2026-09-21T11:39:44.312Z"
  },
  {
    subreddit: "VitaPiracy",
    title: "Guess It Is Happening",
    body: "",
    author: "TrueHeat69",
    url: "https://www.reddit.com/r/VitaPiracy/comments/1wmax82/guess_it_is_happening/",
    published: "2026-09-21T12:07:41.673Z",
    outbound_urls: ["https://youtu.be/teC0mKZ0mjA"],
    manualClassification: {
      accept: true,
      confidence: "medium",
      reason: "manual browser review: linked video is titled Resident Evil 4 - PSVita Port: First optimizations batch"
    }
  }
];

const existingUrls = new Set(quarantine.items.map((item) => item.source?.canonical_url).filter(Boolean));
const ledgerSource = fs.readFileSync(ledgerPath, "utf8");
const knownLeadKeys = new Set((ledgerSource.match(/https:\/\/(?:www\.)?reddit\.com\/[^"']+/g) || []).map(keyOf));
const detectedAt = new Date().toISOString();
const added = [];
const auditEvents = [];

for (const observation of observations) {
  if (knownLeadKeys.has(keyOf(observation.url)) || existingUrls.has(observation.url)) continue;
  const classification = observation.manualClassification || classify(observation);
  if (!classification.accept) {
    throw new Error("Manual observation did not pass classification: " + observation.title + " :: " + classification.reason);
  }
  const contentHash = createHash("sha256").update(JSON.stringify({
    title: observation.title,
    body: observation.body || "",
    outbound_urls: observation.outbound_urls || [],
    media_urls: [],
    media_hashes: []
  })).digest("hex");
  const result = assessCandidate(observation, {
    subreddit: observation.subreddit,
    detectedAt,
    classification,
    candidateType: classifyCandidateType(observation),
    contentHash
  });
  if (!result.record) throw new Error("Could not ingest " + observation.url + ": " + result.errors.join(", "));
  const record = {
    ...result.record,
    state_history: result.record.state_history.map((event) => ({
      ...event,
      actor: "codex",
      reason: event.state === "DETECTED"
        ? "Observed in the authenticated manual Reddit scan"
        : "Manual browser observation passed the provenance ingestion boundary"
    }))
  };
  added.push(record);
  existingUrls.add(observation.url);
  auditEvents.push({
    schema_version: 1,
    at: detectedAt,
    actor: "codex",
    action: "manual_browser_ingestion",
    candidate_id: record.id,
    from_state: "UNSEEN",
    to_state: record.state,
    reason: "Authenticated Reddit scan captured a port-development signal while RSS coverage was incomplete",
    source_url: observation.url,
    public_containment: "review_queue"
  });
}

if (added.length === 0) {
  console.log(JSON.stringify({ added: [], internal_items: quarantine.items.length }));
  process.exit(0);
}

const items = correlateCampaigns([...quarantine.items, ...added]);
const nextQuarantine = { ...quarantine, generated_at: detectedAt, items };
fs.writeFileSync(quarantinePath, JSON.stringify(nextQuarantine, null, 2) + "\n", "utf8");
fs.writeFileSync(
  publicPath,
  JSON.stringify(publicDocument(items, detectedAt, quarantine.source.replace(/ RSS$/, "")), null, 2) + "\n",
  "utf8"
);
fs.appendFileSync(auditPath, auditEvents.map((event) => JSON.stringify(event)).join("\n") + "\n", "utf8");
console.log(JSON.stringify({ added: added.map((record) => record.id), internal_items: items.length, public_items: publicDocument(items, detectedAt, "").items.length }));
