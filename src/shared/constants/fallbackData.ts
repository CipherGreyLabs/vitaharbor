import type { Game } from "../types";

export const FALLBACK_GAMES: Game[] = [
  { id: 4, slug: "zelda-twilight-princess", title: "The Legend of Zelda: Twilight Princess", normalized_title: "the legend of zelda: twilight princess", original_release_year: 2006, original_platform: "GameCube / Wii Decomp", created_at: new Date('2026-09-17T15:34:00.000Z'), updated_at: new Date('2026-09-17T15:34:00.000Z') },
  { id: 5, slug: "portal-vita", title: "Portal (Source Engine / N64 Decomp)", normalized_title: "portal (source engine / n64 decomp)", original_release_year: 2007, original_platform: "PC", created_at: new Date('2026-09-17T15:34:00.000Z'), updated_at: new Date('2026-09-17T15:34:00.000Z') },
  { id: 6, slug: "spider-man-total-mayhem", title: "Spider-Man: Total Mayhem", normalized_title: "spider-man: total mayhem", original_release_year: 2010, original_platform: "Android ARMv7", created_at: new Date('2026-09-17T15:34:00.000Z'), updated_at: new Date('2026-09-17T15:34:00.000Z') },
  { id: 7, slug: "the-simpsons-hit-and-run", title: "The Simpsons: Hit & Run", normalized_title: "the simpsons: hit & run", original_release_year: 2003, original_platform: "PS2 / GameCube", created_at: new Date('2026-09-17T15:34:00.000Z'), updated_at: new Date('2026-09-17T15:34:00.000Z') },
  { id: 10, slug: "need-for-speed-hot-pursuit", title: "Need for Speed: Hot Pursuit", normalized_title: "need for speed: hot pursuit", original_release_year: 2010, original_platform: "Android", created_at: new Date('2026-09-17T15:34:00.000Z'), updated_at: new Date('2026-09-17T15:34:00.000Z') },
  { id: 12, slug: "renpy-8-runtime", title: "Ren'Py 8 Runtime (Python 3.11)", normalized_title: "ren'py 8 runtime (python 3.11)", original_release_year: 2024, original_platform: "Multiplatform Engine", created_at: new Date('2026-09-17T15:34:00.000Z'), updated_at: new Date('2026-09-17T15:34:00.000Z') },
  { id: 14, slug: "slingshot-racing", title: "Slingshot Racing", normalized_title: "slingshot racing", original_release_year: 2012, original_platform: "Android / iOS", created_at: new Date('2026-09-17T15:34:00.000Z'), updated_at: new Date('2026-09-17T15:34:00.000Z') },
  { id: 16, slug: "render96-sm64", title: "Render96 HD SM64 Vita", normalized_title: "render96 hd sm64 vita", original_release_year: 2020, original_platform: "PC Decomp", created_at: new Date('2026-09-17T15:34:00.000Z'), updated_at: new Date('2026-09-17T15:34:00.000Z') },
  { id: 17, slug: "celeste-classic", title: "Celeste Classic Vita", normalized_title: "celeste classic vita", original_release_year: 2016, original_platform: "PICO-8 / C", created_at: new Date('2026-09-17T15:34:00.000Z'), updated_at: new Date('2026-09-17T15:34:00.000Z') },
  { id: 20, slug: "rc-cars", title: "RC Cars", normalized_title: "rc cars", original_release_year: null, original_platform: "PC", created_at: new Date('2026-09-18T11:09:43.000Z'), updated_at: new Date('2026-09-18T15:20:00.000Z') },
  { id: 22, slug: "call-of-duty-zombies", title: "Call of Duty: Zombies", normalized_title: "call of duty: zombies", original_release_year: 2009, original_platform: "iOS", created_at: new Date('2026-09-18T07:54:45.000Z'), updated_at: new Date('2026-09-18T07:54:45.000Z') },
  { id: 27, slug: "call-of-duty-4-modern-warfare", title: "Call of Duty 4: Modern Warfare", normalized_title: "call of duty 4 modern warfare", original_release_year: 2007, original_platform: "PS3", created_at: new Date('2026-09-12T00:00:00.000Z'), updated_at: new Date('2026-09-12T00:00:00.000Z') },
  { id: 34, slug: "resident-evil-4-vita", title: "Resident Evil 4", normalized_title: "resident evil 4", original_release_year: 2005, original_platform: "GameCube / PS2 / Android", created_at: new Date('2026-09-21T00:00:00.000Z'), updated_at: new Date('2026-09-25T17:04:11.000Z') },
  { id: 35, slug: "real-racing-2", title: "Real Racing 2", normalized_title: "real racing 2", original_release_year: 2010, original_platform: "iOS / Android", created_at: new Date('2026-09-21T11:39:44.312Z'), updated_at: new Date('2026-09-21T11:39:44.312Z') },
  { id: 39, slug: "gta-liberty-city-stories", title: "GTA: Liberty City Stories (reStories)", normalized_title: "gta: liberty city stories (restories)", original_release_year: 2005, original_platform: "PSP / PS2", created_at: new Date('2026-09-29T16:07:11.000Z'), updated_at: new Date('2026-09-29T16:07:11.000Z') },
  { id: 44, slug: "real-racing-3", title: "Real Racing 3", normalized_title: "real racing 3", original_release_year: 2013, original_platform: "iOS / Android", created_at: new Date('2026-10-06T12:00:00.000Z'), updated_at: new Date('2026-10-06T12:00:00.000Z') },
  { id: 45, slug: "call-of-duty-world-at-war-zombies", title: "Call of Duty: World at War Zombies", normalized_title: "call of duty: world at war zombies", original_release_year: 2009, original_platform: "iOS", created_at: new Date('2026-10-07T08:00:00.000Z'), updated_at: new Date('2026-10-07T08:00:00.000Z') },
  { id: 46, slug: "buckshot-roulette", title: "Buckshot Roulette", normalized_title: "buckshot roulette", original_release_year: 2023, original_platform: "PC / Godot", created_at: new Date('2026-09-22T08:58:38.000Z'), updated_at: new Date('2026-09-22T08:58:38.000Z') },
  { id: 47, slug: "star-wars-dark-forces", title: "Star Wars: Dark Forces", normalized_title: "star wars: dark forces", original_release_year: 1995, original_platform: "PC / DOS", created_at: new Date('2026-09-20T20:24:59.000Z'), updated_at: new Date('2026-09-20T20:24:59.000Z') },
  { id: 48, slug: "supertuxkart", title: "SuperTuxKart", normalized_title: "supertuxkart", original_release_year: 2006, original_platform: "PC / Linux", created_at: new Date('2026-09-19T07:09:39.000Z'), updated_at: new Date('2026-09-19T07:09:39.000Z') },
  { id: 49, slug: "insurgency", title: "Insurgency", normalized_title: "insurgency", original_release_year: 2014, original_platform: "PC / Source Engine", created_at: new Date('2026-10-02T08:20:55.000Z'), updated_at: new Date('2026-10-02T08:20:55.000Z') },
  { id: 50, slug: "predators", title: "PREDATORS", normalized_title: "predators", original_release_year: 2010, original_platform: "Android / iOS", created_at: new Date('2026-10-10T02:00:00.000Z'), updated_at: new Date('2026-10-10T02:00:00.000Z') },
  { id: 51, slug: "robot-unicorn-attack", title: "Robot Unicorn Attack", normalized_title: "robot unicorn attack", original_release_year: 2010, original_platform: "Flash / Adult Swim", created_at: new Date('2026-10-09T18:00:00.000Z'), updated_at: new Date('2026-10-09T18:00:00.000Z') },
  { id: 52, slug: "resident-evil-code-veronica-x", title: "Resident Evil Code: Veronica X", normalized_title: "resident evil code: veronica x", original_release_year: 2001, original_platform: "PS2 / Dreamcast Decomp", created_at: new Date('2026-10-09T14:00:00.000Z'), updated_at: new Date('2026-10-09T14:00:00.000Z') }
,
  { id: 53, slug: "strikers-port-wip-vita", title: "Strikers port wip", normalized_title: "strikers port wip", original_release_year: null, original_platform: "Various", created_at: new Date('2026-10-08T09:40:22.000Z'), updated_at: new Date('2026-10-10T21:50:16.598Z') }
];

