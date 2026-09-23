import { describe, expect, it } from "vitest";
import { fetchScannerAsset } from "../../src/web/lib/scannerAssets";

const attemptedAt = "2026-09-23T05:09:00.000Z";

function healthRecord() {
  return {
    schema_version: 1,
    attempted_at: attemptedAt,
    state: "failed",
    successful_sources: 0,
    total_sources: 3,
    sources: [
      { subreddit: "vitahacks", status: "rate_limited" },
      { subreddit: "VitaPiracy", status: "rate_limited" },
      { subreddit: "PSVitaHomebrew", status: "rate_limited" }
    ]
  };
}

function queueRecord() {
  return {
    schema_version: 2,
    generated_at: attemptedAt,
    source: "r/vitahacks + r/VitaPiracy + r/PSVitaHomebrew RSS",
    note: "Detected sources remain quarantined.",
    items: [{
      id: "reddit-abc123",
      state: "QUARANTINED",
      title: "Example Vita port WIP",
      url: "https://www.reddit.com/r/vitahacks/comments/abc123/example/",
      subreddit: "vitahacks",
      published_at: attemptedAt,
      detected_at: attemptedAt,
      candidate_type: "port",
      public_visibility: "review_queue",
      author: "private-author-field",
      body: "private-body-field",
      risk_signals: ["private-risk-field"]
    }]
  };
}

function jsonResponse(value: unknown, headers?: HeadersInit): Response {
  return new Response(JSON.stringify(value), {
    status: 200,
    headers: { "content-type": "application/json", ...Object.fromEntries(new Headers(headers).entries()) }
  });
}

describe("fetchScannerAsset", () => {
  it("loads and validates current scan health from the public repository without caching", async () => {
    const calls: Array<{ url: string; init?: RequestInit }> = [];
    const raw = { ...healthRecord(), private_metadata: "must not reach the UI" };
    const fetcher: typeof fetch = async (input, init) => {
      calls.push({ url: String(input), init });
      return jsonResponse(raw);
    };

    const result = await fetchScannerAsset("scanner-health.json", fetcher);

    expect(result).toEqual({ data: healthRecord(), source: "live" });
    expect(calls).toHaveLength(1);
    expect(calls[0].url).toMatch(/^https:\/\/raw\.githubusercontent\.com\/CipherGreyLabs\/vitaharbor\/main\/public\/data\/scanner-health\.json\?v=\d+$/);
    expect(calls[0].init?.cache).toBe("no-store");
  });

  it("projects only approved discovery fields and omits private source metadata", async () => {
    const result = await fetchScannerAsset("discovered.json", async () => jsonResponse(queueRecord()));

    expect(result).toEqual({
      source: "live",
      data: {
        schema_version: 2,
        generated_at: attemptedAt,
        source: "r/vitahacks + r/VitaPiracy + r/PSVitaHomebrew RSS",
        note: "Detected sources remain quarantined.",
        items: [{
          id: "reddit-abc123",
          state: "QUARANTINED",
          title: "Example Vita port WIP",
          url: "https://www.reddit.com/r/vitahacks/comments/abc123/example/",
          subreddit: "vitahacks",
          published_at: attemptedAt,
          candidate_type: "port",
          public_visibility: "review_queue"
        }]
      }
    });
    const serialized = JSON.stringify(result.data);
    expect(serialized).not.toContain("private-author-field");
    expect(serialized).not.toContain("private-body-field");
    expect(serialized).not.toContain("private-risk-field");
    expect(serialized).not.toContain("detected_at");
  });

  it("uses the validated deployed snapshot only as an explicitly marked fallback", async () => {
    const urls: string[] = [];
    const fetcher: typeof fetch = async (input) => {
      const url = String(input);
      urls.push(url);
      return url.startsWith("https:")
        ? new Response("unavailable", { status: 503 })
        : jsonResponse(queueRecord());
    };

    const result = await fetchScannerAsset("discovered.json", fetcher);

    expect(result.source).toBe("snapshot");
    expect(result.data).not.toBeNull();
    expect(urls).toHaveLength(2);
    expect(urls[1]).toBe("/data/discovered.json");
  });

  it("rejects oversized live data before parsing and falls back to the snapshot", async () => {
    const oversized = JSON.stringify({ ...healthRecord(), extra: "x".repeat(9000) });
    const urls: string[] = [];
    const fetcher: typeof fetch = async (input) => {
      const url = String(input);
      urls.push(url);
      return url.startsWith("https:")
        ? new Response(oversized, { status: 200 })
        : jsonResponse(healthRecord());
    };

    const result = await fetchScannerAsset("scanner-health.json", fetcher);

    expect(result).toEqual({ data: healthRecord(), source: "snapshot" });
    expect(urls).toHaveLength(2);
  });

  it("rejects invalid schema, off-site Reddit links, and inconsistent source status", async () => {
    const badQueue = queueRecord();
    badQueue.items[0].url = "https://example.com/r/vitahacks/comments/abc123/example/";
    const invalidHealth = { ...healthRecord(), successful_sources: 1 };
    const fetcher: typeof fetch = async (input) => String(input).startsWith("https:")
      ? jsonResponse(String(input).endsWith("scanner-health.json") ? invalidHealth : badQueue)
      : new Response("not valid json", { status: 200 });

    await expect(fetchScannerAsset("discovered.json", fetcher)).resolves.toEqual({ data: null, source: "unavailable" });
    await expect(fetchScannerAsset("scanner-health.json", fetcher)).resolves.toEqual({ data: null, source: "unavailable" });
  });

  it("reports unavailable when neither live data nor the deployed snapshot can be read", async () => {
    const fetcher: typeof fetch = async () => { throw new Error("offline"); };

    await expect(fetchScannerAsset("scanner-health.json", fetcher)).resolves.toEqual({
      data: null,
      source: "unavailable"
    });
  });
});
