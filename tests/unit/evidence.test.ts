import { describe, it, expect, beforeEach } from "vitest";
import {
  SourceItemsRepository,
  ObservationsRepository,
  UpdatesRepository,
  DeveloperIdentitiesRepository,
  AdminAuditLogRepository
} from "../../src/worker/repositories";
import { ProvenanceService } from "../../src/worker/services/provenance/provenanceService";
import type { SourceItem } from "../../src/shared/types";

// Enhanced Mock D1 Database for Evidence Model Testing
class MockEvidenceD1 {
  tables: Record<string, Record<string, unknown>[]> = {
    source_items: [],
    observations: [],
    updates: [],
    update_sources: [],
    developer_identities: [],
    admin_audit_log: [],
    discovery_items: []
  };

  prepare(query: string) {
    return new MockEvidenceStatement(this, query);
  }
}

class MockEvidenceStatement {
  private bindings: unknown[] = [];

  constructor(private db: MockEvidenceD1, private query: string) {}

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

    if (q.includes("from source_items")) {
      const rows = this.db.tables.source_items;
      if (q.includes("where id = ?")) {
        const found = rows.find((r) => r.id === this.bindings[0]);
        return { results: (found ? [found] : []) as T[] };
      }
      if (q.includes("where source_type = ? and external_id = ?")) {
        const found = rows.find((r) => r.source_type === this.bindings[0] && r.external_id === this.bindings[1]);
        return { results: (found ? [found] : []) as T[] };
      }
      return { results: rows as T[] };
    }

    if (q.includes("from observations")) {
      const rows = this.db.tables.observations;
      if (q.includes("where id = ?")) {
        const found = rows.find((r) => r.id === this.bindings[0]);
        return { results: (found ? [found] : []) as T[] };
      }
      if (q.includes("where source_item_id = ?")) {
        const found = rows.filter((r) => r.source_item_id === this.bindings[0]);
        return { results: found as T[] };
      }
      return { results: rows as T[] };
    }

    if (q.includes("from updates")) {
      const rows = this.db.tables.updates;
      if (q.includes("where id = ?")) {
        const found = rows.find((r) => r.id === this.bindings[0]);
        return { results: (found ? [found] : []) as T[] };
      }
      if (q.includes("where port_project_id = ?")) {
        const found = rows.filter((r) => r.port_project_id === this.bindings[0]);
        return { results: found as T[] };
      }
      return { results: rows as T[] };
    }

    if (q.includes("from update_sources")) {
      const rows = this.db.tables.update_sources;
      if (q.includes("where update_id = ?")) {
        const found = rows.filter((r) => r.update_id === this.bindings[0]);
        return { results: found as T[] };
      }
      return { results: rows as T[] };
    }

    if (q.includes("from developer_identities")) {
      const rows = this.db.tables.developer_identities;
      if (q.includes("where developer_id = ?")) {
        const found = rows.filter((r) => r.developer_id === this.bindings[0]);
        return { results: found as T[] };
      }
      return { results: rows as T[] };
    }

    if (q.includes("from admin_audit_log")) {
      return { results: this.db.tables.admin_audit_log as T[] };
    }

