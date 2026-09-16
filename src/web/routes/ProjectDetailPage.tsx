import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { StatusBadge } from "../components/ui/StatusBadge";
import { StageHistoryVisualizer, type StageHistoryRecord } from "../components/projects/StageHistoryVisualizer";
import { UpdateCard, type UpdateCardData } from "../components/updates/UpdateCard";
import { formatRelativeTime, formatDate, deriveActivityLevel } from "@/shared/utils";
import type { DevelopmentStage, ProjectLifecycle } from "@/shared/types";
import { ChevronLeft, User, Calendar } from "lucide-react";

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
  stage_history?: StageHistoryRecord[];
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

          // Mark project as viewed in browser localStorage (Blueprint §82)
          try {
            localStorage.setItem(`vitaharbor_viewed_${slug}`, String(Date.now()));
          } catch {
            // graceful fallback
          }
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
    return (
      <div className="card-panel p-12 text-center text-xs text-[#68788c] animate-pulse">
        Loading project details...
      </div>
    );
  }

  if (!project) {
    return (
      <div className="card-panel p-12 text-center space-y-4">
        <h2 className="text-base font-bold text-[#edf5ff]">Project Not Found</h2>
        <p className="text-xs text-[#9aaabd]">
          The requested project record could not be found.
        </p>
        <Link to="/projects" className="btn-secondary text-xs">
          Return to projects
        </Link>
      </div>
    );
  }

  const activityLevel = deriveActivityLevel(new Date(project.last_activity_at));
  const isDistinctPortName = project.display_name && project.game_title && project.display_name !== project.game_title;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Back button */}
      <Link
        to="/projects"
        className="inline-flex items-center gap-1 text-xs text-[#9aaabd] hover:text-[#edf5ff] transition-colors"
      >
        <ChevronLeft className="w-3.5 h-3.5" />
        <span>Back to projects directory</span>
      </Link>

      {/* Blueprint §74: Header */}
      <div className="card-panel p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <span className="text-[11px] font-mono text-[#68788c] uppercase tracking-wider">
              {project.original_platform || "Original Game"}
              {project.original_release_year ? ` (${project.original_release_year})` : ""}
            </span>
            <h1 className="text-2xl font-bold text-[#edf5ff] mt-0.5">
              {project.game_title}
            </h1>
            {isDistinctPortName && (
              <p className="text-xs text-[#249cf4] font-medium mt-1">
                Port Project: {project.display_name}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge type="stage" value={project.current_stage} />
            <StatusBadge type="lifecycle" value={project.lifecycle} />
            <StatusBadge type="activity" value={activityLevel} />
          </div>
        </div>

        {/* Overview Summary */}
        <p className="text-xs sm:text-sm text-[#edf5ff] leading-relaxed pt-2">
          {project.summary || "No description provided."}
        </p>

        {/* Meta details bar */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-3 border-t border-[#202a38] text-[11px] text-[#68788c]">
          <div className="flex items-center gap-1">
            <User className="w-3 h-3 text-[#249cf4]" />
            <span>
              {project.developers && project.developers.length > 0
                ? project.developers.map((d) => d.display_name).join(", ")
                : "Independent / Anonymous"}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>First seen: {formatDate(project.first_seen_at)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>Last activity: {formatRelativeTime(project.last_activity_at)}</span>
          </div>
        </div>
      </div>

      {/* Blueprint §75: Development Progression History */}
      <section className="card-panel p-6 space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#edf5ff]">
          Verified Stage History
        </h2>
        <StageHistoryVisualizer
          currentStage={project.current_stage}
          history={project.stage_history}
        />
      </section>

      {/* Blueprint §77: Technical Details (hiding empty/unknown fields) */}
      {(project.playability_notes || project.performance_notes || (project.technologies && project.technologies.length > 0)) && (
        <section className="card-panel p-6 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#edf5ff]">
            Technical Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {project.playability_notes && (
              <div className="space-y-1">
                <h3 className="text-[11px] font-semibold text-[#68788c] uppercase tracking-wider">
                  Playability Notes
                </h3>
                <p className="text-xs text-[#9aaabd] bg-[#090c11] p-3 rounded border border-[#202a38] leading-relaxed">
                  {project.playability_notes}
                </p>
              </div>
            )}

            {project.performance_notes && (
              <div className="space-y-1">
                <h3 className="text-[11px] font-semibold text-[#68788c] uppercase tracking-wider">
                  Performance & Target
                </h3>
                <p className="text-xs text-[#9aaabd] bg-[#090c11] p-3 rounded border border-[#202a38] leading-relaxed">
                  {project.performance_notes}
                </p>
              </div>
            )}
          </div>

          {project.technologies && project.technologies.length > 0 && (
            <div className="pt-2">
              <span className="text-[11px] text-[#68788c] block mb-1.5 font-semibold uppercase tracking-wider">
                Technologies & Tools
              </span>
              <div className="flex flex-wrap gap-1.5">
                {project.technologies.map((t) => (
                  <span
                    key={t}
                    className="px-2 py-0.5 rounded bg-[#151b24] border border-[#202a38] text-xs text-[#9aaabd]"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Developers Section */}
      {project.developers && project.developers.length > 0 && (
        <section className="card-panel p-6 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#edf5ff]">
            Contributing Developers
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {project.developers.map((dev) => (
              <Link
                key={dev.id}
                to={`/developers/${dev.slug}`}
                className="card-panel-hover p-3.5 flex items-center justify-between"
              >
                <div>
                  <h4 className="text-xs font-semibold text-[#edf5ff] hover:text-[#249cf4]">
                    {dev.display_name}
                  </h4>
                  <span className="text-[10px] text-[#68788c] uppercase">
                    Role: {dev.role}
                  </span>
                </div>
                <span className="text-xs text-[#249cf4]">Profile →</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Blueprint §76: Timeline Updates */}
      <section className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#edf5ff]">
          Development Timeline
        </h2>
        {project.updates && project.updates.length > 0 ? (
          <div className="space-y-3">
            {project.updates.map((u) => (
              <UpdateCard key={u.id} update={u} />
            ))}
          </div>
        ) : (
          <div className="card-panel p-6 text-center text-xs text-[#68788c]">
            No verified timeline events recorded yet.
          </div>
        )}
      </section>
    </div>
  );
};

