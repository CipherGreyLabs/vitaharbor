-- 0003_indexes.sql - Performance Indexes conforming to Blueprint Section 101

-- Games
CREATE INDEX IF NOT EXISTS idx_games_slug ON games(slug);
CREATE INDEX IF NOT EXISTS idx_games_normalized_title ON games(normalized_title);

-- Port Projects
CREATE INDEX IF NOT EXISTS idx_port_projects_slug ON port_projects(slug);
CREATE INDEX IF NOT EXISTS idx_port_projects_game_id ON port_projects(game_id);
CREATE INDEX IF NOT EXISTS idx_port_projects_current_stage ON port_projects(current_stage);
CREATE INDEX IF NOT EXISTS idx_port_projects_lifecycle ON port_projects(lifecycle);
CREATE INDEX IF NOT EXISTS idx_port_projects_last_activity_at ON port_projects(last_activity_at DESC);
CREATE INDEX IF NOT EXISTS idx_port_projects_is_featured ON port_projects(is_featured);

-- Project Aliases
CREATE INDEX IF NOT EXISTS idx_project_aliases_normalized_alias ON project_aliases(normalized_alias);
CREATE INDEX IF NOT EXISTS idx_project_aliases_project_id ON project_aliases(port_project_id);

-- Developers & Identities
CREATE INDEX IF NOT EXISTS idx_developers_slug ON developers(slug);
CREATE INDEX IF NOT EXISTS idx_developer_identities_provider ON developer_identities(provider);
CREATE INDEX IF NOT EXISTS idx_developer_identities_username ON developer_identities(username);
CREATE INDEX IF NOT EXISTS idx_developer_identities_dev_id ON developer_identities(developer_id);

-- Project Developers
CREATE INDEX IF NOT EXISTS idx_project_developers_project_id ON project_developers(port_project_id);
CREATE INDEX IF NOT EXISTS idx_project_developers_dev_id ON project_developers(developer_id);

-- Project Stage History
CREATE INDEX IF NOT EXISTS idx_project_stage_history_project_id ON project_stage_history(port_project_id);
CREATE INDEX IF NOT EXISTS idx_project_stage_history_effective_at ON project_stage_history(effective_at ASC);

-- Technologies
CREATE INDEX IF NOT EXISTS idx_project_technologies_proj_id ON project_technologies(port_project_id);
CREATE INDEX IF NOT EXISTS idx_project_technologies_tech_id ON project_technologies(technology_id);

-- Source Items
CREATE INDEX IF NOT EXISTS idx_source_items_source_type_ext ON source_items(source_type, external_id);
CREATE INDEX IF NOT EXISTS idx_source_items_root_thread_ext ON source_items(root_thread_external_id);
CREATE INDEX IF NOT EXISTS idx_source_items_last_fetched_at ON source_items(last_fetched_at DESC);
CREATE INDEX IF NOT EXISTS idx_source_items_raw_expires_at ON source_items(raw_expires_at);
CREATE INDEX IF NOT EXISTS idx_source_items_deleted_at ON source_items(deleted_at);

-- Observations
CREATE INDEX IF NOT EXISTS idx_observations_moderation_status ON observations(moderation_status);
CREATE INDEX IF NOT EXISTS idx_observations_port_project_id ON observations(port_project_id);
CREATE INDEX IF NOT EXISTS idx_observations_source_item_id ON observations(source_item_id);

-- Updates
CREATE INDEX IF NOT EXISTS idx_updates_port_project_id ON updates(port_project_id);
CREATE INDEX IF NOT EXISTS idx_updates_event_at ON updates(event_at DESC);
CREATE INDEX IF NOT EXISTS idx_updates_developer_id ON updates(developer_id);
CREATE INDEX IF NOT EXISTS idx_updates_published ON updates(published, source_removed);

-- Update Sources
CREATE INDEX IF NOT EXISTS idx_update_sources_source_id ON update_sources(source_item_id);

-- Discovery Items
CREATE INDEX IF NOT EXISTS idx_discovery_items_moderation_status ON discovery_items(moderation_status);
CREATE INDEX IF NOT EXISTS idx_discovery_items_source_id ON discovery_items(source_item_id);

