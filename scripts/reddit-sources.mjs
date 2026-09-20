// Canonical Reddit discovery scope. Keep this list small and explicit: the
// scanner records candidates from these communities, but never promotes them
// into the curated ledger automatically.
export const REDDIT_SOURCES = Object.freeze([
  Object.freeze({ key: "vitahacks", subreddit: "vitahacks", displayName: "r/vitahacks" }),
  Object.freeze({ key: "vitapiracy", subreddit: "VitaPiracy", displayName: "r/VitaPiracy" }),
  Object.freeze({ key: "psvitahomebrew", subreddit: "PSVitaHomebrew", displayName: "r/PSVitaHomebrew" }),
]);

export const REDDIT_SUBREDDITS = Object.freeze(REDDIT_SOURCES.map(({ subreddit }) => subreddit));
export const REDDIT_SOURCE_LABEL = REDDIT_SOURCES.map(({ displayName }) => displayName).join(" + ");

export function redditRssUrl(subreddit) {
  return "https://www.reddit.com/r/" + subreddit + "/new.rss";
}
