-- 0001_initial.sql
CREATE TABLE games (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  normalized_title TEXT NOT NULL,
  original_release_year INTEGER,
  original_platform TEXT,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
);

CREATE TABLE port_projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  game_id INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  display_name TEXT,
  current_stage TEXT NOT NULL DEFAULT 'unknown',
  lifecycle TEXT NOT NULL DEFAULT 'unknown',
  summary TEXT NOT NULL DEFAULT '',
  playability_notes TEXT,
  performance_notes TEXT,
  first_seen_at DATETIME NOT NULL,
  last_activity_at DATETIME NOT NULL,
  released_at DATETIME,
  is_featured INTEGER NOT NULL DEFAULT 0,
  is_archived INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
);

CREATE TABLE developers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  is_known_developer INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
);

CREATE TABLE developer_identities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  developer_id INTEGER NOT NULL REFERENCES developers(id) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT 'reddit',
  provider_user_id TEXT,
  username TEXT NOT NULL,
  profile_url TEXT,
  is_primary INTEGER NOT NULL DEFAULT 1,
  valid_from DATETIME,
  valid_until DATETIME,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  UNIQUE(provider, provider_user_id)
);

CREATE TABLE project_developers (
  port_project_id INTEGER NOT NULL REFERENCES port_projects(id) ON DELETE CASCADE,
  developer_id INTEGER NOT NULL REFERENCES developers(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'unknown',
  created_at DATETIME NOT NULL,
  PRIMARY KEY (port_project_id, developer_id)
);

CREATE TABLE project_aliases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  port_project_id INTEGER NOT NULL REFERENCES port_projects(id) ON DELETE CASCADE,
  alias TEXT NOT NULL,
  normalized_alias TEXT NOT NULL,
  match_strength INTEGER NOT NULL DEFAULT 1,
  requires_context INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL,
  UNIQUE(port_project_id, normalized_alias)
);

CREATE TABLE project_stage_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  port_project_id INTEGER NOT NULL REFERENCES port_projects(id) ON DELETE CASCADE,
  stage TEXT NOT NULL,
  effective_at DATETIME NOT NULL,
  source_update_id INTEGER,
  reason TEXT,
  created_at DATETIME NOT NULL
);

CREATE TABLE project_relations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source_project_id INTEGER NOT NULL REFERENCES port_projects(id) ON DELETE CASCADE,
  target_project_id INTEGER NOT NULL REFERENCES port_projects(id) ON DELETE CASCADE,
  relationship_type TEXT NOT NULL,
  created_at DATETIME NOT NULL
);

CREATE TABLE technologies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE project_technologies (
  port_project_id INTEGER NOT NULL REFERENCES port_projects(id) ON DELETE CASCADE,
  technology_id INTEGER NOT NULL REFERENCES technologies(id) ON DELETE CASCADE,
  PRIMARY KEY (port_project_id, technology_id)
);

CREATE TABLE source_items (
  id TEXT PRIMARY KEY,
  source_type TEXT NOT NULL DEFAULT 'reddit',
  external_id TEXT NOT NULL,
  external_fullname TEXT,
  item_type TEXT NOT NULL CHECK(item_type IN ('post', 'comment')),
  canonical_url TEXT NOT NULL,
  community TEXT,
  author_external_id TEXT,
  author_username TEXT,
  parent_external_id TEXT,
  root_thread_external_id TEXT,
  source_created_at DATETIME NOT NULL,
  source_edited_at DATETIME,
  content_hash TEXT,
  first_seen_at DATETIME NOT NULL,
  last_fetched_at DATETIME NOT NULL,
  deleted_at DATETIME,
  raw_expires_at DATETIME,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  UNIQUE(source_type, external_id)
);

CREATE TABLE observations (
  id TEXT PRIMARY KEY,
  source_item_id TEXT NOT NULL REFERENCES source_items(id) ON DELETE CASCADE,
  port_project_id INTEGER REFERENCES port_projects(id) ON DELETE SET NULL,
  developer_id INTEGER REFERENCES developer_identities(id) ON DELETE SET NULL,
  observation_type TEXT NOT NULL,
  claim_text TEXT NOT NULL,
  suggested_stage TEXT,
  suggested_lifecycle TEXT,
  confidence REAL NOT NULL DEFAULT 0.5,
  verification_level TEXT NOT NULL DEFAULT 'unverified',
  moderation_status TEXT NOT NULL DEFAULT 'pending',
  created_at DATETIME NOT NULL,
  reviewed_at DATETIME
);

CREATE TABLE updates (
  id TEXT PRIMARY KEY,
  port_project_id INTEGER NOT NULL REFERENCES port_projects(id) ON DELETE CASCADE,
  developer_id INTEGER REFERENCES developer_identities(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  event_at DATETIME NOT NULL,
  verification_level TEXT NOT NULL DEFAULT 'unverified',
  stage_before TEXT,
  stage_after TEXT,
  lifecycle_before TEXT,
  lifecycle_after TEXT,
  published INTEGER NOT NULL DEFAULT 0,
  source_removed INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
);

CREATE TABLE update_sources (
  update_id TEXT NOT NULL REFERENCES updates(id) ON DELETE CASCADE,
  source_item_id TEXT NOT NULL REFERENCES source_items(id) ON DELETE CASCADE,
  relationship TEXT NOT NULL CHECK(relationship IN ('primary', 'supporting', 'confirmation')),
  created_at DATETIME NOT NULL,
  PRIMARY KEY (update_id, source_item_id)
);

CREATE TABLE discovery_items (
  id TEXT PRIMARY KEY,
  source_item_id TEXT NOT NULL REFERENCES source_items(id) ON DELETE CASCADE,
  suggested_project_id INTEGER REFERENCES port_projects(id) ON DELETE SET NULL,
  suggested_developer_id INTEGER REFERENCES developer_identities(id) ON DELETE SET NULL,
  confidence_score REAL NOT NULL DEFAULT 0.5,
  moderation_status TEXT NOT NULL DEFAULT 'pending',
  created_at DATETIME NOT NULL,
  reviewed_at DATETIME
);

CREATE TABLE ingestion_cursors (
  feed_key TEXT PRIMARY KEY,
  cursor TEXT NOT NULL,
  updated_at DATETIME NOT NULL
);

CREATE TABLE ingestion_runs (
  id TEXT PRIMARY KEY,
  started_at DATETIME NOT NULL,
  finished_at DATETIME,
  status TEXT NOT NULL CHECK(status IN ('running', 'completed', 'failed')),
  projects_affected INTEGER NOT NULL DEFAULT 0,
  observations_created INTEGER NOT NULL DEFAULT 0,
  updates_created INTEGER NOT NULL DEFAULT 0,
  errors TEXT
);

CREATE TABLE failed_ingestion_items (
  id TEXT PRIMARY KEY,
  source_item_id TEXT NOT NULL REFERENCES source_items(id) ON DELETE CASCADE,
  error_message TEXT NOT NULL,
  retry_count INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL,
  last_retry_at DATETIME
);

CREATE TABLE admin_audit_log (
  id TEXT PRIMARY KEY,
  action TEXT NOT NULL,
  user_id TEXT,
  details JSON,
  created_at DATETIME NOT NULL
);

