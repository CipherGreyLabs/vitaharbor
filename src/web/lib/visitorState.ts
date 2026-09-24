export type ScannerFreshnessState = "fresh" | "delayed" | "stale" | "unknown";

export interface ScannerFreshness {
  state: ScannerFreshnessState;
  label: string;
  ageHours: number | null;
}

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

export function scannerFreshness(generatedAt: string | Date | null | undefined, now = Date.now()): ScannerFreshness {
  if (!generatedAt) return { state: "unknown", label: "No scan recorded", ageHours: null };
  const stamp = new Date(generatedAt).getTime();
  if (!Number.isFinite(stamp)) return { state: "unknown", label: "Invalid scan time", ageHours: null };
  const ageHours = Math.max(0, (now - stamp) / HOUR_MS);
  if (ageHours <= 14) return { state: "fresh", label: "On schedule", ageHours };
  if (ageHours <= 26) return { state: "delayed", label: "Scan delayed", ageHours };
  return { state: "stale", label: "Scan stale", ageHours };
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
