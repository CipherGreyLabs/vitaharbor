import React, { useState, useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { VitaConsoleScene, type SelectedProjectView } from "../components/3d/VitaConsoleScene";
import { apiGet } from "../lib/api";
import { useDocumentMeta } from "../lib/useDocumentMeta";
import {
  Search,
  ExternalLink,
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
  { key: "all", label: "All Works" },
  { key: "wip", label: "In-Flight / WIP" },
  { key: "playable", label: "Playable Builds" },
  { key: "booting", label: "Booting & Research" }
];

export const HomePage: React.FC = () => {
  useDocumentMeta({
    title: "VitaHarbor — Hardware Port Archive",
    description: "An open, hardware-verified archive of PlayStation Vita ports, engine decompilations, and ARM wrappers."
  });

  const [stats, setStats] = useState<StatsData | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [recentUpdates, setRecentUpdates] = useState<any[]>([]);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [selectedProject, setSelectedProject] = useState<SelectedProjectView | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const consoleStageRef = useRef<HTMLDivElement>(null);

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
        osc.frequency.setValueAtTime(260, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(520, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.15);
      } else {
        osc.type = "sine";
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.03);
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
    if (consoleStageRef.current) {
      consoleStageRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
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

  const formatStage = (stage: string) => {
    switch (stage) {
      case "in_game": return "In-Game";
      case "booting": return "Booting";
      case "early_wip": return "Early Research";
      case "playable": return "Playable";
      case "released": return "Released";
      default: return stage;
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0e11] text-[#e4e5e9] selection:bg-[#2563eb] selection:text-white font-sans antialiased">
      
      {/* 1. ANALOGUE / TEENAGE ENGINEERING STYLE TOP NAV */}
      <header className="border-b border-[#212328] bg-[#0d0e11]/95 sticky top-0 z-50">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 h-14 flex items-center justify-between font-mono text-xs text-[#8c919c]">
          <div className="flex items-center gap-6">
            <Link to="/" className="text-white font-bold tracking-tight text-sm flex items-center gap-2">
              <span className="w-2 h-2 bg-white rounded-none" />
              VitaHarbor
            </Link>
            <span className="hidden sm:inline text-[#40444c]">/</span>
            <span className="hidden sm:inline">PCH-1000 Hardware Ledger</span>
          </div>

          <div className="flex items-center gap-6">
            <span className="hidden md:inline text-[#8c919c]">
              Sources: <span className="text-white">r/vitahacks</span> & <span className="text-white">r/VitaPiracy</span>
            </span>
            <span className="text-[#40444c]">/</span>
            <button
              onClick={() => {
                playSound("blip");
                setSoundEnabled(!soundEnabled);
              }}
              className="text-[#8c919c] hover:text-white transition-colors flex items-center gap-1.5"
            >
              {soundEnabled ? (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-[#3b82f6]" />
                  <span className="text-white">Audio On</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-[#555964]" />
                  <span>Muted</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* 2. PRODUCT HERO STAGE (STEAM DECK / ANALOGUE INSPIRATION) */}
      <section className="pt-16 pb-20 px-6 lg:px-12 max-w-[1440px] mx-auto">
        
        {/* Confident, Minimal Title Group */}
        <div className="max-w-3xl mb-12">
          <span className="font-mono text-xs uppercase tracking-widest text-[#8c919c] block mb-4">
            Independent Hardware Archive
          </span>
          <h1 className="text-5xl sm:text-7xl font-bold tracking-[-0.03em] text-white leading-[0.98]">
            PlayStation Vita <br />
            Port Archive.
          </h1>
          <p className="text-lg text-[#9da3af] mt-6 leading-relaxed font-normal max-w-xl">
            A precise record of native engine recreations, ARM wrappers, and decompilations active in the community before they appear on homebrew registries.
          </p>
        </div>

        {/* Freestanding 3D Console Studio (No Nested Gray Cards) */}
        <div ref={consoleStageRef} className="relative w-full py-8 border-y border-[#212328]">
          
          {/* Quick Hardware Switcher */}
          <div className="flex items-center justify-between gap-4 mb-6 font-mono text-xs text-[#8c919c]">
            <div className="flex items-center gap-3">
              <span className="text-white uppercase tracking-wider font-semibold">Active Specimen:</span>
              <span className="text-white">{selectedProject?.game_title || "Console Standby"}</span>
            </div>

            {/* Previous / Next Triggers */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleCycleProject("prev")}
                className="p-1 text-[#8c919c] hover:text-white transition-colors flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Prev (L)</span>
              </button>
              <span className="text-[#40444c]">|</span>
              <button
                onClick={() => handleCycleProject("next")}
                className="p-1 text-[#8c919c] hover:text-white transition-colors flex items-center gap-1"
              >
                <span>Next (R)</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 3D Model Stage */}
          <div className="relative w-full h-[400px] sm:h-[500px] lg:h-[560px] flex items-center justify-center">
            <VitaConsoleScene selectedProject={selectedProject} align="center" />
          </div>

          {/* Clean Hardware Telemetry Spec Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-[#212328] font-mono text-xs">
            <div>
              <span className="text-[#646a78] block uppercase tracking-wider mb-1">Architecture</span>
              <span className="text-white font-medium block">ARM Cortex-A9</span>
              <span className="text-[#8c919c]">Quad-Core @ 444MHz</span>
            </div>
            <div>
              <span className="text-[#646a78] block uppercase tracking-wider mb-1">Graphics</span>
              <span className="text-white font-medium block">SGX543MP4+</span>
              <span className="text-[#8c919c]">vitaGL / 128MB VRAM</span>
            </div>
            <div>
              <span className="text-[#646a78] block uppercase tracking-wider mb-1">Display Spec</span>
              <span className="text-white font-medium block">960 × 544 OLED</span>
              <span className="text-[#8c919c]">5-inch 16:9 Panel</span>
            </div>
            <div>
              <span className="text-[#646a78] block uppercase tracking-wider mb-1">Active Memory</span>
              <span className="text-white font-medium block">512MB RAM</span>
              <span className="text-[#8c919c]">Unified Memory Bus</span>
            </div>
          </div>
        </div>

        {/* Minimal Live Reddit Signal Strip */}
        <div className="pt-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 font-mono text-xs">
          <div className="flex items-center gap-2 text-white shrink-0">
            <span className="w-2 h-2 bg-[#2563eb] rounded-none" />
            <span className="font-semibold uppercase tracking-wider">Reddit Reports:</span>
          </div>

          <div className="flex items-center gap-6 overflow-x-auto no-scrollbar w-full">
            {recentUpdates.slice(0, 3).map((u) => {
              const isPiracy = u.sources?.[0]?.canonical_url?.includes("r/VitaPiracy");
              return (
                <a
                  key={u.id}
                  href={u.sources?.[0]?.canonical_url || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => playSound("blip")}
                  className="text-[#9da3af] hover:text-white transition-colors shrink-0 flex items-center gap-2 group"
                >
                  <span className="text-[#646a78]">[{isPiracy ? "r/VitaPiracy" : "r/vitahacks"}]</span>
                  <span className="truncate max-w-[280px]">{u.title}</span>
                  <ExternalLink className="w-3 h-3 opacity-60 group-hover:opacity-100" />
                </a>
              );
            })}
          </div>

          <Link
            to="/updates"
            onClick={() => playSound("blip")}
            className="text-white hover:underline shrink-0 flex items-center gap-1 font-medium"
          >
            <span>All reports</span>
            <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

      </section>

      {/* 3. THE ANALOGUE SPEC CATALOG (STREAMLINED & DIGNIFIED) */}
      <section id="directory" className="py-20 px-6 lg:px-12 max-w-[1440px] mx-auto border-t border-[#212328]">
        
        {/* Catalog Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-[#212328] mb-12">
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-[#8c919c] block mb-2">
              Verified Technical Index
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Hardware Directory
            </h2>
          </div>

          {/* Minimal Search & Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div className="flex items-center gap-1 font-mono text-xs">
              {CATEGORY_TABS.map((tab) => {
                const active = selectedFilter === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => {
                      playSound("blip");
                      setSelectedFilter(tab.key);
                    }}
                    className={`px-3 py-1.5 transition-colors ${
                      active
                        ? "bg-white text-black font-semibold"
                        : "text-[#8c919c] hover:text-white"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-[#646a78] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search works..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#14161a] border border-[#262830] pl-9 pr-3 py-1.5 text-xs font-mono text-white placeholder-[#646a78] focus:outline-none focus:border-white transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Clean Specimen Rows (Analogue Pocket Catalog Style) */}
        {loading ? (
          <div className="py-24 text-center text-[#646a78] font-mono text-xs">
            Loading hardware ledger...
          </div>
        ) : filteredProjects.length > 0 ? (
          <div className="divide-y divide-[#212328]">
            {filteredProjects.map((p, idx) => {
              const isSelected = selectedProject?.id === p.id;
              const isCopied = copiedId === p.id;

              return (
                <div
                  key={p.id}
                  onClick={() => handleSelectFor3D(p)}
                  className={`py-8 transition-colors cursor-pointer group flex flex-col lg:flex-row lg:items-start justify-between gap-6 ${
                    isSelected ? "bg-[#14161c]/40 -mx-4 px-4" : "hover:bg-[#14161c]/20"
                  }`}
                >
                  {/* Title & Identifier */}
                  <div className="max-w-xl">
                    <div className="flex items-center gap-3 font-mono text-xs text-[#646a78] mb-2">
                      <span>{String(idx + 1).padStart(2, "0")}</span>
                      <span>/</span>
                      <span className="uppercase text-[#8c919c]">{p.original_platform || "Original PC"}</span>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight group-hover:text-[#3b82f6] transition-colors">
                      {p.game_title || p.display_name}
                    </h3>

                    <p className="text-sm text-[#9da3af] mt-2.5 leading-relaxed font-normal">
                      {p.summary}
                    </p>
                  </div>

                  {/* Hardware Telemetry & Notes */}
                  <div className="lg:w-80 shrink-0 font-mono text-xs space-y-2">
                    <div className="text-[#646a78] uppercase text-[10px] tracking-wider">Hardware Status:</div>
                    <div className="text-white text-xs leading-relaxed">
                      {p.performance_notes || p.playability_notes || "ARMv7 binary execution."}
                    </div>
                    <div className="text-[#3b82f6] font-semibold pt-1">
                      Stage: {formatStage(p.current_stage)}
                    </div>
                  </div>

                  {/* Actions & Provenance */}
                  <div className="shrink-0 flex items-center lg:flex-col lg:items-end justify-between gap-4 font-mono text-xs">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectFor3D(p);
                      }}
                      className="text-[#8c919c] hover:text-white transition-colors"
                    >
                      Inspect in 3D ↗
                    </button>

                    <div className="flex items-center gap-4">
                      <button
                        onClick={(e) => handleCopyLink(p, e)}
                        className="text-[#646a78] hover:text-white transition-colors"
                        title="Copy direct permalink"
                      >
                        {isCopied ? <span className="text-[#10b981]">Copied</span> : <Share2 className="w-3.5 h-3.5" />}
                      </button>

                      {p.reddit_url && (
                        <a
                          href={p.reddit_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => {
                            e.stopPropagation();
                            playSound("blip");
                          }}
                          className="text-white hover:underline transition-colors flex items-center gap-1.5"
                        >
                          <span>Discussion</span>
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
          <div className="py-24 text-center text-[#646a78] font-mono text-xs">
            No projects matched your search.
          </div>
        )}

      </section>

      {/* 4. FOOTER & OPEN FEEDS */}
      <footer className="border-t border-[#212328] py-16 px-6 lg:px-12 max-w-[1440px] mx-auto font-mono text-xs text-[#646a78]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="max-w-2xl leading-relaxed">
            <span className="text-white uppercase font-bold block mb-1">Non-Infringing Documentation</span>
            VitaHarbor is an open research directory. We document reverse-engineering milestones from public community forums. No copyrighted game assets, ROMs, or proprietary binaries are hosted or distributed.
          </div>

          <div className="flex items-center gap-6 shrink-0 text-[#8c919c]">
            <Link to="/about" className="hover:text-white transition-colors">Methodology</Link>
            <span>/</span>
            <a href="/api/feed.json" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">JSON Feed</a>
            <span>/</span>
            <a href="/api/rss.xml" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">RSS 2.0</a>
          </div>
        </div>
      </footer>

    </div>
  );
};
