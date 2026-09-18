import fs from 'fs';
import path from 'path';

// --- 1. Custom Fluid Cursor Component ---
const cursorCode = "import React, { useEffect, useState } from 'react';\n\nexport const CustomCursor: React.FC = () => {\n  const [position, setPosition] = useState({ x: 0, y: 0 });\n  const [target, setTarget] = useState({ x: 0, y: 0 });\n  const [isHovering, setIsHovering] = useState(false);\n\n  useEffect(() => {\n    const handleMouseMove = (e: MouseEvent) => {\n      setTarget({ x: e.clientX, y: e.clientY });\n    };\n    \n    const handleMouseOver = (e: MouseEvent) => {\n      const targetEl = e.target as HTMLElement;\n      if (\n        targetEl.tagName.toLowerCase() === 'button' ||\n        targetEl.tagName.toLowerCase() === 'a' ||\n        targetEl.closest('button') ||\n        targetEl.closest('a') ||\n        targetEl.closest('.vh-interactive') ||\n        targetEl.closest('.group\\\\/row')\n      ) {\n        setIsHovering(true);\n      } else {\n        setIsHovering(false);\n      }\n    };\n\n    window.addEventListener('mousemove', handleMouseMove);\n    window.addEventListener('mouseover', handleMouseOver);\n\n    let animationFrameId: number;\n    const updatePosition = () => {\n      setPosition(prev => {\n        const dx = target.x - prev.x;\n        const dy = target.y - prev.y;\n        return {\n          x: prev.x + dx * 0.25,\n          y: prev.y + dy * 0.25\n        };\n      });\n      animationFrameId = requestAnimationFrame(updatePosition);\n    };\n    updatePosition();\n\n    return () => {\n      window.removeEventListener('mousemove', handleMouseMove);\n      window.removeEventListener('mouseover', handleMouseOver);\n      cancelAnimationFrame(animationFrameId);\n    };\n  }, [target]);\n\n  return (\n    <div\n      className=\"pointer-events-none fixed top-0 left-0 z-[9999] rounded-full mix-blend-screen transition-all duration-200 ease-out\"\n      style={{\n        transform: 	ranslate3d(\px, \px, 0) translate(-50%, -50%) scale(\),\n        width: isHovering ? '32px' : '12px',\n        height: isHovering ? '32px' : '12px',\n        backgroundColor: isHovering ? 'rgba(0, 210, 255, 0.1)' : '#00d2ff',\n        border: isHovering ? '1px solid rgba(0, 210, 255, 0.5)' : 'none',\n        boxShadow: isHovering ? '0 0 20px rgba(0, 210, 255, 0.4)' : '0 0 10px #00d2ff, 0 0 20px #0055ff',\n      }}\n    />\n  );\n};\n";

fs.mkdirSync('src/web/components/ui', { recursive: true });
fs.writeFileSync('src/web/components/ui/CustomCursor.tsx', cursorCode);

let appIndex = fs.readFileSync('src/web/app/index.tsx', 'utf8');
if (!appIndex.includes('CustomCursor')) {
  appIndex = "import { CustomCursor } from '../components/ui/CustomCursor';\n" + appIndex;
  appIndex = appIndex.replace(
    '<div className="vh-grain"></div>',
    '<div className="vh-grain"></div>\n      <CustomCursor />'
  );
  fs.writeFileSync('src/web/app/index.tsx', appIndex);
}

let css = fs.readFileSync('src/web/styles/index.css', 'utf8');
if (!css.includes('cursor: none;')) {
  css = css.replace(
    'body {',
    'body {\n    cursor: none;'
  );
  css += "\na, button, input, [role=\"button\"] {\n  cursor: none !important;\n}\n\n[data-reveal=\"in\"] {\n  opacity: 1;\n  transform: scale(1) translateY(0);\n  transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);\n}\n[data-reveal] {\n  opacity: 0;\n  transform: scale(0.96) translateY(24px);\n}\n\n@keyframes vh-row-entrance {\n  from { opacity: 0; transform: translateY(12px) scale(0.99); filter: blur(4px); }\n  to { opacity: 1; transform: none; filter: blur(0px); }\n}\n.vh-row {\n  animation: vh-row-entrance 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;\n}\n\n.filter-active-bg {\n  position: absolute;\n  inset: 0;\n  background: rgba(255, 255, 255, 0.08);\n  border: 1px solid rgba(255, 255, 255, 0.15);\n  border-radius: 9999px;\n  z-index: -1;\n  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1);\n}\n";
  fs.writeFileSync('src/web/styles/index.css', css);
}

console.log("Cursor & CSS completed");

