// One-time migration of the legacy public discovery queue into the internal
// provenance schema. It never touches FALLBACK_PROJECTS or FALLBACK_UPDATES.

import fs from "node:fs";
import path from "node:path";
import { migrateLegacyCandidate, publicDocument, PROVENANCE_SCHEMA_VERSION } from "./reddit-provenance.mjs";

const root = process.cwd();
const legacyPath = path.resolve(root, "public/data/discovered.json");
const internalPath = path.resolve(root, "data/quarantine.json");

if (fs.existsSync(internalPath)) {
  console.log("Quarantine migration skipped: data/quarantine.json already exists.");
  process.exit(0);
}

const legacy = fs.existsSync(legacyPath)
  ? JSON.parse(fs.readFileSync(legacyPath, "utf8"))
  : { generated_at: new Date().toISOString(), source: "legacy discovery queue", items: [] };
const results = (Array.isArray(legacy.items) ? legacy.items : [])
  .map((item) => migrateLegacyCandidate(item, { detectedAt: legacy.generated_at }))
  .filter((result) => result.record);
const now = new Date().toISOString();
const records = results.map((result) => result.record);

fs.mkdirSync(path.dirname(internalPath), { recursive: true });
fs.writeFileSync(internalPath, JSON.stringify({
  schema_version: PROVENANCE_SCHEMA_VERSION,
  generated_at: now,
  source: legacy.source || "legacy discovery queue",
  migration: {
    from: "public/data/discovered.json schema v1",
    migrated_at: now,
    promoted_count: 0,
    rejected_count: 0
  },
  items: records
}, null, 2) + "\n", "utf8");
fs.writeFileSync(legacyPath, JSON.stringify(publicDocument(records, now, "quarantined migration"), null, 2) + "\n", "utf8");

console.log("Migrated " + records.length + " legacy candidates to data/quarantine.json.");
console.log("Promotion writes: 0 (all records remain QUARANTINED).");
