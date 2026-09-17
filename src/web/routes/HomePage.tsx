import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { VitaConsoleScene, type SelectedProjectView } from "../components/3d/VitaConsoleScene";
import { PortMatrixTable } from "../components/projects/PortMatrixTable";
import { ProjectCard, type ProjectCardData } from "../components/projects/ProjectCard";
import { UpdateCard, type UpdateCardData } from "../components/updates/UpdateCard";
import { DeveloperCard, type DeveloperCardData } from "../components/developers/DeveloperCard";
import { apiGet } from "../lib/api";
import { useDocumentMeta } from "../lib/useDocumentMeta";
import {
  Search,
  ArrowRight,
  ArrowUpRight,
  Clock,
  Terminal,
  LayoutGrid,
  List,
  ExternalLink
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
  { key: "all", label: "All Ports" },
  { key: "in_game", label: "In-Game" },
  { key: "booting", label: "Booting" },
  { key: "early_wip", label: "Early WIP" },
  { key: "playable", label: "Playable" },
  { key: "released", label: "Released" }
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
    <div className="mt-1.5 font-mono text-[9px] tracking-[0.16em] text-[#8a9199] uppercase">
      {label}
    </div>
  </div>
);

export const HomePage: React.FC = () => {
  useDocumentMeta({
    title: "PlayStation Vita Port & WIP Pipeline — VitaHarbor",
    description:
      "Every active PlayStation Vita port and decompilation project in one verified ledger: live 3D console screen, hardware notes, and direct Reddit source links."
  });

  const [stats, setStats] = useState<StatsData | null>(null);
  const [projects, setProjects] = useState<ProjectCardData[]>([]);
  const [recentUpdates, setRecentUpdates] = useState<UpdateCardData[]>([]);
  const [activeDevs, setActiveDevs] = useState<DeveloperCardData[]>([]);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [selectedProject, setSelectedProject] = useState<SelectedProjectView | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
          const first = projectsRes.projects[0];
          setSelectedProject({
            id: first.id,
            game_title: first.game_title || first.display_name || "Medal of Honor: Allied Assault",
            display_name: first.display_name || "OpenMoHAA Vita",
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
    <div className="-mx-0 pb-6 space-y-12">
      {/* Big Cinematic 3D Vita Hero Stage */}
      <section className="relative isolate flex w-full flex-col overflow-hidden border-b border-white/10 lg:block lg:h-[min(74vh,700px)]">
        {/* Full-width 3D Console Stage */}
        <div className="relative order-2 aspect-[1.35] w-full overflow-hidden lg:absolute lg:inset-0 lg:order-none lg:aspect-auto lg:h-full">
          <VitaConsoleScene selectedProject={selectedProject} />

          {/* Subtly framed edge gradients */}
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-3 bg-gradient-to-b from-[#060709] to-transparent opacity-80" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-3 bg-gradient-to-t from-[#060709] to-transparent opacity-80" />
        </div>

        {/* Hero Overlay Copy */}
        <div className="pointer-events-none relative z-20 order-1 mx-auto flex w-full max-w-7xl flex-col px-5 pt-8 pb-9 sm:px-6 lg:absolute lg:inset-0 lg:order-none lg:h-full lg:px-8 lg:pt-10 lg:pb-8">
          <div className="flex items-start justify-between gap-6 font-mono text-[11px] tracking-widest uppercase">
            <span className="flex items-center gap-2 text-white">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#3ad2ff] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#3ad2ff]" />
              </span>
              Signal feed active
              <span className="hidden text-slate-400 sm:inline">— r/vitahacks · r/VitaPiracy</span>
            </span>
            <span className="hidden text-right leading-relaxed text-slate-400 md:block font-mono text-[10px]">
              PS Vita Port Pipeline
              <br />
              Caught before VitaDB
            </span>
          </div>

          <div className="mt-8 w-full max-w-[540px] lg:mt-auto lg:max-w-[46%] pb-4">
            <p className="font-mono text-xs tracking-widest text-cyan-400 uppercase font-semibold">
              Live Homebrew Tracker
            </p>
            <h1 className="mt-3 text-[42px] leading-[0.96] font-bold tracking-tight text-white sm:text-[52px] lg:text-[58px]">
              Every Vita port.
              <span className="block text-slate-400">Caught before VitaDB.</span>
            </h1>
            <p className="mt-4 max-w-[460px] text-[13px] leading-relaxed text-slate-300">
              Community decompilations and ports live scattered across r/vitahacks and r/VitaPiracy before they ever hit VitaDB. VitaHarbor monitors homebrew discussions, tracking playable milestones, booting builds, and active WIPs directly back to their source threads.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a
                href="#pipeline-matrix"
                className="pointer-events-auto btn-action-primary"
              >
                <span>Open the port ledger</span>
                <ArrowRight className="h-4 w-4" />
              </a>
              <Link
                to="/about"
                className="pointer-events-auto btn-action-secondary"
              >
                <span>Methodology</span>
              </Link>
            </div>

            <div className="mt-8 grid max-w-[520px] grid-cols-2 gap-x-6 gap-y-4 border-t border-white/10 pt-5 sm:grid-cols-4 sm:gap-x-4">
              <HeroStat label="Ports tracked" value={projects.length || 18} />
              <HeroStat label="Active WIPs" value={projects.filter(p => ["in_game", "booting", "early_wip"].includes(p.current_stage)).length || 8} accent />
              <HeroStat label="Playable +" value={projects.filter(p => ["playable", "released"].includes(p.current_stage)).length || 9} />
              <HeroStat label="Engineers" value={stats?.total_developers ?? 12} />
            </div>
          </div>
        </div>
      </section>

      {/* Real-time Reddit Signal Stream */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-xl bg-[#0e1117] border border-white/10 p-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-2.5 flex-shrink-0 text-cyan-400 font-semibold text-xs tracking-wider uppercase font-mono">
            <Terminal className="h-3.5 w-3.5" />
            <span>Latest Reddit Signals:</span>
          </div>

          <div className="flex items-center gap-4 overflow-x-auto no-scrollbar w-full text-xs">
            {recentUpdates.slice(0, 3).map((u) => (
              <a
                key={u.id}
                href={u.sources?.[0]?.canonical_url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-slate-300 hover:text-cyan-300 transition-colors whitespace-nowrap group"
              >
                <span className="text-slate-500">•</span>
                <span className="font-medium group-hover:underline">{u.title}</span>
                <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-cyan-400" />
              </a>
            ))}
          </div>

          <Link
            to="/updates"
            className="text-xs font-mono text-cyan-400 hover:text-cyan-300 whitespace-nowrap flex items-center gap-1 flex-shrink-0"
          >
            <span>All signals</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>

      {/* Main Port Ledger Table Section */}
      <div id="pipeline-matrix" className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
        <section className="space-y-5">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <p className="font-mono text-xs tracking-widest text-cyan-400 uppercase font-semibold">
                Live Database
              </p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Active Port & WIP Pipeline
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 font-mono text-xs text-slate-400">
              <span>
                <strong className="text-white">{filteredProjects.length}</strong> shown
              </span>
              <span>
                <strong className="text-emerald-400">{projects.filter(p => ["playable", "released"].includes(p.current_stage)).length || 9}</strong> playable+
              </span>
              <span className="hidden lg:inline text-slate-500">click any row to load into the 3D console</span>
            </div>
          </div>

          {/* Filter Capsules & Search Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              {QUICK_FILTERS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setSelectedFilter(f.key)}
                  className="chip-pill"
                  data-active={selectedFilter === f.key}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <div className="relative flex-1 sm:w-72">
                <input
                  type="text"
                  placeholder="Search ports, engines, devs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#0f131a] border border-white/10 rounded-full pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* View Toggle */}
              <div className="hidden sm:flex items-center gap-1 border-l border-white/10 pl-3">
                <button
                  onClick={() => setViewMode("table")}
                  className={`p-1.5 rounded-lg border text-xs transition-colors ${
                    viewMode === "table"
                      ? "bg-cyan-500 text-slate-950 border-cyan-400 font-semibold"
                      : "bg-white/5 border-white/10 text-slate-300 hover:text-white"
                  }`}
                  title="Matrix Table View"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-lg border text-xs transition-colors ${
                    viewMode === "grid"
                      ? "bg-cyan-500 text-slate-950 border-cyan-400 font-semibold"
                      : "bg-white/5 border-white/10 text-slate-300 hover:text-white"
                  }`}
                  title="Card Grid View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Main Matrix Table */}
        <section>
          {loading ? (
            <div className="glass-card p-12 text-center text-slate-400 font-mono text-xs animate-pulse">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProjects.map((p) => (
                  <div key={p.id} onClick={() => handleSelectProject(p)}>
                    <ProjectCard project={p} />
                  </div>
                ))}
              </div>
            )
          ) : (
            <div className="glass-card p-12 text-center text-slate-400 font-mono text-xs">
              NO MATCHING PORTS FOUND
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

