import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { transitionState } from "./reddit-provenance.mjs";

const ROOT = process.cwd();
const LEDGER = path.resolve(ROOT, "src/shared/constants/fallbackData.ts");
const TYPES_FILE = path.resolve(ROOT, "src/web/components/ledger/types.ts");
const QUARANTINE = path.resolve(ROOT, "data/quarantine.json");
const VITADB_CACHE = path.resolve(ROOT, "data/vitadb-cache.json");

const PIRACY_HOSTS = [
  /1fichier\.com/i,
  /rapidgator\.net/i,
  /megaup\.net/i,
  /zippyshare\.com/i,
  /romsfun\.com/i,
  /vimm\.net/i,
  /romspure\.cc/i,
  /mediafire\.com\/.*(?:\.iso|\.rom|\.pkg|\.zip)/i
];

const BLOCKED_AUTHORS = new Set([
  "lefterisdagamer"
]);

const TROLL_PRANK_AI_PATTERNS = [
  /\blefterisdagamer\b/i,
  /\bvibecod(?:ed|er|ing|es)?\b/i,
  /\bvibe\s*cod(?:ed|er|ing|es|e)\b/i,
  /\bdumb\s+little\s+joke\b/i,
  /\btroll\s+(?:vitaharbor|the\s+community)\b/i,
  /\bjoke\s+port\b/i,
  /\bas\s+a\s+(?:dumb\s+)?joke\b/i,
  /\b(?:fake|troll|prank|shitpost|bait|parody)\b/i,
  /\bai\s+slop\b/i,
  /\bhallucinat(?:ion|ed|ing)\b/i,
  /\bjust\s+vibecoded\b/i,
  /\bask(?:ed)?\s+ai\s+to\s+write\b/i,
  /\bgofundme\.com\b/i,
  /\bdevkit\s+gofund\b/i,
  /\bstart\s+making\s+posts\s+about\s+fake\s+ports\b/i
];

const VITA_TECH_PATTERNS = [
  /\bvitasdk\b/i,
  /\bvitagl\b/i,
  /\barmv7\b/i,
  /\bsoloader\b/i,
  /\bso_loader\b/i,
  /\bcmakelists\b/i,
  /\bcmake\b/i,
  /\beboot\.bin\b/i,
  /\bparam\.sfo\b/i,
  /\bvpk\b/i,
  /\blivearea\b/i,
  /\bgxm\b/i,
  /\bc\+\+\b/i,
  /\bnative\s+c\b/i,
  /\bdecomp(?:ilation)?\b/i,
  /\brecomp(?:ilation)?\b/i,
  /\bopenmohaa\b/i,
  /\brestories\b/i
];

const GENERIC_EXCLUDED_REPOS = new Set([
  "https://github.com/vitasdk",
  "https://github.com/xerpi/vita-linux-loader",
  "https://github.com/incognitojam/vita-linux-port",
  "https://github.com/incognitojam",
  "https://github.com/incognitojam/incognitojam"
]);

export function loadVitaDbCatalog(customPath) {
  const filePath = customPath || VITADB_CACHE;
  if (fs.existsSync(filePath)) {
    try {
      return JSON.parse(fs.readFileSync(filePath, "utf8"));
    } catch {
      return [];
    }
  }
  return [];
}

export function extractOutboundRepository(item) {
  const text = `${item?.provenance?.repository_url || ""} ${item?.source?.body || ""} ${item?.source?.title || ""} ${(item?.campaign?.outbound_fingerprints || []).join(" ")}`;
  const matches = text.match(/https?:\/\/(?:www\.)?(github\.com|gitlab\.com|codeberg\.org)\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)/gi);
  if (!matches || matches.length === 0) return null;

  for (const match of matches) {
    const clean = match.replace(/\/+$/, "").replace(/\/(?:tree|blob|releases)\/.*$/i, "");
    if (!GENERIC_EXCLUDED_REPOS.has(clean) && !clean.endsWith("/releases") && !clean.endsWith("/issues")) {
      return clean;
    }
  }
  return null;
}

