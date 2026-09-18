import fs from 'fs';

let css = fs.readFileSync('src/web/styles/index.css', 'utf8');

// The rows might be stuck at opacity 0 due to an animation issue. Let's make it a simple transition instead, or fix the keyframe to make sure it ends up visible.
// Or just remove the 'both' animation fill mode that can freeze elements at start state.
css = css.replace(
  'animation: vh-row-entrance 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;',
  'animation: vh-row-entrance 0.4s ease-out forwards;'
);

// Failsafe: ensure they are visible if animation fails
if (!css.includes('.vh-row {\n  opacity: 1;')) {
  css = css.replace('.vh-row {', '.vh-row {\n  opacity: 1;');
}

fs.writeFileSync('src/web/styles/index.css', css);

console.log("CSS tweaked for list visibility");

