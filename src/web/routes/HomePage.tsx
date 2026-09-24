import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { apiGet } from "../lib/api";
import { useDocumentMeta } from "../lib/useDocumentMeta";
import { FALLBACK_PROJECTS, FALLBACK_UPDATES } from "@/shared/constants/fallbackData";
import { CommunityTicker } from "../components/ledger/CommunityTicker";
import { ConsoleStage } from "../components/ledger/ConsoleStage";
import { LedgerStats } from "../components/ledger/LedgerStats";
import { DirectoryTable } from "../components/ledger/DirectoryTable";
import { MethodologySection } from "../components/ledger/MethodologySection";
import {
  type LedgerProject,
  splitTitle,
  prettyStage,
  deriveProjectType,
  STAGE_RANK,
  formatDay,
  formatUtcDateTime,
  verificationMeta
} from "../components/ledger/types";
import { ArrowUp, ExternalLink } from "lucide-react";
import { countUpdatesSince, readLastVisit, readWatchlist, wasRecentlyUpdated, writeLastVisit, writeWatchlist } from "../lib/visitorState";
import { fetchCommunityPosts, type CommunityPost } from "../lib/scannerAssets";

interface DirectoryFilters {
  search: string;
  stage: string;
  type: string;
  sort: string;
}

function readDirectoryFilters(): DirectoryFilters {
  if (typeof window === "undefined") return { search: "", stage: "all", type: "all", sort: "recent" };
  const params = new URLSearchParams(window.location.search);
  return {
    search: params.get("q") || "",
    stage: params.get("stage") || "all",
    type: params.get("type") || "all",
    sort: params.get("sort") || "recent"
  };
}

