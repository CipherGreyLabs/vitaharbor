import React from "react";
import { ProjectMark } from "../projects/ProjectMark";
import {
  type LedgerProject,
  splitTitle,
  prettyStage,
  formatDay,
  formatMonth,
  relativeTime,
  deriveSetupGuide,
  KNOWN_REPOS,
  STAGE_CHIP,
  STAGE_TONE
} from "./types";
import { ExternalLink, Cpu, HardDrive, CheckCircle2, GitBranch } from "lucide-react";

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
  const repoUrl = project.repo_url || KNOWN_REPOS[project.slug];

  return (
    <div id={"panel-" + project.slug} className="border-t border-hairline bg-sunken/60 px-6 py-7">
      <div className="mb-6 flex items-center gap-4">
        <ProjectMark seed={project.display_name || project.game_title || "vita"} size={56} className="shrink-0 rounded-2xl" />
        <div className="min-w-0">
          <p className="truncate text-lead font-semibold tracking-tight text-ink">
            {title.name}
          </p>
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
            <span className="font-mono text-micro text-ink-muted">{setup.categoryLabel}</span>
          </p>
        </div>
      </div>

      {project.verification === "detected" && (
        <p className="mb-6 max-w-3xl rounded-xl border border-hairline bg-surface px-4 py-3 text-caption text-ink-medium">
          <span className="font-medium text-ink">Unverified entry.</span> Promoted
          automatically from a detected thread. There is no hardware report yet, so
          playability and performance are deliberately left empty.
        </p>
      )}

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
                    className="rounded-md border border-hairline bg-surface px-2 py-1 font-mono text-micro text-ink-muted"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Practical Player Setup Guide */}
          <div className="rounded-xl border border-hairline bg-surface p-4 text-xs font-mono space-y-3">
            <div className="flex items-center gap-2 text-micro font-semibold uppercase text-ink">
              <Cpu className="h-3.5 w-3.5 text-accent" />
              <span>Hardware & Plugin Setup</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-ink-medium">
              <div className="space-y-1">
                <span className="text-micro uppercase text-ink-muted block">Required Plugins:</span>
                <div className="space-y-1">
                  {setup.plugins.map((plugin) => (
                    <div key={plugin} className="flex items-center gap-1.5 text-ink">
                      <CheckCircle2 className="h-3 w-3 text-stage-done shrink-0" />
                      <span>{plugin}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <div>
                  <span className="text-micro uppercase text-ink-muted block">Overclock Target:</span>
                  <span className="text-ink font-semibold">{setup.overclock}</span>
                </div>
                <div>
                  <span className="text-micro uppercase text-ink-muted block flex items-center gap-1">
                    <HardDrive className="h-3 w-3 text-ink-muted" />
                    <span>Data Path:</span>
                  </span>
                  <code className="text-[11px] bg-sunken px-1.5 py-0.5 rounded text-ink font-mono">{setup.assetPath}</code>
                </div>
              </div>
            </div>

            <p className="text-caption text-ink-muted border-t border-hairline-strong/30 pt-2">
              {setup.instructions}
            </p>
          </div>

          <dl className="grid grid-cols-1 gap-x-8 gap-y-4 border-t border-hairline-strong/30 pt-4 sm:grid-cols-3">
            <div>
              <dt className="text-micro font-medium uppercase text-ink-muted">Credits</dt>
              <dd className="mt-1 text-body text-ink">
                {developers.length === 0
                  ? "Community effort"
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
              <dt className="text-micro font-medium uppercase text-ink-muted">Last activity</dt>
              <dd className="mt-1 text-body text-ink">
                {formatDay(project.last_activity_at) || "—"}
                <span className="text-ink-muted"> · {relativeTime(project.last_activity_at)}</span>
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
          className="rounded-lg bg-ink px-3.5 py-2 text-caption font-medium text-canvas transition-colors hover:bg-ink/90"
        >
          Show on the console
        </button>
        <button
          type="button"
          onClick={() => onCopyLink(project)}
          className="rounded-lg border border-hairline-strong/30 vh-glass px-3.5 py-2 text-caption font-medium text-ink-medium transition-colors hover:border-hairline-strong/30-strong hover:text-ink"
        >
          {isCopied ? "Link copied" : "Copy link"}
        </button>

        {repoUrl && (
          <a
            href={repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-hairline-strong/30 vh-glass px-3.5 py-2 text-caption font-medium text-ink transition-colors hover:border-hairline-strong/30-strong"
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
      </div>
    </div>
  );
};
