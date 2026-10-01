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
  screenshot_url?: string;
  screenshot_alt?: string;
}

export interface VitaConsoleSceneProps {
  selectedProject?: SelectedProjectView | null;
  align?: "center" | "split";
  isFlipped?: boolean;
  onConsoleClick?: () => void;
  reducedMotion?: boolean;
  onRendererError?: (reason: RendererErrorReason) => void;
  onRendererReady?: () => void;
}

export type RendererErrorReason = "renderer-initialization" | "webgl-context-lost";

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
  isFlipped = false,
  onConsoleClick,
  reducedMotion = false,
  onRendererError,
  onRendererReady
}) => {
  const host = useRef<HTMLDivElement>(null);
  const selected = useRef(selectedProject);
  selected.current = selectedProject;
  const isFlippedRef = useRef(isFlipped);
  isFlippedRef.current = isFlipped;
  const lastFlippedRef = useRef(isFlipped);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    const el = host.current;
    if (!el) return;

    // Phones get a lighter render: no multisampling and a lower pixel ratio.
    const lightDevice = window.innerWidth < 760;
    let renderer: THREE.WebGLRenderer;
    let reportedError = false;
    const reportRendererError = (reason: RendererErrorReason) => {
      if (reportedError) return;
      reportedError = true;
      setUnavailable(true);
      onRendererError?.(reason);
    };
    try {
      renderer = new THREE.WebGLRenderer({ antialias: !lightDevice, alpha: true });
    } catch {
      reportRendererError("renderer-initialization");
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 1, 2000);
    let pmrem: THREE.PMREMGenerator | null = null;
    let env: THREE.WebGLRenderTarget;
    try {
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, lightDevice ? 1.25 : 1.75));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.02;
      pmrem = new THREE.PMREMGenerator(renderer);
      const room = new RoomEnvironment();
      env = pmrem.fromScene(room, 0.04);
      room.dispose();
    } catch {
      reportRendererError("renderer-initialization");
      pmrem?.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      return;
    }
    renderer.domElement.setAttribute("data-testid", "vita-3d-canvas");
    el.appendChild(renderer.domElement);
    const handleContextLost = (event: Event) => {
      event.preventDefault();
      reportRendererError("webgl-context-lost");
    };
    renderer.domElement.addEventListener("webglcontextlost", handleContextLost, false);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) {
        targetRotX = 0;
        targetRotY = 0;
        return;
      }
      const mx = THREE.MathUtils.clamp(((e.clientX - rect.left) / rect.width) * 2 - 1, -1, 1);
      const my = THREE.MathUtils.clamp(-((e.clientY - rect.top) / rect.height) * 2 + 1, -1, 1);
      targetRotY = mx * 0.15;
      targetRotX = -my * 0.15;
    };
    window.addEventListener("mousemove", handleMouseMove);

    scene.environment = env.texture;
    scene.environmentIntensity = 0.9;

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
      pool.addColorStop(0, 'rgba(15, 45, 94, 0.34)');
      pool.addColorStop(0.45, 'rgba(15, 45, 94, 0.14)');
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
    const shell = new THREE.MeshPhysicalMaterial({ color: '#101014', roughness: 0.22, metalness: 0.24, clearcoat: 0.88, clearcoatRoughness: 0.16, envMapIntensity: 1.15 });
    const face = new THREE.MeshPhysicalMaterial({ color: '#030305', roughness: 0.08, metalness: 0.12, clearcoat: 1, clearcoatRoughness: 0.08, transmission: 0.06, envMapIntensity: 1.2 });
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

    // Every physical control registers here so a raycast press can move it.
    const pressables: THREE.Mesh[] = [];
    function registerPress(mesh: THREE.Mesh, travel: number) {
      mesh.userData.pressTravel = travel;
      mesh.userData.pressBaseZ = mesh.position.z;
      pressables.push(mesh);
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
      registerPress(top, 0.45);
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
    let sourceImage: HTMLImageElement | null = null;
    let sourceImageUrl = '';

    function syncSourceImage(current: SelectedProjectView | null) {
      const url = String(current?.screenshot_url || '');
      if (url === sourceImageUrl) return;
      sourceImageUrl = url;
      sourceImage = null;
      if (!url) return;

      const image = new Image();
      image.onload = () => {
        if (sourceImageUrl !== url) return;
        sourceImage = image;
        paint();
      };
      image.onerror = () => {
        if (sourceImageUrl !== url) return;
        sourceImage = null;
        paint();
      };
      image.src = url;
    }

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

      syncSourceImage(current);
      if (sourceImage) {
        const scale = Math.max(960 / sourceImage.naturalWidth, 544 / sourceImage.naturalHeight);
        const width = sourceImage.naturalWidth * scale;
        const height = sourceImage.naturalHeight * scale;
        g.fillStyle = '#05060a';
        g.fillRect(0, 0, 960, 544);
        g.drawImage(sourceImage, (960 - width) / 2, (544 - height) / 2, width, height);
        const shade = g.createLinearGradient(0, 0, 0, 544);
        shade.addColorStop(0, 'rgba(0,0,0,0.12)');
        shade.addColorStop(0.78, 'rgba(0,0,0,0.02)');
        shade.addColorStop(1, 'rgba(0,0,0,0.38)');
        g.fillStyle = shade;
        g.fillRect(0, 0, 960, 544);
        g.fillStyle = 'rgba(255,255,255,0.62)';
        g.font = '500 15px -apple-system, Helvetica, Arial, sans-serif';
        g.textAlign = 'left';
        g.fillText('VITAHARBOR · SOURCE FRAME', 34, 42);
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

      const accent = '#4d7cfe';
      const glow = g.createRadialGradient(720, 110, 10, 720, 110, 640);
      glow.addColorStop(0, 'rgba(0, 230, 255, 0.32)');
      glow.addColorStop(0.34, 'rgba(77, 124, 254, 0.2)');
      glow.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = glow;
      g.fillRect(0, 0, 960, 544);

      const vignette = g.createRadialGradient(480, 280, 200, 480, 280, 640);
      vignette.addColorStop(0, 'rgba(0,0,0,0)');
      vignette.addColorStop(1, 'rgba(0,0,0,0.72)');
      g.fillStyle = vignette;
      g.fillRect(0, 0, 960, 544);

      g.strokeStyle = 'rgba(122, 159, 255, 0.09)';
      g.lineWidth = 1;
      for (let x = 40; x < 960; x += 48) {
        g.beginPath();
        g.moveTo(x, 0);
        g.lineTo(x, 544);
        g.stroke();
      }
      g.fillStyle = 'rgba(255,255,255,0.025)';
      for (let scan = 0; scan < 544; scan += 3) g.fillRect(0, scan, 960, 1);

      g.textAlign = 'left';
      g.textBaseline = 'alphabetic';
      g.fillStyle = 'rgba(155,185,255,0.76)';
      g.font = '600 15px ui-monospace, SFMono-Regular, Menlo, monospace';
      g.fillText('VITAHARBOR  /  PORT RECORD', 56, 72);

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

      g.fillStyle = 'rgba(225,232,247,0.66)';
      g.font = '500 18px ui-monospace, SFMono-Regular, Menlo, monospace';
      g.fillText(platform.toUpperCase(), 56, cursorY + size * 0.95);

      g.fillStyle = '#00e6ff';
      g.fillRect(56, cursorY + size * 1.24, 40, 3);
      g.fillStyle = 'rgba(255,255,255,0.85)';
      g.font = '600 15px ui-monospace, SFMono-Regular, Menlo, monospace';
      g.fillText(stage, 110, cursorY + size * 1.32);

      const techs = (current.technologies || []).slice(0, 2).join(' · ');
      const techLabel = techs || 'ARMv7 · vitaGL';
      g.fillStyle = 'rgba(0, 230, 255, 0.82)';
      g.font = '600 13px ui-monospace, SFMono-Regular, Menlo, monospace';
      g.fillText('[' + techLabel + ']', 56, cursorY + size * 1.54);

      g.fillStyle = 'rgba(255, 255, 255, 0.55)';
      g.font = '500 12px ui-monospace, SFMono-Regular, Menlo, monospace';
      g.fillText('HARDWARE TARGET: 60 FPS', 56, cursorY + size * 1.76);

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
      registerPress(key, 0.4);
      const dx = -Math.sin(i * Math.PI / 2) * 6.9, dy = Math.cos(i * Math.PI / 2) * 6.9;
      decal(['⌃','‹','⌄','›'][i], -73.7 + dx, 13.3 + dy, 1.5, 1.5, '#92979b', 11.65);
    }

    const glyphs = ['△','○','×','□'];
    [[0,7.5],[7.5,0],[0,-7.5],[-7.5,0]].forEach(([dx,dy], i) => {
      disc(73.5 + dx, 13.3 + dy, 3.95, 0.4, 9.85, black);
      const btn = disc(73.5 + dx, 13.3 + dy, 3.5, 1.2, 10.6, button);
      registerPress(btn, 0.55);
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
      registerPress(cap, 0.5);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(6.5, 0.35, 12, 64), silver);
      ring.position.set(x, -9, 11);
      vita.add(ring);
    }

    const home = disc(-71, -24.3, 5.8, 1, 9.6, button);
    home.scale.z = 0.52;
    registerPress(home, 0.3);
    decal('PS', -71, -24.3, 4, 2.8, '#d3d5d8', 10.3);

    for (const [x, label] of [[65.8,'SELECT'],[76,'START']] as const) {
      const pill = disc(x, -24.3, 3.6, 0.7, 9.7, button);
      pill.scale.z = 0.48;
      registerPress(pill, 0.25);
      decal(label, x, -24.3, 5.7, 1.3, '#b1b5ba', 10.2);
    }

    for (const sign of [-1, 1]) {
      for (let row = 0; row < 2; row++) {
        for (let col = 0; col < 3; col++) {
          disc(sign * (80.4 + col * 2.75), -8.8 - row * 2.9, 0.85, 0.2, 9.2, black);
        }
      }
    }


    // ==========================================
    // REAR DETAILS: TOUCHPAD, GRIPS, CAMERA, SCREWS
    // ==========================================

    // 1. Rear Touchpad Canvas Texture (Iconic PlayStation symbols pattern)
    const rearPadCanvas = document.createElement('canvas');
    rearPadCanvas.width = 1024;
    rearPadCanvas.height = 512;
    const rCtx = rearPadCanvas.getContext('2d');
    if (rCtx) {
      // Base dark glossy surface
      const bgGrad = rCtx.createLinearGradient(0, 0, 1024, 512);
      bgGrad.addColorStop(0, '#0a0c10');
      bgGrad.addColorStop(0.5, '#050608');
      bgGrad.addColorStop(1, '#090b0e');
      rCtx.fillStyle = bgGrad;
      rCtx.fillRect(0, 0, 1024, 512);

      // Subtle border line inside touchpad
      rCtx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      rCtx.lineWidth = 2;
      rCtx.strokeRect(16, 16, 992, 480);

      // Repeating subtle PlayStation symbols: △ ◯ ✕ ▢
      const symbols = ['△', '◯', '✕', '▢'];
      rCtx.font = '600 13px Arial, sans-serif';
      rCtx.textAlign = 'center';
      rCtx.textBaseline = 'middle';
      rCtx.fillStyle = 'rgba(255, 255, 255, 0.05)';

      const stepX = 36;
      const stepY = 32;
      let rowIdx = 0;
      for (let y = 36; y < 480; y += stepY) {
        let symIdx = rowIdx % symbols.length;
        for (let x = 36; x < 990; x += stepX) {
          // Leave central zone cleaner for PS emblem
          const distToCenter = Math.hypot(x - 512, y - 256);
          if (distToCenter > 90) {
            rCtx.fillText(symbols[symIdx], x, y);
          }
          symIdx = (symIdx + 1) % symbols.length;
        }
        rowIdx++;
      }

      // Center PlayStation Logo Emblem
      rCtx.fillStyle = 'rgba(215, 225, 240, 0.38)';
      rCtx.font = 'bold 36px Arial, sans-serif';
      rCtx.fillText('PS', 512, 248);

      // Bottom subtle regulatory branding
      rCtx.font = '500 10px ui-monospace, SFMono-Regular, Menlo, monospace';
      rCtx.fillStyle = 'rgba(255, 255, 255, 0.22)';
      rCtx.fillText('MODEL PCH-1000 · SONY COMPUTER ENTERTAINMENT INC.', 512, 455);
    }

    const rearPadTexture = new THREE.CanvasTexture(rearPadCanvas);
    rearPadTexture.colorSpace = THREE.SRGBColorSpace;
    textures.push(rearPadTexture);

    const rearPadMat = new THREE.MeshPhysicalMaterial({
      map: rearPadTexture,
      roughness: 0.12,
      metalness: 0.15,
      clearcoat: 0.95,
      clearcoatRoughness: 0.1,
      envMapIntensity: 1.2
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

    // Rear Touchpad Bezel (glossy silver border cleanly seated at -7.78, depth 0.35 to -8.13)
    const rearBezelShape = createRoundedRectShape(108.5, 54.5, 9);
    const rearBezelMesh = new THREE.Mesh(
      new THREE.ExtrudeGeometry(rearBezelShape, { depth: 0.35, bevelEnabled: true, bevelSize: 0.2, bevelThickness: 0.2, bevelSegments: 3, curveSegments: 24 }),
      silver
    );
    rearBezelMesh.position.set(0, 0, -7.78);
    rearBezelMesh.rotation.y = Math.PI;
    vita.add(rearBezelMesh);

    // Rear Touchpad Active Surface (z = -8.14 cleanly resting inside bezel without Z-fighting)
    const rearPadShape = createRoundedRectShape(107, 53, 8);
    const rearPadMesh = new THREE.Mesh(
      new THREE.ShapeGeometry(rearPadShape, 32),
      rearPadMat
    );
    rearPadMesh.position.set(0, 0, -8.14);
    rearPadMesh.rotation.y = Math.PI;
    vita.add(rearPadMesh);

    // 2. Ergonomic Finger Grips (Left & Right matte oval recesses at z = -7.80)
    const gripMat = new THREE.MeshStandardMaterial({
      color: '#0d0f13',
      roughness: 0.88,
      metalness: 0.04
    });
    const gripRimMat = new THREE.MeshStandardMaterial({
      color: '#16191f',
      roughness: 0.72,
      metalness: 0.08
    });

    for (const sign of [-1, 1]) {
      // Textured oval grip surface
      const gripMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(14, 14, 0.4, 48),
        gripMat
      );
      gripMesh.scale.set(1.0, 1.6, 0.5);
      gripMesh.rotation.x = Math.PI / 2;
      gripMesh.position.set(sign * 66.5, 0, -7.80);
      vita.add(gripMesh);

      // Subtle beveled rim around grip
      const gripRim = new THREE.Mesh(
        new THREE.TorusGeometry(14.2, 0.5, 12, 48),
        gripRimMat
      );
      gripRim.scale.set(1.0, 1.6, 1.0);
      gripRim.position.set(sign * 66.5, 0, -7.78);
      vita.add(gripRim);
    }

    // 3. Rear Camera Assembly (Top Center at z = -7.80 to -7.87)
    const camRing = new THREE.Mesh(
      new THREE.CylinderGeometry(3.4, 3.4, 0.45, 36),
      silver
    );
    camRing.rotation.x = Math.PI / 2;
    camRing.position.set(0, 28.5, -7.80);
    vita.add(camRing);

    const lensMat = new THREE.MeshPhysicalMaterial({
      color: '#020406',
      roughness: 0.05,
      metalness: 0.2,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      reflectivity: 0.9
    });
    const camLens = new THREE.Mesh(
      new THREE.CylinderGeometry(2.6, 2.6, 0.5, 36),
      lensMat
    );
    camLens.rotation.x = Math.PI / 2;
    camLens.position.set(0, 28.5, -7.85);
    vita.add(camLens);

    const camPupil = new THREE.Mesh(
      new THREE.CylinderGeometry(1.2, 1.2, 0.55, 24),
      new THREE.MeshBasicMaterial({ color: '#00e6ff' })
    );
    camPupil.rotation.x = Math.PI / 2;
    camPupil.position.set(0, 28.5, -7.87);
    vita.add(camPupil);

    const rearMic = new THREE.Mesh(
      new THREE.CylinderGeometry(0.5, 0.5, 0.4, 16),
      black
    );
    rearMic.rotation.x = Math.PI / 2;
    rearMic.position.set(6.5, 28.5, -7.80);
    vita.add(rearMic);

    // 4. Corner Screws on Rear Casing (z = -7.82 / -7.84)
    const screwMat = new THREE.MeshStandardMaterial({
      color: '#9ba0aa',
      roughness: 0.25,
      metalness: 0.85
    });

    const screwPositions = [
      [-76, 29],
      [76, 29],
      [-76, -29],
      [76, -29]
    ];

    for (const [sx, sy] of screwPositions) {
      const screw = new THREE.Mesh(
        new THREE.CylinderGeometry(1.1, 1.1, 0.35, 18),
        screwMat
      );
      screw.rotation.x = Math.PI / 2;
      screw.position.set(sx, sy, -7.82);
      vita.add(screw);

      const slot = new THREE.Mesh(
        new THREE.BoxGeometry(1.3, 0.25, 0.4),
        black
      );
      slot.position.set(sx, sy, -7.84);
      vita.add(slot);
    }

    // STUDIO LIGHTING SETUP WITH EDGE RIM ILLUMINATION
    scene.add(new THREE.HemisphereLight('#e7f1ff', '#151c26', 0.72));
    const light = new THREE.DirectionalLight('#edf5ff', 1.55);
    light.position.set(-80, 160, 260);
    scene.add(light);
    const fill = new THREE.DirectionalLight('#a9ceff', 0.72);
    fill.position.set(180, 0, 100);
    scene.add(fill);
    const rimLight = new THREE.DirectionalLight('#4d7cfe', 0.88);
    rimLight.position.set(0, -140, -180);
    scene.add(rimLight);
    const topRimLight = new THREE.DirectionalLight('#8fbaff', 0.45);
    topRimLight.position.set(0, 180, -120);
    scene.add(topRimLight);

    const cyanRim = new THREE.DirectionalLight('#00e6ff', 0.65);
    cyanRim.position.set(-140, -100, -140);
    scene.add(cyanRim);

    const rearLight = new THREE.DirectionalLight('#c8dcff', 0.95);
    rearLight.position.set(60, 100, -240);
    scene.add(rearLight);

    let px = 0, py = 0, visible = true, raf = 0, previous = '', readyReported = false;
    let targetRotX = 0, targetRotY = 0;
    let targetScrollProgress = 0, scrollProgress = 0;
    const reduced = reducedMotion 
    const sceneTop = el.getBoundingClientRect().top + window.scrollY;
    const updateScrollProgress = () => {
      const range = Math.max(window.innerHeight * 0.9, 400);
      targetScrollProgress = THREE.MathUtils.clamp((window.scrollY - sceneTop) / range, 0, 1);
    };
    updateScrollProgress();
    window.addEventListener('scroll', updateScrollProgress, { passive: true });

    let isDragging = false;
    let dragStartX = 0, dragStartY = 0;
    let dragRotX = 0, dragRotY = 0;
    let targetDragRotX = 0, targetDragRotY = 0;

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      targetDragRotX = dragRotX;
      targetDragRotY = dragRotY;
      try { el.setPointerCapture?.(e.pointerId); } catch {}
    };

    const move = (e: PointerEvent) => {
      if (isDragging) {
        const deltaX = e.clientX - dragStartX;
        const deltaY = e.clientY - dragStartY;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        targetDragRotY += deltaX * 0.008;
        targetDragRotX += deltaY * 0.008;
        targetDragRotX = THREE.MathUtils.clamp(targetDragRotX, -Math.PI / 3, Math.PI / 3);
      }
      if (reduced) return;
      const r = el.getBoundingClientRect();
      px = (e.clientX - r.left) / r.width - 0.5;
      py = (e.clientY - r.top) / r.height - 0.5;
    };

    const onPointerUp = (e: PointerEvent) => {
      isDragging = false;
      try { el.releasePointerCapture?.(e.pointerId); } catch {}
    };

    const leave = () => {
      isDragging = false;
      px = 0;
      py = 0;
    };

    el.addEventListener('pointerdown', onPointerDown);
    el.addEventListener('pointermove', move);
    window.addEventListener('pointerup', onPointerUp);
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
      if (reduced) {
        scene.rotation.set(0, 0, 0);
        light.position.x = -80;
        rimLight.position.x = 0;
      } else {
        scene.rotation.y += (targetRotY - scene.rotation.y) * 0.1;
        scene.rotation.x += (targetRotX - scene.rotation.x) * 0.1;
        // Dynamic light movement based on parallax
        light.position.x = -80 + (targetRotY * 100);
        rimLight.position.x = (targetRotY * 150);
      }
      scrollProgress += ((reduced ? 0 : targetScrollProgress) - scrollProgress) * 0.07;
      if (!visible || document.hidden) return;
      const signature = JSON.stringify(selected.current);
      if (signature !== previous) {
        paint();
        previous = signature;
      }
      if (lastFlippedRef.current !== isFlippedRef.current) {
        lastFlippedRef.current = isFlippedRef.current;
        targetDragRotY = isFlippedRef.current ? Math.PI : 0;
      }

      dragRotX += (targetDragRotX - dragRotX) * 0.12;
      dragRotY += (targetDragRotY - dragRotY) * 0.12;
      if (!isDragging) {
        targetDragRotX *= 0.96;
      }

      const rotY = (reduced ? 0 : px * 0.38 - scrollProgress * 0.16) + dragRotY;
      const rotX = (reduced ? 0 : py * 0.22) + dragRotX;

      // Dynamic studio lighting adaptation when rotated to rear
      const isRearFacing = Math.cos(vita.rotation.y) < 0;
      rearLight.intensity = isRearFacing ? 1.45 : 0.45;
      light.intensity = isRearFacing ? 0.65 : 1.55;
      cyanRim.intensity = isRearFacing ? 0.9 : 0.65;

      vita.rotation.y += (rotY - vita.rotation.y) * 0.09;
      vita.rotation.x += (rotX - vita.rotation.x) * 0.09;
      vita.rotation.z += ((-0.02 - scrollProgress * 0.12) - vita.rotation.z) * 0.09;
      vita.scale.setScalar(1 - scrollProgress * 0.09);
      vita.position.x += ((vita.userData.targetX ?? 0) + scrollProgress * 16 - vita.position.x) * 0.1;
      try {
        renderer.render(scene, camera);
        if (!reportedError && !readyReported) {
          readyReported = true;
          onRendererReady?.();
        }
      } catch {
        reportRendererError("renderer-initialization");
        return;
      }
    }

    // Interactive face buttons: real physical press feedback on click.
    const raycaster = new THREE.Raycaster();
    const pointerNdc = new THREE.Vector2();
    let pressedButton: THREE.Mesh | null = null;
    let pressedBaseZ = 0;
    const pressDown = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      pointerNdc.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointerNdc.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointerNdc, camera);
      const hits = raycaster.intersectObjects(pressables, false);
      if (hits.length > 0) {
        pressedButton = hits[0].object as THREE.Mesh;
        pressedBaseZ = Number(pressedButton.userData.pressBaseZ ?? pressedButton.position.z);
        const travel = Number(pressedButton.userData.pressTravel ?? 0.5);
        pressedButton.position.z = pressedBaseZ - travel;
      }
    };
    const releaseButton = () => {
      if (pressedButton) {
        pressedButton.position.z = pressedBaseZ;
        pressedButton = null;
      }
    };
    el.addEventListener("pointerdown", pressDown);
    window.addEventListener("pointerup", releaseButton);
    window.addEventListener("pointercancel", releaseButton);

    paint();
    tick();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener('scroll', updateScrollProgress);
      el.removeEventListener("pointerdown", pressDown);
      window.removeEventListener("pointerup", releaseButton);
      window.removeEventListener("pointercancel", releaseButton);
      cancelAnimationFrame(raf);
      ro.disconnect();
      io?.disconnect();
      el.removeEventListener('pointerdown', onPointerDown);
      el.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', onPointerUp);
      el.removeEventListener('pointerleave', leave);
      renderer.domElement.removeEventListener("webglcontextlost", handleContextLost);
      scene.traverse(obj => {
        const m = obj as THREE.Mesh;
        m.geometry?.dispose();
        if (m.material) {
          for (const mat of Array.isArray(m.material) ? m.material : [m.material]) mat.dispose();
        }
      });
      textures.forEach(t => t.dispose());
      env.dispose();
      pmrem?.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [align, onRendererError, onRendererReady, reducedMotion]);

  return (
    <div
      ref={host}
      onClick={onConsoleClick}
      className="vita-object relative w-full h-full cursor-grab active:cursor-grabbing select-none"
      style={{ minHeight: 320, touchAction: "pan-y" }}
      role="img"
      aria-label="Interactive 3D model of the PS Vita PCH-1000"
      data-vita-scene-status={unavailable ? "unavailable" : "ready"}
      data-vita-motion={reducedMotion ? "reduced" : "full"}
    >
      {unavailable && (
        <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-slate-400 text-xs font-mono">
          Interactive 3D model requires WebGL. All port documentation remains accessible below.
        </div>
      )}
    </div>
  );
};
