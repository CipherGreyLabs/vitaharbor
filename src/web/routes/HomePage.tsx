import React, { useEffect, useMemo, useRef, useState } from "react";
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
  derivePlatformCategory,
  STAGE_RANK,
  formatDay,
  relativeTime
} from "../components/ledger/types";
import { ExternalLink } from "lucide-react";

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
  useDocumentMeta({
    title: "VitaHarbor — PlayStation Vita Port Archive",
    description:
      "An independent archive of PlayStation Vita engine decompilations, ARM wrappers and homebrew builds, sourced from community engineering boards."
  });

  const [projects, setProjects] = useState<LedgerProject[]>(() => FALLBACK_PROJECTS as any[]);
  const [recentUpdates, setRecentUpdates] = useState<any[]>(() => FALLBACK_UPDATES as any[]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeSort, setActiveSort] = useState("recent");
  const [loading, setLoading] = useState(false);
  const [copiedSlug, setCopiedSlug] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const [tickerPaused, setTickerPaused] = useState(false);
  const [discovered, setDiscovered] = useState<any[]>([]);
  const [scannedAt, setScannedAt] = useState("");

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
          apiGet<{ updates: any[] }>('/api/updates?limit=8', 'updates').catch(() => null)
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

      try {
        const res = await fetch('/data/discovered.json', { headers: { accept: 'application/json' } });
        if (!res.ok) return;
        const text = await res.text();
        if (!text.startsWith('{') && !text.startsWith('[')) return;
        const body = JSON.parse(text);
        if (cancelled) return;
        if (body && Array.isArray(body.items)) setDiscovered(body.items);
        if (body && typeof body.generated_at === 'string') setScannedAt(body.generated_at);
      } catch {
        // Scanner has not run yet
      }
    }

    refresh();
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

  // Scanner output is a candidate list. Once a thread is curated into the ledger it must
  // stop appearing as "pending review", otherwise the same port shows up twice.
  const normaliseUrl = (value: unknown) =>
    String(value || "").trim().replace(/\/+$/, "").toLowerCase();

  const pendingDiscovered = useMemo(() => {
    const ledgerUrls = new Set(
      projects.map((p) => normaliseUrl((p as any).reddit_url)).filter(Boolean)
    );
    return discovered.filter((item) => {
      const url = normaliseUrl(item?.url);
      if (!url) return false;
      return !ledgerUrls.has(url);
    });
  }, [discovered, projects]);

  const visible = useMemo(() => {
    let list = [...projects];

    if (activeFilter === "wip") {
      list = list.filter((p) => ["in_game", "booting", "early_wip", "research"].includes(String(p.current_stage)));
    } else if (activeFilter === "playable") {
      list = list.filter((p) => ["playable", "released", "completable"].includes(String(p.current_stage)));
    } else if (activeFilter === "booting") {
      list = list.filter((p) => ["booting", "early_wip", "research"].includes(String(p.current_stage)));
    }

    if (activeCategory !== "all") {
      list = list.filter((p) => derivePlatformCategory(p) === activeCategory);
    }

    const term = searchTerm.trim().toLowerCase();
    if (term) {
      list = list.filter(
        (p) =>
          [p.game_title, p.display_name, p.summary, p.original_platform, p.slug]
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
    if (scroll) consoleRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const toggleEntry = (project: LedgerProject) => {
    const next = expandedId === project.id ? null : project.id;
    setExpandedId(next);
    setSelectedId(project.id);
    if (next) {
      history.replaceState(null, "", "#p=" + project.slug);
    } else if (window.location.hash.startsWith("#p=")) {
      history.replaceState(null, "", window.location.pathname);
    }
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
            className="rounded-md text-lead font-semibold tracking-tight text-ink outline-none focus-visible:ring-2 focus-visible:ring-ink/20"
          >
            VitaHarbor
          </a>
          <nav aria-label="Sections" className="flex items-center gap-4 text-body text-ink-medium sm:gap-5">
            <a href="#directory" className="inline-flex min-h-[44px] items-center rounded-md px-1 transition-colors hover:text-ink">Directory</a>
            <a href="#methodology" className="inline-flex min-h-[44px] items-center rounded-md px-1 transition-colors hover:text-ink">Methodology</a>
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
        <section className="relative mx-auto max-w-6xl px-6 pb-0 pt-10 text-center">
          <p className="flex items-center justify-center gap-2 text-micro font-medium uppercase tracking-[0.18em] text-ink-muted">
            Independent hardware archive
          </p>
          <h1 className="mx-auto mt-5 max-w-4xl text-display font-semibold text-ink sm:text-[60px] sm:leading-[1.03] sm:tracking-[-0.04em]">
            PlayStation Vita port archive.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lead text-ink-medium">
            Engine decompilations, ARM wrappers and homebrew builds documented at the moment
            they surface on community engineering boards.
          </p>
        </section>

        {/* 3D Console Showcase Stage */}
        <ConsoleStage
          selectedProject={selectedProject as any}
          projects={projects}
          selectedId={selectedId}
          onSelectProject={(p) => selectProject(p, false)}
          webgl={webgl}
          onCopyLink={copyEntryLink}
          copiedSlug={copiedSlug}
          consoleRef={consoleRef}
        />

        {/* Stats Band */}
        <LedgerStats
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
          searchRef={searchRef}
          selectedId={selectedId}
          expandedId={expandedId}
          onToggleEntry={toggleEntry}
          onSelectProject={selectProject}
          onCopyLink={copyEntryLink}
          copiedSlug={copiedSlug}
          directoryRef={directoryReveal}
        />

        {/* Unverified Detected Threads Band */}
        {pendingDiscovered.length > 0 && (
          <section aria-labelledby="detected-heading" className="mx-auto mt-24 max-w-5xl px-6">
            <div className="rounded-2xl border border-hairline-strong/30 vh-glass p-6 shadow-lift">
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

              <ul className="mt-5 divide-y divide-hairline border-t border-hairline-strong/30">
                {pendingDiscovered.map((item) => (
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
                An independent archive of PlayStation Vita ports, assembled from public engineering threads.
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
                  <a href="/data/discovered.json" target="_blank" rel="noopener noreferrer" className="inline-block py-1.5 text-ink-medium transition-colors hover:text-accent">
                    Discovery log
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
            Nothing here bypasses licensing or distributes copyrighted game data. Every entry links to its
            original public thread.
          </p>
        </div>
      </footer>
    </div>
  );
};
