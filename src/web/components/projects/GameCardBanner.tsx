import React from "react";
import { LedgerProject } from "../../components/ledger/types";

// Distinct, authentic PlayStation game cover palettes based on genre/platform
function getGamePalette(slug: string) {
  if (slug.includes("halo")) return {
    gradient: "from-emerald-950/80 via-slate-950 to-zinc-950",
    accent: "#10b981",
    border: "border-emerald-500/20",
    glow: "rgba(16, 185, 129, 0.15)"
  };
  if (slug.includes("racing") || slug.includes("nfs") || slug.includes("test-drive")) return {
    gradient: "from-red-950/80 via-zinc-950 to-neutral-950",
    accent: "#ef4444",
    border: "border-red-500/20",
    glow: "rgba(239, 68, 68, 0.15)"
  };
  if (slug.includes("zelda") || slug.includes("portal")) return {
    gradient: "from-blue-950/80 via-indigo-950 to-zinc-950",
    accent: "#3b82f6",
    border: "border-blue-500/20",
    glow: "rgba(59, 130, 246, 0.15)"
  };
  if (slug.includes("hollow-knight") || slug.includes("renegade")) return {
    gradient: "from-indigo-950/80 via-slate-950 to-zinc-950",
    accent: "#818cf8",
    border: "border-indigo-500/20",
    glow: "rgba(129, 140, 248, 0.15)"
  };
  if (slug.includes("resident-evil") || slug.includes("zombies") || slug.includes("fallout") || slug.includes("diablo")) return {
    gradient: "from-amber-950/80 via-neutral-950 to-zinc-950",
    accent: "#f59e0b",
    border: "border-amber-500/20",
    glow: "rgba(245, 158, 11, 0.15)"
  };
  if (slug.includes("smash") || slug.includes("diddy") || slug.includes("celeste")) return {
    gradient: "from-purple-950/80 via-slate-950 to-zinc-950",
    accent: "#a855f7",
    border: "border-purple-500/20",
    glow: "rgba(168, 85, 247, 0.15)"
  };
  return {
    gradient: "from-slate-900/90 via-zinc-950 to-black",
    accent: "#60a5fa",
    border: "border-white/10",
    glow: "rgba(96, 165, 250, 0.1)"
  };
}

export const GameCardBanner: React.FC<{
  project: LedgerProject;
  titleName: string;
  engineLabel?: string;
}> = ({ project, titleName, engineLabel }) => {
  const palette = getGamePalette(project.slug);

  return (
    <div className={`relative flex h-full w-full flex-col justify-between overflow-hidden bg-gradient-to-br ${palette.gradient} p-4 text-left select-none`}>
      {/* Ambient background glow & PS glyphs watermark */}
      <div
        className="pointer-events-none absolute -right-6 -top-6 h-36 w-36 rounded-full blur-2xl transition-all duration-300 group-hover:scale-125"
        style={{ background: palette.glow }}
        aria-hidden="true"
      />
      
      {/* Subtle PlayStation geometric pattern watermark */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-end pr-4 opacity-[0.06] font-mono text-3xl tracking-[0.4em] select-none" aria-hidden="true">
        △◯✕▢
      </div>

      {/* Top spacer (leaves room for the absolute Stage badge) */}
      <div className="h-6" />

      {/* Game Title & Platform identification */}
      <div className="relative z-10 min-w-0 pr-12">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
          {engineLabel || project.original_platform || "PlayStation Vita"}
        </p>
        <h3 className="mt-1 line-clamp-2 font-display text-[18px] sm:text-[20px] font-bold tracking-tight text-white leading-snug drop-shadow-md">
          {titleName}
        </h3>
      </div>

      {/* Bottom subtle hardware accent line */}
      <div className="relative z-10 flex items-center justify-between pt-2 border-t border-white/[0.08] text-[10px] font-mono text-zinc-400">
        <span>PS VITA PORT</span>
        <span className="text-zinc-400 uppercase">
          {(project.technologies || [])[0] || "Native"}
        </span>
      </div>
    </div>
  );
};
