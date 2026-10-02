const fs = require("fs");

const mappings = {
  "portal-vita": { url: "/screenshots/portal.jpg", alt: "Portal gameplay screenshot" },
  "renegade-vita-demo-release": { url: "/screenshots/cnc-renegade.png", alt: "Renegade Vita demo release hardware capture" },
  "c-dogs-sdl-vita": { url: "/screenshots/c-dogs-sdl.png", alt: "C-Dogs SDL gameplay screenshot" },
  "resident-evil-4-vita": { url: "/screenshots/resident-evil-4.jpg", alt: "Resident Evil 4 gameplay" },
  "diddy-kong-racing-golden-balloon": { url: "/screenshots/diddy-kong-racing.jpg", alt: "Diddy Kong Racing Golden Balloon hero screenshot" },
  "test-drive-iii-vita": { url: "/screenshots/test-drive-iii-bg.png", alt: "Test Drive III Vita port LiveArea background" },
  "test-drive-ii-vita": { url: "/screenshots/test-drive-ii-bg.png", alt: "Test Drive II Vita port LiveArea background" },
  "halo-ce-decomp-pc-and-android-vita": { url: "/screenshots/halo-ce.jpg", alt: "Halo: Combat Evolved Vita release gameplay" }
};

let code = fs.readFileSync("src/shared/constants/fallbackData.ts", "utf8");
const fpIndex = code.indexOf("export const FALLBACK_PROJECTS");
let prePart = code.slice(0, fpIndex);
let fpPart = code.slice(fpIndex);

let updated = 0;
for (const [slug, meta] of Object.entries(mappings)) {
  const slugAnchor = 'slug: "' + slug + '",';
  const slugPos = fpPart.indexOf(slugAnchor);
  if (slugPos === -1) {
    console.log("NOT FOUND in FALLBACK_PROJECTS:", slug);
    continue;
  }

  const nextTechPos = fpPart.indexOf("technologies:", slugPos);
  if (nextTechPos === -1) {
    console.log("NO TECH POS:", slug);
    continue;
  }

  const block = fpPart.slice(slugPos, nextTechPos);
  if (block.includes("screenshot_url:")) {
    const updatedBlock = block.replace(
      /screenshot_url:s*"[^"]*",s*screenshot_alt:s*"[^"]*",s*/,
      'screenshot_url: "' + meta.url + '",\n    screenshot_alt: "' + meta.alt + '",\n    '
    );
    fpPart = fpPart.slice(0, slugPos) + updatedBlock + fpPart.slice(nextTechPos);
    updated++;
  } else {
    const toInsert = 'screenshot_url: "' + meta.url + '",\n    screenshot_alt: "' + meta.alt + '",\n    ';
    fpPart = fpPart.slice(0, nextTechPos) + toInsert + fpPart.slice(nextTechPos);
    updated++;
  }
}

fs.writeFileSync("src/shared/constants/fallbackData.ts", prePart + fpPart, "utf8");
console.log("Updated remaining projects: " + updated);
