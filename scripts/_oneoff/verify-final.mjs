const base = 'https://vitaharbor.vercel.app';

const html = await (await fetch(base + '/?cb=' + Date.now())).text();
const main = (html.match(/\/assets\/(index-[A-Za-z0-9_-]+\.js)/) || [])[1];
const mainJs = await (await fetch(base + '/assets/' + main)).text();

const scene = (mainJs.match(/"(VitaConsoleScene-[A-Za-z0-9_-]+\.js)"/) || [])[1];
console.log('MAIN:', main);
console.log('SCENE:', scene);

const js = await (await fetch(base + '/assets/' + scene)).text();
const keys = ['pointerdown','pointerup','pointercancel','setFromCamera','intersectObjects','00ff66','ff3333','3399ff','ff3399'];
for (const k of keys) console.log('  ' + k + ' =>', js.includes(k));
console.log('  cursorFallbackCustom =>', html.includes('CustomCursor'));

