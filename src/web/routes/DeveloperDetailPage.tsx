import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { StatusBadge } from "../components/ui/StatusBadge";
import { User, ChevronLeft, ExternalLink } from "lucide-react";

interface DeveloperDetailData {
  id: number;
  slug: string;
  display_name: string;
  description?: string | null;
  is_known_developer: boolean;
  identities?: { provider: string; username: string; profile_url?: string }[];
  projects?: {
    id: number;
    slug: string;
    display_name: string;
    current_stage: string;
    lifecycle: string;
    summary: string;
    role: string;
  }[];
}

export const DeveloperDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [developer, setDeveloper] = useState<DeveloperDetailData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDeveloper() {
      if (!slug) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/developers/${slug}`);
        if (res.ok) {
          const data = (await res.json()) as { developer: DeveloperDetailData };
          setDeveloper(data.developer);
        }
      } catch (e) {
        console.error("Failed to load developer detail", e);
      } finally {
        setLoading(false);
      }
    }
    loadDeveloper();
  }, [slug]);

  const groupedProjects = useMemo(() => {
    const list = developer?.projects || [];
    return {
      active: list.filter((p) => p.lifecycle === "active" && p.current_stage !== "released"),
      released: list.filter((p) => p.current_stage === "released"),
      archived: list.filter((p) => p.lifecycle === "stalled" || p.lifecycle === "archived" || p.lifecycle === "abandoned")
    };
  }, [developer]);

  if (loading) {
    return (
      <div className="card-panel p-12 text-center text-xs text-[#68788c] animate-pulse">
        Loading developer profile...
      </div>
    );
  }

  if (!developer) {
    return (
      <div className="card-panel p-12 text-center space-y-4">
        <h2 className="text-base font-bold text-[#edf5ff]">Developer Not Found</h2>
        <p className="text-xs text-[#9aaabd]">The requested developer profile does not exist.</p>
        <Link to="/developers" className="btn-secondary text-xs">
          Return to developers
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Link
        to="/developers"
        className="inline-flex items-center gap-1 text-xs text-[#9aaabd] hover:text-[#edf5ff] transition-colors"
      >
        <ChevronLeft className="w-3.5 h-3.5" />
        <span>Back to developers directory</span>
      </Link>

      {/* Blueprint §79: Header */}
      <div className="card-panel p-6 space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#151b24] border border-[#202a38] flex items-center justify-center text-[#249cf4]">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#edf5ff]">{developer.display_name}</h1>
            {developer.identities && developer.identities.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mt-1">
                {developer.identities.map((id) => (
                  <a
                    key={id.username}
                    href={`https://reddit.com/user/${id.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-[#249cf4] hover:text-[#4fb5ff]"
                  >
                    <span>u/{id.username}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        <p className="text-xs text-[#9aaabd] leading-relaxed pt-1">
          {developer.description || "Active community developer in the PlayStation Vita homebrew ecosystem."}
        </p>
      </div>

      {/* Blueprint §79 Project Groups: Active, Released, Stalled/Archived */}
      <div className="space-y-6">
        {groupedProjects.active.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#edf5ff]">
              Active Development ({groupedProjects.active.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {groupedProjects.active.map((p) => (
                <Link
                  key={p.id}
                  to={`/projects/${p.slug}`}
                  className="card-panel-hover p-4 space-y-2 block"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-[#edf5ff]">{p.display_name}</h3>
                    <StatusBadge type="stage" value={p.current_stage} />
                  </div>
                  <p className="text-[11px] text-[#9aaabd] line-clamp-2">{p.summary}</p>
                  <div className="text-[10px] text-[#68788c]">Role: {p.role}</div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {groupedProjects.released.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#edf5ff]">
              Completed / Released Ports ({groupedProjects.released.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {groupedProjects.released.map((p) => (
                <Link
                  key={p.id}
                  to={`/projects/${p.slug}`}
                  className="card-panel-hover p-4 space-y-2 block"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-[#edf5ff]">{p.display_name}</h3>
                    <StatusBadge type="stage" value="released" />
                  </div>
                  <p className="text-[11px] text-[#9aaabd] line-clamp-2">{p.summary}</p>
                  <div className="text-[10px] text-[#68788c]">Role: {p.role}</div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {groupedProjects.archived.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#edf5ff]">
              Stalled / Archived ({groupedProjects.archived.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {groupedProjects.archived.map((p) => (
                <Link
                  key={p.id}
                  to={`/projects/${p.slug}`}
                  className="card-panel-hover p-4 space-y-2 block opacity-75"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-[#edf5ff]">{p.display_name}</h3>
                    <StatusBadge type="lifecycle" value={p.lifecycle} />
                  </div>
                  <p className="text-[11px] text-[#9aaabd] line-clamp-2">{p.summary}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {developer.projects?.length === 0 && (
          <div className="card-panel p-6 text-center text-xs text-[#68788c]">
            No projects currently associated with this developer.
          </div>
        )}
      </div>
    </div>
  );
};

