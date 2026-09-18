import fs from 'fs';

const p = 'scripts/prerender.mjs';
let c = fs.readFileSync(p, 'utf8');

if (c.includes('itemListJsonLd')) {
  console.log('already present, nothing to do');
  process.exit(0);
}

const marker = 'const prerenderedBody =';
const idx = c.indexOf(marker);
if (idx === -1) {
  console.error('marker not found');
  process.exit(1);
}

const block = [
  '// ItemList structured data, escaped so a project title can never close the script tag.',
  'const itemListJsonLd = JSON.stringify(',
  '  {',
  "    '@context': 'https://schema.org',",
  "    '@type': 'ItemList',",
  "    name: 'PlayStation Vita port projects tracked by VitaHarbor',",
  '    numberOfItems: FALLBACK_PROJECTS.length,',
  '    itemListElement: FALLBACK_PROJECTS.map((p, idx) => ({',
  "      '@type': 'ListItem',",
  '      position: idx + 1,',
  "      name: p.display_name || p.game_title || 'Untitled port',",
  "      url: 'https://vitaharbor.vercel.app/#p=' + p.slug,",
  "      description: p.summary || ''",
  '    }))',
  '  },',
  '  null,',
  '  2',
  ").replace(/</g, '\\u003c');",
  '',
  'const itemListScript =',
  "  '\\n    <script type=\"application/ld+json\">\\n' + itemListJsonLd + '\\n    </script>\\n';",
  '',
  ''
].join('\n');

c = c.slice(0, idx) + block + c.slice(idx);

const writeMarker = "fs.writeFileSync(htmlPath, html, 'utf8');";
if (!c.includes("html = html.replace('</head>'")) {
  c = c.replace(
    writeMarker,
    "html = html.replace('</head>', itemListScript + '</head>');\n" + writeMarker
  );
}

fs.writeFileSync(p, c);
console.log('prerender.mjs updated');

