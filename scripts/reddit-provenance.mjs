// Provenance and quarantine boundary for every Reddit discovery.
// This module is intentionally free of filesystem and Node-only imports so the
// read-only Vercel scan can use the same validation rules as the local scanner.

export const PROVENANCE_SCHEMA_VERSION = 2;

export const CANDIDATE_STATES = Object.freeze([
  "DETECTED",
  "QUARANTINED",
  "VERIFIED_FOR_REVIEW",
  "PROMOTED",
  "REJECTED",
  "BLOCKED_UNVERIFIED"
]);

export const TERMINAL_STATES = Object.freeze(["PROMOTED", "REJECTED", "BLOCKED_UNVERIFIED"]);

export const MAX_FIELD_LENGTHS = Object.freeze({
  title: 300,
  body: 8000,
  author: 80,
  subreddit: 40,
  url: 2048
});

const ALLOWED_REDDIT_HOSTS = new Set(["www.reddit.com", "reddit.com"]);
const ALLOWED_EVIDENCE_HOSTS = new Set([
  "github.com",
  "www.github.com",
  "gitlab.com",
  "www.gitlab.com",
  "codeberg.org",
  "www.codeberg.org"
]);

const FAKE_OR_TROLL_SIGNALS = [
  /\bfake\b/i,
  /\btroll(?:ing)?\b/i,
  /\bshitpost\b/i,
  /\bprank\b/i,
  /\bbait\b/i
];

const VITA_CONTEXT_SIGNALS = [
  /\bvita\b/i,
  /\bpsvita\b/i,
  /\bplaystation\s+vita\b/i,
  /\bvitaharbor\b/i,
  /\bvitahacks\b/i,
  /\bvitapiracy\b/i,
  /\bhomebrew\b/i
];

const EVIDENCE_TERMS = [
  /github\.com\//i,
  /gitlab\.com\//i,
  /codeberg\.org\//i,
  /\brelease\b/i,
  /\bbuild\b/i,
  /\bcompiled\b/i,
  /\btested\b/i,
  /\bin.?game\b/i,
  /\bscreenshot\b/i,
  /\bvideo\b/i
];

const CAMPAIGN_REFERENCE_SIGNALS = [
  /\b(?:previous|prior|last|earlier)\s+(?:post|thread)\b[\s\S]{0,100}\b(?:fake|troll|vitaharbor)\b/i,
  /\b(?:unrelated|follow.?up|actually\s+this\s+time)\b[\s\S]{0,100}\b(?:fake|troll|vitaharbor)\b/i
];

const FINGERPRINT_STOP_WORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "been", "but", "by", "for", "from",
  "has", "have", "how", "i", "in", "is", "it", "its", "of", "on", "or", "so", "that",
  "the", "their", "this", "to", "was", "we", "with", "you"
]);

const TRANSITIONS = Object.freeze({
  DETECTED: Object.freeze(["QUARANTINED", "BLOCKED_UNVERIFIED"]),
  QUARANTINED: Object.freeze(["VERIFIED_FOR_REVIEW", "REJECTED", "BLOCKED_UNVERIFIED"]),
  VERIFIED_FOR_REVIEW: Object.freeze(["PROMOTED", "REJECTED", "BLOCKED_UNVERIFIED"]),
  PROMOTED: Object.freeze([]),
  REJECTED: Object.freeze([]),
  BLOCKED_UNVERIFIED: Object.freeze([])
});

