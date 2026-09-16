import React from "react";
import { Link } from "react-router-dom";
import { User, Code2 } from "lucide-react";

export interface DeveloperCardData {
  id: number;
  slug: string;
  display_name: string;
  description?: string | null;
  is_known_developer: boolean;
  identities?: { provider: string; username: string }[];
  projects?: { id: number; slug: string; display_name: string; current_stage: string }[];
}

export const DeveloperCard: React.FC<{ developer: DeveloperCardData }> = ({ developer }) => {
  return (
    <Link
      to={`/developers/${developer.slug}`}
      className="card-panel-hover p-5 flex flex-col justify-between group block"
    >
      <div>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-[#151b24] border border-[#202a38] flex items-center justify-center text-[#249cf4] group-hover:border-[#249cf4]/50 transition-colors">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#edf5ff] group-hover:text-[#249cf4] transition-colors">
              {developer.display_name}
            </h3>
            {developer.identities && developer.identities.length > 0 && (
              <p className="text-[11px] text-[#68788c]">
                u/{developer.identities[0].username}
              </p>
            )}
          </div>
        </div>

        <p className="text-xs text-[#9aaabd] line-clamp-2 leading-relaxed mb-4">
          {developer.description || "Active PlayStation Vita community homebrew developer."}
        </p>
      </div>

      <div className="pt-3 border-t border-[#202a38] flex items-center justify-between text-xs text-[#68788c]">
        <div className="flex items-center gap-1">
          <Code2 className="w-3.5 h-3.5 text-[#249cf4]" />
          <span>{developer.projects?.length || 0} Port Projects</span>
        </div>
        <span className="text-[#249cf4] text-[11px] group-hover:translate-x-0.5 transition-transform">
          View Profile →
        </span>
      </div>
    </Link>
  );
};

