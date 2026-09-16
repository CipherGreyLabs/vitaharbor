import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { StatusBadge } from "../components/ui/StatusBadge";
import { ProgressionBar } from "../components/ui/ProgressionBar";
import { UpdateCard, type UpdateCardData } from "../components/updates/UpdateCard";
import { formatRelativeTime, formatDate } from "@/shared/utils";
import type { DevelopmentStage, ProjectLifecycle } from "@/shared/types";
import { User, Clock, ChevronLeft } from "lucide-react";

interface ProjectDetailData {
  id: number;
  slug: string;
  display_name: string | null;
  game_title: string;
  original_platform?: string | null;
  original_release_year?: number | null;
  current_stage: DevelopmentStage;
  lifecycle: ProjectLifecycle;
  summary: string;
  playability_notes?: string | null;
  performance_notes?: string | null;
  first_seen_at: string;
  last_activity_at: string;
  technologies?: string[];
  developers?: { id: number; display_name: string; role: string; slug: string }[];
  aliases?: string[];
  updates?: UpdateCardData[];
}

export const ProjectDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [project, setProject] = useState<ProjectDetailData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProject() {
      if (!slug) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/projects/${slug}`);
        if (res.ok) {
          const data = (await res.json()) as { project: ProjectDetailData };
          setProject(data.project);
        }
      } catch (e) {
        console.error("Failed to load project detail", e);
      } finally {
        setLoading(false);
      }
    }
    loadProject();
  }, [slug]);

  if (loading) {
    return <div className="card-panel p-12 text-center text-xs text-[#68788c] animate-pulse">Loading project details...</div>;
  }

  if (!project) {
    return (
      <div className="card-panel p-12 text-center space-y-4">
        <h2 className="text-lg font-bold text-[#edf5ff]">Project Not Found</h2>
        <p className="text-xs text-[#9aaabd]">The requested port project slug does not exist or has been removed.</p>
        <Link to="/projects" className="btn-secondary text-xs">
          Return to projects
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Link to="/projects" className="inline-flex items-center gap-1 text-xs text-[#9aaabd] hover:text-[#edf5ff]">
        <ChevronLeft className="w-4 h-4" />
        <span>Back to projects directory</span>
      </Link>

      <div className="card-panel p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#edf5ff]">
              {project.display_name || project.game_title}
            </h1>
            <p className="text-xs sm:text-sm text-[#9aaabd] mt-1">
              Port of <span className="text-[#edf5ff] font-medium">{project.game_title}</span>
              {project.original_platform ? ` (${project.original_platform}${project.original_release_year ? `, ${project.original_release_year}` : ""})` : ""}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <StatusBadge type="stage" value={project.current_stage} />
            <StatusBadge type="lifecycle" value={project.lifecycle} />
          </div>
        </div>

        <div className="pt-2 pb-2">
          <ProgressionBar currentStage={project.current_stage} />
        </div>

        <p className="text-sm text-[#edf5ff] leading-relaxed">
          {project.summary || "No detailed summary provided for this project."}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-[#202a38]">
          <div className="space-y-1.5">
            <h4 className="text-xs font-semibold text-[#68788c] uppercase tracking-wider">Playability Status</h4>
            <p className="text-xs text-[#9aaabd] bg-[#090c11] p-3 rounded border border-[#202a38]">
              {project.playability_notes || "Playability details will be verified upon playable release build."}
            </p>
          </div>
          <div className="space-y-1.5">
            <h4 className="text-xs font-semibold text-[#68788c] uppercase tracking-wider">Performance & Shaders</h4>
            <p className="text-xs text-[#9aaabd] bg-[#090c11] p-3 rounded border border-[#202a38]">
              {project.performance_notes || "Performance benchmarks and framerate targets will be documented as testing reports emerge."}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-[#202a38] text-xs text-[#68788c]">
          <div className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-[#249cf4]" />
            <span>Developers:</span>
            <span className="text-[#edf5ff]">
              {project.developers && project.developers.length > 0
                ? project.developers.map((d) => d.display_name).join(", ")
                : "Independent / Anonymous"}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>First seen: {formatDate(project.first_seen_at)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>Last activity: {formatRelativeTime(project.last_activity_at)}</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[#edf5ff]">Verified Development Timeline</h2>
        <p className="text-xs text-[#68788c]">All events linked to verified Reddit developer statements and proof</p>

        {project.updates && project.updates.length > 0 ? (
          <div className="space-y-4">
            {project.updates.map((u) => (
              <UpdateCard key={u.id} update={u} />
            ))}
          </div>
        ) : (
          <div className="card-panel p-8 text-center text-xs text-[#68788c]">
            No verified timeline updates recorded yet for this project.
          </div>
        )}
      </div>
    </div>
  );
};

