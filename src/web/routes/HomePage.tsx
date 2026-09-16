import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ProjectCard, type ProjectCardData } from "../components/projects/ProjectCard";
import { UpdateCard, type UpdateCardData } from "../components/updates/UpdateCard";
import { DeveloperCard, type DeveloperCardData } from "../components/developers/DeveloperCard";
import { Search, ArrowRight, Clock } from "lucide-react";

interface StatsData {
  total_projects: number;
  active_projects: number;
  playable_or_better: number;
  released_projects: number;
  total_developers: number;
  recent_updates_count: number;
}

export const HomePage: React.FC = () => {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [activeProjects, setActiveProjects] = useState<ProjectCardData[]>([]);
  const [releasedProjects, setReleasedProjects] = useState<ProjectCardData[]>([]);
  const [recentUpdates, setRecentUpdates] = useState<UpdateCardData[]>([]);
  const [activeDevs, setActiveDevs] = useState<DeveloperCardData[]>([]);
  const [newSinceLastVisit, setNewSinceLastVisit] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check "Since your last visit" (Blueprint §82)
    try {
      const lastVisit = localStorage.getItem("vitaharbor_last_visit");
      const currentTimestamp = Date.now();
      localStorage.setItem("vitaharbor_last_visit", String(currentTimestamp));

      if (lastVisit) {
        const lastVisitDate = new Date(Number(lastVisit));
        // Count updates newer than lastVisit
        fetch("/api/updates?limit=50")
          .then((r) => r.json() as Promise<{ updates: UpdateCardData[] }>)
          .then((data) => {
            if (data.updates) {
              const count = data.updates.filter(
                (u) => new Date(u.event_at).getTime() > lastVisitDate.getTime()
              ).length;
              if (count > 0) setNewSinceLastVisit(count);
            }
          })
          .catch(() => {});
      }
    } catch {
      // Graceful fallback if localStorage is unavailable
    }

    async function loadHomeData() {
      try {
        const [statsRes, activeProjectsRes, releasedProjectsRes, updatesRes, devsRes] = await Promise.all([
          fetch("/api/stats").then((r) => (r.ok ? (r.json() as Promise<StatsData>) : null)),
          fetch("/api/projects?lifecycle=active&limit=6").then((r) =>
            r.ok ? (r.json() as Promise<{ projects: ProjectCardData[] }>) : { projects: [] }
          ),
          fetch("/api/projects?stage=released&limit=3").then((r) =>
            r.ok ? (r.json() as Promise<{ projects: ProjectCardData[] }>) : { projects: [] }
          ),
          fetch("/api/updates?limit=3").then((r) =>
            r.ok ? (r.json() as Promise<{ updates: UpdateCardData[] }>) : { updates: [] }
          ),
          fetch("/api/developers?limit=4").then((r) =>
            r.ok ? (r.json() as Promise<{ developers: DeveloperCardData[] }>) : { developers: [] }
          )
        ]);

        if (statsRes) setStats(statsRes);
        if (activeProjectsRes?.projects) setActiveProjects(activeProjectsRes.projects);
        if (releasedProjectsRes?.projects) setReleasedProjects(releasedProjectsRes.projects);
        if (updatesRes?.updates) setRecentUpdates(updatesRes.updates);
        if (devsRes?.developers) setActiveDevs(devsRes.developers);
      } catch (e) {
        console.error("Failed to load home data", e);
      } finally {
        setLoading(false);
      }
    }
    loadHomeData();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/projects?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      {/* Blueprint §70 Header: Data first, branding second */}
      <section className="space-y-4 pt-2">
        <div>
          <h1 className="text-xl font-bold tracking-wider uppercase text-[#edf5ff]">
            Vita<span className="text-[#249cf4]">Harbor</span>
          </h1>
          <p className="text-sm text-[#9aaabd] mt-0.5">
            Track PS Vita game-port development with verified provenance.
          </p>
        </div>

        {/* Global Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative max-w-xl">
          <input
            type="text"
            placeholder="Search ports, original games, or developers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0f141b] border border-[#202a38] rounded-lg pl-10 pr-4 py-2 text-xs text-[#edf5ff] placeholder-[#68788c] focus:outline-none focus:border-[#249cf4] focus:ring-1 focus:ring-[#249cf4] transition-all"
          />
          <Search className="w-4 h-4 text-[#68788c] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </form>

        {/* Blueprint §71 Subtle Metrics Line */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#68788c]">
          <span>{stats?.active_projects ?? "—"} active projects</span>
          <span>·</span>
          <span>{stats?.playable_or_better ?? "—"} playable or better</span>
          <span>·</span>
          <span>{stats?.total_developers ?? "—"} developers tracked</span>

          {newSinceLastVisit !== null && newSinceLastVisit > 0 && (
            <>
              <span>·</span>
              <span className="inline-flex items-center gap-1 text-[#249cf4] font-medium">
                <Clock className="w-3 h-3" />
                <span>{newSinceLastVisit} new update{newSinceLastVisit > 1 ? "s" : ""} since your last visit</span>
              </span>
            </>
          )}
        </div>
      </section>

      {/* Blueprint §70: Latest development */}
      <section className="space-y-3">
        <div className="flex items-baseline justify-between border-b border-[#202a38] pb-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#edf5ff]">
            Latest development
          </h2>
          <Link
            to="/updates"
            className="text-[11px] font-medium text-[#249cf4] hover:text-[#4fb5ff] inline-flex items-center gap-1"
          >
            <span>All updates</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-2.5">
            {[1, 2].map((i) => (
              <div key={i} className="card-panel p-4 h-24 animate-pulse bg-[#0f141b]" />
            ))}
          </div>
        ) : recentUpdates.length > 0 ? (
          <div className="space-y-3">
            {recentUpdates.map((u) => (
              <UpdateCard key={u.id} update={u} />
            ))}
          </div>
        ) : (
          <div className="card-panel p-6 text-center text-xs text-[#68788c]">
            No development updates logged yet.
          </div>
        )}
      </section>

      {/* Blueprint §70: Active development */}
      <section className="space-y-3">
        <div className="flex items-baseline justify-between border-b border-[#202a38] pb-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#edf5ff]">
            Active development
          </h2>
          <Link
            to="/projects"
            className="text-[11px] font-medium text-[#249cf4] hover:text-[#4fb5ff] inline-flex items-center gap-1"
          >
            <span>All projects</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card-panel p-4 h-36 animate-pulse bg-[#0f141b]" />
            ))}
          </div>
        ) : activeProjects.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {activeProjects.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        ) : (
          <div className="card-panel p-6 text-center text-xs text-[#68788c]">
            No active projects found.
          </div>
        )}
      </section>

      {/* Blueprint §70: Recently active developers */}
      <section className="space-y-3">
        <div className="flex items-baseline justify-between border-b border-[#202a38] pb-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#edf5ff]">
            Recently active developers
          </h2>
          <Link
            to="/developers"
            className="text-[11px] font-medium text-[#249cf4] hover:text-[#4fb5ff] inline-flex items-center gap-1"
          >
            <span>All developers</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="card-panel p-4 h-28 animate-pulse bg-[#0f141b]" />
            ))}
          </div>
        ) : activeDevs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {activeDevs.map((d) => (
              <DeveloperCard key={d.id} developer={d} />
            ))}
          </div>
        ) : (
          <div className="card-panel p-6 text-center text-xs text-[#68788c]">
            No developers listed yet.
          </div>
        )}
      </section>

      {/* Blueprint §70: Recently released */}
      {releasedProjects.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-baseline justify-between border-b border-[#202a38] pb-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#edf5ff]">
              Recently released
            </h2>
            <Link
              to="/projects?stage=released"
              className="text-[11px] font-medium text-[#249cf4] hover:text-[#4fb5ff] inline-flex items-center gap-1"
            >
              <span>View all released</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {releasedProjects.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

