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
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1a2332] pb-1.5 text-[10px] font-mono">
        <div className="flex items-center gap-2">
          {update.project_slug ? (
            <Link
              to={`/projects/${update.project_slug}`}
              className="text-[#00f0ff] hover:underline font-semibold tracking-wide uppercase"
            >
              {update.project_display_name || "Port Project"}
            </Link>
          ) : (
            <span className="text-[#00f0ff] font-semibold tracking-wide uppercase">
              {update.project_display_name || "Port Project"}
            </span>
          )}
          <span className="text-[#29374e]">|</span>
          <StatusBadge type="verification" value={update.verification_level} />
        </div>
        <span className="text-[#64748b]">{formatDate(update.event_at)}</span>
      </div>

      {/* Title & Summary */}
      <div>
        <h4 className="text-xs font-semibold text-[#f1f5f9] leading-snug">
          {update.title}
        </h4>
        <p className="text-xs text-[#94a3b8] leading-relaxed mt-1">
          {update.summary}
        </p>
      </div>

      {/* Footer attribution & provenance */}
      <div className="flex items-center justify-between pt-2 border-t border-[#1a2332] text-[10px] font-mono text-[#64748b]">
        <span>
          {update.developer_display_name ? (
            <>
              Reported by: <span className="text-[#f1f5f9]">{update.developer_display_name}</span>
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

