export function buildScannerHealth(subreddits, feedResults, attemptedAt = new Date().toISOString()) {
  const bySubreddit = new Map(feedResults.map((result) => [String(result.subreddit).toLowerCase(), result]));
  const sources = subreddits.map((subreddit) => {
    const result = bySubreddit.get(String(subreddit).toLowerCase());
    return {
      subreddit,
      status: result?.status === "available"
        ? "available"
        : result?.status === "rate_limited"
          ? "rate_limited"
          : "unavailable"
    };
  });
  const successfulSources = sources.filter((source) => source.status === "available").length;
  return {
    schema_version: 1,
    attempted_at: attemptedAt,
    state: successfulSources === sources.length ? "complete" : successfulSources > 0 ? "partial" : "failed",
    successful_sources: successfulSources,
    total_sources: sources.length,
    sources
  };
}
