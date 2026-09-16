import { validateAndParseRedditUrl } from "./redditUrlValidator";

export interface RedditClientConfig {
  clientId?: string;
  clientSecret?: string;
  userAgent?: string;
  refreshToken?: string;
  maxRequestsPerRun?: number;
}

export interface RateLimitStatus {
  used: number;
  remaining: number;
  resetSeconds: number;
}

export interface NormalizedRedditPost {
  externalId: string;
  fullname: string;
  itemType: "post";
  title: string;
  body: string;
  author: string;
  subreddit: string;
  canonicalUrl: string;
  createdAt: Date;
  editedAt: Date | null;
  permalink: string;
  numComments: number;
  score: number;
}

export interface NormalizedRedditComment {
  externalId: string;
  fullname: string;
  itemType: "comment";
  body: string;
  author: string;
  subreddit: string;
  canonicalUrl: string;
  createdAt: Date;
  editedAt: Date | null;
  parentExternalId: string | null;
  rootThreadExternalId: string | null;
  score: number;
}

export class RedditClient {
  private accessToken: string | null = null;
  private tokenExpiresAt = 0;
  private requestsMadeInRun = 0;
  private maxRequestsPerRun: number;

  private rateLimit: RateLimitStatus = {
    used: 0,
    remaining: 600,
    resetSeconds: 600
  };

  constructor(private config: RedditClientConfig) {
    this.maxRequestsPerRun = config.maxRequestsPerRun || 60;
  }

  getRateLimitStatus(): RateLimitStatus {
    return { ...this.rateLimit };
  }

  getBudgetRemaining(): number {
    return Math.max(0, this.maxRequestsPerRun - this.requestsMadeInRun);
  }

  resetRunBudget(): void {
    this.requestsMadeInRun = 0;
  }

  /**
   * Acquires or re-uses an OAuth2 token using refresh token or client credentials.
   */
  async ensureAccessToken(): Promise<string | null> {
    if (this.accessToken && Date.now() < this.tokenExpiresAt - 60000) {
      return this.accessToken;
    }

    if (!this.config.clientId || !this.config.clientSecret) {
      return null;
    }

    try {
      const basicAuth = btoa(`${this.config.clientId}:${this.config.clientSecret}`);
      const body = new URLSearchParams();

      if (this.config.refreshToken) {
        body.set("grant_type", "refresh_token");
        body.set("refresh_token", this.config.refreshToken);
      } else {
        body.set("grant_type", "client_credentials");
      }

      const res = await fetch("https://www.reddit.com/api/v1/access_token", {
        method: "POST",
        headers: {
          Authorization: `Basic ${basicAuth}`,
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": this.config.userAgent || "VitaPortWatch/1.0"
        },
        body: body.toString()
      });

      if (!res.ok) {
        console.error("Reddit OAuth token request failed", res.status);
        return null;
      }

      const data = (await res.json()) as { access_token: string; expires_in: number };
      this.accessToken = data.access_token;
      this.tokenExpiresAt = Date.now() + data.expires_in * 1000;
      return this.accessToken;
    } catch (e) {
      console.error("Error acquiring Reddit OAuth token", e);
      return null;
    }
  }

  /**
   * Fetches new posts from a subreddit.
   */
  async fetchSubredditNew(subreddit: string, limit = 25, after?: string): Promise<NormalizedRedditPost[]> {
    if (this.getBudgetRemaining() <= 0) {
      console.warn("Reddit client request budget exhausted for current run");
      return [];
    }

    const token = await this.ensureAccessToken();
    const headers: Record<string, string> = {
      "User-Agent": this.config.userAgent || "VitaPortWatch/1.0"
    };

    let url: string;
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
      url = `https://oauth.reddit.com/r/${subreddit}/new.json?limit=${limit}`;
    } else {
      url = `https://www.reddit.com/r/${subreddit}/new.json?limit=${limit}`;
    }

    if (after) {
      url += `&after=${encodeURIComponent(after)}`;
    }

