import React from "react";
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
          <span className="font-medium text-[#00e6ff]">Early Community WIP.</span> Performance, audio and stability are currently being tested on real hardware.
        </p>
      )}

      {/* Option 3: Visual Horizontal Milestone Stepper */}
      <div className="mb-6 rounded-2xl border border-white/[0.08] bg-black/40 p-4 sm:p-5 backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <p className="font-mono text-micro font-semibold uppercase tracking-[0.16em] text-accent-hover">
            Porting Progression
          </p>
          <span className="font-mono text-[11px] text-ink-muted">
            Status: <span className="text-[#00e6ff] font-semibold">{prettyStage(project.current_stage)}</span>
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
                      ? "border-2 border-[#00e6ff] bg-[#00e6ff]/20 text-[#00e6ff] shadow-[0_0_14px_rgba(0,230,255,0.6)]"
                      : isPassed
                      ? "border border-[#00e6ff]/60 bg-[#00e6ff]/10 text-[#00e6ff]"
                      : "border border-white/10 bg-white/[0.02] text-ink-muted opacity-40")
                  }>
                    {isCurrent && <span className="vh-live-dot absolute -top-0.5 -right-0.5" />}
                    {isPassed ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#00e6ff]" />
                    ) : (
                      <span className="font-mono text-[10px] font-bold">{idx + 1}</span>
                    )}
                  </div>
                  <span className={
                    "mt-1.5 font-mono text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider " +
                    (isCurrent ? "text-[#00e6ff]" : isPassed ? "text-ink" : "text-ink-muted opacity-50")
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
                    (isPassed ? "bg-[#00e6ff]/50" : "bg-white/10 opacity-30")
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

          {/* Setup is shown only when it has a project-specific source record. */}
          <div className="rounded-xl border border-hairline bg-surface p-4 text-xs font-mono space-y-3">
            <div className="flex items-center gap-2 text-micro font-semibold uppercase text-ink">
              <Cpu className="h-3.5 w-3.5 text-accent" />
              <span>Hardware & Plugin Setup</span>
            </div>

            {setup ? (
              <>
                <div className="grid grid-cols-1 gap-3 text-ink-medium sm:grid-cols-2">
                  {setup.plugins && setup.plugins.length > 0 && (
                    <div className="space-y-1">
                      <span className="block text-micro uppercase text-ink-muted">Recorded plugins:</span>
                      <div className="space-y-1">
                        {setup.plugins.map((plugin) => (
                          <div key={plugin} className="flex items-center gap-1.5 text-ink">
                            <CheckCircle2 className="h-3 w-3 shrink-0 text-stage-done" />
                            <span>{plugin}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    {setup.overclock && (
                      <div>
                        <span className="block text-micro uppercase text-ink-muted">Recorded clock target:</span>
                        <span className="font-semibold text-ink">{setup.overclock}</span>
                      </div>
                    )}
                    {setup.assetPath && (
                      <div>
                        <span className="flex items-center gap-1 text-micro uppercase text-ink-muted">
                          <HardDrive className="h-3 w-3 text-ink-muted" />
                          <span>Recorded data path:</span>
                        </span>
                        <code className="rounded bg-sunken px-1.5 py-0.5 text-[11px] text-ink">{setup.assetPath}</code>
                      </div>
                    )}
                  </div>
                </div>
                {setup.instructions && (
                  <p className="border-t border-hairline-strong/30 pt-2 text-caption text-ink-muted">{setup.instructions}</p>
                )}
                {setup.sourceUrl && (
                  <a href={setup.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-caption font-medium text-ink-medium hover:text-accent">
                    Open setup evidence <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </>
            ) : (
              <p className="text-caption leading-relaxed text-ink-muted">
                No project-specific setup record is stored. VitaHarbor does not infer plugins,
                clock speeds or asset paths from the project type.
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
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border border-hairline-strong/30 vh-glass px-3.5 py-2 text-caption font-medium text-ink transition-colors hover:border-hairline-strong"
          >
            <GitBranch className="h-3.5 w-3.5 text-accent" />
            <span>Source repository</span>
            <ExternalLink className="h-3 w-3 text-ink-muted" />
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
