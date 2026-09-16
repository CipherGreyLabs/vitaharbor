import React, { useState } from "react";
import { Link } from "react-router-dom";
import { StatusBadge } from "../ui/StatusBadge";
import { formatRelativeTime } from "@/shared/utils";
import type { ProjectCardData } from "./ProjectCard";
import { ChevronDown, ChevronUp, ExternalLink } from "lucide-react";

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
    <div className="w-full border border-[#242830] bg-[#0f1113] rounded-[2px] overflow-hidden">
      {/* Table Header */}
      <div className="grid grid-cols-12 gap-2 px-3.5 py-2.5 bg-[#08090a] border-b border-[#242830] font-mono text-[10px] text-[#7c848d] uppercase tracking-wider">
        <div className="col-span-3 sm:col-span-2">STATUS</div>
        <div className="col-span-6 sm:col-span-4">GAME / PORT PROJECT</div>
        <div className="hidden sm:block sm:col-span-2">AUTHOR(S)</div>
        <div className="hidden md:block md:col-span-2">ENGINE & WRAPPER</div>
        <div className="col-span-3 sm:col-span-2 text-right">LAST SIGNAL</div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-[#242830]/60">
        {projects.map((p) => {
          const isSelected = selectedId === p.id;
          const isExpanded = expandedId === p.id;

          return (
            <div
              key={p.id}
              onClick={() => onSelectProject && onSelectProject(p)}
              className={`transition-colors cursor-pointer ${
                isSelected
                  ? "bg-[#1c2024] border-l-2 border-l-[#3ad2ff]"
                  : "hover:bg-[#1c2024]"
              }`}
            >
              {/* Row Summary Grid */}
              <div className="grid grid-cols-12 gap-2 px-3.5 py-3 items-center text-xs">
                {/* Status Column */}
                <div className="col-span-3 sm:col-span-2 flex items-center gap-1.5">
                  <StatusBadge type="stage" value={p.current_stage} />
                </div>

                {/* Game & Port Title */}
                <div className="col-span-6 sm:col-span-4 pr-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-[#f4f6f8] hover:text-[#3ad2ff] transition-colors leading-tight truncate">
                      {p.game_title || p.display_name}
                    </span>
                    {p.original_platform && (
                      <span className="hidden lg:inline-block font-mono text-[9px] text-[#7c848d] uppercase flex-shrink-0">
                        [{p.original_platform}]
                      </span>
                    )}
                  </div>
                  {p.display_name && p.display_name !== p.game_title && (
                    <span className="font-mono text-[10px] text-[#3ad2ff] block truncate mt-0.5">
                      {p.display_name}
                    </span>
                  )}
                </div>

                {/* Authors Column */}
                <div className="hidden sm:block sm:col-span-2 font-mono text-[11px] text-[#a3acb5] truncate">
                  {p.developers && p.developers.length > 0
                    ? p.developers.map((d) => d.display_name).join(", ")
                    : "Independent"}
                </div>

                {/* Technology Column */}
                <div className="hidden md:block md:col-span-2 font-mono text-[10px] text-[#7c848d] truncate">
                  {p.technologies && p.technologies.length > 0
                    ? p.technologies.join(" · ")
                    : "Native ARM"}
                </div>

                {/* Last Signal / Expand Action */}
                <div className="col-span-3 sm:col-span-2 flex items-center justify-end gap-2 font-mono text-[10px] text-[#7c848d]">
                  <span>{formatRelativeTime(p.last_activity_at)}</span>
                  <button
                    onClick={(e) => toggleExpand(p.id, e)}
                    className="p-1 hover:text-[#3ad2ff] text-[#a3acb5] transition-colors"
                    aria-label="Toggle details"
                  >
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Inline Expansion Drawer */}
              {isExpanded && (
                <div className="px-4 py-3 bg-[#08090a]/90 border-t border-[#242830] space-y-3 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <span className="font-mono text-[10px] text-[#3ad2ff] uppercase tracking-wider block">
                        // Playability Status
                      </span>
                      <p className="text-xs text-[#f4f6f8] leading-relaxed bg-[#0f1113] p-2.5 rounded-[2px] border border-[#242830]">
                        {p.playability_notes || "Playability verified on real hardware."}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="font-mono text-[10px] text-[#10b981] uppercase tracking-wider block">
                        // Framerate & Shaders
                      </span>
                      <p className="text-xs text-[#f4f6f8] leading-relaxed bg-[#0f1113] p-2.5 rounded-[2px] border border-[#242830]">
                        {p.performance_notes || "Smooth framerate lock targeting 960x544 OLED display."}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#242830]/60 font-mono text-[10px] text-[#7c848d]">
                    <div className="flex items-center gap-3">
                      <span>ORIGINAL: {p.original_platform || "N/A"}</span>
                      <span>·</span>
                      <span>TECH: {p.technologies?.join(", ") || "Native"}</span>
                    </div>

                    <Link
                      to={`/projects/${p.slug}`}
                      className="text-[#3ad2ff] hover:underline inline-flex items-center gap-1 font-semibold"
                    >
                      <span>Full Project Record & Timeline</span>
                      <ExternalLink className="w-3 h-3" />
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
