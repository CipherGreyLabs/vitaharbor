import { describe, it, expect } from "vitest";
import { validateAndParseRedditUrl } from "../../src/worker/services/reddit/redditUrlValidator";
import { RedditClient } from "../../src/worker/services/reddit/redditClient";

describe("Reddit URL Validator & SSRF Guard", () => {
  it("should parse standard reddit post URLs", () => {
    const res = validateAndParseRedditUrl(
      "https://www.reddit.com/r/vitahacks/comments/1i2j3k/release_fallout_2_ce_ps_vita_port/"
    );
    expect(res.isValid).toBe(true);
    expect(res.subreddit).toBe("vitahacks");
    expect(res.postId).toBe("1i2j3k");
    expect(res.canonicalUrl).toBe("https://www.reddit.com/r/vitahacks/comments/1i2j3k");
  });

  it("should parse redd.it shortlinks", () => {
    const res = validateAndParseRedditUrl("https://redd.it/xyz987");
    expect(res.isValid).toBe(true);
    expect(res.postId).toBe("xyz987");
    expect(res.canonicalUrl).toBe("https://www.reddit.com/comments/xyz987");
  });

  it("should reject malicious or disallowed hosts (SSRF prevention)", () => {
    const internalIp = validateAndParseRedditUrl("http://169.254.169.254/latest/meta-data");
    expect(internalIp.isValid).toBe(false);
    expect(internalIp.error).toContain("Disallowed host");

    const localhost = validateAndParseRedditUrl("http://localhost:8080/admin");
    expect(localhost.isValid).toBe(false);

    const externalAttacker = validateAndParseRedditUrl("https://evil-phishing-reddit.com/r/vitahacks");
    expect(externalAttacker.isValid).toBe(false);
  });
});

describe("Reddit Client Budget and Rate Limiting", () => {
  it("should enforce request budget limits", () => {
    const client = new RedditClient({ maxRequestsPerRun: 2 });
    expect(client.getBudgetRemaining()).toBe(2);

    client.resetRunBudget();
    expect(client.getBudgetRemaining()).toBe(2);
  });
});

