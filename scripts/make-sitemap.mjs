// The archive is a single index page; per-entry deep links use the #p=<slug>
// hash, which is not a separate crawler URL. This generator therefore advertises
// only the canonical document so search engines never see soft 404s.
// usage: node scripts/make-sitemap.mjs [origin]
import { writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const origin = (process.argv[2] || "https://vitaharbor.vercel.app").replace(/\/$/, "");
const today = new Date().toISOString().slice(0, 10);

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  "  <url>",
  "    <loc>" + origin + "/</loc>",
  "    <lastmod>" + today + "</lastmod>",
  "    <priority>1.0</priority>",
  "  </url>",
  "</urlset>",
  ""
].join("\n");

const out = path.resolve(here, "../public/sitemap.xml");
writeFileSync(out, xml, "utf8");
console.log("wrote " + out);