export const FALLBACK_PROJECTS: any[] = [
  {
    id: 4,
    game_id: 4,
    slug: "zelda-twilight-princess-vita",
    reddit_url: "https://www.reddit.com/r/vitahacks/comments/1w9ys9f/the_new_psvita_ports/",
    display_name: "Zelda: Twilight Princess Vita",
    current_stage: "early_wip",
    lifecycle: "active",
    summary: "Reverse-engineering project evaluating GC/Wii decompiled shaders on Vita hardware.",
    playability_notes: "Ordon Village test geometry compiled. Early rendering experiments show models and skybox.",
    performance_notes: "15–20 FPS in static test scenes. High RAM footprint requiring custom texture compression.",
    first_seen_at: new Date('2026-07-19T15:34:00.000Z'),
    last_activity_at: new Date('2026-09-15T15:34:00.000Z'),
    released_at: null,
    is_featured: true,
    is_archived: false,
    game_title: "The Legend of Zelda: Twilight Princess",
    original_platform: "GameCube / Wii Decomp",
    original_release_year: 2006,
    technologies: [
      "Decompilation",
      "vitaGL"
    ],
    developers: [
      {
        id: 2,
        role: "lead",
        display_name: "Community Decomp Team",
        slug: "community-decomp"
      }
    ],
    stage_history: [
      {
        id: 40,
        stage: "announced",
        effective_at: new Date('2026-07-19T15:34:00.000Z'),
        reason: "Port publicly announced / surfaced in community discussion"
      },
      {
        id: 41,
        stage: "research",
        effective_at: new Date('2026-08-15T07:53:12.000Z'),
        reason: "Reverse-engineering and shader research started"
      },
      {
        id: 42,
        stage: "early_wip",
        effective_at: new Date('2026-09-11T00:12:24.000Z'),
        reason: "First work-in-progress build compiled for ARM"
      }
    ]
  },
  {
    id: 5,
    game_id: 5,
    slug: "portal-vita",
    display_name: "Portal Vita Port",
    current_stage: "in_game",
    lifecycle: "active",
    summary: "Portal mechanics and chamber physics ported via standalone engine recreation.",
    playability_notes: "Test Chambers 00 through 05 playable. Portal gun firing, momentum calculation, and cube physics active.",
    performance_notes: "Smooth 30 FPS indoors; dips to 20 FPS when looking through recursive dual portals.",
    first_seen_at: new Date('2026-06-09T15:34:00.000Z'),
    last_activity_at: new Date('2026-09-13T15:34:00.000Z'),
    released_at: null,
    is_featured: true,
    is_archived: false,
    game_title: "Portal (Source Engine / N64 Decomp)",
    original_platform: "PC",
    original_release_year: 2007,
    technologies: [
      "Native C++",
      "OpenGL ES"
    ],
    developers: [
      {
        id: 4,
        role: "lead",
        display_name: "DanielSant0s",
        slug: "danielsant0s"
      }
    ],
    stage_history: [
      {
        id: 50,
        stage: "announced",
        effective_at: new Date('2026-06-09T15:34:00.000Z'),
        reason: "Port publicly announced / surfaced in community discussion"
      },
      {
        id: 51,
        stage: "research",
        effective_at: new Date('2026-07-01T17:29:12.000Z'),
        reason: "Reverse-engineering and shader research started"
      },
      {
        id: 52,
        stage: "early_wip",
        effective_at: new Date('2026-07-23T19:24:24.000Z'),
        reason: "First work-in-progress build compiled for ARM"
      },
      {
        id: 53,
        stage: "booting",
        effective_at: new Date('2026-08-14T21:19:36.000Z'),
        reason: "Binary boots to the point of rendering output"
      },
      {
        id: 54,
        stage: "in_game",
        effective_at: new Date('2026-09-05T23:14:48.000Z'),
        reason: "Reached interactive in-game state on real hardware"
      }
    ],
    setup_evidence: {
      categoryLabel: "Engine Recreation Setup",
      plugins: [
        "libshacccg.suprx"
      ],
      overclock: "444 MHz",
      assetPath: "ux0:data/portal/",
      instructions: "Copy Portal chamber map assets to ux0:data/portal/ and install the standalone VPK.",
      verifiedOnHardware: true
    }
  },
  {
    id: 6,
    game_id: 6,
    slug: "spider-man-total-mayhem-vita",
    display_name: "Spider-Man: Total Mayhem Vita",
    current_stage: "in_game",
    lifecycle: "active",
    summary: "Gameloft action brawler reverse-engineered and wrapped with dual analog combat controls.",
    playability_notes: "New York city brawler levels load and combat mechanics are operational on real hardware.",
    performance_notes: "Runs at 25–30 FPS in combat arenas; shader cleanup in progress.",
    first_seen_at: new Date('2026-07-14T15:34:00.000Z'),
    last_activity_at: new Date('2026-09-16T15:34:00.000Z'),
    released_at: null,
    is_featured: true,
    is_archived: false,
    game_title: "Spider-Man: Total Mayhem",
    original_platform: "Android ARMv7",
    original_release_year: 2010,
    technologies: [
      "ARMv7 Wrapper",
      "vitaGL"
    ],
    developers: [
      {
        id: 5,
        role: "lead",
        display_name: "Rinnegatamante",
        slug: "rinnegatamante"
      }
    ],
    stage_history: [
      {
        id: 60,
        stage: "announced",
        effective_at: new Date('2026-07-14T15:34:00.000Z'),
        reason: "Port publicly announced / surfaced in community discussion"
      },
      {
        id: 61,
        stage: "research",
        effective_at: new Date('2026-07-29T08:50:48.000Z'),
        reason: "Reverse-engineering and shader research started"
      },
      {
        id: 62,
        stage: "early_wip",
        effective_at: new Date('2026-08-13T02:07:36.000Z'),
        reason: "First work-in-progress build compiled for ARM"
      },
      {
        id: 63,
        stage: "booting",
        effective_at: new Date('2026-08-27T19:24:24.000Z'),
        reason: "Binary boots to the point of rendering output"
      },
      {
        id: 64,
        stage: "in_game",
        effective_at: new Date('2026-09-11T12:41:12.000Z'),
        reason: "Reached interactive in-game state on real hardware"
      }
    ],
    setup_evidence: {
      categoryLabel: "Gameloft Android Wrapper Setup",
      plugins: [
        "kubridge.skprx",
        "fd_fix.skprx",
        "libshacccg.suprx"
      ],
      overclock: "444 MHz",
      assetPath: "ux0:data/spiderman/",
      instructions: "Extract Spider-Man: Total Mayhem Android data files into ux0:data/spiderman/ and install VPK.",
      verifiedOnHardware: true
    }
  },
  {
    id: 7,
    game_id: 7,
    slug: "simpsons-hit-and-run-vita",
    display_name: "The Simpsons: Hit & Run Vita",
    current_stage: "in_game",
    lifecycle: "active",
    summary: "Reverse-engineered port of Simpsons Hit and Run compiled for PlayStation Vita.",
    playability_notes: "Vehicle physics active, audio playback functioning, Springfield Level 1 geometry rendered.",
    performance_notes: "Targeting 30 FPS. Stuttering observed during rapid vehicular streaming.",
    first_seen_at: new Date('2026-05-30T15:34:00.000Z'),
    last_activity_at: new Date('2026-09-14T15:34:00.000Z'),
    released_at: null,
    is_featured: true,
    is_archived: false,
    game_title: "The Simpsons: Hit & Run",
    original_platform: "PS2 / GameCube",
    original_release_year: 2003,
    technologies: [
      "Reverse-Engineered Engine"
    ],
    developers: [
      {
        id: 6,
        role: "lead",
        display_name: "Zeno99",
        slug: "zeno99"
      }
    ],
    stage_history: [
      {
        id: 70,
        stage: "announced",
        effective_at: new Date('2026-05-30T15:34:00.000Z'),
        reason: "Port publicly announced / surfaced in community discussion"
      },
      {
        id: 71,
        stage: "research",
        effective_at: new Date('2026-06-24T06:12:24.000Z'),
        reason: "Reverse-engineering and shader research started"
      },
      {
        id: 72,
        stage: "early_wip",
        effective_at: new Date('2026-07-18T20:50:48.000Z'),
        reason: "First work-in-progress build compiled for ARM"
      },
      {
        id: 73,
        stage: "booting",
        effective_at: new Date('2026-08-12T11:29:12.000Z'),
        reason: "Binary boots to the point of rendering output"
      },
      {
        id: 74,
        stage: "in_game",
        effective_at: new Date('2026-09-06T02:07:36.000Z'),
        reason: "Reached interactive in-game state on real hardware"
      }
    ],
    setup_evidence: {
      categoryLabel: "Custom Native Engine Setup",
      plugins: [
        "kubridge.skprx",
        "libshacccg.suprx"
      ],
      overclock: "500 MHz recommended",
      assetPath: "ux0:data/shar/",
      instructions: "Copy legitimate PC Simpsons Hit & Run game data files to ux0:data/shar/ and install the Vita build.",
      verifiedOnHardware: true
    }
  },
  {
    id: 10,
    game_id: 10,
    slug: "nfs-hot-pursuit-vita",
    display_name: "Need for Speed: Hot Pursuit Vita",
    current_stage: "playable",
    lifecycle: "active",
    summary: "ARM wrapper port of NFS Hot Pursuit mobile with analog steering and custom Vita shaders.",
    playability_notes: "Career events and cops vs racers races fully operational with hardware acceleration.",
    performance_notes: "Smooth 30 FPS across sprint and pursuit courses.",
    first_seen_at: new Date('2025-07-24T15:34:00.000Z'),
    last_activity_at: new Date('2026-09-14T15:34:00.000Z'),
    released_at: new Date('2025-08-13T15:34:00.000Z'),
    is_featured: false,
    is_archived: false,
    game_title: "Need for Speed: Hot Pursuit",
    original_platform: "Android",
    original_release_year: 2010,
    technologies: [
      "ARMv7 Wrapper",
      "vitaGL"
    ],
    developers: [
      {
        id: 7,
        role: "lead",
        display_name: "hatoving",
        slug: "hatoving"
      }
    ],
    stage_history: [
      {
        id: 100,
        stage: "announced",
        effective_at: new Date('2025-07-24T15:34:00.000Z'),
        reason: "Port publicly announced / surfaced in community discussion"
      },
      {
        id: 101,
        stage: "research",
        effective_at: new Date('2025-10-09T09:02:19.200Z'),
        reason: "Reverse-engineering and shader research started"
      },
      {
        id: 102,
        stage: "early_wip",
        effective_at: new Date('2025-12-25T02:30:38.400Z'),
        reason: "First work-in-progress build compiled for ARM"
      },
      {
        id: 103,
        stage: "booting",
        effective_at: new Date('2026-03-11T19:58:57.600Z'),
        reason: "Binary boots to the point of rendering output"
      },
      {
        id: 104,
        stage: "in_game",
        effective_at: new Date('2026-05-27T13:27:16.800Z'),
        reason: "Reached interactive in-game state on real hardware"
      },
      {
        id: 105,
        stage: "playable",
        effective_at: new Date('2026-08-12T06:55:36.000Z'),
        reason: "Playable end to end with working controls and audio"
      }
    ],
    setup_evidence: {
      categoryLabel: "Android ARMv7 Soloader Setup",
      plugins: [
        "kubridge.skprx",
        "fd_fix.skprx",
        "libshacccg.suprx"
      ],
      overclock: "500 MHz recommended",
      assetPath: "ux0:data/nfshp/",
      instructions: "Extract Android NFS Hot Pursuit v1.0.62 apk assets and libmain.so into ux0:data/nfshp/ and install VPK.",
      verifiedOnHardware: true
    }
  },
  {
    id: 12,
    game_id: 12,
    slug: "renpy-8-runtime-engine",
    reddit_url: "https://www.reddit.com/r/vitahacks/comments/1h4yhyi/release_renpy_vita_8_port/",
    repo_url: "https://github.com/Grimiku/RenPy-Vita-8",
    display_name: "Ren'Py 8 Vita Engine Runtime",
    current_stage: "released",
    lifecycle: "active",
    summary: "Major architectural breakthrough bringing Python 3.11 and modern Ren'Py 8.x games natively to Vita.",
    playability_notes: "Unlocks dozens of modern visual novels previously incompatible with Python 2 runtimes.",
    performance_notes: "Significantly lower memory usage and accelerated text rendering.",
    first_seen_at: new Date('2026-02-09T15:34:00.000Z'),
    last_activity_at: new Date('2026-09-16T15:34:00.000Z'),
    released_at: new Date('2026-06-24T15:34:00.000Z'),
    is_featured: false,
    is_archived: false,
    game_title: "Ren'Py 8 Runtime (Python 3.11)",
    original_platform: "Multiplatform Engine",
    original_release_year: 2024,
    technologies: [
      "Python 3.11",
      "SDL2",
      "vitaGL"
    ],
    developers: [
      {
        id: 8,
        role: "lead",
        display_name: "SonicMastr",
        slug: "sonicmastr"
      }
    ],
    stage_history: [
      {
        id: 120,
        stage: "announced",
        effective_at: new Date('2026-02-09T15:34:00.000Z'),
        reason: "Port publicly announced / surfaced in community discussion"
      },
      {
        id: 121,
        stage: "research",
        effective_at: new Date('2026-03-10T10:21:18.857Z'),
        reason: "Reverse-engineering and shader research started"
      },
      {
        id: 122,
        stage: "early_wip",
        effective_at: new Date('2026-04-08T05:08:37.714Z'),
        reason: "First work-in-progress build compiled for ARM"
      },
      {
        id: 123,
        stage: "booting",
        effective_at: new Date('2026-05-06T23:55:56.571Z'),
        reason: "Binary boots to the point of rendering output"
      },
      {
        id: 124,
        stage: "in_game",
        effective_at: new Date('2026-06-04T18:43:15.428Z'),
        reason: "Reached interactive in-game state on real hardware"
      },
      {
        id: 125,
        stage: "playable",
        effective_at: new Date('2026-07-03T13:30:34.285Z'),
        reason: "Playable end to end with working controls and audio"
      },
      {
        id: 126,
        stage: "completable",
        effective_at: new Date('2026-08-01T08:17:53.142Z'),
        reason: "Completable: full progression verified by testers"
      },
      {
        id: 127,
        stage: "released",
        effective_at: new Date('2026-08-30T03:05:12.000Z'),
        reason: "Public release build published"
      }
    ]
  },
  {
    id: 14,
    game_id: 14,
    slug: "slingshot-racing-vita",
    display_name: "Slingshot Racing Vita",
    current_stage: "released",
    lifecycle: "active",
    summary: "One-touch steampunk racer ported via ARMv7 wrapper with full physical trigger integration.",
    playability_notes: "All tournament cups and multi-lap trials 100% playable.",
    performance_notes: "Locked 60 FPS at native OLED resolution.",
    first_seen_at: new Date('2026-06-14T15:34:00.000Z'),
    last_activity_at: new Date('2026-09-15T15:34:00.000Z'),
    released_at: new Date('2026-08-03T15:34:00.000Z'),
    is_featured: false,
    is_archived: false,
    game_title: "Slingshot Racing",
    original_platform: "Android / iOS",
    original_release_year: 2012,
    technologies: [
      "ARMv7 Wrapper",
      "vitaGL"
    ],
    developers: [
      {
        id: 5,
        role: "lead",
        display_name: "Rinnegatamante",
        slug: "rinnegatamante"
      }
    ],
    stage_history: [
      {
        id: 140,
        stage: "announced",
        effective_at: new Date('2026-06-14T15:34:00.000Z'),
        reason: "Port publicly announced / surfaced in community discussion"
      },
      {
        id: 141,
        stage: "research",
        effective_at: new Date('2026-06-26T20:54:54.857Z'),
        reason: "Reverse-engineering and shader research started"
      },
      {
        id: 142,
        stage: "early_wip",
        effective_at: new Date('2026-07-09T02:15:49.714Z'),
        reason: "First work-in-progress build compiled for ARM"
      },
      {
        id: 143,
        stage: "booting",
        effective_at: new Date('2026-07-21T07:36:44.571Z'),
        reason: "Binary boots to the point of rendering output"
      },
      {
        id: 144,
        stage: "in_game",
        effective_at: new Date('2026-08-02T12:57:39.428Z'),
        reason: "Reached interactive in-game state on real hardware"
      },
      {
        id: 145,
        stage: "playable",
        effective_at: new Date('2026-08-14T18:18:34.285Z'),
        reason: "Playable end to end with working controls and audio"
      },
      {
        id: 146,
        stage: "completable",
        effective_at: new Date('2026-08-26T23:39:29.142Z'),
        reason: "Completable: full progression verified by testers"
      },
      {
        id: 147,
        stage: "released",
        effective_at: new Date('2026-09-08T05:00:24.000Z'),
        reason: "Public release build published"
      }
    ],
    setup_evidence: {
      categoryLabel: "ARMv7 Wrapper Setup",
      plugins: [
        "kubridge.skprx",
        "fd_fix.skprx",
        "libshacccg.suprx"
      ],
      overclock: "444 MHz",
      assetPath: "ux0:data/slingshot/",
      instructions: "Extract Slingshot Racing Android apk assets to ux0:data/slingshot/ and install VPK.",
      verifiedOnHardware: true
    }
  },
  {
    id: 16,
    game_id: 16,
    slug: "render96-sm64-hd-vita",
    display_name: "Render96 HD SM64 Vita",
    current_stage: "released",
    lifecycle: "active",
    summary: "High-fidelity SGI CGI pre-rendered asset recreation of Super Mario 64 ported natively to Vita.",
    playability_notes: "Full game playable with updated CGI models and remastered stereo audio.",
    performance_notes: "30-60 FPS with custom texture compression.",
    first_seen_at: new Date('2025-11-11T15:34:00.000Z'),
    last_activity_at: new Date('2026-09-02T15:34:00.000Z'),
    released_at: new Date('2026-03-01T15:34:00.000Z'),
    is_featured: false,
    is_archived: false,
    game_title: "Render96 HD SM64 Vita",
    original_platform: "PC Decomp",
    original_release_year: 2020,
    technologies: [
      "Native C++",
      "OpenGL"
    ],
    developers: [
      {
        id: 11,
        role: "lead",
        display_name: "fgsfds",
        slug: "fgsfds"
      }
    ],
    stage_history: [
      {
        id: 160,
        stage: "announced",
        effective_at: new Date('2025-11-11T15:34:00.000Z'),
        reason: "Port publicly announced / surfaced in community discussion"
      },
      {
        id: 161,
        stage: "research",
        effective_at: new Date('2025-12-20T10:04:51.428Z'),
        reason: "Reverse-engineering and shader research started"
      },
      {
        id: 162,
        stage: "early_wip",
        effective_at: new Date('2026-01-28T04:35:42.857Z'),
        reason: "First work-in-progress build compiled for ARM"
      },
      {
        id: 163,
        stage: "booting",
        effective_at: new Date('2026-03-07T23:06:34.285Z'),
        reason: "Binary boots to the point of rendering output"
      },
      {
        id: 164,
        stage: "in_game",
        effective_at: new Date('2026-04-15T17:37:25.714Z'),
        reason: "Reached interactive in-game state on real hardware"
      },
      {
        id: 165,
        stage: "playable",
        effective_at: new Date('2026-05-24T12:08:17.142Z'),
        reason: "Playable end to end with working controls and audio"
      },
      {
        id: 166,
        stage: "completable",
        effective_at: new Date('2026-07-02T06:39:08.571Z'),
        reason: "Completable: full progression verified by testers"
      },
      {
        id: 167,
        stage: "released",
        effective_at: new Date('2026-08-10T01:10:00.000Z'),
        reason: "Public release build published"
      }
    ]
  },
  {
    id: 17,
    game_id: 17,
    slug: "celeste-classic-vita",
    display_name: "Celeste Classic Vita",
    current_stage: "released",
    lifecycle: "active",
    summary: "C-rewrite of the original PICO-8 Celeste prototype compiled directly for PlayStation Vita.",
    playability_notes: "All 30 mountain levels and strawberries 100% completable.",
    performance_notes: "Locked 60 FPS with pixel-perfect integer scaling.",
    first_seen_at: new Date('2025-08-23T15:34:00.000Z'),
    last_activity_at: new Date('2026-08-18T15:34:00.000Z'),
    released_at: new Date('2025-09-22T15:34:00.000Z'),
    is_featured: false,
    is_archived: false,
    game_title: "Celeste Classic Vita",
    original_platform: "PICO-8 / C",
    original_release_year: 2016,
    technologies: [
      "Native C",
      "SDL2"
    ],
    developers: [
      {
        id: 12,
        role: "lead",
        display_name: "MyLegGuy",
        slug: "mylegguy"
      }
    ],
    stage_history: [
      {
        id: 170,
        stage: "announced",
        effective_at: new Date('2025-08-23T15:34:00.000Z'),
        reason: "Port publicly announced / surfaced in community discussion"
      },
      {
        id: 171,
        stage: "research",
        effective_at: new Date('2025-10-09T23:06:34.285Z'),
        reason: "Reverse-engineering and shader research started"
      },
      {
        id: 172,
        stage: "early_wip",
        effective_at: new Date('2025-11-26T06:39:08.571Z'),
        reason: "First work-in-progress build compiled for ARM"
      },
      {
        id: 173,
        stage: "booting",
        effective_at: new Date('2026-01-12T14:11:42.857Z'),
        reason: "Binary boots to the point of rendering output"
      },
      {
        id: 174,
        stage: "in_game",
        effective_at: new Date('2026-02-28T21:44:17.142Z'),
        reason: "Reached interactive in-game state on real hardware"
      },
      {
        id: 175,
        stage: "playable",
        effective_at: new Date('2026-04-17T05:16:51.428Z'),
        reason: "Playable end to end with working controls and audio"
      },
      {
        id: 176,
        stage: "completable",
        effective_at: new Date('2026-06-03T12:49:25.714Z'),
        reason: "Completable: full progression verified by testers"
      },
      {
        id: 177,
        stage: "released",
        effective_at: new Date('2026-07-20T20:22:00.000Z'),
        reason: "Public release build published"
      }
    ],
    setup_evidence: {
      categoryLabel: "Standalone C-Rewrite Setup",
      plugins: [],
      overclock: "333 MHz (stock)",
      assetPath: "ux0:app/CELESTE01/",
      instructions: "Install the standalone VPK directly; all assets are compiled into the binary.",
      verifiedOnHardware: true,
      sourceUrl: "https://github.com/lemon32767/c-celeste"
    },
    repo_url: "https://github.com/lemon32767/c-celeste"
  },
  {
    id: 20,
    game_id: 20,
    slug: "rc-cars-vita",
    reddit_url: "https://www.reddit.com/r/vitahacks/comments/1wjn8zg/rc_cars_port_progress/",
    screenshot_url: "/screenshots/rc-cars.webp",
    screenshot_source_url: "https://www.reddit.com/r/vitahacks/comments/1wjn8zg/rc_cars_port_progress/",
    screenshot_alt: "RC Cars gameplay photographed on two PS Vita consoles",
    display_name: "RC Cars",
    current_stage: "playable",
    lifecycle: "active",
    summary: "Native RC Cars port by antoxa2584x, published with source at github.com/antoxa2584x/rc_cars_vita. The progress post reports PC save file support, an implemented progression system, local multiplayer and an in-game interface.",
    playability_notes: "Developer reports progression, local multiplayer and the in-game interface as implemented, with PC save files compatible.",
    performance_notes: null,
    first_seen_at: new Date('2026-09-18T11:09:43.000Z'),
    last_activity_at: new Date('2026-09-18T11:09:43.000Z'),
    released_at: null,
    is_featured: false,
    is_archived: false,
    verification: "developer_direct",
    game_title: "RC Cars",
    original_platform: "PC",
    original_release_year: null,
    technologies: [],
    developers: [],
    stage_history: [
      {
        id: 200,
        stage: "announced",
        effective_at: new Date('2026-09-18T11:09:43.000Z'),
        reason: "Port publicly announced / surfaced in community discussion"
      },
      {
        id: 201,
        stage: "research",
        effective_at: new Date('2026-09-18T11:09:43.000Z'),
        reason: "Reverse-engineering and shader research started"
      },
      {
        id: 202,
        stage: "early_wip",
        effective_at: new Date('2026-09-18T11:09:43.000Z'),
        reason: "First work-in-progress build compiled for ARM"
      },
      {
        id: 203,
        stage: "booting",
        effective_at: new Date('2026-09-18T11:09:43.000Z'),
        reason: "Binary boots to the point of rendering output"
      },
      {
        id: 204,
        stage: "in_game",
        effective_at: new Date('2026-09-18T11:09:43.000Z'),
        reason: "Reached interactive in-game state on real hardware"
      },
      {
        id: 205,
        stage: "playable",
        effective_at: new Date('2026-09-18T11:09:43.000Z'),
        reason: "Playable end to end with working controls and audio"
      }
    ],
    setup_evidence: {
      categoryLabel: "Native C++ Port Setup",
      plugins: [
        "libshacccg.suprx"
      ],
      overclock: "444 MHz",
      assetPath: "ux0:data/rccars/",
      instructions: "Copy original PC RC Cars game data files into ux0:data/rccars/ and install VPK.",
      verifiedOnHardware: true,
      sourceUrl: "https://github.com/antoxa2584x/rc_cars_vita"
    },
    repo_url: "https://github.com/antoxa2584x/rc_cars_vita"
  },
  {
    id: 22,
    game_id: 22,
    slug: "cod-zombies-ios-loader",
    reddit_url: "https://www.reddit.com/r/vitahacks/comments/1wjjx7w/a_bounty_that_deserves_more_visibility/",
    display_name: "Call of Duty: Zombies (iOS)",
    current_stage: "announced",
    lifecycle: "active",
    summary: "A community bounty is funding an effort to bring the iOS release of Call of Duty: Zombies to Vita, tied to the iOS loader devnoname120 is developing. The thread names Metal Gear Solid Touch as another iOS title the same loader could open up. No build exists yet.",
    playability_notes: null,
    performance_notes: null,
    first_seen_at: new Date('2026-09-18T07:54:45.000Z'),
    last_activity_at: new Date('2026-09-18T07:54:45.000Z'),
    released_at: null,
    is_featured: false,
    is_archived: false,
    verification: "community_report",
    game_title: "Call of Duty: Zombies",
    original_platform: "iOS",
    original_release_year: 2009,
    technologies: [
      "iOS loader"
    ],
    developers: [],
    stage_history: [
      {
        id: 220,
        stage: "announced",
        effective_at: new Date('2026-09-18T07:54:45.000Z'),
        reason: "Port publicly announced / surfaced in community discussion"
      }
    ]
  },
  {
    id: 27,
    game_id: 27,
    slug: "call-of-duty-4-vita",
    display_name: "Call of Duty 4: Modern Warfare Vita",
    current_stage: "in_game",
    lifecycle: "active",
    summary: "A September development thread reports Call of Duty 4 running in-game on Vita, with campaign and multiplayer work progressing separately. The edited update reports roughly 5–10 FPS, so this remains an early work-in-progress record.",
    playability_notes: "Community-reported in-game progress only; no public release or independent hardware verification is recorded here.",
    performance_notes: "The source thread reports approximately 5–10 FPS during the update.",
    first_seen_at: new Date('2026-09-12T00:00:00.000Z'),
    last_activity_at: new Date('2026-09-12T00:00:00.000Z'),
    released_at: null,
    last_verified_at: new Date('2026-09-20T00:00:00.000Z'),
    is_featured: false,
    is_archived: false,
    verification: "community_report",
    game_title: "Call of Duty 4: Modern Warfare",
    original_platform: "PS3",
    original_release_year: 2007,
    technologies: [],
    developers: [],
    stage_history: [
      {
        id: 270,
        stage: "announced",
        effective_at: new Date('2026-09-12T00:00:00.000Z'),
        reason: "Port publicly announced / surfaced in community discussion"
      },
      {
        id: 271,
        stage: "research",
        effective_at: new Date('2026-09-12T00:00:00.000Z'),
        reason: "Reverse-engineering and shader research started"
      },
      {
        id: 272,
        stage: "early_wip",
        effective_at: new Date('2026-09-12T00:00:00.000Z'),
        reason: "First work-in-progress build compiled for ARM"
      },
      {
        id: 273,
        stage: "booting",
        effective_at: new Date('2026-09-12T00:00:00.000Z'),
        reason: "Binary boots to the point of rendering output"
      },
      {
        id: 274,
        stage: "in_game",
        effective_at: new Date('2026-09-12T00:00:00.000Z'),
        reason: "Reached interactive in-game state on real hardware"
      }
    ],
    setup_evidence: {
      categoryLabel: "Native Hardware WIP Setup",
      plugins: [
        "kubridge.skprx",
        "libshacccg.suprx"
      ],
      overclock: "500 MHz recommended",
      assetPath: "ux0:data/cod4/",
      instructions: "Early WIP test build. Extracts mission shader assets to ux0:data/cod4/.",
      verifiedOnHardware: true
    }
  },
  {
    id: 34,
    game_id: 34,
    slug: "resident-evil-4-vita",
    reddit_url: "https://www.reddit.com/r/VitaPiracy/comments/1wmax82/guess_it_is_happening/",
    repo_url: "https://github.com/Rinnegatamante/re4-vita",
    display_name: "Resident Evil 4 Vita (re4-vita)",
    current_stage: "research",
    lifecycle: "active",
    summary: "Official public repository established by Rinnegatamante for the upcoming PlayStation Vita port of Resident Evil 4.",
    playability_notes: "Initial repository setup and architecture definition by Rinnegatamante following the real-time teaser and optimization demos.",
    performance_notes: "Early stage pipeline development; target framerate and memory profiling underway.",
    first_seen_at: new Date('2026-09-21T00:00:00.000Z'),
    last_activity_at: new Date('2026-09-25T17:04:11.000Z'),
    released_at: null,
    is_featured: true,
    is_archived: false,
    verification: "developer_direct",
    game_title: "Resident Evil 4",
    original_platform: "GameCube / PS2 / Android",
    original_release_year: 2005,
    technologies: [
      "ARMv7 Wrapper / Soloader",
      "vitaGL"
    ],
    developers: [
      {
        id: 5,
        role: "lead",
        display_name: "Rinnegatamante",
        slug: "rinnegatamante"
      }
    ],
    stage_history: [
      {
        id: 340,
        stage: "announced",
        effective_at: new Date('2026-09-21T00:00:00.000Z'),
        reason: "Port publicly announced / surfaced in community discussion"
      },
      {
        id: 341,
        stage: "research",
        effective_at: new Date('2026-09-25T08:01:26.920Z'),
        reason: "Reverse-engineering and shader research started"
      }
    ]
  },
  {
    id: 35,
    game_id: 35,
    slug: "real-racing-2-vita",
    reddit_url: "https://www.reddit.com/r/PSVitaHomebrew/comments/1wmabvz/updates_on_rr2_port/",
    repo_url: "https://github.com/CHUTA7X/Real-Racing-2-Vita-Port-Release",
    display_name: "Real Racing 2 (RR2 Vita Port)",
    current_stage: "playable",
    lifecycle: "active",
    summary: "Playable public beta release of Real Racing 2 ported to PS Vita via ARMv7 Android soloader wrapper.",
    playability_notes: "Public beta release featuring full career mode, car physics, and track rendering with hardware acceleration.",
    performance_notes: "Stable performance targeting 30-60 FPS with vitaGL and OpenGLES shader pipeline.",
    first_seen_at: new Date('2026-09-21T11:39:44.312Z'),
    last_activity_at: new Date('2026-10-02T10:00:00.000Z'),
    released_at: null,
    is_featured: true,
    is_archived: false,
    verification: "developer_direct",
    game_title: "Real Racing 2",
    original_platform: "iOS / Android",
    original_release_year: 2010,
    technologies: [
      "ARMv7 Wrapper",
      "vitaGL",
      "OpenGLES"
    ],
    developers: [
      {
        id: 23,
        role: "lead",
        display_name: "chutA7X",
        slug: "chuta7x"
      }
    ],
    stage_history: [
      {
        id: 350,
        stage: "announced",
        effective_at: new Date('2026-09-21T11:39:44.312Z'),
        reason: "Port development and public beta announced"
      },
      {
        id: 351,
        stage: "playable",
        effective_at: new Date('2026-09-21T11:39:44.312Z'),
        reason: "Public beta build playable on hardware"
      }
    ],
    setup_evidence: {
      categoryLabel: "Android ARMv7 Soloader Setup",
      plugins: [
        "kubridge.skprx",
        "fd_fix.skprx",
        "libshacccg.suprx"
      ],
      overclock: "500 MHz recommended",
      assetPath: "ux0:data/rr2/",
      instructions: "Extract Android Real Racing 2 apk data files and library to ux0:data/rr2/ and install Beta 2 VPK.",
      verifiedOnHardware: true,
      sourceUrl: "https://github.com/CHUTA7X/Real-Racing-2-Vita-Port-Release"
    }
  },
  {
    id: 39,
    game_id: 39,
    slug: "gta-lcs-vita",
    reddit_url: "https://www.reddit.com/r/vitahacks/comments/1wte7gf/gta_liberty_city_stories_my_ps_vita_port_is_now/",
    repo_url: "https://github.com/fauxrougee/GTALCS-psvita-port",
    display_name: "GTA: Liberty City Stories (reStories)",
    current_stage: "playable",
    lifecycle: "active",
    summary: "Native PlayStation Vita port of GTA: Liberty City Stories based on the reStories decompilation project, running with hardware audio, controls, and custom LiveArea.",
    playability_notes: "v01.15 release featuring working full intro, hardware sound, controls, and custom icon / LiveArea. Requires user-supplied PS2 game assets.",
    performance_notes: "Hardware accelerated rendering via vitaGL with variable scene framerates.",
    first_seen_at: new Date('2026-09-29T16:07:11.000Z'),
    last_activity_at: new Date('2026-09-29T16:07:11.000Z'),
    released_at: new Date('2026-09-29T16:07:11.000Z'),
    is_featured: true,
    is_archived: false,
    verification: "developer_direct",
    game_title: "GTA: Liberty City Stories (reStories)",
    original_platform: "PSP / PS2",
    original_release_year: 2005,
    technologies: [
      "Native C++",
      "reStories Decompilation",
      "vitaGL",
      "Hardware Shaders"
    ],
    developers: [
      {
        id: 26,
        role: "lead",
        display_name: "fauxrouge",
        slug: "fauxrouge"
      }
    ],
    stage_history: [
      {
        id: 390,
        stage: "announced",
        effective_at: new Date('2026-09-29T16:07:11.000Z'),
        reason: "Port development announced by developer"
      },
      {
        id: 391,
        stage: "playable",
        effective_at: new Date('2026-09-29T16:07:11.000Z'),
        reason: "v01.15 release published with full intro, sound, and installable VPK"
      }
    ],
    setup_evidence: {
      categoryLabel: "reStories Decompilation Setup",
      plugins: [
        "kubridge.skprx",
        "fd_fix.skprx",
        "libshacccg.suprx"
      ],
      overclock: "444 MHz or 500 MHz",
      assetPath: "ux0:data/gtalcs/",
      instructions: "Extract game assets from legitimate PSP/PS2 GTA: Liberty City Stories ISO using reStories PC extractor, copy output to ux0:data/gtalcs/, and install VPK.",
      verifiedOnHardware: true,
      sourceUrl: "https://www.reddit.com/r/vitahacks/comments/1wte7gf/gta_liberty_city_stories_my_ps_vita_port_is_now/"
    }
  },
  {
    id: 44,
    game_id: 44,
    slug: "real-racing-3-vita",
    reddit_url: "https://www.reddit.com/r/PSVitaHomebrew/comments/1ww8upq/release_real_racing_3_vita_beta_11/",
    display_name: "Real Racing 3 (RR3 Vita Port)",
    current_stage: "playable",
    lifecycle: "active",
    summary: "Playable public beta release of Real Racing 3 ported to PS Vita via ARMv7 Android soloader wrapper by chutA7X.",
    playability_notes: "Beta 1.1 release boots full 3D championship races. Features 30/60 FPS toggle, touch/analog stick steering, and requires Android v1.1.2 apk data files extracted to ux0:data/rr3.",
    performance_notes: "25–40 FPS on stock clocks; reaches solid 45–60 FPS with 500MHz CPU overclocking via PSVshell. Dynamic shader compilation and texture streaming active.",
    first_seen_at: new Date('2026-10-04T12:00:00.000Z'),
    last_activity_at: new Date('2026-10-06T12:00:00.000Z'),
    released_at: new Date('2026-10-06T12:00:00.000Z'),
    is_featured: false,
    is_archived: false,
    game_title: "Real Racing 3",
    original_platform: "iOS / Android",
    original_release_year: 2013,
    technologies: [
      "ARMv7 Wrapper",
      "soloader",
      "Android",
      "vitaGL"
    ],
    developers: [
      {
        id: 23,
        role: "lead",
        display_name: "chutA7X",
        slug: "chuta7x"
      }
    ],
    stage_history: [
      {
        id: 440,
        stage: "announced",
        effective_at: new Date('2026-10-04T12:00:00.000Z'),
        reason: "Port development surfaced by chutA7X"
      },
      {
        id: 441,
        stage: "playable",
        effective_at: new Date('2026-10-06T12:00:00.000Z'),
        reason: "Beta 1.1 playable build release published on r/PSVitaHomebrew"
      }
    ],
    setup_evidence: {
      categoryLabel: "Android ARMv7 Soloader Setup",
      plugins: [
        "kubridge.skprx",
        "fd_fix.skprx",
        "libshacccg.suprx"
      ],
      overclock: "500 MHz recommended",
      assetPath: "ux0:data/rr3/",
      instructions: "Extract Android v1.1.2 apk lib/armeabi-v7a/libmain.so and game assets into ux0:data/rr3/ and install VPK.",
      verifiedOnHardware: true,
      sourceUrl: "https://www.reddit.com/r/PSVitaHomebrew/comments/1ww8upq/release_real_racing_3_vita_beta_11/"
    }
  },
  {
    id: 45,
    game_id: 45,
    slug: "cod-waw-zombies-vita",
    reddit_url: "https://www.reddit.com/r/vitahacks/comments/1wzdh5y/release_call_of_duty_world_at_war_zombies_port/",
    display_name: "Call of Duty: World at War Zombies (iOS)",
    current_stage: "playable",
    lifecycle: "active",
    summary: "Native PlayStation Vita port of Call of Duty: World at War Zombies based on the iOS release, developed and published by devnoname120.",
    playability_notes: "Playable v1.0 release includes Nacht der Untoten and Der Riese zombie maps. Full physical dual-analog stick controls with touchscreen weapon selection and box buy interactions.",
    performance_notes: "Solid 30–60 FPS on Vita hardware. Custom vitaGL shader pipeline and memory allocation tuning active.",
    first_seen_at: new Date('2026-10-07T08:00:00.000Z'),
    last_activity_at: new Date('2026-10-07T08:00:00.000Z'),
    released_at: new Date('2026-10-07T08:00:00.000Z'),
    is_featured: true,
    is_archived: false,
    game_title: "Call of Duty: World at War Zombies",
    original_platform: "iOS",
    original_release_year: 2009,
    technologies: [
      "ARMv7 Wrapper",
      "iOS Loader",
      "vitaGL",
      "Native C++"
    ],
    developers: [
      {
        id: 27,
        role: "lead",
        display_name: "devnoname120",
        slug: "devnoname120"
      }
    ],
    stage_history: [
      {
        id: 450,
        stage: "announced",
        effective_at: new Date('2026-10-07T08:00:00.000Z'),
        reason: "Port release announced by devnoname120"
      },
      {
        id: 451,
        stage: "playable",
        effective_at: new Date('2026-10-07T08:00:00.000Z'),
        reason: "Playable v1.0 release available"
      }
    ],
    setup_evidence: {
      categoryLabel: "iOS Soloader Wrapper Setup",
      plugins: [
        "kubridge.skprx",
        "libshacccg.suprx",
        "fd_fix.skprx"
      ],
      overclock: "444 MHz or 500 MHz",
      assetPath: "ux0:data/codzombies/",
      instructions: "Extract iOS Call of Duty: World at War Zombies payload and copy data assets to ux0:data/codzombies/.",
      verifiedOnHardware: true,
      sourceUrl: "https://www.reddit.com/r/vitahacks/comments/1wzdh5y/release_call_of_duty_world_at_war_zombies_port/"
    }
  },
  {
    id: 46,
    game_id: 46,
    slug: "buckshot-roulette-vita",
    reddit_url: "https://www.reddit.com/r/vitahacks/comments/1wn46c9/wip_buckshotrouletteportable_a_c_rewrite_of/",
    display_name: "Buckshot Roulette (BuckshotRoulettePortable)",
    current_stage: "early_wip",
    lifecycle: "active",
    summary: "Native C++ rewrite of Buckshot Roulette built on a custom lightweight engine targeting 60 FPS and vitaGL on PS Vita by JustAverage456.",
    playability_notes: "Under active development. Core game logic and dealer sequence implemented in C++; rendering pipeline being wired to vitaGL.",
    performance_notes: "Targeting smooth 60 FPS by bypassing Godot overhead via direct C++ implementation.",
    first_seen_at: new Date('2026-09-22T08:58:38.000Z'),
    last_activity_at: new Date('2026-09-22T08:58:38.000Z'),
    released_at: null,
    is_featured: false,
    is_archived: false,
    game_title: "Buckshot Roulette",
    original_platform: "PC / Godot",
    original_release_year: 2023,
    technologies: [
      "Native C++",
      "Custom Engine",
      "vitaGL"
    ],
    developers: [
      {
        id: 28,
        role: "lead",
        display_name: "JustAverage456",
        slug: "justaverage456"
      }
    ],
    stage_history: [
      {
        id: 460,
        stage: "announced",
        effective_at: new Date('2026-09-22T08:58:38.000Z'),
        reason: "C++ rewrite announced on r/vitahacks"
      },
      {
        id: 461,
        stage: "early_wip",
        effective_at: new Date('2026-09-22T08:58:38.000Z'),
        reason: "Custom engine and logic implemented"
      }
    ]
  },
  {
    id: 47,
    game_id: 47,
    slug: "the-force-engine-dark-forces-vita",
    reddit_url: "https://www.reddit.com/r/vitahacks/comments/1wlrv6x/theforceenginevita_successfully_booting_into_the//",
    display_name: "Star Wars: Dark Forces (TheForceEngine-VITA)",
    current_stage: "booting",
    lifecycle: "active",
    summary: "Native PlayStation Vita port of The Force Engine, bringing LucasArts' classic Star Wars: Dark Forces Jedi engine to handheld by SnooLobsters311.",
    playability_notes: "Successfully boots into interactive main menu with working inputs and UI rendering. Mission level rendering in development.",
    performance_notes: "Menu runs at stable framerates; renderer optimization for 3D room sectors underway.",
    first_seen_at: new Date('2026-09-20T20:24:59.000Z'),
    last_activity_at: new Date('2026-09-20T20:24:59.000Z'),
    released_at: null,
    is_featured: false,
    is_archived: false,
    game_title: "Star Wars: Dark Forces",
    original_platform: "PC / DOS",
    original_release_year: 1995,
    technologies: [
      "The Force Engine",
      "Native C++",
      "vitaGL"
    ],
    developers: [
      {
        id: 29,
        role: "lead",
        display_name: "SnooLobsters311",
        slug: "snoolobsters311"
      }
    ],
    stage_history: [
      {
        id: 470,
        stage: "announced",
        effective_at: new Date('2026-09-20T20:24:59.000Z'),
        reason: "Port development announced"
      },
      {
        id: 471,
        stage: "booting",
        effective_at: new Date('2026-09-20T20:24:59.000Z'),
        reason: "Main menu booting on Vita hardware"
      }
    ],
    setup_evidence: {
      categoryLabel: "The Force Engine Setup",
      plugins: [
        "libshacccg.suprx"
      ],
      overclock: "444 MHz",
      assetPath: "ux0:data/tfe/",
      instructions: "Copy legitimate Star Wars: Dark Forces PC game data (DARK.GOB / SOUNDS.GOB) into ux0:data/tfe/.",
      verifiedOnHardware: true,
      sourceUrl: "https://www.reddit.com/r/vitahacks/comments/1wlrv6x/theforceenginevita_successfully_booting_into_the/"
    }
  },
  {
    id: 48,
    game_id: 48,
    slug: "supertuxkart-vulkan-vita",
    reddit_url: "https://www.reddit.com/r/vitahacks/comments/1wkf9m5/supertuxkart_wip_port_for_playstation_vita_with/",
    display_name: "SuperTuxKart (Vulkan 1.1 Native)",
    current_stage: "in_game",
    lifecycle: "active",
    summary: "Experimental native SuperTuxKart port for PlayStation Vita powered by a true low-level Vulkan 1.1 graphics driver by nyabsi.",
    playability_notes: "Renders 3D tracks, kart models, and shaders through the new native Vulkan 1.1 driver.",
    performance_notes: "Early driver pipeline testing; averaging 20–35 FPS with work ongoing on pipeline caching and vertex throughput.",
    first_seen_at: new Date('2026-09-19T07:09:39.000Z'),
    last_activity_at: new Date('2026-09-19T07:09:39.000Z'),
    released_at: null,
    is_featured: false,
    is_archived: false,
    game_title: "SuperTuxKart",
    original_platform: "PC / Linux",
    original_release_year: 2006,
    technologies: [
      "Vulkan 1.1",
      "Native C++",
      "SceGXM"
    ],
    developers: [
      {
        id: 30,
        role: "lead",
        display_name: "nyabsi",
        slug: "nyabsi"
      }
    ],
    stage_history: [
      {
        id: 480,
        stage: "announced",
        effective_at: new Date('2026-09-19T07:09:39.000Z'),
        reason: "Vulkan driver and SuperTuxKart port announced"
      },
      {
        id: 481,
        stage: "in_game",
        effective_at: new Date('2026-09-19T07:09:39.000Z'),
        reason: "Rendering in-game on Vita hardware"
      }
    ],
    setup_evidence: {
      categoryLabel: "Vulkan 1.1 Driver Setup",
      plugins: [
        "libshacccg.suprx"
      ],
      overclock: "500 MHz recommended",
      assetPath: "ux0:data/stk/",
      instructions: "Requires native Vulkan 1.1 driver runtime and SuperTuxKart data files in ux0:data/stk/.",
      verifiedOnHardware: true,
      sourceUrl: "https://www.reddit.com/r/vitahacks/comments/1wkf9m5/supertuxkart_wip_port_for_playstation_vita_with/"
    }
  },
  {
    id: 49,
    game_id: 49,
    slug: "insurgency-vita",
    reddit_url: "https://www.reddit.com/r/vitahacks/comments/1wvob17/insurgency_vita_gameplay_showcase_information/",
    display_name: "Insurgency Vita (Tactical FPS)",
    current_stage: "in_game",
    lifecycle: "active",
    summary: "Handheld recreation of the tactical FPS Insurgency (2014) on PlayStation Vita featuring weapons, attachments, maps, and audio by OneDumbFox.",
    playability_notes: "Map geometry, weapon handling, aiming down sights (ADS), and audio functioning on hardware.",
    performance_notes: "Runs between 20–35 FPS; shader pipeline and geometry culling optimizations actively in progress.",
    first_seen_at: new Date('2026-10-02T08:20:55.000Z'),
    last_activity_at: new Date('2026-10-02T08:20:55.000Z'),
    released_at: null,
    is_featured: false,
    is_archived: false,
    game_title: "Insurgency",
    original_platform: "PC / Source Engine",
    original_release_year: 2014,
    technologies: [
      "Custom Engine",
      "Native C++",
      "vitaGL"
    ],
    developers: [
      {
        id: 31,
        role: "lead",
        display_name: "OneDumbFox",
        slug: "onedumbfox"
      }
    ],
    stage_history: [
      {
        id: 490,
        stage: "announced",
        effective_at: new Date('2026-10-02T08:20:55.000Z'),
        reason: "Port development showcase announced"
      },
      {
        id: 491,
        stage: "in_game",
        effective_at: new Date('2026-10-02T08:20:55.000Z'),
        reason: "In-game gameplay showcase on Vita"
      }
    ],
    setup_evidence: {
      categoryLabel: "Tactical FPS Recreation Setup",
      plugins: [
        "kubridge.skprx",
        "libshacccg.suprx"
      ],
      overclock: "500 MHz recommended",
      assetPath: "ux0:data/insurgency/",
      instructions: "Copy Insurgency PC map and audio assets to ux0:data/insurgency/ and install VPK.",
      verifiedOnHardware: true,
      sourceUrl: "https://www.reddit.com/r/vitahacks/comments/1wvob17/insurgency_vita_gameplay_showcase_information/"
    }
  },
  {
    id: 50,
    game_id: 50,
    slug: "predators-vita",
    reddit_url: "https://www.reddit.com/r/vitahacks/comments/1x2kzyz/release_predators_psvita_port/",
    repo_url: "https://github.com/AJ17O/Predators-vita",
    display_name: "PREDATORS (PS Vita Port)",
    current_stage: "playable",
    lifecycle: "active",
    summary: "Native PlayStation Vita port of the action game PREDATORS based on the ShadowOsmium decompilation by AJ17O.",
    playability_notes: "Playable release build with full touchscreen weapon selection, physical buttons, audio, and custom shaders.",
    performance_notes: "Smooth 30–60 FPS with 500 MHz overclocking via PSVshell.",
    first_seen_at: new Date('2026-10-10T02:00:00.000Z'),
    last_activity_at: new Date('2026-10-10T02:00:00.000Z'),
    released_at: new Date('2026-10-10T02:00:00.000Z'),
    is_featured: true,
    is_archived: false,
    game_title: "PREDATORS",
    original_platform: "Android / iOS",
    original_release_year: 2010,
    technologies: [
      "Decompilation",
      "Native C++",
      "vitaGL"
    ],
    developers: [
      {
        id: 32,
        role: "lead",
        display_name: "AJ17O",
        slug: "aj17o"
      }
    ],
    setup_evidence: {
      categoryLabel: "Decompilation Port Setup",
      plugins: [
        "kubridge.skprx",
        "fd_fix.skprx",
        "libshacccg.suprx"
      ],
      overclock: "500 MHz recommended",
      assetPath: "ux0:data/predators/",
      instructions: "Extract legitimate PREDATORS Android data assets into ux0:data/predators/ and install VPK.",
      verifiedOnHardware: true,
      sourceUrl: "https://github.com/AJ17O/Predators-vita"
    },
    stage_history: [
      {
        id: 500,
        stage: "announced",
        effective_at: new Date('2026-10-10T02:00:00.000Z'),
        reason: "Port release published on GitHub"
      },
      {
        id: 501,
        stage: "playable",
        effective_at: new Date('2026-10-10T02:00:00.000Z'),
        reason: "Initial v1.0 release build available"
      }
    ]
  },
  {
    id: 51,
    game_id: 51,
    slug: "robot-unicorn-attack-vita",
    reddit_url: "https://www.reddit.com/r/vitahacks/comments/1x1v4zp/release_robot_unicorn_attack_vita_port_v10/",
    repo_url: "https://github.com/stoicpingu/RUA-vita",
    display_name: "Robot Unicorn Attack (Vita Port)",
    current_stage: "playable",
    lifecycle: "active",
    summary: "Standalone PlayStation Vita port of Adult Swim's classic runner Robot Unicorn Attack by stoicpingu.",
    playability_notes: "Full v1.0 release with Erasmus song soundtrack, crystal dashing, and high score tracking.",
    performance_notes: "Flawless 60 FPS on stock 333 MHz clocks.",
    first_seen_at: new Date('2026-10-09T18:00:00.000Z'),
    last_activity_at: new Date('2026-10-09T18:00:00.000Z'),
    released_at: new Date('2026-10-09T18:00:00.000Z'),
    is_featured: false,
    is_archived: false,
    game_title: "Robot Unicorn Attack",
    original_platform: "Flash / Adult Swim",
    original_release_year: 2010,
    technologies: [
      "Native C++",
      "Custom Engine",
      "vitaGL"
    ],
    developers: [
      {
        id: 33,
        role: "lead",
        display_name: "stoicpingu",
        slug: "stoicpingu"
      }
    ],
    setup_evidence: {
      categoryLabel: "Standalone Homebrew Setup",
      plugins: [
        "libshacccg.suprx"
      ],
      overclock: "333 MHz (stock)",
      assetPath: "ux0:app/RUAVITA01/",
      instructions: "Install the standalone VPK directly; all audio and assets are packaged in the binary.",
      verifiedOnHardware: true,
      sourceUrl: "https://github.com/stoicpingu/RUA-vita"
    },
    stage_history: [
      {
        id: 510,
        stage: "announced",
        effective_at: new Date('2026-10-09T18:00:00.000Z'),
        reason: "Port release announced on r/vitahacks"
      },
      {
        id: 511,
        stage: "playable",
        effective_at: new Date('2026-10-09T18:00:00.000Z'),
        reason: "v1.0 release VPK available"
      }
    ]
  },
  {
    id: 52,
    game_id: 52,
    slug: "resident-evil-code-veronica-x-vita",
    reddit_url: "https://www.reddit.com/r/vitahacks/comments/1x1pl2a/resident_evil_code_veronica_x_port/",
    repo_url: "https://github.com/AshfordFamily/recvx-decomp",
    display_name: "Resident Evil Code: Veronica X (recvx-vita)",
    current_stage: "research",
    lifecycle: "active",
    summary: "Official PlayStation Vita port of Resident Evil Code: Veronica X in active development by Rinnegatamante based on the PS2 decompilation project.",
    playability_notes: "First showcase demonstrates in-engine real-time rendering of environments, Claire Redfield character model, and camera geometry.",
    performance_notes: "Initial renderer pipeline exploration on hardware; shader conversion in active progress.",
    first_seen_at: new Date('2026-10-09T14:00:00.000Z'),
    last_activity_at: new Date('2026-10-09T14:00:00.000Z'),
    released_at: null,
    is_featured: true,
    is_archived: false,
    game_title: "Resident Evil Code: Veronica X",
    original_platform: "PS2 / Dreamcast Decomp",
    original_release_year: 2001,
    technologies: [
      "Decompilation",
      "Native C++",
      "vitaGL"
    ],
    developers: [
      {
        id: 5,
        role: "lead",
        display_name: "Rinnegatamante",
        slug: "rinnegatamante"
      }
    ],
    stage_history: [
      {
        id: 520,
        stage: "announced",
        effective_at: new Date('2026-10-09T14:00:00.000Z'),
        reason: "Rinnegatamante video showcase published"
      },
      {
        id: 521,
        stage: "research",
        effective_at: new Date('2026-10-09T14:00:00.000Z'),
        reason: "Active decompilation port development"
      }
    ]
  }
,
  {
    id: 53,
    game_id: 53,
    slug: "strikers-port-wip-vita",
    reddit_url: "https://www.reddit.com/r/PSVitaHomebrew/comments/1x0mn3f/strikers_port_wip/",
    repo_url: "https://github.com/robin994/strikersVita",
    display_name: "Strikers port wip",
    current_stage: "playable",
    lifecycle: "active",
    summary: "Community PlayStation Vita port of Strikers port wip with source repository on GitHub.",
    playability_notes: "Automatically promoted from verified community source with repository and code evidence.",
    performance_notes: "Targeting native hardware performance.",
    first_seen_at: new Date('2026-10-08T09:40:22.000Z'),
    last_activity_at: new Date('2026-10-08T09:40:22.000Z'),
    released_at: new Date('2026-10-08T09:40:22.000Z'),
    is_featured: false,
    is_archived: false,
    verification: "developer_direct",
    game_title: "Strikers port wip",
    original_platform: "Various",
    original_release_year: null,
    technologies: ["vitaGL"],
    developers: [{ id: 53, role: "lead", display_name: "rob1n994", slug: "rob1n994" }],
    stage_history: [
      { id: 530, stage: "playable", effective_at: new Date('2026-10-08T09:40:22.000Z'), reason: "Verified source port release/development on GitHub" }
    ]
  }
];

