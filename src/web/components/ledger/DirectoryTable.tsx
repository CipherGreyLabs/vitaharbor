import { GRADUATED_PROJECTS, type GraduatedProject } from "../../../shared/constants/graduatedData";
import mediaManifest from "../../../../data/media-manifest.json";
import { GameCardBanner } from "../projects/GameCardBanner";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ProjectPanel } from "./ProjectPanel";
import {
  type LedgerProject,
  splitTitle,
  prettyStage,
  deriveProjectType,
  PROJECT_TYPE_META,
  STAGE_CHIP,
  TECH_FILTERS,
  formatDay,
  formatUtcDateTime
} from "./types";
import { Search, ExternalLink, X, ChevronRight, Link2, Check, Filter, Camera, LayoutGrid, List, MonitorPlay } from "lucide-react";
import { ProjectMark } from "../projects/ProjectMark";

const STAGE_FILTERS = [
  { key: "all", label: "All ports" },
  { key: "wip", label: "In development" },
  { key: "playable", label: "Playable" },
  { key: "booting", label: "Early boot" },
  { key: "released", label: "Released" },
  { key: "recent", label: "Recently updated" },
  { key: "graduated", label: "Graduated to VitaDB" }
];

const CATEGORY_FILTERS = [
  { key: "all", label: "All types" },
  ...Object.entries(PROJECT_TYPE_META).map(([key, value]) => ({ key, label: value.label }))
];

const SORTS = [
  { key: "recent", label: "Recently active" },
  { key: "progress", label: "Furthest along" },
  { key: "name", label: "A – Z" }
];

interface LatestSignal {
  id: string | number;
  title: string;
  event_at: string | Date;
  project_display_name?: string | null;
  project_slug?: string | null;
  sources?: Array<{ canonical_url?: string | null }>;
}

interface DirectoryTableProps {
  projects: LedgerProject[];
  visible: LedgerProject[];
  loading: boolean;
  activeFilter: string;
  onFilterChange: (f: string) => void;
  activeCategory: string;
  onCategoryChange: (c: string) => void;
  activeTech: string;
  onTechChange: (t: string) => void;
  activeSort: string;
  onSortChange: (s: string) => void;
  searchTerm: string;
  onSearchChange: (q: string) => void;
  onResetFilters: () => void;
  searchRef: React.RefObject<HTMLInputElement | null>;
  selectedId: number | null;
  expandedId: number | null;
  onToggleEntry: (project: LedgerProject) => void;
  onSelectProject: (project: LedgerProject, scroll?: boolean) => void;
  onCopyLink: (project: LedgerProject) => void;
  copiedSlug: string;
  directoryRef: React.RefObject<HTMLElement | null>;
  latestSignal?: LatestSignal;
}

const manifestBySlug = new Map<string, any>(((mediaManifest as any)?.items || []).map((item: any) => [item.slug, item]));

