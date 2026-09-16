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
  playability_notes?: string | null;
  performance_notes?: string | null;
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
      className="terminal-card p-3.5 flex flex-col justify-between group block text-left"
    >
      <div className="space-y-2">
        {/* Top Status Strip */}
        <div className="flex items-center justify-between gap-2 border-b border-[#242830]/80 pb-2">
          <StatusBadge type="stage" value={project.current_stage} />
          <div className="flex items-center gap-1.5">
            {project.original_platform && (
              <span className="font-mono text-[9px] text-[#7c848d] uppercase tracking-wider">
                {project.original_platform}
              </span>
            )}
            <StatusBadge type="activity" value={activityLevel} />
          </div>
        </div>

        {/* Title */}
        <div>
          <h3 className="text-sm font-semibold text-[#f4f6f8] group-hover:text-[#3ad2ff] transition-colors leading-snug">
            {project.game_title || project.display_name || project.slug}
          </h3>
          {isDistinctPortName && (
            <p className="text-[11px] text-[#3ad2ff] font-mono mt-0.5">
              {project.display_name}
            </p>
          )}
        </div>

        {/* Summary Snippet */}
        <p className="text-xs text-[#a3acb5] line-clamp-2 leading-relaxed">
          {project.summary || "No technical description recorded."}
        </p>

        {/* Tech tags */}
        {project.technologies && project.technologies.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {project.technologies.slice(0, 3).map((tech) => (
              <span
                key={tech}
                className="font-mono text-[9px] text-[#a3acb5] bg-[#0f1113] border border-[#242830] px-1.5 py-0.5 rounded-[2px]"
              >
                {tech}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer Ledger Line */}
      <div className="mt-3.5 pt-2.5 border-t border-[#242830] flex items-center justify-between text-[10px] font-mono text-[#7c848d]">
        <span className="truncate max-w-[60%] text-[#a3acb5]">
          {project.developers && project.developers.length > 0
            ? project.developers.map((d) => d.display_name).join(", ")
            : "Independent"}
        </span>
        <span className="flex-shrink-0 text-right">
          {formatRelativeTime(project.last_activity_at)}
        </span>
      </div>
    </Link>
  );
};
