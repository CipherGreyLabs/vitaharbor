import React, { Suspense, lazy, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { apiGet } from "../lib/api";
import { useDocumentMeta } from "../lib/useDocumentMeta";
import { Search, ExternalLink, X, ChevronDown, Link2, Check } from "lucide-react";
import { ProjectMark } from "../components/projects/ProjectMark";

const VitaConsoleScene = lazy(() =>
  import("../components/3d/VitaConsoleScene").then((module) => ({ default: module.VitaConsoleScene }))
);

const FILTERS = [
  { key: "all", label: "All ports" },
  { key: "wip", label: "In development" },
  { key: "playable", label: "Playable" },
  { key: "booting", label: "Early boot" }
];

const SORTS = [
  { key: "recent", label: "Recently active" },
  { key: "progress", label: "Furthest along" },
  { key: "name", label: "A – Z" }
];

const STAGE_TONE: Record<string, string> = {
  released: "bg-stage-done",
  completable: "bg-stage-done",
  playable: "bg-stage-done",
  in_game: "bg-stage-progress",
  booting: "bg-stage-caution",
  early_wip: "bg-stage-idle",
  research: "bg-stage-idle",
  announced: "bg-stage-idle"
};

const STAGE_STEP: Record<string, number> = {
  announced: 1,
  research: 1,
  early_wip: 2,
  booting: 3,
  in_game: 4,
  playable: 5,
  completable: 5,
  released: 5
};

const STAGE_RANK: Record<string, number> = {
  announced: 0,
  research: 0,
  early_wip: 1,
  booting: 2,
  in_game: 3,
  playable: 4,
  completable: 5,
  released: 6
};

const SPECS: Array<[string, string]> = [
  ["Architecture", "Quad Cortex-A9"],
  ["Graphics", "SGX543MP4+"],
  ["Display", "960 × 544 OLED"],
  ["Memory", "512 MB unified"]
];

const STAGE_CHIP: Record<string, string> = {
  released: "bg-emerald-100 text-emerald-800",
  completable: "bg-emerald-100 text-emerald-800",
  playable: "bg-emerald-100 text-emerald-800",
  in_game: "bg-blue-100 text-blue-800",
  booting: "bg-amber-100 text-amber-800",
  early_wip: "bg-slate-200 text-slate-700",
  research: "bg-slate-200 text-slate-700",
  announced: "bg-slate-200 text-slate-700"
};

type CountMode = "idle" | "animate" | "instant";

/**
 * Counts up once, but falls back to the true value whenever the animation is not
 * going to be seen: reduced motion, or a band the visitor jumped straight past.
 * A figure of zero must never be shown for a real count.
 */
function useCountUp(target: number, mode: CountMode) {
  const [value, setValue] = useState(target);

  useEffect(() => {
    if (mode === "animate") return;
    setValue(target);
  }, [mode, target]);

  useEffect(() => {
    if (mode !== "animate") return;
    let frame = 0;
    const started = performance.now();
    const step = (now: number) => {
      const progress = Math.min(1, (now - started) / 850);
      setValue(Math.round(target * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    setValue(0);
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [mode, target]);

  return value;
}

const StatFigure: React.FC<{ label: string; value: number; note: string; mode: CountMode }> = ({
  label,
  value,
  note,
  mode
}) => {
  const shown = useCountUp(value, mode);
  return (
    <div className="bg-deep px-5 py-6">
      <p className="text-micro font-medium uppercase text-white/45">{label}</p>
      <p className="vh-tnum mt-2 text-title font-semibold text-white">{shown}</p>
      <p className="mt-1 text-caption text-white/45">{note}</p>
    </div>
  );
};

const StatBand: React.FC<{ items: Array<[string, number, string]> }> = ({ items }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<CountMode>("idle");

  // Decide before paint whether this band is even going to be seen animating.
  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const alreadyPassed = node.getBoundingClientRect().bottom < 0;
    if (reduced || alreadyPassed) setMode("instant");
  }, []);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setMode("instant");
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setMode("animate");
            observer.disconnect();
          }
        }
      },
      { threshold: 0.35 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="mx-auto max-w-5xl px-6 py-10">
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-white/10 sm:grid-cols-4">
        {items.map(([label, value, note]) => (
          <StatFigure key={label} label={label} value={value} note={note} mode={mode} />
        ))}
      </div>
    </div>
  );
};

