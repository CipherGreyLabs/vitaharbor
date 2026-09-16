import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

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
  onSelectNext?: () => void;
  onSelectPrev?: () => void;
}

export const VitaConsoleScene: React.FC<VitaConsoleSceneProps> = ({
  selectedProject
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [rendererInfo, setRendererInfo] = useState({ fps: 60, drawCalls: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      38,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 7.2);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance"
      });
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.2;
      container.appendChild(renderer.domElement);
    } catch {
      // Graceful fallback for non-WebGL / test environments
      return;
    }

    // Group for Vita handheld console
    const vitaGroup = new THREE.Group();
    scene.add(vitaGroup);

    // 1. Handheld Main Body (Signature Vita ergonomic oval shape)
    const bodyShape = new THREE.Shape();
    const w = 4.2, h = 2.1, r = 0.95;
    bodyShape.moveTo(-w / 2 + r, -h / 2);
    bodyShape.lineTo(w / 2 - r, -h / 2);
    bodyShape.absarc(w / 2 - r, 0, r, -Math.PI / 2, Math.PI / 2, false);
    bodyShape.lineTo(-w / 2 + r, h / 2);
    bodyShape.absarc(-w / 2 + r, 0, r, Math.PI / 2, (3 * Math.PI) / 2, false);

    const extrudeSettings = {
      depth: 0.28,
      bevelEnabled: true,
      bevelSegments: 6,
      steps: 1,
      bevelSize: 0.08,
      bevelThickness: 0.08
    };

    const bodyGeometry = new THREE.ExtrudeGeometry(bodyShape, extrudeSettings);
    bodyGeometry.center();

    // High-end matte black composite chassis
    const bodyMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#080b10"),
      metalness: 0.4,
      roughness: 0.45,
      clearcoat: 0.3,
      clearcoatRoughness: 0.2
    });
    const bodyMesh = new THREE.Mesh(bodyGeometry, bodyMaterial);
    vitaGroup.add(bodyMesh);

    // 2. Beveled Metallic Silver Rim Accent (Signature Vita outer bezel)
    const rimGeometry = new THREE.RingGeometry(1.8, 2.05, 48);
    const rimMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#2a374a"),
      metalness: 0.9,
      roughness: 0.2
    });
    const rimLeft = new THREE.Mesh(rimGeometry, rimMaterial);
    rimLeft.position.set(-1.25, 0, 0.18);
    rimLeft.scale.set(0.9, 0.9, 1);
    const rimRight = rimLeft.clone();
    rimRight.position.set(1.25, 0, 0.18);
    vitaGroup.add(rimLeft, rimRight);

    // 3. Dynamic Interactive OLED Screen (Canvas Texture)
    const screenCanvas = document.createElement("canvas");
    screenCanvas.width = 960;
    screenCanvas.height = 544; // Exact PS Vita native resolution!
    const ctx = screenCanvas.getContext("2d")!;

    function renderScreenContent(project?: SelectedProjectView | null, time = 0) {
      ctx.fillStyle = "#040608";
      ctx.fillRect(0, 0, 960, 544);

      // CRT Scanlines & Grid texture
      ctx.strokeStyle = "rgba(0, 240, 255, 0.06)";
      ctx.lineWidth = 1;
      for (let y = 0; y < 544; y += 8) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(960, y);
        ctx.stroke();
      }

      // Animated Cyber Radar Sweep
      const radarX = (Math.sin(time * 1.5) * 0.5 + 0.5) * 960;
      const gradient = ctx.createLinearGradient(radarX - 100, 0, radarX + 100, 0);
      gradient.addColorStop(0, "rgba(0, 240, 255, 0)");
      gradient.addColorStop(0.5, "rgba(0, 240, 255, 0.12)");
      gradient.addColorStop(1, "rgba(0, 240, 255, 0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(radarX - 100, 0, 200, 544);

      // Top Status Bar
      ctx.fillStyle = "#090d13";
      ctx.fillRect(0, 0, 960, 48);
      ctx.fillStyle = "#00f0ff";
      ctx.font = "bold 16px 'JetBrains Mono', monospace";
      ctx.fillText("VITAHARBOR // DEV HUD", 24, 30);

      ctx.fillStyle = "#10b981";
      ctx.fillText("● 60.0 FPS", 720, 30);

      ctx.fillStyle = "#94a3b8";
      ctx.font = "14px 'JetBrains Mono', monospace";
      ctx.fillText("OLED 960x544", 840, 30);

      // Screen Center: Game Details
      if (project) {
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 38px 'Inter', sans-serif";
        ctx.fillText(project.game_title || "PS Vita Port Project", 60, 160);

        if (project.display_name && project.display_name !== project.game_title) {
          ctx.fillStyle = "#00b4d8";
          ctx.font = "20px 'JetBrains Mono', monospace";
          ctx.fillText("PORT: " + project.display_name, 60, 200);
        }

        // Status Tag Box
        ctx.fillStyle = "#00f0ff";
        ctx.fillRect(60, 240, 160, 36);
        ctx.fillStyle = "#040608";
        ctx.font = "bold 16px 'JetBrains Mono', monospace";
        ctx.fillText("[ " + project.current_stage.toUpperCase() + " ]", 76, 264);

        // Performance / Playability details
        ctx.fillStyle = "#f1f5f9";
        ctx.font = "16px 'Inter', sans-serif";
        const perfText = project.performance_notes || "Stable framerate lock on Cortex-A9.";
        ctx.fillText("> PERFORMANCE: " + perfText, 60, 330);

        const playText = project.playability_notes || "Fully completable with native controls.";
        ctx.fillText("> PLAYABILITY: " + playText, 60, 370);

        // Tech specs
        if (project.technologies && project.technologies.length > 0) {
          ctx.fillStyle = "#00b4d8";
          ctx.font = "14px 'JetBrains Mono', monospace";
          ctx.fillText("> SHADER/ENGINE: " + project.technologies.join(" · "), 60, 420);
        }
      } else {
        ctx.fillStyle = "#f1f5f9";
        ctx.font = "bold 34px 'Inter', sans-serif";
        ctx.fillText("PlayStation Vita Port Registry", 60, 220);
        ctx.fillStyle = "#00f0ff";
        ctx.font = "18px 'JetBrains Mono', monospace";
        ctx.fillText("Select any game below to inspect live shaders & benchmarks", 60, 270);
      }

      // Bottom footer inside OLED
      ctx.fillStyle = "rgba(100, 116, 139, 0.4)";
      ctx.fillRect(0, 496, 960, 48);
      ctx.fillStyle = "#94a3b8";
      ctx.font = "12px 'JetBrains Mono', monospace";
      ctx.fillText("HARDWARE EMULATION // CORTEX-A9 // SGX543MP4+ // vitaGL", 24, 524);
    }

    renderScreenContent(selectedProject, 0);

    const screenTexture = new THREE.CanvasTexture(screenCanvas);
    screenTexture.minFilter = THREE.LinearFilter;
    screenTexture.magFilter = THREE.LinearFilter;

    const screenGeometry = new THREE.PlaneGeometry(2.6, 1.48);
    const screenMaterial = new THREE.MeshPhysicalMaterial({
      map: screenTexture,
      emissive: new THREE.Color("#000000"),
      emissiveMap: screenTexture,
      emissiveIntensity: 0.85,
      roughness: 0.1,
      metalness: 0.2,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05
    });
    const screenMesh = new THREE.Mesh(screenGeometry, screenMaterial);
    screenMesh.position.set(0, 0, 0.17);
    vitaGroup.add(screenMesh);

    // 4. Dual Analog Thumbsticks
    function createStick(x: number, y: number) {
      const stickGroup = new THREE.Group();

      // Base ring
      const baseGeom = new THREE.CylinderGeometry(0.24, 0.26, 0.08, 32);
      const baseMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color("#131923"),
        metalness: 0.5,
        roughness: 0.6
      });
      const base = new THREE.Mesh(baseGeom, baseMat);
      base.rotation.x = Math.PI / 2;
      stickGroup.add(base);

      // Rubber Cap
      const capGeom = new THREE.CylinderGeometry(0.22, 0.2, 0.06, 32);
      const capMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color("#090d14"),
        roughness: 0.8
      });
      const cap = new THREE.Mesh(capGeom, capMat);
      cap.rotation.x = Math.PI / 2;
      cap.position.z = 0.06;
      stickGroup.add(cap);

      stickGroup.position.set(x, y, 0.16);
      return stickGroup;
    }

    const leftStick = createStick(-1.58, -0.42);
    const rightStick = createStick(1.58, -0.42);
    vitaGroup.add(leftStick, rightStick);

    // 5. Directional Pad (Left)
    function createDpad() {
      const dpadGroup = new THREE.Group();
      const crossGeom = new THREE.BoxGeometry(0.48, 0.16, 0.08);
      const crossMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color("#161d28"),
        metalness: 0.2,
        roughness: 0.5
      });
      const hBar = new THREE.Mesh(crossGeom, crossMat);
      const vBar = hBar.clone();
      vBar.rotation.z = Math.PI / 2;
      dpadGroup.add(hBar, vBar);
      dpadGroup.position.set(-1.58, 0.36, 0.16);
      return dpadGroup;
    }
    vitaGroup.add(createDpad());

    // 6. Action Buttons (Square, Triangle, Circle, Cross on Right)
    function createActionButtons() {
      const btnGroup = new THREE.Group();
      const btnGeom = new THREE.CylinderGeometry(0.085, 0.085, 0.08, 24);
      const btnMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color("#161d28"),
        metalness: 0.3,
        roughness: 0.4
      });

      const positions = [
        [0, 0.2], // Triangle
        [0.2, 0], // Circle
        [0, -0.2], // Cross
        [-0.2, 0] // Square
      ];

      positions.forEach(([bx, by]) => {
        const btn = new THREE.Mesh(btnGeom, btnMat);
        btn.rotation.x = Math.PI / 2;
        btn.position.set(bx, by, 0);
        btnGroup.add(btn);
      });

      btnGroup.position.set(1.58, 0.36, 0.16);
      return btnGroup;
    }
    vitaGroup.add(createActionButtons());

    // 7. Glowing PS Button (Bottom Left)
    const psBtnGeom = new THREE.CylinderGeometry(0.09, 0.09, 0.04, 24);
    const psBtnMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#00f0ff"),
      emissive: new THREE.Color("#00f0ff"),
      emissiveIntensity: 0.6,
      roughness: 0.2
    });
    const psBtn = new THREE.Mesh(psBtnGeom, psBtnMat);
    psBtn.rotation.x = Math.PI / 2;
    psBtn.position.set(-1.75, -0.85, 0.14);
    vitaGroup.add(psBtn);

    // 8. 3D Floating Particle Nebula
    const particleCount = 180;
    const particleGeom = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 12;
      particlePositions[i + 1] = (Math.random() - 0.5) * 8;
      particlePositions[i + 2] = (Math.random() - 0.5) * 6 - 2;
    }
    particleGeom.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: new THREE.Color("#00f0ff"),
      size: 0.04,
      transparent: true,
      opacity: 0.4
    });
    const particleSystem = new THREE.Points(particleGeom, particleMat);
    scene.add(particleSystem);

    // 9. Cinematic Studio Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0x00f0ff, 2.8);
    keyLight.position.set(-4, 3, 5);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x0055ff, 1.8);
    fillLight.position.set(4, -2, 4);
    scene.add(fillLight);

    const topLight = new THREE.PointLight(0xffffff, 1.5, 10);
    topLight.position.set(0, 4, 3);
    scene.add(topLight);

    // 10. Mouse Interaction & Tilt Physics
    let targetRotX = 0;
    let targetRotY = 0;
    let targetPosZ = 0;

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      targetRotY = nx * 0.35;
      targetRotX = -ny * 0.25;
      targetPosZ = Math.abs(nx) * 0.2;
    };

    window.addEventListener("mousemove", onMouseMove);

    const onResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", onResize);

    // Render Loop
    let animationFrameId: number;
    let frameCount = 0;
    let lastFpsUpdate = performance.now();

    const animate = (time: number) => {
      animationFrameId = requestAnimationFrame(animate);
      const seconds = time * 0.001;

      // Spring damping rotation
      vitaGroup.rotation.y += (targetRotY - vitaGroup.rotation.y) * 0.07;
      vitaGroup.rotation.x += (targetRotX - vitaGroup.rotation.x) * 0.07;
      vitaGroup.position.z += (targetPosZ - vitaGroup.position.z) * 0.07;

      // Subtle levitation float
      vitaGroup.position.y = Math.sin(seconds * 1.2) * 0.08;

      // Rotate particles slowly
      particleSystem.rotation.y = seconds * 0.03;

      // Update dynamic OLED canvas screen
      renderScreenContent(selectedProject, seconds);
      screenTexture.needsUpdate = true;

      // Performance stats
      frameCount++;
      if (time - lastFpsUpdate >= 1000) {
        setRendererInfo({
          fps: frameCount,
          drawCalls: renderer.info.render.calls
        });
        frameCount = 0;
        lastFpsUpdate = time;
      }

      renderer.render(scene, camera);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      bodyGeometry.dispose();
      bodyMaterial.dispose();
      screenTexture.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [selectedProject]);

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative w-full h-[400px] sm:h-[460px] overflow-hidden bg-[#040608] border-b border-[#1a2332]"
      style={{ cursor: isHovered ? "grab" : "default" }}
    >
      {/* Precision WebGL HUD Overlay (Awwwards Style) */}
      <div className="absolute top-3 left-4 z-10 flex items-center gap-2 font-mono text-[10px] text-[#64748b]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff] animate-ping" />
        <span className="text-[#00f0ff] font-bold tracking-wider">
          REAL-TIME 3D VIEWPORT // PS VITA SYSTEM
        </span>
        <span className="text-[#29374e]">|</span>
        <span>INTERACTIVE PARALLAX TILT</span>
      </div>

      <div className="absolute top-3 right-4 z-10 hidden sm:flex items-center gap-3 font-mono text-[10px] text-[#64748b]">
        <span>WEBGL 2.0</span>
        <span className="text-[#29374e]">|</span>
        <span className="text-[#10b981]">{rendererInfo.fps} FPS</span>
        <span className="text-[#29374e]">|</span>
        <span>CORTEX-A9 444MHz</span>
      </div>

      {/* Floating control hint */}
      <div className="absolute bottom-3 left-4 z-10 font-mono text-[9px] text-[#64748b] tracking-wider uppercase">
        Move cursor to tilt console · Select any port in ledger below to load into OLED display
      </div>
    </div>
  );
};