    return { results: [] };
  }

  async run(): Promise<{ meta: { last_row_id: number; changes: number } }> {
    const q = this.query.trim().toLowerCase().replace(/\s+/g, " ");

    if (q.startsWith("insert into source_items")) {
      const [
        id, source_type, external_id, external_fullname, item_type,
        canonical_url, community, author_external_id, author_username,
        parent_external_id, root_thread_external_id, source_created_at,
        source_edited_at, content_hash, raw_expires_at, created_at, updated_at
      ] = this.bindings;
      this.db.tables.source_items.push({
        id, source_type, external_id, external_fullname, item_type,
        canonical_url, community, author_external_id, author_username,
        parent_external_id, root_thread_external_id, source_created_at,
        source_edited_at, content_hash, first_seen_at: created_at,
        last_fetched_at: updated_at, deleted_at: null, raw_expires_at,
        created_at, updated_at
      });
      return { meta: { last_row_id: 1, changes: 1 } };
    }

    if (q.startsWith("update source_items set deleted_at")) {
      const [deleted_at, updated_at, id] = this.bindings;
      const row = this.db.tables.source_items.find((r) => r.id === id);
      if (row) {
        row.deleted_at = deleted_at;
        row.content_hash = null;
        row.updated_at = updated_at;
      }
      return { meta: { last_row_id: 0, changes: 1 } };
    }

    if (q.startsWith("insert into observations")) {
      const [
        id, source_item_id, port_project_id, developer_id,
        observation_type, claim_text, suggested_stage, suggested_lifecycle,
        confidence, verification_level, moderation_status, created_at
      ] = this.bindings;
      this.db.tables.observations.push({
        id, source_item_id, port_project_id, developer_id,
        observation_type, claim_text, suggested_stage, suggested_lifecycle,
        confidence, verification_level, moderation_status, created_at, reviewed_at: null
      });
      return { meta: { last_row_id: 1, changes: 1 } };
    }

    if (q.startsWith("update observations set moderation_status")) {
      const [status, reviewed_at, id] = this.bindings;
      const row = this.db.tables.observations.find((r) => r.id === id);
      if (row) {
        row.moderation_status = status;
        row.reviewed_at = reviewed_at;
      }
      return { meta: { last_row_id: 0, changes: 1 } };
    }

    if (q.startsWith("insert into updates")) {
      const [
        id, port_project_id, developer_id, event_type, title, summary,
        event_at, verification_level, stage_before, stage_after,
        lifecycle_before, lifecycle_after, published, created_at, updated_at
      ] = this.bindings;
      this.db.tables.updates.push({
        id, port_project_id, developer_id, event_type, title, summary,
        event_at, verification_level, stage_before, stage_after,
        lifecycle_before, lifecycle_after, published, source_removed: 0,
        created_at, updated_at
      });
      return { meta: { last_row_id: 1, changes: 1 } };
    }

    if (q.startsWith("insert or replace into update_sources")) {
      const [update_id, source_item_id, relationship, created_at] = this.bindings;
      this.db.tables.update_sources.push({
        update_id, source_item_id, relationship, created_at
      });
      return { meta: { last_row_id: 1, changes: 1 } };
    }

    if (q.startsWith("update updates set source_removed")) {
      const [updated_at, id] = this.bindings;
      const row = this.db.tables.updates.find((r) => r.id === id);
      if (row) {
        row.source_removed = 1;
        row.updated_at = updated_at;
      }
      return { meta: { last_row_id: 0, changes: 1 } };
    }

    if (q.startsWith("insert into admin_audit_log")) {
      const [id, action, user_id, details, created_at] = this.bindings;
      this.db.tables.admin_audit_log.push({
        id, action, user_id, details, created_at
      });
      return { meta: { last_row_id: 1, changes: 1 } };
    }

    return { meta: { last_row_id: 0, changes: 0 } };
  }
}

