import type { Game } from "../../shared/types";
import { normalizeSlug, normalizeTitle } from "../../shared/utils";

export interface CreateGameInput {
  title: string;
  original_release_year?: number | null;
  original_platform?: string | null;
}

export interface UpdateGameInput {
  title?: string;
  original_release_year?: number | null;
  original_platform?: string | null;
}

export class GamesRepository {
  constructor(private db: D1Database) {}

  async findById(id: number): Promise<Game | null> {
    const row = await this.db
      .prepare("SELECT * FROM games WHERE id = ?")
      .bind(id)
      .first<Record<string, unknown>>();
    return row ? this.mapRowToGame(row) : null;
  }

  async findBySlug(slug: string): Promise<Game | null> {
    const row = await this.db
      .prepare("SELECT * FROM games WHERE slug = ?")
      .bind(slug)
      .first<Record<string, unknown>>();
    return row ? this.mapRowToGame(row) : null;
  }

  async create(input: CreateGameInput): Promise<Game> {
    const slug = normalizeSlug(input.title);
    const normalizedTitle = normalizeTitle(input.title);
    const now = new Date().toISOString();

    const result = await this.db
      .prepare(
        `INSERT INTO games (slug, title, normalized_title, original_release_year, original_platform, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        slug,
        input.title.trim(),
        normalizedTitle,
        input.original_release_year ?? null,
        input.original_platform?.trim() ?? null,
        now,
        now
      )
      .run();

    const id = Number(result.meta.last_row_id);
    return {
      id,
      slug,
      title: input.title.trim(),
      normalized_title: normalizedTitle,
      original_release_year: input.original_release_year ?? null,
      original_platform: input.original_platform?.trim() ?? null,
      created_at: new Date(now),
      updated_at: new Date(now)
    };
  }

  async list(limit = 50, offset = 0): Promise<Game[]> {
    const rows = await this.db
      .prepare("SELECT * FROM games ORDER BY title ASC LIMIT ? OFFSET ?")
      .bind(limit, offset)
      .all<Record<string, unknown>>();
    return (rows.results || []).map((r) => this.mapRowToGame(r));
  }

  private mapRowToGame(row: Record<string, unknown>): Game {
    return {
      id: Number(row.id),
      slug: String(row.slug),
      title: String(row.title),
      normalized_title: String(row.normalized_title),
      original_release_year: row.original_release_year ? Number(row.original_release_year) : null,
      original_platform: row.original_platform ? String(row.original_platform) : null,
      created_at: new Date(String(row.created_at)),
      updated_at: new Date(String(row.updated_at))
    };
  }
}

