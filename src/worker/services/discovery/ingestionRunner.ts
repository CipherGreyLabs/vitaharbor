import type { Env } from "../../index";
import { RedditClient } from "../reddit/redditClient";
import { DiscoveryEngine } from "./discoveryEngine";
import {
  SourceItemsRepository,
  ObservationsRepository,
  DiscoveryItemsRepository,
  ProjectsRepository,
  GamesRepository,
  DeveloperIdentitiesRepository,
  ProjectAliasesRepository
} from "../../repositories";
import { generateId } from "../../../shared/utils";
import { DEFAULT_SUBREDDITS } from "../../../shared/constants";

export interface IngestionRunSummary {
  runId: string;
  status: "completed" | "failed";
  itemsProcessed: number;
  observationsCreated: number;
  errors?: string;
}

export class IngestionRunner {
  constructor(private env: Env) {}

  async runPoll(subreddits: string[] = DEFAULT_SUBREDDITS): Promise<IngestionRunSummary> {
    const runId = generateId();
    const startedAt = new Date().toISOString();

    const redditClient = new RedditClient({
      clientId: this.env.REDDIT_CLIENT_ID,
      clientSecret: this.env.REDDIT_CLIENT_SECRET,
      userAgent: this.env.REDDIT_USER_AGENT,
      refreshToken: this.env.REDDIT_REFRESH_TOKEN,
      maxRequestsPerRun: 40
    });

    const sourceRepo = new SourceItemsRepository(this.env.DB);
    const obsRepo = new ObservationsRepository(this.env.DB);
    const discoveryRepo = new DiscoveryItemsRepository(this.env.DB);
    const projectsRepo = new ProjectsRepository(this.env.DB);
    const gamesRepo = new GamesRepository(this.env.DB);
    const identitiesRepo = new DeveloperIdentitiesRepository(this.env.DB);
    const aliasesRepo = new ProjectAliasesRepository(this.env.DB);

    const engine = new DiscoveryEngine(
      sourceRepo,
      obsRepo,
      discoveryRepo,
      projectsRepo,
      gamesRepo,
      identitiesRepo,
      aliasesRepo
    );

    // Record run start in D1
    await this.env.DB
      .prepare(
        `INSERT INTO ingestion_runs (id, started_at, status, projects_affected, observations_created, updates_created, errors)
         VALUES (?, ?, 'running', 0, 0, 0, NULL)`
      )
      .bind(runId, startedAt)
      .run();

    let itemsCount = 0;
    let obsCount = 0;
    const errorsList: string[] = [];

    try {
      for (const sub of subreddits) {
        if (redditClient.getBudgetRemaining() <= 0) break;

        // Fetch new submissions
        const posts = await redditClient.fetchSubredditNew(sub, 25);
        for (const post of posts) {
          try {
            itemsCount++;
            const res = await engine.processItem(post);
            if (res.observation) {
              obsCount++;
            }
          } catch (itemErr) {
            errorsList.push(String(itemErr));
          }
        }
      }

      const finishedAt = new Date().toISOString();
      await this.env.DB
        .prepare(
          `UPDATE ingestion_runs SET
            finished_at = ?, status = 'completed', observations_created = ?, errors = ?
           WHERE id = ?`
        )
        .bind(finishedAt, obsCount, errorsList.length > 0 ? errorsList.join("; ") : null, runId)
        .run();

      return {
        runId,
        status: "completed",
        itemsProcessed: itemsCount,
        observationsCreated: obsCount,
        errors: errorsList.join("; ") || undefined
      };
    } catch (globalErr) {
      const finishedAt = new Date().toISOString();
      const errMsg = String(globalErr);
      await this.env.DB
        .prepare(
          `UPDATE ingestion_runs SET
            finished_at = ?, status = 'failed', errors = ?
           WHERE id = ?`
        )
        .bind(finishedAt, errMsg, runId)
        .run();

      return {
        runId,
        status: "failed",
        itemsProcessed: itemsCount,
        observationsCreated: obsCount,
        errors: errMsg
      };
    }
  }
}

