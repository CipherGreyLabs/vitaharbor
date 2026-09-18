import fs from 'fs';

let stageCode = fs.readFileSync('src/web/components/ledger/ConsoleStage.tsx', 'utf8');

// Force WebGL to true, bypassing the fallback image entirely
stageCode = stageCode.replace(
  '{webgl === false ? (',
  '{false ? ('
);

fs.writeFileSync('src/web/components/ledger/ConsoleStage.tsx', stageCode);
console.log("Forced 3D rendering enabled.");

