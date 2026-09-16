import type { DevelopmentStage } from "../../shared/types";

export interface StageHistoryEntry {
  id: number;
  port_project_id: number;
  stage: DevelopmentStage;
  effective_at: Date;
  source_update_id?: number | null;
  reason?: string | null;
  created_at: Date;
}

export class StageHistoryRepository {
  constructor(private db: D1Database) {}

  async recordTransition(
    projectId: number,
    stage: DevelopmentStage,
    effectiveAt: Date = new Date(),
    reason?: string | null,
    sourceUpdateId?: number | null
  ): Promise<StageHistoryEntry> {
    const now = new Date().toISOString();
    const effective = effectiveAt.toISOString();

    const result = await this.db
      .prepare(
        `INSERT INTO project_stage_history (port_project_id, stage, effective_at, source_update_id, reason, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
      .bind(projectId, stage, effective, sourceUpdateId ?? null, reason ?? null, now)
      .run();

    const id = Number(result.meta.last_row_id);
    return {
      id,
      port_project_id: projectId,
      stage,
      effective_at: effectiveAt,
      source_update_id: sourceUpdateId ?? null,
      reason: reason ?? null,
      created_at: new Date(now)
    };
  }

  async findByProject(projectId: number): Promise<StageHistoryEntry[]> {
    const rows = await this.db
      .prepare("SELECT * FROM project_stage_history WHERE port_project_id = ? ORDER BY effective_at ASC")
      .bind(projectId)
      .all<Record<string, unknown>>();
    return (rows.results || []).map((r) => ({
      id: Number(r.id),
      port_project_id: Number(r.port_project_id),
      stage: String(r.stage) as DevelopmentStage,
      effective_at: new Date(String(r.effective_at)),
      source_update_id: r.source_update_id ? Number(r.source_update_id) : null,
      reason: r.reason ? String(r.reason) : null,
      created_at: new Date(String(r.created_at))
    }));
  }
}

