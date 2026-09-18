import fs from 'fs';

const html = fs.readFileSync('dist/web/index.html', 'utf8');
const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1]);

console.log('ld+json blocks found:', blocks.length);
let ok = 0;
for (const raw of blocks) {
  try {
    const parsed = JSON.parse(raw);
    ok++;
    console.log('  valid:', parsed['@type'], parsed.name || '', parsed.numberOfItems ? '(' + parsed.numberOfItems + ' items)' : '');
    if (parsed.itemListElement) {
      console.log('  first item:', parsed.itemListElement[0].name, '->', parsed.itemListElement[0].url);
    }
  } catch (e) {
    console.log('  INVALID JSON:', e.message);
  }
}
console.log('valid blocks:', ok + '/' + blocks.length);

