import type { RelationshipType } from "../../shared/types";

export interface ProjectRelationRecord {
  id: number;
  source_project_id: number;
  target_project_id: number;
  relationship_type: RelationshipType;
  created_at: Date;
}

export class ProjectRelationsRepository {
  constructor(private db: D1Database) {}

  async link(
    sourceProjectId: number,
    targetProjectId: number,
    relationshipType: RelationshipType
  ): Promise<ProjectRelationRecord> {
    const now = new Date().toISOString();
    const result = await this.db
      .prepare(
        `INSERT INTO project_relations (source_project_id, target_project_id, relationship_type, created_at)
         VALUES (?, ?, ?, ?)`
      )
      .bind(sourceProjectId, targetProjectId, relationshipType, now)
      .run();

    const id = Number(result.meta.last_row_id);
    return {
      id,
      source_project_id: sourceProjectId,
      target_project_id: targetProjectId,
      relationship_type: relationshipType,
      created_at: new Date(now)
    };
  }

  async findByProject(projectId: number): Promise<ProjectRelationRecord[]> {
    const rows = await this.db
      .prepare(
        `SELECT * FROM project_relations
         WHERE source_project_id = ? OR target_project_id = ?`
      )
      .bind(projectId, projectId)
      .all<Record<string, unknown>>();
    return (rows.results || []).map((r) => ({
      id: Number(r.id),
      source_project_id: Number(r.source_project_id),
      target_project_id: Number(r.target_project_id),
      relationship_type: String(r.relationship_type) as RelationshipType,
      created_at: new Date(String(r.created_at))
    }));
  }
}