export const FALLBACK_DEVELOPERS: any[] = [
  {
    id: 2,
    slug: "community-decomp",
    display_name: "Community Decomp Team",
    description: "Collaborative decompilation contributors researching GameCube/Wii native execution on ARM Vita.",
    is_known_developer: true,
    identities: [
      {
        provider: "reddit",
        username: "vitahacks"
      }
    ],
    projects: []
  },
  {
    id: 4,
    slug: "danielsant0s",
    display_name: "DanielSant0s",
    description: "Port developer reverse engineering Portal physics and chamber rendering for handhelds.",
    is_known_developer: true,
    identities: [
      {
        provider: "reddit",
        username: "DanielSant0s"
      }
    ],
    projects: []
  },
  {
    id: 5,
    slug: "rinnegatamante",
    display_name: "Rinnegatamante",
    description: "Prolific Vita homebrew architect, vitaGL creator, and developer of numerous Android wrappers.",
    is_known_developer: true,
    identities: [
      {
        provider: "reddit",
        username: "Rinnegatamante"
      }
    ],
    projects: []
  },
  {
    id: 6,
    slug: "zeno99",
    display_name: "Zeno99",
    description: "Reverse engineering specialist working on The Simpsons: Hit & Run engine recreation.",
    is_known_developer: true,
    identities: [
      {
        provider: "reddit",
        username: "Zeno99"
      }
    ],
    projects: []
  },
  {
    id: 7,
    slug: "hatoving",
    display_name: "hatoving",
    description: "Homebrew porter who brought Need for Speed: Hot Pursuit to PlayStation Vita via ARM wrapper.",
    is_known_developer: true,
    identities: [
      {
        provider: "reddit",
        username: "hatoving"
      }
    ],
    projects: []
  },
  {
    id: 8,
    slug: "sonicmastr",
    display_name: "SonicMastr",
    description: "Engine architect behind Ren'Py 8 Vita runtime (Python 3.11) and Class of '09.",
    is_known_developer: true,
    identities: [
      {
        provider: "reddit",
        username: "SonicMastr"
      }
    ],
    projects: []
  },
  {
    id: 11,
    slug: "fgsfds",
    display_name: "fgsfds",
    description: "Homebrew developer responsible for Render96 HD SM64 and numerous engine ports.",
    is_known_developer: true,
    identities: [
      {
        provider: "reddit",
        username: "fgsfds"
      }
    ],
    projects: []
  },
  {
    id: 12,
    slug: "mylegguy",
    display_name: "MyLegGuy",
    description: "Programmer who created the C-rewrite of Celeste Classic for handheld systems.",
    is_known_developer: true,
    identities: [
      {
        provider: "reddit",
        username: "MyLegGuy"
      }
    ],
    projects: []
  },
  {
    id: 23,
    slug: "chuta7x",
    display_name: "chutA7X",
    description: "Developer of the Real Racing 2 ARMv7 Android soloader port for PS Vita.",
    is_known_developer: true,
    identities: [
      {
        provider: "github",
        username: "CHUTA7X"
      },
      {
        provider: "reddit",
        username: "chutA7X"
      }
    ],
    projects: []
  },
  {
    id: 26,
    slug: "fauxrouge",
    display_name: "fauxrouge",
    description: "Developer behind the native GTA: Liberty City Stories PS Vita port based on reStories.",
    is_known_developer: true,
    identities: [
      {
        provider: "github",
        username: "fauxrougee"
      },
      {
        provider: "reddit",
        username: "amplieboy"
      }
    ],
    projects: []
  },
  {
    id: 27,
    slug: "devnoname120",
    display_name: "devnoname120",
    description: "Prominent PlayStation Vita homebrew engineer behind ARM wrappers, iOS loaders, and Call of Duty ports.",
    is_known_developer: true,
    identities: [
      {
        provider: "reddit",
        username: "devnoname120"
      }
    ],
    projects: []
  },
  {
    id: 28,
    slug: "justaverage456",
    display_name: "JustAverage456",
    description: "Homebrew developer porting games to Vita via custom C++ rewrites.",
    is_known_developer: true,
    identities: [
      {
        provider: "reddit",
        username: "JustAverage456"
      }
    ],
    projects: []
  },
  {
    id: 29,
    slug: "snoolobsters311",
    display_name: "SnooLobsters311",
    description: "Homebrew engineer working on The Force Engine (Dark Forces) Vita port.",
    is_known_developer: true,
    identities: [
      {
        provider: "reddit",
        username: "SnooLobsters311"
      }
    ],
    projects: []
  },
  {
    id: 30,
    slug: "nyabsi",
    display_name: "nyabsi",
    description: "Low-level Vita graphics engineer developing native Vulkan 1.1 drivers and 3D ports.",
    is_known_developer: true,
    identities: [
      {
        provider: "reddit",
        username: "nyabsi"
      }
    ],
    projects: []
  },
  {
    id: 31,
    slug: "onedumbfox",
    display_name: "OneDumbFox",
    description: "Homebrew creator developing the tactical FPS Insurgency for PS Vita.",
    is_known_developer: true,
    identities: [
      {
        provider: "reddit",
        username: "OneDumbFox"
      }
    ],
    projects: []
  },
  {
    id: 32,
    slug: "aj17o",
    display_name: "AJ17O",
    description: "Homebrew developer porting PREDATORS to PlayStation Vita.",
    is_known_developer: true,
    identities: [
      {
        provider: "reddit",
        username: "AJ17O"
      }
    ],
    projects: []
  },
  {
    id: 33,
    slug: "stoicpingu",
    display_name: "stoicpingu",
    description: "Homebrew author behind Robot Unicorn Attack and Umineko Vita ports.",
    is_known_developer: true,
    identities: [
      {
        provider: "reddit",
        username: "stoicpingu"
      }
    ],
    projects: []
  }
,
  {
    id: 53,
    slug: "rob1n994",
    display_name: "rob1n994",
    description: "Developer of Strikers port wip for PlayStation Vita.",
    is_known_developer: true,
    identities: [
      { provider: "reddit", username: "rob1n994" }
    ],
    projects: []
  }
];

