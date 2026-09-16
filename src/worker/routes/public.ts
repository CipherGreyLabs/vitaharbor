import { Hono } from "hono";
import type { Env } from "../index";
import {
  GamesRepository,
  ProjectsRepository,
  DevelopersRepository,
  DeveloperIdentitiesRepository,
  ProjectDevelopersRepository,
  ProjectAliasesRepository,
  StageHistoryRepository,
  TechnologiesRepository,
  UpdatesRepository,
  ProjectRelationsRepository
} from "../repositories";
import type { DevelopmentStage, ProjectLifecycle } from "../../shared/types";

export const publicApi = new Hono<{ Bindings: Env }>();

// GET /api/stats - Summary statistics for homepage
publicApi.get("/stats", async (c) => {
  const projectsRepo = new ProjectsRepository(c.env.DB);
  const devRepo = new DevelopersRepository(c.env.DB);
  const updatesRepo = new UpdatesRepository(c.env.DB);

  const [allProjects, allDevs, recentUpdates] = await Promise.all([
    projectsRepo.list({ limit: 1000 }),
    devRepo.list(1000),
    updatesRepo.listRecent(10, 0, true)
  ]);

  const activeCount = allProjects.filter((p) => p.lifecycle === "active").length;
  const playableCount = allProjects.filter((p) => p.current_stage === "playable" || p.current_stage === "completable" || p.current_stage === "released").length;
  const releasedCount = allProjects.filter((p) => p.current_stage === "released").length;

  return c.json({
    total_projects: allProjects.length,
    active_projects: activeCount,
    playable_or_better: playableCount,
    released_projects: releasedCount,
    total_developers: allDevs.length,
    recent_updates_count: recentUpdates.length
  });
});

// GET /api/projects - Filterable & searchable projects index
publicApi.get("/projects", async (c) => {
  const stage = c.req.query("stage") as DevelopmentStage | undefined;
  const lifecycle = c.req.query("lifecycle") as ProjectLifecycle | undefined;
  const search = c.req.query("search");
  const isFeatured = c.req.query("featured") ? c.req.query("featured") === "true" : undefined;
  const limit = Math.min(Number(c.req.query("limit") || 20), 100);
  const offset = Number(c.req.query("offset") || 0);

  const projectsRepo = new ProjectsRepository(c.env.DB);
  const gamesRepo = new GamesRepository(c.env.DB);
  const techRepo = new TechnologiesRepository(c.env.DB);
  const projDevRepo = new ProjectDevelopersRepository(c.env.DB);
  const devRepo = new DevelopersRepository(c.env.DB);

  const projects = await projectsRepo.list({
    stage,
    lifecycle,
    search,
    is_featured: isFeatured,
    limit,
    offset
  });

  const enriched = await Promise.all(
    projects.map(async (p) => {
      const [game, technologies, projectDevs] = await Promise.all([
        gamesRepo.findById(p.game_id),
        techRepo.findByProject(p.id),
        projDevRepo.findByProject(p.id)
      ]);

      const developers = await Promise.all(
        projectDevs.map(async (pd) => {
          const dev = await devRepo.findById(pd.developer_id);
          return {
            id: pd.developer_id,
            role: pd.role,
            display_name: dev?.display_name || "Unknown Developer",
            slug: dev?.slug || ""
          };
        })
      );

      return {
        ...p,
        game_title: game?.title || "Unknown Game",
        original_platform: game?.original_platform || null,
        original_release_year: game?.original_release_year || null,
        technologies,
        developers
      };
    })
  );

  return c.json({
    projects: enriched,
    limit,
    offset
  });
});

// GET /api/projects/:slug - Detailed project view
publicApi.get("/projects/:slug", async (c) => {
  const slug = c.req.param("slug");
  const projectsRepo = new ProjectsRepository(c.env.DB);
  const gamesRepo = new GamesRepository(c.env.DB);
  const techRepo = new TechnologiesRepository(c.env.DB);
  const projDevRepo = new ProjectDevelopersRepository(c.env.DB);
  const devRepo = new DevelopersRepository(c.env.DB);
  const stageRepo = new StageHistoryRepository(c.env.DB);
  const updatesRepo = new UpdatesRepository(c.env.DB);
  const aliasesRepo = new ProjectAliasesRepository(c.env.DB);
  const relsRepo = new ProjectRelationsRepository(c.env.DB);

  const project = await projectsRepo.findBySlug(slug);
  if (!project) {
    return c.json({ error: "Project not found" }, 404);
  }

  const [game, technologies, projectDevs, stageHistory, updates, aliases, relations] =
    await Promise.all([
      gamesRepo.findById(project.game_id),
      techRepo.findByProject(project.id),
      projDevRepo.findByProject(project.id),
      stageRepo.findByProject(project.id),
      updatesRepo.findByProject(project.id, true),
      aliasesRepo.findByProject(project.id),
      relsRepo.findByProject(project.id)
    ]);

  const developers = await Promise.all(
    projectDevs.map(async (pd) => {
      const dev = await devRepo.findById(pd.developer_id);
      return {
        id: pd.developer_id,
        role: pd.role,
        display_name: dev?.display_name || "Unknown Developer",
        slug: dev?.slug || ""
      };
    })
  );

  const updatesWithSources = await Promise.all(
    updates.map(async (u) => {
      const sources = await updatesRepo.getSourcesForUpdate(u.id);
      return {
        ...u,
        sources
      };
    })
  );

  return c.json({
    project: {
      ...project,
      game_title: game?.title || "Unknown Game",
      original_platform: game?.original_platform || null,
      original_release_year: game?.original_release_year || null,
      technologies,
      developers,
      aliases: aliases.map((a) => a.alias),
      stage_history: stageHistory,
      updates: updatesWithSources,
      relations
    }
  });
});

