import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { FALLBACK_PROJECTS } from "../../src/shared/constants/fallbackData";

describe("project screenshot evidence", () => {
  const bySlug = new Map(FALLBACK_PROJECTS.map((project) => [project.slug, project]));

  it("does not reuse known mismatched or non-Vita artwork as gameplay", () => {
    for (const slug of [
      "renpy-8-runtime-engine",
      "render96-sm64-hd-vita",
      "nfs-hot-pursuit-vita",
      "real-racing-2-vita",
      "cod-zombies-ios-loader"
    ]) {
      expect(bySlug.get(slug)?.screenshot_url).toBeUndefined();
    }
  });

  it("keeps an image only when its source URL is recorded", () => {
    const projectsWithImages = FALLBACK_PROJECTS.filter((project) => project.screenshot_url);
    expect(projectsWithImages.map((project) => project.slug).sort()).toEqual([
      "halo-ce-vita",
      "rc-cars-vita"
    ]);
    for (const project of projectsWithImages) {
      expect(project.screenshot_source_url).toMatch(/^https:\/\//);
      expect(project.screenshot_alt).toBeTruthy();
    }
  });

  it("uses the official Vita project screenshot and release source for Halo", () => {
    const halo = bySlug.get("halo-ce-vita");
    expect(halo?.repo_url).toBe("https://github.com/BirchWoodGod/halo-ce-vita");
    expect(halo?.screenshot_url).toContain("/docs/screenshots/warthog-beach.png");
    expect(halo?.screenshot_source_url).toBe("https://github.com/BirchWoodGod/halo-ce-vita/blob/main/README.md");
    expect(halo?.released_at?.toISOString()).toBe("2026-10-02T01:36:54.000Z");
    expect(halo?.last_activity_at?.toISOString()).toBe("2026-10-06T22:49:53.000Z");
  });

  it("provides a verified standalone media manifest covering all 28 projects", () => {
    const manifestPath = path.resolve(process.cwd(), "data/media-manifest.json");
    expect(fs.existsSync(manifestPath)).toBe(true);
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    expect(manifest.schema_version).toBe(1);
    expect(manifest.total_projects).toBe(FALLBACK_PROJECTS.length);
    expect(manifest.items.length).toBe(FALLBACK_PROJECTS.length);
    for (const item of manifest.items) {
      expect(item.id).toBeDefined();
      expect(item.slug).toBeDefined();
      expect(item.media_label).toBeTruthy();
      expect(item.provenance_notes).toBeTruthy();
    }
  });
});