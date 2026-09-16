import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";

export interface SelectedProjectView {
  id: number;
  game_title: string;
  display_name: string;
  current_stage: string;
  performance_notes?: string | null;
  playability_notes?: string | null;
  technologies?: string[];
}

interface VitaConsoleSceneProps {
  selectedProject?: SelectedProjectView | null;
}

const STAGE_RAIL = [
  "announced",
  "research",
  "early_wip",
  "booting",
  "in_game",
  "playable",
  "completable",
  "released"
];

const STAGE_META: Record<string, { label: string; color: string }> = {
  announced: { label: "ANNOUNCED", color: "#93a4b8" },
  research: { label: "RESEARCH", color: "#93a4b8" },
  early_wip: { label: "EARLY WIP", color: "#f59e0b" },
  booting: { label: "BOOTING", color: "#f97316" },
  in_game: { label: "IN-GAME", color: "#eab308" },
  playable: { label: "PLAYABLE", color: "#22d3ee" },
  completable: { label: "COMPLETE", color: "#22c55e" },
  released: { label: "RELEASED", color: "#10b981" },
  unknown: { label: "UNKNOWN", color: "#93a4b8" }
};

const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

const FOV = 30;
const FIT_WIDTH = 4.7;
const FIT_HEIGHT = 2.86;

// Stage composition. The console is framed as an object on the upper right so
// the editorial column owns the left third and the OLED stays legible.
const STAGE_WIDE = 1.45;
const WIDE_CONSOLE_W = 0.51; // console width as a fraction of stage width
const WIDE_CENTER = { x: 0.73, y: 0.48 };
const NARROW_CONSOLE_W = 0.9;
const NARROW_CONSOLE_H = 0.66;
const NARROW_CENTER = { x: 0.5, y: 0.4 };

const BODY_W = 4.62;
const BODY_H = 2.06;
const BODY_CORNER = 0.62;

function traceRounded(target: THREE.Path, w: number, h: number, r: number) {
  const x = -w / 2;
  const y = -h / 2;
  target.moveTo(x + r, y);
  target.lineTo(x + w - r, y);
  target.quadraticCurveTo(x + w, y, x + w, y + r);
  target.lineTo(x + w, y + h - r);
  target.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  target.lineTo(x + r, y + h);
  target.quadraticCurveTo(x, y + h, x, y + h - r);
  target.lineTo(x, y + r);
  target.quadraticCurveTo(x, y, x + r, y);
}

function roundedShape(w: number, h: number, r: number): THREE.Shape {
  const shape = new THREE.Shape();
  traceRounded(shape, w, h, r);
  return shape;
}

function ringShape(
  ow: number,
  oh: number,
  orr: number,
  iw: number,
  ih: number,
  irr: number
): THREE.Shape {
  const shape = new THREE.Shape();
  traceRounded(shape, ow, oh, orr);
  const hole = new THREE.Path();
  traceRounded(hole, iw, ih, irr);
  shape.holes.push(hole);
  return shape;
}

