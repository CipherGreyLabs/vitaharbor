import { describe, it, expect, beforeEach } from "vitest";
import {
  ProjectsRepository,
  DevelopersRepository,
  ProjectAliasesRepository,
  AdminAuditLogRepository,
  UpdatesRepository
} from "../../src/worker/repositories";
import { ProjectMergeService } from "../../src/worker/services/projects/projectMergeService";
import type { Env } from "../../src/worker";

class MockMergeD1 {
  tables: Record<string, Record<string, unknown>[]> = {
    port_projects: [],
    updates: [],
    observations: [],
    project_stage_history: [],
    project_developers: [],
    project_aliases: [],
    admin_audit_log: []
  };

  prepare(query: string) {
    return new MockMergeStatement(this, query);
  }
}

class MockMergeStatement {
  private bindings: unknown[] = [];

  constructor(private db: MockMergeD1, private query: string) {}

  bind(...values: unknown[]) {
    this.bindings = values;
    return this;
  }

  async first<T = Record<string, unknown>>(): Promise<T | null> {
    const all = await this.all<T>();
    return all.results.length > 0 ? all.results[0] : null;
  }

  async all<T = Record<string, unknown>>(): Promise<{ results: T[] }> {
    const q = this.query.trim().toLowerCase();
    if (q.includes("from port_projects where id = ?")) {
      const found = this.db.tables.port_projects.find((p) => p.id === this.bindings[0]);
      return { results: (found ? [found] : []) as T[] };
    }
    if (q.includes("from updates where id = ?")) {
      const found = this.db.tables.updates.find((u) => u.id === this.bindings[0]);
      return { results: (found ? [found] : []) as T[] };
    }
    return { results: [] };
  }

  async run(): Promise<{ meta: { last_row_id: number; changes: number } }> {
    const q = this.query.trim().toLowerCase().replace(/\s+/g, " ");

    if (q.startsWith("update updates set port_project_id = ? where port_project_id = ?")) {
      const [targetId, sourceId] = this.bindings;
      let count = 0;
      for (const u of this.db.tables.updates) {
        if (u.port_project_id === sourceId) {
          u.port_project_id = targetId;
          count++;
        }
      }
      return { meta: { last_row_id: 0, changes: count } };
    }

    if (q.startsWith("update port_projects set")) {
      return { meta: { last_row_id: 0, changes: 1 } };
    }

    if (q.startsWith("insert into admin_audit_log")) {
      const [id, action, user_id, details, created_at] = this.bindings;
      this.db.tables.admin_audit_log.push({ id, action, user_id, details, created_at });
      return { meta: { last_row_id: 1, changes: 1 } };
    }

    if (q.startsWith("insert or ignore into project_aliases")) {
      const [port_project_id, alias, normalized_alias, match_strength, requires_context, created_at] = this.bindings;
      this.db.tables.project_aliases.push({ port_project_id, alias, normalized_alias, match_strength, requires_context, created_at });
      return { meta: { last_row_id: 1, changes: 1 } };
    }

    return { meta: { last_row_id: 0, changes: 1 } };
  }
}

describe("Project Merge and Repair Service", () => {
  let db: MockMergeD1;
  let mergeService: ProjectMergeService;
  let projectsRepo: ProjectsRepository;
  let devRepo: DevelopersRepository;
  let aliasesRepo: ProjectAliasesRepository;
  let auditRepo: AdminAuditLogRepository;
  let updatesRepo: UpdatesRepository;

  beforeEach(() => {
    db = new MockMergeD1();
    const d1 = db as unknown as D1Database;
    const dummyEnv: Env = { DB: d1, ASSETS: null as any };

    projectsRepo = new ProjectsRepository(d1);
    devRepo = new DevelopersRepository(d1);
    aliasesRepo = new ProjectAliasesRepository(d1);
    auditRepo = new AdminAuditLogRepository(d1);
    updatesRepo = new UpdatesRepository(d1);

    mergeService = new ProjectMergeService(dummyEnv, projectsRepo, devRepo, aliasesRepo, auditRepo, updatesRepo);

    // Seed test projects
    db.tables.port_projects = [
      {
        id: 1,
        game_id: 10,
        slug: "gta-sa-dup",
        display_name: "GTA San Andreas (Duplicate)",
        current_stage: "playable",
        lifecycle: "active",
        summary: "Dup",
        first_seen_at: new Date().toISOString(),
        last_activity_at: new Date().toISOString(),
        is_archived: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 2,
        game_id: 10,
        slug: "gta-sa-main",
        display_name: "Grand Theft Auto: San Andreas",
        current_stage: "released",
        lifecycle: "active",
        summary: "Authoritative",
        first_seen_at: new Date().toISOString(),
        last_activity_at: new Date().toISOString(),
        is_archived: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    // Seed an update on dup project
    db.tables.updates = [
      {
        id: "upd_dup_1",
        port_project_id: 1,
        title: "Test Update on Dup",
        published: 1,
        event_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
  });

  it("should merge duplicate project into target project and migrate updates", async () => {
    const result = await mergeService.mergeProjects(1, 2, "admin_user");
    expect(result.source_project_id).toBe(1);
    expect(result.target_project_id).toBe(2);

    // Check that update moved to project 2
    expect(db.tables.updates[0].port_project_id).toBe(2);

    // Check alias added
    expect(db.tables.project_aliases.length).toBe(1);
    expect(db.tables.project_aliases[0].port_project_id).toBe(2);

    // Check audit log recorded
    expect(db.tables.admin_audit_log.length).toBe(1);
    expect(db.tables.admin_audit_log[0].action).toBe("merge_projects");
  });
});

