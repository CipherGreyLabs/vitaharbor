export interface LedgerProject {
  id: number;
  game_id?: number;
  slug: string;
  reddit_url?: string;
  repo_url?: string;
  display_name: string;
  current_stage: string;
  lifecycle?: string;
  summary: string;
  playability_notes?: string | null;
  performance_notes?: string | null;
  first_seen_at?: string | Date;
  last_activity_at?: string | Date;
  released_at?: string | Date | null;
  is_featured?: boolean;
  is_archived?: boolean;
  verification?: string;
  game_title?: string;
  original_platform?: string | null;
  original_release_year?: number | null;
  technologies?: string[];
  developers?: Array<{ id: number; role: string; display_name: string; slug: string }>;
  stage_history?: Array<{ id: number; stage: string; effective_at: string | Date; reason?: string | null }>;
}

export const KNOWN_REPOS: Record<string, string> = {
  "openmohaa-vita": "https://github.com/openmohaa/openmohaa",
  "smash-melee-vita": "https://github.com/doldecomp/melee",
  "hollow-knight-vita": "https://github.com/patnosDD/Hollow-Knight-Vita",
  "zelda-ship-of-harkinian-vita": "https://github.com/HarbourMasters/Shipwright",
  "fallout-2-ce-vita": "https://github.com/alexbatalov/fallout2-ce",
  "render96-sm64-hd-vita": "https://github.com/byllava/sm64-vita",
  "celeste-classic-vita": "https://github.com/Jon-Davis/Celeste-Classic-Vita",
  "cave-story-evo-vita": "https://github.com/nxengine/nxengine-evo",
  "class-of-09-vita": "https://github.com/SonicMastr/Class-of-09-Vita",
  "renpy-8-runtime-engine": "https://github.com/SonicMastr/renpy-vita",
  "portal-vita": "https://github.com/DanielSant0s/portal-vita"
};

export const STAGE_TONE: Record<string, string> = {
  released: "bg-stage-done",
  completable: "bg-stage-done",
  playable: "bg-stage-done",
  in_game: "bg-stage-progress",
  booting: "bg-stage-caution",
  early_wip: "bg-stage-idle",
  research: "bg-stage-idle",
  announced: "bg-stage-idle"
};

export const STAGE_CHIP: Record<string, string> = {
  released: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
  completable: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
  playable: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
  in_game: "bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300",
  booting: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  early_wip: "bg-slate-200 text-slate-700 dark:bg-slate-500/20 dark:text-slate-300",
  research: "bg-slate-200 text-slate-700 dark:bg-slate-500/20 dark:text-slate-300",
  announced: "bg-slate-200 text-slate-700 dark:bg-slate-500/20 dark:text-slate-300"
};

export const STAGE_STEP: Record<string, number> = {
  announced: 1,
  research: 1,
  early_wip: 2,
  booting: 3,
  in_game: 4,
  playable: 5,
  completable: 5,
  released: 5
};

export const STAGE_RANK: Record<string, number> = {
  announced: 0,
  research: 0,
  early_wip: 1,
  booting: 2,
  in_game: 3,
  playable: 4,
  completable: 5,
  released: 6
};

export function splitTitle(raw: unknown) {
  const value = String(raw || "Untitled port").trim();
  const open = value.indexOf("(");
  if (open === -1) return { name: value, engine: "" };
  return {
    name: value.slice(0, open).trim(),
    engine: value.slice(open).replace(/[()]/g, "").trim()
  };
}

export function prettyStage(stage: unknown) {
  const value = String(stage || "wip").replace(/_/g, " ");
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function relativeTime(value: unknown) {
  const time = new Date(String(value)).getTime();
  if (Number.isNaN(time)) return "";
  const hours = Math.round((Date.now() - time) / 3600000);
  if (hours < 1) return "just now";
  if (hours < 24) return hours + "h ago";
  const days = Math.round(hours / 24);
  if (days < 31) return days + "d ago";
  return Math.round(days / 30) + "mo ago";
}

export function formatDay(value: unknown) {
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function formatMonth(value: unknown) {
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

export function derivePlatformCategory(project: LedgerProject): "wrapper" | "decomp" | "classic" {
  const platform = (project.original_platform || "").toLowerCase();
  const techs = (project.technologies || []).map((t) => t.toLowerCase());

  if (platform.includes("decomp") || techs.some((t) => t.includes("decomp") || t.includes("ultraship"))) {
    return "decomp";
  }
  if (platform.includes("android") || techs.some((t) => t.includes("armv7") || t.includes("wrapper"))) {
    return "wrapper";
  }
  return "classic";
}

export function deriveSetupGuide(project: LedgerProject) {
  const category = derivePlatformCategory(project);
  const slug = project.slug.replace(/-vita$/i, "");

  if (category === "wrapper") {
    return {
      categoryLabel: "Android ARMv7 Wrapper",
      plugins: ["kubridge.skprx", "fd_fix.skprx", "libshacccg.suprx"],
      overclock: "500 MHz (PSVshell recommended)",
      assetPath: `ux0:data/${slug}/`,
      instructions: "Requires original Android .apk file and .obb game data placed in the data folder."
    };
  }

  if (category === "decomp") {
    return {
      categoryLabel: "Decompilation / Source Port",
      plugins: ["libshacccg.suprx", "rePatch (optional)"],
      overclock: "444 MHz (Official Vita Boost)",
      assetPath: `ux0:data/${slug}/`,
      instructions: "Requires legitimate original game ROM or asset files to generate Vita-compatible data."
    };
  }

  return {
    categoryLabel: "PC & Engine Classic",
    plugins: ["libshacccg.suprx"],
    overclock: "444 MHz",
    assetPath: `ux0:data/${slug}/`,
    instructions: "Requires original PC game data files (e.g. from Steam or GOG) copied to data folder."
  };
}

export const SPECS: Array<[string, string]> = [
  ["Architecture", "Quad Cortex-A9"],
  ["Graphics", "SGX543MP4+"],
  ["Display", "960 × 544 OLED"],
  ["Memory", "512 MB unified"]
];
