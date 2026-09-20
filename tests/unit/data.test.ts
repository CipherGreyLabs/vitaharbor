import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import {
  FALLBACK_PROJECTS,
  FALLBACK_UPDATES,
  FALLBACK_GAMES,
  FALLBACK_DEVELOPERS
} from "../../src/shared/constants/fallbackData";

const STAGES = [
  "announced",
  "research",
  "early_wip",
  "booting",
  "in_game",
  "playable",
  "completable",
  "released"
];

const parse = (value: unknown) => new Date(String(value));

describe("ledger data integrity", () => {
  it("keeps project ids and slugs unique", () => {
    const ids = FALLBACK_PROJECTS.map((p) => p.id);
    const slugs = FALLBACK_PROJECTS.map((p) => p.slug);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("gives every project the fields the interface renders", () => {
    for (const project of FALLBACK_PROJECTS) {
      expect(project.slug, "slug").toBeTruthy();
      expect(project.display_name, project.slug + " display_name").toBeTruthy();
      expect(project.summary, project.slug + " summary").toBeTruthy();
      expect(STAGES, project.slug + " stage").toContain(project.current_stage);
    }
  });

  it("does not expose unverified Reddit targets as valid project links", () => {
    const intentionallyUnlinked = new Set([
      "portal-vita",
      "spider-man-total-mayhem-vita",
      "simpsons-hit-and-run-vita",
      "kotor-vita",
      "baldurs-gate-dark-alliance-vita",
      "slingshot-racing-vita",
      "fallout-2-ce-vita",
      "render96-sm64-hd-vita",
      "celeste-classic-vita",
      "cave-story-evo-vita",
      "nfs-hot-pursuit-vita",
      "call-of-duty-4-vita"
    ]);
    for (const project of FALLBACK_PROJECTS) {
      if (intentionallyUnlinked.has(project.slug)) {
        expect(project.reddit_url, project.slug + " reddit_url").toBeUndefined();
      } else {
        expect(project.reddit_url, project.slug + " reddit_url").toMatch(
          /^https:\/\/(www\.)?reddit\.com\/r\/[A-Za-z0-9_]+\//
        );
      }
    }
  });

  it("stores absolute dates that have already happened", () => {
    const ceiling = Date.now() + 60_000;
    for (const project of FALLBACK_PROJECTS) {
      for (const field of ["first_seen_at", "last_activity_at"]) {
        const value = parse(project[field]);
        expect(Number.isNaN(value.getTime()), project.slug + " " + field).toBe(false);
        expect(value.getTime(), project.slug + " " + field + " is in the future").toBeLessThan(ceiling);
      }
      expect(parse(project.first_seen_at).getTime()).toBeLessThanOrEqual(
        parse(project.last_activity_at).getTime()
      );
    }
  });

  it("never derives timestamps from the clock at render time", () => {
    const source = readFileSync(
      path.resolve(__dirname, "../../src/shared/constants/fallbackData.ts"),
      "utf8"
    );
    expect(source.includes("Date.now(")).toBe(false);
  });

  it("links every update to a project that exists", () => {
    const slugs = new Set(FALLBACK_PROJECTS.map((p) => p.slug));
    const intentionallyUnlinked = new Set(["upd_spiderman", "upd_portal", "upd_nfs", "upd_cod4"]);
    for (const update of FALLBACK_UPDATES) {
      expect(slugs, update.id + " project_slug").toContain(update.project_slug);
      if (intentionallyUnlinked.has(update.id)) {
        expect(update.sources, update.id + " sources").toEqual([]);
      } else {
        expect(update.sources?.length, update.id + " sources").toBeGreaterThan(0);
        expect(update.sources[0].canonical_url).toMatch(/reddit\.com/);
      }
    }
  });

  it("keeps games and developers addressable", () => {
    const gameIds = FALLBACK_GAMES.map((g) => g.id);
    expect(new Set(gameIds).size).toBe(gameIds.length);
    const developerSlugs = FALLBACK_DEVELOPERS.map((d) => d.slug);
    expect(new Set(developerSlugs).size).toBe(developerSlugs.length);
  });
});
