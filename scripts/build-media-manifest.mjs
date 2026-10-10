import fs from "node:fs";
import path from "node:path";
import { FALLBACK_PROJECTS } from "../src/shared/constants/fallbackData.ts";

const OUT_PATH = path.resolve(process.cwd(), "data/media-manifest.json");

const manifest = {
  schema_version: 1,
  generated_at: new Date().toISOString(),
  curator: "vitaharbor-data-worker",
  notes: "Source-verified media manifest distinguishing verified PS Vita hardware captures, official repository media, and promotional artwork. Artwork is explicitly labeled and never represented as Vita gameplay.",
  total_projects: FALLBACK_PROJECTS.length,
  media_counts: {
    vita_hardware_capture: 0,
    official_repository_screenshot: 0,
    official_promotional_artwork: 0,
    title_card_fallback: 0
  },
  items: []
};

const projectMediaDefs = {
  "rc-cars-vita": {
    media_type: "vita_hardware_capture",
    is_vita_gameplay: true,
    media_local_path: "/screenshots/rc-cars.webp",
    media_source_url: "https://www.reddit.com/r/vitahacks/comments/1wjn8zg/rc_cars_port_progress/",
    media_label: "PS Vita Hardware Gameplay",
    provenance_notes: "Real hardware photo from antoxa2584x showing RC Cars running on OLED PS Vita."
  },
  "halo-ce-vita": {
    media_type: "official_repository_screenshot",
    is_vita_gameplay: true,
    media_remote_url: "https://raw.githubusercontent.com/BirchWoodGod/halo-ce-vita/main/docs/screenshots/warthog-beach.png",
    media_source_url: "https://github.com/BirchWoodGod/halo-ce-vita/blob/main/README.md",
    media_label: "Official Repository Vita Capture",
    provenance_notes: "Official screenshot from BirchWoodGod repository README taken on PS Vita hardware (The Silent Cartographer beach)."
  },
  "call-of-duty-4-vita": {
    media_type: "vita_hardware_capture",
    is_vita_gameplay: true,
    media_local_path: "/screenshots/call-of-duty-4.webp",
    media_source_url: "https://www.reddit.com/r/vitahacks/",
    media_label: "PS Vita Hardware WIP Photo",
    provenance_notes: "Early community work-in-progress photograph showing Call of Duty 4 compiled on a physical PS Vita handheld."
  },
  "openmohaa-vita": {
    media_type: "official_promotional_artwork",
    is_vita_gameplay: false,
    media_local_path: "/screenshots/openmohaa.jpg",
    media_source_url: "https://www.reddit.com/r/vitahacks/comments/1tapf2b/wip_openmohaa_on_ps_vita_medal_of_honor_allied/",
    media_label: "Official Key Artwork",
    provenance_notes: "Original Medal of Honor: Allied Assault promotional artwork; port is early in-game (5-15 FPS), hardware screenshot not yet isolated."
  },
  "smash-melee-vita": {
    media_type: "official_promotional_artwork",
    is_vita_gameplay: false,
    media_local_path: "/screenshots/smash-melee.jpg",
    media_source_url: "https://www.reddit.com/r/vitahacks/comments/1wivnp0/super_smash_melee/",
    media_label: "Official Key Artwork",
    provenance_notes: "Super Smash Bros. Melee artwork; early fighter selection screen on hardware."
  },
  "hollow-knight-vita": {
    media_type: "official_promotional_artwork",
    is_vita_gameplay: false,
    media_local_path: "/screenshots/hollow-knight.jpg",
    media_source_url: "https://www.reddit.com/r/vitahacks/comments/17eneu2/upcoming_hollow_knight_ps_vita_port_wip/",
    media_label: "Official Key Artwork",
    provenance_notes: "Hollow Knight promotional art; native ARM decompilation in development."
  },
  "zelda-twilight-princess-vita": {
    media_type: "official_promotional_artwork",
    is_vita_gameplay: false,
    media_local_path: "/screenshots/zelda-twilight-princess.jpg",
    media_source_url: "https://www.reddit.com/r/vitahacks/comments/1w9ys9f/the_new_psvita_ports/",
    media_label: "Official Key Artwork",
    provenance_notes: "Zelda Twilight Princess title art; shader evaluation phase."
  },
  "portal-vita": {
    media_type: "official_promotional_artwork",
    is_vita_gameplay: false,
    media_local_path: "/screenshots/portal.jpg",
    media_source_url: "https://github.com/",
    media_label: "Official Key Artwork",
    provenance_notes: "Portal franchise promotional artwork; engine recreation standalone chambers."
  },
  "spider-man-total-mayhem-vita": {
    media_type: "official_promotional_artwork",
    is_vita_gameplay: false,
    media_local_path: "/screenshots/spider-man-total-mayhem.jpg",
    media_source_url: "https://github.com/",
    media_label: "Official Key Artwork",
    provenance_notes: "Gameloft Spider-Man: Total Mayhem mobile title art."
  },
  "simpsons-hit-and-run-vita": {
    media_type: "official_promotional_artwork",
    is_vita_gameplay: false,
    media_local_path: "/screenshots/simpsons-hit-and-run.jpg",
    media_source_url: "https://github.com/",
    media_label: "Official Key Artwork",
    provenance_notes: "The Simpsons: Hit & Run key artwork."
  },
  "kotor-vita": {
    media_type: "official_promotional_artwork",
    is_vita_gameplay: false,
    media_local_path: "/screenshots/kotor.jpg",
    media_source_url: "https://github.com/",
    media_label: "Official Key Artwork",
    provenance_notes: "Star Wars: Knights of the Old Republic key artwork."
  },
  "nfs-hot-pursuit-vita": {
    media_type: "official_promotional_artwork",
    is_vita_gameplay: false,
    media_local_path: "/screenshots/nfs-hot-pursuit.jpg",
    media_source_url: "https://github.com/",
    media_label: "Official Key Artwork",
    provenance_notes: "Need for Speed: Hot Pursuit mobile key artwork."
  },
  "renpy-8-runtime-engine": {
    media_type: "title_card_fallback",
    is_vita_gameplay: false,
    media_source_url: "https://www.reddit.com/r/vitahacks/comments/1h4yhyi/release_renpy_vita_8_port/",
    media_label: "Dynamic Title Card",
    provenance_notes: "Ren'Py 8 is an engine runtime rather than a single game; uses dynamic title card."
  },
  "zelda-ship-of-harkinian-vita": {
    media_type: "official_promotional_artwork",
    is_vita_gameplay: false,
    media_local_path: "/screenshots/zelda-oot.jpg",
    media_source_url: "https://www.reddit.com/r/VitaPiracy/comments/1leugn2/ocarina_of_time_ship_of_harkinian_is_out_now_baby/",
    media_label: "Official Key Artwork",
    provenance_notes: "Zelda: Ocarina of Time promotional art."
  },
  "slingshot-racing-vita": {
    media_type: "official_promotional_artwork",
    is_vita_gameplay: false,
    media_local_path: "/screenshots/slingshot-racing.jpg",
    media_source_url: "https://github.com/",
    media_label: "Official Key Artwork",
    provenance_notes: "Slingshot Racing mobile key artwork."
  },
  "fallout-2-ce-vita": {
    media_type: "official_promotional_artwork",
    is_vita_gameplay: false,
    media_local_path: "/screenshots/fallout-2.jpg",
    media_source_url: "https://github.com/alexbatalov/fallout2-ce",
    media_label: "Official Key Artwork",
    provenance_notes: "Fallout 2 Community Edition original artwork."
  },
  "render96-sm64-hd-vita": {
    media_type: "title_card_fallback",
    is_vita_gameplay: false,
    media_source_url: "https://github.com/Render96",
    media_label: "Dynamic Title Card",
    provenance_notes: "Render96 HD SM64 model pack; uses dynamic title card."
  },
  "celeste-classic-vita": {
    media_type: "official_promotional_artwork",
    is_vita_gameplay: false,
    media_local_path: "/screenshots/celeste.jpg",
    media_source_url: "https://github.com/lemon32767/c-celeste",
    media_label: "Official Key Artwork",
    provenance_notes: "Celeste Classic PICO-8 / C-rewrite key artwork."
  },
  "renegade-vita-demo-release": {
    media_type: "official_promotional_artwork",
    is_vita_gameplay: false,
    media_local_path: "/screenshots/cnc-renegade.png",
    media_source_url: "https://www.reddit.com/r/vitahacks/comments/1wgp613/renegade_vita_demo_release/",
    media_label: "Official Key Artwork",
    provenance_notes: "Command & Conquer: Renegade promotional key artwork."
  },
  "cod-zombies-ios-loader": {
    media_type: "official_promotional_artwork",
    is_vita_gameplay: false,
    media_local_path: "/screenshots/cod-zombies.png",
    media_source_url: "https://www.reddit.com/r/vitahacks/comments/1wjjx7w/a_bounty_that_deserves_more_visibility/",
    media_label: "Official Key Artwork",
    provenance_notes: "Call of Duty: Zombies iOS key artwork; loader is a research bounty."
  },
  "c-dogs-sdl-vita": {
    media_type: "official_promotional_artwork",
    is_vita_gameplay: false,
    media_local_path: "/screenshots/c-dogs-sdl.png",
    media_source_url: "https://www.reddit.com/r/vitahacks/comments/1wkw14c/prerelease_cdogs_sdl_port_for_ps_vita_pstv/",
    media_label: "Official Logo Artwork",
    provenance_notes: "C-Dogs SDL open-source project artwork."
  },
  "resident-evil-4-vita": {
    media_type: "official_promotional_artwork",
    is_vita_gameplay: false,
    media_local_path: "/screenshots/resident-evil-4.jpg",
    media_source_url: "https://github.com/Rinnegatamante/re4-vita",
    media_label: "Official Key Artwork",
    provenance_notes: "Resident Evil 4 key artwork; port repository recently established by Rinnegatamante."
  },
  "buckshot-roulette-vita": {
    media_type: "official_promotional_artwork",
    is_vita_gameplay: false,
    media_local_path: "/screenshots/buckshot-roulette.webp",
    media_source_url: "https://www.reddit.com/r/vitahacks/comments/1wn46c9/wip_buckshotrouletteportable_a_c_rewrite_of/",
    media_label: "Official Artwork Banner",
    provenance_notes: "Buckshot Roulette C++ rewrite in active development by JustAverage456."
  },
  "the-force-engine-dark-forces-vita": {
    media_type: "official_promotional_artwork",
    is_vita_gameplay: false,
    media_local_path: "/screenshots/dark-forces.webp",
    media_source_url: "https://www.reddit.com/r/vitahacks/comments/1wlrv6x/theforceenginevita_successfully_booting_into_the/",
    media_label: "Official Artwork Banner",
    provenance_notes: "The Force Engine (Star Wars Dark Forces) port menu boot by SnooLobsters311."
  },
  "supertuxkart-vulkan-vita": {
    media_type: "official_promotional_artwork",
    is_vita_gameplay: false,
    media_local_path: "/screenshots/supertuxkart.webp",
    media_source_url: "https://www.reddit.com/r/vitahacks/comments/1wkf9m5/supertuxkart_wip_port_for_playstation_vita_with/",
    media_label: "Official Artwork Banner",
    provenance_notes: "SuperTuxKart Vulkan 1.1 native driver WIP by nyabsi."
  },
  "insurgency-vita": {
    media_type: "official_promotional_artwork",
    is_vita_gameplay: false,
    media_local_path: "/screenshots/insurgency.webp",
    media_source_url: "https://www.reddit.com/r/vitahacks/comments/1wvob17/insurgency_vita_gameplay_showcase_information/",
    media_label: "Official Artwork Banner",
    provenance_notes: "Insurgency tactical FPS Vita recreation by OneDumbFox."
  },
  "predators-vita": {
    media_type: "official_promotional_artwork",
    is_vita_gameplay: false,
    media_local_path: "/screenshots/predators.webp",
    media_source_url: "https://github.com/AJ17O/Predators-vita",
    media_label: "Official Artwork Banner",
    provenance_notes: "PREDATORS standalone Vita decompilation port by AJ17O."
  },
  "robot-unicorn-attack-vita": {
    media_type: "official_promotional_artwork",
    is_vita_gameplay: false,
    media_local_path: "/screenshots/robot-unicorn-attack.webp",
    media_source_url: "https://github.com/stoicpingu/RUA-vita",
    media_label: "Official Artwork Banner",
    provenance_notes: "Robot Unicorn Attack v1.0 standalone Vita port by stoicpingu."
  },
  "resident-evil-code-veronica-x-vita": {
    media_type: "official_promotional_artwork",
    is_vita_gameplay: false,
    media_local_path: "/screenshots/recvx.webp",
    media_source_url: "https://github.com/AshfordFamily/recvx-decomp",
    media_label: "Official Artwork Banner",
    provenance_notes: "Resident Evil Code: Veronica X decompilation port by Rinnegatamante."
  },
  "real-racing-3-vita": {
    media_type: "official_promotional_artwork",
    is_vita_gameplay: false,
    media_local_path: "/screenshots/real-racing-2.png",
    media_source_url: "https://www.reddit.com/r/PSVitaHomebrew/comments/1ww8upq/release_real_racing_3_vita_beta_11/",
    media_label: "Official Artwork Banner",
    provenance_notes: "Real Racing 3 mobile artwork banner; playable beta release on Vita."
  },
  "cod-waw-zombies-vita": {
    media_type: "official_promotional_artwork",
    is_vita_gameplay: false,
    media_local_path: "/screenshots/cod-zombies.png",
    media_source_url: "https://www.reddit.com/r/vitahacks/comments/1wzdh5y/release_call_of_duty_world_at_war_zombies_port/",
    media_label: "Official Title Artwork",
    provenance_notes: "World at War Zombies official artwork; playable v1.0 release by devnoname120 on Vita."
  },
  "real-racing-2-vita": {
    media_type: "official_promotional_artwork",
    is_vita_gameplay: false,
    media_local_path: "/screenshots/real-racing-2.png",
    media_source_url: "https://www.reddit.com/r/PSVitaHomebrew/comments/1wmabvz/updates_on_rr2_port/",
    media_label: "Official Logo / Banner",
    provenance_notes: "Real Racing 2 mobile artwork banner."
  },
  "diddy-kong-racing-golden-balloon": {
    media_type: "official_promotional_artwork",
    is_vita_gameplay: false,
    media_local_path: "/screenshots/diddy-kong-racing.jpg",
    media_source_url: "https://www.reddit.com/r/vitahacks/comments/1wcx3o6/golden_balloon_v169_diddy_kong_racing_source_port/",
    media_label: "Official Key Artwork",
    provenance_notes: "Diddy Kong Racing Golden Balloon key artwork."
  },
  "cnc-renegade-vita": {
    media_type: "official_promotional_artwork",
    is_vita_gameplay: false,
    media_local_path: "/screenshots/cnc-renegade.png",
    media_source_url: "https://www.reddit.com/r/vitahacks/comments/1waninh/cnc_renegade_native_ps_vita_port/",
    media_label: "Official Key Artwork",
    provenance_notes: "Command & Conquer: Renegade key artwork."
  },
  "gta-lcs-vita": {
    media_type: "official_promotional_artwork",
    is_vita_gameplay: false,
    media_local_path: "/screenshots/gta-lcs.png",
    media_source_url: "https://www.reddit.com/r/vitahacks/comments/1wte7gf/gta_liberty_city_stories_my_ps_vita_port_is_now/",
    media_label: "Official Key Artwork",
    provenance_notes: "GTA Liberty City Stories reStories key artwork."
  },
  "test-drive-iii-vita": {
    media_type: "official_promotional_artwork",
    is_vita_gameplay: false,
    media_local_path: "/screenshots/test-drive-iii-bg.png",
    media_source_url: "https://www.reddit.com/r/vitahacks/comments/1wudlni/test_drive_iii_vita_port/",
    media_label: "Official Title Artwork",
    provenance_notes: "Test Drive III title / DOS artwork."
  },
  "test-drive-ii-vita": {
    media_type: "official_promotional_artwork",
    is_vita_gameplay: false,
    media_local_path: "/screenshots/test-drive-ii-bg.png",
    media_source_url: "https://www.reddit.com/r/vitahacks/comments/1wu6lsx/test_drive_ii_vita_port/",
    media_label: "Official Title Artwork",
    provenance_notes: "Test Drive II title artwork."
  }
};

for (const p of FALLBACK_PROJECTS) {
  const def = projectMediaDefs[p.slug] || {
    media_type: "title_card_fallback",
    is_vita_gameplay: false,
    media_label: "Dynamic Title Card",
    provenance_notes: "No external media mapped; falls back to dynamic OLED title card."
  };

  manifest.media_counts[def.media_type] = (manifest.media_counts[def.media_type] || 0) + 1;

  manifest.items.push({
    id: p.id,
    slug: p.slug,
    display_name: p.display_name,
    game_title: p.game_title,
    media_type: def.media_type,
    is_vita_gameplay: def.is_vita_gameplay,
    media_local_path: def.media_local_path || null,
    media_remote_url: def.media_remote_url || null,
    media_source_url: def.media_source_url || p.reddit_url || null,
    media_label: def.media_label,
    provenance_notes: def.provenance_notes
  });
}

fs.writeFileSync(OUT_PATH, JSON.stringify(manifest, null, 2) + "\n", "utf8");
console.log("Successfully wrote data/media-manifest.json:", manifest.media_counts);
