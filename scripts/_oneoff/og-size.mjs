import fs from 'fs';
const buf = fs.readFileSync('public/og.png');
const width = buf.readUInt32BE(16);
const height = buf.readUInt32BE(20);
console.log('og.png:', width + 'x' + height, (buf.length / 1024).toFixed(1) + ' KB');
const s = fs.readFileSync('public/sitemap.xml', 'utf8');
console.log('sitemap urls:', (s.match(/<url>/g) || []).length);

