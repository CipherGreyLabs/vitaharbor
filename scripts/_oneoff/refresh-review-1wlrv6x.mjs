// Refresh the stored review bundle for reddit-1wlrv6x (TheForceEngine-VITA) with the
// Oct 2 re-verification. The candidate is already VERIFIED_FOR_REVIEW, so this updates
// the review record in place instead of attempting a same-state transition.
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { publicDocument } from "../reddit-provenance.mjs";

const ROOT = process.cwd();
const QUARANTINE = path.resolve(ROOT, "data", "quarantine.json");
const PUBLIC_OUT = path.resolve(ROOT, "public", "data", "discovered.json");

const doc = JSON.parse(fs.readFileSync(QUARANTINE, "utf8"));
const idx = doc.items.findIndex((i) => i.id === "reddit-1wlrv6x");
if (idx === -1) {
  console.error("ERROR: candidate reddit-1wlrv6x not found");
  process.exit(1);
}

const item = doc.items[idx];
if (item.state !== "VERIFIED_FOR_REVIEW") {
  console.error("ERROR: candidate is not VERIFIED_FOR_REVIEW, refusing in-place review refresh");
  process.exit(1);
}

const evidencePath = path.resolve(ROOT, "data", "references", "theforceengine-2026-10-02.json");
const bundle = JSON.parse(fs.readFileSync(evidencePath, "utf8"));
const now = new Date().toISOString();

item.review = {
  reviewer: bundle.reviewer,
  reviewed_at: now,
  reason: "Re-verified in the Oct 2 scan: genuine TheForceEngine-VITA main-menu boot; repository evidence still incomplete",
  evidence_bundle: {
    file: "data/references/theforceengine-2026-10-02.json",
    sha256: createHash("sha256").update(fs.readFileSync(evidencePath)).digest("hex"),
    ...bundle
  }
};
item.state_history.push({
  state: "VERIFIED_FOR_REVIEW",
  at: now,
  actor: "codex",
  reason: "Review bundle refreshed from the Oct 2 scan re-verification"
});

fs.writeFileSync(QUARANTINE, JSON.stringify(doc, null, 2) + "\n", "utf8");
fs.writeFileSync(PUBLIC_OUT, JSON.stringify(publicDocument(doc.items), null, 2) + "\n", "utf8");
console.log("OK: reddit-1wlrv6x review refreshed, state stays VERIFIED_FOR_REVIEW");
