import fs from 'fs';
import path from 'path';

// --- 1. Custom Fluid Cursor Component ---
const cursorCode = import React, { useEffect, useState } from 'react';

export const CustomCursor: React.FC = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [target, setTarget] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setTarget({ x: e.clientX, y: e.clientY });
    };
    
    const handleMouseOver = (e: MouseEvent) => {
      const targetEl = e.target as HTMLElement;
      if (
        targetEl.tagName.toLowerCase() === 'button' ||
        targetEl.tagName.toLowerCase() === 'a' ||
        targetEl.closest('button') ||
        targetEl.closest('a') ||
        targetEl.closest('.vh-interactive') ||
        targetEl.closest('.group\\/row') // DirectoryTable rows
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseover', handleMouseOver);

    // Spring physics animation loop
    let animationFrameId: number;
    const updatePosition = () => {
      setPosition(prev => {
        const dx = target.x - prev.x;
        const dy = target.y - prev.y;
        // Ease factor (0.15 for slight trailing effect)
        return {
          x: prev.x + dx * 0.25,
          y: prev.y + dy * 0.25
        };
      });
      animationFrameId = requestAnimationFrame(updatePosition);
    };
    updatePosition();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
      cancelAnimationFrame(animationFrameId);
    };
  }, [target]);

  return (
    <div
      className="pointer-events-none fixed top-0 left-0 z-[9999] rounded-full mix-blend-screen transition-all duration-200 ease-out"
      style={{
        transform: \	ranslate3d(\px, \px, 0) translate(-50%, -50%) scale(\)\,
        width: isHovering ? '32px' : '12px',
        height: isHovering ? '32px' : '12px',
        backgroundColor: isHovering ? 'rgba(0, 210, 255, 0.1)' : '#00d2ff',
        border: isHovering ? '1px solid rgba(0, 210, 255, 0.5)' : 'none',
        boxShadow: isHovering ? '0 0 20px rgba(0, 210, 255, 0.4)' : '0 0 10px #00d2ff, 0 0 20px #0055ff',
      }}
    />
  );
};
;

fs.mkdirSync('src/web/components/ui', { recursive: true });
fs.writeFileSync('src/web/components/ui/CustomCursor.tsx', cursorCode);

// --- 2. Inject Cursor into App ---
let appIndex = fs.readFileSync('src/web/app/index.tsx', 'utf8');
if (!appIndex.includes('CustomCursor')) {
  appIndex = "import { CustomCursor } from '../components/ui/CustomCursor';\n" + appIndex;
  appIndex = appIndex.replace(
    '<div className="vh-grain"></div>',
    '<div className="vh-grain"></div>\n      <CustomCursor />'
  );
  fs.writeFileSync('src/web/app/index.tsx', appIndex);
}

// --- 3. CSS Upgrades: Hide default cursor, add staggered list animation keys, magnetic shadows ---
let css = fs.readFileSync('src/web/styles/index.css', 'utf8');
if (!css.includes('cursor: none;')) {
  css = css.replace(
    'body {',
    'body {\n    cursor: none;'
  );
  css += 
a, button, input, [role="button"] {
  cursor: none !important; /* Override cursor for interactive elements to keep our custom cursor */
}

/* Scroll Choreography: Depth Entrance */
[data-reveal="in"] {
  opacity: 1;
  transform: scale(1) translateY(0);
  transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}
[data-reveal] {
  opacity: 0;
  transform: scale(0.96) translateY(24px);
}

/* Staggered Row Animation */
@keyframes vh-row-entrance {
  from { opacity: 0; transform: translateY(12px) scale(0.99); filter: blur(4px); }
  to { opacity: 1; transform: none; filter: blur(0px); }
}
.vh-row {
  animation: vh-row-entrance 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
}

/* Filter Magnetic Background Simulation */
.filter-active-bg {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 9999px;
  z-index: -1;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1);
}
;
  fs.writeFileSync('src/web/styles/index.css', css);
}

console.log("Cursor and Styles applied.");

