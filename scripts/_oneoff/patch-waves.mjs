import fs from 'fs';
let content = fs.readFileSync('src/web/components/visual/LiveAreaWaves.tsx', 'utf8');

// Upgrade SVG gradients for a more "2026 OLED" feeling
content = content.replace(
  '<stop stopColor="#0070d1" />',
  '<stop stopColor="#0055ff" />'
);
content = content.replace(
  '<stop offset={1} stopColor="#38bdf8" stopOpacity={0} />',
  '<stop offset={1} stopColor="#00d2ff" stopOpacity={0} />'
);
content = content.replace(
  '<stop stopColor="#10b981" />',
  '<stop stopColor="#00a2ff" />'
);
content = content.replace(
  '<stop offset={1} stopColor="#10b981" stopOpacity={0} />',
  '<stop offset={1} stopColor="#00d2ff" stopOpacity={0.1} />'
);

fs.writeFileSync('src/web/components/visual/LiveAreaWaves.tsx', content);

