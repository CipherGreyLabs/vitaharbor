export type ScannerFreshnessState = "fresh" | "delayed" | "stale" | "partial" | "failed" | "unknown";
export type ScannerCandidateCategory = "new_project" | "project_update" | "discussion" | "question" | "out_of_scope" | "unknown";
export type ScannerSourceStatus = "available" | "rate_limited" | "unavailable";

export interface ScannerHealthRecord {
  schema_version: 1 | 2;
  attempted_at: string | null;
  state: "complete" | "partial" | "failed" | "unknown";
  successful_sources: number;
  total_sources: number;
  github_action: {
    provider: "github-actions" | "local" | "unknown";
    status: "success" | "pending" | "unknown";
    run_id: string | null;
    event: string | null;
    sha: string | null;
  };
  consecutive_degraded_runs: number;
  recent_runs: Array<{
    attempted_at: string;
    state: "complete" | "partial" | "failed";
    successful_sources: number;
    source_statuses: Record<string, ScannerSourceStatus>;
  }>;
  sources: Array<{
    subreddit: string;
    status: ScannerSourceStatus;
    last_successful_scan_at: string | null;
    consecutive_failures: number;
  }>;
}

export interface ScannerFreshness {
  state: ScannerFreshnessState;
  label: string;
  ageHours: number | null;
}

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

export function scannerFreshness(
  health: ScannerHealthRecord | null | undefined,
  now = Date.now()
): ScannerFreshness {
  if (!health?.attempted_at || health.state === "unknown" || health.total_sources < 1) {
    return { state: "unknown", label: "Scanner health unavailable", ageHours: null };
  }
  const stamp = new Date(health.attempted_at).getTime();
  if (!Number.isFinite(stamp)) return { state: "unknown", label: "Invalid scan time", ageHours: null };
  const rawAgeHours = (now - stamp) / HOUR_MS;
  if (rawAgeHours < 0) return { state: "unknown", label: "Invalid future scan time", ageHours: null };
  const ageHours = rawAgeHours;
  if (health.state === "failed") {
    const repeated = health.consecutive_degraded_runs >= 2 ? ` · ${health.consecutive_degraded_runs} failed/partial runs` : "";
    return { state: "failed", label: ageHours > 26 ? `Stale · last scan failed${repeated}` : `Latest scan failed${repeated}`, ageHours };
  }
  if (health.state === "partial") {
    const freshness = ageHours > 26 ? "stale" : ageHours > 14 ? "delayed" : "recent";
    const repeated = health.consecutive_degraded_runs >= 2 ? ` · ${health.consecutive_degraded_runs} partial/failed runs` : "";
    return {
      state: "partial",
      label: `Partial scan · ${health.successful_sources}/${health.total_sources} sources · ${freshness}${repeated}`,
      ageHours
    };
  }
  if (health.state !== "complete" || health.successful_sources !== health.total_sources) {
    return { state: "unknown", label: "Scanner health unverified", ageHours };
  }
  if (ageHours <= 14) return { state: "fresh", label: "All sources scanned · on schedule", ageHours };
  if (ageHours <= 26) return { state: "delayed", label: "All sources scanned · delayed", ageHours };
  return { state: "stale", label: "All sources scanned · stale", ageHours };
}

export function wasRecentlyUpdated(value: string | Date | null | undefined, now = Date.now(), days = 30): boolean {
  if (!value) return false;
  const stamp = new Date(value).getTime();
  return Number.isFinite(stamp) && now - stamp >= 0 && now - stamp <= days * DAY_MS;
}

type StorageLike = Pick<Storage, "getItem" | "setItem">;

function storageOrNull(storage?: StorageLike | null): StorageLike | null {
  if (storage !== undefined) return storage;
  try {
    return typeof window !== "undefined" ? window.localStorage : null;
  } catch {
    return null;
  }
}

export function readWatchlist(storage?: StorageLike | null): string[] {
  try {
    const raw = storageOrNull(storage)?.getItem("vitaharbor_watchlist");
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === "string") : [];
  } catch {
    return [];
  }
}

export function writeWatchlist(slugs: string[], storage?: StorageLike | null): boolean {
  try {
    const target = storageOrNull(storage);
    if (!target) return false;
    target.setItem("vitaharbor_watchlist", JSON.stringify([...new Set(slugs)]));
    return true;
  } catch {
    return false;
  }
}

export function readLastVisit(storage?: StorageLike | null): number | null {
  try {
    const raw = storageOrNull(storage)?.getItem("vitaharbor_last_visit");
    if (!raw) return null;
    const value = Number(raw);
    return Number.isFinite(value) && value > 0 ? value : null;
  } catch {
    return null;
  }
}

export function writeLastVisit(value = Date.now(), storage?: StorageLike | null): boolean {
  try {
    const target = storageOrNull(storage);
    if (!target) return false;
    target.setItem("vitaharbor_last_visit", String(value));
    return true;
  } catch {
    return false;
  }
}

export function countUpdatesSince(updates: Array<{ event_at?: string | Date | null }>, since: number | null): number {
  if (!since) return 0;
  return updates.filter((update) => {
    const stamp = new Date(update.event_at || 0).getTime();
    return Number.isFinite(stamp) && stamp > since;
  }).length;
}
