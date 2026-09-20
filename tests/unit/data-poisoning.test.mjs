import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { classify } from "../../scripts/reddit-classifier.mjs";
import {
  assessCandidate,
  candidateIdFromUrl,
  canonicalizeEvidenceUrl,
  canonicalizeRedditUrl,
  campaignSignalsBetween,
  containIncidentRecords,
  correlateCampaigns,
  migrateLegacyCandidate,
  publicCandidate,
  publicDocument,
  transitionState
} from "../../scripts/reddit-provenance.mjs";

const base = {
  title: "[Release] Example native Vita port",
  body: "Native PS Vita build tested in-game on hardware. GitHub release and source are linked.",
  author: "developer",
  url: "https://www.reddit.com/r/vitahacks/comments/abc123/example_native_vita_port/",
  published: "2026-09-20T12:00:00.000Z"
};

function assess(entry = base, overrides = {}) {
  const value = { ...entry, ...overrides };
  return assessCandidate(value, {
    subreddit: "vitahacks",
    detectedAt: "2026-09-20T12:01:00.000Z",
    classification: overrides.classification || classify(value),
    candidateType: "port",
    contentHash: overrides.contentHash || value.contentHash || "fixture-hash"
  });
}

function assessManual(entry, subreddit, contentHash) {
  return assessCandidate(entry, {
    subreddit,
    detectedAt: "2026-09-20T12:01:00.000Z",
    classification: { accept: true, confidence: "medium", reason: "incident fixture" },
    candidateType: "port",
    contentHash
  });
}

