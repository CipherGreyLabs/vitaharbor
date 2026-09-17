import React, { useState, useEffect, useMemo, useRef } from "react";
import { VitaConsoleScene, type SelectedProjectView } from "../components/3d/VitaConsoleScene";
import { apiGet } from "../lib/api";
import { useDocumentMeta } from "../lib/useDocumentMeta";
import { Search, ExternalLink, X, ChevronDown } from "lucide-react";

const FILTERS = [
  { key: "all", label: "All ports" },
  { key: "wip", label: "In development" },
  { key: "playable", label: "Playable" },
  { key: "booting", label: "Early boot" }
];

const STAGE_DOT: Record<string, string> = {
  released: "bg-emerald-500",
  playable: "bg-emerald-500",
  completable: "bg-emerald-500",
  in_game: "bg-blue-500",
  booting: "bg-amber-500",
  early_wip: "bg-slate-400",
  research: "bg-slate-400"
};

function splitTitle(raw: unknown) {
  const value = String(raw || "Unknown port").trim();
  const open = value.indexOf("(");
  if (open === -1) return { name: value, engine: "" };
  return { name: value.slice(0, open).trim(), engine: value.slice(open).replace(/[()]/g, "").trim() };
}

function prettyStage(stage: unknown) {
  return String(stage || "wip").replace(/_/g, " ");
}

function relativeTime(value: unknown) {
  const time = new Date(String(value)).getTime();
  if (Number.isNaN(time)) return "";
  const hours = Math.round((Date.now() - time) / 3600000);
  if (hours < 1) return "just now";
  if (hours < 24) return hours + "h ago";
  return Math.round(hours / 24) + "d ago";
}

