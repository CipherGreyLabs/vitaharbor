import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { ProjectCard, type ProjectCardData } from "../components/projects/ProjectCard";
import { Search } from "lucide-react";

const STAGE_FILTERS: { value: string; label: string }[] = [
  { value: "", label: "All Stages" },
  { value: "playable", label: "Playable / Completable" },
  { value: "in_game", label: "In-Game" },
  { value: "booting", label: "Booting" },
  { value: "early_wip", label: "Early WIP" },
  { value: "released", label: "Released" }
];

const LIFECYCLE_FILTERS: { value: string; label: string }[] = [
  { value: "", label: "All Lifecycle" },
  { value: "active", label: "Active" },
  { value: "stalled", label: "Stalled" },
  { value: "archived", label: "Archived" }
];

export const ProjectsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchParam = searchParams.get("search") || "";
  const stageParam = searchParams.get("stage") || "";
  const lifecycleParam = searchParams.get("lifecycle") || "";

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#edf5ff]">PS Vita Port Projects</h1>
        <p className="text-xs text-[#9aaabd] mt-1">Directory of community porting initiatives, wrappers, and native rebuilds</p>
      </div>

      <div className="card-panel p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search projects or games..."
            value={searchParam}
            onChange={(e) => updateParam("search", e.target.value)}
            className="w-full bg-[#090c11] border border-[#202a38] rounded-md pl-9 pr-3 py-2 text-xs text-[#edf5ff] placeholder-[#68788c] focus:outline-none focus:border-[#249cf4]"
          />
          <Search className="w-4 h-4 text-[#68788c] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={stageParam}
            onChange={(e) => updateParam("stage", e.target.value)}
            className="bg-[#090c11] border border-[#202a38] text-xs text-[#edf5ff] rounded-md px-3 py-2 focus:outline-none focus:border-[#249cf4]"
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
            className="bg-[#090c11] border border-[#202a38] text-xs text-[#edf5ff] rounded-md px-3 py-2 focus:outline-none focus:border-[#249cf4]"
          >
            {LIFECYCLE_FILTERS.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card-panel p-5 h-44 animate-pulse bg-[#0f141b]" />
          ))}
        </div>
      ) : projects.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      ) : (
        <div className="card-panel p-12 text-center text-xs text-[#68788c]">
          No matching PS Vita port projects found for the selected criteria.
        </div>
      )}
    </div>
  );
};