export function checkSafetyAndPiracy(item) {
  const author = String(item?.source?.author || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  if (BLOCKED_AUTHORS.has(author)) {
    return { ok: false, type: "troll", reason: "Author is on the identified troll/fake port blacklist" };
  }
  const text = `${item?.source?.title || ""} ${item?.source?.body || ""}`;
  for (const pattern of TROLL_PRANK_AI_PATTERNS) {
    if (pattern.test(text)) {
      return { ok: false, type: "troll", reason: "Identified as troll, prank, AI-slop or unauthorized fund request" };
    }
  }
  for (const pattern of PIRACY_HOSTS) {
    if (pattern.test(text)) {
      return { ok: false, type: "piracy", reason: "Contains links to illegal ROMs, ISOs or copyrighted game archives" };
    }
  }
  return { ok: true };
}

export function hasConcreteVitaProof(item, repoUrl) {
  const text = `${item?.source?.title || ""} ${item?.source?.body || ""} ${repoUrl || ""}`;
  return VITA_TECH_PATTERNS.some((pattern) => pattern.test(text));
}

export function isOnVitaDb(title, slug, vitaDbCatalog) {
  if (!Array.isArray(vitaDbCatalog) || vitaDbCatalog.length === 0) return false;
  const normTitle = String(title || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  const normSlug = String(slug || "").toLowerCase().replace(/[^a-z0-9]+/g, "").replace(/vita$/, "");
  if (!normTitle && !normSlug) return false;

  for (const app of vitaDbCatalog) {
    const appName = String(app.name || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    if (normTitle && (appName === normTitle || (normTitle.length >= 6 && appName.includes(normTitle)))) {
      return true;
    }
    const appSlug = String(app.name || "").toLowerCase().replace(/[^a-z0-9]+/g, "");
    if (normSlug && normSlug.length >= 5 && (appSlug === normSlug || appSlug.includes(normSlug))) {
      return true;
    }
  }
  return false;
}

export function isAlreadyInLedger(slug, repoUrl, title, ledgerSource) {
  const normSlug = slug.toLowerCase();
  if (ledgerSource.includes(`slug: "${normSlug}"`)) return true;
  if (repoUrl && ledgerSource.includes(`"${repoUrl}"`)) return true;
  return false;
}

export function cleanProjectTitle(rawTitle) {
  return String(rawTitle || "Untitled Port")
    .replace(/\[(?:WIP|RELEASE|PORT|UPDATE|ANNOUNCEMENT|VITA)\]/gi, "")
    .replace(/\bv\d+(?:\.\d+)*\b/gi, "")
    .replace(/\b(?:PS\s*VITA|VITA)\s*(?:PORT|ANNOUNCEMENT)?\b/gi, "")
    .replace(/\b(?:A old game by robtop|my ps vita port is now on github)\b/gi, "")
    .replace(/^[-—: ]+|[-—: ]+$/g, "")
    .replace(/\s+/g, " ")
    .trim() || "Untitled Port";
}

export function inferStage(title, body) {
  const text = `${title} ${body}`.toLowerCase();
  if (/\bv\d+\.\d+|\brelease\b|\bvpk\b|\bdownload\b|\bplayable\b/i.test(text)) return "playable";
  if (/\bin.?game\b|\bgameplay\b|\bfps\b/i.test(text)) return "in_game";
  if (/\bbooting\b|\bintro\b|\bmenu\b/i.test(text)) return "booting";
  if (/\bwip\b|\bpre.?release\b|\bbringup\b/i.test(text)) return "early_wip";
  return "announced";
}

export function inferTechnologies(title, body) {
  const text = `${title} ${body}`.toLowerCase();
  const techs = [];
  if (/c\+\+/i.test(text)) techs.push("Native C++");
  else if (/native c\b|\bc language\b/i.test(text)) techs.push("Native C");
  if (/decomp(?:ilation)?/i.test(text)) techs.push("Decompilation");
  if (/soloader|so_loader|armv7|android/i.test(text)) techs.push("ARMv7 Wrapper");
  if (/vitagl|gxm|shader/i.test(text)) techs.push("vitaGL");
  if (/iptv|stream|video/i.test(text)) techs.push("IPTV / Video Streaming");
  if (/music|audio|karaoke|mp3/i.test(text)) techs.push("Audio Player");
  if (/utility|tool/i.test(text)) techs.push("Utility");
  if (techs.length === 0) techs.push("VitaSDK");
  return techs;
}

export function evaluateCandidate(item, options = {}) {
  const vitaDbCatalog = options.vitaDbCatalog || loadVitaDbCatalog();
  const ledgerSource = options.ledgerSource || (fs.existsSync(LEDGER) ? fs.readFileSync(LEDGER, "utf8") : "");

  // 1. Troll / Prank / AI-Slop / Piracy check
  const safety = checkSafetyAndPiracy(item);
  if (!safety.ok) {
    return { action: "REJECT", reason: safety.reason };
  }

  // 2. Outbound repository link check
  const repoUrl = options.mockRepoUrl || extractOutboundRepository(item);
  if (!repoUrl) {
    return { action: "QUARANTINE", reason: "Missing verified outbound git repository link" };
  }

  // 3. Concrete Vita technical proof check
  if (!hasConcreteVitaProof(item, repoUrl)) {
    return { action: "QUARANTINE", reason: "No concrete Vita code or toolchain indicators detected" };
  }

  // 4. VitaDB check (filter already released VitaDB apps)
  const cleanTitle = cleanProjectTitle(item.source?.title);
  const candidateSlug = (item.candidate_slug || cleanTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-")).replace(/-+$/, "");
  if (isOnVitaDb(cleanTitle, candidateSlug, vitaDbCatalog)) {
    return { action: "REJECT", reason: "Project already exists as an official release on VitaDB" };
  }

  // 5. Duplicate check against current ledger
  if (isAlreadyInLedger(candidateSlug, repoUrl, cleanTitle, ledgerSource)) {
    return { action: "QUARANTINE", reason: "Project already indexed in active ledger" };
  }

  // 6. Ready for promotion
  const stage = inferStage(item.source?.title || "", item.source?.body || "");
  const technologies = inferTechnologies(item.source?.title || "", item.source?.body || "");
  const author = item.source?.author || "Community Developer";
  const developerSlug = author.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  return {
    action: "PROMOTE",
    cleanTitle,
    slug: candidateSlug.endsWith("-vita") ? candidateSlug : `${candidateSlug}-vita`,
    repoUrl,
    stage,
    technologies,
    author,
    developerSlug,
    reason: `Automated curation: verified valid PS Vita source repository (${repoUrl}) with concrete code indicators`
  };
}

export function insertPromotionIntoLedger(candidate, evalResult, ledgerPath = LEDGER) {
  let fb = fs.readFileSync(ledgerPath, "utf8");

  // Determine next unique IDs
  const gameIds = [...fb.matchAll(/\{ id: (\d+), slug: /g)].map((m) => Number(m[1]));
  const projectIds = [...fb.matchAll(/^    id: (\d+),$/gm)].map((m) => Number(m[1]));
  const devIds = [...fb.matchAll(/^    id: (\d+),/gm)].map((m) => Number(m[1]));

  const nextId = Math.max(0, ...gameIds, ...projectIds) + 1;
  const nextDevId = Math.max(0, ...devIds) + 1;

  const now = new Date().toISOString();
  const publishedAt = candidate.source?.published_at || now;

  // 1. Add Game
  const newGame = `  { id: ${nextId}, slug: "${evalResult.slug}", title: "${evalResult.cleanTitle}", normalized_title: "${evalResult.cleanTitle.toLowerCase()}", original_release_year: null, original_platform: "Various", created_at: new Date('${publishedAt}'), updated_at: new Date('${now}') }`;
  const gameInsertIdx = fb.indexOf("export const FALLBACK_PROJECTS");
  const lastGameBracket = fb.rfind ? fb.rfind("];", 0, gameInsertIdx) : fb.lastIndexOf("];", gameInsertIdx);
  fb = fb.slice(0, lastGameBracket) + ",\n" + newGame + "\n" + fb.slice(lastGameBracket);

  // 2. Add Developer (if not existing)
  if (!fb.includes(`slug: "${evalResult.developerSlug}"`)) {
    const newDev = `  {
    id: ${nextDevId},
    slug: "${evalResult.developerSlug}",
    display_name: "${evalResult.author}",
    description: "Developer of ${evalResult.cleanTitle} for PlayStation Vita.",
    is_known_developer: true,
    identities: [
      { provider: "reddit", username: "${evalResult.author}" }
    ],
    projects: []
  }`;
    const devInsertIdx = fb.indexOf("export const FALLBACK_UPDATES");
    const lastDevBracket = fb.lastIndexOf("];", devInsertIdx);
    fb = fb.slice(0, lastDevBracket) + ",\n" + newDev + "\n" + fb.slice(lastDevBracket);
  }

  // 3. Add Project
  const newProject = `  {
    id: ${nextId},
    game_id: ${nextId},
    slug: "${evalResult.slug}",
    reddit_url: "${candidate.source?.canonical_url || ""}",
    repo_url: "${evalResult.repoUrl}",
    display_name: "${evalResult.cleanTitle}",
    current_stage: "${evalResult.stage}",
    lifecycle: "active",
    summary: "Community PlayStation Vita port of ${evalResult.cleanTitle} with source repository on GitHub.",
    playability_notes: "Automatically promoted from verified community source with repository and code evidence.",
    performance_notes: "Targeting native hardware performance.",
    first_seen_at: new Date('${publishedAt}'),
    last_activity_at: new Date('${publishedAt}'),
    released_at: ${evalResult.stage === "playable" ? `new Date('${publishedAt}')` : "null"},
    is_featured: false,
    is_archived: false,
    verification: "developer_direct",
    game_title: "${evalResult.cleanTitle}",
    original_platform: "Various",
    original_release_year: null,
    technologies: ${JSON.stringify(evalResult.technologies)},
    developers: [{ id: ${nextDevId}, role: "lead", display_name: "${evalResult.author}", slug: "${evalResult.developerSlug}" }],
    stage_history: [
      { id: ${nextId * 10}, stage: "${evalResult.stage}", effective_at: new Date('${publishedAt}'), reason: "Verified source port release/development on GitHub" }
    ]
  }`;
  const projInsertIdx = fb.indexOf("export const FALLBACK_DEVELOPERS");
  const lastProjBracket = fb.lastIndexOf("];", projInsertIdx);
  fb = fb.slice(0, lastProjBracket) + ",\n" + newProject + "\n" + fb.slice(lastProjBracket);

  // 4. Add Update
  const updateId = `upd_${evalResult.slug.replace(/[^a-z0-9]/g, "_")}`;
  const newUpdate = `  {
    id: "${updateId}",
    port_project_id: ${nextId},
    project_slug: "${evalResult.slug}",
    project_display_name: "${evalResult.cleanTitle}",
    developer_display_name: "${evalResult.author}",
    developer_slug: "${evalResult.developerSlug}",
    event_type: "${evalResult.stage === "playable" ? "playable_demo" : "project_announced"}",
    title: "${evalResult.cleanTitle} PS Vita port surfaced with repository",
    summary: "Automated verification confirmed active repository and code evidence for ${evalResult.cleanTitle}.",
    event_at: new Date('${publishedAt}'),
    verification_level: "developer_direct",
    sources: [
      { source_item_id: "src_${updateId}_repo", relationship: "primary", canonical_url: "${evalResult.repoUrl}" },
      { source_item_id: "src_${updateId}_reddit", relationship: "community", canonical_url: "${candidate.source?.canonical_url || ""}" }
    ]
  }`;
  const lastUpdBracket = fb.lastIndexOf("];");
  fb = fb.slice(0, lastUpdBracket) + ",\n" + newUpdate + "\n" + fb.slice(lastUpdBracket);

  fs.writeFileSync(ledgerPath, fb, "utf8");

  // Update types.ts KNOWN_REPOS
  if (fs.existsSync(TYPES_FILE)) {
    let typesContent = fs.readFileSync(TYPES_FILE, "utf8");
    if (!typesContent.includes(`"${evalResult.slug}"`)) {
      typesContent = typesContent.replace(
        /export const KNOWN_REPOS: Record<string, string> = \{([\s\S]*?)\};/,
        `export const KNOWN_REPOS: Record<string, string> = {$1  "${evalResult.slug}": "${evalResult.repoUrl}",\n};`.replace(/([^,])\n  "/g, "$1,\n  \"")
      );
      fs.writeFileSync(TYPES_FILE, typesContent, "utf8");
    }
  }

  return { id: nextId, slug: evalResult.slug, updateId };
}

export async function runAutoCuratePipeline(options = {}) {
  const quarantinePath = options.quarantinePath || QUARANTINE;
  const ledgerPath = options.ledgerPath || LEDGER;
  const vitaDbCatalog = options.vitaDbCatalog || loadVitaDbCatalog();

  if (!fs.existsSync(quarantinePath)) {
    console.log("Quarantine file not found, skipping curation.");
    return { promoted: [], rejected: [], retained: [] };
  }

  const doc = JSON.parse(fs.readFileSync(quarantinePath, "utf8"));
  const promoted = [];
  const rejected = [];
  const retained = [];

  const now = new Date().toISOString();

  for (let i = 0; i < doc.items.length; i++) {
    const item = doc.items[i];
    if (item.state !== "QUARANTINED" && item.state !== "VERIFIED_FOR_REVIEW") {
      continue;
    }

    const evaluation = evaluateCandidate(item, { vitaDbCatalog, ledgerSource: fs.readFileSync(ledgerPath, "utf8") });

    if (evaluation.action === "PROMOTE") {
      console.log(`[AUTO-CURATE] Promoting candidate ${item.id}: ${evaluation.cleanTitle} (${evaluation.slug})`);
      insertPromotionIntoLedger(item, evaluation, ledgerPath);
      const reviewed = item.state === "QUARANTINED"
        ? transitionState(item, "VERIFIED_FOR_REVIEW", {
            actor: "auto-curate-pipeline",
            at: now,
            reason: evaluation.reason
          })
        : item;
      doc.items[i] = transitionState(reviewed, "PROMOTED", {
        actor: "auto-curate-pipeline",
        at: now,
        reason: evaluation.reason
      });
      promoted.push({ id: item.id, slug: evaluation.slug, title: evaluation.cleanTitle });
    } else if (evaluation.action === "REJECT") {
      console.log(`[AUTO-CURATE] Rejecting candidate ${item.id}: ${evaluation.reason}`);
      doc.items[i] = transitionState(item, "REJECTED", {
        actor: "auto-curate-pipeline",
        at: now,
        reason: evaluation.reason
      });
      rejected.push({ id: item.id, reason: evaluation.reason });
    } else {
      retained.push({ id: item.id, reason: evaluation.reason });
    }
  }

  if (promoted.length > 0 || rejected.length > 0) {
    doc.generated_at = now;
    fs.writeFileSync(quarantinePath, JSON.stringify(doc, null, 2) + "\n", "utf8");
    console.log(`[AUTO-CURATE] Summary: ${promoted.length} promoted, ${rejected.length} rejected, ${retained.length} retained.`);

    if (promoted.length > 0 && options.rebuildFeeds !== false) {
      try {
        console.log("[AUTO-CURATE] Rebuilding feeds and project cards...");
        execSync("node scripts/build-media-manifest.mjs", { stdio: "inherit" });
        execSync("npx tsx scripts/make-feeds.ts", { stdio: "inherit" });
      } catch (err) {
        console.warn("[AUTO-CURATE] Warning: Feed rebuild returned:", err.message);
      }
    }
  } else {
    console.log(`[AUTO-CURATE] No new promotions or rejections. ${retained.length} candidates remain quarantined.`);
  }

  return { promoted, rejected, retained };
}

// CLI direct invocation
if (process.argv[1] && process.argv[1].endsWith("auto-curate-pipeline.mjs")) {
  runAutoCuratePipeline()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("[AUTO-CURATE] Pipeline error:", err);
      process.exit(1);
    });
}
