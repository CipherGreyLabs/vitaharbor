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

export function classify(entry) {
  const title = String(entry.title || "").toLowerCase();
  const body = String(entry.body || "").toLowerCase();
  const titleRaw = String(entry.title || "");
  const full = title + " " + body;

  const devHits = DEVELOPMENT_SIGNALS.filter((re) => re.test(title) || re.test(body));
  const qHits = QUESTION_SIGNALS.filter((re) => re.test(title) || re.test(body));
  const spamHits = SPAM_SIGNALS.filter((re) => re.test(title) || re.test(body));
  const passiveHits = PASSIVE_PORT_TERMS.filter((term) => full.includes(term));

  // A question pattern in the raw title dominates unless dev signals are very strong.
  const titleIsQuestion = QUESTION_SIGNALS.some((re) => re.test(titleRaw));

  if (spamHits.length > 0 && devHits.length < 4) {
    return { accept: false, confidence: "low", question: qHits.length > 0 || titleIsQuestion, spam: true, reason: "promotional/spam language detected (" + spamHits.length + ")" };
  }
  if (titleIsQuestion && devHits.length < 3) {
    return { accept: false, confidence: "low", question: true, spam: false, reason: "question title with insufficient dev signals (" + devHits.length + ")" };
  }
  if (devHits.length >= 3) {
    const sample = devHits.slice(0, 3).map((re) => re.source).join(", ");
    return { accept: true, confidence: "high", question: qHits.length > 0 || titleIsQuestion, spam: false, reason: devHits.length + " dev signals: " + sample };
  }
  if (devHits.length >= 1 && qHits.length === 0 && passiveHits.length >= 1) {
    return { accept: true, confidence: "medium", question: false, spam: false, reason: devHits.length + " dev signal(s), " + passiveHits.length + " passive term(s), no question markers" };
  }
  return { accept: false, confidence: "low", question: qHits.length > 0 || titleIsQuestion, spam: false, reason: "devHits=" + devHits.length + ", qHits=" + qHits.length + ", passive=" + passiveHits.length };
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
