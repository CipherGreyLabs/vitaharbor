import type { ProjectAlias } from "../../shared/types";
import { normalizeTitle } from "../../shared/utils";

export class ProjectAliasesRepository {
  constructor(private db: D1Database) {}

  async addAlias(projectId: number, alias: string, matchStrength = 1, requiresContext = false): Promise<ProjectAlias> {
    const normalized = normalizeTitle(alias);
    const now = new Date().toISOString();

    const result = await this.db
      .prepare(
        `INSERT OR IGNORE INTO project_aliases (port_project_id, alias, normalized_alias, match_strength, requires_context, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
      .bind(projectId, alias.trim(), normalized, matchStrength, requiresContext ? 1 : 0, now)
      .run();

    const id = Number(result.meta.last_row_id);
    return {
      id,
      port_project_id: projectId,
      alias: alias.trim(),
      normalized_alias: normalized,
      match_strength: matchStrength,
      requires_context: requiresContext,
      created_at: new Date(now)
    };
  }

  async findByProject(projectId: number): Promise<ProjectAlias[]> {
    const rows = await this.db
      .prepare("SELECT * FROM project_aliases WHERE port_project_id = ?")
      .bind(projectId)
      .all<Record<string, unknown>>();
    return (rows.results || []).map((r) => ({
      id: Number(r.id),
      port_project_id: Number(r.port_project_id),
      alias: String(r.alias),
      normalized_alias: String(r.normalized_alias),
      match_strength: Number(r.match_strength),
      requires_context: Boolean(r.requires_context),
      created_at: new Date(String(r.created_at))
    }));
  }

  async findMatching(term: string): Promise<ProjectAlias[]> {
    const normalized = normalizeTitle(term);
    const rows = await this.db
      .prepare("SELECT * FROM project_aliases WHERE normalized_alias = ?")
      .bind(normalized)
      .all<Record<string, unknown>>();
    return (rows.results || []).map((r) => ({
      id: Number(r.id),
      port_project_id: Number(r.port_project_id),
      alias: String(r.alias),
      normalized_alias: String(r.normalized_alias),
      match_strength: Number(r.match_strength),
      requires_context: Boolean(r.requires_context),
      created_at: new Date(String(r.created_at))
    }));
  }
}

