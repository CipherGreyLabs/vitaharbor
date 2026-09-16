/**
 * Static, dependency-free resolver for the public read API.
 *
 * The Cloudflare Worker answers these routes from D1 when a database binding is
 * present and from `fallbackData` when it is not. Vercel has no D1 binding at
 * all, so the browser build uses this module to serve the exact same payload
 * shapes. Every consumer therefore renders a populated ledger everywhere, and
 * a live Worker (when one is reachable) simply takes precedence.
 */
import {
  FALLBACK_PROJECTS,
  FALLBACK_DEVELOPERS,
  FALLBACK_UPDATES,
  FALLBACK_GAMES
} from "../constants/fallbackData";

export interface StaticStats {
  total_projects: number;
  active_projects: number;
  playable_or_better: number;
  released_projects: number;
  total_developers: number;
  recent_updates_count: number;
}

const PLAYABLE_OR_BETTER = ["playable", "completable", "released"];

export function staticStats(): StaticStats {
  return {
    total_projects: FALLBACK_PROJECTS.length,
    active_projects: FALLBACK_PROJECTS.filter((p) => p.lifecycle === "active").length,
    playable_or_better: FALLBACK_PROJECTS.filter((p) =>
      PLAYABLE_OR_BETTER.includes(p.current_stage)
    ).length,
    released_projects: FALLBACK_PROJECTS.filter((p) => p.current_stage === "released").length,
    total_developers: FALLBACK_DEVELOPERS.length,
    recent_updates_count: FALLBACK_UPDATES.length
  };
}

function matchesSearch(project: any, search: string): boolean {
  return Boolean(
    project.display_name?.toLowerCase().includes(search) ||
      project.game_title?.toLowerCase().includes(search) ||
      project.slug?.toLowerCase().includes(search) ||
      project.summary?.toLowerCase().includes(search) ||
      project.technologies?.some((t: string) => t.toLowerCase().includes(search)) ||
      project.developers?.some((d: any) => d.display_name?.toLowerCase().includes(search))
  );
}

export function staticProjects(params: URLSearchParams) {
  const stage = params.get("stage");
  const lifecycle = params.get("lifecycle");
  const search = params.get("search")?.toLowerCase().trim();
  const featured = params.get("featured");
  const limit = Math.min(Number(params.get("limit") || 20), 100);
  const offset = Number(params.get("offset") || 0);

  let list = [...FALLBACK_PROJECTS];
  if (stage) list = list.filter((p) => p.current_stage === stage);
  if (lifecycle) list = list.filter((p) => p.lifecycle === lifecycle);
  if (featured !== null) list = list.filter((p) => p.is_featured === (featured === "true"));
  if (search) list = list.filter((p) => matchesSearch(p, search));

  return {
    projects: list.slice(offset, offset + limit),
    limit,
    offset,
    total: list.length
  };
}

export function staticUpdates(params: URLSearchParams) {
  const limit = Math.min(Number(params.get("limit") || 20), 100);
  const offset = Number(params.get("offset") || 0);
  const projectSlug = params.get("project");

  let list = [...FALLBACK_UPDATES];
  if (projectSlug) list = list.filter((u) => u.project_slug === projectSlug);

  list.sort((a, b) => new Date(b.event_at).getTime() - new Date(a.event_at).getTime());

  return { updates: list.slice(offset, offset + limit), limit, offset, total: list.length };
}

export function staticDevelopers(params: URLSearchParams) {
  const limit = Math.min(Number(params.get("limit") || 50), 100);
  const offset = Number(params.get("offset") || 0);
  return {
    developers: FALLBACK_DEVELOPERS.slice(offset, offset + limit),
    limit,
    offset,
    total: FALLBACK_DEVELOPERS.length
  };
}

export function staticProjectDetail(slug: string) {
  const project = FALLBACK_PROJECTS.find((p) => p.slug === slug);
  if (!project) return null;
  const updates = FALLBACK_UPDATES.filter(
    (u) => u.project_slug === slug || u.port_project_id === project.id
  ).sort((a, b) => new Date(b.event_at).getTime() - new Date(a.event_at).getTime());
  return { project: { ...project, updates } };
}

export function staticDeveloperDetail(slug: string) {
  const developer = FALLBACK_DEVELOPERS.find((d) => d.slug === slug);
  if (!developer) return null;
  return { developer };
}

export function staticGameDetail(slug: string) {
  const game = FALLBACK_GAMES.find((g) => g.slug === slug || g.normalized_title.replace(/[^a-z0-9]+/g, "-") === slug);
  if (!game) return null;
  return { game: { ...game, projects: FALLBACK_PROJECTS.filter((p) => p.game_id === game.id) } };
}

/**
 * Resolve an `/api/...` path against the bundled dataset.
 * Returns `null` when the path is not a known public read route.
 */
export function resolveStaticApi(pathWithQuery: string): unknown | null {
  const [rawPath, rawQuery = ""] = pathWithQuery.split("?");
  const path = rawPath.replace(/\/+$/, "") || "/api";
  const params = new URLSearchParams(rawQuery);

  if (path === "/api/stats") return staticStats();
  if (path === "/api/projects") return staticProjects(params);
  if (path === "/api/updates") return staticUpdates(params);
  if (path === "/api/developers") return staticDevelopers(params);

  const projectMatch = path.match(/^\/api\/projects\/(.+)$/);
  if (projectMatch) return staticProjectDetail(decodeURIComponent(projectMatch[1]));

  const devMatch = path.match(/^\/api\/developers\/(.+)$/);
  if (devMatch) return staticDeveloperDetail(decodeURIComponent(devMatch[1]));

  const gameMatch = path.match(/^\/api\/games\/(.+)$/);
  if (gameMatch) return staticGameDetail(decodeURIComponent(gameMatch[1]));

  return null;
}
