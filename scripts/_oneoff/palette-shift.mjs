import fs from 'fs';

let twConf = fs.readFileSync('tailwind.config.js', 'utf8');
twConf = twConf
  .replace("canvas: 'rgb(var(--vh-canvas-rgb) / <alpha-value>)'", "canvas: '#000000'")
  .replace("surface: 'rgb(var(--vh-surface-rgb) / <alpha-value>)'", "surface: 'rgba(7, 10, 18, 0.65)'")
  .replace("sunken: 'rgb(var(--vh-sunken-rgb) / <alpha-value>)'", "sunken: '#03050a'")
  .replace("done: '#10b981'", "done: '#00ff9d'")
  .replace("progress: '#38bdf8'", "progress: '#00d2ff'")
  .replace("caution: '#f59e0b'", "caution: '#ff3366'")
  .replace("idle: '#64748b'", "idle: '#475569'")
  .replace("deep: '#0c0e14'", "deep: '#030509'")
  .replace("accent: '#0070d1'", "accent: '#0055ff'")
  .replace("card: '0 4px 20px -2px rgba(0, 0, 0, 0.5)'", "card: '0 8px 32px 0 rgba(0, 15, 40, 0.4)'")
  .replace("lift: '0 20px 45px -15px rgba(0, 0, 0, 0.7)'", "lift: '0 20px 50px -10px rgba(0, 85, 255, 0.15), 0 0 0 1px rgba(255,255,255,0.05)'");
fs.writeFileSync('tailwind.config.js', twConf);

let indexCss = fs.readFileSync('src/web/styles/index.css', 'utf8');
indexCss = indexCss
  .replace(/--vh-[\w-]+-rgb:[^;]+;\r?\n\s*/g, "")
  .replace("background-color: #08090d;", "background-color: #000000;\n    background-image: \n      radial-gradient(circle at 15% 50%, rgba(0, 85, 255, 0.08) 0%, transparent 40%),\n      radial-gradient(circle at 85% 30%, rgba(0, 210, 255, 0.05) 0%, transparent 40%);\n    background-attachment: fixed;")
  .replace("background: rgba(0, 112, 209, 0.35);", "background: rgba(0, 210, 255, 0.3);")
  .replace("0% { transform: translate3d(-2.2%, 0.6%, 0); }", "0% { transform: translate3d(-2%, 1%, 0) rotate(-1deg) scale(1); filter: hue-rotate(0deg); }")
  .replace("100% { transform: translate3d(2.2%, -1.2%, 0); }", "100% { transform: translate3d(2%, -1%, 0) rotate(1deg) scale(1.05); filter: hue-rotate(15deg); }")
  .replace("animation: vh-wave-drift 24s ease-in-out infinite alternate;", "animation: vh-wave-drift 20s cubic-bezier(0.4, 0, 0.2, 1) infinite alternate;\n  opacity: 0.8;\n  mix-blend-mode: screen;");

if (!indexCss.includes(".vh-glass")) {
  indexCss += "\n/* Premium Glassmorphism Utility */\n.vh-glass {\n  background: rgba(10, 14, 23, 0.55);\n  backdrop-filter: blur(24px) saturate(180%);\n  -webkit-backdrop-filter: blur(24px) saturate(180%);\n  border: 1px solid rgba(255, 255, 255, 0.06);\n}\n";
}
fs.writeFileSync('src/web/styles/index.css', indexCss);
console.log("Tailwind & CSS patched");

