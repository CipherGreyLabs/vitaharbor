import type {
  Observation,
  ObservationType,
  DevelopmentStage,
  ProjectLifecycle,
  VerificationLevel,
  ModerationStatus
} from "../../shared/types";
import { generateId } from "../../shared/utils";

export interface CreateObservationInput {
  id?: string;
  source_item_id: string;
  port_project_id?: number | null;
  developer_id?: number | null;
  observation_type: ObservationType;
  claim_text: string;
  suggested_stage?: DevelopmentStage | null;
  suggested_lifecycle?: ProjectLifecycle | null;
  confidence?: number;
  verification_level?: VerificationLevel;
  moderation_status?: ModerationStatus;
}

export class ObservationsRepository {
  constructor(private db: D1Database) {}

  async findById(id: string): Promise<Observation | null> {
    const row = await this.db
      .prepare("SELECT * FROM observations WHERE id = ?")
      .bind(id)
      .first<Record<string, unknown>>();
    return row ? this.mapRow(row) : null;
  }

  async findByProject(projectId: number): Promise<Observation[]> {
    const rows = await this.db
      .prepare("SELECT * FROM observations WHERE port_project_id = ? ORDER BY created_at DESC")
      .bind(projectId)
      .all<Record<string, unknown>>();
    return (rows.results || []).map((r) => this.mapRow(r));
  }

  async findBySourceItem(sourceItemId: string): Promise<Observation[]> {
    const rows = await this.db
      .prepare("SELECT * FROM observations WHERE source_item_id = ?")
      .bind(sourceItemId)
      .all<Record<string, unknown>>();
    return (rows.results || []).map((r) => this.mapRow(r));
  }

  async create(input: CreateObservationInput): Promise<Observation> {
    const id = input.id || generateId();
    const now = new Date().toISOString();
    const confidence = input.confidence ?? 0.5;
    const verLevel = input.verification_level ?? "unverified";
    const modStatus = input.moderation_status ?? "pending";

    await this.db
      .prepare(
        `INSERT INTO observations (
          id, source_item_id, port_project_id, developer_id,
          observation_type, claim_text, suggested_stage, suggested_lifecycle,
          confidence, verification_level, moderation_status, created_at, reviewed_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL)`
      )
      .bind(
        id,
        input.source_item_id,
        input.port_project_id ?? null,
        input.developer_id ?? null,
        input.observation_type,
        input.claim_text.trim(),
        input.suggested_stage ?? null,
        input.suggested_lifecycle ?? null,
        confidence,
        verLevel,
        modStatus,
        now
      )
      .run();

    return {
      id,
      source_item_id: input.source_item_id,
      port_project_id: input.port_project_id ?? null,
      developer_id: input.developer_id ?? null,
      observation_type: input.observation_type,
      claim_text: input.claim_text.trim(),
      suggested_stage: input.suggested_stage ?? null,
      suggested_lifecycle: input.suggested_lifecycle ?? null,
      confidence,
      verification_level: verLevel,
      moderation_status: modStatus,
      created_at: new Date(now),
      reviewed_at: null
    };
  }

  async updateModerationStatus(id: string, status: ModerationStatus): Promise<void> {
    const now = new Date().toISOString();
    await this.db
      .prepare("UPDATE observations SET moderation_status = ?, reviewed_at = ? WHERE id = ?")
      .bind(status, now, id)
      .run();
  }

  async listPending(limit = 50, offset = 0): Promise<Observation[]> {
    const rows = await this.db
      .prepare("SELECT * FROM observations WHERE moderation_status = 'pending' ORDER BY created_at DESC LIMIT ? OFFSET ?")
      .bind(limit, offset)
      .all<Record<string, unknown>>();
    return (rows.results || []).map((r) => this.mapRow(r));
  }

  private mapRow(row: Record<string, unknown>): Observation {
    return {
      id: String(row.id),
      source_item_id: String(row.source_item_id),
      port_project_id: row.port_project_id ? Number(row.port_project_id) : null,
      developer_id: row.developer_id ? Number(row.developer_id) : null,
      observation_type: String(row.observation_type) as ObservationType,
      claim_text: String(row.claim_text),
      suggested_stage: row.suggested_stage ? (String(row.suggested_stage) as DevelopmentStage) : null,
      suggested_lifecycle: row.suggested_lifecycle ? (String(row.suggested_lifecycle) as ProjectLifecycle) : null,
      confidence: Number(row.confidence),
      verification_level: String(row.verification_level) as VerificationLevel,
      moderation_status: String(row.moderation_status) as ModerationStatus,
      created_at: new Date(String(row.created_at)),
      reviewed_at: row.reviewed_at ? new Date(String(row.reviewed_at)) : null
    };
  }
}

