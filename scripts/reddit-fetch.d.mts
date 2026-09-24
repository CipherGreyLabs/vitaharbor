export const MAX_RETRY_AFTER_SECONDS: number;

export type RedditFeedResult =
  | { status: "available"; response: Response; httpStatus: number; retryAfterSeconds: null }
  | { status: "rate_limited"; response: null; httpStatus: 429; retryAfterSeconds: number | null }
  | { status: "unavailable"; response: null; httpStatus: number | null; retryAfterSeconds: null };

export function parseRetryAfterSeconds(value: string | null | undefined, nowMs?: number): number | null;

export function fetchRedditFeed(
  url: string,
  options?: {
    userAgent?: string;
    fetchImpl?: typeof fetch;
    sleep?: (milliseconds: number) => Promise<unknown>;
    now?: () => number;
    retryDelayMs?: number;
  }
): Promise<RedditFeedResult>;
