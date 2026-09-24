import { describe, expect, it } from "vitest";
import { fetchCommunityPosts } from "../../src/web/lib/scannerAssets";

const publishedAt = "2026-09-23T05:09:00.000Z";

function postsDocument() {
  return {
    schema_version: 1,
    items: [{
      title: "Example Vita port WIP",
      url: "https://www.reddit.com/r/vitahacks/comments/abc123/example/",
      subreddit: "vitahacks",
      published_at: publishedAt,
      verification: "unverified"
    }]
  };
}

function jsonResponse(value: unknown): Response {
  return new Response(JSON.stringify(value), {
    status: 200,
    headers: { "content-type": "application/json" }
  });
}

describe("fetchCommunityPosts", () => {
  it("loads a minimal, explicitly unverified community-post document without caching", async () => {
    const calls: Array<{ url: string; init?: RequestInit }> = [];
    const fetcher: typeof fetch = async (input, init) => {
      calls.push({ url: String(input), init });
      return jsonResponse(postsDocument());
    };

    const result = await fetchCommunityPosts(fetcher);

    expect(result).toEqual({
      source: "live",
      data: {
        schema_version: 1,
        items: [{
          title: "Example Vita port WIP",
          url: "https://www.reddit.com/r/vitahacks/comments/abc123/example/",
          subreddit: "vitahacks",
          published_at: publishedAt,
          verification: "unverified"
        }]
      }
    });
    expect(calls).toHaveLength(1);
    expect(calls[0].url).toMatch(/^https:\/\/raw\.githubusercontent\.com\/CipherGreyLabs\/vitaharbor\/main\/public\/data\/discovered\.json\?v=\d+$/);
    expect(calls[0].init?.cache).toBe("no-store");
  });

  it("rejects run, health, quarantine and review-queue metadata from the public projection", async () => {
    const item = { ...postsDocument().items[0], run_id: "123", state: "QUARANTINED", detected_at: publishedAt };
    const document = { ...postsDocument(), attempted_at: publishedAt, github_action: { status: "success" }, items: [item] };
    const fetcher: typeof fetch = async () => jsonResponse(document);

    await expect(fetchCommunityPosts(fetcher)).resolves.toEqual({ data: null, source: "unavailable" });
  });

  it("uses only a validated static visitor-facing copy as fallback", async () => {
    const urls: string[] = [];
    const fetcher: typeof fetch = async (input) => {
      const url = String(input);
      urls.push(url);
      return url.startsWith("https:")
        ? new Response("unavailable", { status: 503 })
        : jsonResponse(postsDocument());
    };

    const result = await fetchCommunityPosts(fetcher);

    expect(result.source).toBe("snapshot");
    expect(result.data?.items).toHaveLength(1);
    expect(urls).toHaveLength(2);
    expect(urls[1]).toBe("/data/discovered.json");
  });

  it("rejects oversized live data before parsing and falls back to the safe snapshot", async () => {
    const oversized = JSON.stringify({ ...postsDocument(), items: [{ ...postsDocument().items[0], title: "x".repeat(300_000) }] });
    const urls: string[] = [];
    const fetcher: typeof fetch = async (input) => {
      const url = String(input);
      urls.push(url);
      return url.startsWith("https:") ? new Response(oversized, { status: 200 }) : jsonResponse(postsDocument());
    };

    const result = await fetchCommunityPosts(fetcher);

    expect(result.source).toBe("snapshot");
    expect(result.data?.items).toHaveLength(1);
    expect(urls).toHaveLength(2);
  });

  it("rejects off-site URLs, unsupported communities and duplicate posts", async () => {
    const offSite = postsDocument();
    offSite.items[0].url = "https://example.com/r/vitahacks/comments/abc123/example/";
    const fetchOffSite: typeof fetch = async () => jsonResponse(offSite);
    await expect(fetchCommunityPosts(fetchOffSite)).resolves.toEqual({ data: null, source: "unavailable" });

    const wrongCommunity = postsDocument();
    wrongCommunity.items[0].subreddit = "not-a-vita-community";
    const fetchWrongCommunity: typeof fetch = async () => jsonResponse(wrongCommunity);
    await expect(fetchCommunityPosts(fetchWrongCommunity)).resolves.toEqual({ data: null, source: "unavailable" });

    const duplicate = postsDocument();
    duplicate.items.push({ ...duplicate.items[0] });
    const fetchDuplicate: typeof fetch = async () => jsonResponse(duplicate);
    await expect(fetchCommunityPosts(fetchDuplicate)).resolves.toEqual({ data: null, source: "unavailable" });
  });

  it("reports unavailable when neither live data nor the static copy can be read", async () => {
    const fetcher: typeof fetch = async () => { throw new Error("offline"); };
    await expect(fetchCommunityPosts(fetcher)).resolves.toEqual({ data: null, source: "unavailable" });
  });
});
