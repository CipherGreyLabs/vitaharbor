import React, { useState, useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { VitaConsoleScene, type SelectedProjectView } from "../components/3d/VitaConsoleScene";
import { apiGet } from "../lib/api";
import { useDocumentMeta } from "../lib/useDocumentMeta";
import {
  Search,
  ExternalLink,
  ChevronRight,
  ArrowUpRight
} from "lucide-react";

interface StatsData {
  total_projects: number;
  active_projects: number;
  playable_or_better: number;
}

const CATEGORY_TABS = [
  { key: "all", label: "All Ports" },
  { key: "wip", label: "In Development" },
  { key: "playable", label: "Playable" },
  { key: "booting", label: "Early Boot" }
];

export const HomePage: React.FC = () => {
  useDocumentMeta({
    title: "VitaHarbor — PlayStation Vita Port Hub",
    description: "Real hardware progress and verified Reddit threads for PlayStation Vita ports."
  });

  const [stats, setStats] = useState<StatsData | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [recentUpdates, setRecentUpdates] = useState<any[]>([]);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [selectedProject, setSelectedProject] = useState<SelectedProjectView | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const consoleStageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [statsRes, projectsRes, updatesRes] = await Promise.all([
          apiGet<StatsData>("/api/stats").catch(() => null),
          apiGet<{ projects: any[] }>("/api/projects?limit=50", "projects").catch(() => ({ projects: [] })),
          apiGet<{ updates: any[] }>("/api/updates?limit=6", "updates").catch(() => ({ updates: [] }))
        ]);

        if (statsRes) setStats(statsRes);
        if (projectsRes?.projects && projectsRes.projects.length > 0) {
          setProjects(projectsRes.projects);
          const first = projectsRes.projects[0];
          setSelectedProject({
            id: first.id,
            game_title: first.game_title || first.display_name || "Medal of Honor: Allied Assault",
            display_name: first.display_name || "OpenMoHAA Vita",
            current_stage: first.current_stage || "in_game",
            performance_notes: first.performance_notes,
            playability_notes: first.playability_notes,
            technologies: first.technologies
          });
        }
        if (updatesRes?.updates) setRecentUpdates(updatesRes.updates);
      } catch (e) {
        console.error("Failed to load data", e);
      } finally {
        setLoading(false);
      }
    }
    loadHomeData();
  }, []);

  const filteredProjects = useMemo(() => {
    let list = [...projects];

    if (selectedFilter === "wip") {
      list = list.filter((p) => ["in_game", "booting", "early_wip", "research"].includes(String(p.current_stage)));
    } else if (selectedFilter === "playable") {
      list = list.filter((p) => ["playable", "released", "completable"].includes(String(p.current_stage)));
    } else if (selectedFilter === "booting") {
      list = list.filter((p) => ["booting", "early_wip", "research"].includes(String(p.current_stage)));
    } else if (selectedFilter !== "all") {
      list = list.filter((p) => String(p.current_stage) === selectedFilter);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.game_title?.toLowerCase().includes(term) ||
          p.display_name?.toLowerCase().includes(term) ||
          p.summary?.toLowerCase().includes(term) ||
          p.technologies?.some((t: string) => t.toLowerCase().includes(term)) ||
          p.developers?.some((d: any) => d.display_name?.toLowerCase().includes(term))
      );
    }

    return list;
  }, [projects, selectedFilter, searchTerm]);

  const handleSelectFor3D = (p: any) => {
    setSelectedProject({
      id: p.id,
      game_title: p.game_title || p.display_name || "",
      display_name: p.display_name || "",
      current_stage: p.current_stage,
      performance_notes: p.performance_notes,
      playability_notes: p.playability_notes,
      technologies: p.technologies
    });
    if (consoleStageRef.current) {
      consoleStageRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const formatStage = (stage: string) => {
    switch (stage) {
      case "in_game": return "In-Game";
      case "booting": return "Booting";
      case "early_wip": return "In Development";
      case "playable": return "Playable";
      case "released": return "Released";
      default: return stage;
    }
  };

  return (
    <div className="min-h-screen bg-[#ffffff] text-[#1d1d1f] font-sans antialiased selection:bg-[#0071e3] selection:text-white">
      
      {/* 1. CLEAN APPLE-STYLE GLOBAL NAVIGATION */}
      <nav className="border-b border-[#d2d2d7]/40 bg-white/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-12 flex items-center justify-between text-xs font-medium text-[#86868b]">
          <Link to="/" className="text-[#1d1d1f] font-semibold text-sm flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0071e3]" />
            VitaHarbor
          </Link>

          <div className="flex items-center gap-6">
            <a href="#directory" className="hover:text-[#1d1d1f] transition-colors">Directory</a>
            <Link to="/about" className="hover:text-[#1d1d1f] transition-colors">Methodology</Link>
            <span className="text-[#d2d2d7]">|</span>
            <span className="text-[#86868b]">r/vitahacks & r/VitaPiracy</span>
          </div>
        </div>
      </nav>

      {/* 2. HERO SHOWCASE (BRIGHT STUDIO WHITE, CLEAR TYPOGRAPHY) */}
      <section className="pt-16 pb-20 px-6 max-w-6xl mx-auto">
        
        <div className="text-center max-w-3xl mx-auto mb-12">
          <p className="text-xs uppercase tracking-widest font-semibold text-[#0071e3] mb-3">
            Hardware Port Tracker
          </p>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-[#1d1d1f] leading-[1.05]">
            PlayStation Vita Ports. <br />
            Live on hardware.
          </h1>
          <p className="text-lg text-[#6e6e73] mt-5 leading-relaxed font-normal">
            Before community engine recreations and ARM wrappers appear on VitaDB, we document their real-world performance, frame rates, and development threads on Reddit.
          </p>
        </div>

        {/* 3D Hardware Console Display */}
        <div ref={consoleStageRef} className="relative w-full bg-[#f5f5f7] rounded-3xl p-8 sm:p-12 mb-12 flex flex-col items-center">
          
          {/* Quick Select Buttons */}
          <div className="flex items-center justify-center gap-2 flex-wrap mb-8">
            {projects.slice(0, 5).map((p) => {
              const active = selectedProject?.id === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => handleSelectFor3D(p)}
                  className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
                    active
                      ? "bg-[#1d1d1f] text-white shadow-sm font-semibold"
                      : "bg-white text-[#515154] hover:bg-[#e8e8ed] hover:text-[#1d1d1f]"
                  }`}
                >
                  {p.display_name?.split(" (")[0] || p.game_title}
                </button>
              );
            })}
          </div>

          {/* Interactive 3D Model */}
          <div className="relative w-full h-[380px] sm:h-[480px] flex items-center justify-center">
            <VitaConsoleScene selectedProject={selectedProject} align="center" />
          </div>

          {/* Clean Hardware Spec Footnote */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-[#86868b]">
            <span>Sony PS Vita PCH-1000 OLED</span>
            <span>·</span>
            <span>Quad-Core Cortex-A9 (444MHz)</span>
            <span>·</span>
            <span>512MB RAM</span>
            <span>·</span>
            <span className="text-[#0071e3] font-medium">Tested on Real Hardware</span>
          </div>
        </div>

        {/* Recent Reddit Signals Bar */}
        <div className="bg-[#f5f5f7] rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#515154]">
          <div className="flex items-center gap-2 text-[#1d1d1f] font-semibold shrink-0">
            <span className="w-2 h-2 rounded-full bg-[#0071e3]" />
            <span>Latest Reddit Reports:</span>
          </div>

          <div className="flex items-center gap-6 overflow-x-auto no-scrollbar w-full">
            {recentUpdates.slice(0, 3).map((u) => (
              <a
                key={u.id}
                href={u.sources?.[0]?.canonical_url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#515154] hover:text-[#0071e3] transition-colors shrink-0 flex items-center gap-1.5"
              >
                <span className="truncate max-w-[280px]">{u.title}</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-[#86868b]" />
              </a>
            ))}
          </div>

          <Link to="/updates" className="text-[#0071e3] font-medium hover:underline shrink-0">
            All reports →
          </Link>
        </div>

      </section>

      {/* 3. PORT DIRECTORY (CLEAN WHITE, NO BOXES INSIDE BOXES) */}
      <section id="directory" className="py-16 px-6 max-w-6xl mx-auto border-t border-[#d2d2d7]/50">
        
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-[#1d1d1f]">
              Port Directory
            </h2>
            <p className="text-sm text-[#6e6e73] mt-1">
              Click any game to preview it on the 3D console or jump to the verified Reddit thread.
            </p>
          </div>

          {/* Filter Pills & Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex items-center gap-1 bg-[#f5f5f7] p-1 rounded-xl">
              {CATEGORY_TABS.map((tab) => {
                const active = selectedFilter === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setSelectedFilter(tab.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      active
                        ? "bg-white text-[#1d1d1f] shadow-sm font-semibold"
                        : "text-[#6e6e73] hover:text-[#1d1d1f]"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#86868b] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search games..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-56 bg-[#f5f5f7] border-0 rounded-xl pl-9 pr-3 py-2 text-xs text-[#1d1d1f] placeholder-[#86868b] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30"
              />
            </div>
          </div>
        </div>

        {/* The Clean Directory List */}
        {loading ? (
          <div className="py-20 text-center text-[#86868b] text-sm">
            Loading port directory...
          </div>
        ) : filteredProjects.length > 0 ? (
          <div className="divide-y divide-[#d2d2d7]/60">
            {filteredProjects.map((p) => {
              const isSelected = selectedProject?.id === p.id;

              return (
                <div
                  key={p.id}
                  onClick={() => handleSelectFor3D(p)}
                  className={`py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 cursor-pointer transition-colors px-4 -mx-4 rounded-2xl ${
                    isSelected ? "bg-[#f5f5f7]" : "hover:bg-[#fbfbfd]"
                  }`}
                >
                  <div className="max-w-xl">
                    <div className="flex items-center gap-3 mb-1.5">
                      <h3 className="text-xl font-bold text-[#1d1d1f]">
                        {p.game_title || p.display_name}
                      </h3>
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#f5f5f7] text-[#515154] border border-[#d2d2d7]/50">
                        {formatStage(p.current_stage)}
                      </span>
                    </div>

                    <p className="text-sm text-[#6e6e73] leading-relaxed">
                      {p.summary}
                    </p>

                    <p className="text-xs font-medium text-[#1d1d1f] mt-2">
                      <span className="text-[#86868b]">Performance: </span>
                      {p.performance_notes || p.playability_notes || "ARM binary execution."}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleSelectFor3D(p)}
                      className="text-xs font-medium text-[#0071e3] hover:underline"
                    >
                      Preview in 3D
                    </button>

                    {p.reddit_url && (
                      <a
                        href={p.reddit_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-semibold shadow-sm transition-colors"
                      >
                        <span>Reddit Thread</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-20 text-center text-[#86868b] text-sm">
            No projects matched your criteria.
          </div>
        )}

      </section>

      {/* 4. CLEAN FOOTER */}
      <footer className="border-t border-[#d2d2d7]/50 py-12 px-6 max-w-6xl mx-auto text-xs text-[#86868b] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="max-w-xl leading-relaxed">
          <p className="font-semibold text-[#1d1d1f] mb-1">VitaHarbor Open Research</p>
          <p>We document reverse-engineering progress from public Reddit forums. No ROMs, ISOs, or game data are hosted or distributed.</p>
        </div>

        <div className="flex items-center gap-4 shrink-0 text-[#0071e3] font-medium">
          <Link to="/about" className="hover:underline">About & Methodology</Link>
          <span className="text-[#d2d2d7]">·</span>
          <a href="/api/feed.json" target="_blank" rel="noopener noreferrer" className="hover:underline">JSON Feed</a>
          <span className="text-[#d2d2d7]">·</span>
          <a href="/api/rss.xml" target="_blank" rel="noopener noreferrer" className="hover:underline">RSS</a>
        </div>
      </footer>

    </div>
  );
};
