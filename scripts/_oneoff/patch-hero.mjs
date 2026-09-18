import fs from 'fs';
let content = fs.readFileSync('src/web/routes/HomePage.tsx', 'utf8');

// Upgrade Header Text
content = content.replace(
  'text-display font-semibold text-ink sm:text-displaylg',
  'text-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-ink-medium to-accent sm:text-displaylg drop-shadow-xl'
);

// Remove the old 'vh-hero-wash' which might interfere with our new OLED background and replace it with a centered glow
content = content.replace(
  '<div aria-hidden="true" className="vh-hero-wash pointer-events-none absolute inset-x-0 -top-10 h-72" />',
  '<div aria-hidden="true" className="pointer-events-none absolute left-1/2 -top-20 h-96 w-96 -translate-x-1/2 rounded-full bg-accent opacity-20 blur-[120px]" />'
);

fs.writeFileSync('src/web/routes/HomePage.tsx', content);