// GET /api/developers - Developers listing
publicApi.get("/developers", async (c) => {
  const limit = Math.min(Number(c.req.query("limit") || 50), 100);
  const offset = Number(c.req.query("offset") || 0);

  const devRepo = new DevelopersRepository(c.env.DB);
  const identitiesRepo = new DeveloperIdentitiesRepository(c.env.DB);
  const projDevRepo = new ProjectDevelopersRepository(c.env.DB);
  const projectsRepo = new ProjectsRepository(c.env.DB);

  const developers = await devRepo.list(limit, offset);

  const enriched = await Promise.all(
    developers.map(async (dev) => {
      const [identities, projDevs] = await Promise.all([
        identitiesRepo.findByDeveloperId(dev.id),
        projDevRepo.findByDeveloper(dev.id)
      ]);

      const projects = await Promise.all(
        projDevs.map(async (pd) => {
          const p = await projectsRepo.findById(pd.port_project_id);
          return {
            id: pd.port_project_id,
            slug: p?.slug || "",
            display_name: p?.display_name || "",
            current_stage: p?.current_stage || "unknown",
            role: pd.role
          };
        })
      );

      return {
        ...dev,
        identities: identities.map((i) => ({ provider: i.provider, username: i.username })),
        projects
      };
    })
  );

  return c.json({
    developers: enriched,
    limit,
    offset
  });
});

// GET /api/developers/:slug - Developer detail
publicApi.get("/developers/:slug", async (c) => {
  const slug = c.req.param("slug");
  const devRepo = new DevelopersRepository(c.env.DB);
  const identitiesRepo = new DeveloperIdentitiesRepository(c.env.DB);
  const projDevRepo = new ProjectDevelopersRepository(c.env.DB);
  const projectsRepo = new ProjectsRepository(c.env.DB);

  const developer = await devRepo.findBySlug(slug);
  if (!developer) {
    return c.json({ error: "Developer not found" }, 404);
  }

  const [identities, projDevs] = await Promise.all([
    identitiesRepo.findByDeveloperId(developer.id),
    projDevRepo.findByDeveloper(developer.id)
  ]);

  const projects = await Promise.all(
    projDevs.map(async (pd) => {
      const p = await projectsRepo.findById(pd.port_project_id);
      return {
        id: pd.port_project_id,
        slug: p?.slug || "",
        display_name: p?.display_name || "",
        current_stage: p?.current_stage || "unknown",
        lifecycle: p?.lifecycle || "unknown",
        summary: p?.summary || "",
        role: pd.role
      };
    })
  );

  return c.json({
    developer: {
      ...developer,
      identities,
      projects
    }
  });
});

// GET /api/updates - Recent public updates feed
publicApi.get("/updates", async (c) => {
  const limit = Math.min(Number(c.req.query("limit") || 20), 50);
  const offset = Number(c.req.query("offset") || 0);

  const updatesRepo = new UpdatesRepository(c.env.DB);
  const projectsRepo = new ProjectsRepository(c.env.DB);
  const devRepo = new DevelopersRepository(c.env.DB);

  const updates = await updatesRepo.listRecent(limit, offset, true);

  const enriched = await Promise.all(
    updates.map(async (u) => {
      const [project, dev, sources] = await Promise.all([
        projectsRepo.findById(u.port_project_id),
        u.developer_id ? devRepo.findById(u.developer_id) : Promise.resolve(null),
        updatesRepo.getSourcesForUpdate(u.id)
      ]);

      return {
        ...u,
        project_slug: project?.slug || "",
        project_display_name: project?.display_name || "Unknown Project",
        developer_display_name: dev?.display_name || null,
        developer_slug: dev?.slug || null,
        sources
      };
    })
  );

  return c.json({
    updates: enriched,
    limit,
    offset
  });
});

