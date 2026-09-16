import React from "react";
import { Link } from "react-router-dom";
import { StatusBadge } from "../ui/StatusBadge";
import { ProvenanceTag } from "../ui/ProvenanceTag";
import { formatDate } from "@/shared/utils";
import type { ObservationType, VerificationLevel } from "@/shared/types";

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
    <div className="terminal-card p-3.5 space-y-2">
      {/* Top Meta Line */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#242830] pb-1.5 text-[10px] font-mono">
        <div className="flex items-center gap-2">
          {update.project_slug ? (
            <Link
              to={`/projects/${update.project_slug}`}
              className="text-[#3ad2ff] hover:underline font-semibold tracking-wide uppercase"
            >
              {update.project_display_name || "Port Project"}
            </Link>
          ) : (
            <span className="text-[#3ad2ff] font-semibold tracking-wide uppercase">
              {update.project_display_name || "Port Project"}
            </span>
          )}
          <span className="text-[#343a42]">|</span>
          <StatusBadge type="verification" value={update.verification_level} />
        </div>
        <span className="text-[#7c848d]">{formatDate(update.event_at)}</span>
      </div>

      {/* Title & Summary */}
      <div>
        <h4 className="text-xs font-semibold text-[#f4f6f8] leading-snug">
          {update.title}
        </h4>
        <p className="text-xs text-[#a3acb5] leading-relaxed mt-1">
          {update.summary}
        </p>
      </div>

      {/* Footer attribution & provenance */}
      <div className="flex items-center justify-between pt-2 border-t border-[#242830] text-[10px] font-mono text-[#7c848d]">
        <span>
          {update.developer_display_name ? (
            <>
              Reported by: <span className="text-[#f4f6f8]">{update.developer_display_name}</span>
            </>
          ) : (
            "Community Discovery"
          )}
        </span>
        <ProvenanceTag
          url={primarySource?.canonical_url}
          verificationLevel={update.verification_level}
        />
      </div>
    </div>
  );
};

