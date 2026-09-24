import React, { Suspense, lazy, useCallback, useEffect, useState } from "react";
import { type RendererErrorReason, type SelectedProjectView } from "../3d/VitaConsoleScene";
import { LiveAreaWaves } from "../visual/LiveAreaWaves";
import { ProjectMark } from "../projects/ProjectMark";
import { splitTitle, prettyStage, SPECS } from "./types";
import { Check, Link2, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";

const VitaConsoleScene = lazy(() =>
  import("../3d/VitaConsoleScene").then((m) => ({ default: m.VitaConsoleScene }))
);

export const CONSOLE_3D_PREFERENCE_KEY = "vitaharbor.console-3d-preference";
export type Console3DPreference = "3d" | "static";
export type ConsoleFallbackReason = "save-data" | "user-static" | "webgl-unavailable" | "renderer-error";

function readConsolePreference(): Console3DPreference | null {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(CONSOLE_3D_PREFERENCE_KEY);
    return value === "3d" || value === "static" ? value : null;
  } catch {
    return null;
  }
}

function readSaveData(): boolean {
  if (typeof navigator === "undefined") return false;
  return Boolean((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData);
}

function readReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
}

function writeConsolePreference(value: Console3DPreference) {
  try {
    window.localStorage.setItem(CONSOLE_3D_PREFERENCE_KEY, value);
  } catch {
    // A blocked storage area should not break the preview.
  }
}

const ConsoleSkeleton = () => (
  <div className="flex h-full w-full items-end justify-center pb-10">
    <div className="vh-skeleton h-[62%] w-[78%] max-w-[620px] rounded-[30px] bg-sunken" />
  </div>
);

