// Promotes a scanner candidate into the curated ledger as an UNVERIFIED entry.
//
// The script only carries over what the thread actually proves: its title, its
// URL and the dates it was published and detected. Stage is set to "announced",
// and playability/performance stay null because no build report exists yet.
// The entry is tagged verification: "detected" so the interface can say so.
//
// usage:
//   node scripts/promote-candidate.mjs --list
//   node scripts/promote-candidate.mjs --index 2
//   node scripts/promote-candidate.mjs --url class-of-09
import fs from "node:fs";
import path from "node:path";

const LEDGER = path.resolve(process.cwd(), "src/shared/constants/fallbackData.ts");
const DISCOVERED = path.resolve(process.cwd(), "public/data/discovered.json");

const args = process.argv.slice(2);
const readFlag = (name) => {
  const index = args.indexOf(name);
  return index === -1 ? null : args[index + 1] ?? null;
};
const wantsList = args.includes("--list") || args.length === 0;
const indexFlag = readFlag("--index");
const urlFlag = readFlag("--url");

function loadDiscovered() {
  const parsed = JSON.parse(fs.readFileSync(DISCOVERED, "utf8"));
  return { doc: parsed, items: Array.isArray(parsed.items) ? parsed.items : [] };
}

function cleanTitle(raw) {
  return String(raw)
    .replace(/^\s*\[[^\]]*\]\s*/g, "")
    .replace(/\s+/g, " ")
    .replace(/\s*[-–|]\s*$/, "")
    .trim();
}

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48)
    .replace(/-+$/g, "");
}

function uniqueSlug(base, taken) {
  let slug = base || "untitled-port";
  let n = 2;
  while (taken.has(slug)) {
    slug = base + "-" + n;
    n++;
  }
  return slug;
}

function isoOr(value, fallback) {
  const date = new Date(String(value || ""));
  return Number.isNaN(date.getTime()) ? fallback : date.toISOString();
}

if (wantsList) {
  const { items } = loadDiscovered();
  if (items.length === 0) {
    console.log("No candidates in public/data/discovered.json. Run node scripts/cron-reddit-scan.mjs first.");
    process.exit(0);
  }
  items.forEach((item, i) => {
    console.log(String(i + 1).padStart(2) + ". " + item.title);
    console.log("    r/" + item.subreddit + " · " + item.author + " · " + (item.published_at || item.detected_at));
    console.log("    " + item.url);
  });
  console.log("\nPromote one with: node scripts/promote-candidate.mjs --index N");
  process.exit(0);
}

const { doc, items } = loadDiscovered();
let candidate = null;
if (indexFlag !== null) {
  candidate = items[Number(indexFlag) - 1] || null;
} else if (urlFlag) {
  const normalise = (value) => String(value).toLowerCase().replace(/[^a-z0-9]+/g, "-");
  candidate = items.find((item) => normalise(item.url).includes(normalise(urlFlag))) || null;
}
if (!candidate) {
  console.error("Candidate not found. Run with --list to see what is available.");
  process.exit(1);
}

let source = fs.readFileSync(LEDGER, "utf8");

const gameIds = [...source.matchAll(/\{ id: (\d+), slug: "/g)].map((m) => Number(m[1]));
const projectIds = [...source.matchAll(/^    id: (\d+),$/gm)].map((m) => Number(m[1]));
const takenSlugs = new Set([...source.matchAll(/slug: "([a-z0-9-]+)"/g)].map((m) => m[1]));

const nextId = Math.max(0, ...gameIds, ...projectIds) + 1;
const title = cleanTitle(candidate.title);
const slug = uniqueSlug(slugify(title), takenSlugs);
const detectedAt = isoOr(candidate.detected_at, new Date().toISOString());
const firstSeen = isoOr(candidate.published_at, detectedAt);
const escaped = title.replace(/"/g, '\\"');

const gameEntry = ',\r\n  { id: ' + nextId + ', slug: "' + slug + '", title: "' + escaped +
  '", normalized_title: "' + escaped.toLowerCase() + '", original_release_year: null, original_platform: "Unknown", created_at: new Date(\'' +
  firstSeen + "'), updated_at: new Date('" + detectedAt + "') }";

const projectEntry = [
  ",",
  "  {",
  "    id: " + nextId + ",",
  "    game_id: " + nextId + ",",
  '    slug: "' + slug + '",',
  '    reddit_url: "' + candidate.url + '",',
  '    display_name: "' + escaped + '",',
  '    current_stage: "announced",',
  '    lifecycle: "active",',
  '    summary: "Detected by the scanner on r/' + candidate.subreddit + '. Awaiting independent verification on hardware.",',
  "    playability_notes: null,",
  "    performance_notes: null,",
  "    first_seen_at: new Date('" + firstSeen + "'),",
  "    last_activity_at: new Date('" + detectedAt + "'),",
  "    released_at: null,",
  "    is_featured: false,",
  "    is_archived: false,",
  '    verification: "detected",',
  '    game_title: "' + escaped + '",',
  '    original_platform: "Unknown",',
  "    original_release_year: null,",
  "    technologies: [],",
  "    developers: []",
  "  }"
].join("\r\n");

// Anchors are resolved against the current text on every call: inserting into the
// first array shifts every later index, so a cached offset would land in the wrong
// array.
function insertBeforeArrayEnd(source, arrayHeader, entry) {
  const arrayStart = source.indexOf(arrayHeader);
  if (arrayStart === -1) throw new Error("could not find " + arrayHeader);
  const close = source.indexOf("\r\n];", arrayStart);
  if (close === -1) throw new Error("could not find the end of " + arrayHeader);
  return source.slice(0, close) + entry + source.slice(close);
}

source = insertBeforeArrayEnd(source, "export const FALLBACK_GAMES: Game[] = [", gameEntry);
source = insertBeforeArrayEnd(source, "export const FALLBACK_PROJECTS: any[] = [", projectEntry);
fs.writeFileSync(LEDGER, source, "utf8");

const remaining = items.filter((item) => item.url !== candidate.url);
fs.writeFileSync(
  DISCOVERED,
  JSON.stringify({ ...doc, items: remaining }, null, 2) + "\n",
  "utf8"
);

console.log("Promoted: " + title);
console.log("  slug:  " + slug + "  (id " + nextId + ")");
console.log("  stage: announced, verification: detected");
console.log("  source: " + candidate.url);
console.log("Removed from the candidate queue; " + remaining.length + " left.");
console.log("\nNext: fill in playability and performance from the thread, then run npm test.");
