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
      "rc-cars-vita"
    ]);
    for (const project of projectsWithImages) {
      expect(project.screenshot_source_url).toMatch(/^https:\/\//);
      expect(project.screenshot_alt).toBeTruthy();
    }
  });

  it("uses verified Vita hardware screenshot source for RC Cars", () => {
    const rcCars = bySlug.get("rc-cars-vita");
    expect(rcCars?.screenshot_url).toBe("/screenshots/rc-cars.webp");
    expect(rcCars?.screenshot_source_url).toBe("https://www.reddit.com/r/vitahacks/comments/1wjn8zg/rc_cars_port_progress/");
  });

  it("provides a verified standalone media manifest covering all active projects", () => {
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