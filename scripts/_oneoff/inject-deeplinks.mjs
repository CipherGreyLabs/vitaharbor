import fs from 'fs';

const p = 'scripts/prerender.mjs';
let c = fs.readFileSync(p, 'utf8');

if (c.includes('deepLinkPages')) {
  console.log('already present');
  process.exit(0);
}

const block = [
  '',
  '// Per-project deep links. Reddit, Discord and X do not run JavaScript, so each project',
  '// needs its own HTML with its own metadata to produce a real preview card.',
  'const deepLinkPages = FALLBACK_PROJECTS.map((p) => {',
  '  const title = (p.display_name || p.game_title || p.slug) + " - VitaHarbor";',
  '  const description = p.summary || "PlayStation Vita port tracked by VitaHarbor.";',
  '  const url = "https://vitaharbor.vercel.app/projects/" + p.slug + "/";',
  '  return { slug: p.slug, title, description, url, project: p };',
  '});',
  '',
  'function applyMeta(html, meta) {',
  '  const swap = (source, pattern, value) => source.replace(pattern, (m, a, b) => a + escapeXml(value) + (b || ""));',
  '  let out = html;',
  '  out = swap(out, /(<title>)([^<]*)(<\/title>)/, meta.title);',
  '  out = swap(out, /(<meta name="description" content=")([^"]*)(")/, meta.description);',
  '  out = swap(out, /(<link rel="canonical" href=")([^"]*)(")/, meta.url);',
  '  out = swap(out, /(<meta property="og:title" content=")([^"]*)(")/, meta.title);',
  '  out = swap(out, /(<meta property="og:description" content=")([^"]*)(")/, meta.description);',
  '  out = swap(out, /(<meta property="og:url" content=")([^"]*)(")/, meta.url);',
  '  out = swap(out, /(<meta name="twitter:title" content=")([^"]*)(")/, meta.title);',
  '  out = swap(out, /(<meta name="twitter:description" content=")([^"]*)(")/, meta.description);',
  '  return out;',
  '}',
  '',
  ''
].join('\n');

const marker = 'const prerenderedBody =';
const idx = c.indexOf(marker);
if (idx === -1) { console.error('marker not found'); process.exit(1); }
c = c.slice(0, idx) + block + c.slice(idx);

const writeMarker = "fs.writeFileSync(htmlPath, html, 'utf8');";
const deepLinkWriter = [
  '// Write one HTML file per project so /projects/<slug>/ has its own metadata.',
  'const projectsDir = path.resolve(process.cwd(), "dist/web/projects");',
  'for (const page of deepLinkPages) {',
  '  const dir = path.join(projectsDir, page.slug);',
  '  fs.mkdirSync(dir, { recursive: true });',
  '  fs.writeFileSync(path.join(dir, "index.html"), applyMeta(html, page), "utf8");',
  '}',
  "console.log('Wrote ' + deepLinkPages.length + ' project pages into dist/web/projects');",
  ''
].join('\n');

c = c.replace(writeMarker, writeMarker + '\n' + deepLinkWriter);

fs.writeFileSync(p, c);
console.log('prerender.mjs extended with deep link pages');