function normaliseSearchValue(value: unknown) {
  return String(value || "")
    .replace(/&amp;/gi, "&")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\b(vita|port|ps)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function relatedProjectForCommunityPost(item: CommunityPost, projects: LedgerProject[]) {
  const candidate = normaliseSearchValue(item?.title);
  if (!candidate || candidate.length < 6) return null;
  return projects.find((project) => {
    const names = [project.game_title, project.display_name, project.slug]
      .map(normaliseSearchValue)
      .filter((name) => name.length >= 6);
    return names.some((name) => candidate.includes(name) || name.includes(candidate));
  }) || null;
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

export const HomePage: React.FC = () => {
  const metaSlug = typeof window !== "undefined"
    ? slugFromLocation(window.location.pathname, window.location.hash)
    : "";
  const metaOrigin = typeof window !== "undefined" ? window.location.origin : "https://vitaharbor.vercel.app";
  useDocumentMeta({
    title: "VitaHarbor — Latest PlayStation Vita port updates",
    description:
      "A small, source-linked tracker for new PlayStation Vita ports, decompilations and ARM wrapper updates found in the community.",
    image: metaOrigin + (metaSlug ? "/og/projects/" + metaSlug + ".png" : "/og.png"),
    imageAlt: metaSlug ? "VitaHarbor project record" : "VitaHarbor PlayStation Vita update tracker"
  });

  const [projects, setProjects] = useState<LedgerProject[]>(() => FALLBACK_PROJECTS as any[]);
  const [recentUpdates, setRecentUpdates] = useState<any[]>(() => FALLBACK_UPDATES as any[]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState(() => readDirectoryFilters().search);
  const [activeFilter, setActiveFilter] = useState(() => readDirectoryFilters().stage);
  const [activeCategory, setActiveCategory] = useState(() => readDirectoryFilters().type);
  const [activeSort, setActiveSort] = useState(() => readDirectoryFilters().sort);
  const [loading] = useState(false);
  const [copiedSlug, setCopiedSlug] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const [tickerPaused, setTickerPaused] = useState(false);
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([]);
  const [previousVisit, setPreviousVisit] = useState<number | null>(null);
  const [watchlistSlugs, setWatchlistSlugs] = useState<string[]>([]);

  const consoleRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const directoryReveal = useReveal<HTMLElement>();
  const methodReveal = useReveal<HTMLElement>();

  useEffect(() => {
    setPreviousVisit(readLastVisit());
    writeLastVisit();
    setWatchlistSlugs(readWatchlist());
  }, []);

  const detectWebgl = useCallback(() => {
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
    detectWebgl();
  }, [detectWebgl]);

  useEffect(() => {
    const url = new URL(window.location.href);
    const values: Array<[string, string, string]> = [
      ["q", searchTerm.trim(), ""],
      ["stage", activeFilter, "all"],
      ["type", activeCategory, "all"],
      ["sort", activeSort, "recent"]
    ];
    for (const [key, value, defaultValue] of values) {
      if (!value || value === defaultValue) url.searchParams.delete(key);
      else url.searchParams.set(key, value);
    }
    window.history.replaceState(null, "", url.pathname + (url.search ? url.search : "") + url.hash);
  }, [searchTerm, activeFilter, activeCategory, activeSort]);

  useEffect(() => {
    const bundled = FALLBACK_PROJECTS as any[];
    const wanted = slugFromLocation(window.location.pathname, window.location.hash);
    const deep = wanted ? bundled.find((item) => item.slug === wanted) : null;
    const initial = deep || bundled[0];
    if (initial) setSelectedId(initial.id);
    if (deep) {
      setExpandedId(deep.id);
      requestAnimationFrame(() => {
        document.getElementById("entry-" + deep.slug)?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    }

    let cancelled = false;

    async function refresh() {
      try {
        const [projectsRes, updatesRes] = await Promise.all([
          apiGet<{ projects: any[] }>('/api/projects?limit=50', 'projects').catch(() => null),
          apiGet<{ updates: any[] }>('/api/updates?limit=100', 'updates').catch(() => null)
        ]);
        if (cancelled) return;
        if (projectsRes && projectsRes.projects && Array.isArray(projectsRes.projects) && projectsRes.projects.length > 0) {
          setProjects(projectsRes.projects);
        }
        if (updatesRes && updatesRes.updates && Array.isArray(updatesRes.updates) && updatesRes.updates.length > 0) {
          setRecentUpdates(updatesRes.updates);
        }
      } catch (e) {
        console.error('API Refresh Error:', e);
      }

    }

    refresh();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const refreshCommunityPosts = async () => {
      const result = await fetchCommunityPosts();
      if (cancelled) return;
      setCommunityPosts(result.data?.items || []);
    };
    void refreshCommunityPosts();
    const interval = window.setInterval(() => void refreshCommunityPosts(), 15 * 60 * 1000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 6);
      setShowScrollTop(window.scrollY > 520);
    };
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
      if (!typing && (event.key === "ArrowLeft" || event.key === "k" || event.key === "K")) {
        event.preventDefault();
        const idx = projects.findIndex((p) => p.id === selectedId);
        if (idx !== -1 && projects.length > 0) {
          const prev = projects[(idx - 1 + projects.length) % projects.length];
          setSelectedId(prev.id);
        }
      }
      if (!typing && (event.key === "ArrowRight" || event.key === "j" || event.key === "J")) {
        event.preventDefault();
        const idx = projects.findIndex((p) => p.id === selectedId);
        if (idx !== -1 && projects.length > 0) {
          const next = projects[(idx + 1) % projects.length];
          setSelectedId(next.id);
        }
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

  const headerCounts = useMemo(() => {
    let playable = 0;
    let dev = 0;
    for (const p of projects) {
      const s = String(p.current_stage);
      if (["playable", "released", "completable"].includes(s)) playable++;
      else if (["in_game", "booting", "early_wip", "research"].includes(s)) dev++;
    }
    return { playable, dev };
  }, [projects]);

  // Avoid repeating a community post when its exact source is already in the directory.
  const normaliseUrl = (value: unknown) =>
    String(value || "").trim().replace(/\/+$/, "").toLowerCase();

  const communityPostsToShow = useMemo(() => {
    const ledgerUrls = new Set(
      projects.map((p) => normaliseUrl((p as any).reddit_url)).filter(Boolean)
    );
    return communityPosts.filter((item) => {
      const url = normaliseUrl(item.url);
      return !ledgerUrls.has(url);
    });
  }, [communityPosts, projects]);

  const unseenUpdates = useMemo(() => countUpdatesSince(recentUpdates, previousVisit), [recentUpdates, previousVisit]);
  const watchedProjects = useMemo(
    () => projects.filter((project) => watchlistSlugs.includes(project.slug)),
    [projects, watchlistSlugs]
  );

  const visible = useMemo(() => {
    let list = [...projects];

    if (activeFilter === "wip") {
      list = list.filter((p) => ["in_game", "booting", "early_wip", "research"].includes(String(p.current_stage)));
    } else if (activeFilter === "playable") {
      list = list.filter((p) => ["playable", "released", "completable"].includes(String(p.current_stage)));
    } else if (activeFilter === "booting") {
      list = list.filter((p) => ["booting", "early_wip", "research"].includes(String(p.current_stage)));
    } else if (activeFilter === "released") {
      list = list.filter((p) => String(p.current_stage) === "released");
    } else if (activeFilter === "recent") {
      list = list.filter((p) => wasRecentlyUpdated(p.last_activity_at));
    }

    if (activeCategory !== "all") {
      list = list.filter((p) => deriveProjectType(p) === activeCategory);
    }

    const term = searchTerm.trim().toLowerCase();
    if (term) {
      list = list.filter(
        (p) =>
          [
            p.game_title,
            p.display_name,
            p.summary,
            p.original_platform,
            p.slug,
            p.repo_url,
            ...(p.aliases || []),
            ...((p.developers || []).map((developer: any) => developer.display_name))
          ]
            .filter(Boolean)
            .some((field) => Boolean(field) && String(field).toLowerCase().includes(term)) ||
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
  }, [projects, activeFilter, activeCategory, activeSort, searchTerm]);

  const selectProject = (project: LedgerProject, scroll = true) => {
    setSelectedId(project.id);
    if (scroll && consoleRef.current) {
      const el = consoleRef.current;
      const top = el.getBoundingClientRect().top + window.scrollY - 64;
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    }
  };

  const toggleEntry = (project: LedgerProject) => {
    const next = expandedId === project.id ? null : project.id;
    setExpandedId(next);
    setSelectedId(project.id);
    const url = new URL(window.location.href);
    url.hash = next ? "p=" + project.slug : "";
    history.replaceState(null, "", url.pathname + url.search + url.hash);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setActiveFilter("all");
    setActiveCategory("all");
    setActiveSort("recent");
  };

  const copyEntryLink = async (project: LedgerProject) => {
    // Prefer the static deep link so the shared URL has its own preview card.
    const url = window.location.origin + "/projects/" + project.slug + "/";
    try {
      await navigator.clipboard.writeText(url);
      setCopiedSlug(project.slug);
      setAnnouncement("Direct link copied for " + splitTitle(project.game_title || project.display_name).name);
      window.setTimeout(() => setCopiedSlug(""), 1800);
    } catch {
      setCopiedSlug("");
      setAnnouncement("Copying link failed.");
    }
  };

  const scrollToTop = () => {
    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
  };

  return (
    <div id="top" className="min-h-screen bg-canvas text-ink">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-ink focus:px-4 focus:py-2 focus:text-caption focus:text-canvas"
      >
        Skip to content
      </a>

      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>

      {/* Header Bar */}
      <header
        className={
          "sticky top-0 z-50 border-b vh-glass/85 backdrop-blur-xl transition-colors " +
          (scrolled ? "border-hairline-strong/30" : "border-transparent")
        }
      >
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <a
            href="#top"
            className="inline-flex min-h-[44px] items-center rounded-md px-1 text-lead font-semibold tracking-tight text-ink outline-none focus-visible:ring-2 focus-visible:ring-ink/20"
          >
            VitaHarbor
          </a>
          <nav aria-label="Sections" className="flex items-center gap-4 text-body text-ink-medium sm:gap-5">
            <a href="/updates" className="inline-flex min-h-[44px] items-center rounded-md px-1 transition-colors hover:text-ink">Updates</a>
            <a href="#directory" className="inline-flex min-h-[44px] items-center rounded-md px-1 transition-colors hover:text-ink">Directory</a>
            <a href="/discovery" className="inline-flex min-h-[44px] items-center rounded-md px-1 transition-colors hover:text-ink">Community posts</a>
            <div className="hidden items-center gap-2 rounded-full border border-hairline bg-surface px-3 py-1 font-mono text-micro text-ink-muted sm:inline-flex">
              <span className="inline-flex items-center gap-1 text-stage-done font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-stage-done" />
                <span>{headerCounts.playable} playable</span>
              </span>
              <span className="text-hairline-strong">·</span>
              <span>{headerCounts.dev} in dev</span>
            </div>
          </nav>
        </div>
      </header>

      {/* Community Ticker */}
      <CommunityTicker
        recentUpdates={recentUpdates}
        tickerPaused={tickerPaused}
        onTogglePause={() => setTickerPaused((v) => !v)}
      />

      <main id="main-content" className="vh-boot">
        {/* Hero Copy */}
        <section className="relative mx-auto max-w-6xl px-6 pb-0 pt-7 text-center">
          <p className="flex items-center justify-center gap-2 text-micro font-medium uppercase tracking-[0.18em] text-ink-muted">
            Community port updates
          </p>
          <h1 className="mx-auto mt-4 max-w-4xl text-display font-semibold text-ink sm:text-[52px] sm:leading-[1.04] sm:tracking-[-0.04em]">
            The Vita port update tracker.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lead text-ink-medium">
            New ports, decompilations and wrappers, collected from the places where the scene
            actually posts them.
          </p>
        </section>

        <section aria-label="Your VitaHarbor" className="mx-auto mt-8 max-w-5xl px-6">
          <div className="grid gap-px overflow-hidden rounded-2xl border border-hairline-strong/30 bg-hairline-strong/20 sm:grid-cols-2">
            <div className="bg-surface p-4 sm:p-5">
              <p className="text-micro font-semibold uppercase tracking-[0.14em] text-ink-muted">Since last visit</p>
              <p className="mt-2 text-subtitle font-semibold text-ink">{unseenUpdates === 0 ? "Caught up" : `${unseenUpdates} new`}</p>
              <a href="/updates" className="mt-1 inline-flex min-h-[44px] items-center text-caption font-medium text-accent hover:underline">Open timeline</a>
            </div>
            <div className="bg-surface p-4 sm:p-5">
              <p className="text-micro font-semibold uppercase tracking-[0.14em] text-ink-muted">Watchlist</p>
              <p className="mt-2 text-subtitle font-semibold text-ink">{watchedProjects.length} saved</p>
              <a href="#watchlist" className="mt-1 inline-flex min-h-[44px] items-center text-caption font-medium text-accent hover:underline">View saved projects</a>
            </div>
          </div>
        </section>

        {watchedProjects.length > 0 && (
          <section id="watchlist" aria-labelledby="watchlist-heading" className="mx-auto mt-8 max-w-5xl px-6">
            <div className="rounded-2xl border border-hairline bg-surface p-5 sm:p-6">
              <div className="flex flex-wrap items-end justify-between gap-3 border-b border-hairline pb-3">
                <div>
                  <p className="text-micro font-semibold uppercase tracking-[0.14em] text-ink-muted">Saved in this browser</p>
                  <h2 id="watchlist-heading" className="mt-1 text-subtitle font-semibold text-ink">Your watchlist</h2>
                </div>
                <span className="text-caption text-ink-muted">{watchedProjects.length} {watchedProjects.length === 1 ? "project" : "projects"}</span>
              </div>
              <ul className="mt-2 divide-y divide-hairline">
                {watchedProjects.map((project) => (
                  <li key={project.slug} className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <a href={`/projects/${project.slug}/`} className="font-medium text-ink hover:text-accent">{project.display_name || project.game_title}</a>
                      <p className="mt-0.5 text-caption text-ink-muted">{prettyStage(project.current_stage)} · Updated {formatDay(project.last_activity_at) || "date not recorded"}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const next = readWatchlist().filter((slug) => slug !== project.slug);
                        if (writeWatchlist(next)) setWatchlistSlugs(next);
                      }}
                      className="inline-flex min-h-[44px] items-center rounded-md px-3 text-caption font-medium text-ink-muted underline underline-offset-4 hover:text-ink"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        <section id="latest-updates" aria-labelledby="latest-updates-heading" className="mx-auto mt-20 max-w-6xl px-6">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-hairline-strong/30 pb-4">
            <div>
              <p className="text-micro font-semibold uppercase tracking-[0.16em] text-ink-muted">What changed</p>
              <h2 id="latest-updates-heading" className="mt-2 text-title font-semibold tracking-tight text-ink">Latest updates</h2>
            </div>
            <p className="max-w-sm text-right text-caption text-ink-muted">Exact source dates are shown below; relative “days ago” labels stay out of the tracker.</p>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {recentUpdates.slice(0, 4).map((update) => {
              const sourceUrl = update.sources?.[0]?.canonical_url;
              const projectLabel = update.project_display_name || "Unassigned project";
              const verification = verificationMeta(update.verification_level);
              const projectLink = update.project_slug ? (
                <a href={"/projects/" + update.project_slug + "/"} className="inline-flex min-h-[44px] items-center rounded-md pr-2 text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20">{projectLabel}</a>
              ) : (
                <span className="inline-flex min-h-[44px] items-center pr-2 text-ink-muted" title="No project route is recorded">{projectLabel}</span>
              );
              return (
                <article key={update.id} className="rounded-2xl border border-hairline bg-surface p-5 transition-colors hover:border-hairline-strong/60">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-micro font-medium uppercase tracking-[0.12em] text-ink-muted">
                    {projectLink}
                    <time dateTime={new Date(update.event_at).toISOString()} title={"Exact source date: " + formatUtcDateTime(update.event_at)}>{formatUtcDateTime(update.event_at)}</time>
                  </div>
                  <h3 className="mt-3 text-subtitle font-semibold leading-snug text-ink">{update.title}</h3>
                  <p className="mt-2 line-clamp-3 text-body leading-relaxed text-ink-medium">{update.summary}</p>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-hairline pt-3 text-caption text-ink-muted">
                    <span title={verification.description}>{verification.label}</span>
                    {sourceUrl ? (
                      <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[44px] items-center gap-1 rounded-md px-2 font-medium text-ink transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20">
                        Source thread <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                      </a>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        </section>


        {/* 3D Console Showcase Stage */}
        <ConsoleStage
          selectedProject={selectedProject as any}
          projects={projects}
          selectedId={selectedId}
          onSelectProject={(p) => selectProject(p, false)}
          webgl={webgl}
          onRetryWebgl={detectWebgl}
          onCopyLink={copyEntryLink}
          copiedSlug={copiedSlug}
          consoleRef={consoleRef}
        />

        {/* Port Directory Table with Category & Stage Filters */}
        <DirectoryTable
          projects={projects}
          visible={visible}
          loading={loading}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          activeSort={activeSort}
          onSortChange={setActiveSort}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onResetFilters={resetFilters}
          searchRef={searchRef}
          selectedId={selectedId}
          expandedId={expandedId}
          onToggleEntry={toggleEntry}
          onSelectProject={selectProject}
          onCopyLink={copyEntryLink}
          copiedSlug={copiedSlug}
          directoryRef={directoryReveal}
        />

        {communityPostsToShow.length > 0 && (
          <section aria-labelledby="community-posts-heading" className="mx-auto mt-24 max-w-5xl px-6">
            <div className="rounded-2xl border border-hairline-strong/30 vh-glass p-6 shadow-lift">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <div className="max-w-2xl">
                  <h2 id="community-posts-heading" className="text-subtitle font-semibold text-ink">
                    Community posts to explore
                  </h2>
                  <p className="mt-1.5 text-body text-ink-medium">
                    Recent posts about possible Vita ports and updates. These are unverified leads, not confirmed project records.
                  </p>
                </div>
              </div>

              <ul className="mt-5 divide-y divide-hairline border-t border-hairline-strong/30">
                {communityPostsToShow.slice(0, 3).map((item) => (
                  <li key={item.url} className="flex flex-wrap items-center justify-between gap-3 py-3.5">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-body font-medium text-ink">{item.title}</p>
                        <span className="rounded-full border border-hairline bg-surface px-2 py-0.5 text-micro font-semibold uppercase text-ink-muted">
                          Unverified lead
                        </span>
                      </div>
                      <p className="mt-0.5 text-caption text-ink-muted">
                        r/{item.subreddit} · {item.published_at ? `Published ${formatUtcDateTime(item.published_at)}` : "Publication date unavailable"}
                      </p>
                      {(() => {
                        const related = relatedProjectForCommunityPost(item, projects);
                        return related ? (
                          <p className="mt-1 text-caption text-accent">
                            May relate to {splitTitle(related.game_title || related.display_name).name}.
                          </p>
                        ) : null;
                      })()}
                    </div>
                    {item.url ? (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-md px-2 text-caption font-medium text-ink-medium transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20"
                      >
                        Open original post
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    ) : null}
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex justify-end">
                <a href="/discovery" className="inline-flex min-h-[44px] items-center rounded-full border border-hairline px-4 text-caption font-medium text-accent hover:bg-sunken">Browse community posts</a>
              </div>
            </div>
          </section>
        )}

        {/* Stats Band: the summary reads better once the data has been seen. */}
        <LedgerStats
          items={[
            ["Indexed ports", projects.length, "Across three subreddits"],
            [
              "Playable stage",
              projects.filter((p) =>
                ["playable", "released", "completable"].includes(String(p.current_stage))
              ).length,
              "Reported in source"
            ],
            [
              "In development",
              projects.filter((p) =>
                ["in_game", "booting", "early_wip", "research"].includes(String(p.current_stage))
              ).length,
              "Active work"
            ],
            [
              "Released stage",
              projects.filter((p) => String(p.current_stage) === "released").length,
              "Release noted in source"
            ]
          ]}
        />

        {/* Methodology Section */}
        <MethodologySection methodRef={methodReveal} />
      </main>

      {/* Modern 3-Column Footer */}
      <footer className="border-t border-hairline bg-surface/40">
        <div className="mx-auto max-w-5xl px-6 py-14">
          <div className="grid gap-10 sm:grid-cols-3">
            <div>
              <p className="flex items-center gap-2 text-subtitle font-semibold tracking-tight text-ink">
                <span aria-hidden="true" className="h-2 w-2 rounded-full bg-accent" />
                VitaHarbor
              </p>
              <p className="mt-3 max-w-xs text-body text-ink-medium">
                A small tracker for PlayStation Vita ports, decompilations and wrappers, assembled from public engineering threads.
              </p>
            </div>
            <div>
              <h2 className="text-micro font-semibold uppercase text-ink-muted">Archive</h2>
              <ul className="mt-3 space-y-2 text-body">
                <li>
                  <a href="#directory" className="inline-block py-1.5 text-ink-medium transition-colors hover:text-accent">Directory</a>
                </li>
                <li>
                  <a href="#methodology" className="inline-block py-1.5 text-ink-medium transition-colors hover:text-accent">Methodology</a>
                </li>
                <li>
                  <a href="/discovery" className="inline-block py-1.5 text-ink-medium transition-colors hover:text-accent">
                    Community posts
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h2 className="text-micro font-semibold uppercase text-ink-muted">Feeds</h2>
              <ul className="mt-3 space-y-2 text-body">
                <li>
                  <a href="/api/feed.json" target="_blank" rel="noopener noreferrer" className="inline-block py-1.5 text-ink-medium transition-colors hover:text-accent">
                    JSON Feed 1.1
                  </a>
                </li>
                <li>
                  <a href="/api/rss.xml" target="_blank" rel="noopener noreferrer" className="inline-block py-1.5 text-ink-medium transition-colors hover:text-accent">
                    RSS 2.0
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <p className="mt-12 border-t border-hairline-strong/30 pt-6 text-caption text-ink-muted">
              Nothing here bypasses licensing or distributes copyrighted game data. Entries link to an original
              public thread when a project-specific source has been verified.
          </p>
        </div>
      </footer>
      {showScrollTop && (
        <button
          type="button"
          onClick={scrollToTop}
          aria-label="Scroll to top"
          title="Scroll to top"
          className="fixed bottom-5 right-5 z-50 inline-flex h-11 w-11 items-center justify-center rounded-full border border-hairline-strong/40 bg-surface/95 text-ink shadow-lift backdrop-blur transition-all hover:-translate-y-0.5 hover:bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30"
        >
          <ArrowUp className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only">Back to top</span>
        </button>
      )}
    </div>
  );
};
