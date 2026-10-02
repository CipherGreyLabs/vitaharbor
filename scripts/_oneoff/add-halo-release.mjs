import fs from "node:fs";

let code = fs.readFileSync("src/shared/constants/fallbackData.ts", "utf8");

// Update project 42 (Halo CE)
code = code.replace(
  '    id: 42,\n    game_id: 42,\n    slug: "halo-ce-decomp-pc-and-android-vita",\n    reddit_url: "https://www.reddit.com/r/PSVitaHomebrew/comments/1wtm0y6/halo_ce_decomp_pc_and_android/",\n    repo_url: "https://github.com/cybersecurity/halo-ce-universal",\n    display_name: "Halo CE Decomp - Pc and Android",\n    current_stage: "announced",',
  '    id: 42,\n    game_id: 42,\n    slug: "halo-ce-decomp-pc-and-android-vita",\n    reddit_url: "https://www.reddit.com/r/PSVitaHomebrew/comments/1wtm0y6/halo_ce_decomp_pc_and_android/",\n    repo_url: "https://github.com/cybersecurity/halo-ce-universal",\n    display_name: "Halo: Combat Evolved Vita",\n    current_stage: "playable",'
);

code = code.replace(
  "    first_seen_at: new Date('2026-09-30T19:19:17.427Z'),\n    last_activity_at: new Date('2026-09-30T19:19:17.427Z'),\n    released_at: null,",
  "    first_seen_at: new Date('2026-09-30T19:19:17.427Z'),\n    last_activity_at: new Date('2026-10-02T02:00:00.000Z'),\n    released_at: new Date('2026-10-02T02:00:00.000Z'),"
);

code = code.replace(
  '    summary: "Community PlayStation Vita port of Halo CE Decomp - Pc and Android with source repository on GitHub.",',
  '    summary: "PlayStation Vita port of Halo: Combat Evolved based on the universal decompilation project. Initial playable release build and data files surfaced on October 2, 2026.",'
);

code = code.replace(
  '    playability_notes: "Automatically promoted from verified community source with repository and code evidence.",',
  '    playability_notes: "Initial community release build boots campaign missions on Vita hardware with controller bindings and audio. Data files and language assets circulating in community releases.",'
);

code = code.replace(
  '    stage_history: [\n      { id: 420, stage: "announced", effective_at: new Date(\'2026-09-30T19:19:17.427Z\'), reason: "Verified source port release/development on GitHub" }\n    ]',
  '    stage_history: [\n      { id: 420, stage: "announced", effective_at: new Date(\'2026-09-30T19:19:17.427Z\'), reason: "Port development surfaced on GitHub" },\n      { id: 421, stage: "playable", effective_at: new Date(\'2026-10-02T02:00:00.000Z\'), reason: "Initial community release build and data files published" }\n    ]'
);

// Add update entry to FALLBACK_UPDATES
const haloUpdate = `  },
  {
    id: "upd_halo_ce_vita_release",
    port_project_id: 42,
    project_slug: "halo-ce-decomp-pc-and-android-vita",
    project_display_name: "Halo: Combat Evolved Vita",
    developer_display_name: "karat46",
    developer_slug: "karat46",
    event_type: "release",
    title: "Halo: Combat Evolved Vita port release build and data files published",
    summary: "The first playable community release of the Halo: Combat Evolved Vita port arrived overnight on October 2, 2026, accompanied by data file installation packages and performance updates.",
    event_at: new Date('2026-10-02T02:00:00.000Z'),
    verification_level: "community_report",
    sources: [
      { source_item_id: "src_halo_ce_release_reddit", relationship: "primary", canonical_url: "https://www.reddit.com/r/VitaPiracy/comments/1wvhkaf/halo_ce_port_release/" },
      { source_item_id: "src_halo_ce_repo", relationship: "community", canonical_url: "https://github.com/cybersecurity/halo-ce-universal" }
    ]
  }`;

code = code.replace(
  '      { source_item_id: "src_rr2_beta2_reddit", relationship: "community", canonical_url: "https://www.reddit.com/r/VitaPiracy/comments/1wvfxzk/real_racing_2_new_update_psvita_beta_2_3060_fps/" }\n    ]\n  }\n];',
  '      { source_item_id: "src_rr2_beta2_reddit", relationship: "community", canonical_url: "https://www.reddit.com/r/VitaPiracy/comments/1wvfxzk/real_racing_2_new_update_psvita_beta_2_3060_fps/" }\n    ]\n' + haloUpdate + '\n];'
);

fs.writeFileSync("src/shared/constants/fallbackData.ts", code, "utf8");
console.log("OK: successfully applied Halo CE release updates!");
