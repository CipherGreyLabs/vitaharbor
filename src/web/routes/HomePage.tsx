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
  ArrowUpRight
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
  { key: "in_game", label: "In-Game" },
  { key: "booting", label: "Booting" },
  { key: "playable", label: "Playable" }
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
        osc.frequency.setValueAtTime(280, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(560, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.18);
      } else {
        osc.type = "sine";
        osc.frequency.setValueAtTime(480, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(720, ctx.currentTime + 0.04);
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
    <div className="min-h-screen bg-[#0c0d0f] text-[#f4f4f5] selection:bg-neutral-800 selection:text-white font-sans">
      
      {/* MINIMAL TOP UTILITY BAR */}
      <div className="border-b border-neutral-800/80 bg-[#0c0d0f]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-9 flex items-center justify-between text-[11px] font-mono text-neutral-400">
          <div className="flex items-center gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
            <span>COMMUNITY TRACKER</span>
            <span className="text-neutral-700">/</span>
            <span>r/vitahacks & r/VitaPiracy</span>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/about" className="text-neutral-400 hover:text-white transition-colors">
              Methodology & Non-Piracy
            </Link>
            <span className="text-neutral-700">·</span>
            <button
              onClick={() => {
                playSound("blip");
                setSoundEnabled(!soundEnabled);
              }}
              className="flex items-center gap-1 text-neutral-400 hover:text-white transition-colors"
            >
              {soundEnabled ? (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-neutral-200" />
                  <span>Audio On</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Muted</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* HERO SECTION */}
      <section ref={stageRef} className="pt-12 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        
        {/* EDITORIAL HEADER TITLE */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-10 border-b border-neutral-800/80 mb-12">
          <div className="max-w-2xl">
            <span className="font-mono text-xs text-neutral-400 uppercase tracking-widest block mb-3">
              Open Engineering Archive
            </span>
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white leading-none">
              VitaHarbor
            </h1>
            <p className="text-base text-neutral-400 mt-4 leading-relaxed font-normal">
              An independent archive monitoring active PlayStation Vita engine recreations, ARM wrappers, and decompilations surfacing across Reddit.
            </p>
          </div>

          {/* Clean Metric Readouts */}
          <div className="flex items-center gap-8 font-mono text-left shrink-0">
            <div>
              <span className="text-3xl font-semibold text-white block">
                {projects.length || 18}
              </span>
              <span className="text-[11px] text-neutral-500 uppercase tracking-wider">Total Ports</span>
            </div>
            <div className="w-px h-8 bg-neutral-800" />
            <div>
              <span className="text-3xl font-semibold text-neutral-200 block">
                {projects.filter((p) => ["in_game", "booting", "early_wip"].includes(String(p.current_stage))).length || 8}
              </span>
              <span className="text-[11px] text-neutral-500 uppercase tracking-wider">In Progress</span>
            </div>
            <div className="w-px h-8 bg-neutral-800" />
            <div>
              <span className="text-3xl font-semibold text-neutral-200 block">
                {projects.filter((p) => ["playable", "released"].includes(String(p.current_stage))).length || 10}
              </span>
              <span className="text-[11px] text-neutral-500 uppercase tracking-wider">Playable</span>
            </div>
          </div>
        </div>

        {/* 3D HARDWARE STAGE (SPACIOUS & UNBOXED) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center mb-16">
          
          {/* Left Column: Interactive Project Index */}
          <div className="lg:col-span-5 space-y-3 order-2 lg:order-1">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800 font-mono text-xs text-neutral-400">
              <span className="uppercase tracking-wider font-medium text-neutral-300">Specimen Queue</span>
              <span>Click to inspect</span>
            </div>

            <div className="space-y-1.5 max-h-[440px] overflow-y-auto no-scrollbar pr-1">
              {projects.slice(0, 7).map((p, idx) => {
                const isActive = selectedProject?.id === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => handleSelectFor3D(p)}
                    className={`p-3.5 rounded-lg border transition-all duration-150 cursor-pointer flex items-center justify-between gap-3 ${
                      isActive
                        ? "bg-neutral-800/60 border-neutral-600 text-white"
                        : "bg-neutral-900/40 border-neutral-800/80 hover:bg-neutral-800/30 hover:border-neutral-700 text-neutral-300"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-mono text-xs text-neutral-400 shrink-0">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      <div className="min-w-0">
                        <h4 className="text-sm font-medium truncate text-white leading-tight">
                          {p.display_name?.split(" (")[0] || p.game_title}
                        </h4>
                        <span className="text-[11px] font-mono text-neutral-400 truncate block mt-0.5">
                          {p.performance_notes || p.playability_notes || p.original_platform}
                        </span>
                      </div>
                    </div>

                    <span className="shrink-0 text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-neutral-800 border border-neutral-700 text-neutral-300">
                      {formatStageLabel(p.current_stage)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Cycle Controls */}
            <div className="flex items-center justify-between pt-3 border-t border-neutral-800 font-mono text-xs">
              <button
                onClick={() => handleCycleProject("prev")}
                className="flex items-center gap-1 text-neutral-400 hover:text-white transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev (L)</span>
              </button>
              <span className="text-neutral-500 text-[11px]">
                {selectedProject ? selectedProject.game_title.slice(0, 22) + "..." : ""}
              </span>
              <button
                onClick={() => handleCycleProject("next")}
                className="flex items-center gap-1 text-neutral-400 hover:text-white transition-colors"
              >
                <span>Next (R)</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right Column: Freestanding 3D Console */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center relative order-1 lg:order-2">
            <div className="relative w-full h-[360px] sm:h-[440px] lg:h-[480px]">
              <VitaConsoleScene selectedProject={selectedProject} align="center" />
            </div>

            {/* Hardware Specification Bar */}
            <div className="w-full max-w-lg mt-3 px-4 py-2 rounded-lg bg-neutral-900/60 border border-neutral-800 text-[11px] font-mono text-neutral-400 flex items-center justify-between">
              <span>SONY PCH-1000 OLED</span>
              <span className="text-neutral-700">·</span>
              <span>CORTEX-A9 @ 444MHz</span>
              <span className="text-neutral-700">·</span>
              <span>512MB RAM</span>
              <span className="text-neutral-700">·</span>
              <span>vitaGL ES 2.0</span>
            </div>
          </div>

        </div>

        {/* RECENT REDDIT THREADS TICKER */}
        <div className="border border-neutral-800 bg-neutral-900/30 rounded-lg p-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 font-mono text-xs">
          <div className="flex items-center gap-2 text-neutral-400 shrink-0 uppercase tracking-wider text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
            <span className="text-white font-medium">Latest Signals:</span>
          </div>

          <div className="flex items-center gap-4 overflow-x-auto no-scrollbar w-full text-xs">
            {recentUpdates.slice(0, 3).map((u) => {
              const subName = u.sources?.[0]?.canonical_url?.includes("r/VitaPiracy") ? "r/VitaPiracy" : "r/vitahacks";
              return (
                <a
                  key={u.id}
                  href={u.sources?.[0]?.canonical_url || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => playSound("blip")}
                  className="inline-flex items-center gap-2 text-neutral-300 hover:text-white transition-colors shrink-0 group"
                >
                  <span className="text-neutral-400 text-[11px]">[{subName}]</span>
                  <span className="max-w-[240px] sm:max-w-[320px] truncate">{u.title}</span>
                  <ExternalLink className="w-3 h-3 text-neutral-400 group-hover:text-white shrink-0" />
                </a>
              );
            })}
          </div>

          <Link
            to="/updates"
            onClick={() => playSound("blip")}
            className="text-neutral-400 hover:text-white shrink-0 flex items-center gap-1 text-[11px]"
          >
            <span>All reports</span>
            <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

      </section>

      {/* PORT LEDGER DIRECTORY */}
      <section id="directory" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 border-t border-neutral-800/80">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-neutral-800/80 mb-8">
          <div>
            <span className="font-mono text-xs text-neutral-400 uppercase tracking-widest block mb-2">
              Verified Technical Ledger
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Port Directory
            </h2>
            <p className="text-sm text-neutral-400 mt-1 font-normal">
              Indexed development milestones, hardware notes, and primary Reddit discussion threads.
            </p>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-neutral-900 border border-neutral-800">
            <button
              onClick={() => {
                playSound("blip");
                setViewMode("cards");
              }}
              className={`p-1.5 rounded text-xs transition-colors ${
                viewMode === "cards" ? "bg-neutral-800 text-white" : "text-neutral-500 hover:text-white"
              }`}
              title="Card View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                playSound("blip");
                setViewMode("table");
              }}
              className={`p-1.5 rounded text-xs transition-colors ${
                viewMode === "table" ? "bg-neutral-800 text-white" : "text-neutral-500 hover:text-white"
              }`}
              title="Table View"
            >
              <List className="w-3.5 h-3.5" />
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
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-colors whitespace-nowrap border ${
                    active
                      ? "bg-white text-black border-white font-semibold"
                      : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Filter by game, engine, developer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-9 pr-8 py-1.5 text-xs font-mono text-white placeholder-neutral-400 focus:outline-none focus:border-neutral-600"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* DIRECTORY CONTENT */}
        {loading ? (
          <div className="py-24 text-center text-neutral-500 font-mono text-xs">
            Loading port ledger...
          </div>
        ) : filteredProjects.length > 0 ? (
          viewMode === "cards" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProjects.map((p) => {
                const subName = p.reddit_url?.includes("r/VitaPiracy") ? "r/VitaPiracy" : "r/vitahacks";
                const isSelected = selectedProject?.id === p.id;
                const isCopied = copiedId === p.id;

                return (
                  <div
                    key={p.id}
                    className={`rounded-lg border p-5 flex flex-col justify-between transition-all duration-150 bg-[#111214] ${
                      isSelected
                        ? "border-neutral-500"
                        : "border-neutral-800/80 hover:border-neutral-700"
                    }`}
                  >
                    <div>
                      {/* Top Metadata */}
                      <div className="flex items-center justify-between gap-2 mb-3 font-mono text-[10px]">
                        <div className="flex items-center gap-1.5 text-neutral-400">
                          <span className="bg-neutral-800/80 px-2 py-0.5 rounded border border-neutral-700/60 uppercase">
                            {p.original_platform || "PC"}
                          </span>
                          <span className="text-neutral-400">
                            {subName}
                          </span>
                        </div>

                        <span className="text-neutral-300 font-medium uppercase px-2 py-0.5 rounded bg-neutral-800/80 border border-neutral-700/60">
                          {formatStageLabel(p.current_stage)}
                        </span>
                      </div>

                      {/* Game Title */}
                      <Link to={`/projects/${p.slug}`} className="block group">
                        <h3 className="text-base font-semibold text-white group-hover:text-neutral-200 transition-colors leading-snug">
                          {p.game_title || p.display_name}
                        </h3>
                      </Link>

                      {/* Summary */}
                      <p className="text-xs text-neutral-400 mt-2 line-clamp-2 leading-relaxed font-normal">
                        {p.summary}
                      </p>

                      {/* Hardware Notes */}
                      <div className="mt-3.5 p-2.5 rounded bg-[#16181b] border border-neutral-800/80 font-mono text-[11px]">
                        <span className="text-neutral-400 block text-[9px] uppercase tracking-wider mb-0.5">
                          Hardware Status:
                        </span>
                        <span className="text-neutral-300 block">
                          {p.performance_notes || p.playability_notes || "ARM binary execution."}
                        </span>
                      </div>
                    </div>

                    {/* Bottom Actions Bar */}
                    <div className="pt-4 mt-5 border-t border-neutral-800 flex items-center justify-between gap-3 font-mono text-xs">
                      <button
                        onClick={() => handleSelectFor3D(p)}
                        className="text-neutral-400 hover:text-white transition-colors flex items-center gap-1.5"
                      >
                        <span>Inspect on 3D Vita</span>
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => handleCopyLink(p, e)}
                          className="p-1 rounded text-neutral-400 hover:text-white transition-colors"
                          title="Copy project link"
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5 text-neutral-200" /> : <Share2 className="w-3.5 h-3.5" />}
                        </button>

                        {p.reddit_url && (
                          <a
                            href={p.reddit_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => playSound("blip")}
                            className="text-neutral-300 hover:text-white transition-colors flex items-center gap-1 underline underline-offset-4 decoration-neutral-700 hover:decoration-white"
                          >
                            <span>Reddit</span>
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
          <div className="py-24 text-center text-neutral-500 font-mono text-xs">
            No projects matched your search.
          </div>
        )}
      </section>

      {/* FOOTER */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-neutral-800 font-mono text-xs text-neutral-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="max-w-2xl leading-relaxed">
          <span className="text-neutral-300 font-medium uppercase block mb-1">Non-Infringing Documentation</span>
          VitaHarbor indexes public engineering discussions on r/vitahacks and r/VitaPiracy. Zero game binaries, ISOs, or ROMs are hosted or distributed. All ports require legitimately acquired game assets.
        </div>

        <div className="flex items-center gap-4 shrink-0 text-neutral-400">
          <a href="/api/feed.json" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
            JSON Feed
          </a>
          <span className="text-neutral-700">·</span>
          <a href="/api/rss.xml" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
            RSS 2.0
          </a>
        </div>
      </footer>

    </div>
  );
};