describe("Evidence Model and Provenance Service", () => {
  let db: MockEvidenceD1;
  let sourceRepo: SourceItemsRepository;
  let obsRepo: ObservationsRepository;
  let updatesRepo: UpdatesRepository;
  let identitiesRepo: DeveloperIdentitiesRepository;
  let auditRepo: AdminAuditLogRepository;
  let provenanceService: ProvenanceService;

  beforeEach(() => {
    db = new MockEvidenceD1();
    const d1 = db as unknown as D1Database;
    sourceRepo = new SourceItemsRepository(d1);
    obsRepo = new ObservationsRepository(d1);
    updatesRepo = new UpdatesRepository(d1);
    identitiesRepo = new DeveloperIdentitiesRepository(d1);
    auditRepo = new AdminAuditLogRepository(d1);
    provenanceService = new ProvenanceService(sourceRepo, obsRepo, updatesRepo, identitiesRepo, auditRepo);
  });

  it("should create and retrieve source items", async () => {
    const item = await sourceRepo.create({
      external_id: "post_123",
      item_type: "post",
      canonical_url: "https://reddit.com/r/vitahacks/comments/123/gta_port",
      community: "vitahacks",
      author_username: "Rinnegatamante",
      source_created_at: new Date()
    });

    expect(item.external_id).toBe("post_123");
    expect(item.community).toBe("vitahacks");

    const fetched = await sourceRepo.findByExternalId("reddit", "post_123");
    expect(fetched).not.toBeNull();
    expect(fetched?.author_username).toBe("Rinnegatamante");
  });

  it("should evaluate developer_direct verification level when author matches developer identity", async () => {
    // Seed developer identity
    db.tables.developer_identities.push({
      id: 1,
      developer_id: 42,
      provider: "reddit",
      username: "Rinnegatamante",
      is_primary: 1
    });

    const sourceItem: SourceItem = {
      id: "src_1",
      source_type: "reddit",
      external_id: "post_abc",
      external_fullname: null,
      item_type: "post",
      canonical_url: "https://reddit.com/r/vitahacks/comments/abc",
      community: "vitahacks",
      author_external_id: null,
      author_username: "Rinnegatamante",
      parent_external_id: null,
      root_thread_external_id: null,
      source_created_at: new Date(),
      source_edited_at: null,
      content_hash: "hash123",
      first_seen_at: new Date(),
      last_fetched_at: new Date(),
      deleted_at: null,
      raw_expires_at: null,
      created_at: new Date(),
      updated_at: new Date()
    };

    const level = await provenanceService.determineVerificationLevel(sourceItem, 42);
    expect(level).toBe("developer_direct");

    // Other non-matching dev
    const levelOther = await provenanceService.determineVerificationLevel(sourceItem, 99);
    expect(levelOther).toBe("community_report");
  });

  it("should promote observation to verified update with linked sources and audit log", async () => {
    const source = await sourceRepo.create({
      external_id: "ext_456",
      item_type: "post",
      canonical_url: "https://reddit.com/r/VitaPiracy/comments/456",
      author_username: "dev_user",
      source_created_at: new Date()
    });

    const obs = await obsRepo.create({
      source_item_id: source.id,
      port_project_id: 10,
      observation_type: "playability_progress",
      claim_text: "Now running at 60fps with audio fixed",
      suggested_stage: "playable"
    });

    const update = await provenanceService.promoteObservationToUpdate(
      obs.id,
      "Audio fixed and 60 FPS achieved",
      "Developer achieved full audio decoding and framerate lock."
    );

    expect(update).not.toBeNull();
    expect(update?.port_project_id).toBe(10);
    expect(update?.title).toBe("Audio fixed and 60 FPS achieved");

    const sources = await updatesRepo.getSourcesForUpdate(update!.id);
    expect(sources.length).toBe(1);
    expect(sources[0].source_item_id).toBe(source.id);

    const audit = await auditRepo.listRecent(10);
    expect(audit.length).toBe(1);
    expect(audit[0].action).toBe("promote_observation");
  });

  it("should reconcile source deletion according to Blueprint rules", async () => {
    const source = await sourceRepo.create({
      external_id: "del_789",
      item_type: "comment",
      canonical_url: "https://reddit.com/r/vitahacks/comments/789",
      source_created_at: new Date()
    });

    const update = await updatesRepo.create({
      port_project_id: 5,
      event_type: "technical_progress",
      title: "Shader compiler update",
      summary: "Work started on custom shader translator",
      event_at: new Date(),
      published: true
    });

    await updatesRepo.linkSource(update.id, source.id, "primary");

    const reconcileResult = await provenanceService.reconcileSourceDeletion(source.id);
    expect(reconcileResult.updates_marked_removed).toContain(update.id);

    const updatedRec = await updatesRepo.findById(update.id);
    expect(updatedRec?.source_removed).toBe(true);

    const srcRec = await sourceRepo.findById(source.id);
    expect(srcRec?.deleted_at).not.toBeNull();
  });
});
