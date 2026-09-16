import React, { useState, useEffect } from "react";
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

  if (loading) {
    return <div className="card-panel p-12 text-center text-xs text-[#68788c] animate-pulse">Loading developer profile...</div>;
  }

  if (!developer) {
    return (
      <div className="card-panel p-12 text-center space-y-4">
        <h2 className="text-lg font-bold text-[#edf5ff]">Developer Not Found</h2>
        <p className="text-xs text-[#9aaabd]">The requested developer profile does not exist.</p>
        <Link to="/developers" className="btn-secondary text-xs">
          Return to developers
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Link to="/developers" className="inline-flex items-center gap-1 text-xs text-[#9aaabd] hover:text-[#edf5ff]">
        <ChevronLeft className="w-4 h-4" />
        <span>Back to developers directory</span>
      </Link>

      <div className="card-panel p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#151b24] border border-[#202a38] flex items-center justify-center text-[#249cf4]">
            <User className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#edf5ff]">{developer.display_name}</h1>
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

        <p className="text-xs sm:text-sm text-[#9aaabd] leading-relaxed pt-2">
          {developer.description || "Active community developer in the PlayStation Vita homebrew ecosystem."}
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[#edf5ff]">Associated Port Projects</h2>
        {developer.projects && developer.projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {developer.projects.map((p) => (
              <Link
                key={p.id}
                to={`/projects/${p.slug}`}
                className="card-panel-hover p-5 space-y-2 block"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-[#edf5ff]">{p.display_name}</h3>
                  <StatusBadge type="stage" value={p.current_stage} />
                </div>
                <p className="text-xs text-[#9aaabd] line-clamp-2">{p.summary}</p>
                <div className="text-[11px] text-[#249cf4] pt-2">Role: {p.role}</div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="card-panel p-8 text-center text-xs text-[#68788c]">
            No projects linked directly to this developer.
          </div>
        )}
      </div>
    </div>
  );
};

