const res = await fetch('https://vitaharbor.vercel.app/');
const html = await res.text();

const assets = [...html.matchAll(/\/assets\/([A-Za-z0-9._-]+\.js)/g)].map(m => '/assets/' + m[1]);
console.log('ASSETS:', assets.join(', '));

const scene = assets.find(a => a.includes('VitaConsoleScene'));
if (!scene) { console.log('NO SCENE CHUNK FOUND'); }
else {
  const js = await (await fetch('https://vitaharbor.vercel.app' + scene)).text();
  console.log('SCENE CHUNK:', scene, 'bytes', js.length);
  console.log('HAS 00ff66 (green):', js.includes('00ff66'));
  console.log('HAS ff3399 (pink):', js.includes('ff3399'));
  console.log('HAS Raycaster:', js.includes('Raycaster'));
  console.log('HAS pointerdown:', js.includes('pointerdown'));
}

