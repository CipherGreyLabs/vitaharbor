export interface CommunityPost {
  title: string;
  url: string;
  subreddit: string;
  published_at: string | null;
  verification: "unverified";
}

export interface CommunityPostDocument {
  schema_version: 1;
  items: CommunityPost[];
}

export type CommunityPostsSource = "live" | "snapshot" | "unavailable";

export interface CommunityPostsResult {
  data: CommunityPostDocument | null;
  source: CommunityPostsSource;
}

const LIVE_COMMUNITY_POSTS = "https://raw.githubusercontent.com/CipherGreyLabs/vitaharbor/main/public/data/discovered.json";
const MAX_RESPONSE_BYTES = 256 * 1024;
const MAX_POSTS = 100;
const SUBREDDITS = ["vitahacks", "VitaPiracy", "PSVitaHomebrew"] as const;
const DOCUMENT_KEYS = ["schema_version", "items"];
const POST_KEYS = ["title", "url", "subreddit", "published_at", "verification"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasExactKeys(value: Record<string, unknown>, keys: string[]): boolean {
  return Object.keys(value).length === keys.length && keys.every((key) => Object.hasOwn(value, key));
}

function isTimestamp(value: unknown): value is string {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}

async function readBoundedJson(response: Response): Promise<unknown> {
  const contentLength = response.headers.get("content-length");
  if (contentLength !== null && Number(contentLength) > MAX_RESPONSE_BYTES) {
    throw new Error("Community post response exceeds the size limit");
  }

  const reader = response.body?.getReader();
  if (!reader) {
    const text = await response.text();
    if (new TextEncoder().encode(text).byteLength > MAX_RESPONSE_BYTES) {
      throw new Error("Community post response exceeds the size limit");
    }
    return JSON.parse(text) as unknown;
  }

  const chunks: Uint8Array[] = [];
  let byteLength = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    byteLength += value.byteLength;
    if (byteLength > MAX_RESPONSE_BYTES) {
      await reader.cancel();
      throw new Error("Community post response exceeds the size limit");
    }
    chunks.push(value);
  }

  const bytes = new Uint8Array(byteLength);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes)) as unknown;
}

function allowedSubreddit(value: unknown): string | null {
  if (typeof value !== "string") return null;
  return SUBREDDITS.find((subreddit) => subreddit.toLowerCase() === value.toLowerCase()) || null;
}

function allowedRedditUrl(value: unknown, subreddit: string): value is string {
  if (typeof value !== "string" || value.length > 500) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:"
      && (url.hostname === "www.reddit.com" || url.hostname === "reddit.com")
      && !url.username && !url.password && !url.port && !url.search && !url.hash
      && new RegExp(`^/r/${subreddit}/comments/[A-Za-z0-9]+(?:/[^/]+)?/?$`, "i").test(url.pathname);
  } catch {
    return false;
  }
}

function sanitizePost(value: unknown): CommunityPost | null {
  if (!isRecord(value) || !hasExactKeys(value, POST_KEYS)) return null;
  if (typeof value.title !== "string" || value.title.trim().length === 0 || value.title.length > 1024) return null;
  const subreddit = allowedSubreddit(value.subreddit);
  if (!subreddit || !allowedRedditUrl(value.url, subreddit)) return null;
  if (value.published_at !== null && !isTimestamp(value.published_at)) return null;
  if (value.verification !== "unverified") return null;

  return {
    title: value.title,
    url: value.url,
    subreddit,
    published_at: value.published_at as string | null,
    verification: "unverified"
  };
}

function validateDocument(value: unknown): CommunityPostDocument | null {
  if (!isRecord(value) || !hasExactKeys(value, DOCUMENT_KEYS) || value.schema_version !== 1) return null;
  if (!Array.isArray(value.items) || value.items.length > MAX_POSTS) return null;
  const items = value.items.map(sanitizePost);
  if (items.some((item) => item === null)) return null;
  const posts = items as CommunityPost[];
  if (new Set(posts.map((item) => item.url)).size !== posts.length) return null;
  return { schema_version: 1, items: posts };
}

export async function fetchCommunityPosts(fetcher: typeof fetch = fetch): Promise<CommunityPostsResult> {
  const sources: Array<{ url: string; source: CommunityPostsSource }> = [
    { url: `${LIVE_COMMUNITY_POSTS}?v=${Date.now()}`, source: "live" },
    { url: "/data/discovered.json", source: "snapshot" }
  ];

  for (const candidate of sources) {
    try {
      const response = await fetcher(candidate.url, {
        cache: "no-store",
        headers: { accept: "application/json" }
      });
      if (!response.ok) continue;
      const data = validateDocument(await readBoundedJson(response));
      if (data) return { data, source: candidate.source };
    } catch {
      // If the live projection is unavailable or malformed, try the static copy.
    }
  }

  return { data: null, source: "unavailable" };
}
