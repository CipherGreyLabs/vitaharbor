import React from "react";
import { formatDate } from "@/shared/utils";
import { StatusBadge } from "../ui/StatusBadge";
import type { DevelopmentStage } from "@/shared/types";

export interface StageHistoryRecord {
  id: number;
  stage: DevelopmentStage;
  effective_at: string | Date;
  reason?: string | null;
}

interface StageHistoryVisualizerProps {
  currentStage: DevelopmentStage;
  history?: StageHistoryRecord[];
}

export const StageHistoryVisualizer: React.FC<StageHistoryVisualizerProps> = ({
  currentStage,
  history = []
}) => {
  // If no recorded historical stages exist, show current achieved stage
  if (!history || history.length === 0) {
    return (
      <div className="card-panel p-4 flex items-center justify-between">
        <span className="text-xs text-[#9aaabd]">Current Verified Stage:</span>
        <StatusBadge type="stage" value={currentStage} />
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      <div className="relative pl-5 space-y-4 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#2c313a]">
        {history.map((entry, idx) => {
          const isLatest = idx === history.length - 1;
          return (
            <div key={entry.id || idx} className="relative group">
              <div
                className={`absolute -left-5 top-1.5 w-3 h-3 rounded-full border ${
                  isLatest
                    ? "bg-[#3ad2ff] border-[#7fe3ff] ring-2 ring-[#3ad2ff]/20"
                    : "bg-[#1c2024] border-[#3ad2ff]/60"
                }`}
              />
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div className="flex items-center gap-2">
                  <StatusBadge type="stage" value={entry.stage} />
                  {entry.reason && (
                    <span className="text-xs text-[#f4f6f8] font-medium">
                      {entry.reason}
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-mono text-[#7c848d]">
                  {formatDate(entry.effective_at)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

