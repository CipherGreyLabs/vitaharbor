const base = 'https://vitaharbor.vercel.app';
const main = await (await fetch(base + '/assets/index-Bq7aZlwz.js')).text();
const m = [...main.matchAll(/"\.\/(VitaConsoleScene-[A-Za-z0-9_-]+\.js)"/g)].map(x => x[1]);
console.log('SCENE REFS:', m.join(', ') || 'none');

const names = m.length ? m : ['VitaConsoleScene-NAyCk2-x.js'];
for (const n of names) {
  const r = await fetch(base + '/assets/' + n);
  if (!r.ok) { console.log(n, 'HTTP', r.status); continue; }
  const js = await r.text();
  console.log('CHUNK', n, 'bytes', js.length);
  console.log('  green 00ff66:', js.includes('00ff66'));
  console.log('  red   ff3333:', js.includes('ff3333'));
  console.log('  blue  3399ff:', js.includes('3399ff'));
  console.log('  pink  ff3399:', js.includes('ff3399'));
  console.log('  Raycaster:', js.includes('Raycaster'));
  console.log('  pointerdown:', js.includes('pointerdown'));
}

