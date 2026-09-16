export interface TechnologyRecord {
  id: number;
  name: string;
}

export class TechnologiesRepository {
  constructor(private db: D1Database) {}

  async getOrCreate(name: string): Promise<TechnologyRecord> {
    const trimmed = name.trim();
    const existing = await this.db
      .prepare("SELECT * FROM technologies WHERE LOWER(name) = LOWER(?)")
      .bind(trimmed)
      .first<Record<string, unknown>>();

    if (existing) {
      return { id: Number(existing.id), name: String(existing.name) };
    }

    const result = await this.db
      .prepare("INSERT INTO technologies (name) VALUES (?)")
      .bind(trimmed)
      .run();

    return { id: Number(result.meta.last_row_id), name: trimmed };
  }

  async linkToProject(projectId: number, technologyId: number): Promise<void> {
    await this.db
      .prepare("INSERT OR IGNORE INTO project_technologies (port_project_id, technology_id) VALUES (?, ?)")
      .bind(projectId, technologyId)
      .run();
  }

  async findByProject(projectId: number): Promise<string[]> {
    const rows = await this.db
      .prepare(
        `SELECT t.name FROM technologies t
         JOIN project_technologies pt ON t.id = pt.technology_id
         WHERE pt.port_project_id = ? ORDER BY t.name ASC`
      )
      .bind(projectId)
      .all<{ name: string }>();
    return (rows.results || []).map((r) => r.name);
  }
}

