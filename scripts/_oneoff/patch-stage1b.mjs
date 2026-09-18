import fs from 'fs';

let html = fs.readFileSync('index.html', 'utf8');
if (!html.includes('Space+Grotesk')) {
  html = html.replace(
    '<title>VitaHarbor — PS Vita Port Development Tracker</title>',
    '<title>VitaHarbor — PS Vita Port Development Tracker</title>\n    <link rel="preconnect" href="https://fonts.googleapis.com">\n    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n    <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">'
  );
  fs.writeFileSync('index.html', html);
}

let tw = fs.readFileSync('tailwind.config.js', 'utf8');
tw = tw.replace(
  "lift: '0 20px 50px -10px rgba(0, 85, 255, 0.12), inset 0 1px 0 0 rgba(255,255,255,0.1), 0 0 0 1px rgba(255,255,255,0.03)'",
  "lift: '0 20px 50px -10px rgba(0, 85, 255, 0.12), inset 0 1px 0 0 rgba(255,255,255,0.1), 0 0 0 1px rgba(255,255,255,0.03)'"
);
if (!tw.includes('display: [\"Space Grotesk\",')) {
  tw = tw.replace(
    "sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],",
    "sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],\n        display: ['"Space Grotesk"', 'sans-serif'],"
  );
  fs.writeFileSync('tailwind.config.js', tw);
}

let css = fs.readFileSync('src/web/styles/index.css', 'utf8');
if (!css.includes('.vh-grain')) {
  css += 
/* Film Grain & Micro-Interactions */
.vh-grain::before {
  content: "";
  position: fixed;
  inset: -150%;
  z-index: 1000;
  pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.08'/%3E%3C/svg%3E");
  opacity: 0.45;
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
  box-shadow: 0 8px 32px 0 rgba(0,10,25,0.4), inset 0 1px 0 0 rgba(255,255,255,0.06), inset 0 0 0 1px rgba(255,255,255,0.015);
}
.vh-boot {
  animation: bootSequence 1.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
@keyframes bootSequence {
  0% { opacity: 0; transform: translateY(40px) scale(0.98); filter: blur(10px); }
  100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0px); }
}
.vh-interactive {
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.vh-interactive:active {
  transform: scale(0.97);
}
;
  fs.writeFileSync('src/web/styles/index.css', css);
}

// 4. Wrap the app with grain and Lenis smooth scrolling (if available, otherwise fallback)
let appIndex = fs.readFileSync('src/web/app/index.tsx', 'utf8');
if (!appIndex.includes('vh-grain')) {
  appIndex = appIndex.replace(
    '<RouterProvider router={router} />',
    '<div className="vh-grain"></div>\n      <RouterProvider router={router} />'
  );
  fs.writeFileSync('src/web/app/index.tsx', appIndex);
}

console.log("Stage 1 success");

