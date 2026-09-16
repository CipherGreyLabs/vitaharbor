import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

export interface SelectedProjectView {
  id: number;
  game_title: string;
  display_name: string;
  current_stage: string;
  performance_notes?: string | null;
  playability_notes?: string | null;
  technologies?: string[];
}
interface VitaConsoleSceneProps { selectedProject?: SelectedProjectView | null }

// PCH-1000 dimensions in millimetres. Screen: 5-inch, 960:544 aspect.
export const VITA_DIMENSIONS = { width: 182, height: 83.5, depth: 18.6, screenWidth: 110.6, screenHeight: 62.7 };


// Front silhouette and control islands traced in the supplied 600 × 270 reference.
// Pixel-space outlines become extruded meshes, not an image on a tilted plane.
function referenceShape(commands: Array<[string, ...number[]]>) {
  const shape = new THREE.Shape();
  const x = (v: number) => (v - 300) * 182 / 600;
  const y = (v: number) => (135 - v) * 182 / 600;
  for (const [op, ...p] of commands) {
    if (op === 'M') shape.moveTo(x(p[0]), y(p[1]));
    if (op === 'L') shape.lineTo(x(p[0]), y(p[1]));
    if (op === 'C') shape.bezierCurveTo(x(p[0]), y(p[1]), x(p[2]), y(p[3]), x(p[4]), y(p[5]));
    if (op === 'Q') shape.quadraticCurveTo(x(p[0]), y(p[1]), x(p[2]), y(p[3]));
  }
  shape.closePath();
  return shape;
}
const BODY_TRACE: Array<[string, ...number[]]> = [
 ['M',115,3],['L',485,3],['C',499,3,503,17,516,21],
 ['C',533,26,550,25,563,38],['C',588,63,597,96,597,133],
 ['C',597,173,582,211,557,238],['C',539,258,515,267,485,267],
 ['L',115,267],['C',85,267,61,258,43,238],['C',18,211,3,173,3,133],
 ['C',3,96,12,63,37,38],['C',50,25,67,26,84,21],['C',97,17,101,3,115,3]
];

