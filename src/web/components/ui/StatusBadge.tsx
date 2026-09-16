import React from "react";
import type { DevelopmentStage, ProjectLifecycle, VerificationLevel, ActivityLevel } from "../../../shared/types";

interface StatusBadgeProps {
  type: "stage" | "lifecycle" | "verification" | "activity";
  value: string;
  className?: string;
}

const STAGE_CONFIG: Record<DevelopmentStage, { label: string; text: string; bg: string; dot: string }> = {
  released: { label: "RELEASED", text: "text-emerald-300", bg: "bg-emerald-950/30 border-emerald-800/40", dot: "bg-emerald-400" },
  playable: { label: "PLAYABLE", text: "text-cyan-300", bg: "bg-cyan-950/30 border-cyan-800/40", dot: "bg-cyan-400" },
  completable: { label: "COMPLETABLE", text: "text-teal-300", bg: "bg-teal-950/30 border-teal-800/40", dot: "bg-teal-400" },
  in_game: { label: "IN-GAME", text: "text-amber-300", bg: "bg-amber-950/30 border-amber-800/40", dot: "bg-amber-400" },
  booting: { label: "BOOTING", text: "text-orange-300", bg: "bg-orange-950/30 border-orange-800/40", dot: "bg-orange-400" },
  early_wip: { label: "EARLY WIP", text: "text-indigo-300", bg: "bg-indigo-950/30 border-indigo-800/40", dot: "bg-indigo-400" },
  research: { label: "RESEARCH", text: "text-purple-300", bg: "bg-purple-950/30 border-purple-800/40", dot: "bg-purple-400" },
  announced: { label: "ANNOUNCED", text: "text-blue-300", bg: "bg-blue-950/30 border-blue-800/40", dot: "bg-blue-400" },
  unknown: { label: "UNKNOWN", text: "text-slate-400", bg: "bg-slate-900/40 border-slate-800/40", dot: "bg-slate-500" }
};

const LIFECYCLE_CONFIG: Record<ProjectLifecycle, { label: string; text: string; bg: string }> = {
  active: { label: "ACTIVE", text: "text-emerald-400", bg: "bg-emerald-950/20 border-emerald-900/30" },
  stalled: { label: "STALLED", text: "text-amber-400", bg: "bg-amber-950/20 border-amber-900/30" },
  abandoned: { label: "ABANDONED", text: "text-rose-400", bg: "bg-rose-950/20 border-rose-900/30" },
  archived: { label: "ARCHIVED", text: "text-slate-500", bg: "bg-slate-950/30 border-slate-800/30" },
  unknown: { label: "UNKNOWN", text: "text-slate-500", bg: "bg-slate-950/30 border-slate-800/30" }
};

const VERIFICATION_CONFIG: Record<VerificationLevel, { label: string; text: string; bg: string }> = {
  developer_direct: { label: "DEV DIRECT", text: "text-cyan-300", bg: "bg-cyan-950/40 border-cyan-700/50" },
  maintainer_confirmed: { label: "VERIFIED", text: "text-emerald-300", bg: "bg-emerald-950/40 border-emerald-700/50" },
  community_report: { label: "COMMUNITY", text: "text-amber-300", bg: "bg-amber-950/30 border-amber-800/40" },
  unverified: { label: "UNVERIFIED", text: "text-slate-400", bg: "bg-slate-900/30 border-slate-800/30" }
};

const ACTIVITY_CONFIG: Record<ActivityLevel, { label: string; text: string; bg: string }> = {
  hot: { label: "HOT", text: "text-cyan-400", bg: "bg-cyan-950/30 border-cyan-800/30" },
  active: { label: "ACTIVE", text: "text-emerald-400", bg: "bg-emerald-950/30 border-emerald-800/30" },
  quiet: { label: "QUIET", text: "text-slate-400", bg: "bg-slate-900/30 border-slate-800/30" },
  dormant: { label: "DORMANT", text: "text-zinc-400", bg: "bg-zinc-900/30 border-zinc-800/30" },
  stale: { label: "STALE", text: "text-zinc-500", bg: "bg-zinc-950/30 border-zinc-900/30" }
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ type, value, className = "" }) => {
  if (type === "stage") {
    const cfg = STAGE_CONFIG[value as DevelopmentStage] || STAGE_CONFIG.unknown;
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 border font-mono text-[10px] font-semibold tracking-wider ${cfg.bg} ${cfg.text} ${className}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
        {cfg.label}
      </span>
    );
  }

  if (type === "lifecycle") {
    const cfg = LIFECYCLE_CONFIG[value as ProjectLifecycle] || LIFECYCLE_CONFIG.unknown;
    return (
      <span
        className={`inline-flex items-center px-1.5 py-0.5 border font-mono text-[9px] font-medium tracking-wider ${cfg.bg} ${cfg.text} ${className}`}
      >
        {cfg.label}
      </span>
    );
  }

  if (type === "activity") {
    const cfg = ACTIVITY_CONFIG[value as ActivityLevel] || ACTIVITY_CONFIG.quiet;
    return (
      <span
        className={`inline-flex items-center px-1.5 py-0.5 border font-mono text-[9px] font-medium tracking-wider ${cfg.bg} ${cfg.text} ${className}`}
      >
        {cfg.label}
      </span>
    );
  }

  const cfg = VERIFICATION_CONFIG[value as VerificationLevel] || VERIFICATION_CONFIG.unverified;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 border font-mono text-[9px] font-semibold tracking-wider uppercase ${cfg.bg} ${cfg.text} ${className}`}
    >
      {cfg.label}
    </span>
  );
};

