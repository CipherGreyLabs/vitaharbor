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
  Layers,
  List,
  LayoutGrid,
  Gamepad2,
  Radio,
  Volume2,
  VolumeX,
  Share2,
  Check,
  ArrowUpDown,
  Cpu,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Terminal
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

const STAGES_ORDER = ["research", "early_wip", "booting", "in_game", "playable", "released"];

export const HomePage: React.FC = () => {
  useDocumentMeta({
    title: "VitaHarbor — PS Vita Homebrew Port Ledger",
    description:
      "Tracking community PlayStation Vita ports, ARM wrappers, and engine decompilations from r/vitahacks and r/VitaPiracy in real time."
  });

  const [stats, setStats] = useState<StatsData | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [recentUpdates, setRecentUpdates] = useState<any[]>([]);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"activity" | "stage" | "name">("activity");
  const [selectedProject, setSelectedProject] = useState<SelectedProjectView | null>(null);
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const stageRef = useRef<HTMLDivElement>(null);

  // Synthesize tactile PS Vita audio clicks via Web Audio API
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
        osc.frequency.exponentialRampToValueAtTime(700, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.22);
      } else {
        osc.type = "sine";
        osc.frequency.setValueAtTime(540, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(820, ctx.currentTime + 0.04);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.06);
      }
    } catch {
      // Audio not supported
    }
  };

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

    list.sort((a, b) => {
      if (sortBy === "name") {
        return (a.display_name || a.game_title || "").localeCompare(b.display_name || b.game_title || "");
      }
      if (sortBy === "stage") {
        const orderA = STAGES_ORDER.indexOf(String(a.current_stage));
        const orderB = STAGES_ORDER.indexOf(String(b.current_stage));
        return orderB - orderA;
      }
      const tA = new Date(a.last_activity_at || 0).getTime();
      const tB = new Date(b.last_activity_at || 0).getTime();
      return tB - tA;
    });

    return list;
  }, [projects, selectedFilter, sortBy, searchTerm]);

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
    setTimeout(() => setCopiedId(null), 2000);
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

  const getSubredditInfo = (url?: string | null) => {
    if (!url) return null;
    if (url.includes("r/vitahacks")) {
      return { name: "r/vitahacks", color: "text-sky-400 bg-sky-500/10 border-sky-500/20" };
    }
    if (url.includes("r/VitaPiracy")) {
      return { name: "r/VitaPiracy", color: "text-purple-400 bg-purple-500/10 border-purple-500/20" };
    }
    return { name: "Reddit", color: "text-slate-400 bg-white/[0.04] border-white/[0.08]" };
  };

  return (
    <div className="min-h-screen bg-[#07080c] text-[#f1f3f5] selection:bg-sky-500/30 selection:text-white relative">
      
      {/* ATMOSPHERIC BACKGROUND RADIAL ILLUMINATION */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1400px] h-[650px] bg-gradient-to-b from-sky-600/10 via-indigo-600/5 to-transparent blur-[140px] pointer-events-none z-0" />
      <div className="absolute top-[800px] right-0 w-[600px] h-[600px] bg-sky-900/10 blur-[160px] pointer-events-none z-0" />

      {/* EDITORIAL TOP HEADER STRIP */}
      <div className="relative z-20 border-b border-white/[0.06] bg-[#07080c]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-10 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>COMMUNITY RECONNAISSANCE</span>
            </span>
            <span className="hidden md:inline text-slate-600">/</span>
            <span className="hidden md:inline text-slate-400">r/vitahacks & r/VitaPiracy</span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/about"
              className="flex items-center gap-1 text-slate-400 hover:text-emerald-400 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>NON-INFRINGING ARCHIVE</span>
            </Link>
            <span className="text-slate-600">·</span>
            <button
              onClick={() => {
                playSound("blip");
                setSoundEnabled(!soundEnabled);
              }}
              className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
              title={soundEnabled ? "Mute sound effects" : "Enable sound effects"}
            >
              {soundEnabled ? (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-sky-400" />
                  <span>SOUND</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-slate-500">MUTED</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* MAIN SHOWCASE STAGE */}
      <section ref={stageRef} className="relative z-10 pt-10 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        
        {/* EDITORIAL HERO TITLE */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-white/[0.08] mb-10">
          <div>
            <span className="font-mono text-xs text-sky-400 tracking-wider uppercase block mb-2">
              ARCHIVE // PS VITA PORT LEDGER
            </span>
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white leading-none">
              VITA HARBOR
            </h1>
            <p className="text-sm sm:text-base text-slate-400 mt-3 max-w-xl font-normal leading-relaxed">
              Tracking community engine decompilations, ARM wrappers, and hardware tests surfacing on Reddit before reaching VitaDB.
            </p>
          </div>

          {/* Key Metrics */}
          <div className="flex items-center gap-6 font-mono text-left">
            <div>
              <span className="text-2xl sm:text-3xl font-bold text-white block">
                {projects.length || 18}
              </span>
              <span className="text-[11px] text-slate-500 uppercase tracking-wider">Indexed Ports</span>
            </div>
            <div className="w-px h-8 bg-white/[0.08]" />
            <div>
              <span className="text-2xl sm:text-3xl font-bold text-sky-400 block">
                {projects.filter((p) => ["in_game", "booting", "early_wip"].includes(String(p.current_stage))).length || 8}
              </span>
              <span className="text-[11px] text-slate-500 uppercase tracking-wider">Active WIPs</span>
            </div>
            <div className="w-px h-8 bg-white/[0.08]" />
            <div>
              <span className="text-2xl sm:text-3xl font-bold text-emerald-400 block">
                {projects.filter((p) => ["playable", "released"].includes(String(p.current_stage))).length || 10}
              </span>
              <span className="text-[11px] text-slate-500 uppercase tracking-wider">Playable</span>
            </div>
          </div>
        </div>

        {/* INTERACTIVE 3D VITA STAGE (ASYMMETRIC SPLIT) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-12">
          
          {/* Left Column: Interactive Port Selector Stream */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4 order-2 lg:order-1">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
              <span className="font-mono text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Gamepad2 className="w-3.5 h-3.5 text-sky-400" />
                <span>Active Specimen Pipeline</span>
              </span>
              <span className="font-mono text-[11px] text-slate-500">
                Click to inspect on OLED
              </span>
            </div>

            {/* Scrollable list of active projects driving the 3D console */}
            <div className="space-y-2 max-h-[460px] overflow-y-auto no-scrollbar pr-1">
              {projects.slice(0, 7).map((p, idx) => {
                const isActive = selectedProject?.id === p.id;
                const stageStyle = getStageColor(p.current_stage);

                return (
                  <div
                    key={p.id}
                    onClick={() => handleSelectFor3D(p)}
                    className={`p-3.5 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 ${
                      isActive
                        ? "bg-sky-500/15 border-sky-500/50 shadow-md shadow-sky-500/10 text-white"
                        : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05] hover:border-white/15 text-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-mono text-xs text-slate-500 shrink-0">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      <div className="min-w-0">
                        <h4 className="text-sm font-semibold truncate text-white leading-tight">
                          {p.display_name?.split(" (")[0] || p.game_title}
                        </h4>
                        <span className="text-[11px] font-mono text-slate-400 truncate block mt-0.5">
                          {p.performance_notes || p.playability_notes || p.original_platform}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`shrink-0 text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${stageStyle.bg} ${stageStyle.border} ${stageStyle.text}`}
                    >
                      {String(p.current_stage || "wip").replace("_", " ")}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Cycle Triggers */}
            <div className="flex items-center justify-between pt-3 border-t border-white/[0.06] font-mono text-xs">
              <button
                onClick={() => handleCycleProject("prev")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5 text-sky-400" />
                <span>PREV PORT (L)</span>
              </button>
              <span className="text-slate-500 text-[11px]">
                {selectedProject ? selectedProject.game_title.slice(0, 20) + "..." : "Select"}
              </span>
              <button
                onClick={() => handleCycleProject("next")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white transition-colors"
              >
                <span>NEXT PORT (R)</span>
                <ChevronRight className="w-3.5 h-3.5 text-sky-400" />
              </button>
            </div>
          </div>

          {/* Right Column: 3D PlayStation Vita PCH-1000 OLED */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center relative order-1 lg:order-2">
            <div className="relative w-full h-[360px] sm:h-[460px] lg:h-[500px]">
              <VitaConsoleScene selectedProject={selectedProject} align="center" />
            </div>

            {/* Hardware Telemetry Footnote */}
            <div className="w-full max-w-lg mt-2 px-4 py-2 rounded-xl bg-black/40 border border-white/[0.05] text-[11px] font-mono text-slate-400 flex items-center justify-between">
              <span>TARGET: PS VITA OLED</span>
              <span className="text-slate-600">·</span>
              <span>CORTEX-A9 (444MHz)</span>
              <span className="text-slate-600">·</span>
              <span>512MB RAM</span>
              <span className="text-slate-600">·</span>
              <span>vitaGL ES 2.0</span>
            </div>
          </div>

        </div>

        {/* REAL-TIME REDDIT DISCOVERY FEED STRIP */}
        <div className="rounded-xl bg-[#0c0e15] border border-white/[0.08] p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-mono text-white shrink-0">
            <Radio className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
            <span className="font-bold tracking-wider uppercase">LATEST REDDIT REPORTS:</span>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar w-full text-xs font-mono">
            {recentUpdates.slice(0, 4).map((u) => {
              const sub = getSubredditInfo(u.sources?.[0]?.canonical_url);
              return (
                <a
                  key={u.id}
                  href={u.sources?.[0]?.canonical_url || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => playSound("blip")}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] text-slate-300 hover:text-sky-300 transition-all shrink-0 group"
                >
                  {sub && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border ${sub.color}`}>
                      {sub.name}
                    </span>
                  )}
                  <span className="max-w-[220px] sm:max-w-[320px] truncate">{u.title}</span>
                  <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-white shrink-0" />
                </a>
              );
            })}
          </div>

          <Link
            to="/updates"
            onClick={() => playSound("blip")}
            className="text-xs font-mono text-sky-400 hover:text-sky-300 hover:underline shrink-0 flex items-center gap-1"
          >
            <span>All reports</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </section>

      {/* PORT DIRECTORY MATRIX & CARDS */}
      <section id="directory" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/[0.08] mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-sky-400 mb-1">
              <Terminal className="w-3.5 h-3.5" />
              <span>VERIFIED ENGINEERING LEDGER</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Full Port Directory
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl font-mono">
              Indexed development milestones, hardware framerates, and primary Reddit engineering threads.
            </p>
          </div>

          {/* Controls: Sort & Layout */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-slate-300">
              <ArrowUpDown className="w-3.5 h-3.5 text-sky-400" />
              <span className="text-slate-500 text-[10px]">SORT:</span>
              <select
                value={sortBy}
                onChange={(e) => {
                  playSound("blip");
                  setSortBy(e.target.value as any);
                }}
                className="bg-transparent text-white border-none focus:outline-none cursor-pointer text-xs font-mono"
              >
                <option value="activity" className="bg-[#0c0e15] text-white">Recently Active</option>
                <option value="stage" className="bg-[#0c0e15] text-white">Progress Milestone</option>
                <option value="name" className="bg-[#0c0e15] text-white">Name (A–Z)</option>
              </select>
            </div>

            <div className="flex items-center gap-1 p-1 rounded-lg bg-white/[0.04] border border-white/[0.08]">
              <button
                onClick={() => {
                  playSound("blip");
                  setViewMode("cards");
                }}
                className={`p-1.5 rounded text-xs transition-colors ${
                  viewMode === "cards" ? "bg-sky-500 text-white" : "text-slate-400 hover:text-white"
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
                  viewMode === "table" ? "bg-sky-500 text-white" : "text-slate-400 hover:text-white"
                }`}
                title="Table View"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Filter Controls & Search */}
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
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all whitespace-nowrap border ${
                    active
                      ? "bg-white text-slate-950 border-white font-bold"
                      : "bg-white/[0.03] border-white/[0.06] text-slate-400 hover:text-white hover:bg-white/[0.06]"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search title, engine, developer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0d1017] border border-white/[0.08] rounded-lg pl-9 pr-8 py-1.5 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* PORT CONTENT */}
        {loading ? (
          <div className="py-24 text-center text-slate-500 font-mono text-xs">
            Scanning ledger...
          </div>
        ) : filteredProjects.length > 0 ? (
          viewMode === "cards" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProjects.map((p) => {
                const stageStyle = getStageColor(p.current_stage);
                const sub = getSubredditInfo(p.reddit_url);
                const isSelected = selectedProject?.id === p.id;
                const isCopied = copiedId === p.id;

                return (
                  <div
                    key={p.id}
                    className={`rounded-xl border p-5 flex flex-col justify-between transition-all duration-200 bg-[#0c0e15] relative group ${
                      isSelected
                        ? "border-sky-500/50 shadow-lg shadow-sky-500/10"
                        : "border-white/[0.08] hover:border-white/20"
                    }`}
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono uppercase text-slate-400 bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.06]">
                            {p.original_platform || "PC"}
                          </span>
                          {sub && (
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${sub.color}`}>
                              {sub.name}
                            </span>
                          )}
                        </div>

                        <span
                          className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${stageStyle.bg} ${stageStyle.border} ${stageStyle.text}`}
                        >
                          {String(p.current_stage || "wip").replace("_", " ")}
                        </span>
                      </div>

                      {/* Title */}
                      <Link to={`/projects/${p.slug}`} className="block group-hover:text-sky-300 transition-colors">
                        <h3 className="text-base font-bold text-white tracking-tight leading-snug">
                          {p.game_title || p.display_name}
                        </h3>
                      </Link>

                      {/* Technical Summary */}
                      <p className="text-xs text-slate-300 mt-2 line-clamp-2 leading-relaxed">
                        {p.summary}
                      </p>

                      {/* Hardware Status Callout */}
                      <div className="mt-3 p-2.5 rounded-lg bg-black/40 border border-white/[0.04] text-[11px] font-mono">
                        <span className="text-slate-500 block text-[9px] uppercase tracking-wider mb-0.5">Tested Hardware Playability:</span>
                        <span className="text-slate-200 block">
                          {p.performance_notes || p.playability_notes || "ARMv7 binary execution."}
                        </span>
                      </div>
                    </div>

                    {/* Bottom Actions Bar */}
                    <div className="pt-3.5 mt-4 border-t border-white/[0.06] flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleSelectFor3D(p)}
                        className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-white transition-colors"
                      >
                        <Gamepad2 className="w-3.5 h-3.5 text-sky-400" />
                        <span>Boot on 3D Vita</span>
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => handleCopyLink(p, e)}
                          className="p-1.5 rounded bg-white/[0.03] hover:bg-white/[0.08] text-slate-400 hover:text-white transition-colors border border-white/[0.06]"
                          title="Copy project link"
                        >
                          {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Share2 className="w-3 h-3" />}
                        </button>

                        {p.reddit_url && (
                          <a
                            href={p.reddit_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => playSound("blip")}
                            className="inline-flex items-center gap-1 text-xs font-mono font-medium px-2.5 py-1 rounded bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 transition-all"
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
          <div className="py-24 text-center text-slate-500 font-mono text-xs">
            No projects matched your search.
          </div>
        )}
      </section>

      {/* FOOTER & OPEN FEEDS */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 border-t border-white/[0.06] text-xs text-slate-500 font-mono flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="max-w-2xl">
          <span className="text-slate-400 font-bold uppercase block mb-1">Non-Infringing Open Documentation</span>
          VitaHarbor indexes public engineering discussions on r/vitahacks and r/VitaPiracy. Zero game binaries, ISOs, or ROMs are hosted or distributed. All ports require legitimate game assets.
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <a
            href="/api/feed.json"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sky-400 hover:underline"
          >
            JSON Feed
          </a>
          <span className="text-slate-600">·</span>
          <a
            href="/api/rss.xml"
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-400 hover:underline"
          >
            RSS 2.0
          </a>
        </div>
      </footer>

    </div>
  );
};
