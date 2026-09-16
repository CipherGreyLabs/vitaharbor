import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { ProjectCard, type ProjectCardData } from "../components/projects/ProjectCard";
import { deriveActivityLevel } from "@/shared/utils";
import { Search } from "lucide-react";

const STAGE_FILTERS = [
  { value: "", label: "All Stages" },
  { value: "released", label: "Released" },
  { value: "playable", label: "Playable" },
  { value: "completable", label: "Completable" },
  { value: "in_game", label: "In-Game" },
  { value: "booting", label: "Booting" },
  { value: "early_wip", label: "Early WIP" },
  { value: "research", label: "Research" },
  { value: "announced", label: "Announced" }
];

const LIFECYCLE_FILTERS = [
  { value: "", label: "All Lifecycle" },
  { value: "active", label: "Active" },
  { value: "stalled", label: "Stalled" },
  { value: "abandoned", label: "Abandoned" },
  { value: "archived", label: "Archived" }
];

const ACTIVITY_FILTERS = [
  { value: "", label: "All Activity" },
  { value: "hot", label: "Hot (<= 7 days)" },
  { value: "active", label: "Active (<= 30 days)" },
  { value: "quiet", label: "Quiet (<= 90 days)" },
  { value: "dormant", label: "Dormant (<= 180 days)" },
  { value: "stale", label: "Stale (> 180 days)" }
];

const SORT_OPTIONS = [
  { value: "recent", label: "Recently Updated" },
  { value: "alpha", label: "Alphabetical" },
  { value: "first_seen", label: "Newest Discovered" }
];

export const ProjectsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchParam = searchParams.get("search") || "";
  const stageParam = searchParams.get("stage") || "";
  const lifecycleParam = searchParams.get("lifecycle") || "";
  const activityParam = searchParams.get("activity") || "";
  const sortParam = searchParams.get("sort") || "recent";

  const [projects, setProjects] = useState<ProjectCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProjects() {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (searchParam) queryParams.set("search", searchParam);
        if (stageParam) queryParams.set("stage", stageParam);
        if (lifecycleParam) queryParams.set("lifecycle", lifecycleParam);
        queryParams.set("limit", "100");

        const res = await fetch(`/api/projects?${queryParams.toString()}`);
        if (res.ok) {
          const data = (await res.json()) as { projects: ProjectCardData[] };
          setProjects(data.projects || []);
        }
      } catch (e) {
        console.error("Failed to load projects", e);
      } finally {
        setLoading(false);
      }
    }
    loadProjects();
  }, [searchParam, stageParam, lifecycleParam]);

  const updateParam = (key: string, val: string) => {
    const updated = new URLSearchParams(searchParams);
    if (val) {
      updated.set(key, val);
    } else {
      updated.delete(key);
    }
    setSearchParams(updated);
  };

  // Filter by activity on frontend + sort
  const filteredProjects = useMemo(() => {
    let result = [...projects];

    if (activityParam) {
      result = result.filter((p) => {
        const level = deriveActivityLevel(new Date(p.last_activity_at));
        return level === activityParam;
      });
    }

    if (sortParam === "alpha") {
      result.sort((a, b) =>
        (a.game_title || a.display_name || a.slug).localeCompare(
          b.game_title || b.display_name || b.slug
        )
      );
    } else if (sortParam === "first_seen") {
      // Newest discovered first
      result.sort((a, b) => (b.id || 0) - (a.id || 0));
    } else {
      // Default: recently updated
      result.sort(
        (a, b) =>
          new Date(b.last_activity_at).getTime() - new Date(a.last_activity_at).getTime()
      );
    }

    return result;
  }, [projects, activityParam, sortParam]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-[#edf5ff]">
          Port Projects Directory
        </h1>
        <p className="text-xs text-[#9aaabd] mt-0.5">
          Structured index of active, playable, and released PlayStation Vita community ports.
        </p>
      </div>

      {/* Blueprint §72: Search & Multi-filter Controls */}
      <div className="card-panel p-4 space-y-3">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by game title, port name, or keyword..."
            value={searchParam}
            onChange={(e) => updateParam("search", e.target.value)}
            className="w-full bg-[#090c11] border border-[#202a38] rounded-md pl-9 pr-3 py-1.5 text-xs text-[#edf5ff] placeholder-[#68788c] focus:outline-none focus:border-[#249cf4]"
          />
          <Search className="w-4 h-4 text-[#68788c] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#202a38]/60">
          {/* Stage */}
          <select
            value={stageParam}
            onChange={(e) => updateParam("stage", e.target.value)}
            className="bg-[#090c11] border border-[#202a38] text-[11px] text-[#edf5ff] rounded px-2.5 py-1.5 focus:outline-none focus:border-[#249cf4]"
          >
            {STAGE_FILTERS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>

          {/* Lifecycle */}
          <select
            value={lifecycleParam}
            onChange={(e) => updateParam("lifecycle", e.target.value)}
            className="bg-[#090c11] border border-[#202a38] text-[11px] text-[#edf5ff] rounded px-2.5 py-1.5 focus:outline-none focus:border-[#249cf4]"
          >
            {LIFECYCLE_FILTERS.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>

          {/* Activity */}
          <select
            value={activityParam}
            onChange={(e) => updateParam("activity", e.target.value)}
            className="bg-[#090c11] border border-[#202a38] text-[11px] text-[#edf5ff] rounded px-2.5 py-1.5 focus:outline-none focus:border-[#249cf4]"
          >
            {ACTIVITY_FILTERS.map((a) => (
              <option key={a.value} value={a.value}>
                {a.label}
              </option>
            ))}
          </select>

          {/* Sort */}
          <div className="ml-auto flex items-center gap-1.5">
            <span className="text-[11px] text-[#68788c]">Sort:</span>
            <select
              value={sortParam}
              onChange={(e) => updateParam("sort", e.target.value)}
              className="bg-[#090c11] border border-[#202a38] text-[11px] text-[#edf5ff] rounded px-2.5 py-1.5 focus:outline-none focus:border-[#249cf4]"
            >
              {SORT_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card-panel p-4 h-36 animate-pulse bg-[#0f141b]" />
          ))}
        </div>
      ) : filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredProjects.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      ) : (
        <div className="card-panel p-12 text-center text-xs text-[#68788c]">
          No matching PS Vita port projects found for the selected filter combination.
        </div>
      )}
    </div>
  );
};

