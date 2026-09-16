import { describe, it, expect, beforeEach } from "vitest";
import {
  GamesRepository,
  ProjectsRepository,
  DevelopersRepository,
  DeveloperIdentitiesRepository,
  ProjectAliasesRepository,
  StageHistoryRepository
} from "../../src/worker/repositories";

// In-memory mock of Cloudflare D1
class MockD1Database {
  private tables: Record<string, Record<string, unknown>[]> = {
    games: [],
    port_projects: [],
    developers: [],
    developer_identities: [],
    project_developers: [],
    project_aliases: [],
    project_stage_history: [],
    technologies: [],
    project_technologies: [],
    project_relations: []
  };
  private autoIncrement: Record<string, number> = {};

  prepare(query: string) {
    return new MockD1PreparedStatement(this, query);
  }

  _insert(table: string, row: Record<string, unknown>) {
    if (!this.autoIncrement[table]) this.autoIncrement[table] = 1;
    const id = row.id ? Number(row.id) : this.autoIncrement[table]++;
    const newRow = { ...row, id };
    this.tables[table].push(newRow);
    return id;
  }

  _getTable(table: string) {
    return this.tables[table] || [];
  }

  _update(table: string, predicate: (r: Record<string, unknown>) => boolean, updates: Record<string, unknown>) {
    const rows = this.tables[table] || [];
    for (const r of rows) {
      if (predicate(r)) {
        Object.assign(r, updates);
      }
    }
  }
}

class MockD1PreparedStatement {
  private bindings: unknown[] = [];

  constructor(private db: MockD1Database, private query: string) {}

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
    
    if (q.includes("from games")) {
      const rows = this.db._getTable("games");
      if (q.includes("where id = ?")) {
        const found = rows.find((r) => r.id === this.bindings[0]);
        return { results: (found ? [found] : []) as T[] };
      }
      if (q.includes("where slug = ?")) {
        const found = rows.find((r) => r.slug === this.bindings[0]);
        return { results: (found ? [found] : []) as T[] };
      }
      return { results: rows as T[] };
    }

    if (q.includes("from port_projects")) {
      const rows = this.db._getTable("port_projects");
      if (q.includes("where id = ?")) {
        const found = rows.find((r) => r.id === this.bindings[0]);
        return { results: (found ? [found] : []) as T[] };
      }
      if (q.includes("where slug = ?")) {
        const found = rows.find((r) => r.slug === this.bindings[0]);
        return { results: (found ? [found] : []) as T[] };
      }
      return { results: rows as T[] };
    }

    if (q.includes("from developers")) {
      const rows = this.db._getTable("developers");
      if (q.includes("where id = ?")) {
        const found = rows.find((r) => r.id === this.bindings[0]);
        return { results: (found ? [found] : []) as T[] };
      }
      if (q.includes("where slug = ?")) {
        const found = rows.find((r) => r.slug === this.bindings[0]);
        return { results: (found ? [found] : []) as T[] };
      }
      return { results: rows as T[] };
    }

    if (q.includes("from developer_identities")) {
      const rows = this.db._getTable("developer_identities");
      if (q.includes("where developer_id = ?")) {
        const found = rows.filter((r) => r.developer_id === this.bindings[0]);
        return { results: found as T[] };
      }
      if (q.includes("where provider = ? and lower(username) = lower(?)")) {
        const found = rows.find((r) => r.provider === this.bindings[0] && String(r.username).toLowerCase() === String(this.bindings[1]).toLowerCase());
        return { results: (found ? [found] : []) as T[] };
      }
      return { results: rows as T[] };
    }

    if (q.includes("from project_aliases")) {
      const rows = this.db._getTable("project_aliases");
      if (q.includes("where port_project_id = ?")) {
        const found = rows.filter((r) => r.port_project_id === this.bindings[0]);
        return { results: found as T[] };
      }
      if (q.includes("where normalized_alias = ?")) {
        const found = rows.filter((r) => r.normalized_alias === this.bindings[0]);
        return { results: found as T[] };
      }
      return { results: rows as T[] };
    }

    if (q.includes("from project_stage_history")) {
      const rows = this.db._getTable("project_stage_history");
      if (q.includes("where port_project_id = ?")) {
        const found = rows.filter((r) => r.port_project_id === this.bindings[0]);
        return { results: found as T[] };
      }
      return { results: rows as T[] };
    }

