import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { VitaConsoleScene, type SelectedProjectView } from "../components/3d/VitaConsoleScene";
import { PortMatrixTable } from "../components/projects/PortMatrixTable";
import { ProjectCard, type ProjectCardData } from "../components/projects/ProjectCard";
import { UpdateCard, type UpdateCardData } from "../components/updates/UpdateCard";
import { DeveloperCard, type DeveloperCardData } from "../components/developers/DeveloperCard";
import { apiGet } from "../lib/api";
import {
  Search,
  ArrowRight,
  ArrowUpRight,
  Clock,
  Terminal,
  LayoutGrid,
  List
} from "lucide-react";

interface StatsData {
  total_projects: number;
  active_projects: number;
  playable_or_better: number;
  released_projects: number;
  total_developers: number;
  recent_updates_count: number;
}

const QUICK_FILTERS = [
  { key: "all", label: "ALL PORTS" },
  { key: "released", label: "RELEASED" },
  { key: "playable", label: "PLAYABLE" },
  { key: "in_game", label: "IN-GAME" },
  { key: "booting", label: "BOOTING" },
  { key: "early_wip", label: "EARLY WIP" }
];

const HeroStat: React.FC<{ label: string; value: number | string; accent?: boolean }> = ({
  label,
  value,
  accent
}) => (
  <div>
    <div
      className={`font-mono text-2xl leading-none tracking-[-0.03em] tabular-nums ${
        accent ? "text-[#3ad2ff]" : "text-[#f4f6f8]"
      }`}
    >
      {value}
    </div>
    <div className="mt-1.5 font-mono text-[9px] tracking-[0.16em] text-[#5b636c] uppercase">
      {label}
    </div>
  </div>
);

