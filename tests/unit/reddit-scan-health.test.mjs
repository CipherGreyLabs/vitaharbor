import { describe, expect, it } from "vitest";
import { buildScannerHealth, finalizeGithubActionHealth } from "../../scripts/reddit-scan-health.mjs";

describe("scanner health summary", () => {
  const sources = ["vitahacks", "VitaPiracy", "PSVitaHomebrew"];

  it("reports complete only when every configured community responded", () => {
    expect(buildScannerHealth(sources, sources.map((subreddit) => ({ subreddit, status: "available" })), "2026-09-23T00:00:00.000Z")).toEqual({
      schema_version: 2,
      attempted_at: "2026-09-23T00:00:00.000Z",
      state: "complete",
      successful_sources: 3,
      total_sources: 3,
      github_action: { provider: "local", status: "unknown", run_id: null, event: null, sha: null },
      consecutive_degraded_runs: 0,
      recent_runs: [{
        attempted_at: "2026-09-23T00:00:00.000Z",
        state: "complete",
        successful_sources: 3,
        source_statuses: { vitahacks: "available", VitaPiracy: "available", PSVitaHomebrew: "available" }
      }],
      sources: sources.map((subreddit) => ({ subreddit, status: "available", last_successful_scan_at: "2026-09-23T00:00:00.000Z", consecutive_failures: 0 }))
    });
  });

  it("exposes mixed 429 results as partial without raw error text", () => {
    const health = buildScannerHealth(sources, [
      { subreddit: "vitahacks", status: "available" },
      { subreddit: "VitaPiracy", status: "rate_limited", error: "private transport detail" },
      { subreddit: "PSVitaHomebrew", status: "available" }
    ]);
    expect(health.state).toBe("partial");
    expect(health.successful_sources).toBe(2);
    expect(health.sources[1].status).toBe("rate_limited");
    expect(JSON.stringify(health)).not.toContain("private transport detail");
  });

  it("reports a fully failed scan while retaining all source statuses", () => {
    const health = buildScannerHealth(sources, []);
    expect(health.state).toBe("failed");
    expect(health.successful_sources).toBe(0);
    expect(health.sources.map((source) => source.status)).toEqual(["unavailable", "unavailable", "unavailable"]);
  });

  it("keeps the last real success per source and recognizes repeated degraded runs", () => {
    const previous = buildScannerHealth(sources, [
      { subreddit: "vitahacks", status: "available" },
      { subreddit: "VitaPiracy", status: "rate_limited" },
      { subreddit: "PSVitaHomebrew", status: "unavailable" }
    ], "2026-09-22T00:00:00.000Z");
    const current = buildScannerHealth(sources, [
      { subreddit: "vitahacks", status: "rate_limited" },
      { subreddit: "VitaPiracy", status: "rate_limited" },
      { subreddit: "PSVitaHomebrew", status: "unavailable" }
    ], "2026-09-23T00:00:00.000Z", previous);
    expect(current.sources[0].last_successful_scan_at).toBe("2026-09-22T00:00:00.000Z");
    expect(current.sources[1].last_successful_scan_at).toBeNull();
    expect(current.consecutive_degraded_runs).toBe(2);
    expect(current.sources[0].consecutive_failures).toBe(1);
  });

  it("records GitHub Action success separately from source results", () => {
    const health = buildScannerHealth(sources, [], "2026-09-23T00:00:00.000Z");
    const finalized = finalizeGithubActionHealth(health, { run_id: "123", event: "schedule", sha: "abc" });
    expect(finalized.state).toBe("failed");
    expect(finalized.github_action).toEqual({ provider: "github-actions", status: "success", run_id: "123", event: "schedule", sha: "abc" });
  });
});
