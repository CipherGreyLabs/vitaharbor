export type DevelopmentStage =
  | "announced"
  | "research"
  | "early_wip"
  | "booting"
  | "in_game"
  | "playable"
  | "completable"
  | "released"
  | "unknown";

export type ProjectLifecycle =
  | "active"
  | "stalled"
  | "abandoned"
  | "archived"
  | "unknown";

export type ActivityLevel = "hot" | "active" | "quiet" | "dormant" | "stale";

export type VerificationLevel =
  | "developer_direct"
  | "maintainer_confirmed"
  | "community_report"
  | "unverified";

export type ObservationType =
  | "project_announced"
  | "technical_progress"
  | "first_boot"
  | "first_in_game"
  | "playability_progress"
  | "performance_progress"
  | "release"
  | "delay"
  | "stalled"
  | "resumed"
  | "abandoned"
  | "developer_statement"
  | "correction"
  | "other";

export type RelationshipType =
  | "depends_on"
  | "enables"
  | "fork_of"
  | "successor_of"
  | "related_to";

export type Role =
  | "lead"
  | "contributor"
  | "engine"
  | "maintainer"
  | "unknown";

export type SourceType = "reddit";

export type ItemType = "post" | "comment";

export type ModerationStatus = "pending" | "approved" | "rejected" | "ignored";

export interface Game {
  id: number;
  slug: string;
  title: string;
  normalized_title: string;
  original_release_year: number | null;
  original_platform: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface PortProject {
  id: number;
  game_id: number;
  slug: string;
  display_name: string | null;
  current_stage: DevelopmentStage;
  lifecycle: ProjectLifecycle;
  summary: string;
  playability_notes: string | null;
  performance_notes: string | null;
  first_seen_at: Date;
  last_activity_at: Date;
  released_at: Date | null;
  is_featured: boolean;
  is_archived: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Developer {
  id: number;
  slug: string;
  display_name: string;
  description: string | null;
  is_known_developer: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface DeveloperIdentity {
  id: number;
  developer_id: number;
  provider: SourceType;
  provider_user_id: string | null;
  username: string;
  profile_url: string | null;
  is_primary: boolean;
  valid_from: Date | null;
  valid_until: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface ProjectDeveloper {
  port_project_id: number;
  developer_id: number;
  role: Role;
  created_at: Date;
}

export type Technology = string;

export interface ProjectTechnology {
  port_project_id: number;
  technology: Technology;
}

export interface ProjectAlias {
  id: number;
  port_project_id: number;
  alias: string;
  normalized_alias: string;
  match_strength: number;
  requires_context: boolean;
  created_at: Date;
}

export interface ProjectRelationship {
  id: number;
  source_project_id: number;
  target_project_id: number;
  relationship_type: RelationshipType;
  created_at: Date;
}

export interface SourceItem {
  id: string;
  source_type: SourceType;
  external_id: string;
  external_fullname: string | null;
  item_type: ItemType;
  canonical_url: string;
  community: string;
  author_external_id: string | null;
  author_username: string | null;
  parent_external_id: string | null;
  root_thread_external_id: string | null;
  source_created_at: Date;
  source_edited_at: Date | null;
  content_hash: string | null;
  first_seen_at: Date;
  last_fetched_at: Date;
  deleted_at: Date | null;
  raw_expires_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface Observation {
  id: string;
  source_item_id: string;
  port_project_id: number | null;
  developer_id: number | null;
  observation_type: ObservationType;
  claim_text: string;
  suggested_stage: DevelopmentStage | null;
  suggested_lifecycle: ProjectLifecycle | null;
  confidence: number;
  verification_level: VerificationLevel;
  moderation_status: ModerationStatus;
  created_at: Date;
  reviewed_at: Date | null;
}

export interface Update {
  id: string;
  port_project_id: number;
  developer_id: number | null;
  event_type: ObservationType;
  title: string;
  summary: string;
  event_at: Date;
  verification_level: VerificationLevel;
  stage_before: DevelopmentStage | null;
  stage_after: DevelopmentStage | null;
  lifecycle_before: ProjectLifecycle | null;
  lifecycle_after: ProjectLifecycle | null;
  published: boolean;
  source_removed: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface UpdateSource {
  update_id: string;
  source_item_id: string;
  relationship: string;
  created_at: Date;
}

export interface DiscoveryItem {
  id: string;
  source_item_id: string;
  suggested_project_id: number | null;
  suggested_developer_id: number | null;
  confidence_score: number;
  moderation_status: ModerationStatus;
  created_at: Date;
  reviewed_at: Date | null;
}

export interface IngestionCursor {
  feed_key: string;
  cursor: string;
  updated_at: Date;
}

export interface IngestionRun {
  id: string;
  started_at: Date;
  finished_at: Date | null;
  status: "running" | "completed" | "failed";
  projects_affected: number;
  observations_created: number;
  updates_created: number;
  errors: string | null;
}

export interface FailedIngestionItem {
  id: string;
  source_item_id: string;
  error_message: string;
  retry_count: number;
  created_at: Date;
  last_retry_at: Date | null;
}

export interface AdminAuditLog {
  id: string;
  action: string;
  user_id: string | null;
  details: Record<string, unknown>;
  created_at: Date;
}
