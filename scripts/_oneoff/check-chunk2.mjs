import fs from 'fs';
const dir = 'dist/web/assets';
const f = fs.readdirSync(dir).find(x => x.startsWith('VitaConsoleScene-') && x.endsWith('.js'));
const c = fs.readFileSync(dir + '/' + f, 'utf8');
const keys = ['pointerdown','pointerup','pointercancel','setFromCamera','intersectObjects','removeEventListener("pointerdown"','position.z'];
for (const k of keys) console.log(k, '=>', c.includes(k));
console.log('bytes', c.length);

