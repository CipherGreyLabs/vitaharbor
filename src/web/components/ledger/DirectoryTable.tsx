import React, { useMemo } from "react";
import { ProjectMark } from "../projects/ProjectMark";
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
  formatDay
} from "./types";
import { Search, ExternalLink, X, ChevronDown, Link2, Check, Filter, Camera } from "lucide-react";

const STAGE_FILTERS = [
  { key: "all", label: "All ports" },
  { key: "wip", label: "In development" },
  { key: "playable", label: "Playable" },
  { key: "booting", label: "Early boot" }
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
  scannedAt?: string | Date;
  directoryRef: React.RefObject<HTMLElement | null>;
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
  scannedAt,
  directoryRef
}) => {
  const stageCounts = useMemo(() => {
    const counts: Record<string, number> = { all: projects.length, wip: 0, playable: 0, booting: 0 };
    for (const p of projects) {
      const st = String(p.current_stage);
      if (["in_game", "booting", "early_wip", "research"].includes(st)) counts.wip++;
      if (["playable", "released", "completable"].includes(st)) counts.playable++;
      if (["booting", "early_wip", "research"].includes(st)) counts.booting++;
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
      className="mx-auto mt-28 max-w-6xl px-6"
    >
      <div>
        <h2 id="directory-heading" className="text-title font-semibold text-ink">
          Directory
        </h2>
        <p className="mt-1.5 text-body text-ink-medium">
          {loading
            ? "Loading indexed projects…"
            : visible.length === projects.length
              ? projects.length + " projects indexed"
              : "Showing " + visible.length + " of " + projects.length}
          <span className="ml-2 text-caption text-ink-muted">
            · {projects.filter((pr) => pr.screenshot_url).length} source screenshots
            <span className="ml-2 text-ink-muted/60">· Source scan {formatDay(scannedAt) || "not recorded"}</span>
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
          <button type="button" onClick={onResetFilters} className="inline-flex min-h-[32px] items-center gap-1 rounded-full px-2.5 py-1 text-micro font-medium text-ink-muted underline decoration-ink-muted/40 underline-offset-4 hover:text-ink">
            Clear all
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      {/* Controls stay pinned while the list scrolls, so search is always in reach. */}
      <div className="sticky top-14 z-30 -mx-6 mt-5 border-b border-hairline bg-canvas/95 px-6 py-3 backdrop-blur">
        <div className="relative w-full">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
          <input
            ref={searchRef}
            type="text"
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
            aria-label="Filter the directory"
            placeholder="Filter by game, engine or platform"
            className="w-full rounded-xl border border-hairline bg-surface py-2.5 pl-9 pr-9 text-body text-ink placeholder:text-ink-muted outline-none transition-shadow focus:border-hairline-strong focus:ring-4 focus:ring-ink/5"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              aria-label="Clear search"
              className="absolute right-1.5 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-sunken hover:text-ink sm:h-8 sm:w-8"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-1.5">
            {STAGE_FILTERS.map((filter) => (
              <div key={filter.key} className="relative group"><button type="button" aria-pressed={activeFilter === filter.key} onClick={() => onFilterChange(filter.key)} className={"relative z-10 inline-flex min-h-[44px] items-center gap-1.5 rounded-full px-4 py-2.5 text-caption font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20 sm:py-1.5 " + (activeFilter === filter.key ? "text-ink" : "text-ink-muted hover:text-ink")}><span>{filter.label}</span><span className="font-mono text-micro opacity-60">({stageCounts[filter.key] ?? 0})</span></button>{activeFilter === filter.key && (<div className="filter-active-bg transition-all duration-300"></div>)}</div>
            ))}
          </div>

          <label className="flex items-center gap-2 text-caption text-ink-muted">
            <span className="hidden sm:inline">Sort</span>
            <select
              value={activeSort}
              onChange={(event) => onSortChange(event.target.value)}
              className="cursor-pointer rounded-lg border border-hairline bg-surface px-2.5 py-2.5 text-caption font-medium text-ink-medium outline-none transition-shadow focus:ring-4 focus:ring-ink/5 sm:py-1.5"
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
                  className={
                  "inline-flex min-h-[36px] shrink-0 items-center whitespace-nowrap rounded-md px-2.5 py-1 text-micro transition-colors " +
                  (active ? "bg-ink/10 text-ink" : "text-ink-muted hover:text-ink")
                }
              >
                {cat.label} ({categoryCounts[cat.key] ?? 0})
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-7">
        {loading ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
              className="mt-3 text-body font-medium text-ink underline underline-offset-4"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
                  className={
                    "min-w-0 overflow-hidden rounded-2xl border border-hairline bg-surface transition-all duration-300 " +
                    (expanded ? "sm:col-span-2 lg:col-span-3 xl:col-span-4 " : "") +
                    (selected ? "border-hairline-strong/60 bg-sunken/60 shadow-lift" : "")
                  }
                >
                  <div
                    role="button"
                    tabIndex={0}
                    aria-expanded={expanded}
                    aria-controls={"panel-" + project.slug}
                    onClick={() => onToggleEntry(project)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onToggleEntry(project);
                      }
                    }}
                    className="group/row relative grid cursor-pointer gap-4 p-4 transition-colors hover:bg-sunken/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ink/20 sm:p-5"
                  >
                    <span
                      aria-hidden="true"
                      className="absolute left-0 top-0 h-full w-0.5 origin-top scale-y-0 bg-accent transition-transform duration-200 group-hover/row:scale-y-100"
                    />
                    <div className="min-w-0">
                      <span className="flex items-center gap-2.5">
                        <ProjectMark
                          seed={project.display_name || project.game_title || "vita"}
                          size={30}
                          className="shrink-0 rounded-[9px] transition-transform duration-200 group-hover/row:scale-105"
                        />
                        <span className="min-w-0">
                          <span className="flex items-center gap-2">
                            <span className="truncate text-subtitle font-medium text-ink transition-colors group-hover/row:text-accent">
                              {title.name}
                            </span>
                            {isNew && (
                              <span className="shrink-0 rounded border border-accent/20 bg-accent/15 px-1.5 py-0.5 text-micro font-semibold uppercase tracking-wide text-ink">
                                New
                              </span>
                            )}
                            {project.screenshot_url && (
                              <span title="Screenshot available"><Camera className="h-3 w-3 shrink-0 text-ink-muted/60" aria-hidden="true" /></span>
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
                        onClick={(event) => {
                          event.stopPropagation();
                          onCopyLink(project);
                        }}
                        title="Copy a direct link to this entry"
                        aria-label={"Copy a direct link to " + title.name}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-sunken hover:text-ink sm:h-8 sm:w-8"
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
                          onClick={(event) => event.stopPropagation()}
                          title="Open the source discussion"
                          aria-label={"Open the source discussion for " + title.name}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-sunken hover:text-ink sm:h-8 sm:w-8"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                      <ChevronDown
                        aria-hidden="true"
                        className={
                          "h-4 w-4 text-ink-muted transition-transform duration-300 " +
                          (expanded ? "rotate-180" : "")
                        }
                      />
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
