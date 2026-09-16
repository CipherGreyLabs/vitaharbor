import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ProjectCard, type ProjectCardData } from "../components/projects/ProjectCard";
import { UpdateCard, type UpdateCardData } from "../components/updates/UpdateCard";
import { DeveloperCard, type DeveloperCardData } from "../components/developers/DeveloperCard";
import { Search, ArrowRight, Clock, Radio, Terminal, Cpu } from "lucide-react";

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
  const [newSinceLastVisit, setNewSinceLastVisit] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
          fetch("/api/updates?limit=5").then((r) =>
            r.ok ? (r.json() as Promise<{ updates: UpdateCardData[] }>) : { updates: [] }
          ),
          fetch("/api/developers?limit=6").then((r) =>
            r.ok ? (r.json() as Promise<{ developers: DeveloperCardData[] }>) : { developers: [] }
          )
        ]);

        if (statsRes) setStats(statsRes);
        if (projectsRes?.projects) setProjects(projectsRes.projects);
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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/projects?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const filteredProjects = useMemo(() => {
    if (selectedFilter === "all") return projects;
    return projects.filter((p) => p.current_stage === selectedFilter);
  }, [projects, selectedFilter]);

  return (
    <div className="space-y-8">
      {/* Precision Hardware Status Strip (Blueprint §70 & §71) */}
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
              PORTS: <strong className="text-[#f1f5f9]">{stats?.total_projects ?? "24"}</strong>
            </span>
            <span>
              PLAYABLE+: <strong className="text-[#10b981]">{stats?.playable_or_better ?? "21"}</strong>
            </span>
            <span>
              DEVS: <strong className="text-[#00b4d8]">{stats?.total_developers ?? "7"}</strong>
            </span>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <input
              type="text"
              placeholder="Filter or search ports (e.g. San Andreas, TheFloW, ARMv7, Fallout)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#040608] border border-[#1a2332] rounded-[2px] pl-9 pr-4 py-1.5 text-xs text-[#f1f5f9] font-mono placeholder-[#64748b] focus:outline-none focus:border-[#00f0ff] transition-all"
            />
            <Search className="w-3.5 h-3.5 text-[#64748b] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </form>

          {/* Quick Filter Switcher */}
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
          </div>
        </div>

        {/* "Since your last visit" banner */}
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

      {/* Main Content Grid: Projects on Left, Live Signals & Devs on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2 Columns: Project Ledger */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-baseline justify-between border-b border-[#1a2332] pb-1.5">
            <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-[#f1f5f9] flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-[#00f0ff]" />
              <span>TRACKED PORT REGISTRY ({filteredProjects.length})</span>
            </h2>
            <Link
              to="/projects"
              className="font-mono text-[11px] text-[#00b4d8] hover:text-[#00f0ff] inline-flex items-center gap-1"
            >
              <span>Full directory</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="terminal-card p-4 h-32 animate-pulse bg-[#0d131b]" />
              ))}
            </div>
          ) : filteredProjects.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredProjects.map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
          ) : (
            <div className="terminal-panel p-8 text-center font-mono text-xs text-[#64748b]">
              No ports matching stage: {selectedFilter.toUpperCase()}
            </div>
          )}
        </div>

        {/* Right Column: Live Development Signals & Engineers */}
        <div className="space-y-6">
          {/* Recent Signals */}
          <div className="space-y-3">
            <div className="flex items-baseline justify-between border-b border-[#1a2332] pb-1.5">
              <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-[#f1f5f9] flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-[#10b981]" />
                <span>MILESTONE STREAM</span>
              </h2>
              <Link
                to="/updates"
                className="font-mono text-[11px] text-[#00b4d8] hover:text-[#00f0ff]"
              >
                Feed →
              </Link>
            </div>

            <div className="space-y-2.5">
              {recentUpdates.map((u) => (
                <UpdateCard key={u.id} update={u} />
              ))}
            </div>
          </div>

          {/* Active Reverse Engineers */}
          <div className="space-y-3">
            <div className="flex items-baseline justify-between border-b border-[#1a2332] pb-1.5">
              <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-[#f1f5f9]">
                PORT DEVELOPERS
              </h2>
              <Link
                to="/developers"
                className="font-mono text-[11px] text-[#00b4d8] hover:text-[#00f0ff]"
              >
                All →
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
    </div>
  );
};

