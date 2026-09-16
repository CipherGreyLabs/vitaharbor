import React from "react";
import type { DevelopmentStage } from "../../../shared/types";

interface ProgressionBarProps {
  currentStage: DevelopmentStage;
}

const STAGES: { key: DevelopmentStage; label: string }[] = [
  { key: "announced", label: "Announced" },
  { key: "early_wip", label: "Early WIP" },
  { key: "booting", label: "Booting" },
  { key: "in_game", label: "In-Game" },
  { key: "playable", label: "Playable" },
  { key: "released", label: "Released" }
];

const STAGE_RANKS: Record<string, number> = {
  announced: 0,
  research: 0,
  early_wip: 1,
  booting: 2,
  in_game: 3,
  playable: 4,
  completable: 4,
  released: 5,
  unknown: -1
};

export const ProgressionBar: React.FC<ProgressionBarProps> = ({ currentStage }) => {
  const currentRank = STAGE_RANKS[currentStage] ?? -1;

  return (
    <div className="w-full py-3" aria-label="Development Progression">
      <div className="flex items-center justify-between relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 w-full bg-[#242830] -z-0" />
        {STAGES.map((s, index) => {
          const isReached = currentRank >= index;
          const isCurrent = currentRank === index;

          return (
            <div key={s.key} className="flex flex-col items-center relative z-10">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold border transition-all ${
                  isCurrent
                    ? "bg-[#3ad2ff] text-white border-[#7fe3ff] ring-4 ring-[#3ad2ff]/20"
                    : isReached
                    ? "bg-[#1c2024] text-[#3ad2ff] border-[#3ad2ff]"
                    : "bg-[#1c2024] text-[#7c848d] border-[#2c313a]"
                }`}
              >
                {index + 1}
              </div>
              <span
                className={`text-[10px] mt-1 font-medium ${
                  isCurrent ? "text-[#3ad2ff] font-semibold" : isReached ? "text-[#f4f6f8]" : "text-[#7c848d]"
                }`}
              >
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

