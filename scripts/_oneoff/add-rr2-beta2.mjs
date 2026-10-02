import fs from "node:fs";

let code = fs.readFileSync("src/shared/constants/fallbackData.ts", "utf8");

code = code.replace(
  "last_activity_at: new Date('2026-09-21T11:39:44.312Z'),",
  "last_activity_at: new Date('2026-10-02T10:00:00.000Z'),"
);

const newUpdate = `  },
  {
    id: "upd_rr2_vita_beta2",
    port_project_id: 35,
    project_slug: "real-racing-2-vita",
    project_display_name: "Real Racing 2 (RR2 Vita Port)",
    developer_display_name: "chutA7X",
    developer_slug: "chuta7x",
    event_type: "technical_progress",
    title: "Real Racing 2 Beta 2 update adds 30/60 FPS toggle and 2x/4x MSAA",
    summary: "chutA7X published the Beta 2 update for Real Racing 2 on PS Vita, featuring 30/60 FPS options, 2x or 4x multi-sample anti-aliasing (MSAA), and improved performance.",
    event_at: new Date('2026-10-02T10:00:00.000Z'),
    verification_level: "community_report",
    sources: [
      { source_item_id: "src_rr2_beta2_reddit", relationship: "community", canonical_url: "https://www.reddit.com/r/VitaPiracy/comments/1wvfxzk/real_racing_2_new_update_psvita_beta_2_3060_fps/" }
    ]
  }`;

code = code.replace(
  '    sources: [\n      { source_item_id: "src_upd_halo_ce_decomp_pc_and_android_vita_repo", relationship: "primary", canonical_url: "https://github.com/cybersecurity/halo-ce-universal" },\n      { source_item_id: "src_upd_halo_ce_decomp_pc_and_android_vita_reddit", relationship: "community", canonical_url: "https://www.reddit.com/r/PSVitaHomebrew/comments/1wtm0y6/halo_ce_decomp_pc_and_android/" }\n    ]\n  }\n];',
  '    sources: [\n      { source_item_id: "src_upd_halo_ce_decomp_pc_and_android_vita_repo", relationship: "primary", canonical_url: "https://github.com/cybersecurity/halo-ce-universal" },\n      { source_item_id: "src_upd_halo_ce_decomp_pc_and_android_vita_reddit", relationship: "community", canonical_url: "https://www.reddit.com/r/PSVitaHomebrew/comments/1wtm0y6/halo_ce_decomp_pc_and_android/" }\n    ]\n' + newUpdate + '\n];'
);

fs.writeFileSync("src/shared/constants/fallbackData.ts", code, "utf8");
console.log("OK: updated fallbackData.ts with Real Racing 2 Beta 2");
