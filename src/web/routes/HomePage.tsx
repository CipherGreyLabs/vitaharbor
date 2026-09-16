import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ProjectCard, type ProjectCardData } from "../components/projects/ProjectCard";
import { UpdateCard, type UpdateCardData } from "../components/updates/UpdateCard";
import { Gamepad2, Activity, ArrowRight } from "lucide-react";

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
  const [featuredProjects, setFeaturedProjects] = useState<ProjectCardData[]>([]);
  const [recentUpdates, setRecentUpdates] = useState<UpdateCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [statsRes, projectsRes, updatesRes] = await Promise.all([
          fetch("/api/stats").then((r) => (r.ok ? (r.json() as Promise<StatsData>) : null)),
          fetch("/api/projects?limit=6").then((r) => (r.ok ? (r.json() as Promise<{ projects: ProjectCardData[] }>) : { projects: [] })),
          fetch("/api/updates?limit=4").then((r) => (r.ok ? (r.json() as Promise<{ updates: UpdateCardData[] }>) : { updates: [] }))
        ]);

        if (statsRes) setStats(statsRes);
        if (projectsRes && "projects" in projectsRes) setFeaturedProjects(projectsRes.projects);
        if (updatesRes && "updates" in updatesRes) setRecentUpdates(updatesRes.updates);
      } catch (e) {
        console.error("Failed to load home data", e);
      } finally {
        setLoading(false);
      }
    }
    loadHomeData();
  }, []);

  return (
    <div className="space-y-12">
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#151b24] to-[#0f141b] border border-[#202a38] p-8 sm:p-12">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#249cf4]/10 border border-[#249cf4]/30 text-xs font-medium text-[#249cf4]">
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            <span>Active PS Vita Port Development Intelligence</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#edf5ff] leading-tight">
            Track PlayStation Vita ports from first boot to final release.
          </h1>

          <p className="text-sm sm:text-base text-[#9aaabd] leading-relaxed max-w-2xl">
            VitaPortWatch continuously tracks porting milestones, shader translation, and playability progress with verifiable source provenance.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link to="/projects" className="btn-accent text-sm">
              <Gamepad2 className="w-4 h-4" />
              <span>Explore Active Ports</span>
            </Link>
            <Link to="/updates" className="btn-secondary text-sm">
              <span>View Latest Events</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-8 border-t border-[#202a38]">
          <div className="card-panel p-4 bg-[#090c11]/80">
            <p className="text-xs text-[#68788c]">Total Projects</p>
            <p className="text-2xl font-bold text-[#edf5ff] mt-1">{stats?.total_projects ?? "—"}</p>
          </div>
          <div className="card-panel p-4 bg-[#090c11]/80">
            <p className="text-xs text-[#68788c]">Active In Dev</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">{stats?.active_projects ?? "—"}</p>
          </div>
          <div className="card-panel p-4 bg-[#090c11]/80">
            <p className="text-xs text-[#68788c]">Playable / Released</p>
            <p className="text-2xl font-bold text-[#249cf4] mt-1">{stats?.playable_or_better ?? "—"}</p>
          </div>
          <div className="card-panel p-4 bg-[#090c11]/80">
            <p className="text-xs text-[#68788c]">Tracked Devs</p>
            <p className="text-2xl font-bold text-[#edf5ff] mt-1">{stats?.total_developers ?? "—"}</p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#edf5ff]">Recently Active Projects</h2>
            <p className="text-xs text-[#68788c]">Ports with latest verified milestone progression</p>
          </div>
          <Link to="/projects" className="text-xs font-medium text-[#249cf4] hover:text-[#4fb5ff] flex items-center gap-1">
            <span>All projects</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card-panel p-5 h-44 animate-pulse bg-[#0f141b]" />
            ))}
          </div>
        ) : featuredProjects.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredProjects.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        ) : (
          <div className="card-panel p-8 text-center text-xs text-[#68788c]">
            No projects ingested yet. Apply seed data or run discovery backfill.
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#edf5ff]">Recent Verified Updates</h2>
            <p className="text-xs text-[#68788c]">Chronological development statements and milestone evidence</p>
          </div>
          <Link to="/updates" className="text-xs font-medium text-[#249cf4] hover:text-[#4fb5ff] flex items-center gap-1">
            <span>Full feed</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="card-panel p-5 h-28 animate-pulse bg-[#0f141b]" />
            ))}
          </div>
        ) : recentUpdates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentUpdates.map((u) => (
              <UpdateCard key={u.id} update={u} />
            ))}
          </div>
        ) : (
          <div className="card-panel p-8 text-center text-xs text-[#68788c]">
            No development updates recorded yet.
          </div>
        )}
      </section>
    </div>
  );
};

