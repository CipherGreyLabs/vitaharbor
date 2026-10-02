import fs from "node:fs";

let vcs = fs.readFileSync("src/web/components/3d/VitaConsoleScene.tsx", "utf8");

// Add acrylic material definition alongside shell and face
vcs = vcs.replace(
  "const black = new THREE.MeshBasicMaterial({ color: '#060708' });",
  "const black = new THREE.MeshBasicMaterial({ color: '#060708' });\n    const acrylic = new THREE.MeshPhysicalMaterial({ color: '#e8ecf2', transmission: 0.88, opacity: 0.95, transparent: true, roughness: 0.08, metalness: 0.02, clearcoat: 1.0, clearcoatRoughness: 0.05, ior: 1.49, envMapIntensity: 1.25 });"
);

// Update shoulder buttons from solid silver to acrylic triggers
const oldShoulder = `    for (const sign of [1, -1]) {
      const top = traced(shoulder, 2.2, 5.7, silver, 0.25);
      top.scale.x = sign;
      registerPress(top, 0.45);
      const bottom = traced(corner, 0.5, 8.4, silver, 0.15);`;

const newShoulder = `    for (const sign of [1, -1]) {
      const hinge = traced(shoulder, 0.5, 5.3, silver, 0.1);
      hinge.scale.x = sign;
      const top = traced(shoulder, 1.9, 5.8, acrylic, 0.2);
      top.scale.x = sign;
      registerPress(top, 0.45);
      const bottom = traced(corner, 0.5, 8.4, silver, 0.15);`;

if (vcs.includes(oldShoulder)) {
  vcs = vcs.replace(oldShoulder, newShoulder);
  fs.writeFileSync("src/web/components/3d/VitaConsoleScene.tsx", vcs, "utf8");
  console.log("OK: updated shoulder triggers to authentic acrylic material");
} else {
  console.error("oldShoulder pattern not found");
}