    return { results: [] };
  }

  async run(): Promise<{ meta: { last_row_id: number; changes: number } }> {
    const q = this.query.trim().toLowerCase();
    
    if (q.startsWith("insert into games")) {
      const [slug, title, normalized_title, original_release_year, original_platform, created_at, updated_at] = this.bindings;
      const id = this.db._insert("games", {
        slug, title, normalized_title, original_release_year, original_platform, created_at, updated_at
      });
      return { meta: { last_row_id: id, changes: 1 } };
    }

    if (q.startsWith("insert into port_projects")) {
      const [
        game_id, slug, display_name, current_stage, lifecycle, summary,
        playability_notes, performance_notes, first_seen_at, last_activity_at,
        released_at, is_featured, created_at, updated_at
      ] = this.bindings;
      const id = this.db._insert("port_projects", {
        game_id, slug, display_name, current_stage, lifecycle, summary,
        playability_notes, performance_notes, first_seen_at, last_activity_at,
        released_at, is_featured, is_archived: 0, created_at, updated_at
      });
      return { meta: { last_row_id: id, changes: 1 } };
    }

    if (q.startsWith("insert into developers")) {
      const [slug, display_name, description, is_known_developer, created_at, updated_at] = this.bindings;
      const id = this.db._insert("developers", {
        slug, display_name, description, is_known_developer, created_at, updated_at
      });
      return { meta: { last_row_id: id, changes: 1 } };
    }

    if (q.startsWith("insert into developer_identities")) {
      const [
        developer_id, provider, provider_user_id, username, profile_url,
        is_primary, valid_from, valid_until, created_at, updated_at
      ] = this.bindings;
      const id = this.db._insert("developer_identities", {
        developer_id, provider, provider_user_id, username, profile_url,
        is_primary, valid_from, valid_until, created_at, updated_at
      });
      return { meta: { last_row_id: id, changes: 1 } };
    }

    if (q.startsWith("insert or ignore into project_aliases")) {
      const [port_project_id, alias, normalized_alias, match_strength, requires_context, created_at] = this.bindings;
      const id = this.db._insert("project_aliases", {
        port_project_id, alias, normalized_alias, match_strength, requires_context, created_at
      });
      return { meta: { last_row_id: id, changes: 1 } };
    }

    if (q.startsWith("insert into project_stage_history")) {
      const [port_project_id, stage, effective_at, source_update_id, reason, created_at] = this.bindings;
      const id = this.db._insert("project_stage_history", {
        port_project_id, stage, effective_at, source_update_id, reason, created_at
      });
      return { meta: { last_row_id: id, changes: 1 } };
    }

    if (q.startsWith("update port_projects")) {
      const [
        display_name, current_stage, lifecycle, summary,
        playability_notes, performance_notes, last_activity_at,
        released_at, is_featured, is_archived, updated_at, id
      ] = this.bindings;
      this.db._update("port_projects", (r) => r.id === id, {
        display_name, current_stage, lifecycle, summary,
        playability_notes, performance_notes, last_activity_at,
        released_at, is_featured, is_archived, updated_at
      });
      return { meta: { last_row_id: Number(id), changes: 1 } };
    }

    return { meta: { last_row_id: 0, changes: 0 } };
  }
}

describe("Domain Repositories", () => {
  let db: MockD1Database;
  let gamesRepo: GamesRepository;
  let projectsRepo: ProjectsRepository;
  let devRepo: DevelopersRepository;
  let identitiesRepo: DeveloperIdentitiesRepository;
  let aliasesRepo: ProjectAliasesRepository;
  let stageRepo: StageHistoryRepository;

  beforeEach(() => {
    db = new MockD1Database();
    // cast mock to D1Database
    const d1 = db as unknown as D1Database;
    gamesRepo = new GamesRepository(d1);
    projectsRepo = new ProjectsRepository(d1);
    devRepo = new DevelopersRepository(d1);
    identitiesRepo = new DeveloperIdentitiesRepository(d1);
    aliasesRepo = new ProjectAliasesRepository(d1);
    stageRepo = new StageHistoryRepository(d1);
  });

  it("should create and retrieve a Game with normalized slug", async () => {
    const game = await gamesRepo.create({
      title: "Hollow Knight",
      original_release_year: 2017,
      original_platform: "PC"
    });

    expect(game.id).toBe(1);
    expect(game.slug).toBe("hollow-knight");
    expect(game.normalized_title).toBe("hollow knight");

    const fetched = await gamesRepo.findBySlug("hollow-knight");
    expect(fetched).not.toBeNull();
    expect(fetched?.title).toBe("Hollow Knight");
  });

  it("should create and update a PortProject with stage progression", async () => {
    const game = await gamesRepo.create({ title: "Max Payne" });
    const project = await projectsRepo.create({
      game_id: game.id,
      display_name: "Max Payne Vita",
      current_stage: "booting",
      summary: "ARM wrapper port of Android build"
    });

    expect(project.current_stage).toBe("booting");
    expect(project.game_id).toBe(game.id);

    const updated = await projectsRepo.update(project.id, {
      current_stage: "playable",
      playability_notes: "Runs smoothly at 30 FPS"
    });

    expect(updated?.current_stage).toBe("playable");
    expect(updated?.playability_notes).toBe("Runs smoothly at 30 FPS");
  });

  it("should manage Developer and Reddit identities", async () => {
    const dev = await devRepo.create({
      display_name: "TheFloW",
      is_known_developer: true
    });

    expect(dev.slug).toBe("theflow");

    const identity = await identitiesRepo.create({
      developer_id: dev.id,
      provider: "reddit",
      username: "TheOfficialFloW"
    });

    expect(identity.username).toBe("TheOfficialFloW");

    const lookup = await identitiesRepo.findByUsername("reddit", "theofficialflow");
    expect(lookup).not.toBeNull();
    expect(lookup?.developer_id).toBe(dev.id);
  });

  it("should record stage transition history", async () => {
    const entry = await stageRepo.recordTransition(1, "playable", new Date(), "Developer video proof");
    expect(entry.stage).toBe("playable");
    expect(entry.reason).toBe("Developer video proof");

    const history = await stageRepo.findByProject(1);
    expect(history.length).toBe(1);
    expect(history[0].stage).toBe("playable");
  });

  it("should store and match project aliases", async () => {
    await aliasesRepo.addAlias(1, "GTA SA", 2);
    await aliasesRepo.addAlias(1, "San Andreas", 1);

    const matches = await aliasesRepo.findMatching("gta sa");
    expect(matches.length).toBe(1);
    expect(matches[0].port_project_id).toBe(1);
  });
});

