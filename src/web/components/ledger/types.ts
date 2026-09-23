export interface LedgerProject {
  id: number;
  game_id?: number;
  slug: string;
  reddit_url?: string;
  repo_url?: string;
  screenshot_url?: string;
  screenshot_source_url?: string;
  screenshot_alt?: string;
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
  aliases?: string[];
  last_verified_at?: string | Date | null;
  setup_evidence?: SetupEvidence | null;
  game_title?: string;
  original_platform?: string | null;
  original_release_year?: number | null;
  technologies?: string[];
  developers?: Array<{ id: number; role: string; display_name: string; slug: string }>;
  stage_history?: Array<{
    id: number;
    stage: string;
    effective_at: string | Date;
    reason?: string | null;
    source_url?: string | null;
  }>;
}

export interface SetupEvidence {
  categoryLabel?: string;
  plugins?: string[];
  overclock?: string | null;
  assetPath?: string | null;
  instructions?: string | null;
  sourceUrl?: string | null;
  verifiedOnHardware?: boolean;
}

export type ProjectTypeKey = "native" | "decomp" | "wrapper" | "engine" | "classic";

export const PROJECT_TYPE_META: Record<ProjectTypeKey, { label: string; shortLabel: string }> = {
  native: { label: "Native port", shortLabel: "Native" },
  decomp: { label: "Decompilation", shortLabel: "Decomp" },
  wrapper: { label: "ARM wrapper / loader", shortLabel: "Wrapper" },
  engine: { label: "Engine / runtime", shortLabel: "Engine" },
  classic: { label: "Classic / other", shortLabel: "Classic" }
};

export const VERIFICATION_META: Record<string, { label: string; description: string }> = {
  developer_direct: {
    label: "Developer source",
    description: "The current record is grounded in a source attributed to the developer."
  },
  community_report: {
    label: "Community report",
    description: "The current record is grounded in a community report."
  },
  detected: {
    label: "Unverified community report",
    description: "A community post mentions this project, but VitaHarbor has not independently confirmed the details."
  }
};

export const KNOWN_REPOS: Record<string, string> = {
  "openmohaa-vita": "https://github.com/HenryKun55/openmohaa/tree/vita-port",
  "smash-melee-vita": "https://github.com/robin994/SmashMeleeVita",
  "hollow-knight-vita": "https://github.com/PatnosDD/Hollow-Knight-PsVita",
  "class-of-09-vita": "https://github.com/TheSpasticGamer/Class-Of-09-Vita-Port",
  "renpy-8-runtime-engine": "https://github.com/Grimiku/RenPy-Vita-8",
  "illusia-vita": "https://github.com/withLogic/illusia-vita",
  "jedi-academy-vita": "https://github.com/NDRWhun/JAVITA",
  "jedi-outcast-vita": "https://github.com/NDRWhun/JK2VITA",
  "barony-vita": "https://github.com/Brendonm17/Barony-Vita"
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

export function formatUtcDateTime(value: unknown) {
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return "date not recorded";
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC"
  }) + " UTC";
}

export function formatMonth(value: unknown) {
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

export function deriveProjectType(project: LedgerProject): ProjectTypeKey {
  const platform = (project.original_platform || "").toLowerCase();
  const techs = (project.technologies || []).map((t) => t.toLowerCase());
  const text = [platform, project.game_title, project.display_name, ...techs]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (text.includes("ren'py") || text.includes("runtime") || text.includes("engine")) {
    return "engine";
  }

  if (platform.includes("decomp") || techs.some((t) => t.includes("decomp") || t.includes("ultraship"))) {
    return "decomp";
  }
  if (
    platform.includes("android") ||
    platform.includes("ios") ||
    techs.some((t) => t.includes("armv7") || t.includes("wrapper") || t.includes("loader") || t.includes("recompiler"))
  ) {
    return "wrapper";
  }
  if (techs.some((t) => t.includes("native") || t.includes("vitagl") || t.includes("scegxm"))) {
    return "native";
  }
  return "classic";
}

export function derivePlatformCategory(project: LedgerProject): ProjectTypeKey {
  return deriveProjectType(project);
}

/**
 * Setup is evidence, not a category default. Older versions inferred plugins,
 * clock speeds and asset paths from the project type; that made generic advice
 * look like a project-specific claim. Only an explicit record may be rendered.
 */
export function deriveSetupGuide(project: LedgerProject): SetupEvidence | null {
  return project.setup_evidence || null;
}

export function verificationMeta(value: unknown) {
  return VERIFICATION_META[String(value || "")] || {
    label: "Verification not recorded",
    description: "No verification level has been recorded for this entry."
  };
}

export function freshness(value: unknown, staleAfterDays = 90) {
  const time = new Date(String(value)).getTime();
  if (Number.isNaN(time)) return { state: "unknown" as const, label: "Date not recorded" };
  const age = Math.max(0, Date.now() - time) / 86400000;
  if (age > staleAfterDays) return { state: "stale" as const, label: "Needs refresh" };
  if (age > 30) return { state: "aging" as const, label: "Aging record" };
  return { state: "fresh" as const, label: "Recently observed" };
}

export const SPECS: Array<[string, string]> = [
  ["Architecture", "Quad Cortex-A9"],
  ["Graphics", "SGX543MP4+"],
  ["Display", "960 × 544 OLED"],
  ["Memory", "512 MB unified"]
];
