import type { Env } from "../../index";
import { SourceItemsRepository, AdminAuditLogRepository } from "../../repositories";

export class MaintenanceService {
  constructor(private env: Env) {}

  async runDailyMaintenance(): Promise<{ purgedRawCount: number }> {
    const sourceRepo = new SourceItemsRepository(this.env.DB);
    const auditRepo = new AdminAuditLogRepository(this.env.DB);

    const expiredItems = await sourceRepo.listExpiredRaw(new Date());

    let purgedCount = 0;
    for (const item of expiredItems) {
      // Clear content hash and raw content metadata
      await this.env.DB
        .prepare("UPDATE source_items SET content_hash = NULL WHERE id = ?")
        .bind(item.id)
        .run();
      purgedCount++;
    }

    // Clean old rejected discovery items older than 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    await this.env.DB
      .prepare("DELETE FROM discovery_items WHERE moderation_status = 'rejected' AND created_at < ?")
      .bind(thirtyDaysAgo)
      .run();

    await auditRepo.record("daily_maintenance", "system", {
      purged_raw_count: purgedCount,
      timestamp: new Date().toISOString()
    });

    return { purgedRawCount: purgedCount };
  }
}

