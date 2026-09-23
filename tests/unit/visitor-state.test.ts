import { describe, expect, it } from "vitest";
import {
  countUpdatesSince,
  readLastVisit,
  readWatchlist,
  scannerFreshness,
  wasRecentlyUpdated,
  writeLastVisit,
  writeWatchlist
} from "../../src/web/lib/visitorState";

const NOW = Date.parse("2026-09-23T00:00:00.000Z");

describe("visitor state", () => {
  it("classifies freshness only after a complete source scan", () => {
    const complete = (attempted_at: string) => ({
      schema_version: 1 as const,
      attempted_at,
      state: "complete" as const,
      successful_sources: 3,
      total_sources: 3,
      sources: ["vitahacks", "VitaPiracy", "PSVitaHomebrew"].map((subreddit) => ({ subreddit, status: "available" as const }))
    });
    expect(scannerFreshness(complete("2026-09-22T10:00:00.000Z"), NOW).state).toBe("fresh");
    expect(scannerFreshness(complete("2026-09-22T09:59:59.000Z"), NOW).state).toBe("delayed");
    expect(scannerFreshness(complete("2026-09-21T21:59:59.000Z"), NOW).state).toBe("stale");
    expect(scannerFreshness(null, NOW).state).toBe("unknown");
  });

  it("keeps mixed rate-limit and failed scan states distinct from freshness", () => {
    const partial = {
      schema_version: 1 as const,
      attempted_at: "2026-09-22T23:00:00.000Z",
      state: "partial" as const,
      successful_sources: 2,
      total_sources: 3,
      sources: [
        { subreddit: "vitahacks", status: "available" as const },
        { subreddit: "VitaPiracy", status: "rate_limited" as const },
        { subreddit: "PSVitaHomebrew", status: "available" as const }
      ]
    };
    expect(scannerFreshness(partial, NOW).state).toBe("partial");
    expect(scannerFreshness(partial, NOW).label).toContain("2/3 sources");
    expect(scannerFreshness({ ...partial, attempted_at: "2026-09-21T20:00:00.000Z" }, NOW).label).toContain("stale");
    expect(scannerFreshness({ ...partial, state: "failed", successful_sources: 0 }, NOW).state).toBe("failed");
    expect(scannerFreshness({ ...partial, state: "complete", successful_sources: 3, attempted_at: "2026-09-24T00:00:00.000Z" }, NOW).state).toBe("unknown");
  });

  it("keeps watchlist and visit storage failure-safe", () => {
    const values = new Map<string, string>();
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => { values.set(key, value); }
    };

    expect(writeWatchlist(["halo-ce", "halo-ce", "test-drive-1987"], storage)).toBe(true);
    expect(readWatchlist(storage)).toEqual(["halo-ce", "test-drive-1987"]);
    expect(writeLastVisit(NOW, storage)).toBe(true);
    expect(readLastVisit(storage)).toBe(NOW);

    const broken = {
      getItem: () => { throw new Error("blocked"); },
      setItem: () => { throw new Error("blocked"); }
    };
    expect(readWatchlist(broken)).toEqual([]);
    expect(writeWatchlist(["halo-ce"], broken)).toBe(false);
    expect(readLastVisit(broken)).toBeNull();
    expect(writeLastVisit(NOW, broken)).toBe(false);
  });

  it("counts only updates after the previous visit and recognizes recent activity", () => {
    const since = Date.parse("2026-09-20T00:00:00.000Z");
    expect(countUpdatesSince([
      { event_at: "2026-09-19T23:59:59.000Z" },
      { event_at: "2026-09-20T00:00:01.000Z" },
      { event_at: "2026-09-22T12:00:00.000Z" }
    ], since)).toBe(2);

    expect(wasRecentlyUpdated("2026-08-24T00:00:00.000Z", NOW)).toBe(true);
    expect(wasRecentlyUpdated("2026-08-23T23:59:59.000Z", NOW)).toBe(false);
    expect(wasRecentlyUpdated("2026-09-24T00:00:00.000Z", NOW)).toBe(false);
  });
});