export const VitaConsoleScene: React.FC<VitaConsoleSceneProps> = ({ selectedProject }) => {
  const host = useRef<HTMLDivElement>(null);
  const selected = useRef(selectedProject);
  selected.current = selectedProject;
  const [unavailable, setUnavailable] = useState(false);
  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); }
    catch { setUnavailable(true); return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    el.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 1, 2000);
    const pmrem = new THREE.PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    const env = pmrem.fromScene(room, 0.04);
    scene.environment = env.texture;
    scene.environmentIntensity = .55;
    room.dispose();
    const vita = new THREE.Group();
    scene.add(vita);
    const textures: THREE.Texture[] = [];
    const shell = new THREE.MeshPhysicalMaterial({ color: '#141519', roughness: .27, metalness: .12, clearcoat: .8 });
    const face = new THREE.MeshPhysicalMaterial({ color: '#090b0e', roughness: .18, metalness: .05, clearcoat: 1 });
    const silver = new THREE.MeshStandardMaterial({ color: '#8f959e', roughness: .24, metalness: .9 });
    const button = new THREE.MeshStandardMaterial({ color: '#25282c', roughness: .33, metalness: .1 });
    const rubber = new THREE.MeshStandardMaterial({ color: '#202125', roughness: .86 });
    const black = new THREE.MeshBasicMaterial({ color: '#070809' });
    function traced(shape: THREE.Shape, depth: number, z: number, mat: THREE.Material, bevel = .22) {
      const geometry = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelSize: bevel, bevelThickness: bevel, bevelSegments: 4, curveSegments: 32, steps: 1 });
      const mesh = new THREE.Mesh(geometry, mat); mesh.position.z = z; vita.add(mesh); return mesh;
    }
    const shellShape = referenceShape(BODY_TRACE);
    traced(shellShape, 14, -7.5, shell, .7);
    traced(shellShape, .7, 6.6, silver, .3);
    const glass = traced(shellShape, 1, 7.5, face, .25);
    glass.scale.set(.987, .98, 1);
    // Four formed silver shoulders/corner pieces, following the reference cutouts.
    const shoulder = referenceShape([['M',36,30],['C',58,8,89,1,114,1],['C',99,4,100,17,83,23],['C',64,29,51,28,36,30]]);
    const corner = referenceShape([['M',42,234],['C',69,234,85,244,103,260],['C',76,258,57,246,42,234]]);
    for (const sign of [1, -1]) {
      const top = traced(shoulder, 2.2, 5.7, silver, .25); top.scale.x = sign;
      const bottom = traced(corner, .5, 8.4, silver, .15); bottom.scale.x = sign;
      const inset = traced(corner, .2, 9, black, .1); inset.scale.set(sign * .96, .96, 1);
    }
    function disc(x: number, y: number, r: number, depth: number, z: number, mat: THREE.Material) {
      const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, depth, 48), mat);
      m.rotation.x = Math.PI / 2; m.position.set(x, y, z); vita.add(m); return m;
    }
    function decal(text: string, x: number, y: number, w: number, h: number, color = '#d6d8dc', z = 9.3) {
      const c = document.createElement('canvas'); c.width = 512; c.height = Math.round(512 * h / w);
      const g = c.getContext('2d');
      if (g) { g.font = `500 ${c.height * .8}px Arial`; g.fillStyle = color; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, 256, c.height / 2); }
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; textures.push(t);
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false }));
      m.position.set(x, y, z); vita.add(m);
    }
    decal('SONY', -67, 28, 15, 3.5);
    decal('PS VITA', 0, -33.4, 23, 4);
    // Front camera sits beside the screen, not in the centre of the top bezel.
    disc(63, 24.5, 2.2, .5, 9.3, button);
    disc(63, 24.5, 1.4, .6, 9.5, black);
    disc(62.7, 24.8, .45, .2, 9.9, silver);
    // Screen sits flush inside the black glass; no oversized silver tablet bezel.
    const screenCanvas = document.createElement('canvas'); screenCanvas.width = 960; screenCanvas.height = 544;
    const screenTexture = new THREE.CanvasTexture(screenCanvas); textures.push(screenTexture);
    screenTexture.colorSpace = THREE.SRGBColorSpace;
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(110.6, 62.7), new THREE.MeshBasicMaterial({ map: screenTexture, toneMapped: false }));
    screen.position.set(0, 3.45, 9.25); vita.add(screen);
    const g = screenCanvas.getContext('2d');
    function paint() {
      if (!g) return;
      if (!selected.current) { const off=g.createLinearGradient(0,0,960,544); off.addColorStop(0,'#42454a'); off.addColorStop(1,'#16181b'); g.fillStyle=off;g.fillRect(0,0,960,544);screenTexture.needsUpdate=true;return; }
      const gradient = g.createLinearGradient(0, 0, 960, 544);
      gradient.addColorStop(0, '#095385'); gradient.addColorStop(.5, '#147ca6'); gradient.addColorStop(1, '#102b71');
      g.fillStyle = gradient; g.fillRect(0, 0, 960, 544);
      for (let i = 0; i < 4; i++) {
        g.beginPath(); g.moveTo(-100, 340 + i * 35);
        g.bezierCurveTo(250, 60 + i * 55, 490, 650 - i * 40, 1100, 170 + i * 48);
        g.lineTo(1100, 600); g.lineTo(-100, 600); g.closePath();
        g.fillStyle = 'rgba(90,214,249,.12)'; g.fill();
      }
      g.fillStyle = '#e0f3ff'; g.font = '24px Arial'; g.fillText('VitaHarbor', 40, 44);
      g.font = '19px Arial'; g.fillText('PORT LIBRARY', 738, 44);
      g.fillStyle = '#fff'; g.font = '500 55px Arial';
      const title = selected.current?.game_title || 'A little console.';
      const words = title.split(' '); let line = '', y = 237;
      for (const word of words) { const next = line + word + ' '; if (g.measureText(next).width > 820 && line) { g.fillText(line, 55, y); y += 65; line = word + ' '; } else line = next; }
      g.fillText(line, 55, y);
      g.font = '24px Arial'; g.fillStyle = '#b9e9ff';
      g.fillText(selected.current ? selected.current.current_stage.replaceAll('_', ' ').toUpperCase() : 'A whole world of possibility.', 58, y + 55);
      g.font = '20px Arial'; g.fillText('Explore the community archive', 55, 494);
      screenTexture.needsUpdate = true;
    }
    const recessMat = new THREE.MeshStandardMaterial({color:'#151719',roughness:.52,metalness:.12});
    const rimMat = new THREE.MeshStandardMaterial({color:'#202226',roughness:.62,metalness:.06});
    // Connected, pear-shaped islands: broad button recess tapering into the stick well.
    const island = referenceShape([['M',56,53],['C',29,53,15,70,15,96],['C',15,114,26,123,43,130],['C',60,136,48,144,47,156],['C',42,179,57,190,74,190],['C',93,190,104,176,101,159],['C',100,145,88,139,89,128],['C',106,110,103,82,91,66],['C',82,56,70,53,56,53]]);
    for(const sign of [1,-1]) {
      const rim = traced(island,.5,8.8,black,.15);rim.scale.x=sign;
      const islandFace = traced(island,.2,9.35,rimMat,.12); islandFace.scale.set(sign*.982,.982,1);
    }
    disc(-73.7,13.3,10.2,.5,9.85,recessMat);
    // Separate directional keys with the central diamond gap and engraved arrows.
    for (let i=0;i<4;i++) {
      const shape = new THREE.Shape();
      shape.moveTo(0,1.4);shape.lineTo(3.1,4);shape.lineTo(3.1,8.8);shape.quadraticCurveTo(0,10.3,-3.1,8.8);shape.lineTo(-3.1,4);shape.closePath();
      const key = traced(shape,1.1,10.2,button,.28);
      key.rotation.z=i*Math.PI/2;key.position.x=-73.7;key.position.y=13.3;
      const dx=-Math.sin(i*Math.PI/2)*6.9,dy=Math.cos(i*Math.PI/2)*6.9;
      decal(['⌃','‹','⌄','›'][i],-73.7+dx,13.3+dy,1.5,1.5,'#92979b',11.65);
    }
    const glyphs=['△','○','×','□'];
    [[0,7.5],[7.5,0],[0,-7.5],[-7.5,0]].forEach(([dx,dy],i)=>{
      disc(73.5+dx,13.3+dy,3.95,.4,9.85,black);
      disc(73.5+dx,13.3+dy,3.5,1.2,10.6,button);
      decal(glyphs[i],73.5+dx,13.3+dy,3.8,3.8,'#cfd3d6',11.3);
    });
    for(const x of [-68.5,68.5]) {
      disc(x,-9,8.2,.55,9.9,black);
      disc(x,-9,7.7,.55,10.25,silver);
      disc(x,-9,6.9,.6,10.65,recessMat);
      disc(x,-9,5.7,2.1,12,button);
      const cap = new THREE.Mesh(new THREE.SphereGeometry(5.5,48,24),rubber);
      cap.scale.z=.32;cap.position.set(x,-9,13.1);vita.add(cap);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(6.5,.35,12,64),silver);
      ring.position.set(x,-9,11);vita.add(ring);
    }
    // Horizontal oval home key, small select/start keys, and outside speaker grids.
    const home=disc(-71,-24.3,5.8,1,9.6,button);home.scale.z=.52;
    decal('PS',-71,-24.3,4,2.8,'#d3d5d8',10.3);
    for(const [x,label] of [[65.8,'SELECT'],[76,'START']] as const) {
      const pill=disc(x,-24.3,3.6,.7,9.7,button);pill.scale.z=.48;
      decal(label,x,-24.3,5.7,1.3,'#b1b5ba',10.2);
    }
    for(const sign of [-1,1])for(let row=0;row<2;row++)for(let col=0;col<3;col++)
      disc(sign*(80.4+col*2.75),-8.8-row*2.9,.85,.2,9.2,black);
    scene.add(new THREE.HemisphereLight('#ffffff', '#7e8795', .8));
    const light = new THREE.DirectionalLight('#ffffff', 1.7); light.position.set(-80, 160, 260); scene.add(light);
    const fill = new THREE.DirectionalLight('#dae7f7', 1.3); fill.position.set(180, 0, 100); scene.add(fill);
    let px = 0, py = 0, visible = true, raf = 0, previous = '';
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const move = (e: PointerEvent) => { const r = el.getBoundingClientRect(); px = (e.clientX - r.left) / r.width - .5; py = (e.clientY - r.top) / r.height - .5; };
    const leave = () => { px = 0; py = 0; };
    el.addEventListener('pointermove', move); el.addEventListener('pointerleave', leave);
    function resize() {
      const w = Math.max(el!.clientWidth, 1), h = Math.max(el!.clientHeight, 1);
      camera.aspect = w / h;
      const tan = Math.tan(THREE.MathUtils.degToRad(15));
      // Frame like the previous stage: console occupies ~51% of the viewport
      // width on wide layouts (right of the copy column) and most of a narrow
      // plate. Distances come from the real 182 mm × 86 mm silhouette.
      const wide = camera.aspect > 1.45;
      const widthFrac = wide ? .502 : .92;
      const distance = Math.max(182 / (2 * tan * camera.aspect * widthFrac), 86 / (2 * tan * .8));
      camera.position.set(0, 0, distance);
      const targetX = wide ? (.735 - .5) * 2 * tan * distance * camera.aspect : 0;
      vita.userData.targetX = targetX;
      vita.position.x = targetX;
      camera.updateProjectionMatrix(); renderer.setSize(w, h);
    }
    const ro = new ResizeObserver(resize); ro.observe(el); resize();
    const io = typeof IntersectionObserver !== 'undefined' ? new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }) : null;
    io?.observe(el);
    function tick() {
      raf = requestAnimationFrame(tick);
      if (!visible || document.hidden) return;
      const signature = JSON.stringify(selected.current);
      if (signature !== previous) { paint(); previous = signature; }
      vita.rotation.y += ((reduced ? 0 : px * .32) - vita.rotation.y) * .08;
      vita.rotation.x += ((reduced ? 0 : py * .16) - vita.rotation.x) * .08;
      vita.rotation.z = -.02;
      vita.position.x += ((vita.userData.targetX ?? 0) - vita.position.x) * .1;
      renderer.render(scene, camera);
    }
    paint(); tick();
    return () => {
      cancelAnimationFrame(raf); ro.disconnect(); io?.disconnect();
      el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', leave);
      scene.traverse(obj => { const m = obj as THREE.Mesh; m.geometry?.dispose(); if (m.material) { for (const mat of Array.isArray(m.material) ? m.material : [m.material]) mat.dispose(); } });
      textures.forEach(t => t.dispose()); env.dispose(); pmrem.dispose(); renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);
  return <div ref={host} className="vita-object" style={{ width: "100%", height: "100%", minHeight: 240, touchAction: "pan-y" }} role="img" aria-label="Interactive model of the PS Vita PCH-1000">
    {unavailable && <p className="scene-unavailable">3D preview unavailable. All port information remains available below.</p>}
  </div>;
};
