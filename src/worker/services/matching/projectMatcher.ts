import type { PortProject, Game, ProjectAlias } from "../../../shared/types";
import { normalizeTitle } from "../../../shared/utils";

export interface ProjectMatchResult {
  projectId: number;
  gameId: number;
  matchedName: string;
  confidence: number;
}

export class ProjectMatcher {
  /**
   * Matches candidate text against a list of projects, games, and aliases using word boundaries.
   */
  match(
    text: string,
    projects: PortProject[],
    games: Game[],
    aliases: ProjectAlias[] = []
  ): ProjectMatchResult | null {
    const normalizedText = normalizeTitle(text);

    // 1. Direct Alias matching
    for (const alias of aliases) {
      const aliasNorm = alias.normalized_alias;
      const regex = new RegExp(`\\b${this.escapeRegex(aliasNorm)}\\b`, "i");
      if (regex.test(normalizedText)) {
        const project = projects.find((p) => p.id === alias.port_project_id);
        if (project) {
          return {
            projectId: project.id,
            gameId: project.game_id,
            matchedName: alias.alias,
            confidence: alias.match_strength === 2 ? 0.95 : 0.8
          };
        }
      }
    }

    // 2. Exact Game title matching
    for (const game of games) {
      if (game.title.length < 3) continue;
      const gameNorm = game.normalized_title;
      const regex = new RegExp(`\\b${this.escapeRegex(gameNorm)}\\b`, "i");
      if (regex.test(normalizedText)) {
        const project = projects.find((p) => p.game_id === game.id);
        if (project) {
          return {
            projectId: project.id,
            gameId: game.id,
            matchedName: game.title,
            confidence: 0.9
          };
        }
      }
    }

    // 3. Project display name matching
    for (const project of projects) {
      if (!project.display_name || project.display_name.length < 3) continue;
      const projNorm = normalizeTitle(project.display_name);
      const regex = new RegExp(`\\b${this.escapeRegex(projNorm)}\\b`, "i");
      if (regex.test(normalizedText)) {
        return {
          projectId: project.id,
          gameId: project.game_id,
          matchedName: project.display_name,
          confidence: 0.85
        };
      }
    }

    return null;
  }

  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^$${}()|[\]\\]/g, "\\$&");
  }
}

