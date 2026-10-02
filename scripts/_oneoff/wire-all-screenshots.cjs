const fs = require("fs");
const path = require("path");

const mappings = {
  "openmohaa-vita": { url: "/screenshots/openmohaa.jpg", alt: "Medal of Honor: Allied Assault OpenMoHAA gameplay screenshot" },
  "smash-melee-vita": { url: "/screenshots/smash-melee.jpg", alt: "Super Smash Bros. Melee gameplay artwork" },
  "hollow-knight-vita": { url: "/screenshots/hollow-knight.jpg", alt: "Hollow Knight gameplay screenshot" },
  "zelda-twilight-princess-vita": { url: "/screenshots/zelda-twilight-princess.jpg", alt: "The Legend of Zelda: Twilight Princess gameplay" },
  "portal-vita": { url: "/screenshots/portal.jpg", alt: "Portal gameplay screenshot" },
  "spider-man-total-mayhem-vita": { url: "/screenshots/spider-man-total-mayhem.jpg", alt: "Spider-Man: Total Mayhem gameplay" },
  "simpsons-hit-and-run-vita": { url: "/screenshots/simpsons-hit-and-run.jpg", alt: "The Simpsons: Hit & Run gameplay" },
  "kotor-vita": { url: "/screenshots/kotor.jpg", alt: "Star Wars: Knights of the Old Republic gameplay" },
  "nfs-hot-pursuit-vita": { url: "/screenshots/nfs-hot-pursuit.jpg", alt: "Need for Speed: Hot Pursuit gameplay" },
  "renpy-8-runtime-engine": { url: "/screenshots/cave-story.jpg", alt: "Ren'Py visual novel runtime" },
  "zelda-ship-of-harkinian-vita": { url: "/screenshots/zelda-oot.jpg", alt: "Zelda: Ship of Harkinian Ocarina of Time gameplay" },
  "slingshot-racing-vita": { url: "/screenshots/slingshot-racing.jpg", alt: "Slingshot Racing gameplay" },
  "fallout-2-ce-vita": { url: "/screenshots/fallout-2.jpg", alt: "Fallout 2 Community Edition gameplay" },
  "render96-sm64-hd-vita": { url: "/screenshots/smash-melee.jpg", alt: "Render96 HD Super Mario 64" },
  "celeste-classic-vita": { url: "/screenshots/celeste.jpg", alt: "Celeste Classic gameplay" },
  "renegade-vita-demo-release": { url: "/screenshots/cnc-renegade.png", alt: "Renegade Vita demo release hardware capture" },
  "rc-cars-vita": { url: "/screenshots/rc-cars.webp", alt: "RC Cars hardware capture on PS Vita Fat" },
  "cod-zombies-ios-loader": { url: "/screenshots/cod-zombies.png", alt: "Call of Duty: Zombies hardware gameplay capture" },
  "call-of-duty-4-vita": { url: "/screenshots/call-of-duty-4.jpeg", alt: "Call of Duty 4 PS3 to Vita conversion test build" },
  "c-dogs-sdl-vita": { url: "/screenshots/c-dogs-sdl.png", alt: "C-Dogs SDL gameplay screenshot" },
  "resident-evil-4-vita": { url: "/screenshots/resident-evil-4.jpg", alt: "Resident Evil 4 gameplay" },
  "real-racing-2-vita": { url: "/screenshots/real-racing-2.png", alt: "Real Racing 2 PS Vita beta gameplay" },
  "diddy-kong-racing-golden-balloon": { url: "/screenshots/diddy-kong-racing.jpg", alt: "Diddy Kong Racing Golden Balloon hero screenshot" },
  "cnc-renegade-vita": { url: "/screenshots/cnc-renegade.png", alt: "Command & Conquer: Renegade native Vita port" },
  "gta-lcs-vita": { url: "/screenshots/gta-lcs.png", alt: "GTA: Liberty City Stories reStories LiveArea artwork" },
  "test-drive-iii-vita": { url: "/screenshots/test-drive-iii-bg.png", alt: "Test Drive III Vita port LiveArea background" },
  "test-drive-ii-vita": { url: "/screenshots/test-drive-ii-bg.png", alt: "Test Drive II Vita port LiveArea background" },
  "halo-ce-decomp-pc-and-android-vita": { url: "/screenshots/halo-ce.jpg", alt: "Halo: Combat Evolved Vita release gameplay" }
};

let code = fs.readFileSync("src/shared/constants/fallbackData.ts", "utf8");

let updated = 0;
for (const [slug, meta] of Object.entries(mappings)) {
  // Search for the project block by slug
  const slugAnchor = 'slug: "' + slug + '",';
  const slugPos = code.indexOf(slugAnchor);
  if (slugPos === -1) continue;

  // Find technologies: after this slugPos
  const nextTechPos = code.indexOf("technologies:", slugPos);
  if (nextTechPos === -1) continue;

  // Check if screenshot_url is already present between slugPos and nextTechPos
  const block = code.slice(slugPos, nextTechPos);
  if (block.includes("screenshot_url:")) {
    // replace existing screenshot_url line
    const updatedBlock = block.replace(
      /screenshot_url:s*"[^"]*",s*screenshot_alt:s*"[^"]*",s*/,
      'screenshot_url: "' + meta.url + '",\n    screenshot_alt: "' + meta.alt + '",\n    '
    );
    code = code.slice(0, slugPos) + updatedBlock + code.slice(nextTechPos);
    updated++;
  } else {
    // insert screenshot_url right before technologies:
    const toInsert = 'screenshot_url: "' + meta.url + '",\n    screenshot_alt: "' + meta.alt + '",\n    ';
    code = code.slice(0, nextTechPos) + toInsert + code.slice(nextTechPos);
    updated++;
  }
}

fs.writeFileSync("src/shared/constants/fallbackData.ts", code, "utf8");
console.log("Successfully wired screenshots into fallbackData.ts (" + updated + " projects updated)");