function cleanText(value) {
  return String(value ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function stableHash(value) {
  let hash = 2166136261;
  for (const char of String(value)) {
    hash ^= char.codePointAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function fingerprintTokens(value) {
  return [...new Set(
    cleanText(value)
      .toLowerCase()
      .replace(/https?:\/\/\S+/g, " ")
      .replace(/[^a-z0-9]+/g, " ")
      .split(/\s+/)
      .filter((token) => token.length > 2 && !FINGERPRINT_STOP_WORDS.has(token))
  )].sort();
}

export function normalizeCampaignText(value) {
  return fingerprintTokens(value).join(" ");
}

export function fingerprintText(value) {
  return stableHash(normalizeCampaignText(value));
}

function normalizedUrlFingerprint(value) {
  try {
    const parsed = new URL(String(value));
    if (!/^https?:$/.test(parsed.protocol)) return null;
    return (parsed.hostname + parsed.pathname).toLowerCase().replace(/\/+$/, "") || null;
  } catch {
    return null;
  }
}

function uniqueStrings(values, limit = 20) {
  return [...new Set(values.map((value) => String(value || "").trim()).filter(Boolean))].slice(0, limit);
}

function extractOutboundFingerprints(entry) {
  const explicit = [
    ...(Array.isArray(entry?.outbound_urls) ? entry.outbound_urls : []),
    ...(Array.isArray(entry?.links) ? entry.links : [])
  ];
  const embedded = String(entry?.title || "") + " " + String(entry?.body || "");
  return uniqueStrings([
    ...explicit,
    ...(embedded.match(/https?:\/\/[^\s<>"')\]]+/gi) || [])
  ].map(normalizedUrlFingerprint).filter(Boolean));
}

function extractMediaFingerprints(entry) {
  const media = [
    ...(Array.isArray(entry?.media_hashes) ? entry.media_hashes : []),
    ...(Array.isArray(entry?.media_urls) ? entry.media_urls : []),
    entry?.content_href
  ];
  return uniqueStrings(media.map((value) => {
    const url = normalizedUrlFingerprint(value);
    return url || String(value || "").toLowerCase().slice(0, 128);
  }).filter(Boolean));
}

function campaignMetadata(entry) {
  const text = String(entry?.title || "") + " " + String(entry?.body || "");
  return {
    cluster_id: null,
    linkage_confidence: "none",
    signals: [],
    related_candidate_ids: [],
    text_fingerprint: fingerprintText(text),
    media_fingerprints: extractMediaFingerprints(entry),
    outbound_fingerprints: extractOutboundFingerprints(entry),
    direct_intent: isExplicitPoisonAttempt(entry),
    explicit_campaign_reference: CAMPAIGN_REFERENCE_SIGNALS.some((signal) => signal.test(text)),
    incident_id: null
  };
}

function campaignForRecord(record) {
  const source = record?.source || {};
  const derived = campaignMetadata(source);
  const campaign = record?.campaign || {};
  return {
    ...derived,
    ...campaign,
    signals: uniqueStrings([...(Array.isArray(derived.signals) ? derived.signals : []), ...(Array.isArray(campaign.signals) ? campaign.signals : [])]),
    related_candidate_ids: uniqueStrings(campaign.related_candidate_ids || []),
    media_fingerprints: uniqueStrings([...(derived.media_fingerprints || []), ...(campaign.media_fingerprints || [])]),
    outbound_fingerprints: uniqueStrings([...(derived.outbound_fingerprints || []), ...(campaign.outbound_fingerprints || [])]),
    direct_intent: Boolean(derived.direct_intent || campaign.direct_intent),
    explicit_campaign_reference: Boolean(derived.explicit_campaign_reference || campaign.explicit_campaign_reference)
  };
}

function intersection(left, right) {
  const rightSet = new Set(right);
  return left.filter((value) => rightSet.has(value));
}

function publishedTime(record) {
  const value = record?.source?.published_at;
  const time = value ? new Date(value).getTime() : Number.NaN;
  return Number.isFinite(time) ? time : null;
}

function sameAuthor(left, right) {
  const first = String(left?.source?.author || "").trim().toLowerCase();
  const second = String(right?.source?.author || "").trim().toLowerCase();
  return Boolean(first && second && first === second);
}

function withinHours(left, right, hours) {
  const first = publishedTime(left);
  const second = publishedTime(right);
  return first !== null && second !== null && Math.abs(first - second) <= hours * 60 * 60 * 1000;
}

function textSimilarity(left, right) {
  const first = new Set(fingerprintTokens(String(left?.source?.title || "") + " " + String(left?.source?.body || "")));
  const second = new Set(fingerprintTokens(String(right?.source?.title || "") + " " + String(right?.source?.body || "")));
  if (first.size === 0 || second.size === 0) return 0;
  const shared = [...first].filter((token) => second.has(token)).length;
  return shared / (first.size + second.size - shared);
}

export function campaignSignalsBetween(left, right, options = {}) {
  const leftCampaign = campaignForRecord(left);
  const rightCampaign = campaignForRecord(right);
  const signals = [];
  const burstHours = Number(options.burstHours || 72);
  const burst = withinHours(left, right, burstHours);
  const authorMatch = sameAuthor(left, right);
  if (leftCampaign.direct_intent) signals.push("left_direct_poison_intent");
  if (rightCampaign.direct_intent) signals.push("right_direct_poison_intent");
  if (authorMatch && burst) signals.push("same_author_burst");
  if (leftCampaign.text_fingerprint && leftCampaign.text_fingerprint === rightCampaign.text_fingerprint) {
    signals.push("same_wording_fingerprint");
  } else if (burst && textSimilarity(left, right) >= Number(options.nearDuplicateThreshold || 0.82)) {
    signals.push("near_duplicate_wording");
  }
  if (left.content_hash && left.content_hash === right.content_hash) signals.push("same_content_hash");
  if (intersection(leftCampaign.media_fingerprints, rightCampaign.media_fingerprints).length > 0) {
    signals.push("shared_media_fingerprint");
  }
  if (intersection(leftCampaign.outbound_fingerprints, rightCampaign.outbound_fingerprints).length > 0) {
    signals.push("shared_outbound_fingerprint");
  }
  if (leftCampaign.explicit_campaign_reference || rightCampaign.explicit_campaign_reference) {
    signals.push("explicit_campaign_reference");
  }

  const exactContent = signals.includes("same_content_hash") || signals.includes("same_wording_fingerprint");
  const sharedArtifact = signals.includes("shared_media_fingerprint") || signals.includes("shared_outbound_fingerprint");
  const nearDuplicate = signals.includes("near_duplicate_wording");
  const explicitLinked = signals.includes("explicit_campaign_reference") && authorMatch && burst;
  const linked = exactContent || sharedArtifact || explicitLinked || (nearDuplicate && burst);
  const highConfidence = signals.includes("same_content_hash") || signals.includes("shared_media_fingerprint") || explicitLinked;
  return {
    signals: [...new Set(signals)],
    linked,
    confidence: linked ? (highConfidence ? "high" : "medium") : "none"
  };
}

export function correlateCampaigns(records, options = {}) {
  const input = Array.isArray(records) ? records : [];
  const parent = input.map((_, index) => index);
  const find = (index) => {
    while (parent[index] !== index) {
      parent[index] = parent[parent[index]];
      index = parent[index];
    }
    return index;
  };
  const union = (left, right) => {
    const first = find(left);
    const second = find(right);
    if (first !== second) parent[second] = first;
  };
  const pairResults = new Map();
  for (let left = 0; left < input.length; left++) {
    for (let right = left + 1; right < input.length; right++) {
      const result = campaignSignalsBetween(input[left], input[right], options);
      pairResults.set(left + ":" + right, result);
      if (result.linked) union(left, right);
    }
  }

  const groups = new Map();
  input.forEach((record, index) => {
    const root = find(index);
    if (!groups.has(root)) groups.set(root, []);
    groups.get(root).push(index);
  });

  const output = input.map((record, index) => {
    const group = groups.get(find(index)) || [index];
    const related = group.filter((other) => other !== index).map((other) => input[other]?.id).filter(Boolean);
    const signals = [];
    let confidence = "none";
    for (const other of group) {
      if (other === index) continue;
      const left = Math.min(index, other);
      const right = Math.max(index, other);
      const pair = pairResults.get(left + ":" + right);
      if (!pair) continue;
      signals.push(...pair.signals);
      if (pair.confidence === "high") confidence = "high";
      else if (pair.confidence === "medium" && confidence === "none") confidence = "medium";
    }
    const ids = group.map((other) => input[other]?.id).filter(Boolean).sort();
    const clusterId = ids.length > 1 ? "campaign-" + stableHash(ids.join("|")) : null;
    const existing = campaignForRecord(record);
    return {
      ...record,
      campaign: {
        ...existing,
        cluster_id: clusterId,
        linkage_confidence: confidence,
        signals: uniqueStrings(signals),
        related_candidate_ids: uniqueStrings(related)
      }
    };
  });
  return output;
}

function boundedField(value, field) {
  const raw = String(value ?? "");
  if (raw.length > MAX_FIELD_LENGTHS[field]) {
    return { value: "", error: field + " exceeds " + MAX_FIELD_LENGTHS[field] + " characters" };
  }
  return { value: cleanText(raw), error: null };
}

export function canonicalizeRedditUrl(value) {
  const raw = String(value ?? "").trim();
  if (!raw || raw.length > MAX_FIELD_LENGTHS.url) return null;
  let parsed;
  try {
    parsed = new URL(raw);
  } catch {
    return null;
  }
  if (parsed.protocol !== "https:" || !ALLOWED_REDDIT_HOSTS.has(parsed.hostname.toLowerCase())) return null;
  const match = parsed.pathname.match(/^\/r\/([A-Za-z0-9_]{2,40})\/comments\/([A-Za-z0-9]+)(?:\/([^/]+))?/i);
  if (!match) return null;
  const subreddit = match[1];
  const postId = match[2].toLowerCase();
  const slug = match[3] ? "/" + match[3].replace(/[^A-Za-z0-9_-]/g, "") : "";
  if (!slug && !parsed.pathname.endsWith(postId)) return null;
  return {
    url: "https://www.reddit.com/r/" + subreddit + "/comments/" + postId + slug + "/",
    subreddit,
    postId
  };
}

export function canonicalizeEvidenceUrl(value) {
  const raw = String(value ?? "").trim();
  if (!raw || raw.length > MAX_FIELD_LENGTHS.url) return null;
  let parsed;
  try {
    parsed = new URL(raw);
  } catch {
    return null;
  }
  if (parsed.protocol !== "https:" || !ALLOWED_EVIDENCE_HOSTS.has(parsed.hostname.toLowerCase())) return null;
  parsed.hash = "";
  return parsed.toString();
}

export function candidateIdFromUrl(value) {
  const canonical = canonicalizeRedditUrl(value);
  return canonical ? "reddit-" + canonical.postId : "";
}

export function isExplicitPoisonAttempt(entry) {
  const text = String(entry?.title ?? "") + " " + String(entry?.body ?? "");
  return FAKE_OR_TROLL_SIGNALS.some((signal) => signal.test(text)) && VITA_CONTEXT_SIGNALS.some((signal) => signal.test(text));
}

function riskSignals(entry, classification, urlInfo) {
  const title = String(entry?.title ?? "");
  const body = String(entry?.body ?? "");
  const text = title + " " + body;
  const risks = [];
  if (isExplicitPoisonAttempt(entry)) risks.push("explicit_fake_or_troll");
  if (classification?.reason?.includes("question")) risks.push("question_or_request");
  if (!urlInfo) risks.push("invalid_or_redirected_source_url");
  if (!EVIDENCE_TERMS.some((signal) => signal.test(text))) risks.push("no_project_evidence_in_post");
  if (/screenshot|image|photo/i.test(text) && !/github\.com|gitlab\.com|codeberg\.org/i.test(text)) {
    risks.push("screenshot_only_claim");
  }
  if (/\bgithub(?:\.com)?\b/i.test(text) && !VITA_CONTEXT_SIGNALS.some((signal) => signal.test(text))) {
    risks.push("generic_upstream_repository");
  }
  return [...new Set(risks)];
}

function evidenceGaps(entry, classification, urlInfo) {
  const text = String(entry?.title ?? "") + " " + String(entry?.body ?? "");
  const gaps = [];
  if (!urlInfo) gaps.push("canonical Reddit post URL");
  if (!/github\.com|gitlab\.com|codeberg\.org/i.test(text)) gaps.push("exact project repository");
  gaps.push("repository identity and activity facts");
  if (!/\brelease\b|\bbuild\b|\bcompiled\b|\btested\b/i.test(text)) gaps.push("release or build evidence");
  if (!/\bin.?game\b|\bplayable\b|\bboots\b|\btested\b/i.test(text)) gaps.push("Vita-specific hardware evidence");
  gaps.push("author/developer linkage and independent corroboration");
  if (!classification?.accept) gaps.push("independent editorial review");
  return gaps;
}

export function transitionState(record, nextState, event = {}) {
  const current = String(record?.state || "");
  if (!CANDIDATE_STATES.includes(current) || !CANDIDATE_STATES.includes(nextState)) {
    throw new Error("Unknown provenance state transition: " + current + " -> " + nextState);
  }
  if (!TRANSITIONS[current].includes(nextState)) {
    throw new Error("Invalid provenance state transition: " + current + " -> " + nextState);
  }
  const at = String(event.at || new Date().toISOString());
  const history = Array.isArray(record.state_history) ? record.state_history : [];
  return {
    ...record,
    state: nextState,
    state_history: [...history, {
      state: nextState,
      at,
      actor: String(event.actor || "system"),
      reason: cleanText(event.reason || "")
    }]
  };
}

export function assessCandidate(entry, options = {}) {
  const title = boundedField(entry?.title, "title");
  const body = boundedField(entry?.body, "body");
  const author = boundedField(entry?.author, "author");
  const subreddit = boundedField(options.subreddit || entry?.subreddit, "subreddit");
  const urlInfo = canonicalizeRedditUrl(entry?.url);
  const errors = [title.error, body.error, author.error, subreddit.error].filter(Boolean);
  if (!urlInfo) errors.push("url is not a canonical HTTPS Reddit post URL");
  if (!title.value) errors.push("title is required");
  if (errors.length > 0) return { accepted: false, errors, record: null };

  const safeEntry = { ...entry, title: title.value, body: body.value, author: author.value };
  const classification = options.classification || { accept: false, confidence: "low", reason: "not classified" };
  const risks = riskSignals(safeEntry, classification, urlInfo);
  const poison = risks.includes("explicit_fake_or_troll");
  const screenshotClaim = /screenshot|image|photo/i.test(title.value + " " + body.value) &&
    VITA_CONTEXT_SIGNALS.some((signal) => signal.test(title.value + " " + body.value));
  const accepted = Boolean(classification.accept || poison || screenshotClaim);
  if (!accepted) return { accepted: false, errors: [classification.reason || "not in scanner scope"], record: null };

  const detectedAt = String(options.detectedAt || new Date().toISOString());
  const publishedAt = entry?.published ? new Date(String(entry.published)).toISOString() : null;
  const record = {
    schema_version: PROVENANCE_SCHEMA_VERSION,
    id: candidateIdFromUrl(urlInfo.url),
    external_id: urlInfo.postId,
    state: "DETECTED",
    state_history: [{
      state: "DETECTED",
      at: detectedAt,
      actor: "reddit-scanner",
      reason: "Canonical Reddit RSS entry accepted at the ingestion boundary"
    }],
    source: {
      platform: "reddit",
      subreddit: urlInfo.subreddit,
      canonical_url: urlInfo.url,
      author: author.value || null,
      title: title.value,
      body: body.value,
      published_at: publishedAt
    },
    classification: {
      confidence: String(classification.confidence || "low"),
      reason: cleanText(classification.reason || ""),
      candidate_type: String(options.candidateType || "port")
    },
    provenance: {
      repository_url: null,
      release_url: null,
      evidence_urls: [],
      evidence_bundle_id: null,
      repository_identity: null,
      repository_created_at: null,
      repository_last_activity_at: null,
      release_facts: [],
      vita_evidence: [],
      author_linkage: null,
      corroboration: [],
      duplicate_relation: { content_hash: String(options.contentHash || ""), related_candidate_ids: [] }
    },
    campaign: campaignMetadata(safeEntry),
    risk_signals: risks,
    evidence_gaps: evidenceGaps(safeEntry, classification, urlInfo),
    content_hash: String(options.contentHash || ""),
    review: null,
    incident: null
  };

  return {
    accepted: true,
    errors: [],
    explicitPoison: poison,
    record: transitionState(record, "QUARANTINED", {
      actor: "reddit-scanner",
      at: detectedAt,
      reason: poison ? "Explicit fake/troll language; held without public amplification" : "Scanner result is unverified and cannot enter the curated ledger"
    })
  };
}

export function migrateLegacyCandidate(item, options = {}) {
  const result = assessCandidate({
    title: item?.title,
    body: "",
    author: String(item?.author || "").replace(/^u\//i, ""),
    url: item?.url,
    published: item?.published_at
  }, {
    subreddit: item?.subreddit,
    detectedAt: item?.detected_at || options.detectedAt,
    candidateType: item?.candidate_type,
    classification: {
      accept: true,
      confidence: item?.confidence || "low",
      reason: item?.classification_reason || "Migrated from legacy discovery queue"
    }
  });
  if (!result.record) return result;
  return {
    ...result,
    record: {
      ...result.record,
      evidence_gaps: [...new Set([...result.record.evidence_gaps, "raw post body was not stored in legacy queue"])],
      state_history: result.record.state_history.map((event) =>
        event.state === "QUARANTINED"
          ? { ...event, reason: "Migrated from legacy discovery queue; requires fresh source review" }
          : event
      )
    }
  };
}

export function upgradeProvenanceRecord(record) {
  const provenance = record?.provenance || {};
  const duplicate = provenance.duplicate_relation || {};
  return {
    ...record,
    provenance: {
      repository_url: provenance.repository_url || null,
      release_url: provenance.release_url || null,
      evidence_urls: Array.isArray(provenance.evidence_urls) ? provenance.evidence_urls : [],
      evidence_bundle_id: provenance.evidence_bundle_id || null,
      repository_identity: provenance.repository_identity || null,
      repository_created_at: provenance.repository_created_at || null,
      repository_last_activity_at: provenance.repository_last_activity_at || null,
      release_facts: Array.isArray(provenance.release_facts) ? provenance.release_facts : [],
      vita_evidence: Array.isArray(provenance.vita_evidence) ? provenance.vita_evidence : [],
      author_linkage: provenance.author_linkage || null,
      corroboration: Array.isArray(provenance.corroboration) ? provenance.corroboration : [],
      duplicate_relation: {
        content_hash: duplicate.content_hash || record?.content_hash || "",
        related_candidate_ids: Array.isArray(duplicate.related_candidate_ids) ? duplicate.related_candidate_ids : []
      }
    },
    campaign: {
      ...campaignMetadata(record?.source || {}),
      ...(record?.campaign || {}),
      signals: uniqueStrings(record?.campaign?.signals || []),
      related_candidate_ids: uniqueStrings(record?.campaign?.related_candidate_ids || []),
      media_fingerprints: uniqueStrings(record?.campaign?.media_fingerprints || []),
      outbound_fingerprints: uniqueStrings(record?.campaign?.outbound_fingerprints || [])
    },
    incident: record?.incident || null,
    evidence_gaps: [...new Set([...(Array.isArray(record?.evidence_gaps) ? record.evidence_gaps : []), "repository identity and activity facts", "author/developer linkage and independent corroboration"])]
  };
}

export function containIncidentRecords(records, options = {}) {
  const incidentId = String(options.incidentId || "").trim();
  if (!incidentId) throw new Error("incidentId is required");
  const at = String(options.at || new Date().toISOString());
  const actor = String(options.actor || "incident-response");
  const rejected = new Set((options.rejectedIds || []).map(String));
  const blocked = new Set((options.blockedIds || []).map(String));
  const correlated = correlateCampaigns(records, options);
  return correlated.map((record) => {
    const isRejected = rejected.has(String(record.id));
    const isBlocked = blocked.has(String(record.id));
    if (!isRejected && !isBlocked) return record;
    const nextState = isRejected ? "REJECTED" : "BLOCKED_UNVERIFIED";
    const classification = isRejected ? "CONFIRMED_CAMPAIGN_FAKE" : "UNVERIFIED_CLAIM";
    const rationale = isRejected
      ? "Confirmed malicious fake-port campaign intent; withheld from every public projection"
      : "Linked to a confirmed campaign signal but no project evidence was available; held without amplification";
    const transitioned = TERMINAL_STATES.includes(record.state)
      ? record
      : transitionState(record, nextState, { actor, at, reason: rationale });
    return {
      ...transitioned,
      campaign: {
        ...transitioned.campaign,
        incident_id: incidentId,
        linkage_confidence: isRejected ? "high" : (transitioned.campaign?.linkage_confidence || "medium")
      },
      incident: {
        incident_id: incidentId,
        classification,
        confirmed_at: at,
        rationale,
        public_containment: "removed"
      },
      review: {
        ...(transitioned.review || {}),
        reviewer: actor,
        reviewed_at: at,
        reason: rationale,
        evidence_bundle: null
      }
    };
  });
}

export function publicCandidate(record) {
  const state = String(record?.state || "");
  if (!["QUARANTINED", "VERIFIED_FOR_REVIEW"].includes(state)) return null;
  if (record?.incident?.public_containment === "removed") return null;
  const withheld = Array.isArray(record.risk_signals) && record.risk_signals.includes("explicit_fake_or_troll");
  return {
    id: record.id,
    state,
    title: withheld ? "Source candidate withheld pending manual review" : record.source?.title || "Source candidate",
    url: withheld ? null : record.source?.canonical_url || null,
    subreddit: withheld ? null : record.source?.subreddit || null,
    published_at: record.source?.published_at || null,
    detected_at: record.state_history?.[0]?.at || null,
    candidate_type: withheld ? "unclassified" : record.classification?.candidate_type || "port",
    public_visibility: withheld ? "withheld" : "review_queue"
  };
}

export function publicDocument(records, generatedAt, sourceLabel) {
  return {
    schema_version: PROVENANCE_SCHEMA_VERSION,
    generated_at: generatedAt,
    source: sourceLabel + " RSS",
    note: "Detected sources are quarantined and are not part of the curated ledger. No public item is a promotion or endorsement.",
    items: records.map(publicCandidate).filter(Boolean)
  };
}

export function transitionMap() {
  return TRANSITIONS;
}
