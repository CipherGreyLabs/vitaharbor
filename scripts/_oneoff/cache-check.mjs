const base = 'https://vitaharbor.vercel.app';

const html = await (await fetch(base + '/?c=' + Date.now())).text();
const asset = (html.match(/\/assets\/(index-[A-Za-z0-9_-]+\.js)/) || [])[1];

const targets = [
  ['/', 'page'],
  ['/' + asset, 'hashed asset'],
  ['/fonts/inter-latin-var.woff2', 'font'],
  ['/og.png', 'social image'],
  ['/vita-render.png', 'fallback image'],
  ['/api/feed.json', 'feed'],
];

for (const [path, label] of targets) {
  try {
    const r = await fetch(base + path);
    console.log(
      label.padEnd(15) +
        ' ' +
        String(r.status).padEnd(4) +
        ' ' +
        (r.headers.get('cache-control') || 'none')
    );
  } catch (e) {
    console.log(label.padEnd(15) + ' ERROR ' + e.message);
  }
}

