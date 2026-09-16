import React from "react";
import { Link } from "react-router-dom";
import { StatusBadge } from "../ui/StatusBadge";
import { ProvenanceTag } from "../ui/ProvenanceTag";
import { formatDate } from "../../../shared/utils";
import type { ObservationType, VerificationLevel } from "../../../shared/types";
import { Calendar, Gamepad2 } from "lucide-react";

export interface UpdateCardData {
  id: string;
  port_project_id: number;
  project_slug?: string;
  project_display_name?: string;
  developer_display_name?: string | null;
  developer_slug?: string | null;
  event_type: ObservationType;
  title: string;
  summary: string;
  event_at: string | Date;
  verification_level: VerificationLevel;
  sources?: { source_item_id: string; relationship: string; canonical_url?: string }[];
}

export const UpdateCard: React.FC<{ update: UpdateCardData }> = ({ update }) => {
  const primarySource = update.sources && update.sources.length > 0 ? update.sources[0] : null;

  return (
    <div className="card-panel p-5">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          {update.project_slug && (
            <Link
              to={`/projects/${update.project_slug}`}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#249cf4] hover:text-[#4fb5ff]"
            >
              <Gamepad2 className="w-3.5 h-3.5" />
              <span>{update.project_display_name || "Project"}</span>
            </Link>
          )}
          <span className="text-[#68788c] text-xs">•</span>
          <StatusBadge type="verification" value={update.verification_level} />
        </div>
        <div className="flex items-center gap-1 text-xs text-[#68788c]">
          <Calendar className="w-3 h-3" />
          <span>{formatDate(update.event_at)}</span>
        </div>
      </div>

      <h4 className="text-sm font-semibold text-[#edf5ff] mb-1.5">{update.title}</h4>
      <p className="text-xs text-[#9aaabd] leading-relaxed mb-4">{update.summary}</p>

      <div className="flex items-center justify-between pt-3 border-t border-[#202a38]">
        <div>
          {update.developer_display_name && (
            <span className="text-xs text-[#68788c]">
              Reported by: <span className="text-[#edf5ff]">{update.developer_display_name}</span>
            </span>
          )}
        </div>
        <ProvenanceTag
          url={primarySource?.canonical_url}
          verificationLevel={update.verification_level}
        />
      </div>
    </div>
  );
};

