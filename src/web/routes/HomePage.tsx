import React, { useState, useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { VitaConsoleScene, type SelectedProjectView } from "../components/3d/VitaConsoleScene";
import { PortMatrixTable } from "../components/projects/PortMatrixTable";
import { apiGet } from "../lib/api";
import { useDocumentMeta } from "../lib/useDocumentMeta";
import {
  Search,
  ArrowRight,
  ExternalLink,
  Activity,
  Layers,
  List,
  LayoutGrid,
  Gamepad2,
  Radio
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
  { key: "wip", label: "Active WIPs" },
  { key: "in_game", label: "In-Game Builds" },
  { key: "booting", label: "Booting / Decomp" },
  { key: "playable", label: "Playable / Released" }
];

export const HomePage: React.FC = () => {
  useDocumentMeta({
    title: "VitaHarbor — Independent PS Vita Port Ledger",
    description:
      "Tracking community PlayStation Vita ports, ARM wrappers, and engine decompilations from r/vitahacks and r/VitaPiracy in real time."
  });

  const [stats, setStats] = useState<StatsData | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [recentUpdates, setRecentUpdates] = useState<any[]>([]);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [selectedProject, setSelectedProject] = useState<SelectedProjectView | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [statsRes, projectsRes, updatesRes] = await Promise.all([
          apiGet<StatsData>("/api/stats").catch(() => null),
          apiGet<{ projects: any[] }>("/api/projects?limit=50", "projects").catch(() => ({ projects: [] })),
          apiGet<{ updates: any[] }>("/api/updates?limit=8", "updates").catch(() => ({ updates: [] }))
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
        console.error("Failed to load home data", e);
      } finally {
        setLoading(false);
      }
    }
    loadHomeData();
  }, []);

  const filteredProjects = useMemo(() => {
    let list = projects;
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
    if (heroRef.current) {
      heroRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case "released":
      case "playable":
      case "completable":
        return {
          bg: "bg-emerald-500/10",
          border: "border-emerald-500/30",
          text: "text-emerald-400",
          dot: "bg-emerald-400"
        };
      case "in_game":
        return {
          bg: "bg-sky-500/10",
          border: "border-sky-500/30",
          text: "text-sky-400",
          dot: "bg-sky-400"
        };
      case "booting":
        return {
          bg: "bg-amber-500/10",
          border: "border-amber-500/30",
          text: "text-amber-400",
          dot: "bg-amber-400"
        };
      default:
        return {
          bg: "bg-purple-500/10",
          border: "border-purple-500/30",
          text: "text-purple-400",
          dot: "bg-purple-400"
        };
    }
  };

  return (
    <div className="min-h-screen bg-[#07080c] text-[#f1f3f5] selection:bg-sky-500/30 selection:text-white relative overflow-hidden">
      {/* Subtle Atmospheric Light Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[650px] bg-gradient-to-b from-sky-600/10 via-indigo-600/5 to-transparent blur-[140px] pointer-events-none z-0" />

      {/* HERO SECTION */}
      <section ref={heroRef} className="relative z-10 pt-10 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Top Status Pill */}
        <div className="flex items-center justify-center mb-6">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-md text-xs font-mono text-slate-300 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-white">LIVE HOMEBREW RADAR</span>
            <span className="text-slate-500">·</span>
            <span className="text-slate-400">r/vitahacks & r/VitaPiracy</span>
          </div>
        </div>

        {/* Hero Headline */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-8">
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white leading-[1.08]">
            The Underground <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-400 to-indigo-400">
              PS Vita Port Ledger
            </span>
          </h1>
          <p className="text-base sm:text-lg text-slate-400 font-normal leading-relaxed max-w-2xl mx-auto">
            Engine recreations, ARM wrappers, and community experiments surface on Reddit long before homebrew databases. We index active development on real Vita hardware.
          </p>
        </div>

        {/* 3D CONSOLE STAGE */}
        <div className="relative w-full rounded-3xl border border-white/[0.08] bg-gradient-to-b from-[#0c0e14]/90 to-[#07080c]/90 backdrop-blur-xl p-4 sm:p-8 shadow-2xl overflow-hidden mb-10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(56,189,248,0.06)_0%,_transparent_70%)] pointer-events-none" />

          {/* Quick Boot Bar */}
          <div className="relative z-20 flex items-center justify-between gap-4 pb-4 border-b border-white/[0.06] overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400 shrink-0">
              <Gamepad2 className="w-4 h-4 text-sky-400" />
              <span>TEST ON CONSOLE:</span>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              {projects.slice(0, 6).map((p) => {
                const isActive = selectedProject?.id === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => handleSelectFor3D(p)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 border ${
                      isActive
                        ? "bg-sky-500/20 border-sky-500/50 text-sky-300 shadow-sm shadow-sky-500/20"
                        : "bg-white/[0.03] border-white/[0.06] text-slate-400 hover:text-white hover:bg-white/[0.08]"
                    }`}
                  >
                    <span>{p.display_name?.split(" (")[0] || p.game_title}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3D Vita Scene */}
          <div className="relative w-full h-[380px] sm:h-[480px] lg:h-[540px] flex items-center justify-center">
            <VitaConsoleScene selectedProject={selectedProject} align="center" />
          </div>

          {/* Telemetry Bar */}
          <div className="relative z-20 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-white/[0.06] text-left">
            <div>
              <span className="text-[11px] font-mono text-slate-500 block uppercase tracking-wider">Target Hardware</span>
              <span className="text-sm font-semibold text-slate-200 mt-0.5 block">PS Vita PCH-1000 OLED</span>
              <span className="text-xs text-slate-400">960 × 544 @ 60Hz</span>
            </div>
            <div>
              <span className="text-[11px] font-mono text-slate-500 block uppercase tracking-wider">Architecture</span>
              <span className="text-sm font-semibold text-slate-200 mt-0.5 block">Quad ARM Cortex-A9</span>
              <span className="text-xs text-slate-400">vitaGL / SGX543MP4+</span>
            </div>
            <div>
              <span className="text-[11px] font-mono text-slate-500 block uppercase tracking-wider">Active WIP Stage</span>
              <span className="text-sm font-semibold text-sky-400 mt-0.5 block">
                {String(selectedProject?.current_stage || "in_game").replace("_", " ").toUpperCase()}
              </span>
              <span className="text-xs text-slate-400 truncate block">
                {selectedProject?.performance_notes || "Real hardware execution"}
              </span>
            </div>
            <div>
              <span className="text-[11px] font-mono text-slate-500 block uppercase tracking-wider">Reddit Verification</span>
              <span className="text-sm font-semibold text-emerald-400 mt-0.5 block flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Discussion Verified
              </span>
              <span className="text-xs text-slate-400">r/vitahacks & r/VitaPiracy</span>
            </div>
          </div>
        </div>

        {/* RECENT REDDIT SIGNALS STRIP */}
        <div className="rounded-2xl bg-gradient-to-r from-[#0d1017] to-[#10141d] border border-white/[0.08] p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-2.5 text-xs font-mono shrink-0">
            <Radio className="w-4 h-4 text-sky-400 animate-pulse" />
            <span className="text-white font-bold tracking-wide uppercase">Fresh Reddit Signals:</span>
          </div>

          <div className="flex items-center gap-4 overflow-x-auto no-scrollbar w-full text-xs">
            {recentUpdates.slice(0, 3).map((u) => (
              <a
                key={u.id}
                href={u.sources?.[0]?.canonical_url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] text-slate-300 hover:text-sky-300 transition-all shrink-0 group"
              >
                <span className="text-sky-400 font-mono text-[10px]">[{new Date(u.event_at).toLocaleDateString()}]</span>
                <span className="max-w-[240px] sm:max-w-[320px] truncate">{u.title}</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-white shrink-0" />
              </a>
            ))}
          </div>

          <Link
            to="/updates"
            className="text-xs font-medium text-sky-400 hover:text-sky-300 hover:underline shrink-0 flex items-center gap-1"
          >
            <span>All signals</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* PORT LEDGER SECTION */}
      <section id="ledger" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/[0.08] mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-sky-400 mb-1">
              <Layers className="w-3.5 h-3.5" />
              <span>INDEXED COMMUNITY PIPELINE</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white">
              The Port Directory
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-xl">
              Select any project to inspect playability status, target framerates, and boot it on the live 3D console.
            </p>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.04] border border-white/[0.08]">
            <button
              onClick={() => setViewMode("grid")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === "grid"
                  ? "bg-sky-500 text-white shadow-sm shadow-sky-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Cards</span>
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === "table"
                  ? "bg-sky-500 text-white shadow-sm shadow-sky-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
          </div>
        </div>

        {/* Filter Controls & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {CATEGORY_TABS.map((tab) => {
              const active = selectedFilter === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setSelectedFilter(tab.key)}
                  className={`px-4 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap border ${
                    active
                      ? "bg-white text-slate-950 border-white font-semibold shadow-sm"
                      : "bg-white/[0.03] border-white/[0.06] text-slate-400 hover:text-white hover:bg-white/[0.06]"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search game, engine, developer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#10131a] border border-white/[0.08] rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/30 transition-all shadow-inner"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* PROJECTS CONTAINER */}
        {loading ? (
          <div className="py-24 text-center text-slate-500 font-mono text-xs flex flex-col items-center justify-center gap-3">
            <div className="w-6 h-6 border-2 border-sky-500/20 border-t-sky-400 rounded-full animate-spin" />
            <span>Scanning port matrix...</span>
          </div>
        ) : filteredProjects.length > 0 ? (
          viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((p) => {
                const stageStyle = getStageColor(p.current_stage);
                const isSelected = selectedProject?.id === p.id;
                return (
                  <div
                    key={p.id}
                    className={`rounded-2xl border p-5 flex flex-col justify-between transition-all duration-300 bg-[#0d1017]/90 backdrop-blur-sm relative group hover:-translate-y-1 hover:shadow-xl ${
                      isSelected
                        ? "border-sky-500/50 shadow-lg shadow-sky-500/10"
                        : "border-white/[0.08] hover:border-white/20"
                    }`}
                  >
                    <div>
                      {/* Top Header: Platform & Stage */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 bg-white/[0.04] px-2.5 py-1 rounded-md border border-white/[0.06]">
                          {p.original_platform || "PC / Console"}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider border ${stageStyle.bg} ${stageStyle.border} ${stageStyle.text}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${stageStyle.dot}`} />
                          {String(p.current_stage || "wip").replace("_", " ")}
                        </span>
                      </div>

                      {/* Title */}
                      <Link to={`/projects/${p.slug}`} className="block group-hover:text-sky-300 transition-colors">
                        <h3 className="text-lg font-bold text-white tracking-tight leading-snug">
                          {p.game_title || p.display_name}
                        </h3>
                      </Link>

                      {/* Technical Summary */}
                      <p className="text-xs text-slate-400 mt-2.5 line-clamp-2 leading-relaxed">
                        {p.summary || "Native PlayStation Vita porting effort."}
                      </p>

                      {/* Performance & Playability Hardware Note */}
                      <div className="mt-3.5 p-2.5 rounded-lg bg-black/40 border border-white/[0.04] text-[11px] font-mono">
                        <span className="text-slate-500 block mb-0.5 uppercase tracking-wider text-[9px]">Hardware Status:</span>
                        <span className="text-slate-300">
                          {p.performance_notes || p.playability_notes || "Geometry & controls compiled for ARM Cortex-A9."}
                        </span>
                      </div>

                      {/* Technologies Tags */}
                      {p.technologies && p.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {p.technologies.map((tech: string, i: number) => (
                            <span
                              key={i}
                              className="text-[10px] font-mono text-slate-400 bg-white/[0.02] border border-white/[0.05] px-2 py-0.5 rounded"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Bottom Actions */}
                    <div className="pt-4 mt-5 border-t border-white/[0.06] flex items-center justify-between gap-3">
                      <button
                        onClick={() => handleSelectFor3D(p)}
                        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
                        title="Render this port on the 3D console screen"
                      >
                        <Gamepad2 className="w-3.5 h-3.5 text-sky-400" />
                        <span>Boot on 3D Vita</span>
                      </button>

                      {p.reddit_url && (
                        <a
                          href={p.reddit_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 transition-all group/btn"
                        >
                          <span>Reddit Thread</span>
                          <ExternalLink className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <PortMatrixTable
              projects={filteredProjects}
              selectedId={selectedProject?.id}
              onSelectProject={handleSelectFor3D}
            />
          )
        ) : (
          <div className="py-24 text-center text-slate-500 font-mono text-xs">
            No projects matched your criteria.
          </div>
        )}
      </section>

      {/* ZERO PIRACY & COMMUNITY RESEARCH DISCLAIMER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-white/[0.06] text-xs text-slate-500 font-mono leading-relaxed flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="max-w-3xl">
          <strong className="text-slate-400 uppercase tracking-wider block mb-1">Independent Community Engineering Tracker</strong>
          VitaHarbor documents reverse-engineering milestones from r/vitahacks and r/VitaPiracy. We do not host, link to, or distribute ROMs, ISOs, VPK game binaries, or copyrighted assets. All projects require original game assets from legitimate purchases.
        </div>
        <div className="shrink-0">
          <span className="inline-flex items-center gap-1.5 text-slate-400 bg-white/[0.03] border border-white/[0.06] px-3 py-1.5 rounded-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            100% Non-Infringing Ledger
          </span>
        </div>
      </section>
    </div>
  );
};
