import fs from 'fs';

const p = 'scripts/prerender.mjs';
let c = fs.readFileSync(p, 'utf8');

if (c.includes('sitemap.xml')) {
  console.log('already present');
  process.exit(0);
}

const block = [
  '',
  '// Sitemap. Project deep links are real static documents now, so they belong here.',
  'const sitemapUrls = [',
  '  { loc: "https://vitaharbor.vercel.app/", priority: "1.0" },',
  '  ...FALLBACK_PROJECTS.map((p) => ({',
  '    loc: "https://vitaharbor.vercel.app/projects/" + p.slug + "/",',
  '    priority: "0.7",',
  '    lastmod: p.last_activity_at ? new Date(p.last_activity_at).toISOString().slice(0, 10) : null',
  '  }))',
  '];',
  '',
  'const sitemapXml = [',
  '  '<?xml version="1.0" encoding="UTF-8"?>',',
  '  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',',
  '  ...sitemapUrls.map((u) =>',
  '    [',
  '      "  <url>",',
  '      "    <loc>" + u.loc + "</loc>",',
  '      u.lastmod ? "    <lastmod>" + u.lastmod + "</lastmod>" : null,',
  '      "    <priority>" + u.priority + "</priority>",',
  '      "  </url>"',
  '    ]',
  '      .filter(Boolean)',
  '      .join("\\n")',
  '  ),',
  '  "</urlset>",',
  '  ""',
  '].join("\\n");',
  '',
  'fs.writeFileSync(path.resolve(process.cwd(), "dist/web/sitemap.xml"), sitemapXml, "utf8");',
  'console.log("Wrote sitemap with " + sitemapUrls.length + " urls");',
  ''
].join('\n');

const marker = 'const prerenderedBody =';
const idx = c.indexOf(marker);
if (idx === -1) { console.error('marker not found'); process.exit(1); }
c = c.slice(0, idx) + block + c.slice(idx);

fs.writeFileSync(p, c);
console.log('prerender.mjs now writes the sitemap');

