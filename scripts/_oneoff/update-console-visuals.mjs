import fs from "node:fs";

let vcs = fs.readFileSync("src/web/components/3d/VitaConsoleScene.tsx", "utf8");

const target = "const url = String(current?.screenshot_url || '');";
const replacement = "const url = String(current?.screenshot_url || (current?.slug ? '/og/projects/' + current.slug + '.png' : ''));";

if (vcs.includes(target)) {
  vcs = vcs.replace(target, replacement);
  fs.writeFileSync("src/web/components/3d/VitaConsoleScene.tsx", vcs, "utf8");
  console.log("OK: updated syncSourceImage in VitaConsoleScene.tsx");
} else {
  console.error("Target string not found in VitaConsoleScene.tsx");
}
