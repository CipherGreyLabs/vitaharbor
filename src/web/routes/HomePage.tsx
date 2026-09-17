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
  Filter,
  Sparkles,
  Plus,
  X,
  Cpu,
  FileText,
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight
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

const ENGINE_TABS = [
  "All Engines",
  "vitaGL",
  "ARMv7",
  "Decomp",
  "Unity",
  "Native C++"
];

const STAGES_ORDER = ["research", "early_wip", "booting", "in_game", "playable", "released"];

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
  const [selectedEngine, setSelectedEngine] = useState("All Engines");
  const [sortBy, setSortBy] = useState<"activity" | "stage" | "name">("activity");
  const [selectedProject, setSelectedProject] = useState<SelectedProjectView | null>(null);
  const [inspectingProject, setInspectingProject] = useState<any | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // Community submission form state

  const heroRef = useRef<HTMLDivElement>(null);

  // Web Audio synthesizer for tactile PS Vita UI feedback
  const playSound = (type: "blip" | "boot" | "click" = "blip") => {
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
        osc.frequency.setValueAtTime(340, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(720, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.22);
      } else {
        osc.type = "sine";
        osc.frequency.setValueAtTime(560, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(840, ctx.currentTime + 0.04);
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

    if (selectedEngine !== "All Engines") {
      const q = selectedEngine.toLowerCase();
      list = list.filter(
        (p) =>
          p.technologies?.some((t: string) => t.toLowerCase().includes(q)) ||
          p.summary?.toLowerCase().includes(q)
      );
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
  }, [projects, selectedFilter, selectedEngine, sortBy, searchTerm]);

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
    if (heroRef.current) {
      heroRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
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
          bg: "bg-emerald-500/15",
          border: "border-emerald-500/40",
          text: "text-emerald-400",
          dot: "bg-emerald-400"
        };
      case "in_game":
        return {
          bg: "bg-sky-500/15",
          border: "border-sky-500/40",
          text: "text-sky-400",
          dot: "bg-sky-400"
        };
      case "booting":
        return {
          bg: "bg-amber-500/15",
          border: "border-amber-500/40",
          text: "text-amber-400",
          dot: "bg-amber-400"
        };
      default:
        return {
          bg: "bg-purple-500/15",
          border: "border-purple-500/40",
          text: "text-purple-400",
          dot: "bg-purple-400"
        };
    }
  };

  const getStageStep = (stage: string) => {
    switch (stage) {
      case "research": return 1;
      case "early_wip": return 2;
      case "booting": return 3;
      case "in_game": return 4;
      case "playable":
      case "released":
      case "completable": return 5;
      default: return 2;
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
    <div className="min-h-screen bg-[#080912] text-[#f1f3f5] selection:bg-sky-500/30 selection:text-white relative overflow-hidden">
      
      {/* ATMOSPHERIC GRADIENTS & GLOWS */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1300px] h-[700px] bg-gradient-to-b from-blue-600/15 via-indigo-600/10 to-transparent blur-[140px] pointer-events-none z-0" />
      <div className="absolute top-[750px] right-0 w-[650px] h-[650px] bg-purple-900/15 blur-[170px] pointer-events-none z-0" />
      <div className="absolute top-[1400px] left-0 w-[600px] h-[600px] bg-sky-900/10 blur-[180px] pointer-events-none z-0" />

      {/* HERO SECTION */}
      <section ref={heroRef} className="relative z-10 pt-10 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        
        {/* TOP STATUS PILL, SUBMIT BUTTON & SOUND TOGGLE */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-md text-xs font-mono text-slate-300 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-white">LIVE HOMEBREW RADAR</span>
            <span className="text-slate-500">·</span>
            <span className="text-slate-400">r/vitahacks & r/VitaPiracy</span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/about"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-mono text-slate-300 hover:text-white transition-all shadow-sm"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">VERIFIED PROVENANCE</span>
              <span className="sm:hidden">VERIFIED</span>
            </Link>

            {/* Sound Toggle Button */}
            <button
              onClick={() => {
                playSound("blip");
                setSoundEnabled(!soundEnabled);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-mono text-slate-400 hover:text-white transition-all"
              title={soundEnabled ? "Mute interface sound" : "Enable interface sound"}
            >
              {soundEnabled ? (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-sky-400" />
                  <span>SOUND ON</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-slate-500" />
                  <span>MUTED</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* HERO DISPLAY HEADLINE */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-8">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-[-0.03em] text-white leading-[1.05]">
            The Underground <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-400 to-indigo-400">
              PS Vita Port Ledger
            </span>
          </h1>
          <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed max-w-2xl mx-auto">
            Engine recreations, ARM wrappers, and community experiments surface on Reddit long before homebrew databases. We index active development on real Vita hardware.
          </p>
        </div>

        {/* 3D CONSOLE SHOWCASE PODIUM */}
        <div className="relative w-full rounded-3xl border border-white/[0.08] bg-gradient-to-b from-[#0f121d]/95 via-[#0c0e17]/95 to-[#080911]/95 backdrop-blur-2xl p-4 sm:p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] overflow-hidden mb-10 group/podium">
          
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(56,189,248,0.08)_0%,_transparent_65%)] pointer-events-none" />

          {/* Quick Boot Bar with Physical Cycle Triggers */}
          <div className="relative z-20 flex items-center justify-between gap-4 pb-4 border-b border-white/[0.06] overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-2 shrink-0">
              {/* L / R Physical Triggers */}
              <button
                onClick={() => handleCycleProject("prev")}
                className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-slate-300 hover:text-white transition-all flex items-center gap-1 text-[11px] font-mono"
                title="Previous console port (L-trigger)"
              >
                <ChevronLeft className="w-3.5 h-3.5 text-sky-400" />
                <span className="hidden sm:inline">L TRIGGER</span>
              </button>

              <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400 pl-1">
                <Gamepad2 className="w-4 h-4 text-sky-400" />
                <span className="font-semibold text-slate-300">BOOT:</span>
              </div>
            </div>

            {/* Quick Port Pills */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              {projects.slice(0, 6).map((p) => {
                const isActive = selectedProject?.id === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => handleSelectFor3D(p)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 border flex items-center gap-1.5 ${
                      isActive
                        ? "bg-sky-500/20 border-sky-500/60 text-sky-300 shadow-md shadow-sky-500/20 font-semibold"
                        : "bg-white/[0.03] border-white/[0.06] text-slate-400 hover:text-white hover:bg-white/[0.08]"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-sky-400 animate-ping" : "bg-slate-600"}`} />
                    <span>{p.display_name?.split(" (")[0] || p.game_title}</span>
                  </button>
                );
              })}
            </div>

            {/* R Trigger */}
            <button
              onClick={() => handleCycleProject("next")}
              className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-slate-300 hover:text-white transition-all flex items-center gap-1 text-[11px] font-mono shrink-0"
              title="Next console port (R-trigger)"
            >
              <span className="hidden sm:inline">R TRIGGER</span>
              <ChevronRight className="w-3.5 h-3.5 text-sky-400" />
            </button>
          </div>

          {/* 3D Vita Model Stage */}
          <div className="relative w-full h-[380px] sm:h-[480px] lg:h-[540px] flex items-center justify-center">
            <VitaConsoleScene
              selectedProject={selectedProject}
              align="center"
              onConsoleClick={() => {
                if (selectedProject) {
                  const match = projects.find(p => p.id === selectedProject.id);
                  if (match) setInspectingProject(match);
                }
              }}
            />

            {/* 3D Prompt Badge */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none z-20">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0b0e17]/85 border border-white/10 backdrop-blur-md text-[11px] font-mono text-slate-400 shadow-lg">
                <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                <span>Drag to tilt · Click screen for technical inspector</span>
              </div>
            </div>
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

        {/* FRESH REDDIT SIGNALS BAR */}
        <div className="rounded-2xl bg-gradient-to-r from-[#0e121d] via-[#111624] to-[#0f1422] border border-white/[0.08] p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-2.5 text-xs font-mono shrink-0">
            <Radio className="w-4 h-4 text-sky-400 animate-pulse" />
            <span className="text-white font-bold tracking-wide uppercase">Fresh Reddit Signals:</span>
          </div>

          <div className="flex items-center gap-4 overflow-x-auto no-scrollbar w-full text-xs">
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
                    <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded border ${sub.color}`}>
                      {sub.name}
                    </span>
                  )}
                  <span className="max-w-[220px] sm:max-w-[300px] truncate">{u.title}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-white shrink-0" />
                </a>
              );
            })}
          </div>

          <Link
            to="/updates"
            onClick={() => playSound("blip")}
            className="text-xs font-medium text-sky-400 hover:text-sky-300 hover:underline shrink-0 flex items-center gap-1"
          >
            <span>All signals</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* PORT LEDGER DIRECTORY */}
      <section id="ledger" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        
        {/* Section Header & View Controls */}
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
              Real hardware playability, active engine wrappers, and direct verified Reddit development threads.
            </p>
          </div>

          {/* Controls: Sort Dropdown & View Mode Switcher */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-slate-300">
              <ArrowUpDown className="w-3.5 h-3.5 text-sky-400" />
              <span className="text-slate-500 text-[10px] uppercase">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => {
                  playSound("blip");
                  setSortBy(e.target.value as any);
                }}
                className="bg-transparent text-white border-none focus:outline-none cursor-pointer text-xs"
              >
                <option value="activity" className="bg-[#0f121d] text-white">Recently Active</option>
                <option value="stage" className="bg-[#0f121d] text-white">Stage Progress</option>
                <option value="name" className="bg-[#0f121d] text-white">Name (A–Z)</option>
              </select>
            </div>

            <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/[0.08]">
              <button
                onClick={() => {
                  playSound("blip");
                  setViewMode("grid");
                }}
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
                onClick={() => {
                  playSound("blip");
                  setViewMode("table");
                }}
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
        </div>

        {/* Filter Controls: Category Tabs & Search */}
        <div className="space-y-4 mb-8">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            
            {/* Category Stage Pills */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              {CATEGORY_TABS.map((tab) => {
                const active = selectedFilter === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => {
                      playSound("blip");
                      setSelectedFilter(tab.key);
                    }}
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

            {/* Instant Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search game, engine, developer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#101420] border border-white/[0.08] rounded-xl pl-10 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/30 transition-all shadow-inner"
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

          {/* Engine / Tech Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1 text-xs">
            <span className="text-slate-500 font-mono text-[11px] shrink-0 flex items-center gap-1 mr-1">
              <Filter className="w-3 h-3 text-sky-400" />
              <span>TECH:</span>
            </span>
            {ENGINE_TABS.map((engine) => {
              const active = selectedEngine === engine;
              return (
                <button
                  key={engine}
                  onClick={() => {
                    playSound("blip");
                    setSelectedEngine(engine);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all whitespace-nowrap border ${
                    active
                      ? "bg-sky-500/20 border-sky-500/50 text-sky-300 font-semibold"
                      : "bg-white/[0.02] border-white/[0.04] text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]"
                  }`}
                >
                  {engine}
                </button>
              );
            })}
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
                const step = getStageStep(p.current_stage);
                const isSelected = selectedProject?.id === p.id;
                const sub = getSubredditInfo(p.reddit_url);
                const isCopied = copiedId === p.id;

                return (
                  <div
                    id={`card-${p.id}`}
                    key={p.id}
                    className={`rounded-2xl border p-5 flex flex-col justify-between transition-all duration-300 bg-gradient-to-b from-[#0f1320]/90 to-[#0a0d17]/90 backdrop-blur-md relative group hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-sky-500/10 ${
                      isSelected
                        ? "border-sky-500/60 shadow-lg shadow-sky-500/15 ring-1 ring-sky-500/20"
                        : "border-white/[0.08] hover:border-white/20"
                    }`}
                  >
                    <div>
                      {/* Top Header: Platform & Stage Badges */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-300 bg-white/[0.05] px-2.5 py-1 rounded-md border border-white/[0.08]">
                            {p.original_platform || "PC / Console"}
                          </span>
                          {sub && (
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${sub.color}`}>
                              {sub.name}
                            </span>
                          )}
                        </div>

                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider border ${stageStyle.bg} ${stageStyle.border} ${stageStyle.text}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${stageStyle.dot}`} />
                          {String(p.current_stage || "wip").replace("_", " ")}
                        </span>
                      </div>

                      {/* Game Title - Clicking opens Inspector Modal */}
                      <div
                        onClick={() => {
                          playSound("blip");
                          setInspectingProject(p);
                        }}
                        className="cursor-pointer group-hover:text-sky-300 transition-colors"
                      >
                        <h3 className="text-lg font-bold text-white tracking-tight leading-snug">
                          {p.game_title || p.display_name}
                        </h3>
                      </div>

                      {/* Technical Summary */}
                      <p className="text-xs text-slate-400 mt-2.5 line-clamp-2 leading-relaxed">
                        {p.summary || "Native PlayStation Vita porting effort."}
                      </p>

                      {/* Stage Progress Stepper (5 Milestones) */}
                      <div className="mt-4 pt-3 border-t border-white/[0.04]">
                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mb-1.5">
                          <span>MILESTONE PROGRESS:</span>
                          <span className="text-sky-400 font-semibold">STAGE {step}/5</span>
                        </div>
                        <div className="grid grid-cols-5 gap-1.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <div
                              key={s}
                              className={`h-1.5 rounded-full transition-all duration-300 ${
                                s <= step ? "bg-sky-400 shadow-sm shadow-sky-400/50" : "bg-white/[0.06]"
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Hardware Status Callout */}
                      <div
                        onClick={() => {
                          playSound("blip");
                          setInspectingProject(p);
                        }}
                        className="mt-3.5 p-2.5 rounded-xl bg-black/40 hover:bg-black/60 border border-white/[0.05] text-[11px] font-mono cursor-pointer transition-colors"
                        title="Click to view full hardware telemetry"
                      >
                        <span className="text-slate-500 block mb-0.5 uppercase tracking-wider text-[9px]">Hardware Status:</span>
                        <span className="text-slate-200">
                          {p.performance_notes || p.playability_notes || "ARMv7 execution targeting SGX543MP4+."}
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

                    {/* Bottom Actions Bar */}
                    <div className="pt-4 mt-5 border-t border-white/[0.06] flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleSelectFor3D(p)}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors"
                        title="Render this port on the 3D console screen"
                      >
                        <Gamepad2 className="w-3.5 h-3.5 text-sky-400" />
                        <span>Boot on 3D Vita</span>
                      </button>

                      <div className="flex items-center gap-2">
                        {/* Technical Inspector Button */}
                        <button
                          onClick={() => {
                            playSound("blip");
                            setInspectingProject(p);
                          }}
                          className="p-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] text-slate-400 hover:text-white transition-colors border border-white/[0.06]"
                          title="Open Technical Thread Inspector"
                        >
                          <FileText className="w-3.5 h-3.5 text-sky-400" />
                        </button>

                        {/* Share Button */}
                        <button
                          onClick={(e) => handleCopyLink(p, e)}
                          className="p-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] text-slate-400 hover:text-white transition-colors border border-white/[0.06]"
                          title="Copy direct link to this project"
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                        </button>

                        {/* Direct Verified Reddit Thread Link */}
                        {p.reddit_url && (
                          <a
                            href={p.reddit_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => playSound("blip")}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 text-sky-400 border border-sky-500/25 transition-all group/btn"
                          >
                            <span>Reddit Thread</span>
                            <ExternalLink className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
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
            No projects matched your criteria.
          </div>
        )}
      </section>

      {/* TECHNICAL THREAD INSPECTOR DRAWER / MODAL */}
      {inspectingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-2xl rounded-3xl border border-white/10 bg-[#0d101a] p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh] text-left">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-5 mb-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 bg-white/[0.05] px-2.5 py-1 rounded-md border border-white/[0.08]">
                    {inspectingProject.original_platform || "PC / Console"}
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded-md border border-sky-500/20 font-semibold">
                    {String(inspectingProject.current_stage || "wip").replace("_", " ")}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  {inspectingProject.game_title || inspectingProject.display_name}
                </h2>
              </div>

              <button
                onClick={() => {
                  playSound("blip");
                  setInspectingProject(null);
                }}
                className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Technical Overview */}
            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">Port Overview</h4>
                <p className="text-sm text-slate-300 leading-relaxed bg-white/[0.02] p-4 rounded-xl border border-white/[0.05]">
                  {inspectingProject.summary}
                </p>
              </div>

              {/* Hardware Requirements & Required Plugins */}
              <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.06] space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono text-sky-400">
                  <Cpu className="w-4 h-4" />
                  <span className="font-semibold uppercase">Hardware & Plugin Checklist:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>libshacccg.suprx (Shader runtime)</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>kubridge.skprx / fd_fix.skprx</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Target Clock: 444 MHz / 500 MHz</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>RAM Cap: 512MB Unified Memory</span>
                  </div>
                </div>
              </div>

              {/* Verified Playability & Framerate telemetry */}
              <div>
                <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">Live Hardware Telemetry</h4>
                <div className="p-4 rounded-xl bg-sky-500/[0.04] border border-sky-500/20 text-xs text-sky-200 font-mono leading-relaxed">
                  {inspectingProject.performance_notes || inspectingProject.playability_notes || "Stable ARM execution targeting SGX543MP4+."}
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/10">
                <button
                  onClick={() => {
                    handleSelectFor3D(inspectingProject);
                    setInspectingProject(null);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 hover:text-white font-mono text-xs transition-colors border border-white/[0.08]"
                >
                  <Gamepad2 className="w-4 h-4 text-sky-400" />
                  <span>Boot on 3D Console</span>
                </button>

                {inspectingProject.reddit_url && (
                  <a
                    href={inspectingProject.reddit_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs transition-colors shadow-lg shadow-sky-500/20"
                  >
                    <span>Open Reddit Discussion</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PUBLIC OPEN API & ZERO PIRACY FOOTER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 border-t border-white/[0.06] text-xs text-slate-500 font-mono leading-relaxed space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="max-w-3xl">
            <strong className="text-slate-400 uppercase tracking-wider block mb-1">Independent Community Engineering Tracker</strong>
            VitaHarbor documents reverse-engineering milestones from r/vitahacks and r/VitaPiracy. We do not host, link to, or distribute ROMs, ISOs, VPK game binaries, or copyrighted assets. All projects require original game assets from legitimate purchases.
          </div>
          <div className="shrink-0 flex items-center gap-3">
            <a
              href="/api/feed.json"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sky-400 hover:text-sky-300 bg-sky-500/10 border border-sky-500/20 px-3 py-1.5 rounded-lg transition-colors"
            >
              <span>JSON FEED</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="/api/rss.xml"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-amber-400 hover:text-amber-300 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-lg transition-colors"
            >
              <span>RSS 2.0</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </section>

    </div>
  );
};
