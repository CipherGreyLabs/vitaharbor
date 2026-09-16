import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
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
  announced: { label: "ANNOUNCED", color: "#64748b" },
  research: { label: "RESEARCH", color: "#64748b" },
  early_wip: { label: "EARLY WIP", color: "#f59e0b" },
  booting: { label: "BOOTING", color: "#f97316" },
  in_game: { label: "IN-GAME", color: "#eab308" },
  playable: { label: "PLAYABLE", color: "#06b6d4" },
  completable: { label: "COMPLETABLE", color: "#22c55e" },
  released: { label: "RELEASED", color: "#10b981" },
  unknown: { label: "UNKNOWN", color: "#64748b" }
};

const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

function roundedRectShape(w: number, h: number, r: number): THREE.Shape {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

function radialTexture(inner: string, outer: string, size = 512): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const g = c.getContext("2d");
  if (g) {
    const grad = g.createRadialGradient(size / 2, size * 0.58, 0, size / 2, size * 0.58, size * 0.62);
    grad.addColorStop(0, inner);
    grad.addColorStop(0.55, outer);
    grad.addColorStop(1, "rgba(2,4,8,1)");
    g.fillStyle = grad;
    g.fillRect(0, 0, size, size);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
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
  const [hud, setHud] = useState({ fps: 60, tris: 0 });

  projectRef.current = selectedProject ?? null;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    } catch {
      return;
    }

    const reduceMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const width = Math.max(container.clientWidth, 320);
    const height = Math.max(container.clientHeight, 280);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#04070d");

    const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 100);
    camera.position.set(0, 0.42, 6.4);
    camera.lookAt(0, -0.02, 0);

    // Image based lighting for believable metal and glass
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTexture = pmrem.fromScene(new RoomEnvironment(), 0.03).texture;
    scene.environment = envTexture;

    // Studio backdrop
    const backdrop = new THREE.Mesh(
      new THREE.PlaneGeometry(30, 18),
      new THREE.MeshBasicMaterial({
        map: radialTexture("rgba(24,48,80,1)", "rgba(7,12,20,1)"),
        depthWrite: false
      })
    );
    backdrop.position.set(0, 0.4, -8);
    scene.add(backdrop);

    // Faint perspective grid floor, reads as a hardware lab bench
    const gridHelper = new THREE.GridHelper(30, 30, 0x0f2536, 0x0a1a26);
    gridHelper.position.set(0, -2.1, -1);
    const gridMat = gridHelper.material as THREE.Material;
    gridMat.transparent = true;
    gridMat.opacity = 0.35;
    scene.add(gridHelper);

    // Glow pool under the handheld
    const pool = new THREE.Mesh(
      new THREE.PlaneGeometry(11, 11),
      new THREE.MeshBasicMaterial({
        map: radialTexture("rgba(0,190,255,0.55)", "rgba(0,90,160,0.05)"),
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );
    pool.rotation.x = -Math.PI / 2;
    pool.position.set(0, -2.08, 0);
    scene.add(pool);

    const vita = new THREE.Group();
    scene.add(vita);

    // ---------- Chassis ----------
    const bodyGeom = new THREE.ExtrudeGeometry(roundedRectShape(4.62, 2.06, 0.62), {
      depth: 0.2,
      bevelEnabled: true,
      bevelSegments: 8,
      steps: 1,
      bevelSize: 0.07,
      bevelThickness: 0.075
    });
    bodyGeom.center();
    const bodyMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#0a0d13"),
      metalness: 0.62,
      roughness: 0.36,
      clearcoat: 0.55,
      clearcoatRoughness: 0.22,
      envMapIntensity: 1.0
    });
    const body = new THREE.Mesh(bodyGeom, bodyMat);
    vita.add(body);

    // ---------- Screen stack ----------
    const trimGeom = new THREE.ShapeGeometry(roundedRectShape(3.12, 1.82, 0.09));
    const trimMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#93a3b5"),
      metalness: 1.0,
      roughness: 0.16,
      envMapIntensity: 1.3
    });
    const trim = new THREE.Mesh(trimGeom, trimMat);
    trim.position.set(0, 0.06, 0.118);
    vita.add(trim);

    const glassGeom = new THREE.ShapeGeometry(roundedRectShape(3.0, 1.7, 0.07));
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#05080d"),
      metalness: 0.45,
      roughness: 0.08,
      envMapIntensity: 0.9
    });
    const glass = new THREE.Mesh(glassGeom, glassMat);
    glass.position.set(0, 0.06, 0.124);
    vita.add(glass);

    const screenCanvas = document.createElement("canvas");
    screenCanvas.width = 960;
    screenCanvas.height = 544;
    const sctx = screenCanvas.getContext("2d");

    const screenTexture = new THREE.CanvasTexture(screenCanvas);
    screenTexture.colorSpace = THREE.SRGBColorSpace;
    screenTexture.minFilter = THREE.LinearFilter;
    screenTexture.magFilter = THREE.LinearFilter;

    const screenMat = new THREE.MeshBasicMaterial({ map: screenTexture, toneMapped: false });
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(2.9, 1.643), screenMat);
    screen.position.set(0, 0.06, 0.129);
    vita.add(screen);

    // Halo that makes the emissive screen bleed light like a real OLED
    const haloMat = new THREE.MeshBasicMaterial({
      map: radialTexture("rgba(0,220,255,0.5)", "rgba(0,120,200,0.05)"),
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      opacity: 0.34
    });
    const halo = new THREE.Mesh(new THREE.PlaneGeometry(5.6, 3.4), haloMat);
    halo.position.set(0, 0.06, 0.08);
    vita.add(halo);

    // ---------- Controls ----------
    const darkPlastic = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#12181f"),
      metalness: 0.35,
      roughness: 0.45,
      clearcoat: 0.25,
      envMapIntensity: 0.85
    });

    // D-pad
    const dpad = new THREE.Group();
    const dpadBarA = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.155, 0.075), darkPlastic);
    const dpadBarB = dpadBarA.clone();
    dpadBarB.rotation.z = Math.PI / 2;
    dpad.add(dpadBarA, dpadBarB);
    dpad.position.set(-1.85, 0.28, 0.14);
    vita.add(dpad);

    // Face buttons with brand colours
    const faceColors = ["#7dd3fc", "#fca5a5", "#86efac", "#c4b5fd"];
    const facePositions = [
      [0, 0.19],
      [0.19, 0],
      [0, -0.19],
      [-0.19, 0]
    ];
    facePositions.forEach((p, i) => {
      const mat = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(faceColors[i]),
        emissive: new THREE.Color(faceColors[i]),
        emissiveIntensity: 0.18,
        metalness: 0.2,
        roughness: 0.35,
        clearcoat: 0.9,
        envMapIntensity: 0.9
      });
      const btn = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.075, 28), mat);
      btn.rotation.x = Math.PI / 2;
      btn.position.set(1.85 + p[0], 0.28 + p[1], 0.14);
      vita.add(btn);
    });

    // Analog sticks
    function buildStick(x: number, y: number): THREE.Group {
      const g = new THREE.Group();
      const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.055, 32), darkPlastic);
      ring.rotation.x = Math.PI / 2;
      const cap = new THREE.Mesh(
        new THREE.CylinderGeometry(0.19, 0.175, 0.1, 32),
        new THREE.MeshPhysicalMaterial({
          color: new THREE.Color("#080b10"),
          metalness: 0.15,
          roughness: 0.85,
          envMapIntensity: 0.5
        })
      );
      cap.rotation.x = Math.PI / 2;
      cap.position.z = 0.07;
      g.add(ring, cap);
      g.position.set(x, y, 0.14);
      return g;
    }
    vita.add(buildStick(-1.85, -0.55));
    vita.add(buildStick(1.85, -0.55));

    // PS button, start and select
    const psMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#0e2230"),
      emissive: new THREE.Color("#00d5ff"),
      emissiveIntensity: 0.7,
      metalness: 0.3,
      roughness: 0.3
    });
    const psBtn = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.05, 24), psMat);
    psBtn.rotation.x = Math.PI / 2;
    psBtn.position.set(-1.0, -0.83, 0.13);
    vita.add(psBtn);

    [-0.28, 0.02].forEach((sx) => {
      const pill = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.06, 0.05), darkPlastic);
      pill.position.set(sx, -0.83, 0.13);
      vita.add(pill);
    });

    // Front camera
    const cameraDot = new THREE.Mesh(
      new THREE.CylinderGeometry(0.045, 0.045, 0.03, 20),
      new THREE.MeshPhysicalMaterial({ color: new THREE.Color("#0b1620"), metalness: 1, roughness: 0.1 })
    );
    cameraDot.rotation.x = Math.PI / 2;
    cameraDot.position.set(0, 1.03, 0.12);
    vita.add(cameraDot);

    // Shoulder triggers
    [-1.92, 1.92].forEach((sx) => {
      const trigger = new THREE.Mesh(
        new THREE.BoxGeometry(0.86, 0.16, 0.3),
        new THREE.MeshPhysicalMaterial({
          color: new THREE.Color("#0d1319"),
          metalness: 0.55,
          roughness: 0.4,
          envMapIntensity: 0.9
        })
      );
      trigger.position.set(sx, 1.02, -0.04);
      vita.add(trigger);
    });

    // ---------- Lighting ----------
    scene.add(new THREE.AmbientLight(0xffffff, 0.22));

    const keyLight = new THREE.DirectionalLight(0xcfeaff, 2.5);
    keyLight.position.set(-4.5, 4, 4.5);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x2f6bff, 1.5);
    fillLight.position.set(5, -1.5, 3.5);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(0x00e5ff, 2.4, 14, 2);
    rimLight.position.set(0, 2.6, -3.2);
    scene.add(rimLight);

    const screenLight = new THREE.PointLight(0x00d5ff, 1.7, 6, 2);
    screenLight.position.set(0, 0.06, 1.15);
    scene.add(screenLight);

    // ---------- Screen painting ----------
    function paint(stage: string) {
      if (!sctx) return;
      const p = projectRef.current;
      const meta = STAGE_META[stage] || STAGE_META.unknown;
      const accent = meta.color;

      sctx.fillStyle = "#04070c";
      sctx.fillRect(0, 0, 960, 544);

      // Scanlines
      sctx.fillStyle = "rgba(0,220,255,0.035)";
      for (let y = 0; y < 544; y += 4) sctx.fillRect(0, y, 960, 1);

      // Top bar
      sctx.fillStyle = "#070c13";
      sctx.fillRect(0, 0, 960, 44);
      sctx.fillStyle = accent;
      sctx.fillRect(0, 43, 960, 1);
      sctx.font = "bold 17px " + MONO;
      sctx.fillStyle = "#e2f4ff";
      sctx.fillText("VITAHARBOR", 26, 29);
      sctx.font = "14px " + MONO;
      sctx.fillStyle = "#5b7186";
      sctx.fillText("// PORT DEVELOPMENT HUD", 158, 29);
      sctx.fillStyle = "#10b981";
      sctx.fillText("\u25CF 60.0 FPS", 762, 29);
      sctx.fillStyle = "#5b7186";
      sctx.fillText("OLED 960x544", 848, 29);

      if (p) {
        // Title
        sctx.fillStyle = "#ffffff";
        sctx.font = "bold 42px " + MONO;
        let title = p.game_title || p.display_name || "PS VITA PORT";
        if (title.length > 30) {
          sctx.font = "bold 34px " + MONO;
        }
        sctx.fillText(title, 26, 116);

        // Port line
        if (p.display_name && p.display_name !== p.game_title) {
          sctx.font = "17px " + MONO;
          sctx.fillStyle = "#48b6d8";
          sctx.fillText("PORT  " + p.display_name, 28, 148);
        }

        // Stage chip
        sctx.fillStyle = accent;
        sctx.fillRect(26, 166, 8, 30);
        sctx.font = "bold 20px " + MONO;
        sctx.fillStyle = "#04070c";
        const chipW = sctx.measureText(meta.label).width + 34;
        sctx.fillStyle = accent;
        sctx.fillRect(34, 166, chipW, 30);
        sctx.fillStyle = "#04070c";
        sctx.fillText(meta.label, 51, 188);

        sctx.font = "13px " + MONO;
        sctx.fillStyle = "#5b7186";
        sctx.fillText("NO FABRICATED PERCENTAGES - DISCRETE STAGES ONLY", 34 + chipW + 16, 187);

        // Notes
        sctx.font = "16px " + MONO;
        sctx.fillStyle = "#7fe3ff";
        sctx.fillText("PERFORMANCE", 26, 240);
        sctx.fillStyle = "#cfdae6";
        sctx.font = "16px " + MONO;
        let y = wrapText(sctx, p.performance_notes || "No verified performance report logged yet.", 26, 264, 900, 21, 2);

        sctx.fillStyle = "#7fe3ff";
        sctx.fillText("PLAYABILITY", 26, y + 26);
        sctx.fillStyle = "#cfdae6";
        y = wrapText(sctx, p.playability_notes || "No verified playability report logged yet.", 26, y + 50, 900, 21, 2);

        sctx.fillStyle = "#7fe3ff";
        sctx.fillText("ENGINE", 26, y + 26);
        sctx.fillStyle = "#93a9bd";
        const techs = p.technologies && p.technologies.length > 0 ? p.technologies.join("  /  ") : "Not yet classified";
        sctx.fillText(techs, 118, y + 26);
      } else {
        sctx.fillStyle = "#ffffff";
        sctx.font = "bold 40px " + MONO;
        sctx.fillText("PORT INTAKE STANDBY", 26, 150);
        sctx.fillStyle = "#48b6d8";
        sctx.font = "17px " + MONO;
        sctx.fillText("Select a row in the ledger below to load its record.", 28, 186);
      }

      // Stage rail
      const railY = 452;
      const railW = 908;
      const cellW = railW / STAGE_RAIL.length;
      const idx = STAGE_RAIL.indexOf(stage);
      sctx.font = "11px " + MONO;
      STAGE_RAIL.forEach((s, i) => {
        const x = 26 + i * cellW;
        const m = STAGE_META[s];
        const done = idx >= 0 && i < idx;
        const current = idx === i;
        if (current) {
          sctx.fillStyle = m.color;
          sctx.fillRect(x, railY, cellW - 6, 26);
          sctx.fillStyle = "#04070c";
        } else if (done) {
          sctx.fillStyle = "rgba(255,255,255,0.14)";
          sctx.fillRect(x, railY, cellW - 6, 26);
          sctx.fillStyle = "#94a3b8";
        } else {
          sctx.strokeStyle = "rgba(120,140,160,0.35)";
          sctx.lineWidth = 1;
          sctx.strokeRect(x + 0.5, railY + 0.5, cellW - 7, 25);
          sctx.fillStyle = "#3d4d5e";
        }
        sctx.fillText(m.label, x + 8, railY + 17);
      });

      // Footer
      sctx.fillStyle = "#070c13";
      sctx.fillRect(0, 500, 960, 44);
      sctx.font = "12px " + MONO;
      sctx.fillStyle = "#4d6377";
      sctx.fillText("CORTEX-A9  /  SGX543MP4+  /  vitaGL  /  NO ROMS HOSTED", 26, 527);
      sctx.fillStyle = "#4d6377";
      sctx.fillText("VITAHARBOR.VERCEL.APP", 776, 527);
    }

    // ---------- Post processing ----------
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(
      new THREE.Vector2(width * 0.5, height * 0.5),
      0.62,
      0.55,
      0.72
    );
    composer.addPass(bloom);
    composer.addPass(new OutputPass());
    composer.setSize(width, height);

    // ---------- Interaction ----------
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
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      composer.setSize(w, h);
      bloom.setSize(w * 0.5, h * 0.5);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(container);

    // ---------- Loop ----------
    let raf = 0;
    let lastFps = performance.now();
    let frames = 0;
    let lastStage = "";
    let glow = 0.34;
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
      screenLight.color.set(meta.color);
      haloMat.color.set(meta.color);

      if (!reduceMotion) {
        const idleYaw = Math.sin(t * 0.32) * 0.2;
        vita.rotation.y += (idleYaw + pointerX * 0.34 - vita.rotation.y) * 0.06;
        vita.rotation.x += (-0.02 + pointerY * 0.14 - vita.rotation.x) * 0.06;
        vita.position.y = Math.sin(t * 1.1) * 0.055;
        halo.position.z = 0.08 + Math.sin(t * 1.6) * 0.005;
        glow = 0.3 + Math.sin(t * 1.6) * 0.06;
        haloMat.opacity = glow;
        rimLight.intensity = 2.2 + Math.sin(t * 0.9) * 0.35;
      } else {
        vita.rotation.y = 0.16;
        vita.rotation.x = -0.02;
        vita.position.y = 0;
      }

      composer.render();

      frames++;
      const now = performance.now();
      if (now - lastFps >= 1000) {
        setHud({ fps: frames, tris: renderer.info.render.triangles });
        frames = 0;
        lastFps = now;
      }
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
      className="relative h-[340px] w-full overflow-hidden bg-[#04070d] sm:h-[440px] lg:h-[560px]"
    >
      <div className="pointer-events-none absolute inset-0 z-10">
        <div className="absolute top-3 left-4 flex items-center gap-2 font-mono text-[10px] text-[#4d6377]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#00d5ff]" />
          <span className="font-bold tracking-wider text-[#7fe3ff]">LIVE 3D DEVICE</span>
        </div>
        <div className="absolute top-3 right-4 hidden items-center gap-3 font-mono text-[10px] text-[#4d6377] sm:flex">
          <span>WEBGL</span>
          <span className="text-[#1d2d3d]">|</span>
          <span className="text-[#10b981]">{hud.fps} FPS</span>
          <span className="text-[#1d2d3d]">|</span>
          <span>{hud.tris.toLocaleString("en-US")} TRIS</span>
        </div>
        <div className="absolute bottom-3 left-4 font-mono text-[9px] tracking-wider text-[#4d6377] uppercase">
          Move pointer to orbit · Select a ledger row to load its record onto the OLED
        </div>
      </div>
    </div>
  );
};

