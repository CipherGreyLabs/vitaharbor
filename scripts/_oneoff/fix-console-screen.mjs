import fs from "node:fs";

let vcs = fs.readFileSync("src/web/components/3d/VitaConsoleScene.tsx", "utf8");

// Only load external source image if it has an actual screenshot_url (e.g. real gameplay photos)
const oldSync = "const url = String(current?.screenshot_url || (current?.slug ? '/og/projects/' + current.slug + '.png' : ''));";
const newSync = "const url = String(current?.screenshot_url || '');";

if (vcs.includes(oldSync)) {
  vcs = vcs.replace(oldSync, newSync);
  fs.writeFileSync("src/web/components/3d/VitaConsoleScene.tsx", vcs, "utf8");
  console.log("OK: restored authentic LiveArea screen rendering for projects without raw screenshot");
} else {
  console.error("oldSync pattern not found");
}