describe("provenance boundary", () => {
  it("accepts a legitimate-looking source only into QUARANTINED", () => {
    const result = assess();
    expect(result.accepted).toBe(true);
    expect(result.record.state).toBe("QUARANTINED");
    expect(result.record.state_history.map((event) => event.state)).toEqual(["DETECTED", "QUARANTINED"]);
    expect(result.record.state).not.toBe("PROMOTED");
  });

  it("captures an explicit fake/troll campaign even when the normal classifier rejects it", () => {
    const result = assess({
      ...base,
      title: "We should make fake ports to troll VitaHarbor",
      body: "Would be very funny"
    });
    expect(result.accepted).toBe(true);
    expect(result.explicitPoison).toBe(true);
    expect(result.record.risk_signals).toContain("explicit_fake_or_troll");
    const safe = publicCandidate(result.record);
    expect(safe.title).toBe("Source candidate withheld pending manual review");
    expect(safe.url).toBeNull();
    expect(safe.subreddit).toBeNull();
    expect(JSON.stringify(safe)).not.toContain("developer");
  });

  it("rejects malformed, redirected and oversized input at ingestion", () => {
    expect(assess({ ...base, url: "http://evil.example/redirect?to=reddit" }).accepted).toBe(false);
    expect(assess({ ...base, url: "https://www.reddit.com/r/vitahacks/comments/abc123/" }).accepted).toBe(false);
    expect(assess({ ...base, title: "x".repeat(301) }).accepted).toBe(false);
    expect(assess({ ...base, body: "x".repeat(8001) }).accepted).toBe(false);
  });

  it("normalizes hostile markup as text and does not expose internal reasons", () => {
    const result = assess({ ...base, title: "<script>alert(1)</script> [Release] Vita port" });
    expect(result.accepted).toBe(true);
    expect(result.record.source.title).not.toContain("<script>");
    const safeDoc = publicDocument([result.record], "2026-09-20T12:01:00.000Z", "r/vitahacks");
    const serialized = JSON.stringify(safeDoc);
    expect(serialized).not.toContain("risk_signals");
    expect(serialized).not.toContain("classification_reason");
    expect(serialized).not.toContain("author");
  });

  it("marks generic upstream, screenshot-only and missing-evidence claims", () => {
    const generic = assess({ ...base, title: "GitHub engine update", body: "New GitHub repository is available." });
    expect(generic.record.risk_signals).toContain("generic_upstream_repository");
    const screenshot = assess({ ...base, title: "Vita port screenshot", body: "Here is a screenshot of the port." });
    expect(screenshot.record.risk_signals).toContain("screenshot_only_claim");
    expect(screenshot.record.evidence_gaps).toContain("exact project repository");
  });

  it("keeps cross-post identity canonical and does not treat it as independent proof", () => {
    const one = canonicalizeRedditUrl(base.url);
    const two = canonicalizeRedditUrl(base.url + "?utm_source=copy#comments");
    expect(one).toEqual(two);
    expect(one.postId).toBe("abc123");
  });

  it("enforces the manual state machine", () => {
    const result = assess();
    const verified = transitionState(result.record, "VERIFIED_FOR_REVIEW", { actor: "reviewer", reason: "Evidence bundle checked" });
    expect(verified.state).toBe("VERIFIED_FOR_REVIEW");
    expect(() => transitionState(result.record, "PROMOTED")).toThrow("Invalid provenance state transition");
    expect(() => transitionState(verified, "DETECTED")).toThrow("Invalid provenance state transition");
    expect(transitionState(verified, "PROMOTED", { actor: "reviewer", reason: "Explicit promotion" }).state).toBe("PROMOTED");
  });

  it("migrates legacy queue items without promoting them", () => {
    const result = migrateLegacyCandidate({
      title: "[Release] Legacy port",
      url: base.url,
      subreddit: "vitahacks",
      author: "u/legacy",
      published_at: base.published,
      detected_at: "2026-09-20T12:01:00.000Z",
      confidence: "high"
    });
    expect(result.record.state).toBe("QUARANTINED");
    expect(result.record.evidence_gaps).toContain("raw post body was not stored in legacy queue");
  });

  it("allowlists evidence hosts and rejects attacker-controlled redirects", () => {
    expect(canonicalizeEvidenceUrl("https://github.com/org/repo/releases/tag/v1")).toBe("https://github.com/org/repo/releases/tag/v1");
    expect(canonicalizeEvidenceUrl("https://evil.example/?next=https://github.com/org/repo")).toBeNull();
    expect(canonicalizeEvidenceUrl("javascript:alert(1)")).toBeNull();
  });

  it("keeps scanner and scheduled workflow writes outside the curated ledger", () => {
    const root = path.resolve(process.cwd());
    const scanner = fs.readFileSync(path.join(root, "scripts/cron-reddit-scan.mjs"), "utf8");
    const workflow = fs.readFileSync(path.join(root, ".github/workflows/reddit-scanner.yml"), "utf8");
    expect(scanner).not.toMatch(/writeFileSync\(\s*LEDGER/);
    expect(scanner).toContain("data/quarantine.json");
    expect(workflow).toContain("git add data/quarantine.json public/data public/api");
    expect(workflow).not.toContain("fallbackData.ts");
  });

  it("links a cross-community campaign by content and explicit reference, not by username alone", () => {
    const threat = assess({
      ...base,
      author: "campaign-account",
      title: "We should make fake ports to troll VitaHarbor",
      body: "Would be very funny",
      url: "https://www.reddit.com/r/VitaPiracy/comments/threat01/fake-port-campaign/",
      published: "2026-09-20T14:58:36.001Z"
    });
    const followUp = assessManual({
      ...base,
      author: "campaign-account",
      title: "KeeperRL Vita announcement!",
      body: "This is unrelated to my previous post about trolling VitaHarbor, actually this time. The port starts on PS Vita. Coming soon.",
      url: "https://www.reddit.com/r/VitaPiracy/comments/follow01/keeperrl-vita-announcement/",
      published: "2026-09-20T15:42:26.424Z"
    }, "VitaPiracy", "keeperrl-one");
    const crossPost = assessManual({
      ...base,
      author: "different-account",
      title: "KeeperRL Vita announcement!",
      body: "This is unrelated to my previous post about trolling VitaHarbor, actually this time. The port starts on PS Vita. Coming soon.",
      url: "https://www.reddit.com/r/vitahacks/comments/follow02/keeperrl-vita-announcement/",
      published: "2026-09-20T15:47:59.851Z"
    }, "vitahacks", "keeperrl-one");
    const records = correlateCampaigns([threat.record, followUp.record, crossPost.record]);
    expect(new Set(records.map((record) => record.campaign.cluster_id)).size).toBe(1);
    expect(records[1].campaign.related_candidate_ids).toContain(records[0].id);
    expect(records[1].campaign.signals).toContain("explicit_campaign_reference");
    expect(records[2].campaign.signals).toContain("same_content_hash");
  });

  it("does not blacklist a username or merge an unrelated legitimate project", () => {
    const first = assess({
      ...base,
      author: "same-account",
      title: "We should make fake ports to troll VitaHarbor",
      body: "Would be very funny",
      url: "https://www.reddit.com/r/VitaPiracy/comments/threat02/fake-port-campaign/",
      published: "2026-09-20T14:58:36.001Z",
      contentHash: "threat-hash"
    });
    const legitimate = assess({
      ...base,
      author: "same-account",
      title: "[Release] Real native Vita port",
      body: "GitHub release and repository are linked. Native PS Vita build tested in-game on hardware.",
      url: "https://www.reddit.com/r/vitahacks/comments/legit01/real_native_vita_port/",
      published: "2026-09-20T16:10:00.000Z",
      contentHash: "legitimate-hash"
    });
    const relation = campaignSignalsBetween(first.record, legitimate.record);
    expect(relation.signals).toContain("same_author_burst");
    expect(relation.linked).toBe(false);
    const records = correlateCampaigns([first.record, legitimate.record]);
    expect(records[1].campaign.cluster_id).toBeNull();
    expect(records[1].state).toBe("QUARANTINED");
  });

  it("removes only incident-linked records from public projections", () => {
    const threat = assess({
      ...base,
      title: "We should make fake ports to troll VitaHarbor",
      body: "Would be very funny",
      url: "https://www.reddit.com/r/VitaPiracy/comments/threat03/fake-port-campaign/"
    });
    const legitimate = assess();
    const contained = containIncidentRecords([threat.record, legitimate.record], {
      incidentId: "VH-INCIDENT-010",
      rejectedIds: [candidateIdFromUrl(threat.record.source.canonical_url)],
      at: "2026-09-20T18:00:00.000Z"
    });
    expect(contained[0].state).toBe("REJECTED");
    expect(contained[0].incident.public_containment).toBe("removed");
    expect(publicCandidate(contained[0])).toBeNull();
    expect(publicDocument(contained, "2026-09-20T18:00:00.000Z", "r/test").items).toHaveLength(1);
  });
});
