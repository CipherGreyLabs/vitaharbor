import { describe, expect, it } from "vitest";
import { buildScannerHealth } from "../../scripts/reddit-scan-health.mjs";

describe("scanner health summary", () => {
  const sources = ["vitahacks", "VitaPiracy", "PSVitaHomebrew"];

  it("reports complete only when every configured community responded", () => {
    expect(buildScannerHealth(sources, sources.map((subreddit) => ({ subreddit, status: "available" })), "2026-09-23T00:00:00.000Z")).toEqual({
      schema_version: 1,
      attempted_at: "2026-09-23T00:00:00.000Z",
      state: "complete",
      successful_sources: 3,
      total_sources: 3,
      sources: sources.map((subreddit) => ({ subreddit, status: "available" }))
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
});
