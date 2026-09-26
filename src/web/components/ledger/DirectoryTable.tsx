import React, { useMemo, useState } from "react";
import { ProjectPanel } from "./ProjectPanel";
import {
  type LedgerProject,
  splitTitle,
  prettyStage,
  deriveProjectType,
  PROJECT_TYPE_META,
  STAGE_TONE,
  STAGE_CHIP,
  STAGE_STEP,
  formatDay,
  formatUtcDateTime
} from "./types";
import { Search, ExternalLink, X, ChevronDown, Link2, Check, Filter, Camera } from "lucide-react";

const STAGE_FILTERS = [
  { key: "all", label: "All ports" },
  { key: "wip", label: "In development" },
  { key: "playable", label: "Playable" },
  { key: "booting", label: "Early boot" },
  { key: "released", label: "Released" },
  { key: "recent", label: "Recently updated" }
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

const ProjectCardArtwork: React.FC<{ project: LedgerProject; title: string }> = ({ project, title }) => {
  const [imageFailed, setImageFailed] = useState(false);
  const hasScreenshot = Boolean(project.screenshot_url) && !imageFailed;
  const initials = title.split(/\s+/).filter(Boolean).slice(0, 2).map((word) => word[0]).join("").toUpperCase();

  return (
    <div className="relative -mx-4 -mt-4 mb-0 aspect-[16/9] overflow-hidden bg-sunken sm:-mx-5 sm:-mt-5" aria-hidden="true">
      {hasScreenshot ? (
        <img
          data-testid="project-artwork"
          src={project.screenshot_url || undefined}
          alt=""
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <div data-testid="project-artwork-fallback" className="flex h-full items-end justify-between bg-accent/5 p-4 sm:p-5">
          <span className="font-display text-5xl font-semibold leading-none tracking-[-0.06em] text-accent sm:text-6xl">{initials}</span>
          <span className="max-w-[45%] text-right font-mono text-micro font-semibold uppercase tracking-[0.14em] text-ink-medium">
            {PROJECT_TYPE_META[deriveProjectType(project)].shortLabel}
          </span>
        </div>
      )}
    </div>
  );
};

interface DirectoryTableProps {
  projects: LedgerProject[];
  visible: LedgerProject[];
  loading: boolean;
  activeFilter: string;
  onFilterChange: (f: string) => void;
  activeCategory: string;
  onCategoryChange: (c: string) => void;
  activeSort: string;
  onSortChange: (s: string) => void;
  searchTerm: string;
  onSearchChange: (q: string) => void;
  onResetFilters: () => void;
  searchRef: React.RefObject<HTMLInputElement | null>;
  selectedId: number | null;
  expandedId: number | null;
  onToggleEntry: (project: LedgerProject) => void;
  onSelectProject: (project: LedgerProject) => void;
  onCopyLink: (project: LedgerProject) => void;
  copiedSlug: string;
  directoryRef: React.RefObject<HTMLElement | null>;
  latestSignal?: LatestSignal;
}

export const DirectoryTable: React.FC<DirectoryTableProps> = ({
  projects,
  visible,
  loading,
  activeFilter,
  onFilterChange,
  activeCategory,
  onCategoryChange,
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
    const counts: Record<string, number> = { all: projects.length, wip: 0, playable: 0, booting: 0, released: 0, recent: 0 };
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

  return (
    <section
      id="directory"
      ref={directoryRef}
      aria-labelledby="directory-heading"
      className="mx-auto mt-2 max-w-6xl px-4 sm:px-6"
    >
      <div>
        <h2 id="directory-heading" className="text-title font-semibold text-ink">
          Directory
        </h2>
        <p aria-live="polite" aria-atomic="true" className="mt-1.5 text-body text-ink-medium">
          {loading
            ? "Loading indexed projects…"
            : visible.length === projects.length
              ? projects.length + " projects indexed"
              : "Showing " + visible.length + " of " + projects.length}
          <span className="ml-2 text-caption text-ink-muted">
            · {projects.filter((pr) => pr.screenshot_url).length} source screenshots
          </span>
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
          {searchTerm && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              aria-label="Clear search"
              className="absolute right-1 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-sunken hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-1.5">
            {STAGE_FILTERS.map((filter) => (
              <div key={filter.key} className="relative group"><button type="button" aria-pressed={activeFilter === filter.key} onClick={() => onFilterChange(filter.key)} className={"relative z-10 inline-flex min-h-[44px] items-center gap-1.5 rounded-full px-4 py-2 text-caption font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent " + (activeFilter === filter.key ? "text-ink" : "text-ink-muted hover:text-ink")}><span>{filter.label}</span><span className="font-mono text-micro opacity-70">({stageCounts[filter.key] ?? 0})</span></button>{activeFilter === filter.key && (<div className="filter-active-bg transition-all duration-200"></div>)}</div>
            ))}
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

        {/* Type is the secondary axis, so it reads quieter than the stage filters. */}
        <div className="mt-2.5 flex items-center gap-1 overflow-x-auto no-scrollbar">
          <span className="mr-1 shrink-0 text-micro uppercase tracking-wider text-ink-muted">Type</span>
          {CATEGORY_FILTERS.map((cat) => {
            const active = activeCategory === cat.key;
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => onCategoryChange(cat.key)}
                aria-pressed={active}
                className={
                  "inline-flex min-h-[44px] shrink-0 items-center whitespace-nowrap rounded-md px-3 py-2 text-caption font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent " +
                  (active ? "bg-accent/10 text-ink" : "text-ink-muted hover:bg-sunken hover:text-ink")
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
        ) : visible.length === 0 ? (
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
        ) : (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((project) => {
              const title = splitTitle(project.game_title || project.display_name);
              const expanded = expandedId === project.id;
              const selected = selectedId === project.id;
              const seenAt = project.first_seen_at ? new Date(project.first_seen_at).getTime() : 0;
              const isNew = seenAt > 0 && Date.now() - seenAt < 7 * 24 * 60 * 60 * 1000;

              return (
                <li
                  key={project.id}
                  id={"entry-" + project.slug}
                  onClick={(event) => {
                    if ((event.target as HTMLElement).closest("a, button")) return;
                    onToggleEntry(project);
                  }}
                  className={
                    "min-w-0 overflow-hidden rounded-2xl border border-hairline bg-surface transition-all duration-300 " +
                    (expanded ? "sm:col-span-2 lg:col-span-3 " : "") +
                    (selected ? "border-hairline-strong/60 bg-sunken/60 shadow-lift" : "")
                  }
                >
                  <div className="group/row relative grid gap-4 p-4 transition-colors hover:bg-sunken/50 sm:p-5">
                    <span
                      aria-hidden="true"
                      className="absolute left-0 top-0 h-full w-0.5 origin-top scale-y-0 bg-accent transition-transform duration-200 group-hover/row:scale-y-100"
                    />
                    <ProjectCardArtwork project={project} title={title.name} />

                    <div className="min-w-0">
                      <span className="flex items-center gap-2.5">
                        <span className="min-w-0">
                          <span className="flex items-center gap-2">
                            <button
                              type="button"
                              aria-expanded={expanded}
                              aria-controls={"panel-" + project.slug}
                              aria-label={`${expanded ? "Hide" : "Show"} details for ${title.name}`}
                              onClick={() => onToggleEntry(project)}
                              className="min-h-[44px] min-w-0 truncate text-left text-subtitle font-semibold text-ink transition-colors hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                            >
                              {title.name}
                            </button>
                            {isNew && (
                              <span className="shrink-0 rounded border border-accent/20 bg-accent/15 px-1.5 py-0.5 text-micro font-semibold uppercase tracking-wide text-ink">
                                New
                              </span>
                            )}
                            {project.screenshot_url && (
                              <span title="Source screenshot available"><Camera className="h-3 w-3 shrink-0 text-ink-muted" aria-hidden="true" /></span>
                            )}
                          </span>
                      <span className="mt-0.5 block font-mono text-micro uppercase text-ink-muted">
                            {title.engine || project.original_platform || PROJECT_TYPE_META[deriveProjectType(project)].shortLabel}
                          </span>
                          <span className="mt-1 block text-micro text-ink-muted">
                            Observed {formatDay(project.last_activity_at) || "date not recorded"}
                          </span>
                        </span>
                      </span>
                      <span aria-hidden="true" className="mt-2.5 flex gap-1 pl-[38px]">
                        {[1, 2, 3, 4, 5].map((segment) => (
                          <span
                            key={segment}
                            className={
                              "h-[3px] w-5 rounded-full " +
                              (segment <= (STAGE_STEP[String(project.current_stage)] || 1)
                                ? STAGE_TONE[String(project.current_stage)] || "bg-stage-idle"
                                : "bg-hairline")
                            }
                          />
                        ))}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1">
                      <span
                        className={
                          "inline-flex rounded-md px-2 py-1 text-micro font-semibold uppercase " +
                          (STAGE_CHIP[String(project.current_stage)] || "bg-sunken text-ink-medium")
                        }
                      >
                        {prettyStage(project.current_stage)}
                      </span>
                      {project.verification === "detected" && (
                        <span className="ml-1.5 inline-flex rounded-md border border-hairline-strong/30 px-2 py-1 text-micro font-semibold uppercase text-ink-muted">
                          Unverified
                        </span>
                      )}
                      <span className="inline-flex rounded-md border border-hairline bg-surface px-2 py-1 text-micro font-semibold uppercase text-ink-muted">
                        {PROJECT_TYPE_META[deriveProjectType(project)].shortLabel}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <p className="line-clamp-3 text-body text-ink-medium">
                        {project.performance_notes || project.playability_notes || project.summary || "No hardware note recorded."}
                      </p>
                      {Array.isArray(project.technologies) && project.technologies.length > 0 && (
                        <div className="mt-1.5 flex flex-wrap items-center gap-1">
                          {project.technologies.slice(0, 3).map((tech: string, techIndex: number) => (
                            <span
                              key={tech}
                              className={
                                "rounded border border-hairline bg-surface px-1.5 py-0.5 font-mono text-micro text-ink-muted" +
                                (techIndex >= 2 ? " hidden sm:inline" : "")
                              }
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-end gap-1 border-t border-hairline pt-3">
                      <button
                        type="button"
                        onClick={() => onCopyLink(project)}
                        title="Copy a direct link to this entry"
                        aria-label={"Copy a direct link to " + title.name}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-sunken hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
                      >
                        {copiedSlug === project.slug ? (
                          <Check className="h-4 w-4 text-stage-done" />
                        ) : (
                          <Link2 className="h-4 w-4" />
                        )}
                      </button>
                      {project.reddit_url && (
                        <a
                          href={project.reddit_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Open the source discussion"
                          aria-label={"Open the source discussion for " + title.name}
                          className="inline-flex h-11 w-11 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-sunken hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => onToggleEntry(project)}
                        aria-expanded={expanded}
                        aria-controls={"panel-" + project.slug}
                        aria-label={`${expanded ? "Collapse" : "Expand"} details for ${title.name}`}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-sunken hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
                      >
                        <ChevronDown aria-hidden="true" className={"h-4 w-4 transition-transform duration-200 " + (expanded ? "rotate-180" : "")} />
                      </button>
                    </div>
                  </div>

                  {expanded && (
                    <ProjectPanel
                      project={project}
                      onSelectProject={onSelectProject}
                      onCopyLink={onCopyLink}
                      isCopied={copiedSlug === project.slug}
                    />
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
};
