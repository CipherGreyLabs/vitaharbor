const base = 'https://vitaharbor.vercel.app';
const html = await fetch(base + '/');
console.log('HTML Cache-Control:', html.headers.get('cache-control'));
console.log('HTML X-Vercel-Cache:', html.headers.get('x-vercel-cache'));
const body = await html.text();
const asset = (body.match(/\/assets\/(index-[A-Za-z0-9_-]+\.js)/) || [])[1];
const a = await fetch(base + '/assets/' + asset);
console.log('ASSET', asset, 'Cache-Control:', a.headers.get('cache-control'));
console.log('HTML entry count:', (body.match(/id="entry-/g) || []).length);

