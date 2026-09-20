import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import {
  assessCandidate,
  correlateCampaigns,
  publicDocument,
  PROVENANCE_SCHEMA_VERSION,
  upgradeProvenanceRecord
} from "../reddit-provenance.mjs";

const root = process.cwd();
const inputPath = path.resolve(root, "data/remote-scanner-reconciliation-2026-09-20.json");
const quarantinePath = path.resolve(root, "data/quarantine.json");
const publicPath = path.resolve(root, "public/data/discovered.json");
const auditPath = path.resolve(root, "data/provenance-audit.jsonl");
const input = JSON.parse(fs.readFileSync(inputPath, "utf8"));
const quarantine = JSON.parse(fs.readFileSync(quarantinePath, "utf8"));
if (quarantine.schema_version !== PROVENANCE_SCHEMA_VERSION || !Array.isArray(quarantine.items)) {
  throw new Error("Expected v2 data/quarantine.json");
}

const existingUrls = new Set(quarantine.items.map((item) => item.source?.canonical_url).filter(Boolean));
const auditLines = fs.existsSync(auditPath)
  ? fs.readFileSync(auditPath, "utf8").split(/\r?\n/).filter(Boolean)
  : [];
const auditedIds = new Set(auditLines.map((line) => {
  try { return JSON.parse(line); } catch { return null; }
}).filter((event) => event?.action === "remote_scanner_reconciliation").map((event) => event.candidate_id));
const reconciledAt = new Date().toISOString();
const added = [];
const auditEvents = [];

for (const observation of input.observations) {
  if (existingUrls.has(observation.url)) continue;

  const contentHash = createHash("sha256").update(JSON.stringify({
    title: observation.title,
    body: "",
    outbound_urls: [],
    media_urls: [],
    media_hashes: []
  })).digest("hex");
  const result = assessCandidate({
    title: observation.title,
    body: "",
    author: observation.author,
    url: observation.url,
    published: observation.published
  }, {
    subreddit: observation.subreddit,
    detectedAt: observation.detected_at,
    classification: {
      accept: true,
      confidence: observation.confidence,
      reason: observation.classification_reason
    },
    candidateType: observation.candidate_type,
    contentHash
  });
  if (!result.record) throw new Error("Could not reconcile " + observation.url + ": " + result.errors.join(", "));

  const record = upgradeProvenanceRecord({
    ...result.record,
    state_history: result.record.state_history.map((event) => event.state === "QUARANTINED"
      ? {
          ...event,
          actor: "reconciliation",
          reason: "Reconciled from a legacy remote scanner projection; requires fresh source review"
        }
      : event),
    evidence_gaps: [...new Set([
      ...result.record.evidence_gaps,
      "raw post body and scanner payload were unavailable in the remote public projection"
    ])]
  });
  added.push(record);
  existingUrls.add(observation.url);

  if (!auditedIds.has(record.id)) {
    auditEvents.push({
      schema_version: 1,
      at: reconciledAt,
      actor: "reconciliation",
      action: "remote_scanner_reconciliation",
      candidate_id: record.id,
      from_state: "LEGACY_PUBLIC_ONLY",
      to_state: record.state,
      reason: "Preserved a remote scanner discovery without promotion; body, repository and hardware evidence remain unverified",
      source_url: observation.url,
      source_commits: input.remote_commits,
      source_public_schema: input.source_public_schema,
      evidence_gaps: record.evidence_gaps,
      public_containment: "review_queue"
    });
  }
}

if (added.length === 0) {
  console.log(JSON.stringify({ added: [], audit_events: 0, internal_items: quarantine.items.length, public_items: JSON.parse(fs.readFileSync(publicPath, "utf8")).items.length }));
  process.exit(0);
}

const items = correlateCampaigns([...quarantine.items, ...added]);
const nextQuarantine = {
  ...quarantine,
  generated_at: reconciledAt,
  items
};
fs.writeFileSync(quarantinePath, JSON.stringify(nextQuarantine, null, 2) + "\n", "utf8");
fs.writeFileSync(
  publicPath,
  JSON.stringify(publicDocument(items, reconciledAt, quarantine.source.replace(/ RSS$/, "")), null, 2) + "\n",
  "utf8"
);
if (auditEvents.length > 0) {
  fs.appendFileSync(auditPath, auditEvents.map((event) => JSON.stringify(event)).join("\n") + "\n", "utf8");
}

console.log(JSON.stringify({ added: added.map((record) => record.id), audit_events: auditEvents.length, internal_items: items.length, public_items: publicDocument(items, reconciledAt, "").items.length }));
