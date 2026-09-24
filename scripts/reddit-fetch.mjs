// Shared bounded fetch policy for regular and historical Reddit RSS reads.
// A 429 is treated as a server-directed defer, never an immediate retry.
export const MAX_RETRY_AFTER_SECONDS = 6 * 60 * 60;
const TRANSIENT_STATUS = (status) => status === 408 || (status >= 500 && status <= 599);

export function parseRetryAfterSeconds(value, nowMs = Date.now()) {
  if (value == null) return null;
  const text = String(value).trim();
  if (!text) return null;

  let seconds;
  if (/^\d+$/.test(text)) {
    seconds = Number(text);
  } else {
    const dateMs = Date.parse(text);
    if (!Number.isFinite(dateMs)) return null;
    seconds = (dateMs - nowMs) / 1000;
  }
  if (!Number.isFinite(seconds)) return null;
  return Math.min(MAX_RETRY_AFTER_SECONDS, Math.max(0, Math.ceil(seconds)));
}

export async function fetchRedditFeed(url, {
  userAgent,
  fetchImpl = globalThis.fetch,
  sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds)),
  now = () => Date.now(),
  retryDelayMs = 1200
} = {}) {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    let response;
    try {
      response = await fetchImpl(url, { headers: { "User-Agent": userAgent } });
    } catch {
      if (attempt === 0) {
        await sleep(retryDelayMs);
        continue;
      }
      return { status: "unavailable", response: null, httpStatus: null, retryAfterSeconds: null };
    }

    if (response.status === 429) {
      return {
        status: "rate_limited",
        response: null,
        httpStatus: 429,
        retryAfterSeconds: parseRetryAfterSeconds(response.headers?.get("retry-after"), now())
      };
    }
    if (response.ok) return { status: "available", response, httpStatus: response.status, retryAfterSeconds: null };

    if (TRANSIENT_STATUS(response.status) && attempt === 0) {
      await sleep(retryDelayMs);
      continue;
    }
    return { status: "unavailable", response: null, httpStatus: response.status, retryAfterSeconds: null };
  }

  return { status: "unavailable", response: null, httpStatus: null, retryAfterSeconds: null };
}
