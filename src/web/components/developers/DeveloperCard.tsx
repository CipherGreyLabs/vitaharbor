import React from "react";
import { Link } from "react-router-dom";

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
      className="terminal-card p-3.5 flex flex-col justify-between group block text-left"
    >
      <div className="space-y-1.5">
        <div className="flex items-center justify-between border-b border-[#242830] pb-2">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3ad2ff]" />
            <h3 className="text-xs font-semibold text-[#f4f6f8] group-hover:text-[#3ad2ff] transition-colors font-mono">
              {developer.display_name}
            </h3>
          </div>
          {developer.identities && developer.identities.length > 0 && (
            <span className="font-mono text-[9px] text-[#7c848d]">
              u/{developer.identities[0].username}
            </span>
          )}
        </div>

        <p className="text-[11px] text-[#a3acb5] line-clamp-2 leading-relaxed">
          {developer.description || "Active community homebrew developer for PlayStation Vita."}
        </p>
      </div>

      <div className="mt-3 pt-2 border-t border-[#242830] flex items-center justify-between font-mono text-[10px] text-[#7c848d]">
        <span className="text-[#3ad2ff] font-medium">
          {developer.projects?.length || 1} Port{developer.projects?.length === 1 ? "" : "s"}
        </span>
        <span className="group-hover:text-[#f4f6f8] transition-colors">Inspect →</span>
      </div>
    </Link>
  );
};
