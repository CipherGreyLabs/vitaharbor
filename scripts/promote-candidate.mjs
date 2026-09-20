// Explicit operator workflow for quarantined Reddit candidates.
// No command in this file is called by the scanner or CI. Promotion requires a
// reviewer, a rationale and a machine-readable evidence bundle.
//
// Examples:
//   node scripts/promote-candidate.mjs --list
//   node scripts/promote-candidate.mjs --inspect --id reddit-abc123
//   node scripts/promote-candidate.mjs --verify --id reddit-abc123 --reviewer name --reason "..." --evidence-file review.json
//   node scripts/promote-candidate.mjs --promote --id reddit-abc123 --reviewer name --reason "..." --evidence-file review.json --name "Exact name" --repo-url https://github.com/org/repo
//   node scripts/promote-candidate.mjs --reject --id reddit-abc123 --reviewer name --reason "..."

import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import {
  canonicalizeEvidenceUrl,
  publicCandidate,
  transitionState
} from "./reddit-provenance.mjs";

const ROOT = process.cwd();
const LEDGER = path.resolve(ROOT, "src/shared/constants/fallbackData.ts");
const QUARANTINE = path.resolve(ROOT, "data/quarantine.json");
const AUDIT = path.resolve(ROOT, "data/provenance-audit.jsonl");

const args = process.argv.slice(2);
const readFlag = (name) => {
  const index = args.indexOf(name);
  return index === -1 ? null : args[index + 1] ?? null;
};
const has = (name) => args.includes(name);
const action = ["--list", "--inspect", "--verify", "--promote", "--reject", "--block"].find(has) || "--list";

function fail(message) {
  console.error("ERROR: " + message);
  process.exit(1);
}

function loadDocument() {
  if (!fs.existsSync(QUARANTINE)) fail("data/quarantine.json does not exist; run npm run data:scan first.");
  const doc = JSON.parse(fs.readFileSync(QUARANTINE, "utf8"));
  if (doc.schema_version !== 2 || !Array.isArray(doc.items)) fail("invalid quarantine schema; expected schema_version 2 and items[].");
  return doc;
}

function writeDocument(doc) {
  fs.writeFileSync(QUARANTINE, JSON.stringify(doc, null, 2) + "\n", "utf8");
}

function candidateId() {
  return readFlag("--id") || "";
}

function getCandidate(doc) {
  const id = candidateId();
  if (!id) fail("--id is required for this action. Use --list first.");
  const index = doc.items.findIndex((item) => item.id === id);
  if (index === -1) fail("candidate not found: " + id);
  return { item: doc.items[index], index };
}

function requireText(name, minimum = 1) {
  const value = String(readFlag(name) || "").trim();
  if (value.length < minimum) fail(name + " is required and must contain at least " + minimum + " characters.");
  return value;
}

function parseObservedAt(value) {
  const date = new Date(String(value || ""));
  if (Number.isNaN(date.getTime())) fail("evidence observed_at must be an ISO date.");
  return date.toISOString();
}

