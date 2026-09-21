export interface RedditSource {
  key: string;
  subreddit: string;
  displayName: string;
}

export const REDDIT_SOURCES: readonly RedditSource[];
export const REDDIT_SUBREDDITS: readonly string[];
export const REDDIT_SOURCE_LABEL: string;
export function redditRssUrl(subreddit: string): string;
export function redditSearchRssUrl(subreddit: string, query: string, timeRange?: string): string;
