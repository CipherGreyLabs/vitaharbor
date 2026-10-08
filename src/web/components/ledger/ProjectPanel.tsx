import React, { useMemo } from "react";
import { FALLBACK_PROJECTS } from "../../../shared/constants/fallbackData";
import { ProjectMark } from "../projects/ProjectMark";
import {
  type LedgerProject,
  splitTitle,
  prettyStage,
  formatDay,
  formatMonth,
  deriveSetupGuide,
  deriveProjectType,
  PROJECT_TYPE_META,
  verificationMeta,
  freshness,
  KNOWN_REPOS,
  STAGE_CHIP,
  STAGE_TONE
} from "./types";

const PROGRESSION_STEPS = [
  { stage: "announced", label: "Announced", rank: 1 },
  { stage: "early_wip", label: "WIP / Boot", rank: 2 },
  { stage: "in_game", label: "In-Game", rank: 3 },
  { stage: "playable", label: "Playable", rank: 4 },
  { stage: "released", label: "Released", rank: 5 }
];

function getStageRank(stageStr: string): number {
  const s = String(stageStr || "").toLowerCase();
  if (s === "released") return 5;
  if (s === "playable" || s === "completable") return 4;
  if (s === "in_game") return 3;
  if (s === "booting" || s === "early_wip" || s === "research") return 2;
  return 1;
}

import { ExternalLink, Cpu, HardDrive, CheckCircle2, GitBranch, ShieldCheck, CircleAlert, MonitorPlay } from "lucide-react";

interface ProjectPanelProps {
  project: LedgerProject;
  onSelectProject: (project: any) => void;
  onCopyLink: (project: any) => void;
  isCopied: boolean;
}

