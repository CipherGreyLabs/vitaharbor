import React from "react";
import type { DevelopmentStage, ProjectLifecycle, VerificationLevel } from "../../../shared/types";

interface StatusBadgeProps {
  type: "stage" | "lifecycle" | "verification";
  value: string;
  className?: string;
}

const STAGE_CONFIG: Record<DevelopmentStage, { label: string; bg: string; text: string; border: string }> = {
  announced: { label: "Announced", bg: "bg-blue-950/40", text: "text-blue-300", border: "border-blue-800/40" },
  research: { label: "Research", bg: "bg-purple-950/40", text: "text-purple-300", border: "border-purple-800/40" },
  early_wip: { label: "Early WIP", bg: "bg-indigo-950/40", text: "text-indigo-300", border: "border-indigo-800/40" },
  booting: { label: "Booting", bg: "bg-amber-950/40", text: "text-amber-300", border: "border-amber-800/40" },
  in_game: { label: "In-Game", bg: "bg-yellow-950/40", text: "text-yellow-300", border: "border-yellow-800/40" },
  playable: { label: "Playable", bg: "bg-emerald-950/40", text: "text-emerald-300", border: "border-emerald-800/40" },
  completable: { label: "Completable", bg: "bg-teal-950/40", text: "text-teal-300", border: "border-teal-800/40" },
  released: { label: "Released", bg: "bg-sky-950/40", text: "text-sky-300", border: "border-sky-800/40" },
  unknown: { label: "Unknown", bg: "bg-gray-900/50", text: "text-gray-400", border: "border-gray-800" }
};

const LIFECYCLE_CONFIG: Record<ProjectLifecycle, { label: string; bg: string; text: string; border: string }> = {
  active: { label: "Active", bg: "bg-emerald-950/30", text: "text-emerald-400", border: "border-emerald-800/30" },
  stalled: { label: "Stalled", bg: "bg-amber-950/30", text: "text-amber-400", border: "border-amber-800/30" },
  abandoned: { label: "Abandoned", bg: "bg-red-950/30", text: "text-red-400", border: "border-red-800/30" },
  archived: { label: "Archived", bg: "bg-gray-900/40", text: "text-gray-400", border: "border-gray-800" },
  unknown: { label: "Unknown", bg: "bg-gray-900/40", text: "text-gray-400", border: "border-gray-800" }
};

const VERIFICATION_CONFIG: Record<VerificationLevel, { label: string; bg: string; text: string; border: string }> = {
  developer_direct: { label: "Dev Direct", bg: "bg-sky-950/50", text: "text-sky-300", border: "border-sky-700/50" },
  maintainer_confirmed: { label: "Verified", bg: "bg-emerald-950/50", text: "text-emerald-300", border: "border-emerald-700/50" },
  community_report: { label: "Community", bg: "bg-amber-950/40", text: "text-amber-300", border: "border-amber-800/40" },
  unverified: { label: "Unverified", bg: "bg-gray-900/50", text: "text-gray-400", border: "border-gray-800" }
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ type, value, className = "" }) => {
  let config: { label: string; bg: string; text: string; border: string };

  if (type === "stage") {
    config = STAGE_CONFIG[value as DevelopmentStage] || STAGE_CONFIG.unknown;
  } else if (type === "lifecycle") {
    config = LIFECYCLE_CONFIG[value as ProjectLifecycle] || LIFECYCLE_CONFIG.unknown;
  } else {
    config = VERIFICATION_CONFIG[value as VerificationLevel] || VERIFICATION_CONFIG.unverified;
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border} ${className}`}
    >
      {config.label}
    </span>
  );
};

