const base = 'https://vitaharbor.vercel.app';
const html = await (await fetch(base + '/?d=' + Date.now())).text();

const refs = [...html.matchAll(/(?:src|href)="(\/[^"]+\.(?:js|css|woff2|png))"/g)].map((m) => m[1]);
console.log('referenced in HTML:');
for (const r of refs) console.log('  ' + r);

console.log('');
for (const path of refs) {
  const res = await fetch(base + path);
  console.log(path.padEnd(42) + ' ' + res.status + '  ' + (res.headers.get('cache-control') || 'none'));
}