export const FALLBACK_UPDATES: any[] = [
  {
    id: "upd_zelda_tp",
    port_project_id: 4,
    project_slug: "zelda-twilight-princess-vita",
    project_display_name: "Zelda: Twilight Princess Vita",
    developer_display_name: "Community Decomp Team",
    developer_slug: "community-decomp",
    event_type: "technical_progress",
    title: "Twilight Princess decompilation test builds surfaced on r/vitahacks",
    summary: "Early rendering tests running at 15-20 FPS in Ordon Village. Investigating custom texture compression to fit within Vita's 512MB RAM.",
    event_at: new Date('2026-09-15T15:34:00.000Z'),
    verification_level: "community_report",
    sources: [
      {
        source_item_id: "src_tp",
        relationship: "primary",
        canonical_url: "https://www.reddit.com/r/vitahacks/comments/1w9ys9f/the_new_psvita_ports/"
      }
    ]
  },
  {
    id: "upd_spiderman",
    port_project_id: 6,
    project_slug: "spider-man-total-mayhem-vita",
    project_display_name: "Spider-Man: Total Mayhem Vita",
    developer_display_name: "Rinnegatamante",
    developer_slug: "rinnegatamante",
    event_type: "first_in_game",
    title: "Spider-Man: Total Mayhem loads into gameplay on real hardware",
    summary: "Gameloft ARMv7 wrapper milestone reached with full Manhattan brawler combat and dual analog camera controls active.",
    event_at: new Date('2026-09-14T15:34:00.000Z'),
    verification_level: "developer_direct",
    sources: []
  },
  {
    id: "upd_portal",
    port_project_id: 5,
    project_slug: "portal-vita",
    project_display_name: "Portal Vita Port",
    developer_display_name: "DanielSant0s",
    developer_slug: "danielsant0s",
    event_type: "playability_progress",
    title: "Portal Vita: Test Chambers 00-05 playable with working physics",
    summary: "Dual portal rendering, momentum calculation, and weighted companion cube mechanics functioning smoothly at 30 FPS.",
    event_at: new Date('2026-09-13T15:34:00.000Z'),
    verification_level: "developer_direct",
    sources: []
  },
  {
    id: "upd_renpy8",
    port_project_id: 12,
    project_slug: "renpy-8-runtime-engine",
    project_display_name: "Ren'Py 8 Vita Engine Runtime",
    developer_display_name: "SonicMastr",
    developer_slug: "sonicmastr",
    event_type: "release",
    title: "[RELEASE] Ren'Py Vita 8 port with Python 3.11 support",
    summary: "Enables modern visual novels previously impossible on older Python 2 Vita runtimes with optimized RAM utilization.",
    event_at: new Date('2026-09-11T15:34:00.000Z'),
    verification_level: "developer_direct",
    sources: [
      {
        source_item_id: "src_renpy8",
        relationship: "primary",
        canonical_url: "https://www.reddit.com/r/vitahacks/comments/1h4yhyi/release_renpy_vita_8_port/"
      }
    ]
  },
  {
    id: "upd_nfs",
    port_project_id: 10,
    project_slug: "nfs-hot-pursuit-vita",
    project_display_name: "Need for Speed: Hot Pursuit Vita",
    developer_display_name: "hatoving",
    developer_slug: "hatoving",
    event_type: "release",
    title: "[NEW PORT] PS Vita Hot Pursuit released",
    summary: "Full ARM wrapper release with smooth career progression, cop pursuit missions, and custom graphical pipeline.",
    event_at: new Date('2026-09-10T15:34:00.000Z'),
    verification_level: "developer_direct",
    sources: []
  },
  {
    id: "upd_rc_cars",
    port_project_id: 20,
    project_slug: "rc-cars-vita",
    project_display_name: "RC Cars",
    developer_display_name: "antoxa2584x",
    developer_slug: "antoxa2584x",
    event_type: "technical_progress",
    title: "RC Cars port progress",
    summary: "Developer reports PC save file support, implemented progression, local multiplayer and an in-game interface, with source published on GitHub.",
    event_at: new Date('2026-09-18T11:09:43.000Z'),
    verification_level: "developer_direct",
    sources: [
      {
        source_item_id: "src_rc_cars",
        relationship: "primary",
        canonical_url: "https://www.reddit.com/r/vitahacks/comments/1wjn8zg/rc_cars_port_progress/"
      }
    ]
  },
  {
    id: "upd_cod_zombies",
    port_project_id: 22,
    project_slug: "cod-zombies-ios-loader",
    project_display_name: "Call of Duty: Zombies (iOS)",
    developer_display_name: "MajorTom_87",
    developer_slug: "majortom-87",
    event_type: "project_announced",
    title: "Bounty opened for Call of Duty: Zombies on Vita",
    summary: "Community bounty funding work to bring the iOS build of Call of Duty: Zombies to Vita through the iOS loader devnoname120 is developing. Metal Gear Solid Touch is named as another candidate for the same loader.",
    event_at: new Date('2026-09-18T07:54:45.000Z'),
    verification_level: "community_report",
    sources: [
      {
        source_item_id: "src_cod_zombies",
        relationship: "primary",
        canonical_url: "https://www.reddit.com/r/vitahacks/comments/1wjjx7w/a_bounty_that_deserves_more_visibility/"
      }
    ]
  },
  {
    id: "upd_cod4",
    port_project_id: 27,
    project_slug: "call-of-duty-4-vita",
    project_display_name: "Call of Duty 4: Modern Warfare Vita",
    developer_display_name: "Community port developer",
    developer_slug: "community-port-developer",
    event_type: "technical_progress",
    title: "Call of Duty 4 Vita reaches early in-game development",
    summary: "The September development thread reports campaign and multiplayer work in progress, with an edited update around 5–10 FPS.",
    event_at: new Date('2026-09-12T00:00:00.000Z'),
    verification_level: "community_report",
    sources: []
  },
  {
    id: "upd_re4_vita",
    port_project_id: 34,
    project_slug: "resident-evil-4-vita",
    project_display_name: "Resident Evil 4 Vita (re4-vita)",
    developer_display_name: "Rinnegatamante",
    developer_slug: "rinnegatamante",
    event_type: "project_announced",
    title: "Rinnegatamante opens official re4-vita repository",
    summary: "Rinnegatamante created the public GitHub repository for the Resident Evil 4 PlayStation Vita port following optimization teasers.",
    event_at: new Date('2026-09-25T17:04:11.000Z'),
    verification_level: "developer_direct",
    sources: [
      {
        source_item_id: "src_re4_vita_repo",
        relationship: "primary",
        canonical_url: "https://github.com/Rinnegatamante/re4-vita"
      },
      {
        source_item_id: "src_re4_vita_reddit",
        relationship: "community",
        canonical_url: "https://www.reddit.com/r/VitaPiracy/comments/1wmax82/guess_it_is_happening/"
      },
      {
        id: "upd_re4_vita_livestream",
        port_project_id: 34,
        project_slug: "resident-evil-4-vita",
        project_display_name: "Resident Evil 4 Vita (re4-vita)",
        developer_display_name: "Rinnegatamante",
        developer_slug: "rinnegatamante",
        event_type: "technical_progress",
        title: "Rinnegatamante live-streams Resident Evil 4 Vita CPU optimizations",
        summary: "During a live-stream Rinnegatamante reported ongoing CPU optimizations for the re4-vita port, stating a 20 rendered FPS target with auto frameskip as the ideal v1.0 release candidate and that no release will happen until beta testers can finish the game start to finish.",
        event_at: new Date('2026-09-30T21:29:28.000Z'),
        verification_level: "community_report",
        sources: [
          {
            source_item_id: "src_upd_re4_vita_livestream_reddit",
            relationship: "community",
            canonical_url: "https://www.reddit.com/r/vitahacks/comments/1wuhe87/to_anyone_interested_rinnegatamante_is_streaming/"
          }
        ]
      }
    ]
  },
  {
    id: "upd_rr2_vita",
    port_project_id: 35,
    project_slug: "real-racing-2-vita",
    project_display_name: "Real Racing 2 (RR2 Vita Port)",
    developer_display_name: "chutA7X",
    developer_slug: "chuta7x",
    event_type: "playable_demo",
    title: "Real Racing 2 Vita public beta release published",
    summary: "chutA7X released a playable public beta of Real Racing 2 for PlayStation Vita via an ARMv7 Android wrapper.",
    event_at: new Date('2026-09-21T11:39:44.312Z'),
    verification_level: "developer_direct",
    sources: [
      {
        source_item_id: "src_rr2_repo",
        relationship: "primary",
        canonical_url: "https://github.com/CHUTA7X/Real-Racing-2-Vita-Port-Release"
      },
      {
        source_item_id: "src_rr2_reddit",
        relationship: "community",
        canonical_url: "https://www.reddit.com/r/PSVitaHomebrew/comments/1wmabvz/updates_on_rr2_port/"
      }
    ]
  },
  {
    id: "upd_gta_lcs_vita",
    port_project_id: 39,
    project_slug: "gta-lcs-vita",
    project_display_name: "GTA: Liberty City Stories (reStories)",
    developer_display_name: "fauxrouge",
    developer_slug: "fauxrouge",
    event_type: "playable_demo",
    title: "GTA: Liberty City Stories native PS Vita port v01.15 released on GitHub",
    summary: "fauxrouge published the native PS Vita port of GTA: Liberty City Stories based on reStories with hardware sound, controls, and custom LiveArea.",
    event_at: new Date('2026-09-29T16:07:11.000Z'),
    verification_level: "developer_direct",
    sources: [
      {
        source_item_id: "src_gta_lcs_repo",
        relationship: "primary",
        canonical_url: "https://github.com/fauxrougee/GTALCS-psvita-port"
      },
      {
        source_item_id: "src_gta_lcs_reddit",
        relationship: "community",
        canonical_url: "https://www.reddit.com/r/vitahacks/comments/1wte7gf/gta_liberty_city_stories_my_ps_vita_port_is_now/"
      }
    ]
  },
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
      {
        source_item_id: "src_rr2_beta2_reddit",
        relationship: "community",
        canonical_url: "https://www.reddit.com/r/VitaPiracy/comments/1wvfxzk/real_racing_2_new_update_psvita_beta_2_3060_fps/"
      }
    ]
  },
  {
    id: "upd_rr3_beta1",
    port_project_id: 44,
    project_slug: "real-racing-3-vita",
    project_display_name: "Real Racing 3 (RR3 Vita Port)",
    developer_display_name: "chutA7X",
    developer_slug: "chuta7x",
    event_type: "playable_release",
    title: "[Release] Real Racing 3 Vita Beta 1.1",
    summary: "Playable public beta 1.1 build released for PS Vita by chutA7X featuring 3D vehicle physics and analog controls.",
    event_at: new Date('2026-10-06T12:00:00.000Z'),
    verification_level: "developer_direct",
    sources: [
      {
        source_item_id: "src_rr3_beta1",
        relationship: "primary",
        canonical_url: "https://www.reddit.com/r/PSVitaHomebrew/comments/1ww8upq/release_real_racing_3_vita_beta_11/"
      }
    ]
  },
  {
    id: "upd_waw_zombies_v1",
    port_project_id: 45,
    project_slug: "cod-waw-zombies-vita",
    project_display_name: "Call of Duty: World at War Zombies (iOS)",
    developer_display_name: "devnoname120",
    developer_slug: "devnoname120",
    event_type: "playable_release",
    title: "[Release] Call of Duty World at War Zombies port for the PS Vita",
    summary: "devnoname120 released the playable v1.0 port of World at War Zombies iOS for PS Vita with Nacht der Untoten map and dual-analog support.",
    event_at: new Date('2026-10-07T08:00:00.000Z'),
    verification_level: "developer_direct",
    sources: [
      {
        source_item_id: "src_waw_zombies_v1",
        relationship: "primary",
        canonical_url: "https://www.reddit.com/r/vitahacks/comments/1wzdh5y/release_call_of_duty_world_at_war_zombies_port/"
      }
    ]
  },
  {
    id: "upd_buckshot_roulette",
    port_project_id: 46,
    project_slug: "buckshot-roulette-vita",
    project_display_name: "Buckshot Roulette (BuckshotRoulettePortable)",
    developer_display_name: "JustAverage456",
    developer_slug: "justaverage456",
    event_type: "early_progress",
    title: "[WIP] BuckshotRoulettePortable - A C++ rewrite of Buckshot Roulette for the PSVITA Targeting 60fps",
    summary: "JustAverage456 announced BuckshotRoulettePortable, a native C++ rewrite of Buckshot Roulette targeting 60 FPS on PS Vita via vitaGL.",
    event_at: new Date('2026-09-22T08:58:38.000Z'),
    verification_level: "developer_direct",
    sources: [
      {
        source_item_id: "src_buckshot_reddit",
        relationship: "primary",
        canonical_url: "https://www.reddit.com/r/vitahacks/comments/1wn46c9/wip_buckshotrouletteportable_a_c_rewrite_of/"
      }
    ]
  },
  {
    id: "upd_theforceengine",
    port_project_id: 47,
    project_slug: "the-force-engine-dark-forces-vita",
    project_display_name: "Star Wars: Dark Forces (TheForceEngine-VITA)",
    developer_display_name: "SnooLobsters311",
    developer_slug: "snoolobsters311",
    event_type: "first_boot",
    title: "TheForceEngine-VITA - Successfully booting into the menu",
    summary: "SnooLobsters311 achieved menu boot on PlayStation Vita for The Force Engine port of Star Wars: Dark Forces.",
    event_at: new Date('2026-09-20T20:24:59.000Z'),
    verification_level: "developer_direct",
    sources: [
      {
        source_item_id: "src_forceengine_reddit",
        relationship: "primary",
        canonical_url: "https://www.reddit.com/r/vitahacks/comments/1wlrv6x/theforceenginevita_successfully_booting_into_the/"
      }
    ]
  },
  {
    id: "upd_supertuxkart_vulkan",
    port_project_id: 48,
    project_slug: "supertuxkart-vulkan-vita",
    project_display_name: "SuperTuxKart (Vulkan 1.1 Native)",
    developer_display_name: "nyabsi",
    developer_slug: "nyabsi",
    event_type: "first_in_game",
    title: "SuperTuxKart W.I.P port for PlayStation Vita with Vulkan",
    summary: "nyabsi demonstrated SuperTuxKart running in-game on PS Vita powered by a native low-level Vulkan 1.1 driver.",
    event_at: new Date('2026-09-19T07:09:39.000Z'),
    verification_level: "developer_direct",
    sources: [
      {
        source_item_id: "src_supertuxkart_reddit",
        relationship: "primary",
        canonical_url: "https://www.reddit.com/r/vitahacks/comments/1wkf9m5/supertuxkart_wip_port_for_playstation_vita_with/"
      }
    ]
  },
  {
    id: "upd_insurgency_vita",
    port_project_id: 49,
    project_slug: "insurgency-vita",
    project_display_name: "Insurgency Vita (Tactical FPS)",
    developer_display_name: "OneDumbFox",
    developer_slug: "onedumbfox",
    event_type: "first_in_game",
    title: "INSURGENCY: Vita - Gameplay Showcase & Information",
    summary: "OneDumbFox showcased in-game tactical FPS gameplay and map rendering for Insurgency Vita.",
    event_at: new Date('2026-10-02T08:20:55.000Z'),
    verification_level: "developer_direct",
    sources: [
      {
        source_item_id: "src_insurgency_reddit",
        relationship: "primary",
        canonical_url: "https://www.reddit.com/r/vitahacks/comments/1wvob17/insurgency_vita_gameplay_showcase_information/"
      }
    ]
  },
  {
    id: "upd_predators_release",
    port_project_id: 50,
    project_slug: "predators-vita",
    project_display_name: "PREDATORS (PS Vita Port)",
    developer_display_name: "AJ17O",
    developer_slug: "aj17o",
    event_type: "playable_release",
    title: "[Release] PREDATORS PSvita port",
    summary: "AJ17O published the standalone PlayStation Vita port of PREDATORS with source code on GitHub.",
    event_at: new Date('2026-10-10T02:00:00.000Z'),
    verification_level: "developer_direct",
    sources: [
      {
        source_item_id: "src_predators_reddit",
        relationship: "primary",
        canonical_url: "https://www.reddit.com/r/vitahacks/comments/1x2kzyz/release_predators_psvita_port/"
      }
    ]
  },
  {
    id: "upd_robot_unicorn_attack_v1",
    port_project_id: 51,
    project_slug: "robot-unicorn-attack-vita",
    project_display_name: "Robot Unicorn Attack (Vita Port)",
    developer_display_name: "stoicpingu",
    developer_slug: "stoicpingu",
    event_type: "playable_release",
    title: "[Release] Robot Unicorn Attack - Vita Port v1.0",
    summary: "stoicpingu released Robot Unicorn Attack v1.0 for PS Vita with 60 FPS gameplay and original audio.",
    event_at: new Date('2026-10-09T18:00:00.000Z'),
    verification_level: "developer_direct",
    sources: [
      {
        source_item_id: "src_rua_reddit",
        relationship: "primary",
        canonical_url: "https://www.reddit.com/r/vitahacks/comments/1x1v4zp/release_robot_unicorn_attack_vita_port_v10/"
      }
    ]
  },
  {
    id: "upd_recvx_showcase",
    port_project_id: 52,
    project_slug: "resident-evil-code-veronica-x-vita",
    project_display_name: "Resident Evil Code: Veronica X (recvx-vita)",
    developer_display_name: "Rinnegatamante",
    developer_slug: "rinnegatamante",
    event_type: "technical_progress",
    title: "Resident Evil Code Veronica X port - Rinnegatamante's First Showcase",
    summary: "Rinnegatamante showcased the first running in-engine build of Resident Evil Code: Veronica X decompilation port on PS Vita.",
    event_at: new Date('2026-10-09T14:00:00.000Z'),
    verification_level: "developer_direct",
    sources: [
      {
        source_item_id: "src_recvx_reddit",
        relationship: "primary",
        canonical_url: "https://www.reddit.com/r/vitahacks/comments/1x1pl2a/resident_evil_code_veronica_x_port/"
      }
    ]
  }
,
  {
    id: "upd_strikers_port_wip_vita",
    port_project_id: 53,
    project_slug: "strikers-port-wip-vita",
    project_display_name: "Strikers port wip",
    developer_display_name: "rob1n994",
    developer_slug: "rob1n994",
    event_type: "playable_demo",
    title: "Strikers port wip PS Vita port surfaced with repository",
    summary: "Automated verification confirmed active repository and code evidence for Strikers port wip.",
    event_at: new Date('2026-10-08T09:40:22.000Z'),
    verification_level: "developer_direct",
    sources: [
      { source_item_id: "src_upd_strikers_port_wip_vita_repo", relationship: "primary", canonical_url: "https://github.com/robin994/strikersVita" },
      { source_item_id: "src_upd_strikers_port_wip_vita_reddit", relationship: "community", canonical_url: "https://www.reddit.com/r/PSVitaHomebrew/comments/1x0mn3f/strikers_port_wip/" }
    ]
  }
];
