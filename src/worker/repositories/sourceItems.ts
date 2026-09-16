import type { SourceItem, SourceType, ItemType } from "../../shared/types";
import { generateId } from "../../shared/utils";

export interface CreateSourceItemInput {
  id?: string;
  source_type?: SourceType;
  external_id: string;
  external_fullname?: string | null;
  item_type: ItemType;
  canonical_url: string;
  community?: string | null;
  author_external_id?: string | null;
  author_username?: string | null;
  parent_external_id?: string | null;
  root_thread_external_id?: string | null;
  source_created_at: Date;
  source_edited_at?: Date | null;
  content_hash?: string | null;
  raw_expires_at?: Date | null;
}

export class SourceItemsRepository {
  constructor(private db: D1Database) {}

  async findById(id: string): Promise<SourceItem | null> {
    const row = await this.db
      .prepare("SELECT * FROM source_items WHERE id = ?")
      .bind(id)
      .first<Record<string, unknown>>();
    return row ? this.mapRow(row) : null;
  }

  async findByExternalId(sourceType: SourceType, externalId: string): Promise<SourceItem | null> {
    const row = await this.db
      .prepare("SELECT * FROM source_items WHERE source_type = ? AND external_id = ?")
      .bind(sourceType, externalId)
      .first<Record<string, unknown>>();
    return row ? this.mapRow(row) : null;
  }

  async create(input: CreateSourceItemInput): Promise<SourceItem> {
    const id = input.id || generateId();
    const now = new Date().toISOString();
    const sourceType = input.source_type || "reddit";
    const srcCreatedAt = input.source_created_at.toISOString();
    const srcEditedAt = input.source_edited_at ? input.source_edited_at.toISOString() : null;
    const rawExpiresAt = input.raw_expires_at ? input.raw_expires_at.toISOString() : null;

    await this.db
      .prepare(
        `INSERT INTO source_items (
          id, source_type, external_id, external_fullname, item_type,
          canonical_url, community, author_external_id, author_username,
          parent_external_id, root_thread_external_id, source_created_at,
          source_edited_at, content_hash, first_seen_at, last_fetched_at,
          deleted_at, raw_expires_at, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, ?, ?, ?)`
      )
      .bind(
        id,
        sourceType,
        input.external_id,
        input.external_fullname ?? null,
        input.item_type,
        input.canonical_url,
        input.community ?? null,
        input.author_external_id ?? null,
        input.author_username ?? null,
        input.parent_external_id ?? null,
        input.root_thread_external_id ?? null,
        srcCreatedAt,
        srcEditedAt,
        input.content_hash ?? null,
        now,
        now,
        rawExpiresAt,
        now,
        now
      )
      .run();

    return {
      id,
      source_type: sourceType,
      external_id: input.external_id,
      external_fullname: input.external_fullname ?? null,
      item_type: input.item_type,
      canonical_url: input.canonical_url,
      community: input.community ?? "",
      author_external_id: input.author_external_id ?? null,
      author_username: input.author_username ?? null,
      parent_external_id: input.parent_external_id ?? null,
      root_thread_external_id: input.root_thread_external_id ?? null,
      source_created_at: input.source_created_at,
      source_edited_at: input.source_edited_at ?? null,
      content_hash: input.content_hash ?? null,
      first_seen_at: new Date(now),
      last_fetched_at: new Date(now),
      deleted_at: null,
      raw_expires_at: input.raw_expires_at ?? null,
      created_at: new Date(now),
      updated_at: new Date(now)
    };
  }

  async markDeleted(id: string, deletedAt: Date = new Date()): Promise<void> {
    const now = new Date().toISOString();
    await this.db
      .prepare(
        `UPDATE source_items SET
          deleted_at = ?, content_hash = NULL, updated_at = ?
         WHERE id = ?`
      )
      .bind(deletedAt.toISOString(), now, id)
      .run();
  }

  async updateLastFetched(id: string, date: Date = new Date()): Promise<void> {
    const now = date.toISOString();
    await this.db
      .prepare("UPDATE source_items SET last_fetched_at = ?, updated_at = ? WHERE id = ?")
      .bind(now, now, id)
      .run();
  }

  async listExpiredRaw(now: Date = new Date()): Promise<SourceItem[]> {
    const rows = await this.db
      .prepare("SELECT * FROM source_items WHERE raw_expires_at IS NOT NULL AND raw_expires_at <= ? AND deleted_at IS NULL")
      .bind(now.toISOString())
      .all<Record<string, unknown>>();
    return (rows.results || []).map((r) => this.mapRow(r));
  }

  private mapRow(row: Record<string, unknown>): SourceItem {
    return {
      id: String(row.id),
      source_type: String(row.source_type) as SourceType,
      external_id: String(row.external_id),
      external_fullname: row.external_fullname ? String(row.external_fullname) : null,
      item_type: String(row.item_type) as ItemType,
      canonical_url: String(row.canonical_url),
      community: String(row.community || ""),
      author_external_id: row.author_external_id ? String(row.author_external_id) : null,
      author_username: row.author_username ? String(row.author_username) : null,
      parent_external_id: row.parent_external_id ? String(row.parent_external_id) : null,
      root_thread_external_id: row.root_thread_external_id ? String(row.root_thread_external_id) : null,
      source_created_at: new Date(String(row.source_created_at)),
      source_edited_at: row.source_edited_at ? new Date(String(row.source_edited_at)) : null,
      content_hash: row.content_hash ? String(row.content_hash) : null,
      first_seen_at: new Date(String(row.first_seen_at)),
      last_fetched_at: new Date(String(row.last_fetched_at)),
      deleted_at: row.deleted_at ? new Date(String(row.deleted_at)) : null,
      raw_expires_at: row.raw_expires_at ? new Date(String(row.raw_expires_at)) : null,
      created_at: new Date(String(row.created_at)),
      updated_at: new Date(String(row.updated_at))
    };
  }
}

