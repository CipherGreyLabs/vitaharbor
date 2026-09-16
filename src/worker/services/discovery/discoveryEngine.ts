import type { SourceItem, DiscoveryItem, Observation } from "../../../shared/types";
import {
  SourceItemsRepository,
  ObservationsRepository,
  DiscoveryItemsRepository,
  ProjectsRepository,
  GamesRepository,
  DeveloperIdentitiesRepository,
  ProjectAliasesRepository
} from "../../repositories";
import { scoreContent } from "./discoveryScorer";
import { ProjectMatcher } from "../matching/projectMatcher";
import { DeveloperMatcher } from "../matching/developerMatcher";
import { contentHash } from "../../../shared/utils";
import type { NormalizedRedditPost, NormalizedRedditComment } from "../reddit/redditClient";

export interface IngestionItemResult {
  sourceItem: SourceItem;
  observation?: Observation;
  discoveryItem?: DiscoveryItem;
  isRelevant: boolean;
}

export class DiscoveryEngine {
  private projectMatcher = new ProjectMatcher();
  private developerMatcher = new DeveloperMatcher();

  constructor(
    private sourceItemsRepo: SourceItemsRepository,
    private observationsRepo: ObservationsRepository,
    private discoveryRepo: DiscoveryItemsRepository,
    private projectsRepo: ProjectsRepository,
    private gamesRepo: GamesRepository,
    private identitiesRepo: DeveloperIdentitiesRepository,
    private aliasesRepo: ProjectAliasesRepository
  ) {}

  /**
   * Processes a normalized Reddit submission or comment through scoring and candidate matching.
   */
  async processItem(item: NormalizedRedditPost | NormalizedRedditComment): Promise<IngestionItemResult> {
    const existing = await this.sourceItemsRepo.findByExternalId("reddit", item.externalId);
    const textToScore = item.itemType === "post" ? `${item.title} ${item.body}` : item.body;
    const hash = contentHash(textToScore);

    let sourceItem: SourceItem;
    if (existing) {
      sourceItem = existing;
      await this.sourceItemsRepo.updateLastFetched(existing.id);
    } else {
      sourceItem = await this.sourceItemsRepo.create({
        source_type: "reddit",
        external_id: item.externalId,
        external_fullname: item.fullname,
        item_type: item.itemType,
        canonical_url: item.canonicalUrl,
        community: item.subreddit,
        author_username: item.author,
        parent_external_id: "parentExternalId" in item ? item.parentExternalId : null,
        root_thread_external_id: "rootThreadExternalId" in item ? item.rootThreadExternalId : null,
        source_created_at: item.createdAt,
        source_edited_at: item.editedAt,
        content_hash: hash
      });
    }

    const title = item.itemType === "post" ? item.title : "";
    const scoreRes = scoreContent(title, item.body);

    if (!scoreRes.isRelevant) {
      return { sourceItem, isRelevant: false };
    }

    // Load matching context
    const [allProjects, allGames] = await Promise.all([
      this.projectsRepo.list({ limit: 1000 }),
      this.gamesRepo.list(1000)
    ]);

    const projectMatch = this.projectMatcher.match(textToScore, allProjects, allGames);

    // Match developer identity
    const devIdentities = await this.identitiesRepo.findByDeveloperId(projectMatch?.projectId || 0);
    const devMatch = this.developerMatcher.match(item.author, devIdentities);

    // Create observation
    const observation = await this.observationsRepo.create({
      source_item_id: sourceItem.id,
      port_project_id: projectMatch ? projectMatch.projectId : null,
      developer_id: devMatch ? devMatch.developerId : null,
      observation_type: scoreRes.suggestedType,
      claim_text: textToScore.slice(0, 500),
      suggested_stage: scoreRes.suggestedStage,
      confidence: scoreRes.score,
      verification_level: devMatch ? "developer_direct" : "community_report",
      moderation_status: "pending"
    });

    // Create discovery item for moderation queue
    const discoveryItem = await this.discoveryRepo.create({
      source_item_id: sourceItem.id,
      suggested_project_id: projectMatch ? projectMatch.projectId : null,
      suggested_developer_id: devMatch ? devMatch.developerId : null,
      confidence_score: scoreRes.score,
      moderation_status: "pending"
    });

    return {
      sourceItem,
      observation,
      discoveryItem,
      isRelevant: true
    };
  }
}

