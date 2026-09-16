import type { ObservationType, DevelopmentStage } from "../../../shared/types";

export interface ScoreResult {
  isRelevant: boolean;
  score: number;
  suggestedType: ObservationType;
  suggestedStage: DevelopmentStage | null;
  reasons: string[];
}

const STRONG_RELEASE_KEYWORDS = [/\b\[?release\]?\b/i, /\bv\d+\.\d+/i, /\bnow available\b/i, /\bout now\b/i];
const STRONG_PROGRESS_KEYWORDS = [
  /\bplayable\b/i,
  /\b60\s?fps\b/i,
  /\b30\s?fps\b/i,
  /\bfirst boot\b/i,
  /\bin-?game\b/i,
  /\bshader(s)?\b/i,
  /\bgl4es\b/i,
  /\bwrapper\b/i,
  /\bport(ed|ing)?\b/i,
  /\bwip\b/i,
  /\barmv7\b/i,
  /\bvitagl\b/i
];

const NOISE_NEGATIVE_KEYWORDS = [
  /\bpkgj\b/i,
  /\bautoplugin\b/i,
  /\bsd2vita\b/i,
  /\bh-encore\b/i,
  /\benso\b/i,
  /\bhow to install\b/i,
  /\bhelp me\b/i,
  /\bwhere to download\b/i,
  /\btheme(s)?\b/i,
  /\bwallpaper\b/i,
  /\bbattery\b/i
];

export function scoreContent(title: string, body: string): ScoreResult {
  const combined = `${title} ${body}`;
  let score = 0;
  const reasons: string[] = [];
  let suggestedType: ObservationType = "other";
  let suggestedStage: DevelopmentStage | null = null;

  // Check negative noise keywords first
  for (const neg of NOISE_NEGATIVE_KEYWORDS) {
    if (neg.test(combined)) {
      score -= 0.3;
      reasons.push(`Negative signal: ${neg.source}`);
    }
  }

  // Strong release signals
  for (const rel of STRONG_RELEASE_KEYWORDS) {
    if (rel.test(title)) {
      score += 0.5;
      reasons.push(`Title matches release pattern: ${rel.source}`);
      suggestedType = "release";
      suggestedStage = "released";
    } else if (rel.test(body)) {
      score += 0.25;
      reasons.push(`Body matches release pattern: ${rel.source}`);
    }
  }

  // Progress and technical signals
  for (const prog of STRONG_PROGRESS_KEYWORDS) {
    if (prog.test(title)) {
      score += 0.35;
      reasons.push(`Title matches tech/progress pattern: ${prog.source}`);
    } else if (prog.test(body)) {
      score += 0.15;
      reasons.push(`Body matches tech/progress pattern: ${prog.source}`);
    }
  }

  // Stage deduction
  if (/\bfirst boot\b/i.test(combined)) {
    suggestedType = "first_boot";
    suggestedStage = "booting";
  } else if (/\bin-?game\b/i.test(combined)) {
    suggestedType = "first_in_game";
    suggestedStage = "in_game";
  } else if (/\bplayable\b/i.test(combined) && suggestedType !== "release") {
    suggestedType = "playability_progress";
    suggestedStage = "playable";
  } else if (/\b(announc|working on|started)\b/i.test(title) && suggestedType !== "release") {
    suggestedType = "project_announced";
    suggestedStage = "early_wip";
  } else if (suggestedType === "other" && score > 0.4) {
    suggestedType = "technical_progress";
  }

  const finalScore = Math.max(0, Math.min(1.0, score));
  return {
    isRelevant: finalScore >= 0.4,
    score: finalScore,
    suggestedType,
    suggestedStage,
    reasons
  };
}

