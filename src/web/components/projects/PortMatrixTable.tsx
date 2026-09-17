import React, { useState } from "react";
import { Link } from "react-router-dom";
import { StatusBadge } from "../ui/StatusBadge";
import { formatRelativeTime } from "@/shared/utils";
import type { ProjectCardData } from "./ProjectCard";
import { ChevronDown, ChevronUp, ExternalLink, Cpu, Gamepad2, ArrowRight } from "lucide-react";

interface PortMatrixTableProps {
  projects: ProjectCardData[];
  selectedId?: number;
  onSelectProject?: (project: ProjectCardData) => void;
}

export const PortMatrixTable: React.FC<PortMatrixTableProps> = ({
  projects,
  selectedId,
  onSelectProject
}) => {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const toggleExpand = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="w-full border border-white/10 bg-[#0d1016]/90 backdrop-blur-md rounded-xl overflow-hidden shadow-2xl">
      {/* Table Header */}
      <div className="grid grid-cols-12 gap-3 px-4 py-3 bg-[#080a0e] border-b border-white/10 text-xs font-mono text-slate-400 uppercase tracking-wider">
        <div className="col-span-4 sm:col-span-2">Stage</div>
        <div className="col-span-5 sm:col-span-4">Port / Decompilation</div>
        <div className="hidden sm:block sm:col-span-2">Engineer</div>
        <div className="hidden md:block md:col-span-2">Engine / Method</div>
        <div className="col-span-3 sm:col-span-2 text-right">Reddit Source</div>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-white/5">
        {projects.map((p) => {
          const isSelected = selectedId === p.id;
          const isExpanded = expandedId === p.id;

          return (
            <div
              key={p.id}
              onClick={() => onSelectProject && onSelectProject(p)}
              className={`transition-all cursor-pointer group ${
                isSelected
                  ? "bg-cyan-950/20 border-l-2 border-l-cyan-400"
                  : "hover:bg-white/[0.02] border-l-2 border-l-transparent"
              }`}
            >
              {/* Row Summary Grid */}
              <div className="grid grid-cols-12 gap-3 px-4 py-3.5 items-center text-xs">
                {/* Status Column */}
                <div className="col-span-4 sm:col-span-2 flex items-center">
                  <StatusBadge type="stage" value={p.current_stage} />
                </div>

                {/* Game & Port Title */}
                <div className="col-span-5 sm:col-span-4 pr-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white group-hover:text-cyan-400 transition-colors leading-snug truncate">
                      {p.game_title || p.display_name}
                    </span>
                    {p.original_platform && (
                      <span className="hidden lg:inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-mono bg-white/5 text-slate-400 uppercase flex-shrink-0">
                        {p.original_platform}
                      </span>
                    )}
                  </div>
                  {p.display_name && p.display_name !== p.game_title && (
                    <span className="font-mono text-[11px] text-cyan-400/80 block truncate mt-0.5">
                      {p.display_name}
                    </span>
                  )}
                </div>

                {/* Authors Column */}
                <div className="hidden sm:block sm:col-span-2 font-mono text-xs text-slate-300 truncate">
                  {p.developers && p.developers.length > 0
                    ? p.developers.map((d) => d.display_name).join(", ")
                    : "Community Decomp"}
                </div>

                {/* Technology Column */}
                <div className="hidden md:block md:col-span-2 font-mono text-xs text-slate-400 truncate">
                  {p.technologies && p.technologies.length > 0
                    ? p.technologies.join(" · ")
                    : "Native ARM"}
                </div>

                {/* Reddit Source / Expand Action */}
                <div className="col-span-3 sm:col-span-2 flex items-center justify-end gap-2 font-mono text-xs">
                  {p.reddit_url && (
                    <a
                      href={p.reddit_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 hover:text-cyan-300 text-[11px] transition-colors border border-cyan-500/20"
                      title="Open verified Reddit thread"
                    >
                      <span>Reddit</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  <button
                    onClick={(e) => toggleExpand(p.id, e)}
                    className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                    aria-label="Toggle details"
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-cyan-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Inline Expansion Drawer */}
              {isExpanded && (
                <div className="px-5 py-4 bg-black/40 border-t border-white/5 space-y-3.5 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    <div className="space-y-1.5 bg-[#0f131a] p-3.5 rounded-lg border border-white/5">
                      <div className="flex items-center gap-1.5 text-cyan-400 font-mono text-[11px] uppercase tracking-wider font-semibold">
                        <Gamepad2 className="w-3.5 h-3.5" />
                        Playability & Input Status
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {p.playability_notes || "Playability verified on real PS Vita hardware."}
                      </p>
                    </div>

                    <div className="space-y-1.5 bg-[#0f131a] p-3.5 rounded-lg border border-white/5">
                      <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-[11px] uppercase tracking-wider font-semibold">
                        <Cpu className="w-3.5 h-3.5" />
                        Hardware Framerate & Shaders
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {p.performance_notes || "Smooth framerate lock targeting native OLED 960x544 resolution."}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs font-mono text-slate-400 border-t border-white/5">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">Summary:</span>
                      <span className="text-white font-sans">{p.summary}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {p.reddit_url && (
                        <a
                          href={p.reddit_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1 rounded bg-white/5 hover:bg-white/10 text-slate-200 transition-colors border border-white/10"
                        >
                          <span>Open Reddit Discussion</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      <Link
                        to={`/projects/${p.slug}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 transition-colors font-medium"
                      >
                        <span>Project Timeline</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