const StaticConsolePreview: React.FC<{
  selectedProject: SelectedProjectView | null;
  reason: ConsoleFallbackReason;
}> = ({ selectedProject, reason }) => {
  const preview = selectedProject
    ? splitTitle(selectedProject.game_title || selectedProject.display_name)
    : null;

  return (
    <figure className="flex h-full w-full items-center justify-center">
      <div className="relative aspect-[605/288] w-full max-w-[605px]">
        <img
          src="/vita-render.png"
          alt="PlayStation Vita PCH-1000"
          className="absolute inset-0 h-full w-full object-contain"
          loading="eager"
        />
        <div
          data-testid="static-vita-screen"
          aria-label={preview ? "Vita screen showing " + preview.name : "Vita screen waiting for a project"}
          className="absolute left-[18.5%] top-[16%] h-[62%] w-[63%] overflow-hidden bg-[#05060a]"
        >
          {selectedProject?.screenshot_url ? (
            <img
              src={selectedProject.screenshot_url}
              alt={selectedProject.screenshot_alt || "Source screenshot for " + preview?.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full flex-col justify-center gap-2 bg-[linear-gradient(135deg,#030817,#111827)] px-[8%] text-white">
              <span className="line-clamp-2 text-xs font-semibold leading-tight sm:text-sm lg:text-base">
                {preview?.name || "Select a port"}
              </span>
              {selectedProject && (
                <span className="text-[9px] uppercase tracking-[0.12em] text-white/60 sm:text-[10px]">
                  {prettyStage(selectedProject.current_stage)}
                  {selectedProject.original_platform ? " · " + selectedProject.original_platform : ""}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
      <figcaption className="sr-only">
        {reason === "save-data"
          ? "Static console preview enabled to save data."
          : reason === "user-static"
            ? "Static console preview enabled by your preference."
            : reason === "renderer-error"
              ? "The 3D preview could not start, so the static preview is shown."
              : "3D is unavailable in this browser, so the static preview is shown."}
      </figcaption>
    </figure>
  );
};

interface ConsoleStageProps {
  selectedProject: SelectedProjectView | null;
  projects: any[];
  selectedId: number | null;
  onSelectProject: (project: any) => void;
  webgl: boolean | null;
  onRetryWebgl: () => void;
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
  onRetryWebgl,
  onCopyLink,
  copiedSlug,
  consoleRef
}) => {
  const [saveData, setSaveData] = useState(readSaveData);
  const [reducedMotion, setReducedMotion] = useState(readReducedMotion);
  const [preference, setPreference] = useState<Console3DPreference | null>(readConsolePreference);
  const [rendererFailure, setRendererFailure] = useState<RendererErrorReason | null>(null);
  const [sceneReady, setSceneReady] = useState(false);
  const [sceneStatus, setSceneStatus] = useState<"deferred" | "loading" | "ready">("deferred");

  useEffect(() => {
    const media = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    const connection = (navigator as Navigator & {
      connection?: {
        saveData?: boolean;
        addEventListener?: (type: string, listener: () => void) => void;
        removeEventListener?: (type: string, listener: () => void) => void;
      };
    }).connection;
    const update = () => {
      setReducedMotion(Boolean(media?.matches));
      setSaveData(Boolean(connection?.saveData));
    };
    update();
    media?.addEventListener?.("change", update);
    connection?.addEventListener?.("change", update);
    return () => {
      media?.removeEventListener?.("change", update);
      connection?.removeEventListener?.("change", update);
    };
  }, []);

  const handleRendererError = useCallback((reason: RendererErrorReason) => {
    setRendererFailure(reason);
  }, []);
  const handleRendererReady = useCallback(() => {
    setSceneStatus("ready");
  }, []);

  const explicitStatic = preference === "static";
  const saveDataStatic = saveData && preference !== "3d";
  const staticMode = webgl === false || Boolean(rendererFailure) || explicitStatic || saveDataStatic;
  const fallbackReason: ConsoleFallbackReason | null = webgl === false
    ? "webgl-unavailable"
    : rendererFailure
      ? "renderer-error"
      : explicitStatic
        ? "user-static"
        : saveDataStatic
          ? "save-data"
          : null;
  const fallbackLabel = fallbackReason === "save-data"
    ? "3D paused to save data"
    : fallbackReason === "user-static"
      ? "Static preview enabled"
      : fallbackReason === "renderer-error"
        ? "3D preview unavailable"
        : "WebGL unavailable";
  const canLoad3d = webgl !== false && !rendererFailure;
  const showPreviewControls = staticMode || (saveData && preference === "3d");

  useEffect(() => {
    if (staticMode || sceneReady) return;
    const node = consoleRef.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      setSceneReady(true);
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        setSceneStatus("loading");
        setSceneReady(true);
      }
    }, { rootMargin: "420px 0px", threshold: 0.01 });
    observer.observe(node);
    return () => observer.disconnect();
  }, [consoleRef, sceneReady, staticMode]);

  useEffect(() => {
    if (!staticMode && sceneReady) setSceneStatus("loading");
  }, [sceneReady, staticMode]);

  const persistPreference = (value: Console3DPreference) => {
    writeConsolePreference(value);
    setPreference(value);
    setRendererFailure(null);
    if (value === "3d") {
      setSceneStatus("loading");
      setSceneReady(true);
    }
  };

  const retry3d = () => {
    setRendererFailure(null);
    setSceneStatus("loading");
    setSceneReady(true);
    onRetryWebgl();
  };

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

      <div className="relative w-full py-2">
        <LiveAreaWaves className="pointer-events-none absolute inset-x-0 inset-y-0 h-full w-full opacity-60" />
        
        <div aria-hidden="true" className="vh-dots pointer-events-none absolute inset-0 opacity-80" />
        

        <div className="relative px-2 pt-0 sm:px-6">
          <div
            ref={consoleRef}
            className="h-[200px] sm:h-[260px] lg:h-[310px]"
            data-testid="console-stage"
            data-vita-mode={staticMode ? "static" : "3d"}
            data-vita-fallback-reason={fallbackReason || "none"}
            data-vita-scene-state={staticMode ? "fallback" : sceneStatus}
            data-reduced-motion={reducedMotion ? "true" : "false"}
            data-save-data={saveData ? "true" : "false"}
          >
            {staticMode ? (
              <StaticConsolePreview selectedProject={selectedProject} reason={fallbackReason || "user-static"} />
            ) : !sceneReady ? (
              <ConsoleSkeleton />
            ) : (
              <Suspense fallback={<ConsoleSkeleton />}>
                <div className="vh-rise h-full w-full" data-vita-scene="3d">
                  <VitaConsoleScene
                    selectedProject={selectedProject}
                    reducedMotion={reducedMotion}
                    onRendererError={handleRendererError}
                    onRendererReady={handleRendererReady}
                  />
                </div>
              </Suspense>
            )}
          </div>
          {showPreviewControls && (
            <div className="mt-2 flex flex-wrap items-center justify-center gap-2" role="group" aria-label="3D Vita preview controls">
              <span className="text-micro uppercase tracking-[0.12em] text-ink-muted">{fallbackLabel}</span>
              {staticMode && canLoad3d && (
                <button
                  type="button"
                  onClick={() => persistPreference("3d")}
                  className="inline-flex min-h-[44px] items-center rounded-lg border border-hairline bg-surface px-3 py-1.5 text-caption font-medium text-ink transition-colors hover:border-hairline-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20"
                >
                  Load 3D Vita
                </button>
              )}
              {staticMode && !canLoad3d && (
                <button
                  type="button"
                  onClick={retry3d}
                  className="inline-flex min-h-[44px] items-center rounded-lg border border-hairline bg-surface px-3 py-1.5 text-caption font-medium text-ink transition-colors hover:border-hairline-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20"
                >
                  Retry 3D Vita
                </button>
              )}
              {!staticMode && saveData && preference === "3d" && (
                <button
                  type="button"
                  onClick={() => persistPreference("static")}
                  className="inline-flex min-h-[44px] items-center rounded-lg border border-hairline bg-surface px-3 py-1.5 text-caption font-medium text-ink transition-colors hover:border-hairline-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20"
                >
                  Use static preview
                </button>
              )}
            </div>
          )}
          <div aria-hidden="true" className="vh-floor mx-auto h-px w-[84%]" />
        </div>

        <div className="relative px-4 pb-4 pt-4 sm:px-8">
          {preview && (
            <div className="flex flex-col gap-3 rounded-2xl border border-hairline bg-surface px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <ProjectMark
                seed={selectedProject?.display_name || selectedProject?.game_title || "vita"}
                size={38}
                className="hidden shrink-0 rounded-xl sm:block"
              />
              <div className="min-w-0 flex-1">
                <p className="text-micro font-medium uppercase text-ink-muted">
                  {selectedProject?.screenshot_url ? "Source screenshot on display" : "Record card on display"}
                </p>
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

          <div className="mt-4 flex justify-center">
            <div
              aria-label="Choose a project to preview"
              className="no-scrollbar flex max-w-full gap-1 overflow-x-auto rounded-full border border-hairline bg-sunken p-1"
            >
              {projects.map((project) => {
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

          <p className="mt-3 text-center text-micro uppercase text-ink-muted">
            <span className="hidden sm:inline">
              {staticMode ? "Static preview · " : reducedMotion ? "Reduced motion · " : "Drag to rotate · "}Press <span className="font-mono">/</span> to search the directory
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
