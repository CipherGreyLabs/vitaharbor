import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";

const ROOT = process.cwd();
const REFS = path.resolve(ROOT, "data", "references");
fs.mkdirSync(REFS, { recursive: true });

const bundles = [
  {
    file: "theforceengine-2026-10-02.json",
    bundle: {
      schema_version: 1,
      reviewer: "codex",
      reviewed_at: "2026-10-02T12:00:00.000Z",
      sources: [
        { type: "reddit", url: "https://www.reddit.com/r/vitahacks/comments/1wlrv6x/theforceenginevita_successfully_booting_into_the/", observed_at: "2026-09-21T13:23:12.000Z", note: "Thread shows TheForceEngine-VITA reaching its main menu; OP says substantial work remains." }
      ],
      findings: "Re-verified in the Oct 2 scan: TheForceEngine-VITA main-menu boot is a genuine development signal. No exact public Vita repository, release/build artifact, independent corroboration or verified hardware result was found, so it stays review-only.",
      repository_url: null,
      repository_identity: "",
      repository_created_at: null,
      repository_last_activity_at: null,
      release_facts: [],
      release_url: null,
      vita_hardware_result: "",
      vita_evidence: [],
      author_linkage: "",
      corroboration: [],
      duplicate_relation: { related_candidate_ids: [] },
      content_hash: "1e1afbafe359a60d328be655b00ccaf382613bfad2c31971bffd98af6924e594",
      risk_disposition: "No risk signals fired; the post is a development progress report. Missing project evidence remains unresolved, so no promotion."
    }
  },
  {
    file: "buckshot-roulette-2026-10-02.json",
    bundle: {
      schema_version: 1,
      reviewer: "codex",
      reviewed_at: "2026-10-02T12:00:00.000Z",
      sources: [
        { type: "reddit", url: "https://www.reddit.com/r/vitahacks/comments/1wn46c9/wip_buckshotrouletteportable_a_c_rewrite_of/", observed_at: "2026-09-22T12:16:16.397Z", note: "OP states a C++ rewrite of Buckshot Roulette targeting 60 FPS on real Vita hardware using VitaGL." }
      ],
      findings: "Re-verified in the Oct 2 scan: BuckshotRoulettePortable is a credible WIP engine rewrite. No exact public Vita repository, release/build artifact, independent corroboration or verified hardware result was found, so it stays review-only.",
      repository_url: null,
      repository_identity: "",
      repository_created_at: null,
      repository_last_activity_at: null,
      release_facts: [],
      release_url: null,
      vita_hardware_result: "",
      vita_evidence: [],
      author_linkage: "",
      corroboration: [],
      duplicate_relation: { related_candidate_ids: [] },
      content_hash: "c47d173ae587b5fbb25fa06b960ae28ef45f1f162a1360225504c57e93ec7813",
      risk_disposition: "The question_or_request risk signal fired on thread wording, but the post itself is a development progress report. Missing project evidence remains unresolved, so no promotion."
    }
  },
  {
    file: "real-racing-3-2026-10-02.json",
    bundle: {
      schema_version: 1,
      reviewer: "codex",
      reviewed_at: "2026-10-02T12:00:00.000Z",
      sources: [
        { type: "reddit", url: "https://www.reddit.com/r/PSVitaHomebrew/comments/1wsh59n/the_impossible_real_racing_3_vita_port/", observed_at: "2026-09-30T19:19:05.523Z", note: "Developer chutA7X (same author as the released Real Racing 2 Vita port) announces a Real Racing 3 Vita public beta for Saturday Oct 3." }
      ],
      findings: "Re-verified in the Oct 2 scan: Real Racing 3 is announced by the same developer who shipped the Real Racing 2 Vita port, which gives strong author linkage. The repo is still private and no public release/build artifact exists yet, so it stays review-only until the public beta lands.",
      repository_url: null,
      repository_identity: "",
      repository_created_at: null,
      repository_last_activity_at: null,
      release_facts: [],
      release_url: null,
      vita_hardware_result: "",
      vita_evidence: [],
      author_linkage: "chutA7X is the same developer behind the released Real Racing 2 Vita port (ledger id 35)",
      corroboration: [],
      duplicate_relation: { related_candidate_ids: [] },
      content_hash: "f0c5e2c0df08cd5b337a9981eaf26f9853c48326377d8baa648852d68e8de3e8",
      risk_disposition: "No risk signals fired. Strong author linkage exists but no public repository or release evidence, so no promotion."
    }
  }
];

for (const b of bundles) {
  const p = path.resolve(REFS, b.file);
  fs.writeFileSync(p, JSON.stringify(b.bundle, null, 2) + "\n", "utf8");
  console.log(b.file + " sha256=" + createHash("sha256").update(fs.readFileSync(p)).digest("hex"));
}