function loadEvidence(candidate, requirePromotion) {
  const file = readFlag("--evidence-file");
  if (!file) fail("--evidence-file is required; promotion cannot rely on a free-text claim.");
  const evidencePath = path.resolve(ROOT, file);
  if (!fs.existsSync(evidencePath)) fail("evidence file not found: " + file);
  let bundle;
  try {
    bundle = JSON.parse(fs.readFileSync(evidencePath, "utf8"));
  } catch (error) {
    fail("evidence file is not valid JSON: " + error.message);
  }
  if (!bundle || typeof bundle !== "object" || !Array.isArray(bundle.sources) || bundle.sources.length === 0) {
    fail("evidence bundle requires a non-empty sources array.");
  }
  const sources = bundle.sources.map((source, index) => {
    const url = canonicalizeEvidenceUrl(source?.url) || (index === 0 ? candidate.source?.canonical_url : null);
    if (!url) fail("evidence source " + (index + 1) + " has no allowed HTTPS source URL.");
    return {
      type: String(source?.type || "source").slice(0, 40),
      url,
      observed_at: parseObservedAt(source?.observed_at),
      note: String(source?.note || "").trim().slice(0, 1000)
    };
  });
  const normalized = {
    schema_version: 1,
    reviewer: String(bundle.reviewer || readFlag("--reviewer") || "").trim().slice(0, 120),
    reviewed_at: parseObservedAt(bundle.reviewed_at || new Date().toISOString()),
    sources,
    findings: String(bundle.findings || "").trim().slice(0, 3000),
    repository_url: canonicalizeEvidenceUrl(bundle.repository_url) || null,
    repository_identity: String(bundle.repository_identity || "").trim().slice(0, 500),
    repository_created_at: bundle.repository_created_at ? parseObservedAt(bundle.repository_created_at) : null,
    repository_last_activity_at: bundle.repository_last_activity_at ? parseObservedAt(bundle.repository_last_activity_at) : null,
    release_facts: Array.isArray(bundle.release_facts) ? bundle.release_facts.slice(0, 20) : [],
    release_url: canonicalizeEvidenceUrl(bundle.release_url) || null,
    vita_hardware_result: String(bundle.vita_hardware_result || "").trim().slice(0, 2000),
    vita_evidence: Array.isArray(bundle.vita_evidence) ? bundle.vita_evidence.slice(0, 20) : [],
    author_linkage: String(bundle.author_linkage || "").trim().slice(0, 1000),
    corroboration: Array.isArray(bundle.corroboration) ? bundle.corroboration.slice(0, 20) : [],
    duplicate_relation: bundle.duplicate_relation && typeof bundle.duplicate_relation === "object" ? bundle.duplicate_relation : { related_candidate_ids: [] },
    content_hash: String(bundle.content_hash || "").trim().slice(0, 128),
    risk_disposition: String(bundle.risk_disposition || "").trim().slice(0, 1000)
  };
  if (!normalized.reviewer) fail("evidence bundle requires reviewer.");
  if (!normalized.findings) fail("evidence bundle requires findings.");
  if (requirePromotion) {
    if (!normalized.repository_url) fail("promotion evidence requires repository_url on an allowed source host.");
    if (!normalized.repository_identity) fail("promotion evidence requires repository_identity.");
    if (!normalized.repository_created_at || !normalized.repository_last_activity_at) fail("promotion evidence requires repository creation and last-activity timestamps.");
    if (normalized.release_facts.length === 0) fail("promotion evidence requires release_facts, even when the record is a development build.");
    if (!normalized.vita_hardware_result) fail("promotion evidence requires vita_hardware_result.");
    if (normalized.vita_evidence.length === 0) fail("promotion evidence requires vita_evidence.");
    if (!normalized.author_linkage) fail("promotion evidence requires author_linkage.");
    if (normalized.corroboration.length === 0) fail("promotion evidence requires independent corroboration.");
    if (candidate.content_hash && normalized.content_hash !== candidate.content_hash) fail("promotion evidence content_hash does not match the scanned candidate.");
    if (candidate.risk_signals?.length && !normalized.risk_disposition) {
      fail("promotion evidence must explain how each risk signal was resolved.");
    }
  }
  return { bundle: normalized, path: evidencePath };
}

function appendAudit(event) {
  fs.mkdirSync(path.dirname(AUDIT), { recursive: true });
  fs.appendFileSync(AUDIT, JSON.stringify(event) + "\n", "utf8");
}

function listCandidates(doc) {
  const visible = doc.items.filter((item) => ["QUARANTINED", "VERIFIED_FOR_REVIEW"].includes(item.state));
  if (visible.length === 0) {
    console.log("No candidates awaiting manual review.");
    return;
  }
  visible.forEach((item, index) => {
    const safe = publicCandidate(item);
    console.log(String(index + 1).padStart(2) + ". " + item.id + " · " + item.state);
    console.log("    " + (safe?.title || "Source candidate") + " · " + (item.source?.subreddit || "unknown subreddit"));
    console.log("    " + (item.source?.canonical_url || "no canonical URL"));
    console.log("    gaps: " + (item.evidence_gaps || []).join(", ") + "\n");
  });
}

function inspectCandidate(doc) {
  const { item } = getCandidate(doc);
  console.log(JSON.stringify(item, null, 2));
}

function updateReviewState(doc, nextState) {
  const { item, index } = getCandidate(doc);
  if (!["QUARANTINED", "VERIFIED_FOR_REVIEW"].includes(item.state)) {
    fail("candidate is not reviewable from state " + item.state);
  }
  const reason = requireText("--reason", 12);
  const reviewer = requireText("--reviewer", 2);
  const needsEvidence = nextState === "VERIFIED_FOR_REVIEW" || nextState === "PROMOTED";
  const evidence = needsEvidence ? loadEvidence(item, nextState === "PROMOTED") : null;
  if (item.risk_signals?.includes("explicit_fake_or_troll") && nextState === "PROMOTED" && !has("--allow-risk")) {
    fail("explicit fake/troll signals require --allow-risk plus a written risk_disposition.");
  }
  const now = new Date().toISOString();
  const reviewed = {
    reviewer,
    reviewed_at: now,
    reason,
    evidence_bundle: evidence ? {
      file: path.relative(ROOT, evidence.path).replaceAll("\\", "/"),
      sha256: createHash("sha256").update(fs.readFileSync(evidence.path)).digest("hex"),
      ...evidence.bundle
    } : null
  };
  let updated = transitionState(item, nextState, { actor: reviewer, at: now, reason });
  updated = { ...updated, review: reviewed };
  doc.items[index] = updated;
  writeDocument(doc);
  appendAudit({
    schema_version: 1,
    at: now,
    actor: reviewer,
    action: nextState,
    candidate_id: item.id,
    from_state: item.state,
    to_state: nextState,
    reason,
    evidence_bundle_sha256: reviewed.evidence_bundle?.sha256 || null
  });
  return { item, updated };
}