export const DirectoryTable: React.FC<DirectoryTableProps> = ({
  projects,
  visible,
  loading,
  activeFilter,
  onFilterChange,
  activeCategory,
  onCategoryChange,
  activeTech,
  onTechChange,
  activeSort,
  onSortChange,
  searchTerm,
  onSearchChange,
  onResetFilters,
  searchRef,
  selectedId,
  expandedId,
  onToggleEntry,
  onSelectProject,
  onCopyLink,
  copiedSlug,
  directoryRef,
  latestSignal
}) => {
  const stageCounts = useMemo(() => {
    const counts: Record<string, number> = { all: projects.length, wip: 0, playable: 0, booting: 0, released: 0, recent: 0, graduated: GRADUATED_PROJECTS.length };
    for (const p of projects) {
      const st = String(p.current_stage);
      if (["in_game", "booting", "early_wip", "research"].includes(st)) counts.wip++;
      if (["playable", "released", "completable"].includes(st)) counts.playable++;
      if (["booting", "early_wip", "research"].includes(st)) counts.booting++;
      if (st === "released") counts.released++;
      const activity = new Date(p.last_activity_at || 0).getTime();
      if (Number.isFinite(activity) && Date.now() - activity >= 0 && Date.now() - activity <= 30 * 24 * 60 * 60 * 1000) counts.recent++;
    }
    return counts;
  }, [projects]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: projects.length };
    for (const key of Object.keys(PROJECT_TYPE_META)) counts[key] = 0;
    for (const p of projects) {
      const cat = deriveProjectType(p);
      if (cat && cat in counts) counts[cat]++;
    }
    return counts;
  }, [projects]);

  const techCounts = useMemo(() => {
    const counts: Record<string, number> = { all: projects.length };
    for (const tf of TECH_FILTERS) {
      if (tf.key === "all") continue;
      counts[tf.key] = projects.filter(p => tf.match ? tf.match(p) : true).length;
    }
    return counts;
  }, [projects]);

  const [viewMode, setViewMode] = useState<"bento" | "list">("bento");
  const visibleGraduated = useMemo(() => {
    if (activeFilter !== "graduated") return [];
    const term = searchTerm.trim().toLowerCase();
    if (!term) return GRADUATED_PROJECTS;
    return GRADUATED_PROJECTS.filter(
      (p) =>
        p.title.toLowerCase().includes(term) ||
        p.developer.toLowerCase().includes(term) ||
        p.original_platform.toLowerCase().includes(term) ||
        p.technologies.some((t) => t.toLowerCase().includes(term)) ||
        p.summary.toLowerCase().includes(term)
    );
  }, [activeFilter, searchTerm]);

  const openProject = projects.find((project) => project.id === expandedId) || null;
  const drawerOpen = openProject !== null;
  const drawerRef = useRef<HTMLElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const closeDrawerRef = useRef<() => void>(() => undefined);
  closeDrawerRef.current = () => {
    if (openProject) onToggleEntry(openProject);
  };

  useEffect(() => {
    if (!drawerOpen) return;

    const active = document.activeElement;
    returnFocusRef.current = active instanceof HTMLElement ? active : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusFrame = window.requestAnimationFrame(() => closeButtonRef.current?.focus());

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeDrawerRef.current();
        return;
      }
      if (event.key !== "Tab") return;

      const drawer = drawerRef.current;
      if (!drawer) return;
      const focusable = Array.from(drawer.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      ));
      if (focusable.length === 0) {
        event.preventDefault();
        drawer.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && (document.activeElement === first || !drawer.contains(document.activeElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !drawer.contains(document.activeElement))) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      const returnFocus = returnFocusRef.current;
      if (returnFocus?.isConnected) window.requestAnimationFrame(() => returnFocus.focus());
    };
  }, [drawerOpen]);

  return (
    <section
      id="directory"
      ref={directoryRef}
      aria-labelledby="directory-heading"
      className="mx-auto mt-7 max-w-7xl px-4 sm:px-6"
    >
      <div>
        <h2 id="directory-heading" className="text-title font-semibold text-ink">
          Directory
        </h2>
        <p aria-live="polite" aria-atomic="true" className="mt-1.5 text-body text-ink-medium">
          {loading
            ? "Loading indexed projects…"
            : visible.length === projects.length
              ? projects.length + " Active Projects · Source repos & hardware builds"
              : "Showing " + visible.length + " of " + projects.length + " active projects"}
        </p>
      </div>

      {(searchTerm || activeFilter !== "all" || activeCategory !== "all" || activeSort !== "recent") && (
        <div className="mt-4 flex flex-wrap items-center gap-2" aria-label="Active directory filters">
          <span className="inline-flex items-center gap-1 text-micro font-semibold uppercase tracking-wider text-ink-muted">
            <Filter className="h-3 w-3" />
            Active filters
          </span>
          {searchTerm && <span className="rounded-full bg-sunken px-2.5 py-1 text-micro text-ink-medium">“{searchTerm}”</span>}
          {activeFilter !== "all" && <span className="rounded-full bg-sunken px-2.5 py-1 text-micro text-ink-medium">{STAGE_FILTERS.find((item) => item.key === activeFilter)?.label}</span>}
          {activeCategory !== "all" && <span className="rounded-full bg-sunken px-2.5 py-1 text-micro text-ink-medium">{CATEGORY_FILTERS.find((item) => item.key === activeCategory)?.label}</span>}
          {activeTech !== "all" && <span className="rounded-full bg-sunken px-2.5 py-1 text-micro text-ink-medium">{TECH_FILTERS.find((item) => item.key === activeTech)?.label}</span>}
          {activeSort !== "recent" && <span className="rounded-full bg-sunken px-2.5 py-1 text-micro text-ink-medium">{SORTS.find((item) => item.key === activeSort)?.label}</span>}
          <button type="button" onClick={onResetFilters} className="inline-flex min-h-[44px] items-center gap-1 rounded-full px-3 py-1 text-caption font-semibold text-accent underline underline-offset-4 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent">
            Clear all
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      {/* Controls stay pinned while the list scrolls, so search is always in reach. */}
      <div className="sticky top-14 z-30 -mx-4 mt-5 border-b border-hairline bg-canvas/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="relative w-full">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
          <input
            ref={searchRef}
            type="text"
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
            aria-label="Filter the directory"
            placeholder="Search games, engines, developers or platform"
            className="min-h-[48px] w-full rounded-xl border border-hairline-strong bg-surface py-3 pl-10 pr-10 text-body text-ink placeholder:text-ink-muted outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          />
          {searchTerm ? (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              aria-label="Clear search"
              className="absolute right-1 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-sunken hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : (
            <div className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 items-center sm:flex">
              <kbd className="inline-flex items-center rounded border border-white/20 bg-zinc-800 px-1.5 py-0.5 text-[10px] font-mono text-zinc-400" aria-hidden="true">/</kbd>
            </div>
          )}
        </div>

        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="no-scrollbar flex max-w-full items-center gap-1.5 overflow-x-auto py-0.5 -mx-1 px-1">
            {STAGE_FILTERS.map((filter) => (
              <div key={filter.key} className="relative group shrink-0"><button type="button" aria-pressed={activeFilter === filter.key} onClick={() => onFilterChange(filter.key)} className={"relative z-10 inline-flex min-h-[44px] items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-caption font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent " + (activeFilter === filter.key ? "text-ink" : "text-ink-muted hover:text-ink")}><span>{filter.label}</span><span className="font-mono text-micro opacity-70">({stageCounts[filter.key] ?? 0})</span></button>{activeFilter === filter.key && (<div className="filter-active-bg transition-all duration-200"></div>)}</div>
            ))}
          </div>

          <div className="flex items-center gap-2.5">
            {/* View Mode Switcher */}
            <div className="inline-flex items-center rounded-lg border border-white/10 bg-surface p-0.5">
              <button
                type="button"
                onClick={() => setViewMode("bento")}
                aria-pressed={viewMode === "bento"}
                title="Bento Grid View"
                className={
                  "inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-caption font-medium transition-colors " +
                  (viewMode === "bento" ? "bg-[#2563eb] text-white font-semibold" : "text-ink-muted hover:text-ink")
                }
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Grid</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                aria-pressed={viewMode === "list"}
                title="Compact List View"
                className={
                  "inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-caption font-medium transition-colors " +
                  (viewMode === "list" ? "bg-[#2563eb] text-white font-semibold" : "text-ink-muted hover:text-ink")
                }
              >
                <List className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">List</span>
              </button>
            </div>

            <label className="flex items-center gap-2 text-caption text-ink-muted">
              <span className="hidden sm:inline">Sort</span>
            <select
              value={activeSort}
              onChange={(event) => onSortChange(event.target.value)}
            className="min-h-[44px] cursor-pointer rounded-lg border border-hairline-strong bg-surface px-3 py-2 text-caption font-medium text-ink outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              {SORTS.map((sort) => (
                <option key={sort.key} value={sort.key}>
                  {sort.label}
                </option>
              ))}
            </select>
          </label>
          </div>
        </div>

        {/* Type is the secondary axis, so it reads quieter than the stage filters. */}
        <div className="mt-2.5 flex items-center gap-1 overflow-x-auto no-scrollbar">
          <span className="mr-1 shrink-0 font-mono text-[10px] uppercase tracking-wider text-ink-muted">Type</span>
          {CATEGORY_FILTERS.map((cat) => {
            const active = activeCategory === cat.key;
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => onCategoryChange(cat.key)}
                aria-pressed={active}
                className={
                  "inline-flex min-h-[40px] shrink-0 items-center whitespace-nowrap rounded-lg px-2.5 py-1.5 text-caption font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent " +
                  (active ? "bg-accent/10 text-ink font-semibold" : "text-ink-muted hover:bg-sunken hover:text-ink")
                }
              >
                {cat.label} ({categoryCounts[cat.key] ?? 0})
              </button>
            );
          })}
        </div>

        </div>

      {latestSignal && (
        <section aria-label="Latest signal" className="mt-4 grid gap-2 rounded-xl border border-hairline border-l-[3px] border-l-accent bg-surface px-4 py-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-5 sm:px-5">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <p className="text-micro font-bold uppercase tracking-[0.15em] text-accent">Latest signal</p>
              <time
                className="text-caption text-ink-muted"
                dateTime={Number.isNaN(new Date(latestSignal.event_at).getTime()) ? undefined : new Date(latestSignal.event_at).toISOString()}
              >
                {formatUtcDateTime(latestSignal.event_at)}
              </time>
              {latestSignal.project_slug ? (
                <a href={`/projects/${latestSignal.project_slug}/`} className="inline-flex min-h-[44px] items-center text-caption font-semibold text-accent hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent">
                  {latestSignal.project_display_name || "Project record"}
                </a>
              ) : latestSignal.project_display_name ? (
                <span className="text-caption font-semibold text-ink-medium">{latestSignal.project_display_name}</span>
              ) : null}
            </div>
            <p className="mt-1 line-clamp-2 text-body font-medium leading-snug text-ink">{latestSignal.title}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            {latestSignal.sources?.[0]?.canonical_url && (
              <a
                href={latestSignal.sources[0].canonical_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[44px] items-center rounded-lg px-3 text-caption font-semibold text-ink-medium hover:bg-sunken hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
              >
                Open source <ExternalLink className="ml-1.5 h-3.5 w-3.5" aria-hidden="true" />
              </a>
            )}
            <a href="/updates/" className="inline-flex min-h-[44px] items-center rounded-lg border border-hairline px-3 text-caption font-semibold text-accent hover:bg-accent/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent">
              All updates
            </a>
          </div>
        </section>
      )}

      <div className="mt-4">
        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2, 3, 4, 5, 6, 7].map((row) => (
              <div key={row} className="rounded-2xl border border-hairline bg-surface p-5">
                <div className="vh-skeleton h-3 w-40 rounded-full bg-sunken" />
                <div className="vh-skeleton mt-4 h-3 w-20 rounded-full bg-sunken" />
                <div className="vh-skeleton mt-5 h-3 w-full rounded-full bg-sunken" />
                <div className="vh-skeleton mt-2 h-3 w-4/5 rounded-full bg-sunken" />
              </div>
            ))}
          </div>
        ) : visible.length === 0 && activeFilter !== "graduated" ? (
          <div className="px-6 py-16 text-center">
            <p className="text-body text-ink-medium">Nothing matches that search.</p>
            <button
              type="button"
              onClick={onResetFilters}
              className="mt-3 inline-flex min-h-[44px] items-center text-body font-semibold text-accent underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
            >
              Reset filters
            </button>
          </div>
        ) : activeFilter === "graduated" ? (
          <div>
            <div className="mb-4 rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-4 text-emerald-300">
              <div className="flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
                <Check className="h-4 w-4 text-emerald-400" />
                <span>Graduated to VitaDB</span>
              </div>
              <p className="mt-1 text-caption text-zinc-300">
                These ports have successfully reached full public release and are officially available directly on VitaDB / Vita Homebrew Browser.
              </p>
            </div>

            {visibleGraduated.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <p className="text-body text-ink-medium">No graduated projects match that search.</p>
                <button
                  type="button"
                  onClick={onResetFilters}
                  className="mt-3 inline-flex min-h-[44px] items-center text-body font-semibold text-accent underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
                >
                  Reset filters
                </button>
              </div>
            ) : viewMode === "bento" ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {visibleGraduated.map((project) => (
                  <div
                    key={project.slug}
                    id={"graduated-" + project.slug}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/80 p-5 transition-all hover:border-emerald-500/40 hover:bg-zinc-900/60"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="rounded-md border border-emerald-500/30 bg-emerald-950/60 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase text-emerald-400">
                          Released on VitaDB
                        </span>
                        <span className="font-mono text-micro uppercase text-ink-muted">VitaDB #{project.vitadb_id}</span>
                      </div>

                      <div className="flex items-start gap-3 mb-2">
                        <ProjectMark seed={project.title} size={42} className="shrink-0 rounded-xl" />
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate text-subtitle font-semibold text-white group-hover:text-emerald-300 transition-colors">{project.title}</h3>
                          <p className="font-mono text-micro text-ink-muted uppercase">{project.original_platform} · by {project.developer}</p>
                        </div>
                      </div>

                      <p className="text-caption text-ink-medium leading-relaxed mb-3 line-clamp-3">
                        {project.summary}
                      </p>

                      <div className="flex flex-wrap gap-1 mb-4">
                        {project.technologies.map((tech) => (
                          <span key={tech} className="vh-tech-badge">[{tech}]</span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 border-t border-white/[0.06] pt-3 mt-auto">
                      <span className="text-micro text-ink-muted font-mono">{project.released_year || "Released"}</span>
                      <a
                        href={project.vitadb_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-[34px] items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-950/40 px-3 py-1 font-mono text-micro font-semibold text-emerald-300 hover:bg-emerald-900/50 hover:border-emerald-400 transition-colors"
                      >
                        <span>View on VitaDB</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-[#334155] bg-black">
                <div className="hidden grid-cols-[minmax(0,1.8fr)_minmax(8.5rem,0.9fr)_minmax(6rem,0.65fr)_7rem_auto] items-center gap-3 border-b border-hairline bg-white/[0.025] px-4 py-2 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-muted lg:grid">
                  <span>Project</span><span>Developer</span><span>Platform</span><span>Status</span><span>VitaDB Link</span>
                </div>
                <ul className="divide-y divide-white/[0.055]">
                  {visibleGraduated.map((project) => (
                    <li key={project.slug} className="grid grid-cols-[minmax(0,1fr)_auto] items-center px-4 py-3 hover:bg-zinc-950 lg:grid-cols-[minmax(0,1.8fr)_minmax(8.5rem,0.9fr)_minmax(6rem,0.65fr)_7rem_auto] gap-3">
                      <div className="min-w-0">
                        <span className="truncate text-body font-semibold text-white">{project.title}</span>
                        <span className="block text-caption text-zinc-400 line-clamp-1">{project.summary}</span>
                      </div>
                      <span className="hidden font-mono text-caption text-zinc-300 lg:block">{project.developer}</span>
                      <span className="hidden font-mono text-micro uppercase text-zinc-400 lg:block">{project.original_platform}</span>
                      <span className="hidden lg:block">
                        <span className="rounded px-2 py-0.5 font-mono text-[10px] font-semibold uppercase bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                          Released
                        </span>
                      </span>
                      <a
                        href={project.vitadb_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-[34px] items-center gap-1 text-caption font-semibold text-emerald-400 hover:underline"
                      >
                        <span>VitaDB</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : viewMode === "bento" ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((project) => {
              const title = splitTitle(project.game_title || project.display_name);
              const selected = selectedId === project.id;
              const projectType = PROJECT_TYPE_META[deriveProjectType(project)].shortLabel;
              const seenAt = project.first_seen_at ? new Date(project.first_seen_at).getTime() : 0;
              const isNew = seenAt > 0 && Date.now() - seenAt < 7 * 24 * 60 * 60 * 1000;

              return (
                <div
                  key={project.id}
                  id={"card-" + project.slug}
                  
                  
                  className={
                    "group relative flex flex-col justify-between overflow-hidden rounded-2xl border transition-all duration-200 " +
                    (selected
                      ? "border-blue-500/80 bg-zinc-900/90 shadow-[0_0_24px_rgba(59,130,246,0.18)]"
                      : "border-white/10 bg-zinc-950/80 hover:border-white/20 hover:bg-zinc-900/60")
                  }
                >
                  {/* Card Media Banner */}
                  {(() => {
                    const manifestItem = manifestBySlug.get(project.slug);
                    const mediaUrl = project.screenshot_url || manifestItem?.media_local_path;
                    const mediaLabel = manifestItem?.media_label || (manifestItem?.is_vita_gameplay ? 'Vita Capture' : 'Official Art');
                    return (
                      <div className="relative aspect-[16/9] w-full overflow-hidden bg-black/60 border-b border-white/[0.06]">
                        {mediaUrl ? (
                          <img
                            src={mediaUrl}
                            alt={project.screenshot_alt || title.name}
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <GameCardBanner
                            project={project}
                            titleName={title.name}
                            engineLabel={title.engine}
                          />
                        )}
                        
                        {/* Stage Badge & Media Provenance Label on top of image */}
                        <div className="absolute left-3 top-3 flex items-center gap-1.5 flex-wrap">
                          <span className={"rounded-md px-2 py-0.5 font-mono text-[10px] font-semibold uppercase backdrop-blur-md " + (STAGE_CHIP[String(project.current_stage)] || "bg-black/70 text-zinc-300")}>
                            {prettyStage(project.current_stage)}
                          </span>
                          {isNew && <span className="rounded bg-blue-500/20 border border-blue-500/40 px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase text-blue-400">New</span>}
                          {mediaUrl && (
                            <span className="rounded-md bg-black/75 border border-white/15 px-1.5 py-0.5 font-mono text-[9px] font-medium text-zinc-300 backdrop-blur-md">
                              {mediaLabel}
                            </span>
                          )}
                        </div>

                        {/* Show on 3D Vita Quick Trigger */}
                        <button
                          type="button"
                          onClick={() => onSelectProject(project, true)}
                          title="Show on 3D Vita"
                          className="absolute right-3 top-3 inline-flex min-h-[44px] items-center rounded-lg border border-white/20 bg-black/70 px-3 py-1.5 font-mono text-[11px] font-medium text-white opacity-0 backdrop-blur-md transition-all group-hover:opacity-100 hover:bg-black"
                        >
                          Show on Vita
                        </button>
                      </div>
                    );
                  })()}

                  {/* Card Content */}
                  <div className="flex flex-1 flex-col justify-between p-4">
                    <div>
                      <h3 className="text-[16px] font-bold text-white transition-colors group-hover:text-blue-400">
                        {title.name}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-[13px] text-zinc-400 leading-relaxed">
                        {project.summary || "Community PlayStation Vita homebrew port in active development."}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/[0.06]">
                      {/* Tech & Platform Tags */}
                      <div className="flex flex-wrap items-center gap-1.5 mb-3">
                        <span className="font-mono text-[10px] uppercase text-zinc-400 bg-white/[0.04] px-1.5 py-0.5 rounded border border-white/5">{projectType}</span>
                        {project.technologies?.slice(0, 2).map((tech: string) => (
                          <span key={tech} className="rounded bg-white/[0.04] border border-white/5 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400">
                            {tech}
                          </span>
                        ))}
                      </div>

                      {/* Card Footer Actions */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => onToggleEntry(project)}
                            className="inline-flex min-h-[34px] items-center text-caption font-semibold text-blue-400 hover:underline"
                          >
                            View Details
                          </button>
                          {(String(project.current_stage) === "playable" || String(project.current_stage) === "released" || String(project.current_stage) === "completable") && project.repo_url && (
                            <a
                              href={project.repo_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex min-h-[34px] items-center gap-1.5 rounded-md bg-white px-2.5 py-1 text-[11px] font-semibold text-black hover:bg-zinc-200 transition-colors"
                            >
                              <span>Source</span>
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => onCopyLink(project)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
                            title="Copy link"
                          >
                            {copiedSlug === project.slug ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Link2 className="h-3.5 w-3.5" />}
                          </button>
                          {project.reddit_url && (
                            <a
                              href={project.reddit_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
                              title="Source discussion"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
<div className="overflow-hidden rounded-2xl border border-[#334155] bg-black">
            <div className="hidden grid-cols-[minmax(0,1fr)_auto] border-b border-hairline bg-white/[0.025] px-0 py-2 lg:grid">
              <div className="grid grid-cols-[minmax(0,1.8fr)_minmax(8.5rem,0.9fr)_minmax(6rem,0.65fr)_minmax(7rem,0.75fr)_1.5rem] items-center gap-3 px-4 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
                <span>Project</span><span>Current stage</span><span>Type</span><span>Last Activity</span><span aria-hidden="true" />
              </div>
              <span className="w-12 sm:w-[5.5rem]" aria-hidden="true" />
            </div>
            <ul className="divide-y divide-white/[0.055]">
              {visible.map((project) => {
                const title = splitTitle(project.game_title || project.display_name);
                const expanded = expandedId === project.id;
                const selected = selectedId === project.id;
                const seenAt = project.first_seen_at ? new Date(project.first_seen_at).getTime() : 0;
                const isNew = seenAt > 0 && Date.now() - seenAt < 7 * 24 * 60 * 60 * 1000;
                const projectType = PROJECT_TYPE_META[deriveProjectType(project)].shortLabel;

                return (
                  <li
                    key={project.id}
                    id={"entry-" + project.slug}
                    
                    
                    className={"group relative rounded-lg transition-all vh-row-glass " + (selected ? "bg-accent/[0.055] border-l-2 border-l-accent" : "hover:bg-[#0f172a]")}
                  >
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center">
                      <button
                        type="button"
                        aria-expanded={expanded}
                        aria-controls={expanded ? "panel-" + project.slug : undefined}
                        aria-label={`${expanded ? "Close" : "Open"} project details for ${title.name}`}
                        onClick={() => onToggleEntry(project)}
                        className="grid min-h-[76px] min-w-0 grid-cols-[minmax(0,1fr)_auto_1.5rem] items-center gap-3 px-4 py-2.5 text-left transition-colors focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-accent lg:grid-cols-[minmax(0,1.8fr)_minmax(8.5rem,0.9fr)_minmax(6rem,0.65fr)_minmax(7rem,0.75fr)_1.5rem]"
                      >
                        <span className="min-w-0">
                          <span className="flex min-w-0 items-center gap-2">
    
                            <span className="truncate text-body font-semibold text-ink transition-colors group-hover:text-accent-hover">{title.name}</span>
                            {isNew && <span className="shrink-0 rounded border border-accent/25 bg-accent/10 px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider text-accent-hover">New</span>}
                            {project.screenshot_url && <span title="Source screenshot available" className="inline-flex shrink-0"><Camera className="h-3.5 w-3.5 text-ink-muted" aria-hidden="true" /></span>}
                            <span className={"shrink-0 rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase lg:hidden " + (STAGE_CHIP[String(project.current_stage)] || "bg-sunken text-ink-medium")}>
                              {prettyStage(project.current_stage)}
                            </span>
                          </span>
                          <span className="mt-1 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-micro text-ink-muted">
                            <span className="truncate font-mono uppercase tracking-wide">{title.engine || project.original_platform || projectType}</span>
                            {project.technologies && project.technologies.length > 0 && (
                              <span className="hidden gap-1 sm:inline-flex">
                                {project.technologies.slice(0, 2).map((tech: string) => (
                                  <span key={tech} className="vh-tech-badge">[{tech}]</span>
                                ))}
                              </span>
                            )}
                            <span className="lg:hidden">· {formatDay(project.last_activity_at) || "date not recorded"}</span>
                          </span>
                        </span>

                        <span className="hidden min-w-0 items-center gap-1.5 lg:flex">
                          <span className={"inline-flex max-w-full rounded-md px-2 py-1 text-micro font-semibold uppercase " + (STAGE_CHIP[String(project.current_stage)] || "bg-sunken text-ink-medium")}>
                            {prettyStage(project.current_stage)}
                          </span>
                          {project.verification === "detected" && <span className="shrink-0 rounded border border-hairline-strong/30 px-1.5 py-1 font-mono text-[9px] uppercase text-ink-muted">Community Lead</span>}
                        </span>

                        <span className="hidden min-w-0 truncate font-mono text-micro uppercase text-ink-muted lg:block">{projectType}</span>
                        <span className="hidden min-w-0 text-caption text-ink-medium lg:block">{formatDay(project.last_activity_at) || "Not recorded"}</span>
                        <ChevronRight className="h-4 w-4 justify-self-end text-ink-muted transition-transform group-hover:translate-x-0.5 group-hover:text-accent-hover" aria-hidden="true" />
                      </button>

                      <div className="flex w-12 shrink-0 items-center justify-center sm:w-[5.5rem]">
                        <button
                          type="button"
                          onClick={() => onCopyLink(project)}
                          title="Copy a direct link to this entry"
                          aria-label={copiedSlug === project.slug ? "Link copied for " + title.name : "Copy a direct link to " + title.name}
                          className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-sunken hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
                        >
                          {copiedSlug === project.slug ? <Check className="h-4 w-4 text-stage-done" /> : <Link2 className="h-4 w-4" />}
                        </button>
                        {project.reddit_url && (
                          <a
                            href={project.reddit_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Open the source discussion"
                            aria-label={"Open the source discussion for " + title.name}
                            className="hidden h-11 w-11 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-sunken hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent sm:inline-flex"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      {openProject && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[80] flex justify-end">
          <button
            type="button"
            aria-label="Close project details"
            aria-hidden="true"
            tabIndex={-1}
            onClick={() => onToggleEntry(openProject)}
            className="vh-panel-backdrop absolute inset-0 h-full w-full cursor-default bg-black/75 backdrop-blur-[2px]"
          />
          <aside
            ref={drawerRef}
            id="project-details-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby={"panel-title-" + openProject.slug}
            tabIndex={-1}
            className="vh-panel-sheet relative z-10 flex h-full w-full max-w-2xl flex-col overflow-hidden border-l border-white/[0.08] bg-[#0a0a0c] shadow-[-30px_0_100px_rgba(0,0,0,0.7)] outline-none"
          >
            <div className="sticky top-0 z-20 flex min-h-14 shrink-0 items-center justify-between border-b border-white/[0.07] bg-[#0a0a0c]/90 px-4 backdrop-blur-xl sm:px-6">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-accent-hover">Project record</p>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => onToggleEntry(openProject)}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-lg px-3 text-caption font-medium text-ink-medium transition-colors hover:bg-white/[0.06] hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
              >
                <X className="h-4 w-4" aria-hidden="true" />
                Close
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
              <ProjectPanel
                project={openProject}
                onSelectProject={(p) => onSelectProject(p, true)}
                onCopyLink={onCopyLink}
                isCopied={copiedSlug === openProject.slug}
              />
            </div>
          </aside>
        </div>,
        document.body
      )}
    </section>
  );
};
