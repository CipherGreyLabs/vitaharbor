import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { StatusBadge } from "../components/ui/StatusBadge";
import { StageHistoryVisualizer, type StageHistoryRecord } from "../components/projects/StageHistoryVisualizer";
import { UpdateCard, type UpdateCardData } from "../components/updates/UpdateCard";
import { formatRelativeTime, formatDate, deriveActivityLevel } from "@/shared/utils";
import { apiGet } from "../lib/api";
import { useDocumentMeta } from "../lib/useDocumentMeta";
import { readWatchlist, writeWatchlist } from "../lib/visitorState";
import type { DevelopmentStage, ProjectLifecycle } from "@/shared/types";
import { Bookmark, ChevronLeft } from "lucide-react";

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
  const [watched, setWatched] = useState(false);

  useEffect(() => {
    setWatched(Boolean(slug && readWatchlist().includes(slug)));
  }, [slug]);

  useEffect(() => {
    async function loadProject() {
      if (!slug) return;
      setLoading(true);
      try {
        const data = await apiGet<{ project: ProjectDetailData }>(`/api/projects/${slug}`);
        if (data.project) {
          setProject(data.project);

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

  useDocumentMeta({
    title: project
      ? `${project.game_title} Vita port`
      : "Project record",
    description: project
      ? `${project.game_title} on PlayStation Vita — stage, playability, performance and verified source history.`
      : "Verified PlayStation Vita port record."
  });

  if (loading) {
    return (
      <div className="terminal-panel p-12 text-center font-mono text-xs text-[#7c848d] animate-pulse">
        [ SYSTEM: LOADING PROJECT RECORD... ]
      </div>
    );
  }

  if (!project) {
    return (
      <div className="terminal-panel p-12 text-center space-y-4">
        <h2 className="font-mono text-sm font-bold text-[#f4f6f8]">PROJECT RECORD NOT FOUND</h2>
        <p className="text-xs text-[#a3acb5]">The requested project identifier does not exist in the catalog.</p>
        <Link to="/" className="btn-terminal-secondary text-xs">
          Return to directory
        </Link>
      </div>
    );
  }

  const activityLevel = deriveActivityLevel(new Date(project.last_activity_at));
  const isDistinctPortName = project.display_name && project.game_title && project.display_name !== project.game_title;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button */}
      <Link
        to="/"
        className="inline-flex items-center gap-1 font-mono text-[11px] text-[#a3acb5] hover:text-[#3ad2ff] transition-colors"
      >
        <ChevronLeft className="w-3.5 h-3.5" />
        <span>[ Back to Directory ]</span>
      </Link>

      {/* Header Block */}
      <div className="terminal-panel p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#242830] pb-4">
          <div>
            <span className="font-mono text-[10px] text-[#7c848d] uppercase tracking-wider block">
              {project.original_platform || "Original Game"}
              {project.original_release_year ? ` // ${project.original_release_year}` : ""}
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-[#f4f6f8] mt-1 tracking-tight">
              {project.game_title}
            </h1>
            {isDistinctPortName && (
              <p className="font-mono text-xs text-[#3ad2ff] mt-1">
                PORT IDENTIFIER: {project.display_name}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge type="stage" value={project.current_stage} />
            <StatusBadge type="lifecycle" value={project.lifecycle} />
            <StatusBadge type="activity" value={activityLevel} />
            <button
              type="button"
              aria-pressed={watched}
              onClick={() => {
                if (!slug) return;
                const next = watched ? readWatchlist().filter((item) => item !== slug) : [...readWatchlist(), slug];
                if (writeWatchlist(next)) setWatched(!watched);
              }}
              className="inline-flex min-h-[36px] items-center gap-1.5 rounded-full border border-[#242830] px-3 font-mono text-[10px] text-[#a3acb5] transition-colors hover:border-[#3ad2ff] hover:text-[#3ad2ff]"
            >
              <Bookmark className="h-3.5 w-3.5" />
              {watched ? "WATCHING" : "WATCH"}
            </button>
          </div>
        </div>

        {/* Overview */}
        <p className="text-xs sm:text-sm text-[#a3acb5] leading-relaxed">
          {project.summary || "No technical description recorded."}
        </p>

        {/* Hardware details bar */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 text-[10px] font-mono text-[#7c848d]">
          <div>
            AUTHORS:{" "}
            <span className="text-[#f4f6f8]">
              {project.developers && project.developers.length > 0
                ? project.developers.map((d) => d.display_name).join(", ")
                : "Independent / Anonymous"}
            </span>
          </div>
          <div>FIRST SEEN: <span className="text-[#a3acb5]">{formatDate(project.first_seen_at)}</span></div>
          <div>LAST UPDATED: <span className="text-[#3ad2ff]">{formatRelativeTime(project.last_activity_at)}</span></div>
        </div>
      </div>

      {/* Stage History */}
      <section className="terminal-panel p-5 space-y-3">
        <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-[#f4f6f8] border-b border-[#242830] pb-2">
          VERIFIED MILESTONE HISTORY
        </h2>
        <StageHistoryVisualizer
          currentStage={project.current_stage}
          history={project.stage_history}
        />
      </section>

      {/* Technical Notes */}
      {(project.playability_notes || project.performance_notes || (project.technologies && project.technologies.length > 0)) && (
        <section className="terminal-panel p-5 space-y-3">
          <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-[#f4f6f8] border-b border-[#242830] pb-2">
            TECHNICAL & PLAYABILITY BENCHMARKS
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {project.playability_notes && (
              <div className="space-y-1 bg-[#08090a] border border-[#242830] p-3 rounded-[2px]">
                <h3 className="font-mono text-[10px] text-[#3ad2ff] uppercase tracking-wider">
                  // PLAYABILITY VERDICT
                </h3>
                <p className="text-xs text-[#f4f6f8] leading-relaxed">
                  {project.playability_notes}
                </p>
              </div>
            )}

            {project.performance_notes && (
              <div className="space-y-1 bg-[#08090a] border border-[#242830] p-3 rounded-[2px]">
                <h3 className="font-mono text-[10px] text-[#10b981] uppercase tracking-wider">
                  // PERFORMANCE & SHADERS
                </h3>
                <p className="text-xs text-[#f4f6f8] leading-relaxed">
                  {project.performance_notes}
                </p>
              </div>
            )}
          </div>

          {project.technologies && project.technologies.length > 0 && (
            <div className="pt-2">
              <span className="font-mono text-[10px] text-[#7c848d] block mb-1 uppercase">
                ENGINE & WRAPPERS:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {project.technologies.map((t) => (
                  <span
                    key={t}
                    className="font-mono text-[10px] text-[#a3acb5] bg-[#08090a] border border-[#242830] px-2 py-0.5 rounded-[2px]"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Verified Timeline Updates */}
      <section className="space-y-3">
        <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-[#f4f6f8] border-b border-[#242830] pb-2">
          VERIFIED TIMELINE EVENTS
        </h2>
        {project.updates && project.updates.length > 0 ? (
          <div className="space-y-2.5">
            {project.updates.map((u) => (
              <UpdateCard key={u.id} update={u} />
            ))}
          </div>
        ) : (
          <div className="terminal-panel p-6 text-center font-mono text-xs text-[#7c848d]">
            No verified timeline events recorded for this port yet.
          </div>
        )}
      </section>
    </div>
  );
};
