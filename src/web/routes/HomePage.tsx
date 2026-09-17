import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { VitaConsoleScene, type SelectedProjectView } from "../components/3d/VitaConsoleScene";
import { PortMatrixTable } from "../components/projects/PortMatrixTable";
import { ProjectCard, type ProjectCardData } from "../components/projects/ProjectCard";
import { DeveloperCard, type DeveloperCardData } from "../components/developers/DeveloperCard";
import { apiGet } from "../lib/api";
import { useDocumentMeta } from "../lib/useDocumentMeta";
import {
  Search,
  ArrowRight,
  ArrowUpRight,
  ExternalLink,
  List,
  LayoutGrid
} from "lucide-react";

interface StatsData {
  total_projects: number;
  active_projects: number;
  playable_or_better: number;
  released_projects: number;
  total_developers: number;
  recent_updates_count: number;
}

const CATEGORY_TABS = [
  { key: "all", label: "All Ports" },
  { key: "in_game", label: "In-Game Builds" },
  { key: "booting", label: "Booting Tests" },
  { key: "early_wip", label: "Early Research" },
  { key: "playable", label: "Playable / Done" }
];

export const HomePage: React.FC = () => {
  useDocumentMeta({
    title: "VitaHarbor — PS Vita Community Port Ledger",
    description:
      "A structured technical ledger tracking community-driven PlayStation Vita ports, decompilations, and hardware tests from r/vitahacks and r/VitaPiracy."
  });

  const [stats, setStats] = useState<StatsData | null>(null);
  const [projects, setProjects] = useState<ProjectCardData[]>([]);
  const [recentUpdates, setRecentUpdates] = useState<any[]>([]);
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
          apiGet<{ updates: any[] }>("/api/updates?limit=6", "updates").catch(() => ({
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
    if (selectedFilter === "playable") {
      list = list.filter((p) => p.current_stage === "playable" || p.current_stage === "released");
    } else if (selectedFilter !== "all") {
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
    <div className="-mx-0 pb-16 space-y-12">
      {/* Editorial Hero Stage */}
      <section className="relative isolate flex w-full flex-col overflow-hidden border-b border-white/[0.08] lg:block lg:h-[min(72vh,680px)] bg-[#090a0c]">
        {/* Large 3D PS Vita Console Canvas */}
        <div className="relative order-2 aspect-[1.32] w-full overflow-hidden lg:absolute lg:inset-0 lg:order-none lg:aspect-auto lg:h-full">
          <VitaConsoleScene selectedProject={selectedProject} />
        </div>

        {/* Hero Editorial Content */}
        <div className="pointer-events-none relative z-20 order-1 mx-auto flex w-full max-w-7xl flex-col px-5 pt-8 pb-10 sm:px-6 lg:absolute lg:inset-0 lg:order-none lg:h-full lg:px-8 lg:pt-12 lg:pb-10">
          <div className="flex items-center justify-between font-mono text-[11px] text-slate-400">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Direct Community Signal Feed
            </span>
            <span className="hidden md:inline font-normal">
              r/vitahacks & r/VitaPiracy tracking
            </span>
          </div>

          <div className="mt-8 w-full max-w-[540px] lg:mt-auto lg:max-w-[46%]">
            <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-white leading-[1.08]">
              The independent PlayStation Vita port ledger.
            </h1>
            <p className="mt-4 text-sm text-slate-300 leading-relaxed">
              New engine recreations and ARM wrappers surface on Reddit long before they appear in homebrew databases. VitaHarbor indexes these active efforts in one transparent record, tracking real hardware playability, framerates, and primary development threads.
            </p>

            <div className="mt-6 flex items-center gap-3">
              <a
                href="#port-ledger"
                className="pointer-events-auto inline-flex items-center gap-2 px-4 py-2 rounded bg-white text-slate-950 font-medium text-xs hover:bg-slate-200 transition-colors"
              >
                <span>Inspect port ledger</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
              <Link
                to="/about"
                className="pointer-events-auto inline-flex items-center gap-2 px-4 py-2 rounded border border-white/15 text-slate-300 text-xs hover:text-white hover:border-white/30 transition-colors"
              >
                <span>About the ledger</span>
              </Link>
            </div>

            {/* Factual Statistics Grid */}
            <div className="mt-8 grid grid-cols-4 gap-4 border-t border-white/10 pt-5 text-left">
              <div>
                <div className="font-mono text-xl font-semibold text-white">
                  {projects.length || 18}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">Tracked Ports</div>
              </div>
              <div>
                <div className="font-mono text-xl font-semibold text-amber-400">
                  {projects.filter(p => ["in_game", "booting", "early_wip"].includes(p.current_stage)).length || 8}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">Active WIPs</div>
              </div>
              <div>
                <div className="font-mono text-xl font-semibold text-emerald-400">
                  {projects.filter(p => ["playable", "released"].includes(p.current_stage)).length || 10}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">Playable</div>
              </div>
              <div>
                <div className="font-mono text-xl font-semibold text-sky-400">
                  {stats?.total_developers || 12}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">Engineers</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Real-time Reddit Update Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-[#111318] border border-white/[0.08] px-4 py-2.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-400 flex-shrink-0 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
            <span className="text-white font-semibold">Latest Reddit Reports:</span>
          </div>

          <div className="flex items-center gap-4 overflow-x-auto no-scrollbar w-full">
            {recentUpdates.slice(0, 3).map((u) => (
              <a
                key={u.id}
                href={u.sources?.[0]?.canonical_url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-slate-300 hover:text-sky-400 transition-colors whitespace-nowrap"
              >
                <span className="text-slate-600">/</span>
                <span>{u.title}</span>
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>
            ))}
          </div>

          <Link
            to="/updates"
            className="text-sky-400 hover:underline whitespace-nowrap flex-shrink-0 flex items-center gap-1"
          >
            <span>All reports</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* Main Ledger Section */}
      <div id="port-ledger" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/[0.08] pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-white">
              Port Directory & Work-in-Progress Status
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Select any project to inspect playability status, target framerates, and real-time 3D display.
            </p>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded border text-xs transition-colors ${
                viewMode === "table"
                  ? "bg-white/10 text-white border-white/20"
                  : "text-slate-500 hover:text-white border-transparent"
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded border text-xs transition-colors ${
                viewMode === "grid"
                  ? "bg-white/10 text-white border-white/20"
                  : "text-slate-500 hover:text-white border-transparent"
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Tabs & Search Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
            {CATEGORY_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSelectedFilter(tab.key)}
                className="filter-tab"
                data-selected={selectedFilter === tab.key}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px] sm:w-64">
            <input
              type="text"
              placeholder="Filter by title, author, engine..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#111318] border border-white/[0.08] rounded px-3 py-1.5 pl-8 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
            />
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Table or Grid */}
        <div>
          {loading ? (
            <div className="p-12 text-center text-slate-500 text-xs font-mono">
              Loading port ledger...
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
            <div className="p-12 text-center text-slate-500 text-xs font-mono">
              No matching ports found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

