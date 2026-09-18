import fs from 'fs';
const dir = 'dist/web/assets';
const files = fs.readdirSync(dir).filter(f => f.startsWith('VitaConsoleScene-') && f.endsWith('.js'));
for (const f of files) {
  const c = fs.readFileSync(dir + '/' + f, 'utf8');
  console.log(f, {
    Raycaster: c.includes('Raycaster'),
    pointerdown: c.includes('pointerdown'),
    green: c.includes('00ff66'),
    callToDisc: c.includes('faceButtons'),
  });
}

