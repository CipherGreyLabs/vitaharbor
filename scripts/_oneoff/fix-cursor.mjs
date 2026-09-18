import fs from 'fs';

let content = fs.readFileSync('src/web/components/ui/CustomCursor.tsx', 'utf8');

// The transform value was broken because the backticks got removed during regex/bash parsing.
// Let's replace the whole style block safely.
const fixedStyle = style={{
        transform: "translate3d(" + position.x + "px, " + position.y + "px, 0) translate(-50%, -50%) scale(" + (isHovering ? 2.5 : 1) + ")",
        width: isHovering ? '32px' : '12px',
        height: isHovering ? '32px' : '12px',
        backgroundColor: isHovering ? 'rgba(0, 210, 255, 0.1)' : '#00d2ff',
        border: isHovering ? '1px solid rgba(0, 210, 255, 0.5)' : 'none',
        boxShadow: isHovering ? '0 0 20px rgba(0, 210, 255, 0.4)' : '0 0 10px #00d2ff, 0 0 20px #0055ff',
      }};

content = content.replace(/style=\{\{[\s\S]*?\}\}/, fixedStyle);

fs.writeFileSync('src/web/components/ui/CustomCursor.tsx', content);

