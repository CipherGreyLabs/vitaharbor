export const SITE_NAME = "VitaHarbor";

export const DISCLAIMER = "Unofficial community project. Not affiliated with Sony Interactive Entertainment.";

export const STAGE_ORDER: readonly string[] = [
  "announced",
  "research",
  "early_wip",
  "booting",
  "in_game",
  "playable",
  "completable",
  "released",
  "unknown"
];

export const LIFECYCLE_ORDER: readonly string[] = [
  "active",
  "stalled",
  "abandoned",
  "archived",
  "unknown"
];

export const ACTIVITY_THRESHOLDS = {
  hot: 7,
  active: 30,
  quiet: 90,
  dormant: 180,
  stale: 180
} as const;

export const DEFAULT_SUBREDDITS = ["VitaPiracy", "vitahacks"];

export const REDIS_KEYS = {
  rateLimitRemaining: "reddit:rate-limit:remaining",
  rateLimitReset: "reddit:rate-limit:reset",
  lastIngestionRun: "reddit:last-ingestion-run"
} as const;

export const RAW_CONTENT_TTL_MS = 48 * 60 * 60 * 1000;

export const MAX_REQUESTS_PER_POLL = 60;

export const POLL_INTERVAL_MINUTES = 15;

export const DEFAULT_PAGE_SIZE = 20;

export const ADMIN_ROLES = ["admin", "moderator"] as const;
