import type { ScannerHealthRecord } from "./visitorState";

export type ScannerAssetSource = "live" | "snapshot" | "unavailable";
export type ScannerAssetName = "discovered.json" | "scanner-health.json";

export interface ScannerQueueItem {
  id: string;
  state: "QUARANTINED" | "VERIFIED_FOR_REVIEW";
  title: string;
  url: string | null;
  subreddit: string | null;
  published_at: string | null;
  candidate_type: string;
  public_visibility: "review_queue" | "withheld";
}

export interface ScannerQueueDocument {
  schema_version: 2;
  generated_at: string;
  source: string;
  note: string;
  items: ScannerQueueItem[];
}

export interface ScannerAssetResult<T> {
  data: T | null;
  source: ScannerAssetSource;
}

const LIVE_SCANNER_DATA = "https://raw.githubusercontent.com/CipherGreyLabs/vitaharbor/main/public/data";
const MAX_QUEUE_BYTES = 256 * 1024;
const MAX_HEALTH_BYTES = 8 * 1024;
const MAX_QUEUE_ITEMS = 100;
const SUBREDDITS = ["vitahacks", "VitaPiracy", "PSVitaHomebrew"] as const;
const SOURCE_STATES = ["available", "rate_limited", "unavailable"] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isBoundedString(value: unknown, maxLength: number): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= maxLength;
}

function isTimestamp(value: unknown): value is string {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}

