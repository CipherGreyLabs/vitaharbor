import fs from 'fs';

let content = fs.readFileSync('src/web/components/ui/CustomCursor.tsx', 'utf8');

// Using string concatenation directly to avoid all template string issues
const newTransform = "transform: 'translate3d(' + position.x + 'px, ' + position.y + 'px, 0) translate(-50%, -50%) scale(' + (isHovering ? 2.5 : 1) + ')',";

// Regex replace the broken transform line safely
content = content.replace(/transform:[^,]*,/, newTransform);

fs.writeFileSync('src/web/components/ui/CustomCursor.tsx', content);