export const HomePage: React.FC = () => {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [projects, setProjects] = useState<ProjectCardData[]>([]);
  const [recentUpdates, setRecentUpdates] = useState<UpdateCardData[]>([]);
  const [activeDevs, setActiveDevs] = useState<DeveloperCardData[]>([]);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [selectedProject, setSelectedProject] = useState<SelectedProjectView | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [newSinceLastVisit, setNewSinceLastVisit] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // "Since your last visit" check (Blueprint §82)
    try {
      const lastVisit = localStorage.getItem("vitaharbor_last_visit");
      const currentTimestamp = Date.now();
      localStorage.setItem("vitaharbor_last_visit", String(currentTimestamp));

      if (lastVisit) {
        const lastVisitDate = new Date(Number(lastVisit));
        apiGet<{ updates: UpdateCardData[] }>("/api/updates?limit=50", "updates")
          .then((data) => {
            if (data.updates) {
              const count = data.updates.filter(
                (u) => new Date(u.event_at).getTime() > lastVisitDate.getTime()
              ).length;
              if (count > 0) setNewSinceLastVisit(count);
            }
          })
          .catch(() => {});
      }
    } catch {
      // graceful fallback
    }

    async function loadHomeData() {
      try {
        const [statsRes, projectsRes, updatesRes, devsRes] = await Promise.all([
          apiGet<StatsData>("/api/stats").catch(() => null),
          apiGet<{ projects: ProjectCardData[] }>("/api/projects?limit=50", "projects").catch(
            () => ({ projects: [] })
          ),
          apiGet<{ updates: UpdateCardData[] }>("/api/updates?limit=6", "updates").catch(() => ({
            updates: []
          })),
          apiGet<{ developers: DeveloperCardData[] }>("/api/developers?limit=6", "developers").catch(
            () => ({ developers: [] })
          )
        ]);

        if (statsRes) setStats(statsRes);
        if (projectsRes?.projects && projectsRes.projects.length > 0) {
          setProjects(projectsRes.projects);
          // Set initial 3D display game
          const first = projectsRes.projects[0];
          setSelectedProject({
            id: first.id,
            game_title: first.game_title || first.display_name || "GTA: San Andreas",
            display_name: first.display_name || "GTA San Andreas Vita",
            current_stage: first.current_stage,
            performance_notes: first.performance_notes,
            playability_notes: first.playability_notes,
            technologies: first.technologies
          });
        }
        if (updatesRes?.updates) setRecentUpdates(updatesRes.updates);
        if (devsRes?.developers) setActiveDevs(devsRes.developers);
      } catch (e) {
        console.error("Failed to load home data", e);
      } finally {
        setLoading(false);
      }
    }
    loadHomeData();
  }, []);

  const filteredProjects = useMemo(() => {
    let list = projects;
    if (selectedFilter !== "all") {
      list = list.filter((p) => p.current_stage === selectedFilter);
    }
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.game_title?.toLowerCase().includes(term) ||
          p.display_name?.toLowerCase().includes(term) ||
          p.summary?.toLowerCase().includes(term) ||
          p.technologies?.some((t) => t.toLowerCase().includes(term)) ||
          p.developers?.some((d) => d.display_name.toLowerCase().includes(term))
      );
    }
    return list;
  }, [projects, selectedFilter, searchTerm]);

  const handleSelectProject = (p: ProjectCardData) => {
    setSelectedProject({
      id: p.id,
      game_title: p.game_title || p.display_name || "",
      display_name: p.display_name || "",
      current_stage: p.current_stage,
      performance_notes: p.performance_notes,
      playability_notes: p.playability_notes,
      technologies: p.technologies
    });
  };

  return (
    <div className="-mx-0 pb-2">
      {/* Hero stage: the console is the page */}
      <section className="relative isolate h-[560px] w-full overflow-hidden border-b border-[#1b1f24] sm:h-[600px] lg:h-[min(70vh,660px)]">
        <div className="absolute inset-0">
          <VitaConsoleScene selectedProject={selectedProject} />
        </div>

        {/* The scene carries its own scrims; these hairlines only mark the stage
            edges so the hero reads as a framed plate rather than a bleed. */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-2 bg-[repeating-linear-gradient(90deg,rgba(255,255,255,0.22)_0px,rgba(255,255,255,0.22)_1px,transparent_1px,transparent_28px)] opacity-25" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-2 bg-[repeating-linear-gradient(90deg,rgba(255,255,255,0.22)_0px,rgba(255,255,255,0.22)_1px,transparent_1px,transparent_28px)] opacity-25" />

        <div className="pointer-events-none absolute inset-0 z-20 mx-auto flex h-full max-w-7xl flex-col px-5 pt-9 pb-8 sm:px-6 lg:px-8">
          <div className="flex items-start justify-between gap-6 font-mono text-[10px] tracking-[0.18em] uppercase">
            <span className="flex items-center gap-2 text-[#dfe5ea]">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#3ad2ff] opacity-70" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#3ad2ff]" />
              </span>
              Signal feed active
              <span className="hidden text-[#5b636c] sm:inline">— r/vitahacks · r/VitaPiracy</span>
            </span>
            <span className="hidden text-right leading-relaxed text-[#5b636c] md:block">
              PS Vita port registry
              <br />
              zero ROMs hosted
            </span>
          </div>

          <div className="mt-auto w-full max-w-[500px] lg:max-w-[43%]">
            <p className="font-mono text-[10px] tracking-[0.24em] text-[#5b636c] uppercase">
              One hub for every port
            </p>
            <h1 className="mt-4 text-[40px] leading-[0.94] font-semibold tracking-[-0.035em] text-[#f7f9fa] sm:text-[50px] lg:text-[54px] xl:text-[58px]">
              Every Vita port.
              <span className="block text-[#71797f]">One verified ledger.</span>
            </h1>
            <p className="mt-5 max-w-[430px] text-[13px] leading-relaxed text-[#a3acb5]">
              Port news lives scattered across r/vitahacks and r/VitaPiracy threads. This is the
              record: current stage, hardware notes, engine and the engineer behind every
              PlayStation Vita port — always linked back to the original post.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                to="/projects"
                className="pointer-events-auto group inline-flex items-center gap-2 bg-[#3ad2ff] px-5 py-2.5 font-mono text-[11px] font-semibold tracking-[0.12em] text-[#05070a] uppercase transition-colors hover:bg-[#8ce6ff]"
              >
                Open the port ledger
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                to="/about"
                className="pointer-events-auto inline-flex items-center gap-2 border border-[#2c313a] px-5 py-2.5 font-mono text-[11px] tracking-[0.12em] text-[#cdd4da] uppercase transition-colors hover:border-[#3ad2ff] hover:text-[#f4f6f8]"
              >
                How verification works
              </Link>
            </div>

            <div className="mt-9 grid max-w-[520px] grid-cols-2 gap-x-8 gap-y-5 border-t border-[#242830] pt-6 sm:grid-cols-4 sm:gap-x-4">
              <HeroStat label="Ports tracked" value={stats?.total_projects ?? 24} />
              <HeroStat label="Playable +" value={stats?.playable_or_better ?? 21} accent />
              <HeroStat label="Released" value={stats?.released_projects ?? 15} />
              <HeroStat label="Engineers" value={stats?.total_developers ?? 7} />
            </div>
          </div>
        </div>
      </section>

      {/* Newest-signal ticker */}
      <section className="border-b border-[#1b1f24] bg-[#0b0d0f]">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-5 py-3 font-mono text-[10px] sm:px-6 lg:px-8">
          <span className="flex flex-shrink-0 items-center gap-2 tracking-[0.18em] text-[#3ad2ff] uppercase">
            <Terminal className="h-3 w-3" />
            Newest
          </span>
          <div className="flex min-w-0 flex-1 items-center gap-5 overflow-hidden">
            {recentUpdates.slice(0, 3).map((u) => (
              <Link
                key={u.id}
                to={u.project_slug ? `/projects/${u.project_slug}` : "/updates"}
                className="flex min-w-0 items-center gap-2 text-[#a3acb5] transition-colors hover:text-[#f4f6f8]"
              >
                <span className="h-1 w-1 flex-shrink-0 rounded-full bg-[#343a42]" />
                <span className="hidden truncate sm:inline">{u.title}</span>
              </Link>
            ))}
            {recentUpdates.length === 0 && (
              <span className="text-[#5b636c]">awaiting first sync…</span>
            )}
          </div>
          <Link
            to="/updates"
            className="hidden flex-shrink-0 items-center gap-1 tracking-[0.18em] text-[#5b636c] uppercase transition-colors hover:text-[#3ad2ff] sm:flex"
          >
            All signals
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-14 px-5 py-12 sm:px-6 lg:px-8">
      <section className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#1b1f24] pb-4">
          <div>
            <p className="font-mono text-[10px] tracking-[0.22em] text-[#5b636c] uppercase">
              Ledger
            </p>
            <h2 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-[#f4f6f8] sm:text-2xl">
              Port compatibility matrix
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 font-mono text-[10px] tracking-[0.14em] text-[#5b636c] uppercase">
            <span>
              <strong className="text-[#f4f6f8]">{filteredProjects.length}</strong> shown
            </span>
            <span>
              <strong className="text-[#10b981]">{stats?.playable_or_better ?? 21}</strong> playable+
            </span>
            <span className="hidden lg:inline">select a row to load it onto the console</span>
          </div>
        </div>

        {/* Search Bar & Stage Switchers */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search ports (e.g. San Andreas, Max Payne, TheFloW, ARMv7)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-[#242830] bg-transparent py-2 pl-9 pr-4 font-mono text-xs text-[#f4f6f8] transition-colors placeholder-[#5f676f] focus:border-[#3ad2ff] focus:outline-none"
            />
            <Search className="w-3.5 h-3.5 text-[#5f676f] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
            {QUICK_FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setSelectedFilter(f.key)}
                className={`flex-shrink-0 border px-2.5 py-1 font-mono text-[10px] tracking-[0.12em] uppercase transition-colors ${
                  selectedFilter === f.key
                    ? "border-[#3ad2ff] bg-[#3ad2ff] font-semibold text-[#05070a]"
                    : "border-[#242830] text-[#8f979f] hover:border-[#343a42] hover:text-[#f4f6f8]"
                }`}
              >
                {f.label}
              </button>
            ))}

            {/* View Mode Toggle */}
            <div className="ml-2 hidden items-center gap-1 border-l border-[#242830] pl-2 sm:flex">
              <button
                onClick={() => setViewMode("table")}
                className={`border p-1.5 transition-colors ${
                  viewMode === "table" ? "border-[#3ad2ff] bg-[#3ad2ff] text-[#05070a]" : "border-transparent text-[#7c848d] hover:text-white"
                }`}
                title="Table Ledger View"
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`border p-1.5 transition-colors ${
                  viewMode === "grid" ? "border-[#3ad2ff] bg-[#3ad2ff] text-[#05070a]" : "border-transparent text-[#7c848d] hover:text-white"
                }`}
                title="Card Grid View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* "Since your last visit" notice */}
        {newSinceLastVisit !== null && newSinceLastVisit > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-2 border border-[#3ad2ff]/35 bg-[#3ad2ff]/[0.04] px-3.5 py-2 font-mono text-[11px] text-[#7fe3ff]">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>
                {newSinceLastVisit} new development update
                {newSinceLastVisit > 1 ? "s" : ""} logged since your previous visit
              </span>
            </span>
            <Link to="/updates" className="inline-flex items-center gap-1 hover:text-white">
              Inspect events
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        )}
      </section>

      {/* Main Compatibility & Development Ledger Table */}
      <section>
        {loading ? (
          <div className="border border-[#242830] p-8 text-center font-mono text-xs text-[#7c848d] animate-pulse">
            LOADING PORT LEDGER...
          </div>
        ) : filteredProjects.length > 0 ? (
          viewMode === "table" ? (
            <PortMatrixTable
              projects={filteredProjects}
              selectedId={selectedProject?.id}
              onSelectProject={handleSelectProject}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredProjects.map((p) => (
                <div key={p.id} onClick={() => handleSelectProject(p)}>
                  <ProjectCard project={p} />
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="border border-[#242830] p-12 text-center font-mono text-xs text-[#7c848d]">
            NO MATCHING PORTS FOUND
          </div>
        )}
      </section>

      {/* Live Stream & Developers Grid */}
      <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-3 lg:gap-10">
        {/* Recent Milestone Signals */}
        <div className="space-y-4 lg:col-span-2">
          <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[#1b1f24] pb-3">
            <div>
              <p className="font-mono text-[10px] tracking-[0.22em] text-[#5b636c] uppercase">
                Signal stream
              </p>
              <h2 className="mt-1.5 text-lg font-semibold tracking-[-0.02em] text-[#f4f6f8]">
                Latest milestone evidence
              </h2>
            </div>
            <Link
              to="/updates"
              className="inline-flex items-center gap-1 font-mono text-[11px] text-[#3ad2ff] hover:text-[#8ce6ff]"
            >
              All signals
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {recentUpdates.map((u) => (
              <UpdateCard key={u.id} update={u} />
            ))}
          </div>
        </div>

        {/* Reverse Engineers */}
        <div className="space-y-4">
          <div className="flex items-end justify-between gap-3 border-b border-[#1b1f24] pb-3">
            <div>
              <p className="font-mono text-[10px] tracking-[0.22em] text-[#5b636c] uppercase">
                People
              </p>
              <h2 className="mt-1.5 text-lg font-semibold tracking-[-0.02em] text-[#f4f6f8]">
                Reverse engineers
              </h2>
            </div>
            <Link
              to="/developers"
              className="inline-flex items-center gap-1 font-mono text-[11px] text-[#3ad2ff] hover:text-[#8ce6ff]"
            >
              Directory
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {activeDevs.map((d) => (
              <DeveloperCard key={d.id} developer={d} />
            ))}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};
