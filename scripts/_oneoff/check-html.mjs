import fs from 'fs';
const html = fs.readFileSync('dist/web/index.html', 'utf8');
const matches = html.match(/<li[^>]*id="entry-[^>]*>/g) || [];
console.log('Rows found in build HTML: ' + matches.length);

