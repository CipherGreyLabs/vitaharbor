import type { Env } from "../../index";
import {
  ProjectsRepository,
  DevelopersRepository,
  ProjectAliasesRepository,
  AdminAuditLogRepository,
  UpdatesRepository
} from "../../repositories";

export interface ProjectMergeResult {
  source_project_id: number;
  target_project_id: number;
  records_migrated: {
    updates: number;
    observations: number;
    stage_history: number;
    developers: number;
  };
}

export class ProjectMergeService {
  constructor(
    private env: Env,
    private projectsRepo: ProjectsRepository,
    private devRepo: DevelopersRepository,
    private aliasesRepo: ProjectAliasesRepository,
    private auditRepo: AdminAuditLogRepository,
    private updatesRepo: UpdatesRepository
  ) {}

  /**
   * Merges a duplicate source project into an authoritative target project.
   */
  async mergeProjects(
    sourceProjectId: number,
    targetProjectId: number,
    adminUserId: string | null = null
  ): Promise<ProjectMergeResult> {
    const [sourceProject, targetProject] = await Promise.all([
      this.projectsRepo.findById(sourceProjectId),
      this.projectsRepo.findById(targetProjectId)
    ]);

    if (!sourceProject || !targetProject) {
      throw new Error("Source or target project not found");
    }

    if (sourceProjectId === targetProjectId) {
      throw new Error("Cannot merge a project into itself");
    }

    // 1. Move updates
    const updatesRes = await this.env.DB
      .prepare("UPDATE updates SET port_project_id = ? WHERE port_project_id = ?")
      .bind(targetProjectId, sourceProjectId)
      .run();

    // 2. Move observations
    const obsRes = await this.env.DB
      .prepare("UPDATE observations SET port_project_id = ? WHERE port_project_id = ?")
      .bind(targetProjectId, sourceProjectId)
      .run();

    // 3. Move stage history
    const stageRes = await this.env.DB
      .prepare("UPDATE project_stage_history SET port_project_id = ? WHERE port_project_id = ?")
      .bind(targetProjectId, sourceProjectId)
      .run();

    // 4. Move project developers
    const devRes = await this.env.DB
      .prepare("UPDATE OR IGNORE project_developers SET port_project_id = ? WHERE port_project_id = ?")
      .bind(targetProjectId, sourceProjectId)
      .run();

    // 5. Add alias of source project to target project
    if (sourceProject.display_name) {
      await this.aliasesRepo.addAlias(targetProjectId, sourceProject.display_name, 2);
    }

    // 6. Archive source project
    await this.projectsRepo.update(sourceProjectId, {
      is_archived: true,
      lifecycle: "archived"
    });

    // 7. Audit log
    await this.auditRepo.record("merge_projects", adminUserId, {
      source_project_id: sourceProjectId,
      target_project_id: targetProjectId,
      source_slug: sourceProject.slug,
      target_slug: targetProject.slug
    });

    return {
      source_project_id: sourceProjectId,
      target_project_id: targetProjectId,
      records_migrated: {
        updates: updatesRes.meta.changes,
        observations: obsRes.meta.changes,
        stage_history: stageRes.meta.changes,
        developers: devRes.meta.changes
      }
    };
  }

  /**
   * Reverts a published update.
   */
  async revertUpdate(updateId: string, adminUserId: string | null = null): Promise<void> {
    const update = await this.updatesRepo.findById(updateId);
    if (!update) throw new Error("Update not found");

    await this.env.DB
      .prepare("UPDATE updates SET published = 0 WHERE id = ?")
      .bind(updateId)
      .run();

    await this.auditRepo.record("revert_update", adminUserId, {
      update_id: updateId,
      project_id: update.port_project_id
    });
  }
}

