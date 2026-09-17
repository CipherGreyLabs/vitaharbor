import React from "react";
import { ProjectMark } from "../projects/ProjectMark";
import { ProjectPanel } from "./ProjectPanel";
import {
  type LedgerProject,
  splitTitle,
  prettyStage,
  derivePlatformCategory,
  STAGE_TONE,
  STAGE_CHIP,
  STAGE_STEP
} from "./types";
import { Search, ExternalLink, X, ChevronDown, Link2, Check, Filter } from "lucide-react";

const STAGE_FILTERS = [
  { key: "all", label: "All ports" },
  { key: "wip", label: "In development" },
  { key: "playable", label: "Playable" },
  { key: "booting", label: "Early boot" }
];

const CATEGORY_FILTERS = [
  { key: "all", label: "All types" },
  { key: "wrapper", label: "Android Wrappers" },
  { key: "decomp", label: "Decompilations" },
  { key: "classic", label: "PC & Classics" }
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
  searchRef: React.RefObject<HTMLInputElement | null>;
  selectedId: number | null;
  expandedId: number | null;
  onToggleEntry: (project: LedgerProject) => void;
  onSelectProject: (project: LedgerProject) => void;
  onCopyLink: (project: LedgerProject) => void;
  copiedSlug: string;
  newestActivity?: string | Date;
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
  searchRef,
  selectedId,
  expandedId,
  onToggleEntry,
  onSelectProject,
  onCopyLink,
  copiedSlug,
  directoryRef
}) => {
  return (
    <section
      id="directory"
      ref={directoryRef}
      data-reveal=""
      aria-labelledby="directory-heading"
      className="mx-auto mt-28 max-w-5xl px-6"
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
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
          </p>
        </div>
        <div className="relative w-full sm:w-72">
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
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-ink-muted transition-colors hover:bg-sunken hover:text-ink"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Controls: Stage, Category & Sort */}
      <div className="mt-6 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-1.5">
            {STAGE_FILTERS.map((filter) => (
              <button
                key={filter.key}
                type="button"
                aria-pressed={activeFilter === filter.key}
                onClick={() => onFilterChange(filter.key)}
                className={
                  "rounded-full px-3.5 py-1.5 text-caption font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20 " +
                  (activeFilter === filter.key
                    ? "bg-ink text-canvas"
                    : "bg-sunken text-ink-medium hover:bg-hairline hover:text-ink")
                }
              >
                {filter.label}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2 text-caption text-ink-muted">
            <span className="hidden sm:inline">Sort</span>
            <select
              value={activeSort}
              onChange={(event) => onSortChange(event.target.value)}
              className="rounded-lg border border-hairline bg-surface px-2.5 py-1.5 text-caption font-medium text-ink-medium outline-none transition-shadow focus:ring-4 focus:ring-ink/5 cursor-pointer"
            >
              {SORTS.map((sort) => (
                <option key={sort.key} value={sort.key}>
                  {sort.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* Smart Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1 text-caption">
          <span className="text-ink-muted text-micro uppercase tracking-wider shrink-0 flex items-center gap-1 mr-1">
            <Filter className="h-3 w-3 text-accent" />
            <span>Type:</span>
          </span>
          {CATEGORY_FILTERS.map((cat) => {
            const active = activeCategory === cat.key;
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => onCategoryChange(cat.key)}
                className={
                  "px-3 py-1 rounded-lg text-micro font-mono whitespace-nowrap transition-all " +
                  (active
                    ? "bg-surface border border-hairline-strong text-ink font-semibold shadow-card"
                    : "bg-transparent text-ink-muted hover:text-ink hover:bg-sunken")
                }
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-hairline bg-surface shadow-card">
        <div className="hidden grid-cols-12 gap-4 border-b border-hairline bg-sunken px-5 py-3 text-micro font-semibold uppercase text-ink-muted md:grid">
          <div className="col-span-5">Project</div>
          <div className="col-span-2">Stage</div>
          <div className="col-span-4">Hardware notes</div>
          <div className="col-span-1 text-right">Source</div>
        </div>

        {loading ? (
          <div className="divide-y divide-hairline">
            {[0, 1, 2, 3, 4].map((row) => (
              <div key={row} className="flex items-center gap-4 px-5 py-5">
                <div className="vh-skeleton h-3 w-40 rounded-full bg-sunken" />
                <div className="vh-skeleton h-3 w-20 rounded-full bg-sunken" />
                <div className="vh-skeleton hidden h-3 flex-1 rounded-full bg-sunken md:block" />
              </div>
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-body text-ink-medium">Nothing matches that search.</p>
            <button
              type="button"
              onClick={() => {
                onSearchChange("");
                onFilterChange("all");
                onCategoryChange("all");
              }}
              className="mt-3 text-body font-medium text-ink underline underline-offset-4"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-hairline">
            {visible.map((project, index) => {
              const title = splitTitle(project.game_title || project.display_name);
              const expanded = expandedId === project.id;
              const selected = selectedId === project.id;

              return (
                <li
                  key={project.id}
                  id={"entry-" + project.slug}
                  style={{ animationDelay: Math.min(index, 14) * 22 + "ms" }}
                  className={"vh-row " + (selected ? "bg-sunken/60" : "")}
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
                    className="group/row relative grid cursor-pointer grid-cols-1 gap-2.5 px-5 py-4 transition-colors hover:bg-sunken/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ink/20 md:grid-cols-12 md:items-center md:gap-4"
                  >
                    <span
                      aria-hidden="true"
                      className="absolute left-0 top-0 h-full w-0.5 origin-top scale-y-0 bg-accent transition-transform duration-200 group-hover/row:scale-y-100"
                    />
                    <div className="md:col-span-5">
                      <span className="flex items-center gap-2.5">
                        <ProjectMark
                          seed={project.display_name || project.game_title || "vita"}
                          size={30}
                          className="shrink-0 rounded-[9px] transition-transform duration-200 group-hover/row:scale-105"
                        />
                        <span className="min-w-0">
                          <span className="block truncate text-subtitle font-medium text-ink transition-colors group-hover/row:text-accent">
                            {title.name}
                          </span>
                          <span className="mt-0.5 block font-mono text-micro uppercase text-ink-muted">
                            {title.engine || project.original_platform || "Port"}
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

                    <div className="pl-4 md:col-span-2 md:pl-0">
                      <span
                        className={
                          "inline-flex rounded-md px-2 py-1 text-micro font-semibold uppercase " +
                          (STAGE_CHIP[String(project.current_stage)] || "bg-sunken text-ink-medium")
                        }
                      >
                        {prettyStage(project.current_stage)}
                      </span>
                      {project.verification === "detected" && (
                        <span className="ml-1.5 inline-flex rounded-md border border-hairline px-2 py-1 text-micro font-semibold uppercase text-ink-muted">
                          Unverified
                        </span>
                      )}
                    </div>

                    <div className="pl-4 md:col-span-4 md:pl-0">
                      <p className="line-clamp-2 text-body text-ink-medium md:line-clamp-1">
                        {project.performance_notes || project.playability_notes || "Tested on native hardware."}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 pl-4 md:col-span-1 md:justify-end md:pl-0">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          onCopyLink(project);
                        }}
                        title="Copy a direct link to this entry"
                        aria-label={"Copy a direct link to " + title.name}
                        className="rounded-md p-1.5 text-ink-muted transition-colors hover:bg-sunken hover:text-ink"
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
                          className="rounded-md p-1.5 text-ink-muted transition-colors hover:bg-sunken hover:text-ink"
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
