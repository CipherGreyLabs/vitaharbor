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
  LayoutGrid,
  List,
  Sparkles,
  Flame,
  Gamepad2,
  Cpu,
  Layers,
  Terminal,
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

export const HomePage: React.FC = () => {
  useDocumentMeta({
    title: "PlayStation Vita Port & WIP Pipeline — VitaHarbor",
    description:
      "Centralized tracker for active PlayStation Vita ports and community decompilations from r/vitahacks and r/VitaPiracy before they reach VitaDB."
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
    <div className="space-y-16 pb-16">
      {/* 2026 Minimalist Hero Section */}
      <section className="relative pt-6 lg:pt-10 overflow-hidden">
        {/* Ambient subtle glow background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-cyan-500/10 blur-[130px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Column: Direct Human-Centered Value Proposition */}
            <div className="lg:col-span-7 space-y-7 text-left z-10">
              <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span>Monitoring r/vitahacks & r/VitaPiracy Live</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.08]">
                Every PS Vita port. <br />
                <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 bg-clip-text text-transparent">
                  Caught before VitaDB.
                </span>
              </h1>

              <p className="text-base text-slate-300 max-w-xl leading-relaxed">
                Homebrew port progress and decompilation milestones are scattered across Reddit discussions and GitHub branches. VitaHarbor tracks active work-in-progress ports, booting builds, and release milestones with verified links to original developer updates.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <a
                  href="#pipeline-ledger"
                  className="btn-action-primary"
                >
                  <Gamepad2 className="w-4 h-4" />
                  <span>Explore Port Pipeline</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
                <Link
                  to="/updates"
                  className="btn-action-secondary"
                >
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  <span>Latest Reddit Signals</span>
                </Link>
              </div>

              {/* Metrics Bar */}
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 pt-4 border-t border-white/10 max-w-lg">
                <div>
                  <div className="text-2xl font-bold font-mono text-white">
                    {projects.length || 18}
                  </div>
                  <div className="text-xs text-slate-400 font-medium mt-0.5">Ports Tracked</div>
                </div>
                <div>
                  <div className="text-2xl font-bold font-mono text-amber-400">
                    {projects.filter(p => ["in_game", "booting", "early_wip"].includes(p.current_stage)).length || 8}
                  </div>
                  <div className="text-xs text-slate-400 font-medium mt-0.5">Active WIPs</div>
                </div>
                <div>
                  <div className="text-2xl font-bold font-mono text-emerald-400">
                    {projects.filter(p => ["playable", "released"].includes(p.current_stage)).length || 10}
                  </div>
                  <div className="text-xs text-slate-400 font-medium mt-0.5">Playable +</div>
                </div>
                <div className="hidden sm:block">
                  <div className="text-2xl font-bold font-mono text-cyan-400">
                    {stats?.total_developers || 12}
                  </div>
                  <div className="text-xs text-slate-400 font-medium mt-0.5">Engineers</div>
                </div>
              </div>
            </div>

            {/* Right Column: High-Fidelity 3D Console Pedestal */}
            <div className="lg:col-span-5 relative flex items-center justify-center">
              <div className="relative w-full aspect-[1.25] max-w-[540px] rounded-2xl glass-card overflow-hidden p-2 shadow-2xl flex flex-col items-center justify-center">
                {/* 3D Scene Viewport */}
                <div className="w-full h-full min-h-[300px] relative">
                  <VitaConsoleScene selectedProject={selectedProject} />
                </div>

                {/* Pedestal Bottom Pill */}
                <div className="absolute bottom-3 inset-x-4 py-2 px-3 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    <span className="text-slate-300 font-semibold truncate">
                      {selectedProject?.game_title || "Select a port below"}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-white/10 text-cyan-300 uppercase text-[10px] font-semibold flex-shrink-0">
                    {selectedProject?.current_stage.replace('_', ' ') || "ACTIVE"}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Real-time Reddit Signal Stream */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-xl bg-[#0e1117] border border-white/10 p-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-2.5 flex-shrink-0 text-cyan-400 font-semibold text-xs tracking-wider uppercase font-mono">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
            </span>
            Latest Reddit Updates:
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
            <span>All Signals</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* Main Port Ledger & Pipeline Matrix */}
      <section id="pipeline-ledger" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Ledger Header & Search/Filter Bar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <div className="text-xs font-mono text-cyan-400 uppercase tracking-widest font-semibold">
              Live Database
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">
              Active Port & WIP Pipeline
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Select any project to inspect hardware framerates, decompilation notes, and real-time 3D display.
            </p>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode("table")}
              className={`p-2 rounded-lg border text-xs transition-colors ${
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
              className={`p-2 rounded-lg border text-xs transition-colors ${
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

        {/* Filter Chips & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Filter Pills */}
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

          {/* Search Input */}
          <div className="relative min-w-[260px] sm:w-72">
            <input
              type="text"
              placeholder="Search ports, engines, devs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0f131a] border border-white/10 rounded-full pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Render View: Table or Grid */}
        <div>
          {loading ? (
            <div className="glass-card p-12 text-center text-slate-400 font-mono text-sm">
              Loading port pipeline data...
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
            <div className="glass-card p-12 text-center text-slate-400 font-mono text-sm">
              No matching port projects found.
            </div>
          )}
        </div>
      </section>

      {/* Featured Community Engineers Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <div className="text-xs font-mono text-cyan-400 uppercase tracking-widest font-semibold">
              Ecosystem
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight mt-1">
              Active Homebrew Engineers
            </h2>
          </div>
          <Link
            to="/developers"
            className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            <span>All Engineers</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeDevs.slice(0, 6).map((dev) => (
            <DeveloperCard key={dev.id} developer={dev} />
          ))}
        </div>
      </section>
    </div>
  );
};

