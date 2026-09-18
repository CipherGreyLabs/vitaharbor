import fs from 'fs';

let content = fs.readFileSync('src/web/components/3d/VitaConsoleScene.tsx', 'utf8');

// Add parallax rotation logic
if (!content.includes('let mouseX = 0')) {
  content = content.replace(
    'let px = 0, py = 0, visible = true, raf = 0, previous = \'\';',
    'let px = 0, py = 0, visible = true, raf = 0, previous = \'\';\n    let targetRotX = 0, targetRotY = 0;'
  );
  
  // Inject mouse move tracking
  content = content.replace(
    'el.appendChild(renderer.domElement);',
    'el.appendChild(renderer.domElement);\n\n    const handleMouseMove = (e) => {\n      const rect = el.getBoundingClientRect();\n      const mx = ((e.clientX - rect.left) / rect.width) * 2 - 1;\n      const my = -((e.clientY - rect.top) / rect.height) * 2 + 1;\n      targetRotY = mx * 0.15;\n      targetRotX = -my * 0.15;\n    };\n    window.addEventListener("mousemove", handleMouseMove);'
  );
  
  // Apply rotation easing in the tick loop
  content = content.replace(
    'raf = requestAnimationFrame(tick);',
    'raf = requestAnimationFrame(tick);\n      scene.rotation.y += (targetRotY - scene.rotation.y) * 0.1;\n      scene.rotation.x += (targetRotX - scene.rotation.x) * 0.1;\n      // Dynamic light movement based on parallax\n      light.position.x = -80 + (targetRotY * 100);\n      rimLight.position.x = (targetRotY * 150);'
  );
  
  // Clean up listener
  content = content.replace(
    'return () => {',
    'return () => {\n      window.removeEventListener("mousemove", handleMouseMove);'
  );
}

// Add CRT / Scanlines to canvas
if (!content.includes('scanline effect')) {
  content = content.replace(
    "base.addColorStop(1, '#000000');\n      g.fillStyle = base;\n      g.fillRect(0, 0, 960, 544);",
    "base.addColorStop(1, '#000000');\n      g.fillStyle = base;\n      g.fillRect(0, 0, 960, 544);\n      \n      // scanline effect\n      g.fillStyle = 'rgba(0,0,0,0.2)';\n      for(let i=0; i<544; i+=3) { g.fillRect(0, i, 960, 1); }\n      g.fillStyle = 'rgba(0, 100, 255, 0.03)';\n      for(let i=0; i<960; i+=3) { g.fillRect(i, 0, 1, 544); }"
  );
}

fs.writeFileSync('src/web/components/3d/VitaConsoleScene.tsx', content);
console.log("Stage 2 3D parallax success");

