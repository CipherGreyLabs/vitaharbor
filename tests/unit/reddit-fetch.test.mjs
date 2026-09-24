import { describe, expect, it, vi } from "vitest";
import { fetchRedditFeed, MAX_RETRY_AFTER_SECONDS, parseRetryAfterSeconds } from "../../scripts/reddit-fetch.mjs";

describe("bounded Reddit RSS fetch policy", () => {
  const nowMs = Date.parse("2026-09-24T10:00:00.000Z");

  it("parses numeric and HTTP-date Retry-After values and bounds them", () => {
    expect(parseRetryAfterSeconds("75", nowMs)).toBe(75);
    expect(parseRetryAfterSeconds("Thu, 24 Sep 2026 10:02:04 GMT", nowMs)).toBe(124);
    expect(parseRetryAfterSeconds("999999999", nowMs)).toBe(MAX_RETRY_AFTER_SECONDS);
    expect(parseRetryAfterSeconds("Thu, 24 Sep 2026 09:59:00 GMT", nowMs)).toBe(0);
    expect(parseRetryAfterSeconds("not-a-date", nowMs)).toBeNull();
    expect(parseRetryAfterSeconds(null, nowMs)).toBeNull();
  });

  it("does not immediately retry or sleep after HTTP 429", async () => {
    const fetchImpl = vi.fn(async () => new Response("rate limited", {
      status: 429,
      headers: { "Retry-After": "999999" }
    }));
    const sleep = vi.fn();

    const result = await fetchRedditFeed("https://www.reddit.com/r/vitahacks/new.rss", {
      userAgent: "test-agent",
      fetchImpl,
      sleep,
      now: () => nowMs
    });

    expect(result).toEqual({
      status: "rate_limited",
      response: null,
      httpStatus: 429,
      retryAfterSeconds: MAX_RETRY_AFTER_SECONDS
    });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(sleep).not.toHaveBeenCalled();
  });

  it("retries transient server failures once after a bounded delay", async () => {
    const fetchImpl = vi.fn()
      .mockResolvedValueOnce(new Response("busy", { status: 503 }))
      .mockResolvedValueOnce(new Response("ok", { status: 200 }));
    const sleep = vi.fn(async () => undefined);

    const result = await fetchRedditFeed("https://www.reddit.com/r/vitahacks/new.rss", {
      userAgent: "test-agent",
      fetchImpl,
      sleep,
      retryDelayMs: 1200
    });

    expect(result.status).toBe("available");
    expect(fetchImpl).toHaveBeenCalledTimes(2);
    expect(sleep).toHaveBeenCalledExactlyOnceWith(1200);
  });

  it("does not retry permanent client errors", async () => {
    const fetchImpl = vi.fn(async () => new Response("forbidden", { status: 403 }));
    const sleep = vi.fn();

    const result = await fetchRedditFeed("https://www.reddit.com/r/vitahacks/new.rss", {
      userAgent: "test-agent",
      fetchImpl,
      sleep
    });

    expect(result).toMatchObject({ status: "unavailable", httpStatus: 403 });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(sleep).not.toHaveBeenCalled();
  });

  it("retries a transient network failure once", async () => {
    const fetchImpl = vi.fn()
      .mockRejectedValueOnce(new Error("temporary network failure"))
      .mockResolvedValueOnce(new Response("ok", { status: 200 }));
    const sleep = vi.fn(async () => undefined);

    const result = await fetchRedditFeed("https://www.reddit.com/r/vitahacks/new.rss", {
      userAgent: "test-agent",
      fetchImpl,
      sleep
    });

    expect(result.status).toBe("available");
    expect(fetchImpl).toHaveBeenCalledTimes(2);
    expect(sleep).toHaveBeenCalledExactlyOnceWith(1200);
  });
});
