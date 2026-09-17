import React from "react";
import { relativeTime } from "./types";

interface CommunityTickerProps {
  recentUpdates: any[];
  tickerPaused: boolean;
  onTogglePause: () => void;
}

export const CommunityTicker: React.FC<CommunityTickerProps> = ({
  recentUpdates,
  tickerPaused,
  onTogglePause
}) => {
  if (!recentUpdates || recentUpdates.length === 0) return null;

  return (
    <div
      role="region"
      aria-label="Latest community signals"
      className="relative flex h-9 items-center overflow-hidden border-b border-hairline bg-surface pr-20"
    >
      <div className={"vh-ticker text-caption text-ink-muted" + (tickerPaused ? " vh-ticker-paused" : "")}>
        {[0, 1].map((pass) => (
          <React.Fragment key={pass}>
            {recentUpdates.map((item, index) => (
              <a
                key={pass + "-" + index}
                href={item.sources?.[0]?.canonical_url || "#directory"}
                target={item.sources?.[0]?.canonical_url ? "_blank" : undefined}
                rel="noopener noreferrer"
                tabIndex={pass === 0 ? 0 : -1}
                aria-hidden={pass === 1}
                className="mx-7 inline-flex items-center gap-2.5 whitespace-nowrap transition-colors hover:text-accent"
              >
                <span className="vh-tnum text-ink-muted">{relativeTime(item.event_at)}</span>
                <span className="h-1 w-1 rounded-full bg-accent" />
                <span>{item.title}</span>
              </a>
            ))}
          </React.Fragment>
        ))}
      </div>

      <button
        type="button"
        onClick={onTogglePause}
        aria-pressed={tickerPaused}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md border border-hairline bg-surface px-2 py-0.5 text-micro font-medium text-ink-medium transition-colors hover:text-ink"
      >
        {tickerPaused ? "Play" : "Pause"}
      </button>
    </div>
  );
};
