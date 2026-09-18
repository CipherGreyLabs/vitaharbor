import fs from 'fs';

const res = await fetch('https://vitaharbor.vercel.app/', { headers: { 'cache-control': 'no-cache' } });
const html = await res.text();

function extract(html, re) { const m = html.match(re); return m ? m[1] : 'NOT FOUND'; }

console.log('STATUS:', res.status);
console.log('TITLE:', extract(html, /<title>([^<]*)<\/title>/));
console.log('HAS "Community Signals":', html.includes('Community Signals'));
console.log('HAS "Port Directory":', html.includes('Port Directory'));
console.log('HAS "Methodology":', html.includes('Methodology'));
console.log('HAS CustomCursor:', html.includes('CustomCursor'));
console.log('ENTRY COUNT:', (html.match(/id="entry-/g) || []).length);
console.log('HAS #00ff66:', html.includes('00ff66'));
console.log('BYTES:', html.length);

const local = fs.readFileSync('dist/web/index.html', 'utf8');
console.log('---- LOCAL BUILD ----');
console.log('LOCAL TITLE:', extract(local, /<title>([^<]*)<\/title>/));
console.log('LOCAL ENTRY COUNT:', (local.match(/id="entry-/g) || []).length);

