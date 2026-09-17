import React, { useState, useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { VitaConsoleScene, type SelectedProjectView } from "../components/3d/VitaConsoleScene";
import { PortMatrixTable } from "../components/projects/PortMatrixTable";
import { apiGet } from "../lib/api";
import { useDocumentMeta } from "../lib/useDocumentMeta";
import {
  Search,
  ExternalLink,
  List,
  LayoutGrid,
  Volume2,
  VolumeX,
  Share2,
  Check,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
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
  { key: "booting", label: "Booting & Decomp" },
  { key: "playable", label: "Playable / Released" }
];

export const HomePage: React.FC = () => {
  useDocumentMeta({
    title: "VitaHarbor — PlayStation Vita Port Archive",
    description: "An independent engineering ledger documenting community PlayStation Vita ports, ARM wrappers, and engine decompilations."
  });

  const [stats, setStats] = useState<StatsData | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [recentUpdates, setRecentUpdates] = useState<any[]>([]);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [selectedProject, setSelectedProject] = useState<SelectedProjectView | null>(null);
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const stageRef = useRef<HTMLDivElement>(null);

  const playSound = (type: "blip" | "boot" = "blip") => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === "suspended") ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === "boot") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(320, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(640, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.18);
      } else {
        osc.type = "sine";
        osc.frequency.setValueAtTime(520, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(780, ctx.currentTime + 0.04);
        gain.gain.setValueAtTime(0.03, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.05);
      }
    } catch {}
  };

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
        console.error("Failed to load home data", e);
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
    playSound("boot");
    setSelectedProject({
      id: p.id,
      game_title: p.game_title || p.display_name || "",
      display_name: p.display_name || "",
      current_stage: p.current_stage,
      performance_notes: p.performance_notes,
      playability_notes: p.playability_notes,
      technologies: p.technologies
    });
    if (stageRef.current) {
      stageRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleCycleProject = (dir: "prev" | "next") => {
    if (projects.length === 0) return;
    playSound("blip");
    const currentIndex = projects.findIndex((p) => p.id === selectedProject?.id);
    let nextIndex = 0;
    if (dir === "next") {
      nextIndex = (currentIndex + 1) % projects.length;
    } else {
      nextIndex = (currentIndex - 1 + projects.length) % projects.length;
    }
    const p = projects[nextIndex];
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

  const handleCopyLink = (p: any, e: React.MouseEvent) => {
    e.stopPropagation();
    playSound("blip");
    const url = `${window.location.origin}/projects/${p.slug}`;
    navigator.clipboard?.writeText(url);
    setCopiedId(p.id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const getStageChipStyle = (stage: string) => {
    switch (stage) {
      case "released":
      case "playable":
      case "completable":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "in_game":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "booting":
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-purple-50 text-purple-700 border-purple-200";
    }
  };

  const formatStageLabel = (stage: string) => {
    switch (stage) {
      case "in_game": return "In-Game";
      case "booting": return "Booting";
      case "early_wip": return "Early WIP";
      case "research": return "Research";
      case "playable": return "Playable";
      case "released": return "Released";
      default: return stage;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 selection:bg-blue-100 selection:text-blue-900 font-sans">
      
      {/* LUMINOUS TOP RADIAL GRADIENT */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[550px] bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(191,219,254,0.45),rgba(248,250,252,0))] pointer-events-none z-0" />

      {/* HERO SECTION */}
      <section ref={stageRef} className="relative z-10 pt-10 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        
        {/* TOP STATUS BADGE & AUDIO TOGGLE */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200/80 shadow-sm text-xs text-slate-600 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Community Radar</span>
            <span className="text-slate-300">·</span>
            <span className="text-slate-500">r/vitahacks & r/VitaPiracy</span>
          </div>

          <button
            onClick={() => {
              playSound("blip");
              setSoundEnabled(!soundEnabled);
            }}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200/80 text-xs font-medium text-slate-600 hover:text-slate-900 shadow-sm transition-all"
            title={soundEnabled ? "Mute interface audio" : "Enable interface audio"}
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Sound On</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                <span>Muted</span>
              </>
            )}
          </button>
        </div>

        {/* HERO TITLE & STATS ROW */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-8 border-b border-slate-200/80 mb-10">
          <div className="max-w-2xl">
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-slate-900 leading-[1.05]">
              PlayStation Vita <br />
              Port Archive
            </h1>
            <p className="text-base sm:text-lg text-slate-600 mt-4 font-normal leading-relaxed">
              An independent ledger tracking engine decompilations, ARM wrappers, and homebrew builds surfacing on Reddit before reaching VitaDB.
            </p>
          </div>

          {/* Clean Light Stats */}
          <div className="flex items-center gap-4 sm:gap-6 shrink-0">
            <div className="bg-white border border-slate-200/80 rounded-2xl px-5 py-3 shadow-sm text-left">
              <span className="text-2xl sm:text-3xl font-bold text-slate-900 block leading-tight">
                {projects.length || 18}
              </span>
              <span className="text-xs text-slate-500 font-medium">Monitored</span>
            </div>
            <div className="bg-white border border-slate-200/80 rounded-2xl px-5 py-3 shadow-sm text-left">
              <span className="text-2xl sm:text-3xl font-bold text-blue-600 block leading-tight">
                {projects.filter((p) => ["in_game", "booting", "early_wip"].includes(String(p.current_stage))).length || 8}
              </span>
              <span className="text-xs text-slate-500 font-medium">In Progress</span>
            </div>
            <div className="bg-white border border-slate-200/80 rounded-2xl px-5 py-3 shadow-sm text-left">
              <span className="text-2xl sm:text-3xl font-bold text-emerald-600 block leading-tight">
                {projects.filter((p) => ["playable", "released"].includes(String(p.current_stage))).length || 10}
              </span>
              <span className="text-xs text-slate-500 font-medium">Playable</span>
            </div>
          </div>
        </div>

        {/* 3D CONSOLE SHOWCASE */}
        <div className="relative w-full rounded-3xl bg-gradient-to-b from-white via-white to-slate-50/50 border border-slate-200/80 p-6 sm:p-8 shadow-sm mb-8">
          
          {/* Quick Switcher Dock */}
          <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-100 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 shrink-0">
              <Gamepad2 className="w-4 h-4 text-blue-600" />
              <span>Preview on Console:</span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              {projects.slice(0, 6).map((p) => {
                const isActive = selectedProject?.id === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => handleSelectFor3D(p)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border ${
                      isActive
                        ? "bg-blue-600 border-blue-600 text-white shadow-sm font-semibold"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <span>{p.display_name?.split(" (")[0] || p.game_title}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3D Interactive Canvas */}
          <div className="relative w-full h-[380px] sm:h-[480px] lg:h-[520px] flex items-center justify-center">
            <VitaConsoleScene selectedProject={selectedProject} align="center" />
          </div>

          {/* Hardware Telemetry Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100 text-left">
            <div>
              <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider block">Target Device</span>
              <span className="text-sm font-semibold text-slate-800 mt-0.5 block">PS Vita PCH-1000 OLED</span>
              <span className="text-xs text-slate-500">960 × 544 @ 60Hz</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider block">Processing</span>
              <span className="text-sm font-semibold text-slate-800 mt-0.5 block">Quad ARM Cortex-A9</span>
              <span className="text-xs text-slate-500">444MHz / SGX543MP4+</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider block">Tested Status</span>
              <span className="text-sm font-semibold text-blue-600 mt-0.5 block">
                {formatStageLabel(selectedProject?.current_stage || "in_game")}
              </span>
              <span className="text-xs text-slate-500 truncate block">
                {selectedProject?.performance_notes || "Real hardware execution"}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider block">Community Provenance</span>
              <span className="text-sm font-semibold text-emerald-600 mt-0.5 block">
                Verified Discussions
              </span>
              <span className="text-xs text-slate-500">r/vitahacks & r/VitaPiracy</span>
            </div>
          </div>
        </div>

        {/* RECENT REDDIT UPDATES STRIP */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 shrink-0">
            <Radio className="w-4 h-4 text-blue-600 animate-pulse" />
            <span>Latest Reddit Signals:</span>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar w-full text-xs">
            {recentUpdates.slice(0, 3).map((u) => {
              const subName = u.sources?.[0]?.canonical_url?.includes("r/VitaPiracy") ? "r/VitaPiracy" : "r/vitahacks";
              return (
                <a
                  key={u.id}
                  href={u.sources?.[0]?.canonical_url || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => playSound("blip")}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200/60 text-slate-700 hover:text-blue-600 transition-all shrink-0 group"
                >
                  <span className="text-[10px] font-semibold text-blue-600">[{subName}]</span>
                  <span className="max-w-[240px] sm:max-w-[320px] truncate">{u.title}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 shrink-0" />
                </a>
              );
            })}
          </div>

          <Link
            to="/updates"
            onClick={() => playSound("blip")}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 shrink-0 flex items-center gap-1"
          >
            <span>All signals</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </section>

      {/* PORT LEDGER DIRECTORY */}
      <section id="directory" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 border-t border-slate-200/80">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200/80 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Port Directory
            </h2>
            <p className="text-sm text-slate-500 mt-1 font-normal">
              Indexed development milestones, hardware notes, and primary Reddit discussion threads.
            </p>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200/80">
            <button
              onClick={() => {
                playSound("blip");
                setViewMode("cards");
              }}
              className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
                viewMode === "cards" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
              }`}
              title="Card View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                playSound("blip");
                setViewMode("table");
              }}
              className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
                viewMode === "table" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Tabs & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {CATEGORY_TABS.map((tab) => {
              const active = selectedFilter === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => {
                    playSound("blip");
                    setSelectedFilter(tab.key);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap border ${
                    active
                      ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                      : "bg-white border-slate-200/80 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search title, engine, developer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200/80 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* DIRECTORY CONTENT */}
        {loading ? (
          <div className="py-24 text-center text-slate-400 text-sm">
            Loading port ledger...
          </div>
        ) : filteredProjects.length > 0 ? (
          viewMode === "cards" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((p) => {
                const subName = p.reddit_url?.includes("r/VitaPiracy") ? "r/VitaPiracy" : "r/vitahacks";
                const isSelected = selectedProject?.id === p.id;
                const isCopied = copiedId === p.id;

                return (
                  <div
                    key={p.id}
                    className={`bg-white rounded-3xl border p-6 flex flex-col justify-between transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1 ${
                      isSelected
                        ? "border-blue-400 ring-2 ring-blue-100"
                        : "border-slate-200/80 hover:border-slate-300"
                    }`}
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-4">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-semibold uppercase text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200/60">
                            {p.original_platform || "PC"}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-500">
                            {subName}
                          </span>
                        </div>

                        <span
                          className={`text-[11px] font-semibold uppercase px-2.5 py-0.5 rounded-lg border ${getStageChipStyle(p.current_stage)}`}
                        >
                          {formatStageLabel(p.current_stage)}
                        </span>
                      </div>

                      {/* Game Title */}
                      <Link to={`/projects/${p.slug}`} className="block group">
                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                          {p.game_title || p.display_name}
                        </h3>
                      </Link>

                      {/* Summary */}
                      <p className="text-sm text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                        {p.summary}
                      </p>

                      {/* Hardware Status Callout */}
                      <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                        <span className="text-slate-400 font-semibold block text-[10px] uppercase tracking-wider mb-0.5">
                          Hardware Status:
                        </span>
                        <span className="text-slate-800 font-medium block">
                          {p.performance_notes || p.playability_notes || "ARM binary execution."}
                        </span>
                      </div>
                    </div>

                    {/* Bottom Actions Bar */}
                    <div className="pt-4 mt-5 border-t border-slate-100 flex items-center justify-between gap-3 text-xs">
                      <button
                        onClick={() => handleSelectFor3D(p)}
                        className="text-slate-600 hover:text-blue-600 font-medium transition-colors flex items-center gap-1.5"
                      >
                        <Gamepad2 className="w-3.5 h-3.5 text-blue-600" />
                        <span>Preview on Vita</span>
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => handleCopyLink(p, e)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                          title="Copy project link"
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
                        </button>

                        {p.reddit_url && (
                          <a
                            href={p.reddit_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => playSound("blip")}
                            className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                          >
                            <span>Reddit Thread</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
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
          <div className="py-24 text-center text-slate-400 text-sm">
            No projects matched your search.
          </div>
        )}
      </section>

    </div>
  );
};
