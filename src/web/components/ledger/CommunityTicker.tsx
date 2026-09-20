import React from "react";
import { formatDay, formatUtcDateTime } from "./types";

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
      className="relative flex h-11 items-center overflow-hidden border-b border-hairline bg-surface pr-20"
    >
      <div className={"vh-ticker text-caption text-ink-muted" + (tickerPaused ? " vh-ticker-paused" : "")}>
        {[0, 1].map((pass) => (
          <React.Fragment key={pass}>
            {recentUpdates.map((item, index) => {
              const sourceUrl = item.sources?.[0]?.canonical_url;
              const content = (
                <>
                  <span className="vh-tnum text-ink-muted" title={"Source date: " + formatUtcDateTime(item.event_at)}>
                    {formatDay(item.event_at)}
                  </span>
                  <span className="h-1 w-1 rounded-full bg-accent" />
                  <span>{item.title}</span>
                </>
              );
              const className = "mx-7 inline-flex min-h-[44px] items-center gap-2.5 whitespace-nowrap transition-colors hover:text-accent";

              return sourceUrl ? (
                <a
                  key={pass + "-" + index}
                  href={sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  tabIndex={pass === 0 ? 0 : -1}
                  aria-hidden={pass === 1}
                  className={className}
                >
                  {content}
                </a>
              ) : (
                <span
                  key={pass + "-" + index}
                  title="No verified source is recorded for this update"
                  aria-label={item.title + " — no verified source"}
                  aria-hidden={pass === 1}
                  className={className + " cursor-default"}
                >
                  {content}
                </span>
              );
            })}
          </React.Fragment>
        ))}
      </div>

      <button
        type="button"
        onClick={onTogglePause}
        aria-pressed={tickerPaused}
        className="absolute right-2 top-1/2 inline-flex min-h-8 -translate-y-1/2 items-center rounded-md border border-hairline bg-surface px-2.5 text-micro font-medium text-ink-medium transition-colors hover:text-ink"
      >
        {tickerPaused ? "Play" : "Pause"}
      </button>
    </div>
  );
};
