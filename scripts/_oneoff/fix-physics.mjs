import fs from 'fs';

let sceneCode = fs.readFileSync('src/web/components/3d/VitaConsoleScene.tsx', 'utf8');

// Array for colors
const colorsArr = "['#00ff66', '#ff3333', '#3399ff', '#ff3399'][i]";

// Patch the decal colors to PS Classic Colors
if (sceneCode.includes("decal(glyphs[i], 73.5 + dx, 13.3 + dy, 3.8, 3.8, '#cfd3d6', 11.3);")) {
  sceneCode = sceneCode.replace(
    "decal(glyphs[i], 73.5 + dx, 13.3 + dy, 3.8, 3.8, '#cfd3d6', 11.3);",
    "decal(glyphs[i], 73.5 + dx, 13.3 + dy, 3.8, 3.8, " + colorsArr + ", 11.3);"
  );
}

// Modify disc to return the mesh
if (!sceneCode.includes('return m;')) {
  sceneCode = sceneCode.replace(/m\.position\.set\(x, y, z\);\r?\n\s*\}/, "m.position.set(x, y, z); return m; }");
}

// Add faceButtons array
if (!sceneCode.includes('const faceButtons: THREE.Mesh[] = [];')) {
  sceneCode = sceneCode.replace("const glyphs =", "const faceButtons: THREE.Mesh[] = [];\n    const glyphs =");
  sceneCode = sceneCode.replace(
    "disc(73.5 + dx, 13.3 + dy, 3.5, 1.2, 10.6, button);",
    "const btn = disc(73.5 + dx, 13.3 + dy, 3.5, 1.2, 10.6, button); faceButtons.push(btn);"
  );
  
  const interactLogic = "const raycaster = new THREE.Raycaster();\n    const pointer = new THREE.Vector2();\n    let pressedButton: THREE.Mesh | null = null;\n    let baseZ = 10.6;\n    const handlePointerDown = (e: PointerEvent) => {\n      const rect = el.getBoundingClientRect();\n      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;\n      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;\n      raycaster.setFromCamera(pointer, camera);\n      const intersects = raycaster.intersectObjects(faceButtons);\n      if (intersects.length > 0) {\n        pressedButton = intersects[0].object as THREE.Mesh;\n        baseZ = pressedButton.position.z;\n        pressedButton.position.z = baseZ - 0.4;\n      }\n    };\n    const handlePointerUp = () => {\n      if (pressedButton) {\n        pressedButton.position.z = baseZ;\n        pressedButton = null;\n      }\n    };\n    el.addEventListener('pointerdown', handlePointerDown);\n    window.addEventListener('pointerup', handlePointerUp);\n";
  sceneCode = sceneCode.replace(
    "window.addEventListener('mousemove', handleMouseMove);",
    "window.addEventListener('mousemove', handleMouseMove);\n    " + interactLogic
  );
  sceneCode = sceneCode.replace(
    "window.removeEventListener('mousemove', handleMouseMove);",
    "window.removeEventListener('mousemove', handleMouseMove);\n      el.removeEventListener('pointerdown', handlePointerDown);\n      window.removeEventListener('pointerup', handlePointerUp);"
  );
}

fs.writeFileSync('src/web/components/3d/VitaConsoleScene.tsx', sceneCode);

// Optional cursor removal
let appCode = fs.readFileSync('src/web/app/index.tsx', 'utf8');
appCode = appCode.replace(/import \{ CustomCursor \} from '\.\.\/components\/ui\/CustomCursor';\r?\n/g, '');
appCode = appCode.replace('<CustomCursor />', '');
fs.writeFileSync('src/web/app/index.tsx', appCode);

let cssCode = fs.readFileSync('src/web/styles/index.css', 'utf8');
cssCode = cssCode.replace(/body \{ cursor: none; \}/g, '');
cssCode = cssCode.replace(/a, button, input, \[role="button"\] \{ cursor: none !important; \}/g, '');
fs.writeFileSync('src/web/styles/index.css', cssCode);