function insertBeforeArrayEnd(source, arrayHeader, entry) {
  const arrayStart = source.indexOf(arrayHeader);
  if (arrayStart === -1) fail("could not find " + arrayHeader);
  const match = /\r?\n\];/.exec(source.slice(arrayStart));
  if (!match) fail("could not find the end of " + arrayHeader);
  const close = arrayStart + match.index;
  return source.slice(0, close) + entry + source.slice(close);
}

function slugify(value) {
  return String(value || "untitled-port")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "untitled-port";
}

function promoteLedger(candidate, displayName, repoUrl) {
  let source = fs.readFileSync(LEDGER, "utf8");
  const line = source.includes("\r\n") ? "\r\n" : "\n";
  const gameIds = [...source.matchAll(/\{ id: (\d+), slug: /g)].map((match) => Number(match[1]));
  const projectIds = [...source.matchAll(/^    id: (\d+),$/gm)].map((match) => Number(match[1]));
  const taken = new Set([...source.matchAll(/slug: "([a-z0-9-]+)"/g)].map((match) => match[1]));
  const id = Math.max(0, ...gameIds, ...projectIds) + 1;
  const base = slugify(displayName);
  let slug = base;
  let suffix = 2;
  while (taken.has(slug)) slug = base + "-" + suffix++;
  const title = JSON.stringify(displayName);
  const lowerTitle = JSON.stringify(displayName.toLowerCase());
  const summary = JSON.stringify("Manually promoted after source and Vita evidence review.");
  const firstSeen = JSON.stringify(candidate.source?.published_at || new Date().toISOString());
  const now = JSON.stringify(new Date().toISOString());
  const repo = JSON.stringify(repoUrl);
  const reddit = JSON.stringify(candidate.source.canonical_url);
  const gameEntry = line + "  { id: " + id + ", slug: " + JSON.stringify(slug) + ", title: " + title +
    ", normalized_title: " + lowerTitle + ", original_release_year: null, original_platform: \"Unknown\", created_at: new Date(" + firstSeen + "), updated_at: new Date(" + now + ") }";
  const projectEntry = line + "  {" + line +
    "    id: " + id + "," + line +
    "    game_id: " + id + "," + line +
    "    slug: " + JSON.stringify(slug) + "," + line +
    "    reddit_url: " + reddit + "," + line +
    "    repo_url: " + repo + "," + line +
    "    display_name: " + title + "," + line +
    "    current_stage: \"announced\"," + line +
    "    lifecycle: \"active\"," + line +
    "    summary: " + summary + "," + line +
    "    playability_notes: null," + line +
    "    performance_notes: null," + line +
    "    first_seen_at: new Date(" + firstSeen + ")," + line +
    "    last_activity_at: new Date(" + now + ")," + line +
    "    released_at: null," + line +
    "    is_featured: false," + line +
    "    is_archived: false," + line +
    "    verification: \"developer_direct\"," + line +
    "    game_title: " + title + "," + line +
    "    original_platform: \"Unknown\"," + line +
    "    original_release_year: null," + line +
    "    technologies: []," + line +
    "    developers: []" + line +
    "  }";
  source = insertBeforeArrayEnd(source, "export const FALLBACK_GAMES: Game[] = [", gameEntry);
  source = insertBeforeArrayEnd(source, "export const FALLBACK_PROJECTS: any[] = [", projectEntry);
  fs.writeFileSync(LEDGER, source, "utf8");
  return { id, slug };
}

const document = loadDocument();
if (action === "--list") listCandidates(document);
else if (action === "--inspect") inspectCandidate(document);
else if (action === "--verify") {
  const result = updateReviewState(document, "VERIFIED_FOR_REVIEW");
  console.log("Verified for review only: " + result.item.id + ". Promotion still requires a separate --promote command.");
} else if (action === "--reject" || action === "--block") {
  const next = action === "--reject" ? "REJECTED" : "BLOCKED_UNVERIFIED";
  const result = updateReviewState(document, next);
  console.log(next + ": " + result.item.id);
} else if (action === "--promote") {
  const { item } = getCandidate(document);
  if (item.state !== "VERIFIED_FOR_REVIEW") fail("promotion requires state VERIFIED_FOR_REVIEW; run --verify with evidence first.");
  const displayName = requireText("--name", 2);
  const repoUrl = canonicalizeEvidenceUrl(readFlag("--repo-url"));
  if (!repoUrl) fail("--repo-url must be an allowed HTTPS repository URL.");
  const result = updateReviewState(document, "PROMOTED");
  const evidence = result.updated.review?.evidence_bundle;
  if (!evidence?.repository_url) fail("promotion evidence must include repository_url.");
  const promoted = promoteLedger(result.item, displayName, repoUrl);
  console.log("Promoted only after explicit reviewer action and evidence bundle: " + result.item.id);
  console.log("  ledger slug: " + promoted.slug + " (id " + promoted.id + ")");
  console.log("  curated ledger was not touched by the scanner; this command performed the manual write.");
}
