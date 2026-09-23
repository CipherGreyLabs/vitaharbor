export const SCANNER_HEALTH_SCHEMA_VERSION = 2;

const VALID_STATUSES = new Set(["available", "rate_limited", "unavailable"]);

function normalizePreviousSource(previous, subreddit) {
  const match = Array.isArray(previous?.sources)
    ? previous.sources.find((source) => String(source?.subreddit || "").toLowerCase() === subreddit.toLowerCase())
    : null;
  const lastSuccessful = typeof match?.last_successful_scan_at === "string"
    ? match.last_successful_scan_at
    : (match?.status === "available" && typeof previous?.attempted_at === "string" ? previous.attempted_at : null);
  const consecutiveFailures = Number.isInteger(match?.consecutive_failures) && match.consecutive_failures >= 0
    ? match.consecutive_failures
    : 0;
  return { lastSuccessful, consecutiveFailures };
}

function sourceStatus(result) {
  return VALID_STATUSES.has(result?.status) ? result.status : "unavailable";
}

function recentRunFromSources(attemptedAt, sources) {
  const successfulSources = sources.filter((source) => source.status === "available").length;
  return {
    attempted_at: attemptedAt,
    state: successfulSources === sources.length ? "complete" : successfulSources > 0 ? "partial" : "failed",
    successful_sources: successfulSources,
    source_statuses: Object.fromEntries(sources.map((source) => [source.subreddit, source.status]))
  };
}

function consecutiveDegradedRuns(runs) {
  let count = 0;
  for (const run of runs) {
    if (!run || (run.state !== "partial" && run.state !== "failed")) break;
    count += 1;
  }
  return count;
}

export function buildScannerHealth(
  subreddits,
  feedResults,
  attemptedAt = new Date().toISOString(),
  previous = null,
  githubActionEnv = process.env
) {
  const bySubreddit = new Map(feedResults.map((result) => [String(result.subreddit).toLowerCase(), result]));
  const sources = subreddits.map((subreddit) => {
    const result = bySubreddit.get(String(subreddit).toLowerCase());
    const status = sourceStatus(result);
    const old = normalizePreviousSource(previous, subreddit);
    return {
      subreddit,
      status,
      last_successful_scan_at: status === "available" ? attemptedAt : old.lastSuccessful,
      consecutive_failures: status === "available" ? 0 : old.consecutiveFailures + 1
    };
  });
  const successfulSources = sources.filter((source) => source.status === "available").length;
  const state = successfulSources === sources.length ? "complete" : successfulSources > 0 ? "partial" : "failed";
  const currentRun = recentRunFromSources(attemptedAt, sources);
  const previousRuns = Array.isArray(previous?.recent_runs) ? previous.recent_runs : [];
  const recentRuns = [currentRun, ...previousRuns].slice(0, 12);
  return {
    schema_version: SCANNER_HEALTH_SCHEMA_VERSION,
    attempted_at: attemptedAt,
    state,
    successful_sources: successfulSources,
    total_sources: sources.length,
    // This file is written before the workflow can publish its commit. A
    // generated file cannot observe the final push, so completion stays
    // UNKNOWN when publication is not observable from the JSON itself.
    github_action: {
      provider: githubActionEnv.GITHUB_ACTIONS === "true" ? "github-actions" : "local",
      status: "unknown",
      run_id: githubActionEnv.GITHUB_RUN_ID || null,
      event: githubActionEnv.GITHUB_EVENT_NAME || null,
      sha: githubActionEnv.GITHUB_SHA || null
    },
    consecutive_degraded_runs: consecutiveDegradedRuns(recentRuns),
    recent_runs: recentRuns,
    sources
  };
}
