import fs from 'fs';

// 1. Completely strip CustomCursor from App.tsx
let appCode = fs.readFileSync('src/web/App.tsx', 'utf8');
appCode = appCode.replace(/import \{ CustomCursor \} from '\.\/components\/ui\/CustomCursor';\r?\n/g, '');
appCode = appCode.replace(/<CustomCursor \/>\r?\n/g, '');
appCode = appCode.replace(/<CustomCursor \/>/g, '');
fs.writeFileSync('src/web/App.tsx', appCode);

// 2. Ensure CSS does not hide the row, and does not hide cursor
let cssCode = fs.readFileSync('src/web/styles/index.css', 'utf8');
cssCode = cssCode.replace(/body \{ cursor: none; \}/g, '');
cssCode = cssCode.replace(/a, button, input, \[role="button"\] \{ cursor: none !important; \}/g, '');
// Enforce list item visibility
if (!cssCode.includes('.vh-row { opacity: 1 !important; transform: none !important; filter: none !important; animation: none !important; }')) {
  cssCode = cssCode.replace(
    /\.vh-row \{ opacity: 1; transform: none; filter: none; animation: none; \}/g,
    '.vh-row { opacity: 1 !important; transform: none !important; filter: none !important; animation: none !important; }'
  );
}
fs.writeFileSync('src/web/styles/index.css', cssCode);

// 3. Let's fix the 3D button interactions and colors directly using the most robust rewrite method possible.
let sceneCode = fs.readFileSync('src/web/components/3d/VitaConsoleScene.tsx', 'utf8');

// Ensure 'faceButtons' array exists
if (!sceneCode.includes('const faceButtons: THREE.Mesh[] = [];')) {
  sceneCode = sceneCode.replace('const glyphs =', 'const faceButtons: THREE.Mesh[] = [];\n    const glyphs =');
}

// Modify disc to return the mesh
if (!sceneCode.includes('return m;')) {
  sceneCode = sceneCode.replace(
    /m\.position\.set\(x, y, z\);\s*\}/g,
    'm.position.set(x, y, z); return m; }'
  );
}

// Replace action buttons drawing
if (!sceneCode.includes('faceButtons.push(btn);')) {
  sceneCode = sceneCode.replace(
    'disc(73.5 + dx, 13.3 + dy, 3.5, 1.2, 10.6, button);',
    'const btn = disc(73.5 + dx, 13.3 + dy, 3.5, 1.2, 10.6, button); faceButtons.push(btn);'
  );
}

// Ensure the OG colors are applied to the decals
sceneCode = sceneCode.replace(
  "decal(glyphs[i], 73.5 + dx, 13.3 + dy, 3.8, 3.8, '#cfd3d6', 11.3);",
  "decal(glyphs[i], 73.5 + dx, 13.3 + dy, 3.8, 3.8, ['#00ff66', '#ff3333', '#3399ff', '#ff3399'][i], 11.3);"
);

// Add the raycaster logic explicitly
if (!sceneCode.includes('new THREE.Raycaster()')) {
  const interactLogic = 
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let pressedButton: THREE.Mesh | null = null;
    let baseZ = 10.6;
    const handlePointerDown = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const intersects = raycaster.intersectObjects(faceButtons);
      if (intersects.length > 0) {
        pressedButton = intersects[0].object as THREE.Mesh;
        baseZ = pressedButton.position.z;
        pressedButton.position.z = baseZ - 0.4;
      }
    };
    const handlePointerUp = () => {
      if (pressedButton) {
        pressedButton.position.z = baseZ;
        pressedButton = null;
      }
    };
    el.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', handlePointerUp);
  ;
  sceneCode = sceneCode.replace(
    "window.addEventListener('mousemove', handleMouseMove);",
    "window.addEventListener('mousemove', handleMouseMove);\n" + interactLogic
  );
  sceneCode = sceneCode.replace(
    "window.removeEventListener('mousemove', handleMouseMove);",
    "window.removeEventListener('mousemove', handleMouseMove); el.removeEventListener('pointerdown', handlePointerDown); window.removeEventListener('pointerup', handlePointerUp);"
  );
}

fs.writeFileSync('src/web/components/3d/VitaConsoleScene.tsx', sceneCode);

console.log("All systems patched.");

