import fs from 'fs';


let content = fs.readFileSync('src/web/components/3d/VitaConsoleScene.tsx', 'utf8');

// Upgrade shell and face materials for richer reflection and premium OLED glass look
content = content.replace(
  "const shell = new THREE.MeshPhysicalMaterial({ color: '#131418', roughness: 0.28, metalness: 0.14, clearcoat: 0.85 });",
  "const shell = new THREE.MeshPhysicalMaterial({ color: '#101217', roughness: 0.15, metalness: 0.35, clearcoat: 1.0, clearcoatRoughness: 0.1 });"
);

content = content.replace(
  "const face = new THREE.MeshPhysicalMaterial({ color: '#08090d', roughness: 0.16, metalness: 0.06, clearcoat: 1 });",
  "const face = new THREE.MeshPhysicalMaterial({ color: '#030408', roughness: 0.05, metalness: 0.2, clearcoat: 1, clearcoatRoughness: 0.05, transmission: 0.2, transparent: true });"
);

content = content.replace(
  "const silver = new THREE.MeshStandardMaterial({ color: '#9aa0aa', roughness: 0.22, metalness: 0.92 });",
  "const silver = new THREE.MeshStandardMaterial({ color: '#c0c8d4', roughness: 0.12, metalness: 1.0 });"
);

// Upgrade Rim Light to PlayStation Blue for more punch
content = content.replace(
  "const rimLight = new THREE.DirectionalLight('#38bdf8', 1.15);",
  "const rimLight = new THREE.DirectionalLight('#00a2ff', 2.0);"
);

content = content.replace(
  "const topRimLight = new THREE.DirectionalLight('#818cf8', 0.9);",
  "const topRimLight = new THREE.DirectionalLight('#4400ff', 1.4);"
);

// Enhance HUD / screen paint for OLED-like crispness
content = content.replace(
  "base.addColorStop(0, '#12141d');",
  "base.addColorStop(0, '#00081a');"
);
content = content.replace(
  "base.addColorStop(1, '#050608');",
  "base.addColorStop(1, '#000000');"
);
content = content.replace(
  "g.fillStyle = '#10b981';", // old 'done' color
  "g.fillStyle = '#00ff9d';"
);
content = content.replace(
  "g.fillStyle = '#38bdf8';", // old 'progress' color
  "g.fillStyle = '#00d2ff';"
);
content = content.replace(
  "g.fillStyle = '#f59e0b';", // old 'caution' color
  "g.fillStyle = '#ff3366';"
);

fs.writeFileSync('src/web/components/3d/VitaConsoleScene.tsx', content);
console.log("3D Scene patched for Premium feel");

