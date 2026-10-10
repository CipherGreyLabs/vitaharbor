export interface GraduatedProject {
  id: number;
  slug: string;
  title: string;
  developer: string;
  vitadb_id: number;
  vitadb_url: string;
  released_year: number | null;
  original_platform: string;
  summary: string;
  technologies: string[];
}

export const GRADUATED_PROJECTS: GraduatedProject[] = [
  {
    "id": 101,
    "slug": "class-of-09-vita",
    "title": "Class of '09 Native",
    "developer": "TheSpasticGamer",
    "vitadb_id": 1565,
    "vitadb_url": "https://vitadb.rinnegatamante.it/#/info/1565",
    "released_year": 2026,
    "original_platform": "PC / Ren'Py",
    "summary": "Native C runtime port of Class of '09 visual novel with full audio and touch support, officially released on VitaDB.",
    "technologies": [
      "Ren'Py",
      "Native C"
    ]
  },
  {
    "id": 102,
    "slug": "cave-story-evo-vita",
    "title": "NXENGINE-EVO (Cave Story)",
    "developer": "nxengine-evo team",
    "vitadb_id": 1458,
    "vitadb_url": "https://vitadb.rinnegatamante.it/#/info/1458",
    "released_year": 2025,
    "original_platform": "PC / Decomp",
    "summary": "Complete enhanced NXEngine-EVO port of Cave Story with custom soundtrack support and widescreen display on PS Vita.",
    "technologies": [
      "NXEngine",
      "C++",
      "vitaGL"
    ]
  },
  {
    "id": 103,
    "slug": "d2vita",
    "title": "D2Vita (Diablo II: Lord of Destruction)",
    "developer": "Franckrst",
    "vitadb_id": 1523,
    "vitadb_url": "https://vitadb.rinnegatamante.it/#/info/1523",
    "released_year": 2026,
    "original_platform": "PC",
    "summary": "Native ARM recompilation port of Diablo II with full expansion support, touch navigation, and controller mapping.",
    "technologies": [
      "Native C",
      "ARM Recomp"
    ]
  },
  {
    "id": 104,
    "slug": "illusia-vita",
    "title": "Illusia Vita",
    "developer": "withLogic / MetalSyntax",
    "vitadb_id": 1500,
    "vitadb_url": "https://vitadb.rinnegatamante.it/#/info/1500",
    "released_year": 2026,
    "original_platform": "Android ARMv7",
    "summary": "Complete Android ARMv7 standalone wrapper port of GAMEVIL's classic action RPG running at 60 FPS on Vita.",
    "technologies": [
      "ARMv7 Wrapper",
      "vitaGL"
    ]
  },
  {
    "id": 105,
    "slug": "jedi-academy-vita",
    "title": "JAVITA: Jedi Knight: Jedi Academy",
    "developer": "NDRW",
    "vitadb_id": 1481,
    "vitadb_url": "https://vitadb.rinnegatamante.it/#/info/1481",
    "released_year": 2026,
    "original_platform": "PC / OpenJK",
    "summary": "Full native OpenJK engine port of Jedi Academy with dual-analog saber controls and multiplayer support.",
    "technologies": [
      "OpenJK",
      "C++",
      "vitaGL"
    ]
  },
  {
    "id": 106,
    "slug": "jedi-outcast-vita",
    "title": "JK2VITA: Jedi Knight II: Jedi Outcast",
    "developer": "NDRW",
    "vitadb_id": 1480,
    "vitadb_url": "https://vitadb.rinnegatamante.it/#/info/1480",
    "released_year": 2026,
    "original_platform": "PC / OpenJK",
    "summary": "Full OpenJK engine port of Jedi Outcast with hardware-accelerated GXM rendering and complete campaign playability.",
    "technologies": [
      "OpenJK",
      "C++",
      "vitaGL"
    ]
  },
  {
    "id": 107,
    "slug": "barony-vita",
    "title": "Barony Vita",
    "developer": "Brendonm17 / bren",
    "vitadb_id": 1444,
    "vitadb_url": "https://vitadb.rinnegatamante.it/#/info/1444",
    "released_year": 2026,
    "original_platform": "PC",
    "summary": "First-person roguelike dungeon crawler ported to PS Vita with full OpenGL ES rendering and local co-op.",
    "technologies": [
      "Native C",
      "SDL2",
      "OpenGL ES"
    ]
  },
  {
    "id": 108,
    "slug": "test-drive-1987-vita",
    "title": "Test Drive (1987) Vita",
    "developer": "smart-pickle",
    "vitadb_id": 1530,
    "vitadb_url": "https://vitadb.rinnegatamante.it/#/info/1530",
    "released_year": 2026,
    "original_platform": "DOS",
    "summary": "Classic 1987 driving simulation ported to Vita with native SDL2 audio and VitaSDK graphics.",
    "technologies": [
      "VitaSDK",
      "SDL2",
      "vitaGL"
    ]
  },
  {
    "id": 109,
    "slug": "test-drive-ii-vita",
    "title": "Test Drive II: The Duel Vita",
    "developer": "smart-pickle",
    "vitadb_id": 1555,
    "vitadb_url": "https://vitadb.rinnegatamante.it/#/info/1555",
    "released_year": 2026,
    "original_platform": "DOS",
    "summary": "The Duel: Test Drive II ported natively to PS Vita with enhanced controller input and full speed emulation.",
    "technologies": [
      "VitaSDK",
      "SDL2"
    ]
  },
  {
    "id": 110,
    "slug": "test-drive-iii-vita",
    "title": "Test Drive III: The Passion Vita",
    "developer": "smart-pickle",
    "vitadb_id": 1556,
    "vitadb_url": "https://vitadb.rinnegatamante.it/#/info/1556",
    "released_year": 2026,
    "original_platform": "DOS",
    "summary": "Early 3D polygon racing game Test Drive III ported to Vita with custom sound driver and hardware scaling.",
    "technologies": [
      "VitaSDK",
      "SDL2"
    ]
  },
  {
    "id": 111,
    "slug": "aleph-one-vita",
    "title": "Aleph One Vita (Marathon Trilogy)",
    "developer": "DrDecki",
    "vitadb_id": 1421,
    "vitadb_url": "https://vitadb.rinnegatamante.it/#/info/1421",
    "released_year": 2026,
    "original_platform": "Mac / PC",
    "summary": "Aleph One engine port supporting Marathon, Marathon 2: Durandal, and Marathon Infinity with vitaGL acceleration.",
    "technologies": [
      "Aleph One",
      "C++",
      "vitaGL"
    ]
  },
  {
    "id": 112,
    "slug": "apotris-psvita",
    "title": "Apotris PS Vita",
    "developer": "Rocroverss",
    "vitadb_id": 1537,
    "vitadb_url": "https://vitadb.rinnegatamante.it/#/info/1537",
    "released_year": 2026,
    "original_platform": "GBA / Modern",
    "summary": "Feature-complete block-stacking game running natively at locked 60 FPS with 14 game modes and custom audio.",
    "technologies": [
      "Native C",
      "VitaSDK"
    ]
  },
  {
    "id": 113,
    "slug": "prince-of-persia-classic-vita",
    "title": "Prince of Persia Classic Vita",
    "developer": "MetalSyntax",
    "vitadb_id": 1527,
    "vitadb_url": "https://vitadb.rinnegatamante.it/#/info/1527",
    "released_year": 2026,
    "original_platform": "Android ARMv7",
    "summary": "Prince of Persia Classic Android remaster wrapper port running with full hardware shaders and native controls.",
    "technologies": [
      "ARMv7 Wrapper",
      "vitaGL"
    ]
  },
  {
    "id": 114,
    "slug": "predators-vita",
    "title": "PREDATORS Vita",
    "developer": "AJ17O",
    "vitadb_id": 1604,
    "vitadb_url": "https://vitadb.rinnegatamante.it/#/info/1604",
    "released_year": 2026,
    "original_platform": "Android / iOS",
    "summary": "Native PlayStation Vita port of PREDATORS based on ShadowOsmium decompilation with full touchscreen weapon selection, officially released on VitaDB.",
    "technologies": [
      "Decompilation",
      "Native C++",
      "vitaGL"
    ]
  },
  {
    "id": 115,
    "slug": "halo-ce-vita",
    "title": "Halo CE Vita",
    "developer": "BirchWoodGod",
    "vitadb_id": 1558,
    "vitadb_url": "https://vitadb.rinnegatamante.it/#/info/1558",
    "released_year": 2026,
    "original_platform": "Xbox",
    "summary": "Native PlayStation Vita port of Halo: Combat Evolved built from universal Xbox decompilation, officially released on VitaDB.",
    "technologies": [
      "Decompilation",
      "Native C++",
      "vitaGL"
    ]
  },
  {
    "id": 116,
    "slug": "kotor-vita",
    "title": "VitaKotor",
    "developer": "ScoobyDouche",
    "vitadb_id": 1515,
    "vitadb_url": "https://vitadb.rinnegatamante.it/#/info/1515",
    "released_year": 2026,
    "original_platform": "Xbox / PC / Android",
    "summary": "Star Wars: Knights of the Old Republic port running natively on PS Vita, officially released on VitaDB.",
    "technologies": [
      "ARMv7 Wrapper",
      "Native C++",
      "vitaGL"
    ]
  },
  {
    "id": 117,
    "slug": "openmohaa-vita",
    "title": "OpenMoHAA Vita",
    "developer": "HenryKun55",
    "vitadb_id": 1496,
    "vitadb_url": "https://vitadb.rinnegatamante.it/#/info/1496",
    "released_year": 2026,
    "original_platform": "PC",
    "summary": "Native PlayStation Vita port of OpenMoHAA (Medal of Honor: Allied Assault), officially released on VitaDB.",
    "technologies": [
      "OpenMoHAA",
      "Native C++",
      "vitaGL"
    ]
  },
  {
    "id": 118,
    "slug": "smash-melee-vita",
    "title": "Smash Melee Vita",
    "developer": "zm2283145",
    "vitadb_id": 1524,
    "vitadb_url": "https://vitadb.rinnegatamante.it/#/info/1524",
    "released_year": 2026,
    "original_platform": "GameCube / Decomp",
    "summary": "Super Smash Bros. Melee port running natively on SceGXM and vitaGL, officially released on VitaDB.",
    "technologies": [
      "Decompilation",
      "Native C++",
      "vitaGL",
      "SceGXM"
    ]
  },
  {
    "id": 119,
    "slug": "hollow-knight-vita",
    "title": "Hollow Knight Vita",
    "developer": "PatnosD",
    "vitadb_id": 1168,
    "vitadb_url": "https://vitadb.rinnegatamante.it/#/info/1168",
    "released_year": 2025,
    "original_platform": "PC / Unity",
    "summary": "Complete C# / Unity decompilation native ARM port of Hollow Knight, officially released on VitaDB.",
    "technologies": [
      "Decompilation",
      "ARM Native"
    ]
  },
  {
    "id": 120,
    "slug": "zelda-ship-of-harkinian-vita",
    "title": "Ship of Harkinian Vita",
    "developer": "Rinnegatamante",
    "vitadb_id": 1276,
    "vitadb_url": "https://vitadb.rinnegatamante.it/#/info/1276",
    "released_year": 2026,
    "original_platform": "N64 / PC Decomp",
    "summary": "Direct native Vita build of the Harbour Masters Ocarina of Time decompilation, officially released on VitaDB.",
    "technologies": [
      "Decompilation",
      "Native C++",
      "vitaGL"
    ]
  },
  {
    "id": 121,
    "slug": "fallout-2-ce-vita",
    "title": "Fallout 2 CE",
    "developer": "Northfear",
    "vitadb_id": 842,
    "vitadb_url": "https://vitadb.rinnegatamante.it/#/info/842",
    "released_year": 2024,
    "original_platform": "PC",
    "summary": "Open-source recreation of Fallout 2 engine compiled natively for PlayStation Vita, officially released on VitaDB.",
    "technologies": [
      "Native C",
      "SDL2"
    ]
  },
  {
    "id": 122,
    "slug": "c-dogs-sdl-vita",
    "title": "C-Dogs SDL Vita",
    "developer": "abduct",
    "vitadb_id": 1527,
    "vitadb_url": "https://vitadb.rinnegatamante.it/#/info/1527",
    "released_year": 2026,
    "original_platform": "DOS / SDL",
    "summary": "Classic top-down run-and-gun shooter C-Dogs SDL ported to Vita, officially released on VitaDB.",
    "technologies": [
      "Native C",
      "SDL2"
    ]
  },
  {
    "id": 123,
    "slug": "diddy-kong-racing-golden-balloon",
    "title": "Golden Balloon Vita",
    "developer": "zm2283145",
    "vitadb_id": 1512,
    "vitadb_url": "https://vitadb.rinnegatamante.it/#/info/1512",
    "released_year": 2026,
    "original_platform": "N64 / Decomp",
    "summary": "Diddy Kong Racing 64 decompilation source port running full Adventure with custom trophies, officially released on VitaDB.",
    "technologies": [
      "Decompilation",
      "Native C++",
      "vitaGL"
    ]
  },
  {
    "id": 124,
    "slug": "rebounce-vita",
    "title": "reBounce Vita",
    "developer": "myname24",
    "vitadb_id": 1597,
    "vitadb_url": "https://vitadb.rinnegatamante.it/#/info/1597",
    "released_year": 2026,
    "original_platform": "Nokia N900 / OpenGL ES",
    "summary": "Bounce Evolution 3D tilt-and-roll ball game running natively at 60 FPS on PS Vita, officially released on VitaDB.",
    "technologies": [
      "OpenGL ES",
      "Native C",
      "vitaGL"
    ]
  },
  {
    "id": 125,
    "slug": "plants-vs-zombies-2-vita",
    "title": "Plants vs Zombies 2 Vita",
    "developer": "LeZergan",
    "vitadb_id": 1574,
    "vitadb_url": "https://vitadb.rinnegatamante.it/#/info/1574",
    "released_year": 2026,
    "original_platform": "Android / iOS",
    "summary": "Plants vs Zombies 2 port for PlayStation Vita, officially released on VitaDB.",
    "technologies": [
      "ARMv7 Wrapper",
      "vitaGL"
    ]
  },
  {
    "id": 126,
    "slug": "insaniquarium-vita",
    "title": "Insaniquarium Vita",
    "developer": "KartingSackboy06",
    "vitadb_id": 1585,
    "vitadb_url": "https://vitadb.rinnegatamante.it/#/info/1585",
    "released_year": 2026,
    "original_platform": "PC / Android",
    "summary": "Insaniquarium! Deluxe port for PS Vita with touchscreen controls and sound, officially released on VitaDB.",
    "technologies": [
      "Native C++",
      "Android Loader"
    ]
  },
  {
    "id": 127,
    "slug": "umineko-project-vita",
    "title": "Umineko Project Vita",
    "developer": "stoicpingu",
    "vitadb_id": 1581,
    "vitadb_url": "https://vitadb.rinnegatamante.it/#/info/1581",
    "released_year": 2026,
    "original_platform": "PC / ONScripter-RU",
    "summary": "Umineko Project visual novel port based on ONScripter-RU with PS3 assets and full voice acting, officially released on VitaDB.",
    "technologies": [
      "ONScripter-RU",
      "Native C++"
    ]
  }
];