function radialTexture(stops: Array<[number, string]>, size = 512): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const g = c.getContext("2d");
  if (g) {
    const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    stops.forEach((s) => grad.addColorStop(s[0], s[1]));
    g.fillStyle = grad;
    g.fillRect(0, 0, size, size);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function backdropTexture(): THREE.CanvasTexture {
  const size = 1024;
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const g = c.getContext("2d");
  if (g) {
    const lin = g.createLinearGradient(0, 0, 0, size);
    lin.addColorStop(0, "#101418");
    lin.addColorStop(0.44, "#07090b");
    lin.addColorStop(1, "#010102");
    g.fillStyle = lin;
    g.fillRect(0, 0, size, size);
    const rad = g.createRadialGradient(size * 0.5, size * 0.46, 0, size * 0.5, size * 0.46, size * 0.52);
    rad.addColorStop(0, "rgba(56,196,255,0.13)");
    rad.addColorStop(0.5, "rgba(12,60,96,0.05)");
    rad.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = rad;
    g.fillRect(0, 0, size, size);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const GLYPHS = ["triangle", "circle", "cross", "square"] as const;

/**
 * Hand-built photography studio used as the image-based lighting source.
 * A generic room probe washes the near-black chassis out into grey plastic;
 * four deliberate light cards give crisp, art-directed highlights instead.
 */
function studioLightStage(): THREE.Scene {
  const stage = new THREE.Scene();
  stage.background = new THREE.Color("#020304");

  const card = (
    w: number,
    h: number,
    color: string,
    intensity: number,
    position: [number, number, number]
  ) => {
    const material = new THREE.MeshBasicMaterial({ color, toneMapped: false });
    material.color.multiplyScalar(intensity);
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), material);
    mesh.position.set(position[0], position[1], position[2]);
    mesh.lookAt(0, 0, 0);
    stage.add(mesh);
    return mesh;
  };

  // Broad overhead softbox: long highlight rolling over the shoulders.
  card(9, 9, "#ffffff", 1.4, [0.4, 6.4, 1.6]);
  // Tight key card, front-left: the sharp streak down the left shell.
  card(4.4, 2.4, "#ffffff", 5.4, [-5.6, 1.9, 3.2]);
  // Cool strip behind the right shoulder: defines the silhouette edge.
  card(0.8, 7.5, "#9eddff", 7.0, [6.4, 1.0, -3.4]);
  // Warm bounce from below-left so the underside does not read as flat black.
  card(5, 2.4, "#4a3418", 2.2, [-4.8, -2.8, 1.6]);

  return stage;
}

function glyphTexture(kind: string, color: string): THREE.CanvasTexture {
  const size = 96;
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const g = c.getContext("2d");
  if (g) {
    g.clearRect(0, 0, size, size);
    g.strokeStyle = color;
    g.lineWidth = 9;
    g.lineJoin = "round";
    g.lineCap = "round";
    if (kind === "triangle") {
      g.beginPath();
      g.moveTo(48, 18);
      g.lineTo(78, 72);
      g.lineTo(18, 72);
      g.closePath();
      g.stroke();
    } else if (kind === "circle") {
      g.beginPath();
      g.arc(48, 48, 28, 0, Math.PI * 2);
      g.stroke();
    } else if (kind === "cross") {
      g.beginPath();
      g.moveTo(22, 22);
      g.lineTo(74, 74);
      g.moveTo(74, 22);
      g.lineTo(22, 74);
      g.stroke();
    } else {
      g.beginPath();
      g.rect(22, 22, 52, 52);
      g.stroke();
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines = 2
): number {
  const words = text.split(" ");
  let line = "";
  let lines = 0;
  for (let i = 0; i < words.length; i++) {
    const test = line ? line + " " + words[i] : words[i];
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, y + lines * lineHeight);
      lines++;
      if (lines >= maxLines) return y + lines * lineHeight;
      line = words[i];
    } else {
      line = test;
    }
  }
  if (line) {
    ctx.fillText(line, x, y + lines * lineHeight);
    lines++;
  }
  return y + lines * lineHeight;
}

export const VitaConsoleScene: React.FC<VitaConsoleSceneProps> = ({ selectedProject }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const projectRef = useRef<SelectedProjectView | null>(null);

  projectRef.current = selectedProject ?? null;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    } catch {
      return;
    }

    const reduceMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const width = Math.max(container.clientWidth, 320);
    const height = Math.max(container.clientHeight, 280);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.style.display = "block";
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#06070a");

    const camera = new THREE.PerspectiveCamera(FOV, width / height, 0.1, 100);

    const halfTan = Math.tan((FOV * Math.PI) / 360);

    /**
     * Frame the stage: pull the camera back far enough that the console only
     * occupies its intended fraction of the viewport, then record the world
     * offset that centres it at the intended screen position.
     */
    const focal = { x: 0, y: 0 };
    const frameStage = (aspect: number) => {
      const wide = aspect > STAGE_WIDE;
      const a = Math.max(aspect, 0.4);

      const dW = wide
        ? FIT_WIDTH / (2 * halfTan * a * WIDE_CONSOLE_W)
        : FIT_WIDTH / (2 * halfTan * a * NARROW_CONSOLE_W);
      const dH = wide
        ? FIT_HEIGHT / (2 * halfTan * 0.9)
        : FIT_HEIGHT / (2 * halfTan * NARROW_CONSOLE_H);
      const distance = Math.max(dW, dH);

      camera.aspect = aspect;
      camera.position.set(0, 0.34, distance);
      camera.lookAt(0, -0.02, 0);
      camera.updateProjectionMatrix();

      const centre = wide ? WIDE_CENTER : NARROW_CENTER;
      const halfH = halfTan * distance;
      const halfW = halfH * a;
      focal.x = (centre.x - 0.5) * 2 * halfW;
      focal.y = (centre.y - 0.5) * 2 * halfH;

      // Safety net: never let the chassis bleed past the stage edges.
      const maxX = Math.max(halfW - FIT_WIDTH / 2 - halfW * 0.02, 0);
      const maxY = Math.max(halfH - FIT_HEIGHT / 2 - halfH * 0.02, 0);
      focal.x = THREE.MathUtils.clamp(focal.x, -maxX, maxX);
      focal.y = THREE.MathUtils.clamp(focal.y, -maxY, maxY);
    };
    frameStage(width / height);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const studio = studioLightStage();
    const envTexture = pmrem.fromScene(studio, 0.028).texture;
    scene.environment = envTexture;
    scene.environmentIntensity = 1;
    studio.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.geometry) mesh.geometry.dispose();
      const mat = mesh.material as THREE.Material | undefined;
      if (mat) mat.dispose();
    });

    const backdrop = new THREE.Mesh(
      new THREE.PlaneGeometry(64, 36),
      new THREE.MeshBasicMaterial({ map: backdropTexture(), depthWrite: false, toneMapped: false })
    );
    backdrop.position.set(0, 0.6, -9);
    scene.add(backdrop);

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(44, 44),
      new THREE.ShadowMaterial({ opacity: 0.78, color: 0x000000 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.86;
    floor.receiveShadow = true;
    scene.add(floor);

    const pool = new THREE.Mesh(
      new THREE.PlaneGeometry(14, 14),
      new THREE.MeshBasicMaterial({
        map: radialTexture([
          [0, "rgba(96,200,255,0.4)"],
          [0.42, "rgba(20,72,128,0.09)"],
          [1, "rgba(0,0,0,0)"]
        ]),
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        opacity: 0.22,
        toneMapped: false
      })
    );
    pool.rotation.x = -Math.PI / 2;
    pool.position.set(0, -1.84, 0);
    scene.add(pool);

    const benchLine = new THREE.Mesh(
      new THREE.PlaneGeometry(24, 0.01),
      new THREE.MeshBasicMaterial({
        color: 0x14506e,
        toneMapped: false,
        transparent: true,
        opacity: 0.85
      })
    );
    benchLine.position.set(0, -1.842, 0.02);
    scene.add(benchLine);

    const vita = new THREE.Group();
    vita.rotation.order = "YXZ";
    scene.add(vita);

    const bodyMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#0b0e13"),
      metalness: 0.22,
      roughness: 0.44,
      clearcoat: 0.42,
      clearcoatRoughness: 0.16,
      envMapIntensity: 1.05
    });
    const bodyGeom = new THREE.ExtrudeGeometry(roundedShape(BODY_W, BODY_H, BODY_CORNER), {
      depth: 0.22,
      bevelEnabled: true,
      bevelSegments: 6,
      steps: 1,
      bevelSize: 0.05,
      bevelThickness: 0.05
    });
    bodyGeom.center();
    bodyGeom.computeBoundingBox();
    // The extruded chassis is centred on all axes, so the real front plane is
    // the bevel apex - every front-facing part must sit in front of it.
    const frontZ = bodyGeom.boundingBox ? bodyGeom.boundingBox.max.z : 0.16;
    const controlZ = frontZ + 0.006;
    const body = new THREE.Mesh(bodyGeom, bodyMat);
    body.castShadow = true;
    body.receiveShadow = true;
    vita.add(body);

    const frontPlate = new THREE.Mesh(
      new THREE.ShapeGeometry(roundedShape(4.34, 1.82, 0.5)),
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color("#05070a"),
        metalness: 0.3,
        roughness: 0.14,
        clearcoat: 1,
        clearcoatRoughness: 0.04,
        envMapIntensity: 1.05,
        side: THREE.DoubleSide
      })
    );
    frontPlate.position.z = frontZ + 0.001;
    vita.add(frontPlate);

    const chrome = new THREE.Mesh(
      new THREE.ShapeGeometry(ringShape(3.16, 1.88, 0.13, 3.06, 1.78, 0.1)),
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color("#e6eef7"),
        metalness: 1,
        roughness: 0.13,
        envMapIntensity: 2.4,
        side: THREE.DoubleSide
      })
    );
    chrome.position.z = frontZ + 0.002;
    vita.add(chrome);

    const bezel = new THREE.Mesh(
      new THREE.ShapeGeometry(roundedShape(3.06, 1.78, 0.1)),
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color("#04060a"),
        metalness: 0.2,
        roughness: 0.14,
        clearcoat: 1,
        clearcoatRoughness: 0.07,
        envMapIntensity: 0.4,
        side: THREE.DoubleSide
      })
    );
    bezel.position.y = 0.075;
    bezel.position.z = frontZ + 0.004;
    vita.add(bezel);

    const screenCanvas = document.createElement("canvas");
    screenCanvas.width = 960;
    screenCanvas.height = 544;
    const sctx = screenCanvas.getContext("2d");

    const screenTexture = new THREE.CanvasTexture(screenCanvas);
    screenTexture.colorSpace = THREE.SRGBColorSpace;
    screenTexture.minFilter = THREE.LinearFilter;
    screenTexture.magFilter = THREE.LinearFilter;
    screenTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();

    const screenMat = new THREE.MeshBasicMaterial({ map: screenTexture, toneMapped: false });
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(2.9, 1.645), screenMat);
    screen.position.y = 0.075;
    screen.position.z = frontZ + 0.008;
    vita.add(screen);

    const darkPlastic = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#141922"),
      metalness: 0.3,
      roughness: 0.4,
      clearcoat: 0.5,
      clearcoatRoughness: 0.3,
      envMapIntensity: 0.55
    });
    const gripMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#0a0e14"),
      metalness: 0.1,
      roughness: 0.85,
      envMapIntensity: 0.4
    });

    const dpad = new THREE.Group();
    const dpadBarA = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.155, 0.075), darkPlastic);
    const dpadBarB = dpadBarA.clone();
    dpadBarB.rotation.z = Math.PI / 2;
    dpad.add(dpadBarA, dpadBarB);
    dpad.position.set(-1.9, 0.32, controlZ);
    dpad.children.forEach((c) => {
      c.castShadow = true;
    });
    vita.add(dpad);

    const faceColors = ["#4ade80", "#f87171", "#60a5fa", "#f472b6"];
    const facePositions = [
      [0, 0.2],
      [0.2, 0],
      [0, -0.2],
      [-0.2, 0]
    ];
    const glyphTextures: THREE.CanvasTexture[] = [];
    facePositions.forEach((p, i) => {
      const bx = 1.9 + p[0];
      const by = 0.32 + p[1];
      const mat = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color("#12161e"),
        metalness: 0.25,
        roughness: 0.32,
        clearcoat: 0.85,
        clearcoatRoughness: 0.18,
        envMapIntensity: 0.6
      });
      const btn = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.075, 28), mat);
      btn.rotation.x = Math.PI / 2;
      btn.position.set(bx, by, controlZ);
      btn.castShadow = true;
      vita.add(btn);

      const glyphTex = glyphTexture(GLYPHS[i], faceColors[i]);
      glyphTextures.push(glyphTex);
      const glyph = new THREE.Mesh(
        new THREE.PlaneGeometry(0.112, 0.112),
        new THREE.MeshBasicMaterial({
          map: glyphTex,
          transparent: true,
          depthWrite: false,
          toneMapped: false
        })
      );
      glyph.position.set(bx, by, controlZ + 0.04);
      vita.add(glyph);
    });

    const buildStick = (x: number, y: number): THREE.Group => {
      const g = new THREE.Group();
      const well = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.05, 32), darkPlastic);
      well.rotation.x = Math.PI / 2;
      const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.185, 0.168, 0.11, 28), gripMat);
      grip.rotation.x = Math.PI / 2;
      grip.position.z = 0.072;
      well.castShadow = true;
      grip.castShadow = true;
      g.add(well, grip);
      g.position.set(x, y, controlZ);
      return g;
    };
    vita.add(buildStick(-1.9, -0.52));
    vita.add(buildStick(1.9, -0.52));

    const psMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#0d2130"),
      emissive: new THREE.Color("#3ad2ff"),
      emissiveIntensity: 0.5,
      metalness: 0.3,
      roughness: 0.3
    });
    const psBtn = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.045, 24), psMat);
    psBtn.rotation.x = Math.PI / 2;
    psBtn.position.set(-0.42, -0.86, frontZ + 0.007);
    vita.add(psBtn);

    [-0.1, 0.16].forEach((sx) => {
      const pill = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.055, 0.04), darkPlastic);
      pill.position.set(sx, -0.86, frontZ + 0.007);
      vita.add(pill);
    });

    const cameraDot = new THREE.Mesh(
      new THREE.CylinderGeometry(0.028, 0.028, 0.02, 20),
      new THREE.MeshPhysicalMaterial({ color: new THREE.Color("#0b1620"), metalness: 1, roughness: 0.12 })
    );
    cameraDot.rotation.x = Math.PI / 2;
    cameraDot.position.set(0, 0.93, frontZ + 0.007);
    vita.add(cameraDot);

    scene.add(new THREE.HemisphereLight(0xa8c8f0, 0x04060a, 0.12));

    const key = new THREE.DirectionalLight(0xeaf3ff, 0.95);
    key.position.set(-5.2, 5.4, 4.6);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.near = 1;
    key.shadow.camera.far = 20;
    key.shadow.camera.left = -3.4;
    key.shadow.camera.right = 3.4;
    key.shadow.camera.top = 3.4;
    key.shadow.camera.bottom = -3.4;
    key.shadow.bias = -0.0006;
    key.shadow.normalBias = 0.02;
    scene.add(key);

    const rim = new THREE.DirectionalLight(0x39c6ff, 1.15);
    rim.position.set(5.4, 2.4, -3.6);
    scene.add(rim);

    const edge = new THREE.DirectionalLight(0x8fe4ff, 0.42);
    edge.position.set(-3.6, -2.6, -2.4);
    scene.add(edge);

    const detail = new THREE.DirectionalLight(0xdcecff, 0.35);
    detail.position.set(2.6, 1.4, 5.2);
    scene.add(detail);

    const screenGlow = new THREE.PointLight(0x00d5ff, 0.6, 1.7, 2);
    screenGlow.position.set(0, 0.075, frontZ + 0.34);
    scene.add(screenGlow);

    const paint = (stage: string) => {
      if (!sctx) return;
      const p = projectRef.current;
      const meta = STAGE_META[stage] || STAGE_META.unknown;
      const accent = meta.color;

      sctx.clearRect(0, 0, 960, 544);
      sctx.fillStyle = "#04060a";
      sctx.fillRect(0, 0, 960, 544);

      sctx.fillStyle = "rgba(120,200,255,0.03)";
      for (let y = 1; y < 544; y += 4) sctx.fillRect(0, y, 960, 1);

      sctx.fillStyle = "#070b12";
      sctx.fillRect(0, 0, 960, 46);
      sctx.font = "bold 22px " + MONO;
      sctx.fillStyle = "#e8f6ff";
      sctx.fillText("VITAHARBOR", 28, 32);
      sctx.font = "17px " + MONO;
      sctx.fillStyle = "#6d757e";
      sctx.fillText("// PORT RECORD", 176, 32);
      sctx.fillStyle = "#22c55e";
      sctx.fillText("\u25CF LIVE", 754, 32);
      sctx.fillStyle = "#6d757e";
      sctx.fillText("960 x 544", 838, 32);
      sctx.globalAlpha = 0.55;
      sctx.fillStyle = accent;
      sctx.fillRect(0, 45, 960, 1);
      sctx.globalAlpha = 1;

      sctx.fillStyle = "rgba(120,150,180,0.16)";
      sctx.fillRect(534, 74, 1, 322);

      sctx.font = "13px " + MONO;
      sctx.fillStyle = "#6d757e";
      sctx.fillText("GAME TITLE", 28, 92);
      sctx.fillText("PERFORMANCE", 560, 92);
      sctx.fillText("PLAYABILITY", 560, 218);
      sctx.fillText("ENGINE", 560, 344);

      if (p) {
        const title = p.game_title || p.display_name || "UNKNOWN PORT";
        sctx.font = "bold 38px " + MONO;
        if (sctx.measureText(title).width > 480) {
          sctx.font = "bold 30px " + MONO;
        }
        sctx.fillStyle = "#ffffff";
        const afterTitle = wrapText(sctx, title, 28, 138, 480, 44, 2);

        sctx.font = "19px " + MONO;
        sctx.fillStyle = "#3ad2ff";
        const portLine =
          p.display_name && p.display_name !== p.game_title ? "PORT  " + p.display_name : "PORT  " + title;
        sctx.fillText(portLine, 28, afterTitle + 26);

        sctx.font = "bold 20px " + MONO;
        const chipW = sctx.measureText(meta.label).width + 36;
        const chipY = afterTitle + 46;
        sctx.fillStyle = accent;
        sctx.fillRect(28, chipY, chipW, 36);
        sctx.fillStyle = "#05080c";
        sctx.fillText(meta.label, 46, chipY + 25);

        sctx.font = "16px " + MONO;
        sctx.fillStyle = "#dfe5ea";
        wrapText(
          sctx,
          p.performance_notes || "No verified performance telemetry logged yet.",
          560,
          122,
          378,
          24,
          3
        );

        sctx.fillStyle = "#dfe5ea";
        wrapText(
          sctx,
          p.playability_notes || "No verified playability report logged yet.",
          560,
          248,
          378,
          24,
          3
        );

        sctx.font = "16px " + MONO;
        sctx.fillStyle = "#a3acb5";
        const techs =
          p.technologies && p.technologies.length > 0 ? p.technologies.join("  /  ") : "Not yet classified";
        wrapText(sctx, techs, 560, 374, 378, 22, 2);
      } else {
        sctx.fillStyle = "#ffffff";
        sctx.font = "bold 38px " + MONO;
        sctx.fillText("PORT INTAKE STANDBY", 28, 152);
        sctx.font = "19px " + MONO;
        sctx.fillStyle = "#3ad2ff";
        sctx.fillText("Select a row in the ledger to load its record.", 28, 192);
      }

      const railY = 428;
      const railW = 904;
      const cellW = railW / STAGE_RAIL.length;
      const idx = STAGE_RAIL.indexOf(stage);
      sctx.font = "bold 14px " + MONO;
      STAGE_RAIL.forEach((s, i) => {
        const x = 28 + i * cellW;
        const m = STAGE_META[s];
        const done = idx >= 0 && i < idx;
        const current = idx === i;
        if (current) {
          sctx.fillStyle = m.color;
          sctx.fillRect(x, railY, cellW - 8, 36);
          sctx.fillStyle = "#05080c";
        } else if (done) {
          sctx.fillStyle = "rgba(210,232,255,0.16)";
          sctx.fillRect(x, railY, cellW - 6, 34);
          sctx.fillStyle = "#9fb4c7";
        } else {
          sctx.strokeStyle = "rgba(120,140,160,0.3)";
          sctx.lineWidth = 1;
          sctx.strokeRect(x + 0.5, railY + 0.5, cellW - 9, 35);
          sctx.fillStyle = "#3d4d5e";
        }
        sctx.fillText(m.label, x + 10, railY + 24);
      });

      sctx.fillStyle = "#070b12";
      sctx.fillRect(0, 490, 960, 54);
      sctx.fillStyle = accent;
      sctx.globalAlpha = 0.4;
      sctx.fillRect(0, 490, 960, 1);
      sctx.globalAlpha = 1;
      sctx.font = "16px " + MONO;
      sctx.fillStyle = "#767f88";
      sctx.fillText("CORTEX-A9  /  SGX543MP4+  /  NO ROMS HOSTED", 28, 524);
      sctx.fillText("VITAHARBOR.VERCEL.APP", 776, 524);
    };

    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    // Tight, restrained bloom: a soft halo on the OLED and chrome, never a
    // coloured blob floating over the editorial column.
    const bloom = new UnrealBloomPass(new THREE.Vector2(width * 0.5, height * 0.5), 0.18, 0.32, 0.9);
    composer.addPass(bloom);
    composer.addPass(new OutputPass());
    composer.setSize(width, height);

    let pointerX = 0;
    let pointerY = 0;
    const onPointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      pointerX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointerY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    };
    const onPointerLeave = () => {
      pointerX = 0;
      pointerY = 0;
    };
    container.addEventListener("pointermove", onPointerMove);
    container.addEventListener("pointerleave", onPointerLeave);

    const resize = () => {
      const w = Math.max(container.clientWidth, 320);
      const h = Math.max(container.clientHeight, 280);
      frameStage(w / h);
      renderer.setSize(w, h);
      composer.setSize(w, h);
      bloom.setSize(w * 0.5, h * 0.5);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(container);

    let raf = 0;
    let lastStage = "";
    const clock = new THREE.Clock();

    const tick = () => {
      raf = requestAnimationFrame(tick);
      const t = clock.getElapsedTime();

      const stage = projectRef.current?.current_stage || "announced";
      if (stage !== lastStage) {
        lastStage = stage;
        paint(stage);
        screenTexture.needsUpdate = true;
      }

      const meta = STAGE_META[stage] || STAGE_META.unknown;
      screenGlow.color.set(meta.color);
      screenGlow.intensity = 0.75 + Math.sin(t * 1.4) * 0.09;

      if (!reduceMotion) {
        const yaw = 0.26 + Math.sin(t * 0.3) * 0.07 + pointerX * 0.14;
        const pitch = -0.08 + pointerY * 0.07;
        vita.rotation.y += (yaw - vita.rotation.y) * 0.05;
        vita.rotation.x += (pitch - vita.rotation.x) * 0.05;
        vita.position.x += (focal.x - vita.position.x) * 0.08;
        vita.position.y = focal.y + Math.sin(t * 1.05) * 0.04;
      } else {
        vita.rotation.y = 0.26;
        vita.rotation.x = -0.08;
        vita.position.x = focal.x;
        vita.position.y = focal.y;
      }

      composer.render();
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerleave", onPointerLeave);
      composer.dispose();
      pmrem.dispose();
      envTexture.dispose();
      glyphTextures.forEach((t) => t.dispose());
      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
        else if (mat) mat.dispose();
      });
      screenTexture.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full overflow-hidden bg-[#06070a]"
      aria-label="Interactive 3D PlayStation Vita displaying the selected port record"
    >
        <div className="pointer-events-none absolute inset-0 z-10">
          {/* Desktop keeps the copy column on a darker field than the hardware
              without crushing the chassis: dark to ~30%, gone by ~70%. Below lg
              the copy is not over the stage, so the plate stays uncovered. */}
          <div className="absolute inset-0 hidden bg-[linear-gradient(94deg,rgba(6,7,10,0.95)_0%,rgba(6,7,10,0.8)_24%,rgba(6,7,10,0.3)_46%,rgba(6,7,10,0.04)_62%,rgba(6,7,10,0)_72%)] lg:block" />
          <div className="absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(6,7,10,0.85)_0%,rgba(6,7,10,0)_100%)]" />
          <div className="absolute inset-x-0 bottom-0 h-20 bg-[linear-gradient(0deg,rgba(6,7,10,0.9)_0%,rgba(6,7,10,0)_100%)]" />
          <div className="absolute right-5 bottom-5 hidden items-center gap-2 font-mono text-[9px] tracking-[0.18em] text-[#5b636c] uppercase lg:flex">
            <span className="h-1 w-1 rounded-full bg-[#3ad2ff]" />
            <span>Move pointer to orbit</span>
          </div>
      </div>
    </div>
  );
};
