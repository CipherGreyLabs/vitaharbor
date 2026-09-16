import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { VitaConsoleScene, type SelectedProjectView } from "../components/3d/VitaConsoleScene";
import { PortMatrixTable } from "../components/projects/PortMatrixTable";
import { ProjectCard, type ProjectCardData } from "../components/projects/ProjectCard";
import { UpdateCard, type UpdateCardData } from "../components/updates/UpdateCard";
import { DeveloperCard, type DeveloperCardData } from "../components/developers/DeveloperCard";
import { Search, ArrowRight, Clock, Radio, Terminal, Cpu, LayoutGrid, List } from "lucide-react";

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
        fetch("/api/updates?limit=50")
          .then((r) => r.json() as Promise<{ updates: UpdateCardData[] }>)
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
          fetch("/api/stats").then((r) => (r.ok ? (r.json() as Promise<StatsData>) : null)),
          fetch("/api/projects?limit=50").then((r) =>
            r.ok ? (r.json() as Promise<{ projects: ProjectCardData[] }>) : { projects: [] }
          ),
          fetch("/api/updates?limit=6").then((r) =>
            r.ok ? (r.json() as Promise<{ updates: UpdateCardData[] }>) : { updates: [] }
          ),
          fetch("/api/developers?limit=6").then((r) =>
            r.ok ? (r.json() as Promise<{ developers: DeveloperCardData[] }>) : { developers: [] }
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
    <div className="space-y-6">
      {/* 3D Interactive WebGL PS Vita Viewport (Awwwards 3D Experience) */}
      <div className="border border-[#1a2332] rounded-[2px] overflow-hidden shadow-2xl">
        <VitaConsoleScene selectedProject={selectedProject} />
      </div>

      {/* Hardware Status & Command Strip */}
      <section className="terminal-panel p-3.5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 text-[10px] font-mono border-b border-[#1a2332] pb-2.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[#00f0ff] font-bold tracking-wider uppercase">
              <Radio className="w-3 h-3 animate-pulse" />
              <span>RADAR // DISCOVERY ACTIVE</span>
            </span>
            <span className="text-[#29374e]">|</span>
            <span className="text-[#94a3b8]">SOURCES: r/vitahacks · r/VitaPiracy</span>
          </div>

          <div className="flex items-center gap-3 text-[#64748b]">
            <span>
              TOTAL: <strong className="text-[#f1f5f9]">{stats?.total_projects ?? "24"}</strong>
            </span>
            <span>
              PLAYABLE+: <strong className="text-[#10b981]">{stats?.playable_or_better ?? "21"}</strong>
            </span>
            <span>
              REVERSE ENGINEERS: <strong className="text-[#00b4d8]">{stats?.total_developers ?? "7"}</strong>
            </span>
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
              className="w-full bg-[#040608] border border-[#1a2332] rounded-[2px] pl-9 pr-4 py-1.5 text-xs text-[#f1f5f9] font-mono placeholder-[#64748b] focus:outline-none focus:border-[#00f0ff] transition-all"
            />
            <Search className="w-3.5 h-3.5 text-[#64748b] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
            {QUICK_FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setSelectedFilter(f.key)}
                className={`font-mono text-[10px] uppercase tracking-wider px-2 py-1 rounded-[2px] border transition-colors flex-shrink-0 ${
                  selectedFilter === f.key
                    ? "bg-[#00b4d8] text-[#040608] font-bold border-[#00f0ff]"
                    : "bg-[#040608] text-[#94a3b8] border-[#1a2332] hover:text-[#f1f5f9] hover:border-[#29374e]"
                }`}
              >
                {f.label}
              </button>
            ))}

            {/* View Mode Toggle */}
            <div className="hidden sm:flex items-center ml-2 border-l border-[#1a2332] pl-2 gap-1">
              <button
                onClick={() => setViewMode("table")}
                className={`p-1 rounded-[2px] border ${
                  viewMode === "table" ? "bg-[#00b4d8] text-[#040608] border-[#00f0ff]" : "text-[#64748b] border-transparent hover:text-white"
                }`}
                title="Table Ledger View"
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1 rounded-[2px] border ${
                  viewMode === "grid" ? "bg-[#00b4d8] text-[#040608] border-[#00f0ff]" : "text-[#64748b] border-transparent hover:text-white"
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
          <div className="bg-[#040608] border border-[#00b4d8]/40 px-3 py-1.5 rounded-[2px] flex items-center justify-between text-[11px] font-mono text-[#00f0ff]">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>{newSinceLastVisit} new development update{newSinceLastVisit > 1 ? "s" : ""} logged since your previous visit</span>
            </span>
            <Link to="/updates" className="text-xs underline hover:text-white">
              Inspect events →
            </Link>
          </div>
        )}
      </section>

      {/* Main Compatibility & Development Ledger Table */}
      <section className="space-y-3">
        <div className="flex items-baseline justify-between border-b border-[#1a2332] pb-1.5">
          <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-[#f1f5f9] flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-[#00f0ff]" />
            <span>PORT COMPATIBILITY & PROGRESS MATRIX ({filteredProjects.length})</span>
          </h2>
          <span className="font-mono text-[10px] text-[#64748b]">
            SELECT ROW TO INSPECT ON 3D VITA
          </span>
        </div>

        {loading ? (
          <div className="terminal-panel p-8 text-center font-mono text-xs text-[#64748b] animate-pulse">
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
          <div className="terminal-panel p-12 text-center font-mono text-xs text-[#64748b]">
            NO MATCHING PORTS FOUND
          </div>
        )}
      </section>

      {/* Live Stream & Developers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start pt-4 border-t border-[#1a2332]">
        {/* Recent Milestone Signals */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-baseline justify-between border-b border-[#1a2332] pb-1.5">
            <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-[#f1f5f9] flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-[#10b981]" />
              <span>LIVE EVIDENCE STREAM (r/vitahacks · r/VitaPiracy)</span>
            </h2>
            <Link
              to="/updates"
              className="font-mono text-[11px] text-[#00b4d8] hover:text-[#00f0ff] inline-flex items-center gap-1"
            >
              <span>All events</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {recentUpdates.map((u) => (
              <UpdateCard key={u.id} update={u} />
            ))}
          </div>
        </div>

        {/* Reverse Engineers */}
        <div className="space-y-3">
          <div className="flex items-baseline justify-between border-b border-[#1a2332] pb-1.5">
            <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-[#f1f5f9]">
              ACTIVE REVERSE ENGINEERS
            </h2>
            <Link
              to="/developers"
              className="font-mono text-[11px] text-[#00b4d8] hover:text-[#00f0ff]"
            >
              Directory →
            </Link>
          </div>

          <div className="space-y-2">
            {activeDevs.map((d) => (
              <DeveloperCard key={d.id} developer={d} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

