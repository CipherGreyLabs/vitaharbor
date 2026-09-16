import React from "react";
import { Link } from "react-router-dom";
import { StatusBadge } from "../ui/StatusBadge";
import { formatRelativeTime, deriveActivityLevel } from "@/shared/utils";
import type { DevelopmentStage, ProjectLifecycle } from "@/shared/types";

export interface ProjectCardData {
  id: number;
  slug: string;
  display_name: string | null;
  game_title?: string;
  original_platform?: string | null;
  current_stage: DevelopmentStage;
  lifecycle: ProjectLifecycle;
  summary: string;
  last_activity_at: string | Date;
  technologies?: string[];
  developers?: { id: number; display_name: string; role: string; slug: string }[];
}

export const ProjectCard: React.FC<{ project: ProjectCardData }> = ({ project }) => {
  const dateObj = typeof project.last_activity_at === "string" ? new Date(project.last_activity_at) : project.last_activity_at;
  const activityLevel = deriveActivityLevel(dateObj);
  const isDistinctPortName = project.display_name && project.game_title && project.display_name !== project.game_title;

  return (
    <Link
      to={`/projects/${project.slug}`}
      className="card-panel-hover p-4 flex flex-col justify-between group block"
    >
      <div>
        {/* Stage & Activity Badges (Blueprint §73) */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <StatusBadge type="stage" value={project.current_stage} />
          <StatusBadge type="activity" value={activityLevel} />
        </div>

        {/* Game Title */}
        <h3 className="text-sm font-semibold text-[#edf5ff] group-hover:text-[#249cf4] transition-colors leading-snug">
          {project.game_title || project.display_name || project.slug}
        </h3>

        {/* Port Differentiator if needed */}
        {isDistinctPortName && (
          <p className="text-[11px] text-[#9aaabd] mt-0.5 font-medium">
            {project.display_name}
          </p>
        )}

        {/* Summary */}
        <p className="text-xs text-[#9aaabd] line-clamp-2 leading-relaxed mt-2">
          {project.summary || "No description available."}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-[#202a38] space-y-1.5">
        {/* Developers & Method */}
        <div className="flex items-center justify-between text-[11px] text-[#9aaabd]">
          <span className="truncate max-w-[65%]">
            {project.developers && project.developers.length > 0
              ? project.developers.map((d) => d.display_name).join(" · ")
              : "Independent"}
          </span>
          <span className="text-[#68788c] font-mono text-[10px] truncate max-w-[35%] text-right">
            {project.technologies && project.technologies.length > 0
              ? project.technologies[0]
              : project.original_platform || "Native"}
          </span>
        </div>

        {/* Relative Timestamp */}
        <div className="text-[10px] text-[#68788c]">
          Updated {formatRelativeTime(project.last_activity_at)}
        </div>
      </div>
    </Link>
  );
};

