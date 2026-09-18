import fs from 'fs';

// --- 1. Modify VitaConsoleScene to add colors and raycasting ---
let sceneCode = fs.readFileSync('src/web/components/3d/VitaConsoleScene.tsx', 'utf8');

// Replace the glyph decal line to use the specific colors
const classicColors = "['#00ff66', '#ff3333', '#3399ff', '#ff3399'][i]";
sceneCode = sceneCode.replace(
  "decal(glyphs[i], 73.5 + dx, 13.3 + dy, 3.8, 3.8, '#cfd3d6', 11.3);",
  "decal(glyphs[i], 73.5 + dx, 13.3 + dy, 3.8, 3.8, " + classicColors + ", 11.3);"
);

// To make the buttons interactive, we need to save the base meshes of the buttons.
// The button base is created with: const pill = disc(...) or disc(...)
// The action buttons are created at line 325: disc(73.5 + dx, 13.3 + dy, 3.5, 1.2, 10.6, button);
// We need to capture those return values.

// Modify the disc function so it returns the created mesh
if (!sceneCode.includes('return m;')) {
  sceneCode = sceneCode.replace(
    "m.position.set(x, y, z);",
    "m.position.set(x, y, z);\n      return m;"
  );
}

// Modify the face buttons loop to store the buttons
if (!sceneCode.includes('const faceButtons: THREE.Mesh[] = [];')) {
  sceneCode = sceneCode.replace(
    "const glyphs =",
    "const faceButtons: THREE.Mesh[] = [];\n    const glyphs ="
  );
}

// Capture the button mesh
sceneCode = sceneCode.replace(
  "disc(73.5 + dx, 13.3 + dy, 3.5, 1.2, 10.6, button);",
  "const btn = disc(73.5 + dx, 13.3 + dy, 3.5, 1.2, 10.6, button);\n      faceButtons.push(btn);"
);

// Add Raycaster logic before the event listeners
if (!sceneCode.includes('new THREE.Raycaster()')) {
  const interactLogic = 
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let pressedButton: THREE.Mesh | null = null;
    let baseZ = 10.6; // original z position of the button

    const handlePointerDown = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const intersects = raycaster.intersectObjects(faceButtons);
      if (intersects.length > 0) {
        pressedButton = intersects[0].object as THREE.Mesh;
        baseZ = pressedButton.position.z;
        pressedButton.position.z = baseZ - 0.4; // Push down
      }
    };

    const handlePointerUp = () => {
      if (pressedButton) {
        pressedButton.position.z = baseZ; // Restore
        pressedButton = null;
      }
    };

    el.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', handlePointerUp);
;
  sceneCode = sceneCode.replace(
    "window.addEventListener('mousemove', handleMouseMove);",
    "window.addEventListener('mousemove', handleMouseMove);" + interactLogic
  );
  sceneCode = sceneCode.replace(
    "window.removeEventListener('mousemove', handleMouseMove);",
    "window.removeEventListener('mousemove', handleMouseMove);\n      el.removeEventListener('pointerdown', handlePointerDown);\n      window.removeEventListener('pointerup', handlePointerUp);"
  );
}

fs.writeFileSync('src/web/components/3d/VitaConsoleScene.tsx', sceneCode);

// --- 2. Remove Custom Cursor everywhere ---
let appCode = fs.readFileSync('src/web/app/index.tsx', 'utf8');
appCode = appCode.replace(/import \{ CustomCursor \} from '\.\.\/components\/ui\/CustomCursor';\r?\n/, '');
appCode = appCode.replace('<CustomCursor />', '');
fs.writeFileSync('src/web/app/index.tsx', appCode);

// Optional: remove file
if (fs.existsSync('src/web/components/ui/CustomCursor.tsx')) {
  fs.unlinkSync('src/web/components/ui/CustomCursor.tsx');
}

let cssCode = fs.readFileSync('src/web/styles/index.css', 'utf8');
cssCode = cssCode.replace('body { cursor: none; }', '');
cssCode = cssCode.replace('a, button, input, [role="button"] { cursor: none !important; }', '');
fs.writeFileSync('src/web/styles/index.css', cssCode);

console.log("Modifications complete: OG colors, interactive buttons, no custom cursor");

