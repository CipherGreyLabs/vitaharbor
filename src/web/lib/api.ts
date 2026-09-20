/**
 * Public read client.
 *
 * Prefers the live `/api/*` endpoints (Cloudflare Worker + D1 in production,
 * `wrangler dev` locally) and transparently degrades to the bundled static
 * dataset when those endpoints are absent, empty or unreachable — which is the
 * case for the Vercel static build and for a plain `vite dev` session.
 */
import { resolveStaticApi } from "@/shared/data/staticApi";

const FALLBACK_TIMEOUT_MS = 3500;

async function fetchLive<T>(path: string): Promise<T | null> {
  if (typeof fetch !== "function") return null;

  const controller = typeof AbortController === "function" ? new AbortController() : null;
  const timer = controller
    ? setTimeout(() => controller.abort(), FALLBACK_TIMEOUT_MS)
    : null;

  try {
    const res = await fetch(path, {
      headers: { accept: "application/json" },
      cache: "no-store",
      signal: controller ? controller.signal : undefined
    });
    if (!res.ok) return null;
    const text = await res.text();
    // A static host answers unknown routes with index.html; never parse that.
    if (!text || text.trimStart().startsWith("<")) return null;
    return JSON.parse(text) as T;
  } catch {
    return null;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

function hasRows(value: unknown, key: string): boolean {
  if (!value || typeof value !== "object") return false;
  const rows = (value as Record<string, unknown>)[key];
  return Array.isArray(rows) && rows.length > 0;
}

/**
 * GET a public API path. The bundled dataset is only used when the live call
 * yields nothing usable, so real ingested data always wins.
 */
export async function apiGet<T>(path: string, rowsKey?: string): Promise<T> {
  const live = await fetchLive<T>(path);
  if (live) {
    if (!rowsKey || hasRows(live, rowsKey)) return live;
  }

  const local = resolveStaticApi(path) as T | null;
  if (local) return local;

  if (live) return live;
  throw new Error(`No data available for ${path}`);
}
