import { ACTIVITY_THRESHOLDS, RAW_CONTENT_TTL_MS, DEFAULT_PAGE_SIZE } from "../constants";

export function normalizeSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function normalizeTitle(input: string): string {
  return input.toLowerCase().trim();
}

export function deriveActivityLevel(lastActivityAt: Date): string {
  const hours = (Date.now() - lastActivityAt.getTime()) / (1000 * 60 * 60);
  const days = hours / 24;

  if (days <= ACTIVITY_THRESHOLDS.hot) return 'hot';
  if (days <= ACTIVITY_THRESHOLDS.active) return 'active';
  if (days <= ACTIVITY_THRESHOLDS.quiet) return 'quiet';
  if (days <= ACTIVITY_THRESHOLDS.dormant) return 'dormant';
  return 'stale';
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
}

function plural(value: number, unit: string): string {
  return `${value} ${unit}${value === 1 ? '' : 's'} ago`;
}

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);

  if (Number.isNaN(seconds)) return 'unknown';
  if (seconds < 0) return 'just now';
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return plural(Math.floor(seconds / 60), 'minute');
  if (seconds < 86400) return plural(Math.floor(seconds / 3600), 'hour');
  if (seconds < 604800) return plural(Math.floor(seconds / 86400), 'day');
  if (seconds < 2592000) return plural(Math.floor(seconds / 604800), 'week');
  if (seconds < 31536000) return plural(Math.floor(seconds / 2592000), 'month');
  return plural(Math.floor(seconds / 31536000), 'year');
}

export function generateId(): string {
  return crypto.randomUUID();
}

export function contentHash(text: string): string {
  // Simple hash for content deduplication
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}

export function isWithinRetention(date: Date, ttlMs: number = RAW_CONTENT_TTL_MS): boolean {
  return Date.now() - date.getTime() < ttlMs;
}

export function pageOffset(page: number, pageSize: number = DEFAULT_PAGE_SIZE): number {
  return (page - 1) * pageSize;
}