export const ProjectPanel: React.FC<ProjectPanelProps> = ({
  project,
  onSelectProject,
  onCopyLink,
  isCopied
}) => {
  const title = splitTitle(project.game_title || project.display_name);
  const history = Array.isArray(project.stage_history) ? project.stage_history : [];
  const developers = Array.isArray(project.developers) ? project.developers : [];
  const setup = deriveSetupGuide(project);
  const projectType = PROJECT_TYPE_META[deriveProjectType(project)];
  const verification = verificationMeta(project.verification);
  const activityFreshness = freshness(project.last_activity_at);
  const similarProjects = useMemo(() => {
    const others = (FALLBACK_PROJECTS as LedgerProject[]).filter((p) => p.id !== project.id);
    return others
      .map((p) => {
        let score = 0;
        const pType = deriveProjectType(p);
        const currentType = deriveProjectType(project);
        if (pType === currentType) score += 3;
        if (p.original_platform && project.original_platform && p.original_platform === project.original_platform) score += 2;
        const techMatch = (p.technologies || []).filter((t) => (project.technologies || []).includes(t)).length;
        score += techMatch * 2;
        return { project: p, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((item) => item.project);
  }, [project]);
  const repoUrl = project.repo_url || KNOWN_REPOS[project.slug];

  return (
    <div id={"panel-" + project.slug} className="border-t border-hairline bg-sunken/60 px-6 py-7">
      <div className="mb-6 flex items-center gap-4">
        <ProjectMark seed={project.display_name || project.game_title || "vita"} size={56} className="shrink-0 rounded-2xl" />
        <div className="min-w-0">
          <h2 id={"panel-title-" + project.slug} className="truncate text-lead font-semibold tracking-tight text-ink">
            {title.name}
          </h2>
          <p className="mt-1.5 flex flex-wrap items-center gap-2 text-caption text-ink-muted">
            <span
              className={
                "rounded-md px-2 py-0.5 text-micro font-semibold uppercase " +
                (STAGE_CHIP[String(project.current_stage)] || "bg-sunken text-ink-medium")
              }
            >
              {prettyStage(project.current_stage)}
            </span>
            <span>{title.engine || project.original_platform || "Port"}</span>
            <span className="text-hairline-strong">·</span>
            <span className="font-mono text-micro text-ink-muted">{projectType.label}</span>
          </p>
        </div>
      </div>

      {project.verification === "detected" && (
        <p className="mb-6 max-w-3xl rounded-xl border border-hairline bg-surface px-4 py-3 text-caption text-ink-medium">
          <span className="font-medium text-white">Early Community WIP.</span> Performance, audio and stability are currently being tested on real hardware.
        </p>
      )}

      {/* Option 3: Visual Horizontal Milestone Stepper */}
      <div className="mb-6 rounded-2xl border border-white/[0.08] bg-black/40 p-4 sm:p-5 backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <p className="font-mono text-micro font-semibold uppercase tracking-[0.16em] text-accent-hover">
            Porting Progression
          </p>
          <span className="font-mono text-[11px] text-ink-muted">
            Status: <span className="text-white font-semibold">{prettyStage(project.current_stage)}</span>
          </span>
        </div>

        <div className="relative flex items-center justify-between gap-1 sm:gap-2 overflow-x-auto no-scrollbar py-2">
          {PROGRESSION_STEPS.map((step, idx) => {
            const currentRank = getStageRank(project.current_stage);
            const isPassed = currentRank > step.rank;
            const isCurrent = currentRank === step.rank;
            const matchedHistory = history.find(h => {
              const hs = String(h.stage).toLowerCase();
              if (step.stage === "early_wip") return hs === "early_wip" || hs === "booting" || hs === "research";
              if (step.stage === "playable") return hs === "playable" || hs === "completable";
              return hs === step.stage;
            });

            return (
              <React.Fragment key={step.stage}>
                <div className="flex flex-col items-center text-center min-w-[62px] sm:min-w-[84px] shrink-0">
                  <div className={
                    "relative flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full transition-all duration-300 " +
                    (isCurrent
                      ? "border-2 border-white bg-white/15 text-white shadow-sm"
                      : isPassed
                      ? "border border-white/60 bg-white/10 text-white"
                      : "border border-white/10 bg-white/[0.02] text-ink-muted opacity-40")
                  }>
                    {isCurrent && <span className="vh-live-dot absolute -top-0.5 -right-0.5" />}
                    {isPassed ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                    ) : (
                      <span className="font-mono text-[10px] font-bold">{idx + 1}</span>
                    )}
                  </div>
                  <span className={
                    "mt-1.5 font-mono text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider " +
                    (isCurrent ? "text-white" : isPassed ? "text-ink" : "text-ink-muted opacity-50")
                  }>
                    {step.label}
                  </span>
                  {matchedHistory?.effective_at && (
                    <span className="mt-0.5 font-mono text-[9px] text-ink-muted">
                      {formatDay(matchedHistory.effective_at)}
                    </span>
                  )}
                </div>
                {idx < PROGRESSION_STEPS.length - 1 && (
                  <div className={
                    "h-[2px] flex-1 min-w-[12px] sm:min-w-[24px] transition-all duration-300 " +
                    (isPassed ? "bg-white/30" : "bg-white/10 opacity-30")
                  } />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
      <dl className="mb-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-hairline bg-surface px-3.5 py-3">
          <dt className="flex items-center gap-1.5 text-micro font-semibold uppercase text-ink-muted">
            <ShieldCheck className="h-3.5 w-3.5 text-accent" />
            Evidence level
          </dt>
          <dd className="mt-1 text-caption font-medium text-ink">{verification.label}</dd>
        </div>
        <div className="rounded-xl border border-hairline bg-surface px-3.5 py-3">
          <dt className="flex items-center gap-1.5 text-micro font-semibold uppercase text-ink-muted">
            <CircleAlert className="h-3.5 w-3.5 text-ink-muted" />
            Record freshness
          </dt>
          <dd className="mt-1 text-caption font-medium text-ink">
            {activityFreshness.label}
            <span className="ml-1 font-normal text-ink-muted">· {formatDay(project.last_activity_at) || "—"}</span>
          </dd>
        </div>
        <div className="rounded-xl border border-hairline bg-surface px-3.5 py-3">
          <dt className="text-micro font-semibold uppercase text-ink-muted">Last verified</dt>
          <dd className="mt-1 text-caption font-medium text-ink">
            {formatDay(project.last_verified_at) || "Not recorded"}
          </dd>
        </div>
      </dl>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h3 className="text-micro font-semibold uppercase text-ink-muted">
              Engineering notes
            </h3>
            <p className="mt-2.5 max-w-2xl text-body text-ink-medium leading-relaxed">
              {project.summary || "No summary recorded for this project yet."}
            </p>

            {project.playability_notes && (
              <p className="mt-3 max-w-2xl text-body text-ink-medium leading-relaxed">
                <span className="font-medium text-ink">Playability on hardware: </span>
                {project.playability_notes}
              </p>
            )}

            {project.technologies && project.technologies.length > 0 && (
              <div className="mt-3.5 flex flex-wrap gap-1.5">
                {project.technologies.map((tech: string) => (
                  <span
                    key={tech}
                    className="vh-tech-badge"
                  >
                    [{tech}]
                  </span>
                ))}
              </div>
            )}
          </div>

          {project.screenshot_url && (
            <figure className="overflow-hidden rounded-xl border border-hairline bg-surface">
              <img
                src={project.screenshot_url}
                alt={project.screenshot_alt || "Source screenshot for " + (project.display_name || project.game_title)}
                loading="lazy"
                className="aspect-video w-full object-cover"
              />
              <figcaption className="flex flex-wrap items-center justify-between gap-2 border-t border-hairline px-3.5 py-2.5 text-micro text-ink-muted">
                <span>Source screenshot · also shown on the Vita display</span>
                {project.screenshot_source_url && (
                  <a
                    href={project.screenshot_source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-ink-medium hover:text-accent"
                  >
                    Open original
                  </a>
                )}
              </figcaption>
            </figure>
          )}

          {/* How to Run on PS Vita Installation Checklist */}
          <div className="rounded-2xl border border-white/10 bg-zinc-950/80 p-5 font-mono space-y-4">
            <div className="flex items-center justify-between gap-2 border-b border-white/[0.06] pb-3">
              <div className="flex items-center gap-2 text-micro font-semibold uppercase text-white">
                <Cpu className="h-4 w-4 text-blue-400" />
                <span>How to Run on PS Vita</span>
              </div>
              <span className="text-[10px] text-zinc-400">Installation Checklist</span>
            </div>

            {setup ? (
              <div className="space-y-3.5 text-xs">
                {setup.plugins && setup.plugins.length > 0 && (
                  <div>
                    <span className="block text-micro uppercase text-zinc-400 mb-1.5 font-semibold">Required Plugins:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {setup.plugins.map((plugin) => (
                        <div key={plugin} className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/[0.02] px-2.5 py-1.5 text-zinc-200">
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                          <span className="truncate">{plugin}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 pt-1">
                  {setup.assetPath && (
                    <div className="space-y-1">
                      <span className="flex items-center gap-1.5 text-micro uppercase text-zinc-400 font-semibold">
                        <HardDrive className="h-3.5 w-3.5 text-zinc-400" />
                        <span>Target Data Directory:</span>
                      </span>
                      <code className="block rounded-lg border border-white/10 bg-zinc-900 px-2.5 py-1.5 text-[11px] text-emerald-300 break-all">
                        {setup.assetPath}
                      </code>
                    </div>
                  )}

                  {setup.overclock && (
                    <div className="space-y-1">
                      <span className="block text-micro uppercase text-zinc-400 font-semibold">Recommended Clock Target:</span>
                      <div className="rounded-lg border border-white/10 bg-zinc-900 px-2.5 py-1.5 text-[11px] text-white font-semibold">
                        {setup.overclock}
                      </div>
                    </div>
                  )}
                </div>

                {setup.instructions && (
                  <div className="border-t border-white/[0.06] pt-3">
                    <span className="block text-micro uppercase text-zinc-400 mb-1 font-semibold">Data & Asset Instructions:</span>
                    <p className="text-caption text-zinc-300 leading-relaxed font-sans">{setup.instructions}</p>
                  </div>
                )}

                {setup.sourceUrl && (
                  <div className="pt-1">
                    <a
                      href={setup.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-caption font-medium text-blue-400 hover:underline"
                    >
                      <span>View setup source reference</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-caption leading-relaxed text-zinc-400 font-sans">
                Standard homebrew installation. Install the VPK via VitaShell and extract required game assets to ux0:data/ according to the repository README.
              </p>
            )}
          </div>

          <dl className="grid grid-cols-1 gap-x-8 gap-y-4 border-t border-hairline-strong/30 pt-4 sm:grid-cols-3">
            <div>
              <dt className="text-micro font-medium uppercase text-ink-muted">Credits</dt>
              <dd className="mt-1 text-body text-ink">
                {developers.length === 0
                  ? "Not recorded"
                  : developers
                      .map(
                        (dev: any) =>
                          dev.display_name + (dev.role ? " · " + dev.role : "")
                      )
                      .join(", ")}
              </dd>
            </div>
            <div>
              <dt className="text-micro font-medium uppercase text-ink-muted">Tracked since</dt>
              <dd className="mt-1 text-body text-ink">
                {formatMonth(project.first_seen_at) || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-micro font-medium uppercase text-ink-muted">Latest project activity</dt>
              <dd className="mt-1 text-body text-ink">
                {formatDay(project.last_activity_at) || "—"}
              </dd>
            </div>
          </dl>
        </div>

        <div>
          <h3 className="text-micro font-semibold uppercase text-ink-muted">
            Milestones
          </h3>
          <ol className="mt-3 border-l border-hairline-strong/30 pl-4">
            {history.map((step: any) => (
              <li key={step.id ?? step.stage} className="relative pb-4 last:pb-0">
                <span
                  aria-hidden="true"
                  className={
                    "absolute -left-[21px] top-1.5 h-2 w-2 rounded-full ring-2 ring-surface " +
                    (STAGE_TONE[String(step.stage)] || "bg-stage-idle")
                  }
                />
                <p className="text-body font-medium text-ink">{prettyStage(step.stage)}</p>
                <p className="vh-tnum text-micro text-ink-muted">
                  {formatDay(step.effective_at)}
                </p>
                {step.reason && (
                  <p className="mt-1 text-caption text-ink-medium">{step.reason}</p>
                )}
                {step.source_url && (
                  <a
                    href={step.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex items-center gap-1 text-caption font-medium text-ink-muted hover:text-accent"
                  >
                    Source <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </li>
            ))}
            {history.length === 0 && (
              <li className="text-caption text-ink-muted">No milestone log recorded.</li>
            )}
          </ol>
        </div>
      </div>

      <div className="mt-7 flex flex-wrap items-center gap-3 border-t border-hairline-strong/30 pt-5">
        <button
          type="button"
          onClick={() => onSelectProject(project)}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-ink px-3.5 py-2 text-caption font-medium text-canvas transition-colors hover:bg-ink/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30"
        >
          <MonitorPlay className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          Show on Vita
        </button>
        <button
          type="button"
          onClick={() => onCopyLink(project)}
          className="min-h-[44px] rounded-lg border border-hairline-strong/30 vh-glass px-3.5 py-2 text-caption font-medium text-ink-medium transition-colors hover:border-hairline-strong hover:text-ink"
        >
          {isCopied ? "Link copied" : "Copy link"}
        </button>

        {repoUrl && (
          <a
            href={repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3.5 py-2 text-caption font-medium text-white transition-colors hover:border-white/20 hover:bg-white/10"
          >
            <GitBranch className="h-3.5 w-3.5 text-blue-400" />
            <span>Source repository</span>
            {project.last_activity_at && (
              <span className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-zinc-300">
                {freshness(project.last_activity_at).state === "fresh" ? "Active recently" : formatDay(project.last_activity_at)}
              </span>
            )}
            <ExternalLink className="h-3 w-3 text-zinc-400" />
          </a>
        )}

        {project.reddit_url && (
          <a
            href={project.reddit_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-caption font-medium text-ink-medium transition-colors hover:text-ink"
          >
            Source discussion
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}

        {!repoUrl && !project.reddit_url && !project.screenshot_source_url && (
          <span className="text-caption text-ink-muted" title="No project-specific external source has been verified">
            No verified external source
          </span>
        )}
      </div>
    </div>
  );
};
