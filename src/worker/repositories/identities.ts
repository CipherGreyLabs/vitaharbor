import type { DeveloperIdentity, SourceType } from "../../shared/types";

export interface CreateIdentityInput {
  developer_id: number;
  provider?: SourceType;
  provider_user_id?: string | null;
  username: string;
  profile_url?: string | null;
  is_primary?: boolean;
  valid_from?: Date | null;
  valid_until?: Date | null;
}

export class DeveloperIdentitiesRepository {
  constructor(private db: D1Database) {}

  async findByDeveloperId(developerId: number): Promise<DeveloperIdentity[]> {
    const rows = await this.db
      .prepare("SELECT * FROM developer_identities WHERE developer_id = ? ORDER BY is_primary DESC")
      .bind(developerId)
      .all<Record<string, unknown>>();
    return (rows.results || []).map((r) => this.mapRow(r));
  }

  async findByUsername(provider: SourceType, username: string): Promise<DeveloperIdentity | null> {
    const row = await this.db
      .prepare("SELECT * FROM developer_identities WHERE provider = ? AND LOWER(username) = LOWER(?)")
      .bind(provider, username.trim())
      .first<Record<string, unknown>>();
    return row ? this.mapRow(row) : null;
  }

  async create(input: CreateIdentityInput): Promise<DeveloperIdentity> {
    const now = new Date().toISOString();
    const provider = input.provider ?? "reddit";
    const validFrom = input.valid_from ? input.valid_from.toISOString() : null;
    const validUntil = input.valid_until ? input.valid_until.toISOString() : null;

    const result = await this.db
      .prepare(
        `INSERT INTO developer_identities (
          developer_id, provider, provider_user_id, username, profile_url,
          is_primary, valid_from, valid_until, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        input.developer_id,
        provider,
        input.provider_user_id ?? null,
        input.username.trim(),
        input.profile_url ?? null,
        input.is_primary ? 1 : 0,
        validFrom,
        validUntil,
        now,
        now
      )
      .run();

    const id = Number(result.meta.last_row_id);
    return {
      id,
      developer_id: input.developer_id,
      provider,
      provider_user_id: input.provider_user_id ?? null,
      username: input.username.trim(),
      profile_url: input.profile_url ?? null,
      is_primary: Boolean(input.is_primary),
      valid_from: input.valid_from ?? null,
      valid_until: input.valid_until ?? null,
      created_at: new Date(now),
      updated_at: new Date(now)
    };
  }

  private mapRow(row: Record<string, unknown>): DeveloperIdentity {
    return {
      id: Number(row.id),
      developer_id: Number(row.developer_id),
      provider: String(row.provider) as SourceType,
      provider_user_id: row.provider_user_id ? String(row.provider_user_id) : null,
      username: String(row.username),
      profile_url: row.profile_url ? String(row.profile_url) : null,
      is_primary: Boolean(row.is_primary),
      valid_from: row.valid_from ? new Date(String(row.valid_from)) : null,
      valid_until: row.valid_until ? new Date(String(row.valid_until)) : null,
      created_at: new Date(String(row.created_at)),
      updated_at: new Date(String(row.updated_at))
    };
  }
}

