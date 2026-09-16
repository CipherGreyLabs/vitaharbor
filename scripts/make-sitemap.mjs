// Builds public/sitemap.xml from the deployed ledger so every port and engineer
// record is discoverable. usage: node scripts/make-sitemap.mjs [origin]
import { writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const origin = (process.argv[2] || "https://vitaharbor.vercel.app").replace(/\/$/, "");

async function getJson(route) {
  const res = await fetch(origin + route, { headers: { accept: "application/json" } });
  if (!res.ok) throw new Error(`${route} -> HTTP ${res.status}`);
  const body = await res.json();
  if (typeof body !== "object" || body === null || !("projects" in body || "developers" in body)) {
    throw new Error(`${route} did not return ledger JSON`);
  }
  return body;
}

const [projects, developers] = await Promise.all([
  getJson("/api/projects?limit=200"),
  getJson("/api/developers?limit=200")
]);

const today = new Date().toISOString().slice(0, 10);

const entries = [
  { loc: "/", priority: "1.0" },
  { loc: "/projects", priority: "0.9" },
  { loc: "/updates", priority: "0.8" },
  { loc: "/developers", priority: "0.7" },
  { loc: "/about", priority: "0.5" },
  ...projects.projects.map((p) => ({
    loc: `/projects/${p.slug}`,
    priority: "0.8",
    lastmod: (p.last_activity_at || "").slice(0, 10) || today
  })),
  ...developers.developers.map((d) => ({ loc: `/developers/${d.slug}`, priority: "0.6" }))
];

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...entries.map((e) =>
    [
      "  <url>",
      `    <loc>${origin}${e.loc}</loc>`,
      `    <lastmod>${e.lastmod || today}</lastmod>`,
      `    <priority>${e.priority}</priority>`,
      "  </url>"
    ].join("\n")
  ),
  "</urlset>",
  ""
].join("\n");

const out = path.resolve(here, "../public/sitemap.xml");
writeFileSync(out, xml, "utf8");
console.log(`wrote ${out} with ${entries.length} urls`);
