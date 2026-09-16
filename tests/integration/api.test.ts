import { describe, it, expect, beforeEach } from "vitest";
import workerApp from "../../src/worker/index";
import { Hono } from "hono";
import { publicApi } from "../../src/worker/routes/public";
import { adminApi } from "../../src/worker/routes/admin";
import type { Env } from "../../src/worker/index";

// In-Memory Database for API Integration Testing
class IntegrationMockD1 {
  tables: Record<string, Record<string, unknown>[]> = {
    games: [
      {
        id: 1,
        slug: "gta-san-andreas",
        title: "Grand Theft Auto: San Andreas",
        normalized_title: "grand theft auto: san andreas",
        original_release_year: 2004,
        original_platform: "PS2 / Android",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ],
    port_projects: [
      {
        id: 1,
        game_id: 1,
        slug: "gta-san-andreas-vita",
        display_name: "Grand Theft Auto: San Andreas Vita",
        current_stage: "released",
        lifecycle: "active",
        summary: "Android ARM wrapper port with vitaGL",
        playability_notes: "100% completable",
        performance_notes: "30 FPS lock",
        first_seen_at: new Date().toISOString(),
        last_activity_at: new Date().toISOString(),
        released_at: new Date().toISOString(),
        is_featured: 1,
        is_archived: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ],
    developers: [
      {
        id: 1,
        slug: "theflow",
        display_name: "TheFloW",
        description: "Vita developer",
        is_known_developer: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ],
    developer_identities: [
      {
        id: 1,
        developer_id: 1,
        provider: "reddit",
        provider_user_id: "t2_theflow",
        username: "TheOfficialFloW",
        profile_url: null,
        is_primary: 1,
        valid_from: null,
        valid_until: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ],
    project_developers: [
      {
        port_project_id: 1,
        developer_id: 1,
        role: "lead",
        created_at: new Date().toISOString()
      }
    ],
    technologies: [
      { id: 1, name: "vitaGL" },
      { id: 2, name: "ARM Wrapper" }
    ],
    project_technologies: [
      { port_project_id: 1, technology_id: 1 },
      { port_project_id: 1, technology_id: 2 }
    ],
    project_aliases: [
      {
        id: 1,
        port_project_id: 1,
        alias: "GTA SA",
        normalized_alias: "gta sa",
        match_strength: 2,
        requires_context: 0,
        created_at: new Date().toISOString()
      }
    ],
    project_stage_history: [
      {
        id: 1,
        port_project_id: 1,
        stage: "released",
        effective_at: new Date().toISOString(),
        source_update_id: null,
        reason: "Initial release",
        created_at: new Date().toISOString()
      }
    ],
    project_relations: [],
    source_items: [],
    observations: [],
    updates: [
      {
        id: "upd_1",
        port_project_id: 1,
        developer_id: 1,
        event_type: "release",
        title: "GTA: San Andreas v2.1 Released",
        summary: "Shader stutter fixed",
        event_at: new Date().toISOString(),
        verification_level: "developer_direct",
        stage_before: "playable",
        stage_after: "released",
        lifecycle_before: "active",
        lifecycle_after: "active",
        published: 1,
        source_removed: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ],
    update_sources: [],
    discovery_items: [],
    ingestion_runs: [
      {
        id: "run_1",
        started_at: new Date().toISOString(),
        finished_at: new Date().toISOString(),
        status: "completed",
        projects_affected: 1,
        observations_created: 1,
        updates_created: 1,
        errors: null
      }
    ],
    admin_audit_log: []
  };

  prepare(query: string) {
    return new IntegrationMockStatement(this, query);
  }
}

class IntegrationMockStatement {
  private bindings: unknown[] = [];

  constructor(private db: IntegrationMockD1, private query: string) {}

  bind(...values: unknown[]) {
    this.bindings = values;
    return this;
  }

  async first<T = Record<string, unknown>>(): Promise<T | null> {
    const q = this.query.trim().toLowerCase().replace(/\s+/g, " ");

    if (q.includes("select 1 as healthy")) {
      return { healthy: 1 } as T;
    }

    if (q.includes("from ingestion_runs where status = 'completed'")) {
      const runs = this.db.tables.ingestion_runs.filter((r) => r.status === "completed");
      return (runs[0] || null) as T;
    }

    if (q.includes("from port_projects where slug = ?")) {
      const found = this.db.tables.port_projects.find((p) => p.slug === this.bindings[0]);
      return (found || null) as T;
    }

    if (q.includes("from port_projects where id = ?")) {
      const found = this.db.tables.port_projects.find((p) => p.id === this.bindings[0]);
      return (found || null) as T;
    }

    if (q.includes("from games where id = ?")) {
      const found = this.db.tables.games.find((g) => g.id === this.bindings[0]);
      return (found || null) as T;
    }

    if (q.includes("from developers where slug = ?")) {
      const found = this.db.tables.developers.find((d) => d.slug === this.bindings[0]);
      return (found || null) as T;
    }

    if (q.includes("from developers where id = ?")) {
      const found = this.db.tables.developers.find((d) => d.id === this.bindings[0]);
      return (found || null) as T;
    }

    if (q.includes("from discovery_items where id = ?")) {
      const found = this.db.tables.discovery_items.find((d) => d.id === this.bindings[0]);
      return (found || null) as T;
    }

    const all = await this.all<T>();
    return all.results.length > 0 ? all.results[0] : null;
  }

  async all<T = Record<string, unknown>>(): Promise<{ results: T[] }> {
    const q = this.query.trim().toLowerCase().replace(/\s+/g, " ");

    if (q.includes("from port_projects")) {
      return { results: this.db.tables.port_projects as T[] };
    }

    if (q.includes("from games")) {
      return { results: this.db.tables.games as T[] };
    }

    if (q.includes("from developers")) {
      return { results: this.db.tables.developers as T[] };
    }

    if (q.includes("from developer_identities where developer_id = ?")) {
      const found = this.db.tables.developer_identities.filter((i) => i.developer_id === this.bindings[0]);
      return { results: found as T[] };
    }

    if (q.includes("from project_developers where port_project_id = ?")) {
      const found = this.db.tables.project_developers.filter((pd) => pd.port_project_id === this.bindings[0]);
      return { results: found as T[] };
    }

    if (q.includes("from project_developers where developer_id = ?")) {
      const found = this.db.tables.project_developers.filter((pd) => pd.developer_id === this.bindings[0]);
      return { results: found as T[] };
    }

    if (q.includes("from technologies t join project_technologies")) {
      const projId = this.bindings[0];
      const links = this.db.tables.project_technologies.filter((pt) => pt.port_project_id === projId);
      const names = links.map((l) => {
        const t = this.db.tables.technologies.find((tech) => tech.id === l.technology_id);
        return { name: t ? t.name : "" };
      });
      return { results: names as T[] };
    }

    if (q.includes("from updates")) {
      return { results: this.db.tables.updates as T[] };
    }

    if (q.includes("from project_stage_history")) {
      return { results: this.db.tables.project_stage_history as T[] };
    }

    if (q.includes("from project_aliases")) {
      return { results: this.db.tables.project_aliases as T[] };
    }

    if (q.includes("from project_relations")) {
      return { results: this.db.tables.project_relations as T[] };
    }

    if (q.includes("from update_sources")) {
      return { results: this.db.tables.update_sources as T[] };
    }

    if (q.includes("from discovery_items")) {
      return { results: this.db.tables.discovery_items as T[] };
    }

    if (q.includes("from admin_audit_log")) {
      return { results: this.db.tables.admin_audit_log as T[] };
    }

    return { results: [] };
  }

  async run(): Promise<{ meta: { last_row_id: number; changes: number } }> {
    const q = this.query.trim().toLowerCase().replace(/\s+/g, " ");

    if (q.startsWith("insert into games")) {
      const [slug, title, normalized_title, original_release_year, original_platform, created_at, updated_at] = this.bindings;
      const id = this.db.tables.games.length + 1;
      this.db.tables.games.push({ id, slug, title, normalized_title, original_release_year, original_platform, created_at, updated_at });
      return { meta: { last_row_id: id, changes: 1 } };
    }

    if (q.startsWith("insert into port_projects")) {
      const [game_id, slug, display_name, current_stage, lifecycle, summary, playability_notes, performance_notes, first_seen_at, last_activity_at, released_at, is_featured, created_at, updated_at] = this.bindings;
      const id = this.db.tables.port_projects.length + 1;
      this.db.tables.port_projects.push({ id, game_id, slug, display_name, current_stage, lifecycle, summary, playability_notes, performance_notes, first_seen_at, last_activity_at, released_at, is_featured, is_archived: 0, created_at, updated_at });
      return { meta: { last_row_id: id, changes: 1 } };
    }

    if (q.startsWith("insert into admin_audit_log")) {
      const [id, action, user_id, details, created_at] = this.bindings;
      this.db.tables.admin_audit_log.push({ id, action, user_id, details, created_at });
      return { meta: { last_row_id: 1, changes: 1 } };
    }

    return { meta: { last_row_id: 0, changes: 1 } };
  }
}

describe("VitaPortWatch API Integration Tests", () => {
  let app: Hono<{ Bindings: Env }>;
  let env: Env;
  let mockDb: IntegrationMockD1;

  beforeEach(() => {
    mockDb = new IntegrationMockD1();
    env = {
      DB: mockDb as unknown as D1Database,
      ASSETS: null as any,
      ENVIRONMENT: "development",
      REDDIT_CLIENT_ID: "test_client",
      REDDIT_CLIENT_SECRET: "test_secret",
      REDDIT_REFRESH_TOKEN: "test_refresh"
    };

    app = new Hono<{ Bindings: Env }>();
    app.route("/api", publicApi);
    app.route("/api/admin", adminApi);
  });

  it("GET /api/health should return database and reddit status", async () => {
    const res = await workerApp.fetch(new Request("http://localhost/api/health"), env);
    expect(res.status).toBe(200);

    const body = (await res.json()) as any;
    expect(body.status).toBe("healthy");
    expect(body.database_reachable).toBe(true);
    expect(body.reddit_ingestion_configured).toBe(true);
  });

  it("GET /api/stats should return aggregate project and developer numbers", async () => {
    const res = await app.fetch(new Request("http://localhost/api/stats"), env);
    expect(res.status).toBe(200);

    const body = (await res.json()) as any;
    expect(body.total_projects).toBe(1);
    expect(body.active_projects).toBe(1);
    expect(body.playable_or_better).toBe(1);
    expect(body.total_developers).toBe(1);
  });

  it("GET /api/projects should return enriched project cards", async () => {
    const res = await app.fetch(new Request("http://localhost/api/projects"), env);
    expect(res.status).toBe(200);

    const body = (await res.json()) as any;
    expect(body.projects.length).toBe(1);
    expect(body.projects[0].slug).toBe("gta-san-andreas-vita");
    expect(body.projects[0].game_title).toBe("Grand Theft Auto: San Andreas");
    expect(body.projects[0].technologies).toContain("vitaGL");
  });

  it("GET /api/projects/:slug should return project detail with timeline and developers", async () => {
    const res = await app.fetch(new Request("http://localhost/api/projects/gta-san-andreas-vita"), env);
    expect(res.status).toBe(200);

    const body = (await res.json()) as any;
    expect(body.project.display_name).toBe("Grand Theft Auto: San Andreas Vita");
    expect(body.project.developers[0].display_name).toBe("TheFloW");
    expect(body.project.updates.length).toBe(1);
  });

  it("GET /api/developers should return developers with linked projects and identities", async () => {
    const res = await app.fetch(new Request("http://localhost/api/developers"), env);
    expect(res.status).toBe(200);

    const body = (await res.json()) as any;
    expect(body.developers.length).toBe(1);
    expect(body.developers[0].slug).toBe("theflow");
    expect(body.developers[0].identities[0].username).toBe("TheOfficialFloW");
  });

  it("POST /api/admin/projects should create game and port project records", async () => {
    const req = new Request("http://localhost/api/admin/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        game_title: "Bully: Anniversary Edition",
        original_platform: "PS2 / Android",
        original_release_year: 2006,
        summary: "Rockstar Bully port for Vita",
        current_stage: "playable"
      })
    });

    const res = await app.fetch(req, env);
    expect(res.status).toBe(200);

    const body = (await res.json()) as any;
    expect(body.game.title).toBe("Bully: Anniversary Edition");
    expect(body.project.current_stage).toBe("playable");
  });
});

