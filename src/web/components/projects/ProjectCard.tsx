import React from "react";
import { Link } from "react-router-dom";
import { StatusBadge } from "../ui/StatusBadge";
import type { DevelopmentStage, ProjectLifecycle } from "@/shared/types";
import { ExternalLink } from "lucide-react";

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
  reddit_url?: string | null;
}

export const ProjectCard: React.FC<{ project: ProjectCardData }> = ({ project }) => {
  const isDistinctPortName = project.display_name && project.game_title && project.display_name !== project.game_title;

  return (
    <div className="glass-card p-4 flex flex-col justify-between group text-left relative transition-all duration-200 hover:-translate-y-1">
      <div className="space-y-2.5">
        {/* Top Status Strip */}
        <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-2.5">
          <StatusBadge type="stage" value={project.current_stage} />
          <div className="flex items-center gap-1.5">
            {project.original_platform && (
              <span className="font-mono text-[10px] text-slate-400 bg-white/5 px-2 py-0.5 rounded uppercase">
                {project.original_platform}
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <div>
          <Link to={`/projects/${project.slug}`} className="block">
            <h3 className="text-base font-bold text-white group-hover:text-cyan-400 transition-colors leading-snug">
              {project.game_title || project.display_name || project.slug}
            </h3>
          </Link>
          {isDistinctPortName && (
            <p className="text-xs text-cyan-400/90 font-mono mt-0.5">
              {project.display_name}
            </p>
          )}
        </div>

        {/* Summary Snippet */}
        <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
          {project.summary || "Community port and decompilation project."}
        </p>

        {/* Tech tags */}
        {project.technologies && project.technologies.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {project.technologies.slice(0, 3).map((tech) => (
              <span
                key={tech}
                className="font-mono text-[10px] text-slate-400 bg-[#0d1117] border border-white/10 px-2 py-0.5 rounded"
              >
                {tech}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer Line with Direct Reddit Link Button */}
      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono">
        <span className="truncate max-w-[55%] text-slate-400">
          {project.developers && project.developers.length > 0
            ? project.developers.map((d) => d.display_name).join(", ")
            : "Community"}
        </span>

        {project.reddit_url ? (
          <a
            href={project.reddit_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 hover:text-cyan-300 text-[11px] transition-colors"
          >
            <span>Reddit Thread</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        ) : (
          <Link
            to={`/projects/${project.slug}`}
            className="text-cyan-400 hover:underline"
          >
            Details
          </Link>
        )}
      </div>
    </div>
  );
};
