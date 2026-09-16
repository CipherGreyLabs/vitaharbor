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

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
  return formatDate(d);
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
