import fs from "node:fs";

let vcs = fs.readFileSync("src/web/components/3d/VitaConsoleScene.tsx", "utf8");

const oldRearSectionStart = "    const rearPadCanvas = document.createElement('canvas');";
const oldRearSectionEnd = "    camLens.position.set(0, 31.2, -8.05);\n    vita.add(camLens);";

const newRearSection = `    // =========================================================================
    // AUTHENTIC PS VITA PCH-1000 REAR MULTI-TOUCH TOUCHPAD & HARDWARE ASSEMBLY
    // =========================================================================
    const rearPadCanvas = document.createElement('canvas');
    rearPadCanvas.width = 1024;
    rearPadCanvas.height = 512;
    const rCtx = rearPadCanvas.getContext('2d');
    if (rCtx) {
      // Base deep obsidian glass surface with subtle radial center sheen
      const bgGrad = rCtx.createRadialGradient(512, 256, 40, 512, 256, 512);
      bgGrad.addColorStop(0, '#151922');
      bgGrad.addColorStop(0.65, '#0b0d13');
      bgGrad.addColorStop(1, '#07080c');
      rCtx.fillStyle = bgGrad;
      rCtx.fillRect(0, 0, 1024, 512);

      // Active touchpad outer boundary hairline (silver chamfer)
      rCtx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      rCtx.lineWidth = 2.5;
      rCtx.strokeRect(18, 18, 988, 476);

      // Inner subtle tech border
      rCtx.strokeStyle = 'rgba(59, 130, 246, 0.28)';
      rCtx.lineWidth = 1;
      rCtx.strokeRect(24, 24, 976, 464);

      // Authentic PCH-1000: Full continuous field of PlayStation symbols drawn as razor-sharp vector paths
      // Symbols: Triangle (△), Circle (◯), Cross (✕), Square (▢)
      const stepX = 26;
      const stepY = 24;
      const symSize = 7;
      rCtx.lineWidth = 1.25;
      rCtx.strokeStyle = 'rgba(215, 230, 255, 0.28)';

      let rowIdx = 0;
      for (let y = 38; y < 448; y += stepY) {
        let symType = (rowIdx * 2) % 4;
        for (let x = 38; x < 986; x += stepX) {
          // Leave clean clear bands for top SONY logo and bottom regulatory branding
          if (y > 70 && y < 430) {
            rCtx.beginPath();
            if (symType === 0) {
              // Triangle (△)
              const h = symSize * 0.866;
              rCtx.moveTo(x, y - h / 2);
              rCtx.lineTo(x + symSize / 2, y + h / 2);
              rCtx.lineTo(x - symSize / 2, y + h / 2);
              rCtx.closePath();
              rCtx.stroke();
            } else if (symType === 1) {
              // Circle (◯)
              rCtx.arc(x, y, symSize / 2.2, 0, Math.PI * 2);
              rCtx.stroke();
            } else if (symType === 2) {
              // Cross (✕)
              const d = symSize / 2.5;
              rCtx.moveTo(x - d, y - d);
              rCtx.lineTo(x + d, y + d);
              rCtx.moveTo(x + d, y - d);
              rCtx.lineTo(x - d, y + d);
              rCtx.stroke();
            } else {
              // Square (▢)
              const s = symSize * 0.75;
              rCtx.strokeRect(x - s / 2, y - s / 2, s, s);
            }
          }
          symType = (symType + 1) % 4;
        }
        rowIdx++;
      }

      // Top SONY branding printed on touchpad in crisp silver
      rCtx.fillStyle = '#ffffff';
      rCtx.font = 'bold 24px Arial, Helvetica, sans-serif';
      rCtx.textAlign = 'center';
      rCtx.textBaseline = 'middle';
      rCtx.shadowColor = 'rgba(0, 0, 0, 0.6)';
      rCtx.shadowBlur = 4;
      rCtx.fillText('SONY', 512, 46);
      rCtx.shadowBlur = 0;

      // Bottom authentic PCH-1000 regulatory text
      rCtx.font = '600 11px ui-monospace, SFMono-Regular, Menlo, monospace';
      rCtx.fillStyle = 'rgba(215, 230, 255, 0.65)';
      rCtx.fillText('PlayStation®Vita  ·  MODEL PCH-1000  ·  SONY COMPUTER ENTERTAINMENT INC.  ·  MADE IN JAPAN', 512, 462);
    }
    const rearPadTexture = new THREE.CanvasTexture(rearPadCanvas);
    rearPadTexture.colorSpace = THREE.SRGBColorSpace;
    textures.push(rearPadTexture);

    const rearPadMat = new THREE.MeshStandardMaterial({
      map: rearPadTexture,
      roughness: 0.38,
      metalness: 0.12,
      envMapIntensity: 0.45
    });

    // Helper to create rounded rectangle shape
    function createRoundedRectShape(w: number, h: number, r: number) {
      const shape = new THREE.Shape();
      const x0 = -w / 2, y0 = -h / 2;
      shape.moveTo(x0 + r, y0);
      shape.lineTo(x0 + w - r, y0);
      shape.quadraticCurveTo(x0 + w, y0, x0 + w, y0 + r);
      shape.lineTo(x0 + w, y0 + h - r);
      shape.quadraticCurveTo(x0 + w, y0 + h, x0 + w - r, y0 + h);
      shape.lineTo(x0 + r, y0 + h);
      shape.quadraticCurveTo(x0, y0 + h, x0, y0 + h - r);
      shape.lineTo(x0, y0 + r);
      shape.quadraticCurveTo(x0, y0, x0 + r, y0);
      return shape;
    }

    // Rear Touchpad Bezel (glossy silver border cleanly seated at -7.70, depth 0.25 to -7.95)
    const rearBezelShape = createRoundedRectShape(108.5, 54.5, 9);
    const rearBezelMesh = new THREE.Mesh(
      new THREE.ExtrudeGeometry(rearBezelShape, { depth: 0.25, bevelEnabled: true, bevelSize: 0.15, bevelThickness: 0.15, bevelSegments: 3, curveSegments: 24 }),
      silver
    );
    rearBezelMesh.position.set(0, 0, -7.70);
    rearBezelMesh.rotation.y = Math.PI;
    vita.add(rearBezelMesh);

    // Rear Touchpad Active Surface (z = -7.96 cleanly resting flush inside bezel without Z-fighting or floating)
    const rearPadShape = createRoundedRectShape(107, 53, 8);
    const rearPadGeom = new THREE.ShapeGeometry(rearPadShape, 32);
    const rPos = rearPadGeom.attributes.position;
    const rUvs = rearPadGeom.attributes.uv;
    for (let i = 0; i < rUvs.count; i++) {
      const u = (rPos.getX(i) + 53.5) / 107;
      const v = (rPos.getY(i) + 26.5) / 53;
      rUvs.setXY(i, u, v);
    }
    rUvs.needsUpdate = true;

    const rearPadMesh = new THREE.Mesh(rearPadGeom, rearPadMat);
    rearPadMesh.position.set(0, 0, -7.96);
    rearPadMesh.rotation.y = Math.PI;
    vita.add(rearPadMesh);

    // Authentic PCH-1000 Ergonomic Finger Rests: Smooth matte contoured oval recesses
    const gripOuterShape = createRoundedRectShape(25, 45, 12.5);
    const gripInnerShape = createRoundedRectShape(22, 42, 11);

    const gripBezelMat = new THREE.MeshStandardMaterial({
      color: '#2a2f3a',
      roughness: 0.35,
      metalness: 0.4
    });
    const gripMat = new THREE.MeshStandardMaterial({
      color: '#13151b',
      roughness: 0.88,
      metalness: 0.08
    });

    for (const sign of [-1, 1]) {
      // Outer recessed bevel ring
      const gripBezel = new THREE.Mesh(
        new THREE.ShapeGeometry(gripOuterShape, 32),
        gripBezelMat
      );
      gripBezel.position.set(sign * 67.5, 0, -7.75);
      gripBezel.rotation.y = Math.PI;
      vita.add(gripBezel);

      // Inner textured matte finger pad
      const gripPad = new THREE.Mesh(
        new THREE.ShapeGeometry(gripInnerShape, 32),
        gripMat
      );
      gripPad.position.set(sign * 67.5, 0, -7.82);
      gripPad.rotation.y = Math.PI;
      vita.add(gripPad);
    }

    // Rear Camera Assembly (Top Center at y = 31.2, z = -7.72 to -7.85)
    const camBezel = new THREE.Mesh(
      new THREE.CylinderGeometry(4.2, 4.2, 0.4, 36),
      silver
    );
    camBezel.rotation.x = Math.PI / 2;
    camBezel.position.set(0, 31.2, -7.72);
    vita.add(camBezel);

    const camRing = new THREE.Mesh(
      new THREE.CylinderGeometry(3.2, 3.2, 0.45, 36),
      new THREE.MeshStandardMaterial({ color: '#111317', roughness: 0.3 })
    );
    camRing.rotation.x = Math.PI / 2;
    camRing.position.set(0, 31.2, -7.76);
    vita.add(camRing);

    const camLens = new THREE.Mesh(
      new THREE.CylinderGeometry(2.2, 2.2, 0.5, 36),
      new THREE.MeshStandardMaterial({ color: '#00e6ff', roughness: 0.1, metalness: 0.8 })
    );
    camLens.rotation.x = Math.PI / 2;
    camLens.position.set(0, 31.2, -7.82);
    vita.add(camLens);`;

const startIndex = vcs.indexOf(oldRearSectionStart);
const endIndex = vcs.indexOf(oldRearSectionEnd);

if (startIndex !== -1 && endIndex !== -1) {
  const fullEnd = endIndex + oldRearSectionEnd.length;
  vcs = vcs.slice(0, startIndex) + newRearSection + vcs.slice(fullEnd);
  fs.writeFileSync("src/web/components/3d/VitaConsoleScene.tsx", vcs, "utf8");
  console.log("OK: refined rear Vita assembly");
} else {
  console.error("Could not find rear section markers in VitaConsoleScene.tsx", { startIndex, endIndex });
}
