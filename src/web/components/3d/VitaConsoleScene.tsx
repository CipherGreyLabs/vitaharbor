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
  original_platform?: string | null;
}

export interface VitaConsoleSceneProps {
  selectedProject?: SelectedProjectView | null;
  align?: "center" | "split";
  onConsoleClick?: () => void;
}

// PCH-1000 dimensions in millimetres. Screen: 5-inch, 960:544 aspect.
export const VITA_DIMENSIONS = { width: 182, height: 83.5, depth: 18.6, screenWidth: 110.6, screenHeight: 62.7 };

// Front silhouette and control islands traced in reference coordinates
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

export const VitaConsoleScene: React.FC<VitaConsoleSceneProps> = ({
  selectedProject,
  align = "center",
  onConsoleClick
}) => {
  const host = useRef<HTMLDivElement>(null);
  const selected = useRef(selectedProject);
  selected.current = selectedProject;
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    const el = host.current;
    if (!el) return;

    // Phones get a lighter render: no multisampling and a lower pixel ratio.
    const lightDevice = window.innerWidth < 760;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: !lightDevice, alpha: true });
    } catch {
      setUnavailable(true);
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, lightDevice ? 1.25 : 1.75));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    el.appendChild(renderer.domElement);

    const handleMouseMove = (e) => {
      const rect = el.getBoundingClientRect();
      const mx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const my = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      targetRotY = mx * 0.15;
      targetRotX = -my * 0.15;
    };
    window.addEventListener("mousemove", handleMouseMove);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 1, 2000);
    const pmrem = new THREE.PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    const env = pmrem.fromScene(room, 0.04);
    scene.environment = env.texture;
    scene.environmentIntensity = 0.65;
    room.dispose();

    const vita = new THREE.Group();
    scene.add(vita);

    const textures: THREE.Texture[] = [];

    // Soft contact shadow, fixed to the floor so the hardware reads as resting on a surface
    // instead of floating in empty space.
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 256;
    shadowCanvas.height = 128;
    const shadowCtx = shadowCanvas.getContext('2d');
    if (shadowCtx) {
      const pool = shadowCtx.createRadialGradient(128, 64, 4, 128, 64, 124);
      pool.addColorStop(0, 'rgba(15, 23, 42, 0.30)');
      pool.addColorStop(0.45, 'rgba(15, 23, 42, 0.13)');
      pool.addColorStop(1, 'rgba(15, 23, 42, 0)');
      shadowCtx.fillStyle = pool;
      shadowCtx.fillRect(0, 0, 256, 128);
    }
    const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
    textures.push(shadowTexture);
    const contactShadow = new THREE.Mesh(
      new THREE.PlaneGeometry(250, 62),
      new THREE.MeshBasicMaterial({ map: shadowTexture, transparent: true, depthWrite: false })
    );
    contactShadow.position.set(0, -50, 0);
    scene.add(contactShadow);
    const shell = new THREE.MeshPhysicalMaterial({ color: '#101217', roughness: 0.15, metalness: 0.35, clearcoat: 1.0, clearcoatRoughness: 0.1 });
    const face = new THREE.MeshPhysicalMaterial({ color: '#030408', roughness: 0.05, metalness: 0.2, clearcoat: 1, clearcoatRoughness: 0.05, transmission: 0.2, transparent: true });
    const silver = new THREE.MeshStandardMaterial({ color: '#c0c8d4', roughness: 0.12, metalness: 1.0 });
    const button = new THREE.MeshStandardMaterial({ color: '#23262a', roughness: 0.35, metalness: 0.12 });
    const rubber = new THREE.MeshStandardMaterial({ color: '#1d1e22', roughness: 0.88 });
    const black = new THREE.MeshBasicMaterial({ color: '#060708' });

    function traced(shape: THREE.Shape, depth: number, z: number, mat: THREE.Material, bevel = 0.22) {
      const geometry = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelSize: bevel, bevelThickness: bevel, bevelSegments: 4, curveSegments: 32, steps: 1 });
      const mesh = new THREE.Mesh(geometry, mat);
      mesh.position.z = z;
      vita.add(mesh);
      return mesh;
    }

    const shellShape = referenceShape(BODY_TRACE);
    traced(shellShape, 14, -7.5, shell, 0.7);
    traced(shellShape, 0.7, 6.6, silver, 0.3);
    const glass = traced(shellShape, 1, 7.5, face, 0.25);
    glass.scale.set(0.987, 0.98, 1);

    const shoulder = referenceShape([['M',36,30],['C',58,8,89,1,114,1],['C',99,4,100,17,83,23],['C',64,29,51,28,36,30]]);
    const corner = referenceShape([['M',42,234],['C',69,234,85,244,103,260],['C',76,258,57,246,42,234]]);
    for (const sign of [1, -1]) {
      const top = traced(shoulder, 2.2, 5.7, silver, 0.25);
      top.scale.x = sign;
      const bottom = traced(corner, 0.5, 8.4, silver, 0.15);
      bottom.scale.x = sign;
      const inset = traced(corner, 0.2, 9, black, 0.1);
      inset.scale.set(sign * 0.96, 0.96, 1);
    }

    function disc(x: number, y: number, r: number, depth: number, z: number, mat: THREE.Material) {
      const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, depth, 48), mat);
      m.rotation.x = Math.PI / 2;
      m.position.set(x, y, z);
      vita.add(m);
      return m;
    }

    function decal(text: string, x: number, y: number, w: number, h: number, color = '#d6d8dc', z = 9.3) {
      const c = document.createElement('canvas');
      c.width = 512;
      c.height = Math.round(512 * h / w);
      const g = c.getContext('2d');
      if (g) {
        g.font = `500 ${c.height * 0.8}px Arial`;
        g.fillStyle = color;
        g.textAlign = 'center';
        g.textBaseline = 'middle';
        g.fillText(text, 256, c.height / 2);
      }
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      textures.push(t);
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false }));
      m.position.set(x, y, z);
      vita.add(m);
    }

    decal('SONY', -67, 28, 15, 3.5);
    decal('PS VITA', 0, -33.4, 23, 4);

    disc(63, 24.5, 2.2, 0.5, 9.3, button);
    disc(63, 24.5, 1.4, 0.6, 9.5, black);
    disc(62.7, 24.8, 0.45, 0.2, 9.9, silver);

    const screenCanvas = document.createElement('canvas');
    screenCanvas.width = 960;
    screenCanvas.height = 544;
    const screenTexture = new THREE.CanvasTexture(screenCanvas);
    textures.push(screenTexture);
    screenTexture.colorSpace = THREE.SRGBColorSpace;

    const screen = new THREE.Mesh(new THREE.PlaneGeometry(110.6, 62.7), new THREE.MeshBasicMaterial({ map: screenTexture, toneMapped: false }));
    screen.position.set(0, 3.45, 9.25);
    vita.add(screen);

    const g = screenCanvas.getContext('2d');

            function paint() {
      if (!g) return;
      const current = selected.current;

      if (!current) {
        const idle = g.createLinearGradient(0, 0, 0, 544);
        idle.addColorStop(0, '#101320');
        idle.addColorStop(1, '#05060a');
        g.fillStyle = idle;
        g.fillRect(0, 0, 960, 544);
        g.fillStyle = 'rgba(255,255,255,0.28)';
        g.font = '500 17px -apple-system, Helvetica, Arial, sans-serif';
        g.textAlign = 'center';
        g.fillText('SELECT A PORT', 480, 272);
        screenTexture.needsUpdate = true;
        return;
      }

      const rawTitle = String(current.game_title || current.display_name || 'Homebrew');
      const title = rawTitle.split('(')[0].trim();
      const platform = String(current.original_platform || 'PlayStation Vita');
      const stage = String(current.current_stage || 'wip').replace(/_/g, ' ').toUpperCase();

      // Cinematic key art: deep base, one soft light source, faint screen texture.
      const base = g.createLinearGradient(0, 0, 960, 544);
      base.addColorStop(0, '#00081a');
      base.addColorStop(0.55, '#0a0c14');
      base.addColorStop(1, '#05060a');
      g.fillStyle = base;
      g.fillRect(0, 0, 960, 544);

      const accents = ['#2f6bff', '#0f9d8a', '#c2410c', '#7c3aed', '#be123c'];
      const accent = accents[title.length % accents.length];
      const glow = g.createRadialGradient(720, 110, 10, 720, 110, 640);
      glow.addColorStop(0, accent + '59');
      glow.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = glow;
      g.fillRect(0, 0, 960, 544);

      const vignette = g.createRadialGradient(480, 280, 200, 480, 280, 640);
      vignette.addColorStop(0, 'rgba(0,0,0,0)');
      vignette.addColorStop(1, 'rgba(0,0,0,0.72)');
      g.fillStyle = vignette;
      g.fillRect(0, 0, 960, 544);

      g.fillStyle = 'rgba(255,255,255,0.02)';
      for (let scan = 0; scan < 544; scan += 3) g.fillRect(0, scan, 960, 1);

      g.textAlign = 'left';
      g.textBaseline = 'alphabetic';
      g.fillStyle = 'rgba(255,255,255,0.40)';
      g.font = '500 15px -apple-system, Helvetica, Arial, sans-serif';
      g.fillText('VITAHARBOR', 56, 72);

      const words = title.split(' ').filter(Boolean);
      const longest = words.reduce((a, b) => (b.length > a.length ? b : a), '');
      let size = 94;
      g.font = '700 ' + size + 'px -apple-system, Helvetica, Arial, sans-serif';
      while (g.measureText(longest).width > 780 && size > 32) {
        size -= 4;
        g.font = '700 ' + size + 'px -apple-system, Helvetica, Arial, sans-serif';
      }

      g.fillStyle = '#ffffff';
      let line = '';
      let cursorY = words.length > 1 ? 236 : 268;
      for (const word of words) {
        const next = line ? line + ' ' + word : word;
        if (g.measureText(next).width > 820 && line) {
          g.fillText(line, 56, cursorY);
          cursorY += size * 1.04;
          line = word;
        } else {
          line = next;
        }
      }
      g.fillText(line, 56, cursorY);

      g.fillStyle = 'rgba(255,255,255,0.52)';
      g.font = '500 18px -apple-system, Helvetica, Arial, sans-serif';
      g.fillText(platform.toUpperCase(), 56, cursorY + size * 0.95);

      g.fillStyle = accent;
      g.fillRect(56, cursorY + size * 1.24, 40, 3);
      g.fillStyle = 'rgba(255,255,255,0.60)';
      g.font = '500 15px -apple-system, Helvetica, Arial, sans-serif';
      g.fillText(stage, 110, cursorY + size * 1.32);

      screenTexture.needsUpdate = true;
    }


