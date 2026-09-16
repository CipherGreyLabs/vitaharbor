import { Hono } from "hono";
import type { Env } from "../index";
import {
  GamesRepository,
  ProjectsRepository,
  DevelopersRepository,
  ObservationsRepository,
  DiscoveryItemsRepository,
  SourceItemsRepository,
  AdminAuditLogRepository,
  UpdatesRepository,
  DeveloperIdentitiesRepository
} from "../repositories";
import { ProvenanceService } from "../services/provenance/provenanceService";

export const adminApi = new Hono<{ Bindings: Env }>();

// Simple authentication middleware (Supports Cloudflare Access header or Bearer Token)
adminApi.use("*", async (c, next) => {
  const cfUser = c.req.header("CF-Access-Authenticated-User-Email");
  const authHeader = c.req.header("Authorization");

  // In production, require CF-Access or valid authorization
  const isDev = !c.env.ENVIRONMENT || c.env.ENVIRONMENT === "development";
  const isAuthenticated = Boolean(cfUser || authHeader || isDev);

  if (!isAuthenticated) {
    return c.json({ error: "Unauthorized access" }, 401);
  }

  await next();
});

// GET /api/admin/moderation/queue - Pending moderation discoveries
adminApi.get("/moderation/queue", async (c) => {
  const discoveryRepo = new DiscoveryItemsRepository(c.env.DB);
  const obsRepo = new ObservationsRepository(c.env.DB);
  const sourceRepo = new SourceItemsRepository(c.env.DB);
  const projectsRepo = new ProjectsRepository(c.env.DB);
  const devRepo = new DevelopersRepository(c.env.DB);

  const pendingDiscoveries = await discoveryRepo.listPending(50);

  const items = await Promise.all(
    pendingDiscoveries.map(async (disc) => {
      const [sourceItem, project, dev, observations] = await Promise.all([
        sourceRepo.findById(disc.source_item_id),
        disc.suggested_project_id ? projectsRepo.findById(disc.suggested_project_id) : Promise.resolve(null),
        disc.suggested_developer_id ? devRepo.findById(disc.suggested_developer_id) : Promise.resolve(null),
        obsRepo.findBySourceItem(disc.source_item_id)
      ]);

      return {
        ...disc,
        source_item: sourceItem,
        suggested_project: project,
        suggested_developer: dev,
        observations
      };
    })
  );

  return c.json({ items });
});

// POST /api/admin/moderation/:id/approve - Approve discovery and publish update
adminApi.post("/moderation/:id/approve", async (c) => {
  const id = c.req.param("id");
  const body = (await c.req.json()) as {
    title?: string;
    summary?: string;
    project_id?: number;
    developer_id?: number;
  };

  const discoveryRepo = new DiscoveryItemsRepository(c.env.DB);
  const obsRepo = new ObservationsRepository(c.env.DB);
  const sourceRepo = new SourceItemsRepository(c.env.DB);
  const updatesRepo = new UpdatesRepository(c.env.DB);
  const identitiesRepo = new DeveloperIdentitiesRepository(c.env.DB);
  const auditRepo = new AdminAuditLogRepository(c.env.DB);
  const projectsRepo = new ProjectsRepository(c.env.DB);

  const discovery = await discoveryRepo.findById(id);
  if (!discovery) {
    return c.json({ error: "Discovery item not found" }, 404);
  }

  const observations = await obsRepo.findBySourceItem(discovery.source_item_id);
  const primaryObs = observations[0];

  const projectId = body.project_id || discovery.suggested_project_id || primaryObs?.port_project_id;
  if (!projectId) {
    return c.json({ error: "Cannot approve discovery without a linked project ID" }, 400);
  }

  const sourceItem = await sourceRepo.findById(discovery.source_item_id);
  const provService = new ProvenanceService(sourceRepo, obsRepo, updatesRepo, identitiesRepo, auditRepo);

  const title = body.title || primaryObs?.claim_text.slice(0, 80) || "Development milestone update";
  const summary = body.summary || primaryObs?.claim_text || "Progress reported via community source.";

  let update = null;
  if (primaryObs) {
    update = await provService.promoteObservationToUpdate(primaryObs.id, title, summary, new Date(), "admin");
  } else {
    update = await updatesRepo.create({
      port_project_id: projectId,
      developer_id: body.developer_id || discovery.suggested_developer_id,
      event_type: "technical_progress",
      title,
      summary,
      event_at: new Date(),
      published: true
    });
    if (sourceItem) {
      await updatesRepo.linkSource(update.id, sourceItem.id, "primary");
    }
  }

  // Update project last_activity_at
  await projectsRepo.update(projectId, { last_activity_at: new Date() });

  // Mark discovery approved
  await discoveryRepo.updateStatus(id, "approved");

  return c.json({ status: "approved", update });
});

// POST /api/admin/moderation/:id/reject - Reject discovery item
adminApi.post("/moderation/:id/reject", async (c) => {
  const id = c.req.param("id");
  const discoveryRepo = new DiscoveryItemsRepository(c.env.DB);
  const auditRepo = new AdminAuditLogRepository(c.env.DB);

  const discovery = await discoveryRepo.findById(id);
  if (!discovery) {
    return c.json({ error: "Discovery item not found" }, 404);
  }

  await discoveryRepo.updateStatus(id, "rejected");
  await auditRepo.record("reject_discovery", "admin", { discovery_id: id });

  return c.json({ status: "rejected" });
});

// POST /api/admin/projects - Create Game & Project
adminApi.post("/projects", async (c) => {
  const body = (await c.req.json()) as {
    game_title: string;
    original_platform?: string;
    original_release_year?: number;
    project_display_name?: string;
    summary?: string;
    current_stage?: string;
    is_featured?: boolean;
  };

  if (!body.game_title) {
    return c.json({ error: "game_title is required" }, 400);
  }

  const gamesRepo = new GamesRepository(c.env.DB);
  const projectsRepo = new ProjectsRepository(c.env.DB);
  const auditRepo = new AdminAuditLogRepository(c.env.DB);

  const game = await gamesRepo.create({
    title: body.game_title,
    original_platform: body.original_platform,
    original_release_year: body.original_release_year
  });

  const project = await projectsRepo.create({
    game_id: game.id,
    display_name: body.project_display_name || body.game_title,
    summary: body.summary || "",
    current_stage: (body.current_stage as any) || "announced",
    is_featured: Boolean(body.is_featured)
  });

  await auditRepo.record("create_project", "admin", { game_id: game.id, project_id: project.id });

  return c.json({ game, project });
});

// GET /api/admin/audit-log - List recent audit events
adminApi.get("/audit-log", async (c) => {
  const auditRepo = new AdminAuditLogRepository(c.env.DB);
  const logs = await auditRepo.listRecent(50);
  return c.json({ logs });
});

