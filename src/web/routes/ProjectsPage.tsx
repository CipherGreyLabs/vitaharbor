import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { ProjectCard, type ProjectCardData } from "../components/projects/ProjectCard";
import { deriveActivityLevel } from "@/shared/utils";
import { apiGet } from "../lib/api";
import { Search } from "lucide-react";

const STAGE_FILTERS = [
  { value: "", label: "STAGE: ALL" },
  { value: "released", label: "RELEASED" },
  { value: "playable", label: "PLAYABLE" },
  { value: "completable", label: "COMPLETABLE" },
  { value: "in_game", label: "IN-GAME" },
  { value: "booting", label: "BOOTING" },
  { value: "early_wip", label: "EARLY WIP" },
  { value: "announced", label: "ANNOUNCED" }
];

const LIFECYCLE_FILTERS = [
  { value: "", label: "LIFECYCLE: ALL" },
  { value: "active", label: "ACTIVE" },
  { value: "stalled", label: "STALLED" },
  { value: "archived", label: "ARCHIVED" }
];

const ACTIVITY_FILTERS = [
  { value: "", label: "ACTIVITY: ALL" },
  { value: "hot", label: "HOT (<= 7D)" },
  { value: "active", label: "ACTIVE (<= 30D)" },
  { value: "quiet", label: "QUIET (<= 90D)" },
  { value: "dormant", label: "DORMANT" }
];

const SORT_OPTIONS = [
  { value: "recent", label: "SORT: RECENT ACTIVITY" },
  { value: "alpha", label: "SORT: A-Z" },
  { value: "first_seen", label: "SORT: NEWEST DISCOVERY" }
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

        const data = await apiGet<{ projects: ProjectCardData[] }>(
          `/api/projects?${queryParams.toString()}`,
          "projects"
        );
        setProjects(data.projects || []);
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
      result.sort((a, b) => (b.id || 0) - (a.id || 0));
    } else {
      result.sort(
        (a, b) =>
          new Date(b.last_activity_at).getTime() - new Date(a.last_activity_at).getTime()
      );
    }

    return result;
  }, [projects, activityParam, sortParam]);

  return (
    <div className="space-y-6">
      {/* Title strip */}
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[#242830] pb-2">
        <div>
          <h1 className="font-mono text-sm font-bold uppercase tracking-wider text-[#f4f6f8]">
            PS VITA PORT REGISTRY
          </h1>
          <p className="text-[11px] font-mono text-[#7c848d]">
            Showing {filteredProjects.length} port projects from r/VitaPiracy and r/vitahacks
          </p>
        </div>
      </div>

      {/* Hardware Filter Bar */}
      <div className="terminal-panel p-3 space-y-2.5">
        <div className="relative">
          <input
            type="text"
            placeholder="Search port name, original platform, developer, engine, or alias..."
            value={searchParam}
            onChange={(e) => updateParam("search", e.target.value)}
            className="w-full bg-[#08090a] border border-[#242830] rounded-[2px] pl-8 pr-3 py-1.5 text-xs font-mono text-[#f4f6f8] placeholder-[#7c848d] focus:outline-none focus:border-[#3ad2ff]"
          />
          <Search className="w-3.5 h-3.5 text-[#7c848d] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[10px] font-mono">
          <select
            value={stageParam}
            onChange={(e) => updateParam("stage", e.target.value)}
            className="bg-[#08090a] border border-[#242830] text-[#a3acb5] rounded-[2px] px-2 py-1 focus:outline-none focus:border-[#3ad2ff]"
          >
            {STAGE_FILTERS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>

          <select
            value={lifecycleParam}
            onChange={(e) => updateParam("lifecycle", e.target.value)}
            className="bg-[#08090a] border border-[#242830] text-[#a3acb5] rounded-[2px] px-2 py-1 focus:outline-none focus:border-[#3ad2ff]"
          >
            {LIFECYCLE_FILTERS.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>

          <select
            value={activityParam}
            onChange={(e) => updateParam("activity", e.target.value)}
            className="bg-[#08090a] border border-[#242830] text-[#a3acb5] rounded-[2px] px-2 py-1 focus:outline-none focus:border-[#3ad2ff]"
          >
            {ACTIVITY_FILTERS.map((a) => (
              <option key={a.value} value={a.value}>
                {a.label}
              </option>
            ))}
          </select>

          <div className="ml-auto">
            <select
              value={sortParam}
              onChange={(e) => updateParam("sort", e.target.value)}
              className="bg-[#08090a] border border-[#242830] text-[#3ad2ff] font-bold rounded-[2px] px-2 py-1 focus:outline-none focus:border-[#3ad2ff]"
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

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="terminal-card p-4 h-32 animate-pulse bg-[#15181b]" />
          ))}
        </div>
      ) : filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredProjects.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      ) : (
        <div className="terminal-panel p-12 text-center font-mono text-xs text-[#7c848d]">
          NO PORT PROJECTS MATCH CURRENT CRITERIA
        </div>
      )}
    </div>
  );
};
