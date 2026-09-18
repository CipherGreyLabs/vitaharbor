import fs from 'fs';

let content = fs.readFileSync('src/web/components/3d/VitaConsoleScene.tsx', 'utf8');

// 1. Interface
content = content.replace(
  '  onConsoleClick?: () => void;',
  '  onConsoleClick?: () => void;\n  onNavigate?: (direction: "prev" | "next") => void;'
);

// 2. Props
content = content.replace(
  '  onConsoleClick\r\n}) => {',
  '  onConsoleClick,\n  onNavigate\n}) => {'
).replace(
  '  onConsoleClick\n}) => {',
  '  onConsoleClick,\n  onNavigate\n}) => {'
);

// 3. navigateRef
content = content.replace(
  'selected.current = selectedProject;',
  'selected.current = selectedProject;\n  const navigateRef = useRef(onNavigate);\n  navigateRef.current = onNavigate;'
);

// 4. registerPress definition
content = content.replace(
  'function registerPress(mesh: THREE.Mesh, travel: number) {',
  'function registerPress(mesh: THREE.Mesh, travel: number, id?: string) {\n      mesh.userData.controlId = id;'
);

// 5. Shoulder registration
content = content.replace(
  'registerPress(top, 0.45);',
  'registerPress(top, 0.45, sign === -1 ? "L" : "R");'
);

// 6. Dpad registration
content = content.replace(
  'registerPress(key, 0.4);',
  'registerPress(key, 0.4, ["up", "left", "down", "right"][i]);'
);

// 7. Audio & Navigation trigger
const hapticFunc = 
    const playHapticClick = () => {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.035);
        gain.gain.setValueAtTime(0.035, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.035);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.04);
      } catch {}
    };
;

content = content.replace(
  'let pressedBaseZ = 0;',
  'let pressedBaseZ = 0;' + hapticFunc
);

content = content.replace(
  'pressedButton.position.z = pressedBaseZ - travel;',
  'pressedButton.position.z = pressedBaseZ - travel;\n        playHapticClick();\n        const cid = pressedButton.userData.controlId;\n        if (cid === "L" || cid === "left" || cid === "up") {\n          navigateRef.current?.("prev");\n        } else if (cid === "R" || cid === "right" || cid === "down") {\n          navigateRef.current?.("next");\n        }'
);

fs.writeFileSync('src/web/components/3d/VitaConsoleScene.tsx', content);
console.log("SUCCESSFULLY UPDATED VitaConsoleScene");

