import fs from 'fs';

const sm = fs.readFileSync('dist/web/sitemap.xml', 'utf8');
const urls = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
console.log('sitemap urls:', urls.length);
console.log('first:', urls[0]);
console.log('second:', urls[1]);
console.log('last:', urls[urls.length - 1]);
console.log('project pages on disk:', fs.readdirSync('dist/web/projects').length);

