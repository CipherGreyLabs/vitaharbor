import type { Developer } from "../../shared/types";
import { normalizeSlug } from "../../shared/utils";

export interface CreateDeveloperInput {
  display_name: string;
  slug?: string;
  description?: string | null;
  is_known_developer?: boolean;
}

export class DevelopersRepository {
  constructor(private db: D1Database) {}

  async findById(id: number): Promise<Developer | null> {
    const row = await this.db
      .prepare("SELECT * FROM developers WHERE id = ?")
      .bind(id)
      .first<Record<string, unknown>>();
    return row ? this.mapRow(row) : null;
  }

  async findBySlug(slug: string): Promise<Developer | null> {
    const row = await this.db
      .prepare("SELECT * FROM developers WHERE slug = ?")
      .bind(slug)
      .first<Record<string, unknown>>();
    return row ? this.mapRow(row) : null;
  }

  async create(input: CreateDeveloperInput): Promise<Developer> {
    const slug = input.slug || normalizeSlug(input.display_name);
    const now = new Date().toISOString();

    const result = await this.db
      .prepare(
        `INSERT INTO developers (slug, display_name, description, is_known_developer, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
      .bind(
        slug,
        input.display_name.trim(),
        input.description?.trim() ?? null,
        input.is_known_developer ? 1 : 0,
        now,
        now
      )
      .run();

    const id = Number(result.meta.last_row_id);
    return {
      id,
      slug,
      display_name: input.display_name.trim(),
      description: input.description?.trim() ?? null,
      is_known_developer: Boolean(input.is_known_developer),
      created_at: new Date(now),
      updated_at: new Date(now)
    };
  }

  async list(limit = 50, offset = 0): Promise<Developer[]> {
    const rows = await this.db
      .prepare("SELECT * FROM developers ORDER BY display_name ASC LIMIT ? OFFSET ?")
      .bind(limit, offset)
      .all<Record<string, unknown>>();
    return (rows.results || []).map((r) => this.mapRow(r));
  }

  private mapRow(row: Record<string, unknown>): Developer {
    return {
      id: Number(row.id),
      slug: String(row.slug),
      display_name: String(row.display_name),
      description: row.description ? String(row.description) : null,
      is_known_developer: Boolean(row.is_known_developer),
      created_at: new Date(String(row.created_at)),
      updated_at: new Date(String(row.updated_at))
    };
  }
}

