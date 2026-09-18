const base = 'https://vitaharbor.vercel.app';

const res = await fetch(base + '/?a=' + Date.now());
const html = await res.text();

console.log('== SECURITY HEADERS ==');
for (const h of [
  'x-content-type-options',
  'x-frame-options',
  'referrer-policy',
  'permissions-policy',
  'content-security-policy',
  'strict-transport-security',
  'cache-control',
]) {
  console.log(h + ': ' + (res.headers.get(h) || 'MISSING'));
}

console.log('');
console.log('== SEO ==');
const meta = (name) => {
  const m = html.match(new RegExp('<meta[^>]*(?:name|property)="' + name + '"[^>]*content="([^"]*)"', 'i'));
  return m ? m[1].slice(0, 90) : 'MISSING';
};
console.log('title: ' + (html.match(/<title>([^<]*)<\/title>/i) || [])[1]);
console.log('description: ' + meta('description'));
console.log('og:title: ' + meta('og:title'));
console.log('og:description: ' + meta('og:description'));
console.log('og:image: ' + meta('og:image'));
console.log('twitter:card: ' + meta('twitter:card'));
console.log('canonical: ' + ((html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]*)"/i) || [])[1] || 'MISSING'));
console.log('json-ld blocks: ' + (html.match(/application\/ld\+json/g) || []).length);
console.log('lang attribute: ' + ((html.match(/<html[^>]*lang="([^"]*)"/i) || [])[1] || 'MISSING'));

console.log('');
console.log('== CRAWLER FILES ==');
for (const p of ['/robots.txt', '/sitemap.xml', '/api/feed.json', '/api/rss.xml']) {
  const r = await fetch(base + p);
  console.log(p + ' -> ' + r.status);
}

