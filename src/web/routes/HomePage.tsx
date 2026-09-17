import React, { Suspense, lazy, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { apiGet } from "../lib/api";
import { useDocumentMeta } from "../lib/useDocumentMeta";
import { Search, ExternalLink, X, ChevronDown, Link2, Check } from "lucide-react";

const VitaConsoleScene = lazy(() =>
  import("../components/3d/VitaConsoleScene").then((module) => ({ default: module.VitaConsoleScene }))
);

const FILTERS = [
  { key: "all", label: "All ports" },
  { key: "wip", label: "In development" },
  { key: "playable", label: "Playable" },
  { key: "booting", label: "Early boot" }
];

const SORTS = [
  { key: "recent", label: "Recently active" },
  { key: "progress", label: "Furthest along" },
  { key: "name", label: "A – Z" }
];

const STAGE_DOT: Record<string, string> = {
  released: "bg-emerald-500",
  completable: "bg-emerald-500",
  playable: "bg-emerald-500",
  in_game: "bg-blue-500",
  booting: "bg-amber-500",
  early_wip: "bg-slate-400",
  research: "bg-slate-400",
  announced: "bg-slate-400"
};

const STAGE_RANK: Record<string, number> = {
  announced: 0,
  research: 0,
  early_wip: 1,
  booting: 2,
  in_game: 3,
  playable: 4,
  completable: 5,
  released: 6
};

const SPECS: Array<[string, string]> = [
  ["Architecture", "Quad Cortex-A9"],
  ["Graphics", "SGX543MP4+"],
  ["Display", "960 × 544 OLED"],
  ["Memory", "512 MB unified"]
];

function splitTitle(raw: unknown) {
  const value = String(raw || "Untitled port").trim();
  const open = value.indexOf("(");
  if (open === -1) return { name: value, engine: "" };
  return {
    name: value.slice(0, open).trim(),
    engine: value.slice(open).replace(/[()]/g, "").trim()
  };
}

function prettyStage(stage: unknown) {
  const value = String(stage || "wip").replace(/_/g, " ");
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function relativeTime(value: unknown) {
  const time = new Date(String(value)).getTime();
  if (Number.isNaN(time)) return "";
  const hours = Math.round((Date.now() - time) / 3600000);
  if (hours < 1) return "just now";
  if (hours < 24) return hours + "h ago";
  const days = Math.round(hours / 24);
  return days + "d ago";
}

function slugFromLocation(pathname: string, hash: string) {
  const fromHash = hash.match(/p=([a-z0-9-]+)/i);
  if (fromHash) return fromHash[1].toLowerCase();
  const fromPath = pathname.match(/^\/projects\/([a-z0-9-]+)\/?$/i);
  if (fromPath) return fromPath[1].toLowerCase();
  return "";
}

const ConsoleSkeleton = () => (
  <div className="flex h-full w-full items-end justify-center pb-10">
    <div className="vh-skeleton h-[62%] w-[78%] max-w-[620px] rounded-[30px] bg-slate-100" />
  </div>
);

export const HomePage: React.FC = () => {
  const location = useLocation();

  useDocumentMeta({
    title: "VitaHarbor — PlayStation Vita Port Archive",
    description:
      "An independent archive of PlayStation Vita engine decompilations, ARM wrappers and homebrew builds, sourced from community engineering boards."
  });

  const [projects, setProjects] = useState<any[]>([]);
  const [recentUpdates, setRecentUpdates] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [activeSort, setActiveSort] = useState("recent");
  const [loading, setLoading] = useState(true);
  const [copiedSlug, setCopiedSlug] = useState("");
  const [scrolled, setScrolled] = useState(false);

  const consoleRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const [projectsRes, updatesRes] = await Promise.all([
        apiGet<{ projects: any[] }>("/api/projects?limit=50", "projects").catch(() => ({ projects: [] })),
        apiGet<{ updates: any[] }>("/api/updates?limit=8", "updates").catch(() => ({ updates: [] }))
      ]);
      if (cancelled) return;
      const list = projectsRes?.projects || [];
      setProjects(list);
      setRecentUpdates(updatesRes?.updates || []);
      setLoading(false);

      const wanted = slugFromLocation(window.location.pathname, window.location.hash);
      const deep = wanted ? list.find((item) => item.slug === wanted) : null;
      const initial = deep || list[0];
      if (initial) {
        setSelectedId(initial.id);
        if (deep) {
          setExpandedId(deep.id);
          requestAnimationFrame(() => {
            document.getElementById("entry-" + deep.slug)?.scrollIntoView({ behavior: "smooth", block: "center" });
          });
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement;
      if (event.key === "/" && !typing) {
        event.preventDefault();
        searchRef.current?.focus();
      }
      if (event.key === "Escape") {
        setSearchTerm("");
        if (typing) target?.blur();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const selectedProject = useMemo(
    () => projects.find((item) => item.id === selectedId) || null,
    [projects, selectedId]
  );

  const visible = useMemo(() => {
    let list = [...projects];

    if (activeFilter === "wip") {
      list = list.filter((p) => ["in_game", "booting", "early_wip", "research"].includes(String(p.current_stage)));
    } else if (activeFilter === "playable") {
      list = list.filter((p) => ["playable", "released", "completable"].includes(String(p.current_stage)));
    } else if (activeFilter === "booting") {
      list = list.filter((p) => ["booting", "early_wip", "research"].includes(String(p.current_stage)));
    }

    const term = searchTerm.trim().toLowerCase();
    if (term) {
      list = list.filter(
        (p) =>
          [p.game_title, p.display_name, p.summary, p.original_platform, p.slug]
            .filter(Boolean)
            .some((field: string) => String(field).toLowerCase().includes(term)) ||
          (p.technologies || []).some((tech: string) => String(tech).toLowerCase().includes(term))
      );
    }

    list.sort((a, b) => {
      if (activeSort === "name") {
        return splitTitle(a.game_title || a.display_name).name.localeCompare(splitTitle(b.game_title || b.display_name).name);
      }
      if (activeSort === "progress") {
        const diff = (STAGE_RANK[String(b.current_stage)] ?? -1) - (STAGE_RANK[String(a.current_stage)] ?? -1);
        if (diff !== 0) return diff;
      }
      return new Date(b.last_activity_at || 0).getTime() - new Date(a.last_activity_at || 0).getTime();
    });

    return list;
  }, [projects, activeFilter, activeSort, searchTerm]);

  const newest = recentUpdates[0];

  const focusOnConsole = () => {
    consoleRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const selectProject = (project: any, scroll = true) => {
    setSelectedId(project.id);
    if (scroll) focusOnConsole();
  };

  const toggleEntry = (project: any) => {
    const next = expandedId === project.id ? null : project.id;
    setExpandedId(next);
    setSelectedId(project.id);
    if (next) {
      history.replaceState(null, "", "#p=" + project.slug);
    } else if (window.location.hash.startsWith("#p=")) {
      history.replaceState(null, "", window.location.pathname);
    }
  };

  const copyEntryLink = async (project: any) => {
    const url = window.location.origin + "/#p=" + project.slug;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedSlug(project.slug);
      window.setTimeout(() => setCopiedSlug(""), 1800);
    } catch {
      setCopiedSlug("");
    }
  };

  const preview = selectedProject ? splitTitle(selectedProject.game_title || selectedProject.display_name) : null;

  return (
    <div id="top" className="min-h-screen bg-[#fbfbfd] text-[#1d1d1f]">
      <nav
        className={
          "sticky top-0 z-50 border-b bg-white/80 backdrop-blur-xl transition-colors " +
          (scrolled ? "border-slate-200/80" : "border-transparent")
        }
      >
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <a
            href="#top"
            className="rounded-md text-[17px] font-semibold tracking-tight text-slate-900 outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20"
          >
            VitaHarbor
          </a>
          <div className="flex items-center gap-5 text-[13px] text-slate-500">
            <a href="#directory" className="rounded-md transition-colors hover:text-slate-900">Directory</a>
            <a href="#methodology" className="hidden rounded-md transition-colors hover:text-slate-900 sm:inline">Methodology</a>
            <span className="hidden items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600 sm:inline-flex">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
              <span className="vh-tnum">{loading ? "…" : projects.length}</span>
              <span>indexed</span>
            </span>
          </div>
        </div>
      </nav>

      {recentUpdates.length > 0 && (
        <div className="relative flex h-9 items-center overflow-hidden border-b border-slate-200/70 bg-white">
          <div className="vh-ticker text-[12px] text-slate-500">
            {[0, 1].map((pass) => (
              <React.Fragment key={pass}>
                {recentUpdates.map((item, index) => (
                  <a
                    key={pass + "-" + index}
                    href={item.sources?.[0]?.canonical_url || "#directory"}
                    target={item.sources?.[0]?.canonical_url ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    className="mx-7 inline-flex items-center gap-2.5 whitespace-nowrap transition-colors hover:text-slate-900"
                  >
                    <span className="vh-tnum text-slate-400">{relativeTime(item.event_at)}</span>
                    <span className="h-1 w-1 rounded-full bg-slate-300" />
                    <span>{item.title}</span>
                  </a>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      <header className="mx-auto max-w-5xl px-6 pb-2 pt-20 text-center">
        <p className="text-[12px] font-medium uppercase tracking-[0.2em] text-slate-500">
          Independent hardware archive
        </p>
        <h1 className="mt-5 text-[40px] font-semibold leading-[1.06] tracking-[-0.035em] text-slate-900 sm:text-[56px]">
          PlayStation Vita port archive.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-[17px] leading-relaxed text-slate-600">
          Engine decompilations, ARM wrappers and homebrew builds documented at the moment
          they surface on community engineering boards.
        </p>
      </header>

      <section ref={consoleRef} className="mx-auto max-w-4xl px-6 pt-6">
        <div className="h-[420px] sm:h-[520px]">
          <Suspense fallback={<ConsoleSkeleton />}>
            <div className="vh-rise h-full w-full">
              <VitaConsoleScene selectedProject={selectedProject} />
            </div>
          </Suspense>
        </div>

        {preview && (
          <div className="mt-2 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500">
                On the display
              </p>
              <p className="mt-1 truncate text-[15px] font-medium text-slate-900">{preview.name}</p>
              <p className="mt-0.5 text-[12px] text-slate-500">
                {prettyStage(selectedProject?.current_stage)}
                {selectedProject?.original_platform ? " · " + selectedProject.original_platform : ""}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => copyEntryLink(selectedProject)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-[12px] font-medium text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20"
              >
                {copiedSlug === selectedProject?.slug ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    Copied
                  </>
                ) : (
                  <>
                    <Link2 className="h-3.5 w-3.5" />
                    Copy link
                  </>
                )}
              </button>
              {selectedProject?.reddit_url && (
                <a
                  href={selectedProject.reddit_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-[12px] font-medium text-white transition-colors hover:bg-slate-800"
                >
                  Source discussion
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          </div>
        )}

        <div className="mt-5 flex justify-center">
          <div className="no-scrollbar flex max-w-full gap-1 overflow-x-auto rounded-full border border-slate-200 bg-slate-50 p-1">
            {projects.slice(0, 6).map((project) => {
              const active = selectedId === project.id;
              return (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => selectProject(project, false)}
                  className={
                    "whitespace-nowrap rounded-full px-3.5 py-1.5 text-[12px] font-medium transition-colors focus-visible:outline-none " +
                    (active
                      ? "border border-slate-200 bg-white text-slate-900 shadow-sm"
                      : "border border-transparent text-slate-500 hover:text-slate-900")
                  }
                >
                  {splitTitle(project.game_title || project.display_name).name}
                </button>
              );
            })}
          </div>
        </div>

        <p className="mt-4 text-center text-[11px] uppercase tracking-[0.16em] text-slate-500">
          Drag to rotate · Press <span className="font-mono">/</span> to search the directory
        </p>

        <dl className="mx-auto mt-12 grid max-w-3xl grid-cols-2 gap-x-8 gap-y-7 border-t border-slate-200 pt-8 sm:grid-cols-4">
          {SPECS.map(([term, value]) => (
            <div key={term}>
              <dt className="text-[11px] font-medium uppercase tracking-[0.12em] text-slate-500">{term}</dt>
              <dd className="mt-1.5 text-[14px] text-slate-800">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section id="directory" className="mx-auto mt-28 max-w-5xl px-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-[26px] font-semibold tracking-[-0.02em] text-slate-900">Directory</h2>
            <p className="mt-1.5 text-[14px] text-slate-600">
              {loading
                ? "Loading indexed projects…"
                : visible.length === projects.length
                  ? projects.length + " projects indexed"
                  : "Showing " + visible.length + " of " + projects.length + " projects"}
              {newest && !loading ? " · newest signal " + relativeTime(newest.event_at) : ""}
            </p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              ref={searchRef}
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Filter by game, engine or platform"
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-9 text-[13px] text-slate-900 placeholder-slate-400 outline-none transition-shadow focus:border-slate-300 focus:ring-4 focus:ring-slate-900/5"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-1.5">
            {FILTERS.map((filter) => (
              <button
                key={filter.key}
                type="button"
                onClick={() => setActiveFilter(filter.key)}
                className={
                  "rounded-full px-3.5 py-1.5 text-[12px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20 " +
                  (activeFilter === filter.key
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900")
                }
              >
                {filter.label}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2 text-[12px] text-slate-500">
            <span className="hidden sm:inline">Sort</span>
            <select
              value={activeSort}
              onChange={(event) => setActiveSort(event.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[12px] font-medium text-slate-700 outline-none transition-shadow focus:ring-4 focus:ring-slate-900/5"
            >
              {SORTS.map((sort) => (
                <option key={sort.key} value={sort.key}>
                  {sort.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="hidden grid-cols-12 gap-4 border-b border-slate-200 bg-slate-50/70 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 md:grid">
            <div className="col-span-5">Project</div>
            <div className="col-span-2">Stage</div>
            <div className="col-span-4">Hardware notes</div>
            <div className="col-span-1 text-right">Source</div>
          </div>

          {loading ? (
            <div className="divide-y divide-slate-100">
              {[0, 1, 2, 3, 4].map((row) => (
                <div key={row} className="flex items-center gap-4 px-5 py-5">
                  <div className="vh-skeleton h-3 w-40 rounded-full bg-slate-100" />
                  <div className="vh-skeleton h-3 w-20 rounded-full bg-slate-100" />
                  <div className="vh-skeleton hidden h-3 flex-1 rounded-full bg-slate-100 md:block" />
                </div>
              ))}
            </div>
          ) : visible.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="text-[14px] text-slate-600">Nothing matches that search.</p>
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setActiveFilter("all");
                }}
                className="mt-3 text-[13px] font-medium text-slate-900 underline underline-offset-4"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {visible.map((project) => {
                const title = splitTitle(project.game_title || project.display_name);
                const expanded = expandedId === project.id;
                const selected = selectedId === project.id;
                return (
                  <li key={project.id} id={"entry-" + project.slug} className={selected ? "bg-slate-50/60" : ""}>
                    <div
                      role="button"
                      tabIndex={0}
                      aria-expanded={expanded}
                      onClick={() => toggleEntry(project)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          toggleEntry(project);
                        }
                      }}
                      className="grid cursor-pointer grid-cols-1 gap-2.5 px-5 py-4 transition-colors hover:bg-slate-50/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-slate-900/20 md:grid-cols-12 md:items-center md:gap-4"
                    >
                      <div className="md:col-span-5">
                        <span className="flex items-center gap-2.5">
                          <span
                            className={
                              "h-1.5 w-1.5 shrink-0 rounded-full " +
                              (STAGE_DOT[String(project.current_stage)] || "bg-slate-400")
                            }
                          />
                          <span className="text-[15px] font-medium text-slate-900">{title.name}</span>
                        </span>
                        {title.engine && (
                          <span className="mt-1 block pl-4 font-mono text-[11px] uppercase tracking-[0.08em] text-slate-500">
                            {title.engine}
                          </span>
                        )}
                      </div>

                      <div className="pl-4 md:col-span-2 md:pl-0">
                        <span className="inline-flex rounded-md bg-slate-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-600">
                          {prettyStage(project.current_stage)}
                        </span>
                      </div>

                      <div className="pl-4 md:col-span-4 md:pl-0">
                        <p className="line-clamp-2 text-[13px] leading-relaxed text-slate-600 md:line-clamp-1">
                          {project.performance_notes || project.playability_notes || "Tested on native hardware."}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 pl-4 md:col-span-1 md:justify-end md:pl-0">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            copyEntryLink(project);
                          }}
                          title="Copy a direct link to this entry"
                          aria-label="Copy a direct link to this entry"
                          className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900"
                        >
                          {copiedSlug === project.slug ? (
                            <Check className="h-4 w-4 text-emerald-600" />
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
                            aria-label="Open the source discussion"
                            className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                        <ChevronDown
                          className={
                            "h-4 w-4 text-slate-400 transition-transform " + (expanded ? "rotate-180" : "")
                          }
                        />
                      </div>
                    </div>

                    {expanded && (
                      <div className="border-t border-slate-100 bg-slate-50/50 px-5 py-5">
                        <p className="max-w-3xl text-[14px] leading-relaxed text-slate-700">
                          {project.summary || "No summary recorded for this project yet."}
                        </p>

                        {project.playability_notes && (
                          <p className="mt-4 max-w-3xl text-[13px] leading-relaxed text-slate-600">
                            <span className="font-medium text-slate-800">Playability: </span>
                            {project.playability_notes}
                          </p>
                        )}

                        {project.technologies?.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-1.5">
                            {project.technologies.map((tech: string) => (
                              <span
                                key={tech}
                                className="rounded-md border border-slate-200 bg-white px-2 py-1 font-mono text-[11px] text-slate-600"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="mt-5 flex flex-wrap items-center gap-3">
                          <button
                            type="button"
                            onClick={() => selectProject(project)}
                            className="rounded-lg bg-slate-900 px-3.5 py-2 text-[12px] font-medium text-white transition-colors hover:bg-slate-800"
                          >
                            Show on the console
                          </button>
                          <button
                            type="button"
                            onClick={() => copyEntryLink(project)}
                            className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-[12px] font-medium text-slate-700 transition-colors hover:border-slate-300"
                          >
                            {copiedSlug === project.slug ? "Link copied" : "Copy link"}
                          </button>
                          {project.reddit_url && (
                            <a
                              href={project.reddit_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-[12px] font-medium text-slate-600 transition-colors hover:text-slate-900"
                            >
                              Source discussion
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      <section id="methodology" className="mx-auto mt-28 max-w-5xl px-6">
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-8">
          <h2 className="text-[15px] font-semibold text-slate-900">How entries get listed</h2>
          <div className="mt-6 grid gap-7 sm:grid-cols-3">
            {[
              ["Sourced", "Every entry links to the original engineering thread on r/vitahacks or r/VitaPiracy."],
              ["Verified", "Stage and performance notes come from the people running the build on real hardware."],
              ["Non-infringing", "Only discussion and source repositories are indexed. No ROMs, ISOs or game data are hosted."]
            ].map(([title, body]) => (
              <div key={title}>
                <p className="text-[13px] font-medium text-slate-800">{title}</p>
                <p className="mt-2 text-[13px] leading-relaxed text-slate-600">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="mx-auto mt-24 max-w-5xl border-t border-slate-200 px-6 py-10">
        <div className="flex flex-col items-start justify-between gap-5 text-[13px] text-slate-500 sm:flex-row sm:items-center">
          <p className="max-w-md leading-relaxed">
            VitaHarbor is an independent research index. Nothing here bypasses licensing or
            distributes copyrighted game data.
          </p>
          <div className="flex items-center gap-5">
            <a href="/api/feed.json" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-slate-900">
              JSON feed
            </a>
            <a href="/api/rss.xml" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-slate-900">
              RSS
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

