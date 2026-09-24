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
  it("classifies scanner freshness at the documented 14h and 26h boundaries", () => {
    expect(scannerFreshness("2026-09-22T10:00:00.000Z", NOW).state).toBe("fresh");
    expect(scannerFreshness("2026-09-22T09:59:59.000Z", NOW).state).toBe("delayed");
    expect(scannerFreshness("2026-09-21T22:00:00.000Z", NOW).state).toBe("delayed");
    expect(scannerFreshness("2026-09-21T21:59:59.000Z", NOW).state).toBe("stale");
    expect(scannerFreshness(null, NOW).state).toBe("unknown");
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
