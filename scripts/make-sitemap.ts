// Generates dist/web/sitemap.xml.
//
// Project deep links are real static documents (see scripts/prerender.mjs), so they belong
// in the sitemap. Search engines must never be pointed at a hash URL, and must never see a
// soft 404, so only genuinely reachable documents are listed here.
//
// usage: npx tsx scripts/make-sitemap.ts [origin]
import { writeFileSync } from "node:fs";
import path from "node:path";
import { FALLBACK_PROJECTS } from "../src/shared/constants/fallbackData.js";

const origin = (process.argv[2] || "https://vitaharbor.vercel.app").replace(/\/$/, "");

interface Entry {
  loc: string;
  priority: string;
  lastmod?: string | null;
}

const entries: Entry[] = [
  { loc: origin + "/", priority: "1.0" },
  ...FALLBACK_PROJECTS.map((p: { slug: string; last_activity_at?: unknown }) => ({
    loc: origin + "/projects/" + p.slug + "/",
    priority: "0.7",
    lastmod: p.last_activity_at
      ? new Date(String(p.last_activity_at)).toISOString().slice(0, 10)
      : null
  }))
];

const lines: string[] = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
];

for (const entry of entries) {
  lines.push("  <url>");
  lines.push("    <loc>" + entry.loc + "</loc>");
  if (entry.lastmod) lines.push("    <lastmod>" + entry.lastmod + "</lastmod>");
  lines.push("    <priority>" + entry.priority + "</priority>");
  lines.push("  </url>");
}

lines.push("</urlset>");
lines.push("");

const out = path.resolve(process.cwd(), "dist/web/sitemap.xml");
writeFileSync(out, lines.join("\n"), "utf8");
console.log("Wrote sitemap with " + entries.length + " urls to " + out);

