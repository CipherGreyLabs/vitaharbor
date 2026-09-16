import fs from "node:fs";

console.log("Seeding VitaHarbor development database...");

// Helper SQL statement for local testing seeds
const SEED_SQL = `
-- 1. Insert Games
INSERT OR IGNORE INTO games (id, slug, title, normalized_title, original_release_year, original_platform, created_at, updated_at) VALUES
(1, 'grand-theft-auto-san-andreas', 'Grand Theft Auto: San Andreas', 'grand theft auto: san andreas', 2004, 'PS2 / Android', datetime('now'), datetime('now')),
(2, 'max-payne', 'Max Payne', 'max payne', 2001, 'PC / Android', datetime('now'), datetime('now')),
(3, 'fallout-2', 'Fallout 2', 'fallout 2', 1998, 'PC', datetime('now'), datetime('now')),
(4, 'hollow-knight', 'Hollow Knight', 'hollow knight', 2017, 'PC', datetime('now'), datetime('now')),
(5, 'diablo', 'Diablo (DevilutionX)', 'diablo (devilutionx)', 1996, 'PC', datetime('now'), datetime('now')),
(6, 'super-mario-64', 'Super Mario 64', 'super mario 64', 1996, 'N64', datetime('now'), datetime('now'));

-- 2. Insert Port Projects
INSERT OR IGNORE INTO port_projects (id, game_id, slug, display_name, current_stage, lifecycle, summary, playability_notes, performance_notes, first_seen_at, last_activity_at, released_at, is_featured, is_archived, created_at, updated_at) VALUES
(1, 1, 'gta-san-andreas-vita', 'Grand Theft Auto: San Andreas Vita', 'released', 'active', 'Native ARM wrapper port of the Android build with custom OpenGL ES shaders.', 'Completable from start to finish with full audio, cutscenes and physical controls.', 'Solid 30 FPS with occasional drops during heavy weather/traffic. 960x544 resolution.', datetime('now', '-300 days'), datetime('now', '-5 days'), datetime('now', '-250 days'), 1, 0, datetime('now'), datetime('now')),
(2, 2, 'max-payne-vita', 'Max Payne Vita', 'playable', 'active', 'Port based on Android ARMv7 binary with vitaGL acceleration.', 'Full story campaign is playable. Bullet time and comic cutscenes functional.', 'Runs at smooth 30 FPS lock with MSAA 4x enabled.', datetime('now', '-400 days'), datetime('now', '-12 days'), datetime('now', '-350 days'), 1, 0, datetime('now'), datetime('now')),
(3, 3, 'fallout-2-ce-vita', 'Fallout 2 Community Edition', 'playable', 'active', 'Open-source recreation of Fallout 2 engine compiled natively for PlayStation Vita.', 'Fully playable. Supports custom touchscreen touch-controls for mouse cursor emulation.', 'Smooth 60 FPS in exploration and combat.', datetime('now', '-150 days'), datetime('now', '-2 days'), datetime('now', '-100 days'), 1, 0, datetime('now'), datetime('now')),
(4, 4, 'hollow-knight-vita', 'Hollow Knight Vita Port', 'booting', 'active', 'C# / Unity decompilation and native rebuild targeting Vita homebrew SDK.', 'Currently boots into menu and renders title screens. Asset loader optimization in progress.', 'Early WIP, unoptimized framerate.', datetime('now', '-60 days'), datetime('now', '-1 days'), NULL, 1, 0, datetime('now'), datetime('now')),
(5, 5, 'devilutionx-vita', 'DevilutionX Diablo', 'released', 'active', 'Cross-platform Diablo engine port with multiplayer and high-res scaling.', '100% playable, includes Hellfire expansion support and co-op LAN.', 'Rock solid 60 FPS.', datetime('now', '-500 days'), datetime('now', '-20 days'), datetime('now', '-400 days'), 0, 0, datetime('now'), datetime('now')),
(6, 6, 'sm64-vita', 'Super Mario 64 Vita', 'released', 'active', 'Decompiled Super Mario 64 PC port compiled natively for PlayStation Vita.', 'Completely playable with full 120 star completion.', 'Runs at flawless 60 FPS at native 960x544.', datetime('now', '-600 days'), datetime('now', '-45 days'), datetime('now', '-550 days'), 0, 0, datetime('now'), datetime('now'));

-- 3. Insert Developers
INSERT OR IGNORE INTO developers (id, slug, display_name, description, is_known_developer, created_at, updated_at) VALUES
(1, 'theflow', 'TheFloW', 'Renowned PlayStation Vita security researcher and port developer (GTA, Max Payne, Bully).', 1, datetime('now'), datetime('now')),
(2, 'rinnegatamante', 'Rinnegatamante', 'Creator of vitaGL and prolific Vita homebrew porter.', 1, datetime('now'), datetime('now')),
(3, 'alexbatalov', 'alexbatalov', 'Developer of Fallout 1 & 2 Community Edition engines.', 1, datetime('now'), datetime('now')),
(4, 'fgsfds', 'fgsfds', 'Homebrew developer responsible for numerous high-profile engine ports on Vita.', 1, datetime('now'), datetime('now'));

-- 4. Insert Developer Identities
INSERT OR IGNORE INTO developer_identities (id, developer_id, provider, username, profile_url, is_primary, created_at, updated_at) VALUES
(1, 1, 'reddit', 'TheOfficialFloW', 'https://reddit.com/user/TheOfficialFloW', 1, datetime('now'), datetime('now')),
(2, 2, 'reddit', 'Rinnegatamante', 'https://reddit.com/user/Rinnegatamante', 1, datetime('now'), datetime('now')),
(3, 4, 'reddit', 'fgsfds', 'https://reddit.com/user/fgsfds', 1, datetime('now'), datetime('now'));

-- 5. Insert Project Developers
INSERT OR IGNORE INTO project_developers (port_project_id, developer_id, role, created_at) VALUES
(1, 1, 'lead', datetime('now')),
(1, 2, 'maintainer', datetime('now')),
(2, 1, 'lead', datetime('now')),
(3, 3, 'lead', datetime('now')),
(6, 4, 'lead', datetime('now'));

-- 6. Insert Technologies
INSERT OR IGNORE INTO technologies (id, name) VALUES
(1, 'vitaGL'),
(2, 'ARMv7 Wrapper'),
(3, 'OpenGL ES 2.0'),
(4, 'Native C++');

INSERT OR IGNORE INTO project_technologies (port_project_id, technology_id) VALUES
(1, 1), (1, 2), (1, 3),
(2, 1), (2, 2),
(3, 4),
(6, 4);

-- 7. Insert Project Aliases
INSERT OR IGNORE INTO project_aliases (id, port_project_id, alias, normalized_alias, match_strength, requires_context, created_at) VALUES
(1, 1, 'GTA SA', 'gta sa', 2, 0, datetime('now')),
(2, 1, 'San Andreas', 'san andreas', 1, 0, datetime('now')),
(3, 2, 'Max Payne', 'max payne', 2, 0, datetime('now')),
(4, 3, 'FO2 Vita', 'fo2 vita', 2, 0, datetime('now')),
(5, 4, 'HK Vita', 'hk vita', 2, 0, datetime('now'));

-- 8. Insert Verified Updates
INSERT OR IGNORE INTO updates (id, port_project_id, developer_id, event_type, title, summary, event_at, verification_level, stage_before, stage_after, lifecycle_before, lifecycle_after, published, source_removed, created_at, updated_at) VALUES
('upd_1', 1, 1, 'release', 'GTA: San Andreas v2.1 Performance Patch Released', 'Added custom shader cache to reduce stuttering during flight missions and improved analog stick sensitivity.', datetime('now', '-5 days'), 'developer_direct', 'playable', 'released', 'active', 'active', 1, 0, datetime('now'), datetime('now')),
('upd_2', 3, 3, 'playability_progress', 'Touchscreen mouse cursor acceleration implemented', 'Added native touch gesture recognition for inventory management and pipboy navigation.', datetime('now', '-2 days'), 'developer_direct', 'early_wip', 'playable', 'active', 'active', 1, 0, datetime('now'), datetime('now')),
('upd_3', 4, NULL, 'first_boot', 'Hollow Knight title screen now boots on real hardware', 'Unity C# decompiled bytecode successfully translated to native ARM ELF and rendered initial splash screens.', datetime('now', '-1 days'), 'community_report', 'announced', 'booting', 'active', 'active', 1, 0, datetime('now'), datetime('now'));
`;

console.log("Seed data prepared. Applying through local D1 migration or wrangler execute.");
fs.writeFileSync("migrations/0002_seed.sql", SEED_SQL);
console.log("Wrote migrations/0002_seed.sql successfully.");
