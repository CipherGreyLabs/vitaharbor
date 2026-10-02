import fs from "node:fs";

let code = fs.readFileSync("src/shared/constants/fallbackData.ts", "utf8");

// Fix Test Drive III (id: 40)
code = code.replace(
  '    id: 40,\n    game_id: 40,\n    slug: "test-drive-iii-vita",\n    reddit_url: "https://www.reddit.com/r/vitahacks/comments/1wudlni/test_drive_iii_vita_port/",\n    repo_url: "https://github.com/smart-pickle/TestDriveIII-Vita",\n    display_name: "Test Drive III",\n    current_stage: "playable",\n    lifecycle: "active",\n    summary: "Community PlayStation Vita port of Test Drive III with source repository on GitHub.",\n    playability_notes: "Initial community release build boots campaign missions on Vita hardware with controller bindings and audio. Data files and language assets circulating in community releases.",',
  '    id: 40,\n    game_id: 40,\n    slug: "test-drive-iii-vita",\n    reddit_url: "https://www.reddit.com/r/vitahacks/comments/1wudlni/test_drive_iii_vita_port/",\n    repo_url: "https://github.com/smart-pickle/TestDriveIII-Vita",\n    display_name: "Test Drive III",\n    current_stage: "playable",\n    lifecycle: "active",\n    summary: "Community PlayStation Vita port of Test Drive III with source repository on GitHub.",\n    playability_notes: "Automatically promoted from verified community source with repository and code evidence.",'
);

// Fix Halo CE (id: 42)
code = code.replace(
  '    id: 42,\n    game_id: 42,\n    slug: "halo-ce-decomp-pc-and-android-vita",\n    reddit_url: "https://www.reddit.com/r/PSVitaHomebrew/comments/1wtm0y6/halo_ce_decomp_pc_and_android/",\n    repo_url: "https://github.com/cybersecurity/halo-ce-universal",\n    display_name: "Halo: Combat Evolved Vita",\n    current_stage: "playable",\n    lifecycle: "active",\n    summary: "PlayStation Vita port of Halo: Combat Evolved based on the universal decompilation project. Initial playable release build and data files surfaced on October 2, 2026.",\n    playability_notes: "Automatically promoted from verified community source with repository and code evidence.",',
  '    id: 42,\n    game_id: 42,\n    slug: "halo-ce-decomp-pc-and-android-vita",\n    reddit_url: "https://www.reddit.com/r/PSVitaHomebrew/comments/1wtm0y6/halo_ce_decomp_pc_and_android/",\n    repo_url: "https://github.com/cybersecurity/halo-ce-universal",\n    display_name: "Halo: Combat Evolved Vita",\n    current_stage: "playable",\n    lifecycle: "active",\n    summary: "PlayStation Vita port of Halo: Combat Evolved based on the universal decompilation project. Initial playable release build and data files surfaced on October 2, 2026.",\n    playability_notes: "Initial community release build boots campaign missions on Vita hardware with controller bindings and audio. Data files and language assets circulating in community releases.",'
);

fs.writeFileSync("src/shared/constants/fallbackData.ts", code, "utf8");
console.log("OK: fixed both notes");