async function readBoundedJson(response: Response, maxBytes: number): Promise<unknown> {
  const contentLength = response.headers.get("content-length");
  if (contentLength !== null && Number(contentLength) > maxBytes) {
    throw new Error("Scanner response exceeds the size limit");
  }

  const reader = response.body?.getReader();
  if (!reader) {
    const text = await response.text();
    if (new TextEncoder().encode(text).byteLength > maxBytes) throw new Error("Scanner response exceeds the size limit");
    return JSON.parse(text) as unknown;
  }

  const chunks: Uint8Array[] = [];
  let byteLength = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    byteLength += value.byteLength;
    if (byteLength > maxBytes) {
      await reader.cancel();
      throw new Error("Scanner response exceeds the size limit");
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

function sanitizeHealth(value: unknown): ScannerHealthRecord | null {
  if (!isRecord(value) || value.schema_version !== 1) return null;
  const attemptedAt = value.attempted_at;
  if (attemptedAt !== null && !isTimestamp(attemptedAt)) return null;
  if (!Array.isArray(value.sources) || value.sources.length !== SUBREDDITS.length) return null;
  if (typeof value.successful_sources !== "number" || !Number.isInteger(value.successful_sources)) return null;
  if (typeof value.total_sources !== "number" || !Number.isInteger(value.total_sources)) return null;
  if (value.total_sources !== SUBREDDITS.length) return null;

  const byName = new Map<string, { subreddit: string; status: typeof SOURCE_STATES[number] }>();
  for (const candidate of value.sources) {
    if (!isRecord(candidate) || typeof candidate.subreddit !== "string" || typeof candidate.status !== "string") return null;
    const candidateSubreddit = candidate.subreddit;
    const subreddit = SUBREDDITS.find((name) => name.toLowerCase() === candidateSubreddit.toLowerCase());
    const status = SOURCE_STATES.find((sourceStatus) => sourceStatus === candidate.status);
    if (!subreddit || !status) return null;
    if (byName.has(subreddit.toLowerCase())) return null;
    byName.set(subreddit.toLowerCase(), { subreddit, status });
  }

  const sources = SUBREDDITS.map((subreddit) => byName.get(subreddit.toLowerCase()));
  if (sources.some((source) => !source)) return null;
  const safeSources = sources as Array<{ subreddit: string; status: typeof SOURCE_STATES[number] }>;
  const successfulSources = safeSources.filter((source) => source.status === "available").length;
  if (value.successful_sources !== successfulSources) return null;
  if (!(["complete", "partial", "failed", "unknown"] as const).includes(value.state as ScannerHealthRecord["state"])) return null;

  const state = value.state as ScannerHealthRecord["state"];
  const expectedState = successfulSources === SUBREDDITS.length ? "complete" : successfulSources > 0 ? "partial" : "failed";
  if (state !== "unknown" && state !== expectedState) return null;

  return {
    schema_version: 1,
    attempted_at: attemptedAt as string | null,
    state,
    successful_sources: successfulSources,
    total_sources: SUBREDDITS.length,
    sources: safeSources
  };
}

function isAllowedSubreddit(value: unknown): value is string {
  return typeof value === "string" && SUBREDDITS.some((name) => name.toLowerCase() === value.toLowerCase());
}

function isAllowedRedditUrl(value: unknown, subreddit: string | null): value is string {
  if (typeof value !== "string" || !subreddit) return false;
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

function sanitizeQueueItem(value: unknown): ScannerQueueItem | null {
  if (!isRecord(value)) return null;
  if (typeof value.id !== "string" || !/^reddit-[a-z0-9]+$/i.test(value.id)) return null;
  if (value.state !== "QUARANTINED" && value.state !== "VERIFIED_FOR_REVIEW") return null;
  if (!isBoundedString(value.title, 1024) || !isBoundedString(value.candidate_type, 40)) return null;
  if (value.public_visibility !== "review_queue" && value.public_visibility !== "withheld") return null;

  const subreddit = value.subreddit === null ? null : isAllowedSubreddit(value.subreddit) ? value.subreddit : null;
  if (value.subreddit !== null && subreddit === null) return null;
  const url = value.url === null ? null : isAllowedRedditUrl(value.url, subreddit) ? value.url : null;
  if (value.url !== null && url === null) return null;
  if (value.published_at !== null && !isTimestamp(value.published_at)) return null;

  if (value.public_visibility === "withheld"
    && (value.title !== "Source candidate withheld pending manual review" || subreddit !== null || url !== null)) return null;

  return {
    id: value.id as string,
    state: value.state,
    title: value.title,
    url,
    subreddit,
    published_at: value.published_at as string | null,
    candidate_type: value.candidate_type,
    public_visibility: value.public_visibility
  };
}

function sanitizeQueue(value: unknown): ScannerQueueDocument | null {
  if (!isRecord(value) || value.schema_version !== 2 || !isTimestamp(value.generated_at)) return null;
  if (!isBoundedString(value.source, 200) || !isBoundedString(value.note, 300)) return null;
  if (!Array.isArray(value.items) || value.items.length > MAX_QUEUE_ITEMS) return null;

  const items = value.items.map(sanitizeQueueItem);
  if (items.some((item) => item === null)) return null;
  const safeItems = items as ScannerQueueItem[];
  if (new Set(safeItems.map((item) => item.id)).size !== safeItems.length) return null;

  return {
    schema_version: 2,
    generated_at: value.generated_at,
    source: value.source,
    note: value.note,
    items: safeItems
  };
}

function validateAsset(name: ScannerAssetName, value: unknown): unknown | null {
  return name === "scanner-health.json" ? sanitizeHealth(value) : sanitizeQueue(value);
}

export async function fetchScannerAsset<T>(
  name: ScannerAssetName,
  fetcher: typeof fetch = fetch
): Promise<ScannerAssetResult<T>> {
  const maxBytes = name === "scanner-health.json" ? MAX_HEALTH_BYTES : MAX_QUEUE_BYTES;
  const sources: Array<{ url: string; source: ScannerAssetSource }> = [
    { url: `${LIVE_SCANNER_DATA}/${name}?v=${Date.now()}`, source: "live" },
    { url: `/data/${name}`, source: "snapshot" }
  ];

  for (const candidate of sources) {
    try {
      const response = await fetcher(candidate.url, {
        cache: "no-store",
        headers: { accept: "application/json" }
      });
      if (!response.ok) continue;
      const data = validateAsset(name, await readBoundedJson(response, maxBytes));
      if (data !== null) return { data: data as T, source: candidate.source };
    } catch {
      // Try the deployed snapshot if GitHub is unavailable or its schema is invalid.
    }
  }

  return { data: null, source: "unavailable" };
}