function splitTitle(raw: unknown) {
  const value = String(raw || "Untitled port").trim();
  const open = value.indexOf("(");
  if (open === -1) return { name: value, engine: "" };
  return {
    name: value.slice(0, open).trim(),
    engine: value.slice(open).replace(/[()]/g, "").trim()
  };
}

function prettyStage(stage: unknown) {
  const value = String(stage || "wip").replace(/_/g, " ");
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function relativeTime(value: unknown) {
  const time = new Date(String(value)).getTime();
  if (Number.isNaN(time)) return "";
  const hours = Math.round((Date.now() - time) / 3600000);
  if (hours < 1) return "just now";
  if (hours < 24) return hours + "h ago";
  const days = Math.round(hours / 24);
  if (days < 31) return days + "d ago";
  return Math.round(days / 30) + "mo ago";
}

function formatMonth(value: unknown) {
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

function formatDay(value: unknown) {
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function slugFromLocation(pathname: string, hash: string) {
  const fromHash = hash.match(/p=([a-z0-9-]+)/i);
  if (fromHash) return fromHash[1].toLowerCase();
  const fromPath = pathname.match(/^\/projects\/([a-z0-9-]+)\/?$/i);
  if (fromPath) return fromPath[1].toLowerCase();
  return "";
}

function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced || typeof IntersectionObserver === "undefined") {
      node.setAttribute("data-reveal", "in");
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.setAttribute("data-reveal", "in");
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.08 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return ref;
}

const ConsoleSkeleton = () => (
  <div className="flex h-full w-full items-end justify-center pb-10">
    <div className="vh-skeleton h-[62%] w-[78%] max-w-[620px] rounded-[30px] bg-sunken" />
  </div>
);

export const HomePage: React.FC = () => {
  useDocumentMeta({
    title: "VitaHarbor — PlayStation Vita Port Archive",
    description:
      "An independent archive of PlayStation Vita engine decompilations, ARM wrappers and homebrew builds, sourced from community engineering boards."
  });

  const [projects, setProjects] = useState<any[]>([]);
  const [recentUpdates, setRecentUpdates] = useState<any[]>([]);
  const [discovered, setDiscovered] = useState<any[]>([]);
  const [scannedAt, setScannedAt] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [activeSort, setActiveSort] = useState("recent");
  const [loading, setLoading] = useState(true);
  const [copiedSlug, setCopiedSlug] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [webgl, setWebgl] = useState<boolean | null>(null);

  const consoleRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const directoryReveal = useReveal<HTMLElement>();
  const methodReveal = useReveal<HTMLElement>();

  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const supported =
        typeof window.WebGLRenderingContext === "function" &&
        Boolean(canvas.getContext("webgl") || canvas.getContext("experimental-webgl"));
      setWebgl(supported);
    } catch {
      setWebgl(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const [projectsRes, updatesRes] = await Promise.all([
        apiGet<{ projects: any[] }>("/api/projects?limit=50", "projects").catch(() => ({ projects: [] })),
        apiGet<{ updates: any[] }>("/api/updates?limit=8", "updates").catch(() => ({ updates: [] }))
      ]);
      if (cancelled) return;
      const list = projectsRes?.projects || [];
      setProjects(list);
      setRecentUpdates(updatesRes?.updates || []);

      try {
        const res = await fetch("/data/discovered.json", { headers: { accept: "application/json" } });
        if (res.ok) {
          const body = (await res.json()) as { items?: unknown[]; generated_at?: unknown };
          if (Array.isArray(body?.items)) setDiscovered(body.items);
          if (typeof body?.generated_at === "string") setScannedAt(body.generated_at);
        }
      } catch {
        // The scanner has not run yet; the band stays hidden.
      }
      setLoading(false);

      const wanted = slugFromLocation(window.location.pathname, window.location.hash);
      const deep = wanted ? list.find((item) => item.slug === wanted) : null;
      const initial = deep || list[0];
      if (initial) {
        setSelectedId(initial.id);
        if (deep) {
          setExpandedId(deep.id);
          requestAnimationFrame(() => {
            document.getElementById("entry-" + deep.slug)?.scrollIntoView({ behavior: "smooth", block: "center" });
          });
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement;
      if (event.key === "/" && !typing) {
        event.preventDefault();
        searchRef.current?.focus();
      }
      if (event.key === "Escape") {
        setSearchTerm("");
        if (typing) target?.blur();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const selectedProject = useMemo(
    () => projects.find((item) => item.id === selectedId) || null,
    [projects, selectedId]
  );

  const visible = useMemo(() => {
    let list = [...projects];

    if (activeFilter === "wip") {
      list = list.filter((p) => ["in_game", "booting", "early_wip", "research"].includes(String(p.current_stage)));
    } else if (activeFilter === "playable") {
      list = list.filter((p) => ["playable", "released", "completable"].includes(String(p.current_stage)));
    } else if (activeFilter === "booting") {
      list = list.filter((p) => ["booting", "early_wip", "research"].includes(String(p.current_stage)));
    }

    const term = searchTerm.trim().toLowerCase();
    if (term) {
      list = list.filter(
        (p) =>
          [p.game_title, p.display_name, p.summary, p.original_platform, p.slug]
            .filter(Boolean)
            .some((field: string) => String(field).toLowerCase().includes(term)) ||
          (p.technologies || []).some((tech: string) => String(tech).toLowerCase().includes(term))
      );
    }

    list.sort((a, b) => {
      if (activeSort === "name") {
        return splitTitle(a.game_title || a.display_name)
          .name.localeCompare(splitTitle(b.game_title || b.display_name).name);
      }
      if (activeSort === "progress") {
        const diff = (STAGE_RANK[String(b.current_stage)] ?? -1) - (STAGE_RANK[String(a.current_stage)] ?? -1);
        if (diff !== 0) return diff;
      }
      return new Date(b.last_activity_at || 0).getTime() - new Date(a.last_activity_at || 0).getTime();
    });

    return list;
  }, [projects, activeFilter, activeSort, searchTerm]);

  const newest = recentUpdates[0];
  const preview = selectedProject ? splitTitle(selectedProject.game_title || selectedProject.display_name) : null;

  const selectProject = (project: any, scroll = true) => {
    setSelectedId(project.id);
    if (scroll) consoleRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const toggleEntry = (project: any) => {
    const next = expandedId === project.id ? null : project.id;
    setExpandedId(next);
    setSelectedId(project.id);
    if (next) {
      history.replaceState(null, "", "#p=" + project.slug);
    } else if (window.location.hash.startsWith("#p=")) {
      history.replaceState(null, "", window.location.pathname);
    }
  };

  const copyEntryLink = async (project: any) => {
    const url = window.location.origin + "/#p=" + project.slug;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedSlug(project.slug);
      setAnnouncement("Direct link copied for " + splitTitle(project.game_title || project.display_name).name);
      window.setTimeout(() => setCopiedSlug(""), 1800);
    } catch {
      setCopiedSlug("");
      setAnnouncement("Copying the link failed. You can copy it from the address bar instead.");
    }
  };

  return (
    <div id="top" className="min-h-screen bg-canvas text-ink">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-ink focus:px-4 focus:py-2 focus:text-caption focus:text-white"
      >
        Skip to content
      </a>

      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>

      <header
        className={
          "sticky top-0 z-50 border-b bg-surface/85 backdrop-blur-xl transition-colors " +
          (scrolled ? "border-hairline" : "border-transparent")
        }
      >
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <a
            href="#top"
            className="rounded-md text-lead font-semibold tracking-tight text-ink outline-none focus-visible:ring-2 focus-visible:ring-ink/20"
          >
            VitaHarbor
          </a>
          <nav aria-label="Sections" className="flex items-center gap-4 text-body text-ink-medium sm:gap-5">
            <a href="#directory" className="rounded-md transition-colors hover:text-ink">Directory</a>
            <a href="#methodology" className="rounded-md transition-colors hover:text-ink">Methodology</a>
            <span className="hidden items-center gap-1.5 rounded-full bg-sunken px-2.5 py-1 text-micro font-medium uppercase text-ink-medium sm:inline-flex">
              <span className="h-1.5 w-1.5 rounded-full bg-ink-muted" />
              <span className="vh-tnum">{loading ? "—" : projects.length}</span>
              <span>indexed</span>
            </span>
          </nav>
        </div>
      </header>

      {recentUpdates.length > 0 && (
        <div
          role="region"
          aria-label="Latest community signals"
          className="relative flex h-9 items-center overflow-hidden border-b border-hairline bg-surface"
        >
          <div className="vh-ticker text-caption text-ink-muted">
            {[0, 1].map((pass) => (
              <React.Fragment key={pass}>
                {recentUpdates.map((item, index) => (
                  <a
                    key={pass + "-" + index}
                    href={item.sources?.[0]?.canonical_url || "#directory"}
                    target={item.sources?.[0]?.canonical_url ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    tabIndex={pass === 0 ? 0 : -1}
                    aria-hidden={pass === 1}
                    className="mx-7 inline-flex items-center gap-2.5 whitespace-nowrap transition-colors hover:text-accent"
                  >
                    <span className="vh-tnum text-ink-muted">{relativeTime(item.event_at)}</span>
                    <span className="h-1 w-1 rounded-full bg-accent" />
                    <span>{item.title}</span>
                  </a>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      <main id="main-content">
        <section className="relative mx-auto max-w-5xl px-6 pb-2 pt-14 text-center">
          <div aria-hidden="true" className="vh-hero-wash pointer-events-none absolute inset-x-0 -top-10 h-72" />
          <p className="flex items-center justify-center gap-2 text-micro font-medium uppercase tracking-[0.2em] text-ink-medium">
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-accent" />
            Independent hardware archive
          </p>
          <h1 className="mx-auto mt-5 max-w-3xl text-display font-semibold text-ink sm:text-displaylg">
            PlayStation Vita port archive.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lead text-ink-medium">
            Engine decompilations, ARM wrappers and homebrew builds documented at the moment
            they surface on community engineering boards.
          </p>
        </section>

                <section aria-labelledby="console-heading" className="mx-auto max-w-4xl px-6 pt-8">
          <h2 id="console-heading" className="sr-only">
            Interactive console preview
          </h2>

          <div className="relative overflow-hidden rounded-3xl border border-hairline-strong bg-gradient-to-b from-surface via-surface to-sunken shadow-lift">
            <div aria-hidden="true" className="vh-glow pointer-events-none absolute inset-x-0 top-0 h-[620px]" />
            <div aria-hidden="true" className="vh-dots pointer-events-none absolute inset-0 opacity-80" />
            <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-sunken to-transparent" />

            <div className="relative px-4 pt-4 sm:px-8">
              <div ref={consoleRef} className="h-[400px] sm:h-[500px]">
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
                  <ProjectMark seed={selectedProject?.slug || "vita"} size={46} className="hidden shrink-0 rounded-xl sm:block" />
                  <div className="min-w-0">
                    <p className="text-micro font-medium uppercase text-ink-muted">On the display</p>
                    <p className="mt-1 truncate text-subtitle font-medium text-ink">{preview.name}</p>
                    <p className="mt-0.5 text-caption text-ink-muted">
                      {prettyStage(selectedProject?.current_stage)}
                      {selectedProject?.original_platform ? " · " + selectedProject.original_platform : ""}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={() => copyEntryLink(selectedProject)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-hairline bg-surface px-3 py-2 text-caption font-medium text-ink-medium transition-colors hover:border-hairline-strong hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20"
                    >
                      {copiedSlug === selectedProject?.slug ? (
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
                    {selectedProject?.reddit_url && (
                      <a
                        href={selectedProject.reddit_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-ink px-3.5 py-2 text-caption font-medium text-white transition-colors hover:bg-ink/90"
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
                        onClick={() => selectProject(project, false)}
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
                Drag to rotate · Press <span className="font-mono">/</span> to search the directory
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

        <section aria-label="Archive at a glance" className="mt-20 bg-deep">
          <StatBand
            items={[
              ["Indexed ports", projects.length, "Across both boards"],
              [
                "In development",
                projects.filter((p) =>
                  ["in_game", "booting", "early_wip", "research"].includes(String(p.current_stage))
                ).length,
                "Active work"
              ],
              [
                "Playable",
                projects.filter((p) => ["playable", "released", "completable"].includes(String(p.current_stage)))
                  .length,
                "Verified end to end"
              ],
              ["Sources", 2, "r/vitahacks · r/VitaPiracy"]
            ]}
          />
        </section>


        <section
          id="directory"
          ref={directoryReveal}
          data-reveal=""
          aria-labelledby="directory-heading"
          className="mx-auto mt-28 max-w-5xl px-6"
        >
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 id="directory-heading" className="text-title font-semibold text-ink">
                Directory
              </h2>
              <p className="mt-1.5 text-body text-ink-medium">
                {loading
                  ? "Loading indexed projects…"
                  : visible.length === projects.length
                    ? projects.length + " projects indexed"
                    : "Showing " + visible.length + " of " + projects.length}
                {newest && !loading ? " · newest signal " + relativeTime(newest.event_at) : ""}
              </p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
              <input
                ref={searchRef}
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                aria-label="Filter the directory"
                placeholder="Filter by game, engine or platform"
                className="w-full rounded-xl border border-hairline bg-surface py-2.5 pl-9 pr-9 text-body text-ink placeholder:text-ink-muted outline-none transition-shadow focus:border-hairline-strong focus:ring-4 focus:ring-ink/5"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  aria-label="Clear search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-ink-muted transition-colors hover:bg-sunken hover:text-ink"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-1.5">
              {FILTERS.map((filter) => (
                <button
                  key={filter.key}
                  type="button"
                  aria-pressed={activeFilter === filter.key}
                  onClick={() => setActiveFilter(filter.key)}
                  className={
                    "rounded-full px-3.5 py-1.5 text-caption font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20 " +
                    (activeFilter === filter.key
                      ? "bg-ink text-white"
                      : "bg-sunken text-ink-medium hover:bg-hairline hover:text-ink")
                  }
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <label className="flex items-center gap-2 text-caption text-ink-muted">
              <span className="hidden sm:inline">Sort</span>
              <select
                value={activeSort}
                onChange={(event) => setActiveSort(event.target.value)}
                className="rounded-lg border border-hairline bg-surface px-2.5 py-1.5 text-caption font-medium text-ink-medium outline-none transition-shadow focus:ring-4 focus:ring-ink/5"
              >
                {SORTS.map((sort) => (
                  <option key={sort.key} value={sort.key}>
                    {sort.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-hairline bg-surface shadow-card">
            <div className="hidden grid-cols-12 gap-4 border-b border-hairline bg-sunken px-5 py-3 text-micro font-semibold uppercase text-ink-muted md:grid">
              <div className="col-span-5">Project</div>
              <div className="col-span-2">Stage</div>
              <div className="col-span-4">Hardware notes</div>
              <div className="col-span-1 text-right">Source</div>
            </div>

            {loading ? (
              <div className="divide-y divide-hairline">
                {[0, 1, 2, 3, 4].map((row) => (
                  <div key={row} className="flex items-center gap-4 px-5 py-5">
                    <div className="vh-skeleton h-3 w-40 rounded-full bg-sunken" />
                    <div className="vh-skeleton h-3 w-20 rounded-full bg-sunken" />
                    <div className="vh-skeleton hidden h-3 flex-1 rounded-full bg-sunken md:block" />
                  </div>
                ))}
              </div>
            ) : visible.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <p className="text-body text-ink-medium">Nothing matches that search.</p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    setActiveFilter("all");
                  }}
                  className="mt-3 text-body font-medium text-ink underline underline-offset-4"
                >
                  Reset filters
                </button>
              </div>
            ) : (
              <ul className="divide-y divide-hairline">
                {visible.map((project, index) => {
                  const title = splitTitle(project.game_title || project.display_name);
                  const expanded = expandedId === project.id;
                  const selected = selectedId === project.id;
                  const history = Array.isArray(project.stage_history) ? project.stage_history : [];
                  const developers = Array.isArray(project.developers) ? project.developers : [];

                  return (
                    <li
                      key={project.id}
                      id={"entry-" + project.slug}
                      style={{ animationDelay: Math.min(index, 14) * 22 + "ms" }}
                      className={"vh-row " + (selected ? "bg-sunken/60" : "")}
                    >
                      <div
                        role="button"
                        tabIndex={0}
                        aria-expanded={expanded}
                        aria-controls={"panel-" + project.slug}
                        onClick={() => toggleEntry(project)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            toggleEntry(project);
                          }
                        }}
                        className="group/row relative grid cursor-pointer grid-cols-1 gap-2.5 px-5 py-4 transition-colors hover:bg-sunken/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ink/20 md:grid-cols-12 md:items-center md:gap-4"
                      >
                        <span
                          aria-hidden="true"
                          className="absolute left-0 top-0 h-full w-0.5 origin-top scale-y-0 bg-accent transition-transform duration-200 group-hover/row:scale-y-100"
                        />
                        <div className="md:col-span-5">
                          <span className="flex items-center gap-2.5">
                            <ProjectMark
                              seed={project.slug}
                              size={30}
                              className="shrink-0 rounded-[9px] transition-transform duration-200 group-hover/row:scale-105"
                            />
                            <span className="min-w-0">
                              <span className="block truncate text-subtitle font-medium text-ink transition-colors group-hover/row:text-accent">
                                {title.name}
                              </span>
                              <span className="mt-0.5 block font-mono text-micro uppercase text-ink-muted">
                                {title.engine || project.original_platform || "Port"}
                              </span>
                            </span>
                          </span>
                          <span aria-hidden="true" className="mt-2.5 flex gap-1 pl-[38px]">
                            {[1, 2, 3, 4, 5].map((segment) => (
                              <span
                                key={segment}
                                className={
                                  "h-[3px] w-5 rounded-full " +
                                  (segment <= (STAGE_STEP[String(project.current_stage)] || 1)
                                    ? STAGE_TONE[String(project.current_stage)] || "bg-stage-idle"
                                    : "bg-hairline")
                                }
                              />
                            ))}
                          </span>
                        </div>

                        <div className="pl-4 md:col-span-2 md:pl-0">
                          <span className={
                              "inline-flex rounded-md px-2 py-1 text-micro font-semibold uppercase " +
                              (STAGE_CHIP[String(project.current_stage)] || "bg-sunken text-ink-medium")
                            }>
                            {prettyStage(project.current_stage)}
                          </span>
                          {project.verification === "detected" && (
                            <span className="ml-1.5 inline-flex rounded-md border border-hairline px-2 py-1 text-micro font-semibold uppercase text-ink-muted">
                              Unverified
                            </span>
                          )}
                        </div>

                        <div className="pl-4 md:col-span-4 md:pl-0">
                          <p className="line-clamp-2 text-body text-ink-medium md:line-clamp-1">
                            {project.performance_notes || project.playability_notes || "Tested on native hardware."}
                          </p>
                        </div>

                        <div className="flex items-center gap-1 pl-4 md:col-span-1 md:justify-end md:pl-0">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              copyEntryLink(project);
                            }}
                            title="Copy a direct link to this entry"
                            aria-label={"Copy a direct link to " + title.name}
                            className="rounded-md p-1.5 text-ink-muted transition-colors hover:bg-sunken hover:text-ink"
                          >
                            {copiedSlug === project.slug ? (
                              <Check className="h-4 w-4 text-stage-done" />
                            ) : (
                              <Link2 className="h-4 w-4" />
                            )}
                          </button>
                          {project.reddit_url && (
                            <a
                              href={project.reddit_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(event) => event.stopPropagation()}
                              title="Open the source discussion"
                              aria-label={"Open the source discussion for " + title.name}
                              className="rounded-md p-1.5 text-ink-muted transition-colors hover:bg-sunken hover:text-ink"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}
                          <ChevronDown
                            aria-hidden="true"
                            className={
                              "h-4 w-4 text-ink-muted transition-transform duration-300 " +
                              (expanded ? "rotate-180" : "")
                            }
                          />
                        </div>
                      </div>

                      {expanded && (
                        <div
                          id={"panel-" + project.slug}
                          className="border-t border-hairline bg-sunken/50 px-5 py-6"
                        >
                          {project.verification === "detected" && (
                            <p className="mb-6 max-w-3xl rounded-lg border border-hairline bg-surface px-4 py-3 text-caption text-ink-medium">
                              <span className="font-medium text-ink">Unverified entry.</span> Promoted
                              automatically from a detected thread. There is no hardware report yet, so
                              playability and performance are deliberately left empty.
                            </p>
                          )}
                          <div className="grid gap-8 lg:grid-cols-3">
                            <div className="lg:col-span-2">
                              <h3 className="text-micro font-semibold uppercase text-ink-muted">
                                Engineering notes
                              </h3>
                              <p className="mt-3 max-w-2xl text-body text-ink-medium">
                                {project.summary || "No summary recorded for this project yet."}
                              </p>

                              {project.playability_notes && (
                                <p className="mt-4 max-w-2xl text-body text-ink-medium">
                                  <span className="font-medium text-ink">Playability: </span>
                                  {project.playability_notes}
                                </p>
                              )}

                              {project.technologies?.length > 0 && (
                                <div className="mt-4 flex flex-wrap gap-1.5">
                                  {project.technologies.map((tech: string) => (
                                    <span
                                      key={tech}
                                      className="rounded-md border border-hairline bg-surface px-2 py-1 font-mono text-micro uppercase text-ink-muted"
                                    >
                                      {tech}
                                    </span>
                                  ))}
                                </div>
                              )}

                              <dl className="mt-6 grid grid-cols-1 gap-x-8 gap-y-5 border-t border-hairline pt-5 sm:grid-cols-3">
                                <div>
                                  <dt className="text-micro font-medium uppercase text-ink-muted">Credits</dt>
                                  <dd className="mt-1.5 text-body text-ink">
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
                                  <dd className="mt-1.5 text-body text-ink">
                                    {formatMonth(project.first_seen_at) || "—"}
                                  </dd>
                                </div>
                                <div>
                                  <dt className="text-micro font-medium uppercase text-ink-muted">Last activity</dt>
                                  <dd className="mt-1.5 text-body text-ink">
                                    {formatDay(project.last_activity_at) || "—"}
                                    <span className="text-ink-muted"> · {relativeTime(project.last_activity_at)}</span>
                                  </dd>
                                </div>
                                {project.original_release_year && (
                                  <div>
                                    <dt className="text-micro font-medium uppercase text-ink-muted">Original release</dt>
                                    <dd className="mt-1.5 text-body text-ink">
                                      {project.original_release_year}
                                      {project.original_platform ? " · " + project.original_platform : ""}
                                    </dd>
                                  </div>
                                )}
                                {project.released_at && (
                                  <div>
                                    <dt className="text-micro font-medium uppercase text-ink-muted">Vita release</dt>
                                    <dd className="mt-1.5 text-body text-ink">{formatDay(project.released_at)}</dd>
                                  </div>
                                )}
                              </dl>
                            </div>

                            <div>
                              <h3 className="text-micro font-semibold uppercase text-ink-muted">
                                Milestones
                              </h3>
                              <ol className="mt-3 border-l border-hairline pl-4">
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

                          <div className="mt-7 flex flex-wrap items-center gap-3 border-t border-hairline pt-5">
                            <button
                              type="button"
                              onClick={() => selectProject(project)}
                              className="rounded-lg bg-ink px-3.5 py-2 text-caption font-medium text-white transition-colors hover:bg-ink/90"
                            >
                              Show on the console
                            </button>
                            <button
                              type="button"
                              onClick={() => copyEntryLink(project)}
                              className="rounded-lg border border-hairline bg-surface px-3.5 py-2 text-caption font-medium text-ink-medium transition-colors hover:border-hairline-strong hover:text-ink"
                            >
                              {copiedSlug === project.slug ? "Link copied" : "Copy link"}
                            </button>
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
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>

        {discovered.length > 0 && (
          <section aria-labelledby="detected-heading" className="mx-auto mt-24 max-w-5xl px-6">
            <div className="rounded-2xl border border-hairline bg-surface p-6 shadow-card">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <div className="max-w-2xl">
                  <h2 id="detected-heading" className="text-subtitle font-semibold text-ink">
                    Detected, pending review
                  </h2>
                  <p className="mt-1.5 text-body text-ink-medium">
                    Threads the scanner picked up that are not in the curated ledger yet. They stay
                    unverified until someone checks the build on real hardware.
                  </p>
                </div>
                {scannedAt && (
                  <p className="vh-tnum text-caption text-ink-muted">Last scan {formatDay(scannedAt)}</p>
                )}
              </div>

              <ul className="mt-5 divide-y divide-hairline border-t border-hairline">
                {discovered.map((item) => (
                  <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 py-3.5">
                    <div className="min-w-0">
                      <p className="truncate text-body font-medium text-ink">{item.title}</p>
                      <p className="mt-0.5 text-caption text-ink-muted">
                        r/{item.subreddit} · {item.author} · {relativeTime(item.published_at || item.detected_at)}
                      </p>
                    </div>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex shrink-0 items-center gap-1.5 text-caption font-medium text-ink-medium transition-colors hover:text-accent"
                    >
                      Open thread
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        <section
          id="methodology"

          ref={methodReveal}
          data-reveal=""
          aria-labelledby="methodology-heading"
          className="mt-24 bg-deep"
        >
          <div className="mx-auto max-w-5xl px-6 py-16">
            <p className="text-micro font-medium uppercase tracking-[0.22em] text-white/45">Method</p>
            <h2 id="methodology-heading" className="mt-3 text-title font-semibold text-white">
              How entries get listed
            </h2>
            <div className="mt-10 grid gap-10 sm:grid-cols-3">
              {[
                [
                  "01",
                  "Sourced",
                  "Every entry links to the original engineering thread on r/vitahacks or r/VitaPiracy."
                ],
                [
                  "02",
                  "Verified",
                  "Stage and performance notes come from the people running the build on real hardware."
                ],
                [
                  "03",
                  "Non-infringing",
                  "Only discussion and source repositories are indexed. No ROMs, ISOs or game data are hosted."
                ]
              ].map(([number, title, body]) => (
                <div key={title}>
                  <p className="vh-tnum text-micro font-medium text-white/40">{number}</p>
                  <h3 className="mt-3 text-subtitle font-medium text-white">{title}</h3>
                  <p className="mt-2 text-body text-white/65">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>


      </main>

      <footer className="bg-surface">
        <div className="mx-auto max-w-5xl px-6 py-14">
          <div className="grid gap-10 sm:grid-cols-3">
            <div>
              <p className="flex items-center gap-2 text-subtitle font-semibold tracking-tight text-ink">
                <span aria-hidden="true" className="h-2 w-2 rounded-full bg-accent" />
                VitaHarbor
              </p>
              <p className="mt-3 max-w-xs text-body text-ink-medium">
                An independent archive of PlayStation Vita ports, assembled from public engineering threads.
              </p>
            </div>
            <div>
              <h2 className="text-micro font-semibold uppercase text-ink-muted">Archive</h2>
              <ul className="mt-3 space-y-2 text-body">
                <li>
                  <a href="#directory" className="text-ink-medium transition-colors hover:text-accent">Directory</a>
                </li>
                <li>
                  <a href="#methodology" className="text-ink-medium transition-colors hover:text-accent">Methodology</a>
                </li>
                <li>
                  <a href="/data/discovered.json" target="_blank" rel="noopener noreferrer" className="text-ink-medium transition-colors hover:text-accent">
                    Discovery log
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h2 className="text-micro font-semibold uppercase text-ink-muted">Feeds</h2>
              <ul className="mt-3 space-y-2 text-body">
                <li>
                  <a href="/api/feed.json" target="_blank" rel="noopener noreferrer" className="text-ink-medium transition-colors hover:text-accent">
                    JSON Feed 1.1
                  </a>
                </li>
                <li>
                  <a href="/api/rss.xml" target="_blank" rel="noopener noreferrer" className="text-ink-medium transition-colors hover:text-accent">
                    RSS 2.0
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <p className="mt-12 border-t border-hairline pt-6 text-caption text-ink-muted">
            Nothing here bypasses licensing or distributes copyrighted game data. Every entry links to its
            original public thread.
          </p>
        </div>
      </footer>
    </div>
  );
};
