import React, { Suspense, lazy } from "react";
import { type SelectedProjectView } from "../3d/VitaConsoleScene";
import { LiveAreaWaves } from "../visual/LiveAreaWaves";
import { ProjectMark } from "../projects/ProjectMark";
import { splitTitle, prettyStage, SPECS } from "./types";
import { Check, Link2, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";

const VitaConsoleScene = lazy(() =>
  import("../3d/VitaConsoleScene").then((m) => ({ default: m.VitaConsoleScene }))
);

const ConsoleSkeleton = () => (
  <div className="flex h-full w-full items-end justify-center pb-10">
    <div className="vh-skeleton h-[62%] w-[78%] max-w-[620px] rounded-[30px] bg-sunken" />
  </div>
);

interface ConsoleStageProps {
  selectedProject: SelectedProjectView | null;
  projects: any[];
  selectedId: number | null;
  onSelectProject: (project: any) => void;
  webgl: boolean | null;
  onCopyLink: (project: any) => void;
  copiedSlug: string;
  consoleRef: React.RefObject<HTMLDivElement | null>;
}

export const ConsoleStage: React.FC<ConsoleStageProps> = ({
  selectedProject,
  projects,
  selectedId,
  onSelectProject,
  webgl,
  onCopyLink,
  copiedSlug,
  consoleRef
}) => {
  const preview = selectedProject
    ? splitTitle(selectedProject.game_title || selectedProject.display_name)
    : null;

  const currentIndex = projects.findIndex((p) => p.id === selectedId);
  const handlePrev = () => {
    if (projects.length === 0) return;
    const prevIdx = (currentIndex - 1 + projects.length) % projects.length;
    onSelectProject(projects[prevIdx]);
  };
  const handleNext = () => {
    if (projects.length === 0) return;
    const nextIdx = (currentIndex + 1) % projects.length;
    onSelectProject(projects[nextIdx]);
  };

  return (
    <section aria-labelledby="console-heading" className="mx-auto max-w-3xl px-4 pt-0 sm:px-6">
      <h2 id="console-heading" className="sr-only">
        Interactive console preview
      </h2>

      <div className="relative w-full py-6">
        <LiveAreaWaves className="pointer-events-none absolute inset-x-0 inset-y-0 h-full w-full opacity-60" />
        
        <div aria-hidden="true" className="vh-dots pointer-events-none absolute inset-0 opacity-80" />
        

        <div className="relative px-2 pt-0 sm:px-6">
          <div ref={consoleRef} className="h-[230px] sm:h-[330px] lg:h-[400px]">
            {webgl === false ? (
              <figure className="flex h-full w-full items-center justify-center">
                <img
                  src="/vita-render.png"
                  alt="PlayStation Vita PCH-1000"
                  className="max-h-full w-auto object-contain"
                />
              </figure>
            ) : (
              <Suspense fallback={<ConsoleSkeleton />}>
                <div className="vh-rise h-full w-full">
                  <VitaConsoleScene selectedProject={selectedProject} />
                </div>
              </Suspense>
            )}
          </div>
          <div aria-hidden="true" className="vh-floor mx-auto h-px w-[84%]" />
        </div>

        <div className="relative px-4 pb-7 pt-6 sm:px-8">
          {preview && (
            <div className="flex flex-col gap-4 rounded-2xl border border-hairline bg-canvas px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <ProjectMark
                seed={selectedProject?.display_name || selectedProject?.game_title || "vita"}
                size={46}
                className="hidden shrink-0 rounded-xl sm:block"
              />
              <div className="min-w-0 flex-1">
                <p className="text-micro font-medium uppercase text-ink-muted">On the display</p>
                <p className="mt-1 truncate text-subtitle font-medium text-ink">{preview.name}</p>
                <p className="mt-0.5 text-caption text-ink-muted">
                  {prettyStage(selectedProject?.current_stage)}
                  {selectedProject?.original_platform ? " · " + selectedProject.original_platform : ""}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <div className="flex items-center gap-1 border-r border-hairline pr-2 mr-1">
                  <button
                    type="button"
                    onClick={handlePrev}
                    aria-label="Previous project"
                    title="Previous project"
                    className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-hairline bg-surface text-ink-muted transition-colors hover:border-hairline-strong hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20 sm:h-9 sm:w-9"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    aria-label="Next project"
                    title="Next project"
                    className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-hairline bg-surface text-ink-muted transition-colors hover:border-hairline-strong hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20 sm:h-9 sm:w-9"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => onCopyLink(selectedProject)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-hairline bg-surface px-3 py-2 text-caption font-medium text-ink-medium transition-colors hover:border-hairline-strong hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20"
                >
                  {copiedSlug === (selectedProject as any)?.slug ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Link2 className="h-3.5 w-3.5" />
                      Copy link
                    </>
                  )}
                </button>
                {(selectedProject as any)?.reddit_url && (
                  <a
                    href={(selectedProject as any).reddit_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-ink px-3.5 py-2 text-caption font-medium text-canvas transition-colors hover:bg-ink/90"
                  >
                    Source discussion
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            </div>
          )}

          <div className="mt-5 flex justify-center">
            <div
              aria-label="Choose a project to preview"
              className="no-scrollbar flex max-w-full gap-1 overflow-x-auto rounded-full border border-hairline bg-sunken p-1"
            >
              {projects.slice(0, 6).map((project) => {
                const active = selectedId === project.id;
                return (
                  <button
                    key={project.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => onSelectProject(project)}
                    className={
                      "whitespace-nowrap rounded-full px-3.5 py-1.5 text-caption font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20 " +
                      (active
                        ? "border border-hairline bg-surface text-ink shadow-card"
                        : "border border-transparent text-ink-muted hover:text-ink")
                    }
                  >
                    {splitTitle(project.game_title || project.display_name).name}
                  </button>
                );
              })}
            </div>
          </div>

          <p className="mt-4 text-center text-micro uppercase text-ink-muted">
            <span className="hidden sm:inline">
              Drag to rotate · Press <span className="font-mono">/</span> to search the directory
            </span>
            <span className="sm:hidden">Swipe to rotate · use the arrows to switch ports</span>
          </p>
        </div>
      </div>

      <dl className="mx-auto mt-14 grid max-w-3xl grid-cols-2 gap-x-8 gap-y-7 sm:grid-cols-4">
        {SPECS.map(([term, value]) => (
          <div key={term}>
            <dt className="text-micro font-medium uppercase text-ink-muted">{term}</dt>
            <dd className="mt-1.5 text-body text-ink">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
};
