import fs from "node:fs";
import path from "node:path";

const MAP = {
  "#040608": "#08090a",
  "#090c11": "#0f1113",
  "#090d13": "#0f1113",
  "#0d131b": "#15181b",
  "#0f141c": "#1c2024",
  "#131a24": "#1c2024",
  "#151b24": "#1c2024",
  "#0f141b": "#1c2024",
  "#1a2332": "#242830",
  "#1b2330": "#242830",
  "#202a38": "#2c313a",
  "#29374e": "#343a42",
  "#1d2d3d": "#2c313a",
  "#0b0f16": "#15181b",
  "#68788c": "#7c848d",
  "#edf5ff": "#f4f6f8",
  "#f1f5f9": "#f4f6f8",
  "#94a3b8": "#a3acb5",
  "#64748b": "#7c848d",
  "#4d6377": "#767f88",
  "#3d536a": "#6d757e",
  "#40566c": "#6d757e",
  "#cfdae6": "#dfe5ea",
  "#93a9bd": "#a3acb5",
  "#4fb3d4": "#3ad2ff",
  "#4fb5ff": "#7fe3ff",
  "#00b4d8": "#3ad2ff",
  "#00f0ff": "#3ad2ff",
  "#249cf4": "#3ad2ff",
  "#00d5ff": "#3ad2ff"
};

const files = [];
const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (["node_modules", "dist", ".git"].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/[.](tsx|ts|css|html|js|mjs)$/.test(entry.name)) files.push(full);
  }
};
walk("src");
files.push("index.html", "tailwind.config.js");

let total = 0;
const report = [];
for (const file of files) {
  let text = fs.readFileSync(file, "utf8");
  const before = text;
  let count = 0;
  for (const [from, to] of Object.entries(MAP)) {
    const re = new RegExp(from, "gi");
    text = text.replace(re, () => {
      count += 1;
      return to;
    });
  }
  if (text !== before) {
    fs.writeFileSync(file, text);
    report.push(file + " : " + count);
    total += count;
  }
}
console.log("replaced " + total + " occurrences across " + report.length + " files");
console.log(report.join("\n"));