    try {
      this.requestsMadeInRun++;
      const res = await fetch(url, { headers });
      this.updateRateLimitHeaders(res.headers);

      if (!res.ok) {
        console.error(`Failed to fetch r/${subreddit}/new`, res.status);
        return [];
      }

      const data = (await res.json()) as {
        data: {
          children: {
            data: {
              id: string;
              name: string;
              title: string;
              selftext: string;
              author: string;
              subreddit: string;
              permalink: string;
              created_utc: number;
              edited: number | boolean;
              num_comments: number;
              score: number;
            };
          }[];
        };
      };

      return (data.data?.children || []).map((child) => {
        const d = child.data;
        const validation = validateAndParseRedditUrl(`https://reddit.com${d.permalink}`);
        return {
          externalId: d.id,
          fullname: d.name,
          itemType: "post",
          title: d.title || "",
          body: d.selftext || "",
          author: d.author || "[deleted]",
          subreddit: d.subreddit,
          canonicalUrl: validation.canonicalUrl,
          createdAt: new Date(d.created_utc * 1000),
          editedAt: typeof d.edited === "number" ? new Date(d.edited * 1000) : null,
          permalink: d.permalink,
          numComments: d.num_comments || 0,
          score: d.score || 0
        };
      });
    } catch (e) {
      console.error(`Exception fetching r/${subreddit}`, e);
      return [];
    }
  }

  /**
   * Fetches comments for a specific Reddit submission.
   */
  async fetchPostComments(subreddit: string, postId: string, limit = 50): Promise<NormalizedRedditComment[]> {
    if (this.getBudgetRemaining() <= 0) {
      return [];
    }

    const token = await this.ensureAccessToken();
    const headers: Record<string, string> = {
      "User-Agent": this.config.userAgent || "VitaPortWatch/1.0"
    };

    let url: string;
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
      url = `https://oauth.reddit.com/r/${subreddit}/comments/${postId}.json?limit=${limit}`;
    } else {
      url = `https://www.reddit.com/r/${subreddit}/comments/${postId}.json?limit=${limit}`;
    }

    try {
      this.requestsMadeInRun++;
      const res = await fetch(url, { headers });
      this.updateRateLimitHeaders(res.headers);

      if (!res.ok) {
        return [];
      }

      const data = (await res.json()) as [
        unknown,
        {
          data: {
            children: {
              data: {
                id: string;
                name: string;
                body: string;
                author: string;
                subreddit: string;
                permalink: string;
                created_utc: number;
                edited: number | boolean;
                parent_id: string;
                link_id: string;
                score: number;
              };
            }[];
          };
        }
      ];

      const commentChildren = data[1]?.data?.children || [];
      return commentChildren
        .filter((c) => c.data && c.data.body)
        .map((child) => {
          const d = child.data;
          const validation = validateAndParseRedditUrl(`https://reddit.com${d.permalink}`);
          return {
            externalId: d.id,
            fullname: d.name,
            itemType: "comment",
            body: d.body,
            author: d.author || "[deleted]",
            subreddit: d.subreddit,
            canonicalUrl: validation.canonicalUrl,
            createdAt: new Date(d.created_utc * 1000),
            editedAt: typeof d.edited === "number" ? new Date(d.edited * 1000) : null,
            parentExternalId: d.parent_id || null,
            rootThreadExternalId: d.link_id || postId,
            score: d.score || 0
          };
        });
    } catch (e) {
      console.error(`Exception fetching comments for ${postId}`, e);
      return [];
    }
  }

  private updateRateLimitHeaders(headers: Headers): void {
    const used = headers.get("x-ratelimit-used");
    const remaining = headers.get("x-ratelimit-remaining");
    const reset = headers.get("x-ratelimit-reset");

    if (used) this.rateLimit.used = parseFloat(used);
    if (remaining) this.rateLimit.remaining = parseFloat(remaining);
    if (reset) this.rateLimit.resetSeconds = parseFloat(reset);
  }
}
