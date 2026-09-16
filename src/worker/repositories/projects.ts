import type { PortProject, DevelopmentStage, ProjectLifecycle } from "../../shared/types";
import { normalizeSlug } from "../../shared/utils";

export interface CreateProjectInput {
  game_id: number;
  slug?: string;
  display_name?: string | null;
  current_stage?: DevelopmentStage;
  lifecycle?: ProjectLifecycle;
  summary?: string;
  playability_notes?: string | null;
  performance_notes?: string | null;
  first_seen_at?: Date;
  last_activity_at?: Date;
  released_at?: Date | null;
  is_featured?: boolean;
}

export interface UpdateProjectInput {
  display_name?: string | null;
  current_stage?: DevelopmentStage;
  lifecycle?: ProjectLifecycle;
  summary?: string;
  playability_notes?: string | null;
  performance_notes?: string | null;
  last_activity_at?: Date;
  released_at?: Date | null;
  is_featured?: boolean;
  is_archived?: boolean;
}

export interface ListProjectsFilter {
  stage?: DevelopmentStage;
  lifecycle?: ProjectLifecycle;
  search?: string;
  is_featured?: boolean;
  is_archived?: boolean;
  limit?: number;
  offset?: number;
}

export class ProjectsRepository {
  constructor(private db: D1Database) {}

  async findById(id: number): Promise<PortProject | null> {
    const row = await this.db
      .prepare("SELECT * FROM port_projects WHERE id = ?")
      .bind(id)
      .first<Record<string, unknown>>();
    return row ? this.mapRowToProject(row) : null;
  }

  async findBySlug(slug: string): Promise<PortProject | null> {
    const row = await this.db
      .prepare("SELECT * FROM port_projects WHERE slug = ?")
      .bind(slug)
      .first<Record<string, unknown>>();
    return row ? this.mapRowToProject(row) : null;
  }

  async create(input: CreateProjectInput): Promise<PortProject> {
    const slug = input.slug || normalizeSlug(input.display_name || `project-${input.game_id}`);
    const now = new Date().toISOString();
    const firstSeen = (input.first_seen_at || new Date()).toISOString();
    const lastActivity = (input.last_activity_at || new Date()).toISOString();
    const releasedAt = input.released_at ? input.released_at.toISOString() : null;

    const result = await this.db
      .prepare(
        `INSERT INTO port_projects (
          game_id, slug, display_name, current_stage, lifecycle, summary,
          playability_notes, performance_notes, first_seen_at, last_activity_at,
          released_at, is_featured, is_archived, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)`
      )
      .bind(
        input.game_id,
        slug,
        input.display_name ?? null,
        input.current_stage ?? "announced",
        input.lifecycle ?? "active",
        input.summary ?? "",
        input.playability_notes ?? null,
        input.performance_notes ?? null,
        firstSeen,
        lastActivity,
        releasedAt,
        input.is_featured ? 1 : 0,
        now,
        now
      )
      .run();

    const id = Number(result.meta.last_row_id);
    return {
      id,
      game_id: input.game_id,
      slug,
      display_name: input.display_name ?? null,
      current_stage: input.current_stage ?? "announced",
      lifecycle: input.lifecycle ?? "active",
      summary: input.summary ?? "",
      playability_notes: input.playability_notes ?? null,
      performance_notes: input.performance_notes ?? null,
      first_seen_at: new Date(firstSeen),
      last_activity_at: new Date(lastActivity),
      released_at: input.released_at ?? null,
      is_featured: Boolean(input.is_featured),
      is_archived: false,
      created_at: new Date(now),
      updated_at: new Date(now)
    };
  }

  async update(id: number, input: UpdateProjectInput): Promise<PortProject | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    const now = new Date().toISOString();
    const currentStage = input.current_stage ?? existing.current_stage;
    const lifecycle = input.lifecycle ?? existing.lifecycle;
    const displayName = input.display_name !== undefined ? input.display_name : existing.display_name;
    const summary = input.summary !== undefined ? input.summary : existing.summary;
    const playabilityNotes = input.playability_notes !== undefined ? input.playability_notes : existing.playability_notes;
    const performanceNotes = input.performance_notes !== undefined ? input.performance_notes : existing.performance_notes;
    const lastActivity = input.last_activity_at ? input.last_activity_at.toISOString() : existing.last_activity_at.toISOString();
    const releasedAt = input.released_at !== undefined ? (input.released_at ? input.released_at.toISOString() : null) : (existing.released_at ? existing.released_at.toISOString() : null);
    const isFeatured = input.is_featured !== undefined ? (input.is_featured ? 1 : 0) : (existing.is_featured ? 1 : 0);
    const isArchived = input.is_archived !== undefined ? (input.is_archived ? 1 : 0) : (existing.is_archived ? 1 : 0);

    await this.db
      .prepare(
        `UPDATE port_projects SET
          display_name = ?, current_stage = ?, lifecycle = ?, summary = ?,
          playability_notes = ?, performance_notes = ?, last_activity_at = ?,
          released_at = ?, is_featured = ?, is_archived = ?, updated_at = ?
         WHERE id = ?`
      )
      .bind(
        displayName,
        currentStage,
        lifecycle,
        summary,
        playabilityNotes,
        performanceNotes,
        lastActivity,
        releasedAt,
        isFeatured,
        isArchived,
        now,
        id
      )
      .run();

    return this.findById(id);
  }

  async list(filter: ListProjectsFilter = {}): Promise<PortProject[]> {
    const conditions: string[] = ["is_archived = ?"];
    const bindings: (string | number)[] = [filter.is_archived ? 1 : 0];

    if (filter.stage) {
      conditions.push("current_stage = ?");
      bindings.push(filter.stage);
    }
    if (filter.lifecycle) {
      conditions.push("lifecycle = ?");
      bindings.push(filter.lifecycle);
    }
    if (filter.is_featured !== undefined) {
      conditions.push("is_featured = ?");
      bindings.push(filter.is_featured ? 1 : 0);
    }
    if (filter.search) {
      conditions.push("(display_name LIKE ? OR slug LIKE ?)");
      const term = `%${filter.search}%`;
      bindings.push(term, term);
    }

    const limit = filter.limit ?? 20;
    const offset = filter.offset ?? 0;
    bindings.push(limit, offset);

    const query = `SELECT * FROM port_projects WHERE ${conditions.join(" AND ")} ORDER BY last_activity_at DESC LIMIT ? OFFSET ?`;
    const rows = await this.db.prepare(query).bind(...bindings).all<Record<string, unknown>>();

    return (rows.results || []).map((r) => this.mapRowToProject(r));
  }

  private mapRowToProject(row: Record<string, unknown>): PortProject {
    return {
      id: Number(row.id),
      game_id: Number(row.game_id),
      slug: String(row.slug),
      display_name: row.display_name ? String(row.display_name) : null,
      current_stage: String(row.current_stage) as DevelopmentStage,
      lifecycle: String(row.lifecycle) as ProjectLifecycle,
      summary: String(row.summary || ""),
      playability_notes: row.playability_notes ? String(row.playability_notes) : null,
      performance_notes: row.performance_notes ? String(row.performance_notes) : null,
      first_seen_at: new Date(String(row.first_seen_at)),
      last_activity_at: new Date(String(row.last_activity_at)),
      released_at: row.released_at ? new Date(String(row.released_at)) : null,
      is_featured: Boolean(row.is_featured),
      is_archived: Boolean(row.is_archived),
      created_at: new Date(String(row.created_at)),
      updated_at: new Date(String(row.updated_at))
    };
  }
}

