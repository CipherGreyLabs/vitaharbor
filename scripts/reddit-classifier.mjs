// Pure scanner classification helpers. Keeping these separate makes the
// question/spam boundary testable without executing network calls or writing
// public/data/discovered.json.

// Strong evidence that the author is doing active port work or announcing a result.
const DEVELOPMENT_SIGNALS = [
  /\[wip\]/i, /\[release\]/i, /\[port\]/i, /\bw\.?i\.?p\.?\b/i, /\brelease\b/i,
  /\bin.?game\b/i, /\bplayable\b/i, /\bboot(?:s|ed|ing)?\b/i, /\bcompiled\b/i,
  /\brecompil(?:e|ed|er|ation)\b/i, /\brender(?:s|ed|ing)?\b/i,
  /\bported\b/i, /\bdecomp(ilation)?\b/i, /\barm.?wrapper\b/i, /\bvitagl\b/i,
  /\barmv7\b/i, /\bhomebrew\b/i, /\bfps\b/i, /\bframerate\b/i,
  /\bprogress\b/i, /\bupdate\b/i, /\bdemo\b/i, /\bbeta\b/i, /\bv\d+\.\d+\b/i,
  /\bpull.?request\b/i, /github\.com\b/i,
  /\bvitasdk\b/i, /\bnative\b/i, /\bbounty\b/i,
  /\bfork\b/i, /\bbuild\b/i, /\bpatch\b/i, /\bplugin\b/i,
  /arrived!/i, /is here/i, /\bfinally\b.*\breleased\b/i, /\bjust\s+released\b/i,
  /\bhas arrived\b/i, /\bport\s+progress\b/i,
];

// Keep these deliberately conservative: a real port can be free or open
// source, but promotional/referral language is not development evidence.
const SPAM_SIGNALS = [
  /\b(?:crypto|bitcoin|ethereum|casino|sportsbook|betting)\b/i,
  /\b(?:promo|referral)\s+code\b/i,
  /\bclick\s+(?:here|the\s+link)\b/i,
  /\b(?:free|cheap)\s+(?:money|gift\s*card|followers|likes)\b/i,
];

// Phrases that strongly indicate the post is a question or request, not development.
const QUESTION_SIGNALS = [
  /\?/,
  /^\s*(?:\[?\s*request\s*\]?|request(?:ing)?|port request|patch request)\b/i,
  /^\s*demande(?:\s+de)?\b/i,
  /^\s*(?:solicitud|petici[oó]n|pedido)(?:\s+de)?\b/i,
  /\bany(one|body)\b.*\b(port|know|working|made|tried)\b/i,
  /\bcan (someone|anyone|we|you|i)\b/i,
  /\bwould (be|love|like)\b.*\bport\b/i,
  /\bplease\b.*\bport\b/i,
  /\bwish\b.*\bport\b/i,
  /\bhope\b.*\bport\b/i,
  /\bis (it|there|this) (possible|a port|being ported|ported)\b/i,
  /\bhas (anyone|someone)\b/i,
  /\bwhy (isn'?t|is there no|hasn'?t)\b/i,
  /\bwhen (will|is)\b/i,
  /\bhow (to|do I|can I|would)\b.*\bport\b/i,
  /\blooking for\b/i,
  /\bneed help\b/i,
  /\bhelp (me|with)\b/i,
  /\bany (luck|chance|info|news|update)\b/i,
  /\bwhat.*\bport(s)?\b.*\b(exist|available|work|run)\b/i,
];

// Neutral port-adjacent terms counted only when not in a question context.
const PASSIVE_PORT_TERMS = [
  "port", "ports", "engine", "unity", "unreal", "wrapper", "release", "homebrew",
];

export const CANDIDATE_CATEGORIES = Object.freeze([
  "new_project",
  "project_update",
  "discussion",
  "question",
  "out_of_scope"
]);

const STRONG_DEVELOPMENT_SIGNALS = [
  /\b(?:wip|work in progress)\b/i,
  /\b(?:boot(?:s|ed|ing)?|running|playable|in.?game)\b/i,
  /\b(?:compiled|recompil(?:e|ed|er|ation)|ported|render(?:s|ed|ing)?)\b/i,
  /\b(?:fps|framerate|frame rate|vita hardware|real hardware|native build)\b/i,
  /\bnative\b[\s\S]{0,30}\bport\b/i,
  /\bport\b[\s\S]{0,30}\bnative\b/i,
  /\b(?:github\.com|gitlab\.com|codeberg\.org|vitasdk|vpk)\b/i,
  /\b(?:source code|pull.?request|release build|demo build)\b/i,
  /\[release\]/i,
  /\b(?:initial|public)\s+release\b/i
];

