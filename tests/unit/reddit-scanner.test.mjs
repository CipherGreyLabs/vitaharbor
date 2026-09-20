import { describe, expect, it } from "vitest";
import { REDDIT_SOURCE_LABEL, REDDIT_SOURCES, REDDIT_SUBREDDITS, redditRssUrl } from "../../scripts/reddit-sources.mjs";
import { classify, classifyCandidateType } from "../../scripts/reddit-classifier.mjs";

describe("Reddit discovery scope", () => {
  it("keeps all three communities in one canonical scan scope", () => {
    expect(REDDIT_SUBREDDITS).toEqual(["vitahacks", "VitaPiracy", "PSVitaHomebrew"]);
    expect(REDDIT_SOURCES.map((source) => source.displayName)).toEqual([
      "r/vitahacks",
      "r/VitaPiracy",
      "r/PSVitaHomebrew"
    ]);
    expect(REDDIT_SOURCE_LABEL).toBe("r/vitahacks + r/VitaPiracy + r/PSVitaHomebrew");
    expect(redditRssUrl("PSVitaHomebrew")).toBe("https://www.reddit.com/r/PSVitaHomebrew/new.rss");
  });
});

describe("Reddit candidate classifier", () => {
  it("accepts a source-backed port announcement without changing its type", () => {
    const result = classify({
      title: "[Pre-Release] C-Dogs SDL port for PS Vita / PSTV",
      body: "Native Vita/PSTV build tested on real hardware. GitHub releases and source are linked."
    });
    expect(result.accept).toBe(true);
    expect(result.confidence).toBe("high");
    expect(classifyCandidateType({ title: "C-Dogs SDL port", body: "native build" })).toBe("port");
  });

  it("keeps question posts out of the candidate queue", () => {
    const result = classify({
      title: "Is it possible to port this game to PS Vita?",
      body: "Would anyone be able to make a port?"
    });
    expect(result.accept).toBe(false);
    expect(result.reason).toContain("question");
  });

  it("rejects promotional spam even when it mentions the Vita", () => {
    const result = classify({
      title: "Free crypto giveaway for Vita users",
      body: "Click here for a referral code and free money."
    });
    expect(result.accept).toBe(false);
    expect(result.reason).toContain("spam");
  });
});
