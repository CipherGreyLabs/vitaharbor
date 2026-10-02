import React, { Suspense, lazy, useCallback, useEffect, useState } from "react";
import { type RendererErrorReason, type SelectedProjectView } from "../3d/VitaConsoleScene";
import { LiveAreaWaves } from "../visual/LiveAreaWaves";
import { ProjectMark } from "../projects/ProjectMark";
import { splitTitle, prettyStage, SPECS } from "./types";
import { Check, Link2, ExternalLink, ChevronLeft, ChevronRight, RotateCw, Monitor, Eye, Maximize2, Sparkles, MonitorPlay } from "lucide-react";
import { type CameraViewPreset } from "../3d/VitaConsoleScene";

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
  return false;
}

function readReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return false;
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
  const [preference, setPreference] = useState<Console3DPreference | null>(() => readConsolePreference() || "3d");
  const [rendererFailure, setRendererFailure] = useState<RendererErrorReason | null>(null);
  const [sceneReady, setSceneReady] = useState(false);
  const [sceneStatus, setSceneStatus] = useState<"deferred" | "loading" | "ready">("deferred");
  const [isFlipped, setIsFlipped] = useState(false);
  const [viewPreset, setViewPreset] = useState<CameraViewPreset>("front");

  useEffect(() => {
    const connection = (navigator as Navigator & {
      connection?: {
        saveData?: boolean;
        addEventListener?: (type: string, listener: () => void) => void;
        removeEventListener?: (type: string, listener: () => void) => void;
      };
    }).connection;
    const update = () => {
      setSaveData(false);
    };
    update();
    connection?.addEventListener?.("change", update);
    return () => {
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
    <section aria-labelledby="console-heading" className="w-full">
      <h2 id="console-heading" className="sr-only">
        Interactive console preview
      </h2>

      <div className="relative w-full py-2">
        <LiveAreaWaves className="pointer-events-none absolute inset-x-0 inset-y-0 h-full w-full opacity-30" />

        {/* Minimalist Camera Presets */}
        <div className="mb-4 flex flex-wrap items-center justify-center gap-2 px-2 sm:px-6">
          <div className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-zinc-900/80 p-1 backdrop-blur-md">
            {[
              { id: "front", label: "Front" },
              { id: "inspect", label: "3D Angle" },
              { id: "rear", label: "Rear View" },
              { id: "screen", label: "Screen Focus" }
            ].map((p) => {
              const active = viewPreset === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setViewPreset(p.id as CameraViewPreset);
                    setIsFlipped(p.id === "rear");
                  }}
                  className={
                    "inline-flex min-h-[44px] sm:min-h-[36px] items-center rounded-full px-4 sm:px-4 py-2 sm:py-1.5 text-[12px] sm:text-[12px] font-medium transition-all " +
                    (active
                      ? "bg-white text-black font-semibold shadow-sm"
                      : "text-zinc-400 hover:text-white")
                  }
                >
                  <span>{p.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="relative px-1 pt-0 sm:px-4">
          <div className="vh-oled-aura" aria-hidden="true" />
          {/* Floating Left / Right project navigators */}
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous Vita project (left arrow or K)"
            title="Previous project (← or K)"
            className="absolute left-2 sm:left-6 top-1/2 z-30 -translate-y-1/2 inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-white/10 bg-black/60 p-2.5 text-zinc-300 backdrop-blur-md transition-all hover:scale-105 hover:border-white/30 hover:bg-black/90 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next Vita project (right arrow or J)"
            title="Next project (→ or J)"
            className="absolute right-2 sm:right-6 top-1/2 z-30 -translate-y-1/2 inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-white/10 bg-black/60 p-2.5 text-zinc-300 backdrop-blur-md transition-all hover:scale-105 hover:border-white/30 hover:bg-black/90 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <div
            ref={consoleRef}
            className="relative z-10 h-[300px] sm:h-[380px] md:h-[420px] lg:h-[460px]"
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
                    viewPreset={viewPreset}
                    isFlipped={isFlipped}
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
              <span className="text-micro uppercase tracking-[0.12em] text-zinc-400">{fallbackLabel}</span>
              {staticMode && canLoad3d && (
                <button
                  type="button"
                  onClick={() => persistPreference("3d")}
                  className="inline-flex min-h-[44px] items-center rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-caption font-medium text-white transition-colors hover:border-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
                >
                  Load 3D Vita
                </button>
              )}
              {staticMode && !canLoad3d && (
                <button
                  type="button"
                  onClick={retry3d}
                  className="inline-flex min-h-[44px] items-center rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-caption font-medium text-white transition-colors hover:border-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
                >
                  Retry 3D Vita
                </button>
              )}
              {!staticMode && saveData && preference === "3d" && (
                <button
                  type="button"
                  onClick={() => persistPreference("static")}
                  className="inline-flex min-h-[44px] items-center rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-caption font-medium text-white transition-colors hover:border-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
                >
                  Use static preview
                </button>
              )}
            </div>
          )}
          <div aria-hidden="true" className="vh-floor mx-auto h-px w-[84%]" />
        </div>

        {/* Minimalist Active Display Status Card */}
        <div className="relative mx-auto max-w-xl px-4 pt-4 pb-2">
          {preview && (
            <div className="flex items-center justify-between gap-3 border-t border-zinc-900 pt-3">
              <div className="min-w-0">
                <p className="truncate text-[15px] font-semibold text-white">{preview.name}</p>
                <p className="text-[12px] text-zinc-400">
                  {prettyStage(selectedProject?.current_stage)} · {selectedProject?.original_platform || "Various"}
                </p>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label="Previous project"
                  title="Previous project"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700 hover:text-white transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="Next project"
                  title="Next project"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700 hover:text-white transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onCopyLink(selectedProject)}
                  className="inline-flex h-9 items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 text-caption font-medium text-zinc-300 hover:border-zinc-700 hover:text-white transition-colors"
                >
                  {copiedSlug === (selectedProject as any)?.slug ? (
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <Link2 className="h-3.5 w-3.5" />
                  )}
                  <span>{copiedSlug === (selectedProject as any)?.slug ? "Copied" : "Link"}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
