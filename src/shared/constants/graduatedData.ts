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
    id: 101,
    slug: "class-of-09-vita",
    title: "Class of '09 Native",
    developer: "TheSpasticGamer",
    vitadb_id: 1565,
    vitadb_url: "https://vitadb.rinnegatamante.it/#/info/1565",
    released_year: 2026,
    original_platform: "PC / Ren'Py",
    summary: "Native C runtime port of Class of '09 visual novel with full audio and touch support, officially released on VitaDB.",
    technologies: ["Ren'Py", "Native C"]
  },
  {
    id: 102,
    slug: "cave-story-evo-vita",
    title: "NXENGINE-EVO (Cave Story)",
    developer: "nxengine-evo team",
    vitadb_id: 1458,
    vitadb_url: "https://vitadb.rinnegatamante.it/#/info/1458",
    released_year: 2025,
    original_platform: "PC / Decomp",
    summary: "Complete enhanced NXEngine-EVO port of Cave Story with custom soundtrack support and widescreen display on PS Vita.",
    technologies: ["NXEngine", "C++", "vitaGL"]
  },
  {
    id: 103,
    slug: "d2vita",
    title: "D2Vita (Diablo II: Lord of Destruction)",
    developer: "Franckrst",
    vitadb_id: 1523,
    vitadb_url: "https://vitadb.rinnegatamante.it/#/info/1523",
    released_year: 2026,
    original_platform: "PC",
    summary: "Native ARM recompilation port of Diablo II with full expansion support, touch navigation, and controller mapping.",
    technologies: ["Native C", "ARM Recomp"]
  },
  {
    id: 104,
    slug: "illusia-vita",
    title: "Illusia Vita",
    developer: "withLogic / MetalSyntax",
    vitadb_id: 1500,
    vitadb_url: "https://vitadb.rinnegatamante.it/#/info/1500",
    released_year: 2026,
    original_platform: "Android ARMv7",
    summary: "Complete Android ARMv7 standalone wrapper port of GAMEVIL's classic action RPG running at 60 FPS on Vita.",
    technologies: ["ARMv7 Wrapper", "vitaGL"]
  },
  {
    id: 105,
    slug: "jedi-academy-vita",
    title: "JAVITA: Jedi Knight: Jedi Academy",
    developer: "NDRW",
    vitadb_id: 1481,
    vitadb_url: "https://vitadb.rinnegatamante.it/#/info/1481",
    released_year: 2026,
    original_platform: "PC / OpenJK",
    summary: "Full native OpenJK engine port of Jedi Academy with dual-analog saber controls and multiplayer support.",
    technologies: ["OpenJK", "C++", "vitaGL"]
  },
  {
    id: 106,
    slug: "jedi-outcast-vita",
    title: "JK2VITA: Jedi Knight II: Jedi Outcast",
    developer: "NDRW",
    vitadb_id: 1480,
    vitadb_url: "https://vitadb.rinnegatamante.it/#/info/1480",
    released_year: 2026,
    original_platform: "PC / OpenJK",
    summary: "Full OpenJK engine port of Jedi Outcast with hardware-accelerated GXM rendering and complete campaign playability.",
    technologies: ["OpenJK", "C++", "vitaGL"]
  },
  {
    id: 107,
    slug: "barony-vita",
    title: "Barony Vita",
    developer: "Brendonm17 / bren",
    vitadb_id: 1444,
    vitadb_url: "https://vitadb.rinnegatamante.it/#/info/1444",
    released_year: 2026,
    original_platform: "PC",
    summary: "First-person roguelike dungeon crawler ported to PS Vita with full OpenGL ES rendering and local co-op.",
    technologies: ["Native C", "SDL2", "OpenGL ES"]
  },
  {
    id: 108,
    slug: "test-drive-1987-vita",
    title: "Test Drive (1987) Vita",
    developer: "smart-pickle",
    vitadb_id: 1530,
    vitadb_url: "https://vitadb.rinnegatamante.it/#/info/1530",
    released_year: 2026,
    original_platform: "DOS",
    summary: "Classic 1987 driving simulation ported to Vita with native SDL2 audio and VitaSDK graphics.",
    technologies: ["VitaSDK", "SDL2", "vitaGL"]
  },
  {
    id: 109,
    slug: "test-drive-ii-vita",
    title: "Test Drive II: The Duel Vita",
    developer: "smart-pickle",
    vitadb_id: 1555,
    vitadb_url: "https://vitadb.rinnegatamante.it/#/info/1555",
    released_year: 2026,
    original_platform: "DOS",
    summary: "The Duel: Test Drive II ported natively to PS Vita with enhanced controller input and full speed emulation.",
    technologies: ["VitaSDK", "SDL2"]
  },
  {
    id: 110,
    slug: "test-drive-iii-vita",
    title: "Test Drive III: The Passion Vita",
    developer: "smart-pickle",
    vitadb_id: 1556,
    vitadb_url: "https://vitadb.rinnegatamante.it/#/info/1556",
    released_year: 2026,
    original_platform: "DOS",
    summary: "Early 3D polygon racing game Test Drive III ported to Vita with custom sound driver and hardware scaling.",
    technologies: ["VitaSDK", "SDL2"]
  },
  {
    id: 111,
    slug: "aleph-one-vita",
    title: "Aleph One Vita (Marathon Trilogy)",
    developer: "DrDecki",
    vitadb_id: 1421,
    vitadb_url: "https://vitadb.rinnegatamante.it/#/info/1421",
    released_year: 2026,
    original_platform: "Mac / PC",
    summary: "Aleph One engine port supporting Marathon, Marathon 2: Durandal, and Marathon Infinity with vitaGL acceleration.",
    technologies: ["Aleph One", "C++", "vitaGL"]
  },
  {
    id: 112,
    slug: "apotris-psvita",
    title: "Apotris PS Vita",
    developer: "Rocroverss",
    vitadb_id: 1537,
    vitadb_url: "https://vitadb.rinnegatamante.it/#/info/1537",
    released_year: 2026,
    original_platform: "GBA / Modern",
    summary: "Feature-complete block-stacking game running natively at locked 60 FPS with 14 game modes and custom audio.",
    technologies: ["Native C", "VitaSDK"]
  },
  {
    id: 113,
    slug: "prince-of-persia-classic-vita",
    title: "Prince of Persia Classic Vita",
    developer: "MetalSyntax",
    vitadb_id: 1527,
    vitadb_url: "https://vitadb.rinnegatamante.it/#/info/1527",
    released_year: 2026,
    original_platform: "Android ARMv7",
    summary: "Prince of Persia Classic Android remaster wrapper port running with full hardware shaders and native controls.",
    technologies: ["ARMv7 Wrapper", "vitaGL"]
  }
];
