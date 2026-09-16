import type { ProjectDeveloper, Role } from "../../shared/types";

export class ProjectDevelopersRepository {
  constructor(private db: D1Database) {}

  async link(projectId: number, developerId: number, role: Role = "lead"): Promise<ProjectDeveloper> {
    const now = new Date().toISOString();
    await this.db
      .prepare(
        `INSERT OR REPLACE INTO project_developers (port_project_id, developer_id, role, created_at)
         VALUES (?, ?, ?, ?)`
      )
      .bind(projectId, developerId, role, now)
      .run();

    return {
      port_project_id: projectId,
      developer_id: developerId,
      role,
      created_at: new Date(now)
    };
  }

  async findByProject(projectId: number): Promise<ProjectDeveloper[]> {
    const rows = await this.db
      .prepare("SELECT * FROM project_developers WHERE port_project_id = ?")
      .bind(projectId)
      .all<Record<string, unknown>>();
    return (rows.results || []).map((r) => ({
      port_project_id: Number(r.port_project_id),
      developer_id: Number(r.developer_id),
      role: String(r.role) as Role,
      created_at: new Date(String(r.created_at))
    }));
  }

  async findByDeveloper(developerId: number): Promise<ProjectDeveloper[]> {
    const rows = await this.db
      .prepare("SELECT * FROM project_developers WHERE developer_id = ?")
      .bind(developerId)
      .all<Record<string, unknown>>();
    return (rows.results || []).map((r) => ({
      port_project_id: Number(r.port_project_id),
      developer_id: Number(r.developer_id),
      role: String(r.role) as Role,
      created_at: new Date(String(r.created_at))
    }));
  }
}

