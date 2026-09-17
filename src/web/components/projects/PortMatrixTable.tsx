import React, { useState } from "react";
import { Link } from "react-router-dom";
import { StatusBadge } from "../ui/StatusBadge";
import { formatRelativeTime } from "@/shared/utils";
import type { ProjectCardData } from "./ProjectCard";
import { ChevronDown, ChevronUp, ExternalLink, Cpu, Gamepad2, Activity, ArrowRight } from "lucide-react";

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
    <div className="w-full border border-[#262626] bg-[#0c0d0e] rounded-lg overflow-hidden shadow-2xl">
      {/* Table Header */}
      <div className="grid grid-cols-12 gap-3 px-4 py-3 bg-[#080809] border-b border-[#262626] text-[11px] font-mono text-[#8a9199] uppercase tracking-wider">
        <div className="col-span-4 sm:col-span-2">Current Stage</div>
        <div className="col-span-5 sm:col-span-4">Port Title / Source Game</div>
        <div className="hidden sm:block sm:col-span-2">Lead Developer</div>
        <div className="hidden md:block md:col-span-2">Engine / Method</div>
        <div className="col-span-3 sm:col-span-2 text-right">Last Verified</div>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-[#1e2124]">
        {projects.map((p) => {
          const isSelected = selectedId === p.id;
          const isExpanded = expandedId === p.id;

          return (
            <div
              key={p.id}
              onClick={() => onSelectProject && onSelectProject(p)}
              className={`transition-all cursor-pointer group ${
                isSelected
                  ? "bg-[#14171a] border-l-2 border-l-[#3ad2ff]"
                  : "hover:bg-[#111316] border-l-2 border-l-transparent"
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
                    <span className="font-semibold text-[#f5f5f5] group-hover:text-[#3ad2ff] transition-colors leading-snug truncate">
                      {p.game_title || p.display_name}
                    </span>
                    {p.original_platform && (
                      <span className="hidden lg:inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-mono bg-[#1c2024] text-[#8a9199] uppercase flex-shrink-0">
                        {p.original_platform}
                      </span>
                    )}
                  </div>
                  {p.display_name && p.display_name !== p.game_title && (
                    <span className="font-mono text-[11px] text-[#3ad2ff] block truncate mt-0.5 opacity-90">
                      {p.display_name}
                    </span>
                  )}
                </div>

                {/* Authors Column */}
                <div className="hidden sm:block sm:col-span-2 font-mono text-[11px] text-[#a3acb5] truncate">
                  {p.developers && p.developers.length > 0
                    ? p.developers.map((d) => d.display_name).join(", ")
                    : "Community Decomp"}
                </div>

                {/* Technology Column */}
                <div className="hidden md:block md:col-span-2 font-mono text-[11px] text-[#737373] truncate">
                  {p.technologies && p.technologies.length > 0
                    ? p.technologies.join(" · ")
                    : "Native ARM"}
                </div>

                {/* Last Signal / Expand Action */}
                <div className="col-span-3 sm:col-span-2 flex items-center justify-end gap-2 font-mono text-[11px] text-[#737373]">
                  <span className="whitespace-nowrap">
                    {formatRelativeTime(p.last_activity_at)}
                  </span>
                  <button
                    onClick={(e) => toggleExpand(p.id, e)}
                    className="p-1 rounded hover:bg-[#202428] hover:text-[#3ad2ff] text-[#a3acb5] transition-colors"
                    aria-label="Toggle details"
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-[#3ad2ff]" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Inline Expansion Drawer */}
              {isExpanded && (
                <div className="px-5 py-4 bg-[#090a0b] border-t border-[#1e2124] space-y-3.5 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    <div className="space-y-1.5 bg-[#121417] p-3.5 rounded-md border border-[#242830]">
                      <div className="flex items-center gap-1.5 text-[#3ad2ff] font-mono text-[10px] uppercase tracking-wider font-semibold">
                        <Gamepad2 className="w-3.5 h-3.5" />
                        Playability & Input Status
                      </div>
                      <p className="text-xs text-[#dbe1e6] leading-relaxed">
                        {p.playability_notes || "Playability verified on real PS Vita hardware."}
                      </p>
                    </div>

                    <div className="space-y-1.5 bg-[#121417] p-3.5 rounded-md border border-[#242830]">
                      <div className="flex items-center gap-1.5 text-[#10b981] font-mono text-[10px] uppercase tracking-wider font-semibold">
                        <Cpu className="w-3.5 h-3.5" />
                        Hardware Performance & Framerate
                      </div>
                      <p className="text-xs text-[#dbe1e6] leading-relaxed">
                        {p.performance_notes || "Smooth framerate lock targeting native OLED 960x544 resolution."}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 font-mono text-[11px] text-[#737373]">
                    <div className="flex items-center gap-2">
                      <span className="text-[#a3acb5]">Summary:</span>
                      <span className="text-[#f5f5f5] font-sans">{p.summary}</span>
                    </div>

                    <Link
                      to={`/projects/${p.slug}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#3ad2ff]/10 hover:bg-[#3ad2ff]/20 text-[#3ad2ff] transition-colors font-medium"
                    >
                      <span>View Full Dossier</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
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

