// One-time, evidence-backed containment for VH-INCIDENT-010.
// This records observed Reddit items in the internal quarantine only. It never
// writes the curated ledger and never calls Reddit or performs Reddit actions.
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import {
  assessCandidate,
  candidateIdFromUrl,
  containIncidentRecords,
  migrateLegacyCandidate,
  publicDocument,
  PROVENANCE_SCHEMA_VERSION,
  upgradeProvenanceRecord
} from "./reddit-provenance.mjs";

const ROOT = process.cwd();
const INCIDENT_ID = "VH-INCIDENT-010";
const ACTOR = "incident-response";
const QUARANTINE = path.resolve(ROOT, "data/quarantine.json");
const PUBLIC_OUT = path.resolve(ROOT, "public/data/discovered.json");
const AUDIT = path.resolve(ROOT, "data/provenance-audit.jsonl");

const observations = [
  {
    subreddit: "VitaPiracy",
    author: "LefterisDaGamer",
    url: "https://www.reddit.com/r/VitaPiracy/comments/1wlj9gd/hey_guys_we_should_start_making_posts_about_fake/",
    title: "hey guys we should start making posts about fake ports to troll VitaHarbor ( a site telling people about new ports)",
    body: "would be very funny",
    published: "2026-09-20T14:58:36.001Z",
    classification: { accept: true, confidence: "high", reason: "Incident evidence: explicit fake-port campaign intent" }
  },
  {
    subreddit: "VitaPiracy",
    author: "LefterisDaGamer",
    url: "https://www.reddit.com/r/VitaPiracy/comments/1wlkdva/keeperrl_vita_announcement/",
    title: "KeeperRL Vita announcement!",
    body: "so , this is unrelated to my previous post about trolling VitaHarbor (actually this time btw) , and i forced claude to port KeeperRL ( a niche open source roque like) to the PS VITA! currently , the port DOES start but the log says KeeperRL for PS Vita starting (heap 192 MB) FATAL main.cpp:165 Uncaught exception: Enable multithreading to use std::thread: Not owner now based off some researching , it is that multithreading is disabled also , paid assets likely wont work (do to ram limitations ) so limited to ASCII only anyways Coming Soon! Edit : i will post a github link when i get it to run",
    published: "2026-09-20T15:42:26.424Z",
    classification: { accept: true, confidence: "medium", reason: "Incident review: linked follow-up claim without repository or release evidence" }
  },
  {
    subreddit: "vitahacks",
    author: "LefterisDaGamer",
    url: "https://www.reddit.com/r/vitahacks/comments/1wlkixu/keeperrl_vita_announcement/",
    title: "KeeperRL Vita announcement!",
    body: "so .... i forced claude to port KeeperRL ( a niche open source roque like) to the PS VITA! currently , the port DOES start but the log says KeeperRL for PS Vita starting (heap 192 MB) FATAL main.cpp:165 Uncaught exception: Enable multithreading to use std::thread: Not owner now based off some researching , it is that multithreading is disabled also, paid assets likely wont work (do to ram limitations ) so limited to ASCII only anyways Coming Soon! Also, i will post a github link in the comments when i get it to run",
    published: "2026-09-20T15:47:59.851Z",
    classification: { accept: true, confidence: "medium", reason: "Incident review: near-duplicate cross-community claim without repository or release evidence" }
  }
];

function contentHash(observation) {
  return createHash("sha256").update(JSON.stringify({
    title: observation.title,
    body: observation.body
  })).digest("hex");
}

function loadDocument() {
  if (!fs.existsSync(QUARANTINE)) {
    return { schema_version: PROVENANCE_SCHEMA_VERSION, generated_at: null, source: "r/vitahacks + r/VitaPiracy + r/PSVitaHomebrew RSS", items: [] };
  }
  const parsed = JSON.parse(fs.readFileSync(QUARANTINE, "utf8"));
  const items = Array.isArray(parsed.items) ? parsed.items : [];
  return {
    ...parsed,
    schema_version: PROVENANCE_SCHEMA_VERSION,
    items: items.map((item) => upgradeProvenanceRecord(item))
  };
}

function buildRecord(observation, detectedAt) {
  const result = assessCandidate(observation, {
    subreddit: observation.subreddit,
    detectedAt,
    classification: observation.classification,
    candidateType: "port",
    contentHash: contentHash(observation)
  });
  if (!result.record) throw new Error("Incident observation failed provenance validation: " + observation.url);
  return result.record;
}

function appendAudit(events) {
  if (events.length === 0) return;
  fs.mkdirSync(path.dirname(AUDIT), { recursive: true });
  fs.appendFileSync(AUDIT, events.map((event) => JSON.stringify(event)).join("\n") + "\n", "utf8");
}

const at = new Date().toISOString();
const document = loadDocument();
const knownIds = new Set(document.items.map((item) => item.id));
const initialIds = new Set(knownIds);
for (const observation of observations) {
  const id = candidateIdFromUrl(observation.url);
  if (!knownIds.has(id)) {
    document.items.push(buildRecord(observation, at));
    knownIds.add(id);
  }
}

const rejectedId = candidateIdFromUrl(observations[0].url);
const blockedIds = observations.slice(1).map((observation) => candidateIdFromUrl(observation.url));
const before = new Map(document.items.map((item) => [item.id, item.state]));
const contained = containIncidentRecords(document.items, {
  incidentId: INCIDENT_ID,
  rejectedIds: [rejectedId],
  blockedIds,
  actor: ACTOR,
  at
});

document.generated_at = at;
document.items = contained.sort((left, right) =>
  new Date(right.source?.published_at || right.state_history?.[0]?.at || 0) -
  new Date(left.source?.published_at || left.state_history?.[0]?.at || 0)
);

fs.mkdirSync(path.dirname(QUARANTINE), { recursive: true });
fs.writeFileSync(QUARANTINE, JSON.stringify(document, null, 2) + "\n", "utf8");
const publicDoc = publicDocument(document.items);
fs.mkdirSync(path.dirname(PUBLIC_OUT), { recursive: true });
fs.writeFileSync(PUBLIC_OUT, JSON.stringify(publicDoc, null, 2) + "\n", "utf8");

const auditEvents = contained
  .filter((item) => item.incident?.incident_id === INCIDENT_ID && before.get(item.id) !== item.state)
  .map((item) => ({
    schema_version: 1,
    at,
    actor: ACTOR,
    action: "incident_containment",
    incident_id: INCIDENT_ID,
    candidate_id: item.id,
    from_state: before.get(item.id) || "UNKNOWN",
    to_state: item.state,
    reason: item.incident.rationale,
    source_url: item.source?.canonical_url || null,
    public_containment: item.incident.public_containment
  }));
appendAudit(auditEvents);

console.log(JSON.stringify({
  incident_id: INCIDENT_ID,
  records_added: observations.filter((observation) => !initialIds.has(candidateIdFromUrl(observation.url))).length,
  rejected: contained.filter((item) => item.incident?.incident_id === INCIDENT_ID && item.state === "REJECTED").map((item) => item.id),
  blocked_unverified: contained.filter((item) => item.incident?.incident_id === INCIDENT_ID && item.state === "BLOCKED_UNVERIFIED").map((item) => item.id),
  public_items: publicDoc.items.length,
  audit_events: auditEvents.length
}, null, 2));