const UPDATE_SIGNALS = [
  /\b(?:update|progress|wip|work in progress|new build|version|patch(?:es)?|fix(?:es)?)\b/i,
  /\b(?:now|still|again)\b[\s\S]{0,40}\b(?:runs?|boots?|works?|renders?|plays?)\b/i,
  /\b(?:runs?|boots?|works?|renders?|plays?)\b[\s\S]{0,40}\b(?:now|again|on vita)\b/i
];

const DISCUSSION_SIGNALS = [
  /\bwe need to talk\b/i,
  /\bvibecod(?:er|ing)\b/i,
  /\bslop\b/i,
  /\bshould have never\b/i,
  /\bcommunity deserves\b/i,
  /\bi(?:'m| am) not against\b/i,
  /\b(?:opinion|discussion|debate|rant|thoughts?)\b/i
];

const GENERIC_IDENTITY_WORDS = new Set([
  "a", "an", "and", "for", "from", "game", "new", "on", "port", "ports", "ps",
  "psvita", "release", "the", "this", "update", "vita", "wip", "work", "progress"
]);

function hasProjectIdentity(entry) {
  const title = String(entry?.title || "");
  const body = String(entry?.body || "");
  const outbound = Array.isArray(entry?.outbound_urls) ? entry.outbound_urls : [];
  if (outbound.some((url) => /https?:\/\/(?:www\.)?(?:github|gitlab)\.com\//i.test(String(url)))) return true;
  if (/\b(?:github|gitlab|codeberg)(?:\.com|\.org)?\b/i.test(body)) return true;
  const tokens = title.match(/\b[A-Z][A-Za-z0-9][A-Za-z0-9._'-]{1,}\b/g) || [];
  return tokens.some((token) => !GENERIC_IDENTITY_WORDS.has(token.toLowerCase()));
}

function hasVitaContext(text) {
  return /\b(?:vita|psvita|playstation\s+vita|vitahacks|vitapiracy|homebrew)\b/i.test(text);
}

function isDiscussion(text) {
  return DISCUSSION_SIGNALS.some((signal) => signal.test(text));
}

export function classifyCandidateCategory(entry, options = {}) {
  const title = String(entry?.title || "");
  const body = String(entry?.body || "");
  const text = title + " " + body + " " + String(entry?.subreddit || "");
  const technicalType = options.technicalType || classifyCandidateType(entry);
  const identity = options.projectIdentity ?? hasProjectIdentity(entry);
  const developmentEvidence = options.developmentEvidence ?? STRONG_DEVELOPMENT_SIGNALS.some((signal) => signal.test(text));
  const question = options.question === true || QUESTION_SIGNALS.some((signal) => signal.test(title) || signal.test(body));
  // A developer may ask where to post or request feedback inside a concrete
  // WIP announcement. Keep that real project visible; request-only posts still
  // fail this gate because they lack identity plus development evidence.
  if (question && !(identity && developmentEvidence)) return "question";
  if (["plugin", "tool"].includes(technicalType)) return "out_of_scope";

  if (isDiscussion(text) && !developmentEvidence) return "discussion";
  const vitaScopedBySourceContext = hasVitaContext(text) || (technicalType && isTrackableCandidateType(technicalType) && /\b(?:port|wrapper|decomp(?:ilation)?|engine)\b/i.test(text));
  if (!identity || !vitaScopedBySourceContext || !developmentEvidence) {
    return isDiscussion(text) ? "discussion" : "out_of_scope";
  }
  return UPDATE_SIGNALS.some((signal) => signal.test(text)) ? "project_update" : "new_project";
}

export function isTrackableCandidateCategory(value) {
  return value === "new_project" || value === "project_update";
}

export function classify(entry) {
  const title = String(entry.title || "").toLowerCase();
  const body = String(entry.body || "").toLowerCase();
  const titleRaw = String(entry.title || "");
  const full = title + " " + body + " " + String(entry.subreddit || "").toLowerCase();

  const devHits = DEVELOPMENT_SIGNALS.filter((re) => re.test(title) || re.test(body));
  const qHits = QUESTION_SIGNALS.filter((re) => re.test(title) || re.test(body));
  const spamHits = SPAM_SIGNALS.filter((re) => re.test(title) || re.test(body));
  const passiveHits = PASSIVE_PORT_TERMS.filter((term) => full.includes(term));
  const projectIdentity = hasProjectIdentity(entry);
  const developmentEvidence = STRONG_DEVELOPMENT_SIGNALS.filter((re) => re.test(full));

  // A question pattern in the raw title dominates unless dev signals are very strong.
  const titleIsQuestion = QUESTION_SIGNALS.some((re) => re.test(titleRaw));
  const substantiveQuestion = (qHits.length > 0 || titleIsQuestion) && !(projectIdentity && developmentEvidence.length > 0);

  if (spamHits.length > 0 && devHits.length < 4) {
    return { accept: false, confidence: "low", question: qHits.length > 0 || titleIsQuestion, spam: true, category: "out_of_scope", project_identity: projectIdentity, reason: "promotional/spam language detected (" + spamHits.length + ")" };
  }
  if (titleIsQuestion && devHits.length < 3) {
    return { accept: false, confidence: "low", question: true, spam: false, category: "question", project_identity: projectIdentity, reason: "question title with insufficient dev signals (" + devHits.length + ")" };
  }
  const technicalType = classifyCandidateType(entry);
  const category = classifyCandidateCategory(entry, {
    question: qHits.length > 0 || titleIsQuestion,
    technicalType,
    projectIdentity,
    developmentEvidence: developmentEvidence.length > 0
  });
  const genericEvidenceRecord = category === "out_of_scope"
    && /\b(?:github(?:\.com)?|gitlab(?:\.com)?|codeberg(?:\.org)?)\b/i.test(full)
    && /\b(?:engine|repository|update)\b/i.test(full);
  const accepted = (isTrackableCandidateCategory(category) && developmentEvidence.length > 0) || genericEvidenceRecord;
  if (devHits.length >= 3) {
    const sample = devHits.slice(0, 3).map((re) => re.source).join(", ");
    return { accept: accepted, confidence: "high", question: substantiveQuestion, spam: false, category, project_identity: projectIdentity, development_evidence: developmentEvidence.length, reason: devHits.length + " dev signals: " + sample + " · category=" + category };
  }
  if (devHits.length >= 1 && qHits.length === 0 && passiveHits.length >= 1) {
    return { accept: accepted, confidence: "medium", question: false, spam: false, category, project_identity: projectIdentity, development_evidence: developmentEvidence.length, reason: devHits.length + " dev signal(s), " + passiveHits.length + " passive term(s), category=" + category };
  }
  return { accept: false, confidence: "low", question: qHits.length > 0 || titleIsQuestion, spam: false, category, project_identity: projectIdentity, development_evidence: developmentEvidence.length, reason: "devHits=" + devHits.length + ", qHits=" + qHits.length + ", passive=" + passiveHits.length + ", category=" + category };
}

const TRACKABLE_CANDIDATE_TYPES = new Set(["port", "decompilation", "wrapper", "engine"]);

export function isTrackableCandidateType(value) {
  return TRACKABLE_CANDIDATE_TYPES.has(String(value || ""));
}

export function classifyCandidateType(entry) {
  const text = ((entry.title || "") + " " + (entry.body || "")).toLowerCase();
  if (/\b(plugin|controller|adrenaline|input support)\b/.test(text)) return "plugin";
  if (/\b(app|application|database|tracker|tool|launcher|mod|mods|modding)\b/.test(text)) return "tool";
  if (/\b(wrapper|loader|armv7|recompiler)\b/.test(text)) return "wrapper";
  if (/\b(decompilation|decomp|source port)\b/.test(text)) return "decompilation";
  if (/\b(runtime|engine)\b/.test(text)) return "engine";
  return "port";
}

function decodeHtmlEntities(value) {
  return String(value || "")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, decimal) => String.fromCodePoint(Number.parseInt(decimal, 10)))
    .replace(/&quot;/gi, '"')
    .replace(/&apos;|&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&amp;/gi, "&");
}

export function parseEntries(xml) {
  const entries = [];
  for (const chunk of xml.split("<entry>").slice(1)) {
    const pick = (re) => { const match = chunk.match(re); return match ? match[1].trim() : ""; };
    const title = pick(/<title>([\s\S]*?)<\/title>/).replace(/<!\[CDATA\[|\]\]>/g, "");
    const url = pick(/<link href="([^"]+)"/);
    const author = pick(/<name>([^<]+)<\/name>/).replace("/u/", "");
    const published = pick(/<updated>([^<]+)<\/updated>/);
    const content = decodeHtmlEntities(pick(/<content[^>]*>([\s\S]*?)<\/content>/));
    const body = content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 600);
    const outbound_urls = [...new Set((content.match(/https?:\/\/[^\s<>"']+/gi) || []).map((value) => value.replace(/[),.;]+$/, "")))].slice(0, 20);
    const media_urls = [...new Set((content.match(/(?:https?:\/\/[^\s<>"']+\.(?:png|jpe?g|webp|gif|mp4)(?:\?[^\s<>"']*)?)/gi) || []).map((value) => value.replace(/[),.;]+$/, "")))].slice(0, 20);
    if (title && url) entries.push({ title, url, author, published, body, outbound_urls, media_urls });
  }
  return entries;
}

export function keyOf(url) {
  return String(url).replace(/https?:\/\/(www\.)?reddit\.com/i, "").replace(/\/?$/, "").toLowerCase();
}