export const HomePage: React.FC = () => {
  useDocumentMeta({
    title: "VitaHarbor — PlayStation Vita Port Archive",
    description:
      "An independent archive of PlayStation Vita engine decompilations, ARM wrappers and homebrew builds, sourced from community engineering boards."
  });

  const [projects, setProjects] = useState<any[]>([]);
  const [recentUpdates, setRecentUpdates] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<SelectedProjectView | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const consoleRef = useRef<HTMLDivElement>(null);

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
      if (list.length > 0) setSelectedProject(list[0]);
      setRecentUpdates(updatesRes?.updates || []);
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

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
      list = list.filter((p) =>
        [p.game_title, p.display_name, p.summary, p.original_platform]
          .filter(Boolean)
          .some((field: string) => String(field).toLowerCase().includes(term)) ||
        (p.technologies || []).some((tech: string) => String(tech).toLowerCase().includes(term))
      );
    }
    return list;
  }, [projects, activeFilter, searchTerm]);

  const dockItems = useMemo(() => projects.slice(0, 6), [projects]);
  const tickerItems = useMemo(() => (recentUpdates.length > 0 ? recentUpdates : []), [recentUpdates]);

  const selectProject = (project: any) => {
    setSelectedProject(project);
    if (consoleRef.current) {
      consoleRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div id="top" className="min-h-screen bg-[#fbfbfd] text-[#1d1d1f] antialiased">
      <nav className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <a href="#top" className="text-[17px] font-semibold tracking-tight text-slate-900">
            VitaHarbor
          </a>
          <div className="flex items-center gap-5 text-[13px] text-slate-500">
            <a href="#directory" className="transition-colors hover:text-slate-900">Directory</a>
            <a href="#methodology" className="transition-colors hover:text-slate-900">Methodology</a>
            <span className="hidden items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600 sm:inline-flex">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
              Reddit sync active
            </span>
          </div>
        </div>
      </nav>

      {tickerItems.length > 0 && (
        <div className="relative flex h-9 items-center overflow-hidden border-b border-slate-200/70 bg-white">
          <div className="vh-ticker text-[12px] text-slate-500">
            {[0, 1].map((pass) => (
              <React.Fragment key={pass}>
                {tickerItems.map((item, index) => (
                  <span key={pass + "-" + index} className="mx-7 inline-flex items-center gap-2.5 whitespace-nowrap">
                    <span className="tabular-nums text-slate-400">{relativeTime(item.event_at)}</span>
                    <span className="h-1 w-1 rounded-full bg-slate-300" />
                    <span className="text-slate-600">{item.title}</span>
                  </span>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      <header className="mx-auto max-w-5xl px-6 pt-20 pb-2 text-center">
        <p className="text-[12px] font-medium uppercase tracking-[0.2em] text-slate-400">
          Independent hardware archive
        </p>
        <h1 className="mt-5 text-[40px] font-semibold leading-[1.06] tracking-[-0.035em] text-slate-900 sm:text-[56px]">
          PlayStation Vita port archive.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-[17px] leading-relaxed text-slate-500">
          Engine decompilations, ARM wrappers and homebrew builds documented at the
          moment they surface on community engineering boards.
        </p>
      </header>

      <section ref={consoleRef} className="mx-auto max-w-4xl px-6 pt-6">
        <div className="h-[420px] sm:h-[520px]">
          <VitaConsoleScene
            selectedProject={selectedProject}
            onConsoleClick={() => selectedProject && setExpandedId(selectedProject.id)}
          />
        </div>

        <div className="mt-1 flex justify-center">
          <div className="no-scrollbar flex max-w-full gap-1 overflow-x-auto rounded-full border border-slate-200 bg-slate-50 p-1">
            {dockItems.map((project) => {
              const active = selectedProject?.id === project.id;
              return (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => selectProject(project)}
                  className={
                    "whitespace-nowrap rounded-full px-3.5 py-1.5 text-[12px] font-medium transition-all " +
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

        <p className="mt-4 text-center text-[11px] uppercase tracking-[0.16em] text-slate-400">
          Drag to rotate · Select a port to preview it on the display
        </p>

        <dl className="mx-auto mt-12 grid max-w-3xl grid-cols-2 gap-x-8 gap-y-7 border-t border-slate-200 pt-8 sm:grid-cols-4">
          {[
            ["Architecture", "Quad Cortex-A9"],
            ["Graphics", "SGX543MP4+"],
            ["Display", "960 × 544 OLED"],
            ["Memory", "512 MB unified"]
          ].map(([term, value]) => (
            <div key={term}>
              <dt className="text-[11px] font-medium uppercase tracking-[0.12em] text-slate-400">{term}</dt>
              <dd className="mt-1.5 text-[14px] text-slate-800">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section id="directory" className="mx-auto mt-28 max-w-5xl px-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-[26px] font-semibold tracking-[-0.02em] text-slate-900">Directory</h2>
            <p className="mt-1.5 text-[14px] text-slate-500">
              {loading
                ? "Loading indexed projects…"
                : visible.length === projects.length
                  ? projects.length + " projects indexed"
                  : "Showing " + visible.length + " of " + projects.length + " projects"}
            </p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Filter by game, engine or platform"
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-9 text-[13px] text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-slate-300 focus:ring-4 focus:ring-slate-900/5"
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

        <div className="mt-6 flex flex-wrap gap-1.5">
          {FILTERS.map((filter) => (
            <button
              key={filter.key}
              type="button"
              onClick={() => setActiveFilter(filter.key)}
              className={
                "rounded-full px-3.5 py-1.5 text-[12px] font-medium transition-all " +
                (activeFilter === filter.key
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900")
              }
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="hidden grid-cols-12 gap-4 border-b border-slate-200 bg-slate-50/70 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400 md:grid">
            <div className="col-span-5">Project</div>
            <div className="col-span-2">Stage</div>
            <div className="col-span-4">Hardware notes</div>
            <div className="col-span-1 text-right">Source</div>
          </div>

          {visible.length === 0 ? (
            <div className="px-6 py-16 text-center text-[14px] text-slate-500">
              No projects match this filter.
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {visible.map((project) => {
                const title = splitTitle(project.game_title || project.display_name);
                const expanded = expandedId === project.id;
                const selected = selectedProject?.id === project.id;
                return (
                  <li key={project.id} className={selected ? "bg-slate-50/60" : ""}>
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setExpandedId(expanded ? null : project.id)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          setExpandedId(expanded ? null : project.id);
                        }
                      }}
                      className="grid cursor-pointer grid-cols-1 gap-2.5 px-5 py-4 transition-colors hover:bg-slate-50/70 md:grid-cols-12 md:items-center md:gap-4"
                    >
                      <div className="md:col-span-5">
                        <span className="flex items-center gap-2.5">
                          <span className={"h-1.5 w-1.5 shrink-0 rounded-full " + (STAGE_DOT[String(project.current_stage)] || "bg-slate-400")} />
                          <span className="text-[15px] font-medium text-slate-900">{title.name}</span>
                        </span>
                        {title.engine && (
                          <span className="mt-1 block pl-4 font-mono text-[11px] uppercase tracking-[0.08em] text-slate-400">
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
                        <p className="line-clamp-2 text-[13px] leading-relaxed text-slate-500 md:line-clamp-1">
                          {project.performance_notes || project.playability_notes || "Tested on native hardware."}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 pl-4 md:col-span-1 md:justify-end md:pl-0">
                        {project.reddit_url && (
                          <a
                            href={project.reddit_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(event) => event.stopPropagation()}
                            title="Open the source discussion"
                            className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                        <ChevronDown
                          className={
                            "h-4 w-4 text-slate-300 transition-transform " + (expanded ? "rotate-180" : "")
                          }
                        />
                      </div>
                    </div>

                    {expanded && (
                      <div className="border-t border-slate-100 bg-slate-50/50 px-5 py-5">
                        <p className="max-w-3xl text-[14px] leading-relaxed text-slate-600">
                          {project.summary || "No summary recorded for this project yet."}
                        </p>

                        {project.technologies?.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-1.5">
                            {project.technologies.map((tech: string) => (
                              <span
                                key={tech}
                                className="rounded-md border border-slate-200 bg-white px-2 py-1 font-mono text-[11px] text-slate-500"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        )}

                        {project.playability_notes && (
                          <p className="mt-4 max-w-3xl text-[13px] leading-relaxed text-slate-500">
                            <span className="font-medium text-slate-700">Playability: </span>
                            {project.playability_notes}
                          </p>
                        )}

                        <div className="mt-5 flex flex-wrap items-center gap-3">
                          <button
                            type="button"
                            onClick={() => selectProject(project)}
                            className="rounded-lg bg-slate-900 px-3.5 py-2 text-[12px] font-medium text-white transition-colors hover:bg-slate-800"
                          >
                            Preview on hardware
                          </button>
                          {project.reddit_url && (
                            <a
                              href={project.reddit_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-[12px] font-medium text-slate-500 transition-colors hover:text-slate-900"
                            >
                              Open source discussion
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
              ["Verified", "Stage and performance notes are taken from reports by the people running the build."],
              ["Non-infringing", "Only discussion and source repositories are indexed. No ROMs, ISOs or game data are hosted."]
            ].map(([title, body]) => (
              <div key={title}>
                <p className="text-[13px] font-medium text-slate-800">{title}</p>
                <p className="mt-2 text-[13px] leading-relaxed text-slate-500">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="mx-auto mt-24 max-w-5xl border-t border-slate-200 px-6 py-10">
        <div className="flex flex-col items-start justify-between gap-5 text-[13px] text-slate-500 sm:flex-row sm:items-center">
          <p className="max-w-md leading-relaxed">
            VitaHarbor is an independent research index. Nothing here bypasses licensing
            or distributes copyrighted game data.
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