const recessMat = new THREE.MeshStandardMaterial({color:'#14161a',roughness:0.52,metalness:0.12});
    const rimMat = new THREE.MeshStandardMaterial({color:'#1f2125',roughness:0.62,metalness:0.06});

    const island = referenceShape([['M',56,53],['C',29,53,15,70,15,96],['C',15,114,26,123,43,130],['C',60,136,48,144,47,156],['C',42,179,57,190,74,190],['C',93,190,104,176,101,159],['C',100,145,88,139,89,128],['C',106,110,103,82,91,66],['C',82,56,70,53,56,53]]);
    for (const sign of [1, -1]) {
      const rim = traced(island, 0.5, 8.8, black, 0.15);
      rim.scale.x = sign;
      const islandFace = traced(island, 0.2, 9.35, rimMat, 0.12);
      islandFace.scale.set(sign * 0.982, 0.982, 1);
    }

    disc(-73.7, 13.3, 10.2, 0.5, 9.85, recessMat);
    for (let i = 0; i < 4; i++) {
      const shape = new THREE.Shape();
      shape.moveTo(0, 1.4);
      shape.lineTo(3.1, 4);
      shape.lineTo(3.1, 8.8);
      shape.quadraticCurveTo(0, 10.3, -3.1, 8.8);
      shape.lineTo(-3.1, 4);
      shape.closePath();
      const key = traced(shape, 1.1, 10.2, button, 0.28);
      key.rotation.z = i * Math.PI / 2;
      key.position.x = -73.7;
      key.position.y = 13.3;
      const dx = -Math.sin(i * Math.PI / 2) * 6.9, dy = Math.cos(i * Math.PI / 2) * 6.9;
      decal(['⌃','‹','⌄','›'][i], -73.7 + dx, 13.3 + dy, 1.5, 1.5, '#92979b', 11.65);
    }

    const faceButtons: THREE.Mesh[] = [];
    const glyphs = ['△','○','×','□'];
    [[0,7.5],[7.5,0],[0,-7.5],[-7.5,0]].forEach(([dx,dy], i) => {
      disc(73.5 + dx, 13.3 + dy, 3.95, 0.4, 9.85, black);
      const btn = disc(73.5 + dx, 13.3 + dy, 3.5, 1.2, 10.6, button);
      faceButtons.push(btn);
      decal(glyphs[i], 73.5 + dx, 13.3 + dy, 3.8, 3.8, ['#00ff66', '#ff3333', '#3399ff', '#ff3399'][i], 11.3);
    });

    for (const x of [-68.5, 68.5]) {
      disc(x, -9, 8.2, 0.55, 9.9, black);
      disc(x, -9, 7.7, 0.55, 10.25, silver);
      disc(x, -9, 6.9, 0.6, 10.65, recessMat);
      disc(x, -9, 5.7, 2.1, 12, button);
      const cap = new THREE.Mesh(new THREE.SphereGeometry(5.5, 48, 24), rubber);
      cap.scale.z = 0.32;
      cap.position.set(x, -9, 13.1);
      vita.add(cap);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(6.5, 0.35, 12, 64), silver);
      ring.position.set(x, -9, 11);
      vita.add(ring);
    }

    const home = disc(-71, -24.3, 5.8, 1, 9.6, button);
    home.scale.z = 0.52;
    decal('PS', -71, -24.3, 4, 2.8, '#d3d5d8', 10.3);

    for (const [x, label] of [[65.8,'SELECT'],[76,'START']] as const) {
      const pill = disc(x, -24.3, 3.6, 0.7, 9.7, button);
      pill.scale.z = 0.48;
      decal(label, x, -24.3, 5.7, 1.3, '#b1b5ba', 10.2);
    }

    for (const sign of [-1, 1]) {
      for (let row = 0; row < 2; row++) {
        for (let col = 0; col < 3; col++) {
          disc(sign * (80.4 + col * 2.75), -8.8 - row * 2.9, 0.85, 0.2, 9.2, black);
        }
      }
    }

    // STUDIO LIGHTING SETUP WITH EDGE RIM ILLUMINATION
    scene.add(new THREE.HemisphereLight('#ffffff', '#7c848d', 0.85));
    const light = new THREE.DirectionalLight('#ffffff', 1.8);
    light.position.set(-80, 160, 260);
    scene.add(light);
    const fill = new THREE.DirectionalLight('#c8e1ff', 1.3);
    fill.position.set(180, 0, 100);
    scene.add(fill);
    const rimLight = new THREE.DirectionalLight('#00a2ff', 2.0);
    rimLight.position.set(0, -140, -180);
    scene.add(rimLight);
    const topRimLight = new THREE.DirectionalLight('#4400ff', 1.4);
    topRimLight.position.set(0, 180, -120);
    scene.add(topRimLight);

    let px = 0, py = 0, visible = true, raf = 0, previous = '';
    let targetRotX = 0, targetRotY = 0;
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      px = (e.clientX - r.left) / r.width - 0.5;
      py = (e.clientY - r.top) / r.height - 0.5;
    };
    const leave = () => { px = 0; py = 0; };

    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);

    function resize() {
      const w = Math.max(el!.clientWidth, 1), h = Math.max(el!.clientHeight, 1);
      camera.aspect = w / h;
      const tan = Math.tan(THREE.MathUtils.degToRad(15));
      const wide = camera.aspect > 1.45;
      const isSplit = align === "split";
      const widthFrac = isSplit ? (wide ? 0.502 : 0.92) : (wide ? 0.90 : 0.96);
      const distance = Math.max(182 / (2 * tan * camera.aspect * widthFrac), 100 / (2 * tan * 0.9));
      camera.position.set(0, 0, distance);
      const targetX = isSplit && wide ? (0.735 - 0.5) * 2 * tan * distance * camera.aspect : 0;
      vita.userData.targetX = targetX;
      vita.position.x = targetX;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }

    const ro = new ResizeObserver(resize);
    ro.observe(el);
    resize();

    const io = typeof IntersectionObserver !== 'undefined' ? new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }) : null;
    io?.observe(el);

    function tick() {
      raf = requestAnimationFrame(tick);
      scene.rotation.y += (targetRotY - scene.rotation.y) * 0.1;
      scene.rotation.x += (targetRotX - scene.rotation.x) * 0.1;
      // Dynamic light movement based on parallax
      light.position.x = -80 + (targetRotY * 100);
      rimLight.position.x = (targetRotY * 150);
      if (!visible || document.hidden) return;
      const signature = JSON.stringify(selected.current);
      if (signature !== previous) {
        paint();
        previous = signature;
      }
      vita.rotation.y += ((reduced ? 0 : px * 0.28) - vita.rotation.y) * 0.08;
      vita.rotation.x += ((reduced ? 0 : py * 0.15) - vita.rotation.x) * 0.08;
      vita.rotation.z = -0.02;
      vita.position.x += ((vita.userData.targetX ?? 0) - vita.position.x) * 0.1;
      renderer.render(scene, camera);
    }

    paint();
    tick();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(raf);
      ro.disconnect();
      io?.disconnect();
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
      scene.traverse(obj => {
        const m = obj as THREE.Mesh;
        m.geometry?.dispose();
        if (m.material) {
          for (const mat of Array.isArray(m.material) ? m.material : [m.material]) mat.dispose();
        }
      });
      textures.forEach(t => t.dispose());
      env.dispose();
      pmrem.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [align]);

  return (
    <div
      ref={host}
      onClick={onConsoleClick}
      className="vita-object relative w-full h-full cursor-grab active:cursor-grabbing select-none"
      style={{ minHeight: 320, touchAction: "pan-y" }}
      role="img"
      aria-label="Interactive 3D model of the PS Vita PCH-1000"
    >
      {unavailable && (
        <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-slate-400 text-xs font-mono">
          Interactive 3D model requires WebGL. All port documentation remains accessible below.
        </div>
      )}
    </div>
  );
};
