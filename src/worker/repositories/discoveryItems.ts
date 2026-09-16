import type { DiscoveryItem, ModerationStatus } from "../../shared/types";
import { generateId } from "../../shared/utils";

export interface CreateDiscoveryItemInput {
  id?: string;
  source_item_id: string;
  suggested_project_id?: number | null;
  suggested_developer_id?: number | null;
  confidence_score?: number;
  moderation_status?: ModerationStatus;
}

export class DiscoveryItemsRepository {
  constructor(private db: D1Database) {}

  async findById(id: string): Promise<DiscoveryItem | null> {
    const row = await this.db
      .prepare("SELECT * FROM discovery_items WHERE id = ?")
      .bind(id)
      .first<Record<string, unknown>>();
    return row ? this.mapRow(row) : null;
  }

  async create(input: CreateDiscoveryItemInput): Promise<DiscoveryItem> {
    const id = input.id || generateId();
    const now = new Date().toISOString();
    const confidence = input.confidence_score ?? 0.5;
    const status = input.moderation_status ?? "pending";

    await this.db
      .prepare(
        `INSERT INTO discovery_items (
          id, source_item_id, suggested_project_id, suggested_developer_id,
          confidence_score, moderation_status, created_at, reviewed_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, NULL)`
      )
      .bind(
        id,
        input.source_item_id,
        input.suggested_project_id ?? null,
        input.suggested_developer_id ?? null,
        confidence,
        status,
        now
      )
      .run();

    return {
      id,
      source_item_id: input.source_item_id,
      suggested_project_id: input.suggested_project_id ?? null,
      suggested_developer_id: input.suggested_developer_id ?? null,
      confidence_score: confidence,
      moderation_status: status,
      created_at: new Date(now),
      reviewed_at: null
    };
  }

  async listPending(limit = 50, offset = 0): Promise<DiscoveryItem[]> {
    const rows = await this.db
      .prepare("SELECT * FROM discovery_items WHERE moderation_status = 'pending' ORDER BY confidence_score DESC LIMIT ? OFFSET ?")
      .bind(limit, offset)
      .all<Record<string, unknown>>();
    return (rows.results || []).map((r) => this.mapRow(r));
  }

  async updateStatus(id: string, status: ModerationStatus): Promise<void> {
    const now = new Date().toISOString();
    await this.db
      .prepare("UPDATE discovery_items SET moderation_status = ?, reviewed_at = ? WHERE id = ?")
      .bind(status, now, id)
      .run();
  }

  private mapRow(row: Record<string, unknown>): DiscoveryItem {
    return {
      id: String(row.id),
      source_item_id: String(row.source_item_id),
      suggested_project_id: row.suggested_project_id ? Number(row.suggested_project_id) : null,
      suggested_developer_id: row.suggested_developer_id ? Number(row.suggested_developer_id) : null,
      confidence_score: Number(row.confidence_score),
      moderation_status: String(row.moderation_status) as ModerationStatus,
      created_at: new Date(String(row.created_at)),
      reviewed_at: row.reviewed_at ? new Date(String(row.reviewed_at)) : null
    };
  }
}

