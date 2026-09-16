import type { VerificationLevel, Update, SourceItem } from "../../../shared/types";
import {
  SourceItemsRepository,
  ObservationsRepository,
  UpdatesRepository,
  DeveloperIdentitiesRepository,
  AdminAuditLogRepository
} from "../../repositories";

export interface ReconcileDeletionResult {
  source_item_id: string;
  updates_marked_removed: string[];
  updates_retained_with_other_sources: string[];
}

export class ProvenanceService {
  constructor(
    private sourceItemsRepo: SourceItemsRepository,
    private observationsRepo: ObservationsRepository,
    private updatesRepo: UpdatesRepository,
    private identitiesRepo: DeveloperIdentitiesRepository,
    private auditRepo: AdminAuditLogRepository
  ) {}

  /**
   * Evaluates the verification level based on source authorship and project developer identities.
   * Rules from Blueprint Section 32:
   * - developer_direct: Known linked developer identity made the statement
   * - maintainer_confirmed: Maintainer independently confirmed evidence
   * - community_report: Relevant community post/comment with evidence
   * - unverified: Incomplete or uncertain evidence
   */
  async determineVerificationLevel(
    sourceItem: SourceItem,
    targetDeveloperId: number | null,
    isMaintainerReviewed = false
  ): Promise<VerificationLevel> {
    if (sourceItem.deleted_at) {
      return "unverified";
    }

    if (sourceItem.author_username && targetDeveloperId) {
      const identities = await this.identitiesRepo.findByDeveloperId(targetDeveloperId);
      const isDirectMatch = identities.some(
        (id) =>
          id.provider === sourceItem.source_type &&
          id.username.toLowerCase() === sourceItem.author_username?.toLowerCase()
      );
      if (isDirectMatch) {
        return "developer_direct";
      }
    }

    if (isMaintainerReviewed) {
      return "maintainer_confirmed";
    }

    if (sourceItem.author_username || sourceItem.canonical_url) {
      return "community_report";
    }

    return "unverified";
  }

  /**
   * Promotes an approved observation into a public verified Update.
   */
  async promoteObservationToUpdate(
    observationId: string,
    title: string,
    summary: string,
    eventAt: Date = new Date(),
    adminUserId: string | null = null
  ): Promise<Update | null> {
    const observation = await this.observationsRepo.findById(observationId);
    if (!observation || !observation.port_project_id) {
      return null;
    }

    const sourceItem = await this.sourceItemsRepo.findById(observation.source_item_id);
    if (!sourceItem) {
      return null;
    }

    const verificationLevel = await this.determineVerificationLevel(
      sourceItem,
      observation.developer_id,
      true
    );

    const update = await this.updatesRepo.create({
      port_project_id: observation.port_project_id,
      developer_id: observation.developer_id,
      event_type: observation.observation_type,
      title,
      summary,
      event_at: eventAt,
      verification_level: verificationLevel,
      stage_after: observation.suggested_stage,
      lifecycle_after: observation.suggested_lifecycle,
      published: true
    });

    // Link source item as primary source
    await this.updatesRepo.linkSource(update.id, sourceItem.id, "primary");

    // Mark observation as approved
    await this.observationsRepo.updateModerationStatus(observationId, "approved");

    // Audit log
    await this.auditRepo.record("promote_observation", adminUserId, {
      observation_id: observationId,
      update_id: update.id,
      project_id: observation.port_project_id
    });

    return update;
  }

  /**
   * Reconciles deletion of a Reddit source item according to Blueprint Section 52 & 53.
   * If an update has remaining valid sources, it is retained; otherwise marked as source_removed.
   */
  async reconcileSourceDeletion(sourceItemId: string, adminUserId: string | null = null): Promise<ReconcileDeletionResult> {
    await this.sourceItemsRepo.markDeleted(sourceItemId);

    const result: ReconcileDeletionResult = {
      source_item_id: sourceItemId,
      updates_marked_removed: [],
      updates_retained_with_other_sources: []
    };

    // Find observations derived from this source
    const observations = await this.observationsRepo.findBySourceItem(sourceItemId);
    for (const obs of observations) {
      if (obs.moderation_status === "pending") {
        await this.observationsRepo.updateModerationStatus(obs.id, "rejected");
      }
    }

    // Find updates referencing this source
    const allUpdates = await this.updatesRepo.listRecent(500, 0, false);
    for (const update of allUpdates) {
      const sources = await this.updatesRepo.getSourcesForUpdate(update.id);
      const isReferenced = sources.some((s) => s.source_item_id === sourceItemId);

      if (isReferenced) {
        // Check if there are other valid non-deleted sources
        let hasOtherValidSource = false;
        for (const s of sources) {
          if (s.source_item_id !== sourceItemId) {
            const src = await this.sourceItemsRepo.findById(s.source_item_id);
            if (src && !src.deleted_at) {
              hasOtherValidSource = true;
              break;
            }
          }
        }

        if (hasOtherValidSource) {
          result.updates_retained_with_other_sources.push(update.id);
        } else {
          await this.updatesRepo.markSourceRemoved(update.id);
          result.updates_marked_removed.push(update.id);
        }
      }
    }

    await this.auditRepo.record("reconcile_source_deletion", adminUserId, {
      source_item_id: sourceItemId,
      affected_updates_removed: result.updates_marked_removed,
      retained_updates: result.updates_retained_with_other_sources
    });

    return result;
  }
}
