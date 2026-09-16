import React from "react";
import { Link } from "react-router-dom";
import { StatusBadge } from "../ui/StatusBadge";
import { formatRelativeTime } from "@/shared/utils";
import type { DevelopmentStage, ProjectLifecycle } from "@/shared/types";
import { Clock, User } from "lucide-react";

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
  return (
    <Link
      to={`/projects/${project.slug}`}
      className="card-panel-hover p-5 flex flex-col justify-between group block"
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="text-base font-semibold text-[#edf5ff] group-hover:text-[#249cf4] transition-colors line-clamp-1">
            {project.display_name || project.game_title || project.slug}
          </h3>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <StatusBadge type="stage" value={project.current_stage} />
          </div>
        </div>

        {project.game_title && project.game_title !== project.display_name && (
          <p className="text-xs text-[#9aaabd] mb-2 line-clamp-1">
            Original game: <span className="text-[#edf5ff]">{project.game_title}</span>
            {project.original_platform ? ` (${project.original_platform})` : ""}
          </p>
        )}

        <p className="text-xs text-[#9aaabd] line-clamp-2 leading-relaxed mb-4">
          {project.summary || "No description provided."}
        </p>

        {project.technologies && project.technologies.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {project.technologies.slice(0, 3).map((tech) => (
              <span
                key={tech}
                className="px-2 py-0.5 rounded bg-[#151b24] border border-[#202a38] text-[10px] text-[#9aaabd]"
              >
                {tech}
              </span>
            ))}
            {project.technologies.length > 3 && (
              <span className="px-1.5 py-0.5 text-[10px] text-[#68788c]">
                +{project.technologies.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-[#202a38] flex items-center justify-between text-[11px] text-[#68788c]">
        <div className="flex items-center gap-1">
          <User className="w-3 h-3 text-[#68788c]" />
          <span>
            {project.developers && project.developers.length > 0
              ? project.developers.map((d) => d.display_name).join(", ")
              : "Independent"}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-[#68788c]" />
          <span>{formatRelativeTime(project.last_activity_at)}</span>
        </div>
      </div>
    </Link>
  );
};

