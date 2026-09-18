const base = 'https://vitaharbor.vercel.app';
const html = await (await fetch(base + '/?cb=' + Date.now())).text();
const main = (html.match(/\/assets\/(index-[A-Za-z0-9_-]+\.js)/) || [])[1];
const mainJs = await (await fetch(base + '/assets/' + main)).text();
const scene = (mainJs.match(/VitaConsoleScene-[A-Za-z0-9_-]+\.js/) || [])[0];
console.log('MAIN:', main);
console.log('SCENE:', scene);
if (scene) {
  const js = await (await fetch(base + '/assets/' + scene)).text();
  for (const k of ['pointerdown','pointerup','pointercancel','setFromCamera','intersectObjects','00ff66','ff3333','3399ff','ff3399']) {
    console.log('  ' + k + ' =>', js.includes(k));
  }
}
console.log('HTML has CustomCursor:', html.includes('CustomCursor'));
console.log('HTML entry count:', (html.match(/id="entry-/g) || []).length);

