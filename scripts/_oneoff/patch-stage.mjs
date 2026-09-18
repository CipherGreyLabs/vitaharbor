import fs from 'fs';
let content = fs.readFileSync('src/web/components/ledger/ConsoleStage.tsx', 'utf8');

content = content.replace(
  'className="relative overflow-hidden rounded-3xl border border-hairline-strong bg-gradient-to-b from-surface via-surface to-sunken shadow-lift"',
  'className="relative w-full py-6"'
);

// We also remove the hard gradients under the console
content = content.replace(
  '<div\n          aria-hidden="true"\n          className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-surface/85 to-transparent"\n        />',
  ''
);

content = content.replace(
  '<div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-sunken to-transparent" />',
  ''
);

// Make the LiveAreaWaves stretch full width behind the floating console
content = content.replace(
  '<LiveAreaWaves className="pointer-events-none absolute inset-x-0 bottom-0 h-[78%] w-full" />',
  '<LiveAreaWaves className="pointer-events-none absolute inset-x-0 inset-y-0 h-full w-full opacity-60" />'
);

fs.writeFileSync('src/web/components/ledger/ConsoleStage.tsx', content);
console.log("ConsoleStage square removed");

