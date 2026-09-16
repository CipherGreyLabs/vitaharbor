import type { AdminAuditLog } from "../../shared/types";
import { generateId } from "../../shared/utils";

export class AdminAuditLogRepository {
  constructor(private db: D1Database) {}

  async record(action: string, userId: string | null = null, details: Record<string, unknown> = {}): Promise<AdminAuditLog> {
    const id = generateId();
    const now = new Date().toISOString();
    const jsonDetails = JSON.stringify(details);

    await this.db
      .prepare(
        `INSERT INTO admin_audit_log (id, action, user_id, details, created_at)
         VALUES (?, ?, ?, ?, ?)`
      )
      .bind(id, action, userId, jsonDetails, now)
      .run();

    return {
      id,
      action,
      user_id: userId,
      details,
      created_at: new Date(now)
    };
  }

  async listRecent(limit = 50, offset = 0): Promise<AdminAuditLog[]> {
    const rows = await this.db
      .prepare("SELECT * FROM admin_audit_log ORDER BY created_at DESC LIMIT ? OFFSET ?")
      .bind(limit, offset)
      .all<Record<string, unknown>>();
    return (rows.results || []).map((r) => {
      let parsedDetails: Record<string, unknown> = {};
      try {
        if (typeof r.details === "string") {
          parsedDetails = JSON.parse(r.details);
        } else if (typeof r.details === "object" && r.details !== null) {
          parsedDetails = r.details as Record<string, unknown>;
        }
      } catch {
        parsedDetails = {};
      }

      return {
        id: String(r.id),
        action: String(r.action),
        user_id: r.user_id ? String(r.user_id) : null,
        details: parsedDetails,
        created_at: new Date(String(r.created_at))
      };
    });
  }
}

