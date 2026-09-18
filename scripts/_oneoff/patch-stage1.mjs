import fs from 'fs';

// --- 1. Update index.html for Fonts ---
let html = fs.readFileSync('index.html', 'utf8');
if (!html.includes('Space+Grotesk')) {
  html = html.replace(
    '<title>VitaHarbor — PS Vita Port Development Tracker</title>',
    '<title>VitaHarbor — PS Vita Port Development Tracker</title>\n    <link rel="preconnect" href="https://fonts.googleapis.com">\n    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n    <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">'
  );
  fs.writeFileSync('index.html', html);
}

// --- 2. Update Tailwind config for new shadows and fonts ---
let tw = fs.readFileSync('tailwind.config.js', 'utf8');
tw = tw.replace(
  "lift: '0 20px 50px -10px rgba(0, 85, 255, 0.15), 0 0 0 1px rgba(255,255,255,0.05)'",
  "lift: '0 20px 50px -10px rgba(0, 85, 255, 0.12), inset 0 1px 0 0 rgba(255,255,255,0.1), 0 0 0 1px rgba(255,255,255,0.03)'"
);
if (!tw.includes("display: ['"Space Grotesk"'")) {
  tw = tw.replace(
    "sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],",
    "sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],\n        display: ['"Space Grotesk"', 'sans-serif'],"
  );
  fs.writeFileSync('tailwind.config.js', tw);
}

// --- 3. Add Film Grain & Entrance Animations to CSS ---
let css = fs.readFileSync('src/web/styles/index.css', 'utf8');
if (!css.includes('.vh-grain')) {
  css += 
/* Film Grain & Micro-Interactions */
.vh-grain::before {
  content: "";
  position: absolute;
  inset: -100%;
  z-index: 1;
  pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.08'/%3E%3C/svg%3E");
  opacity: 0.8;
  animation: grain 8s steps(10) infinite;
}
@keyframes grain {
  0%, 100% { transform: translate(0, 0); }
  10% { transform: translate(-5%, -10%); }
  20% { transform: translate(-15%, 5%); }
  30% { transform: translate(7%, -25%); }
  40% { transform: translate(-5%, 25%); }
  50% { transform: translate(-15%, 10%); }
  60% { transform: translate(15%, 0%); }
  70% { transform: translate(0%, 15%); }
  80% { transform: translate(3%, 35%); }
  90% { transform: translate(-10%, 10%); }
}
.vh-glass {
  border: none;
  box-shadow: 0 8px 32px 0 rgba(0,0,0,0.3), inset 0 1px 0 0 rgba(255,255,255,0.08), inset 0 0 0 1px rgba(255,255,255,0.02);
}
.vh-boot {
  animation: bootSequence 1.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
@keyframes bootSequence {
  0% { opacity: 0; transform: translateY(40px) scale(0.98); filter: blur(10px); }
  100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0px); }
}
.vh-interactive:active {
  transform: scale(0.98);
  transition: transform 0.1s cubic-bezier(0.4, 0, 0.2, 1);
}
;
  fs.writeFileSync('src/web/styles/index.css', css);
}
console.log("Stage 1 (Fonts & Styles) complete.");

