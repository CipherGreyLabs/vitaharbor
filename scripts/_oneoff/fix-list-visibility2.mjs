import fs from 'fs';
let css = fs.readFileSync('src/web/styles/index.css', 'utf8');

// Strip the problematic animation
css = css.replace(/\.vh-row \{[^}]*\}/g, '.vh-row { opacity: 1; transform: none; filter: none; animation: none; }');
css = css.replace(/@keyframes vh-row-entrance \{[^}]*\}/g, '');

fs.writeFileSync('src/web/styles/index.css', css);
console.log("CSS anim stripped");

