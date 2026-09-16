import type {
  Update,
  UpdateSource,
  ObservationType,
  DevelopmentStage,
  ProjectLifecycle,
  VerificationLevel
} from "../../shared/types";
import { generateId } from "../../shared/utils";

export interface CreateUpdateInput {
  id?: string;
  port_project_id: number;
  developer_id?: number | null;
  event_type: ObservationType;
  title: string;
  summary: string;
  event_at: Date;
  verification_level?: VerificationLevel;
  stage_before?: DevelopmentStage | null;
  stage_after?: DevelopmentStage | null;
  lifecycle_before?: ProjectLifecycle | null;
  lifecycle_after?: ProjectLifecycle | null;
  published?: boolean;
}

export class UpdatesRepository {
  constructor(private db: D1Database) {}

  async findById(id: string): Promise<Update | null> {
    const row = await this.db
      .prepare("SELECT * FROM updates WHERE id = ?")
      .bind(id)
      .first<Record<string, unknown>>();
    return row ? this.mapRow(row) : null;
  }

  async findByProject(projectId: number, publishedOnly = true): Promise<Update[]> {
    const query = publishedOnly
      ? "SELECT * FROM updates WHERE port_project_id = ? AND published = 1 AND source_removed = 0 ORDER BY event_at DESC"
      : "SELECT * FROM updates WHERE port_project_id = ? ORDER BY event_at DESC";
    const rows = await this.db.prepare(query).bind(projectId).all<Record<string, unknown>>();
    return (rows.results || []).map((r) => this.mapRow(r));
  }

  async listRecent(limit = 20, offset = 0, publishedOnly = true): Promise<Update[]> {
    const query = publishedOnly
      ? "SELECT * FROM updates WHERE published = 1 AND source_removed = 0 ORDER BY event_at DESC LIMIT ? OFFSET ?"
      : "SELECT * FROM updates ORDER BY event_at DESC LIMIT ? OFFSET ?";
    const rows = await this.db.prepare(query).bind(limit, offset).all<Record<string, unknown>>();
    return (rows.results || []).map((r) => this.mapRow(r));
  }

  async create(input: CreateUpdateInput): Promise<Update> {
    const id = input.id || generateId();
    const now = new Date().toISOString();
    const eventAt = input.event_at.toISOString();
    const verLevel = input.verification_level ?? "unverified";
    const published = input.published ? 1 : 0;

    await this.db
      .prepare(
        `INSERT INTO updates (
          id, port_project_id, developer_id, event_type, title, summary,
          event_at, verification_level, stage_before, stage_after,
          lifecycle_before, lifecycle_after, published, source_removed,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)`
      )
      .bind(
        id,
        input.port_project_id,
        input.developer_id ?? null,
        input.event_type,
        input.title.trim(),
        input.summary.trim(),
        eventAt,
        verLevel,
        input.stage_before ?? null,
        input.stage_after ?? null,
        input.lifecycle_before ?? null,
        input.lifecycle_after ?? null,
        published,
        now,
        now
      )
      .run();

    return {
      id,
      port_project_id: input.port_project_id,
      developer_id: input.developer_id ?? null,
      event_type: input.event_type,
      title: input.title.trim(),
      summary: input.summary.trim(),
      event_at: input.event_at,
      verification_level: verLevel,
      stage_before: input.stage_before ?? null,
      stage_after: input.stage_after ?? null,
      lifecycle_before: input.lifecycle_before ?? null,
      lifecycle_after: input.lifecycle_after ?? null,
      published: Boolean(input.published),
      source_removed: false,
      created_at: new Date(now),
      updated_at: new Date(now)
    };
  }

  async linkSource(updateId: string, sourceItemId: string, relationship = "primary"): Promise<UpdateSource> {
    const now = new Date().toISOString();
    await this.db
      .prepare(
        `INSERT OR REPLACE INTO update_sources (update_id, source_item_id, relationship, created_at)
         VALUES (?, ?, ?, ?)`
      )
      .bind(updateId, sourceItemId, relationship, now)
      .run();

    return {
      update_id: updateId,
      source_item_id: sourceItemId,
      relationship,
      created_at: new Date(now)
    };
  }

  async getSourcesForUpdate(updateId: string): Promise<UpdateSource[]> {
    const rows = await this.db
      .prepare("SELECT * FROM update_sources WHERE update_id = ?")
      .bind(updateId)
      .all<Record<string, unknown>>();
    return (rows.results || []).map((r) => ({
      update_id: String(r.update_id),
      source_item_id: String(r.source_item_id),
      relationship: String(r.relationship),
      created_at: new Date(String(r.created_at))
    }));
  }

  async markSourceRemoved(id: string): Promise<void> {
    const now = new Date().toISOString();
    await this.db
      .prepare("UPDATE updates SET source_removed = 1, updated_at = ? WHERE id = ?")
      .bind(now, id)
      .run();
  }

  private mapRow(row: Record<string, unknown>): Update {
    return {
      id: String(row.id),
      port_project_id: Number(row.port_project_id),
      developer_id: row.developer_id ? Number(row.developer_id) : null,
      event_type: String(row.event_type) as ObservationType,
      title: String(row.title),
      summary: String(row.summary),
      event_at: new Date(String(row.event_at)),
      verification_level: String(row.verification_level) as VerificationLevel,
      stage_before: row.stage_before ? (String(row.stage_before) as DevelopmentStage) : null,
      stage_after: row.stage_after ? (String(row.stage_after) as DevelopmentStage) : null,
      lifecycle_before: row.lifecycle_before ? (String(row.lifecycle_before) as ProjectLifecycle) : null,
      lifecycle_after: row.lifecycle_after ? (String(row.lifecycle_after) as ProjectLifecycle) : null,
      published: Boolean(row.published),
      source_removed: Boolean(row.source_removed),
      created_at: new Date(String(row.created_at)),
      updated_at: new Date(String(row.updated_at))
    };
  }
}

