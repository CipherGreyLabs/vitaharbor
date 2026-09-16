import { describe, it, expect } from "vitest";
import { scoreContent } from "../../src/worker/services/discovery/discoveryScorer";
import { ProjectMatcher } from "../../src/worker/services/matching/projectMatcher";
import { DeveloperMatcher } from "../../src/worker/services/matching/developerMatcher";
import type { PortProject, Game, ProjectAlias, DeveloperIdentity } from "../../src/shared/types";

describe("Discovery Scorer", () => {
  it("should detect release signals and suggest released stage", () => {
    const res = scoreContent("[Release] Fallout 2 CE PS Vita port v1.0", "Full port is now available on GitHub with 60fps support.");
    expect(res.isRelevant).toBe(true);
    expect(res.suggestedType).toBe("release");
    expect(res.suggestedStage).toBe("released");
    expect(res.score).toBeGreaterThanOrEqual(0.5);
  });

  it("should detect first boot / WIP signals", () => {
    const res = scoreContent("Diablo II Vita port - First boot achieved!", "Shader translator now loads title screen at 30 fps.");
    expect(res.isRelevant).toBe(true);
    expect(res.suggestedType).toBe("first_boot");
    expect(res.suggestedStage).toBe("booting");
  });

  it("should penalize noise and troubleshooting questions", () => {
    const res = scoreContent("Help me with PKGJ and autoplugin", "How to install battery wallpaper theme on enso 3.65?");
    expect(res.isRelevant).toBe(false);
    expect(res.score).toBeLessThan(0.4);
  });
});

describe("Project Matcher", () => {
  const matcher = new ProjectMatcher();

  const games: Game[] = [
    {
      id: 1,
      slug: "fallout-2",
      title: "Fallout 2",
      normalized_title: "fallout 2",
      original_release_year: 1998,
      original_platform: "PC",
      created_at: new Date(),
      updated_at: new Date()
    }
  ];

  const projects: PortProject[] = [
    {
      id: 10,
      game_id: 1,
      slug: "fallout-2-ce-vita",
      display_name: "Fallout 2 Community Edition",
      current_stage: "playable",
      lifecycle: "active",
      summary: "CE engine port",
      playability_notes: null,
      performance_notes: null,
      first_seen_at: new Date(),
      last_activity_at: new Date(),
      released_at: null,
      is_featured: false,
      is_archived: false,
      created_at: new Date(),
      updated_at: new Date()
    }
  ];

  const aliases: ProjectAlias[] = [
    {
      id: 101,
      port_project_id: 10,
      alias: "FO2 Vita",
      normalized_alias: "fo2 vita",
      match_strength: 2,
      requires_context: false,
      created_at: new Date()
    }
  ];

  it("should match by game title", () => {
    const match = matcher.match("Progress on Fallout 2 port for PlayStation Vita", projects, games, aliases);
    expect(match).not.toBeNull();
    expect(match?.projectId).toBe(10);
    expect(match?.matchedName).toBe("Fallout 2");
  });

  it("should match by alias", () => {
    const match = matcher.match("New build for FO2 Vita is up", projects, games, aliases);
    expect(match).not.toBeNull();
    expect(match?.projectId).toBe(10);
    expect(match?.matchedName).toBe("FO2 Vita");
  });

  it("should not falsely match unrelated titles", () => {
    const match = matcher.match("Custom Vita theme pack released", projects, games, aliases);
    expect(match).toBeNull();
  });
});

describe("Developer Matcher", () => {
  const matcher = new DeveloperMatcher();

  const identities: DeveloperIdentity[] = [
    {
      id: 1,
      developer_id: 77,
      provider: "reddit",
      provider_user_id: "t2_123",
      username: "TheFloW0",
      profile_url: null,
      is_primary: true,
      valid_from: null,
      valid_until: null,
      created_at: new Date(),
      updated_at: new Date()
    }
  ];

  it("should match author case-insensitively", () => {
    const match = matcher.match("theflow0", identities);
    expect(match).not.toBeNull();
    expect(match?.developerId).toBe(77);
  });

  it("should return null for unknown authors", () => {
    const match = matcher.match("random_user_999", identities);
    expect(match).toBeNull();
  });
});

