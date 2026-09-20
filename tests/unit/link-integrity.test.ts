import { describe, expect, it } from "vitest";
import { FALLBACK_PROJECTS, FALLBACK_UPDATES } from "../../src/shared/constants/fallbackData";
import { KNOWN_REPOS } from "../../src/web/components/ledger/types";

function assertHttpUrl(value: string) {
  expect(() => new URL(value)).not.toThrow();
  expect(value).toMatch(/^https?:\/\//);
}

describe("public link integrity", () => {
  it("does not expose generic Reddit searches as project or update sources", () => {
    const projectUrls = FALLBACK_PROJECTS
      .map((project) => project.reddit_url)
      .filter(Boolean);
    const updateUrls = FALLBACK_UPDATES.flatMap((update) =>
      (update.sources || []).map((source: { canonical_url?: string }) => source.canonical_url)
    ).filter(Boolean);

    [...projectUrls, ...updateUrls].forEach((url) => {
      assertHttpUrl(url);
      expect(url).not.toContain("/search/");
    });
  });

  it("uses project-specific repositories where direct evidence exists", () => {
    expect(KNOWN_REPOS["openmohaa-vita"]).toBe("https://github.com/HenryKun55/openmohaa/tree/vita-port");
    expect(KNOWN_REPOS["smash-melee-vita"]).toBe("https://github.com/robin994/SmashMeleeVita");
    expect(KNOWN_REPOS["hollow-knight-vita"]).toBe("https://github.com/PatnosDD/Hollow-Knight-PsVita");
    expect(KNOWN_REPOS["renpy-8-runtime-engine"]).toBe("https://github.com/Grimiku/RenPy-Vita-8");
    expect(KNOWN_REPOS["portal-vita"]).toBeUndefined();
    expect(KNOWN_REPOS["zelda-ship-of-harkinian-vita"]).toBeUndefined();
    expect(KNOWN_REPOS["fallout-2-ce-vita"]).toBeUndefined();
    expect(KNOWN_REPOS["cave-story-evo-vita"]).toBeUndefined();
    expect(KNOWN_REPOS["render96-sm64-hd-vita"]).toBeUndefined();
    expect(KNOWN_REPOS["celeste-classic-vita"]).toBeUndefined();
  });

  it("keeps removed or wrong targets unlinked instead of replacing them with guesses", () => {
    const withoutOutboundReddit = new Set([
      "portal-vita",
      "spider-man-total-mayhem-vita",
      "simpsons-hit-and-run-vita",
      "kotor-vita",
      "baldurs-gate-dark-alliance-vita",
      "slingshot-racing-vita",
      "fallout-2-ce-vita",
      "render96-sm64-hd-vita",
      "celeste-classic-vita",
      "cave-story-evo-vita"
    ]);

    FALLBACK_PROJECTS
      .filter((project) => withoutOutboundReddit.has(project.slug))
      .forEach((project) => expect(project.reddit_url).toBeUndefined());

    expect(FALLBACK_UPDATES.find((update) => update.id === "upd_spiderman")?.sources).toEqual([]);
    expect(FALLBACK_UPDATES.find((update) => update.id === "upd_portal")?.sources).toEqual([]);
    expect(FALLBACK_PROJECTS.find((project) => project.slug === "nfs-hot-pursuit-vita")?.reddit_url).toBeUndefined();
    expect(FALLBACK_PROJECTS.find((project) => project.slug === "call-of-duty-4-vita")?.reddit_url).toBeUndefined();
    expect(FALLBACK_PROJECTS.find((project) => project.slug === "call-of-duty-4-vita")?.screenshot_source_url).toBeUndefined();
    expect(FALLBACK_UPDATES.find((update) => update.id === "upd_nfs")?.sources).toEqual([]);
    expect(FALLBACK_UPDATES.find((update) => update.id === "upd_cod4")?.sources).toEqual([]);
  });
});
