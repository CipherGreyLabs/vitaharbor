import fs from 'fs';

let content = fs.readFileSync('src/web/components/3d/VitaConsoleScene.tsx', 'utf8');

content = content.replace(
  'export interface VitaConsoleSceneProps {\r\n  selectedProject?: SelectedProjectView | null;\r\n  align?: "center" | "split";\r\n  onConsoleClick?: () => void;\r\n}',
  'export interface VitaConsoleSceneProps {\r\n  selectedProject?: SelectedProjectView | null;\r\n  align?: "center" | "split";\r\n  onConsoleClick?: () => void;\r\n  onNavigate?: (direction: "prev" | "next") => void;\r\n}'
);
if (!content.includes('onNavigate?: (direction')) {
  content = content.replace(
    'export interface VitaConsoleSceneProps {\n  selectedProject?: SelectedProjectView | null;\n  align?: "center" | "split";\n  onConsoleClick?: () => void;\n}',
    'export interface VitaConsoleSceneProps {\n  selectedProject?: SelectedProjectView | null;\n  align?: "center" | "split";\n  onConsoleClick?: () => void;\n  onNavigate?: (direction: "prev" | "next") => void;\n}'
  );
}

content = content.replace(
  'export const VitaConsoleScene: React.FC<VitaConsoleSceneProps> = ({\r\n  selectedProject,\r\n  align = "center",\r\n  onConsoleClick\r\n}) => {',
  'export const VitaConsoleScene: React.FC<VitaConsoleSceneProps> = ({\r\n  selectedProject,\r\n  align = "center",\r\n  onConsoleClick,\r\n  onNavigate\r\n}) => {'
);
if (!content.includes('onNavigate\n}) => {')) {
  content = content.replace(
    'export const VitaConsoleScene: React.FC<VitaConsoleSceneProps> = ({\n  selectedProject,\n  align = "center",\n  onConsoleClick\n}) => {',
    'export const VitaConsoleScene: React.FC<VitaConsoleSceneProps> = ({\n  selectedProject,\n  align = "center",\n  onConsoleClick,\n  onNavigate\n}) => {'
  );
}

if (!content.includes('const navigateRef = useRef(onNavigate);')) {
  content = content.replace(
    'selected.current = selectedProject;',
    'selected.current = selectedProject;\n  const navigateRef = useRef(onNavigate);\n  navigateRef.current = onNavigate;'
  );
}

content = content.replace(
  'function registerPress(mesh: THREE.Mesh, travel: number) {',
  'function registerPress(mesh: THREE.Mesh, travel: number, id?: string) {\n      mesh.userData.controlId = id;'
);

content = content.replace(
  'const top = traced(shoulder, 2.2, 5.7, silver, 0.25);\n      top.scale.x = sign;\n      registerPress(top, 0.45);',
  'const top = traced(shoulder, 2.2, 5.7, silver, 0.25);\n      top.scale.x = sign;\n      registerPress(top, 0.45, sign === -1 ? "L" : "R");'
);
if (!content.includes('sign === -1 ? "L" : "R"')) {
  content = content.replace(
    'const top = traced(shoulder, 2.2, 5.7, silver, 0.25);\r\n      top.scale.x = sign;\r\n      registerPress(top, 0.45);',
    'const top = traced(shoulder, 2.2, 5.7, silver, 0.25);\r\n      top.scale.x = sign;\r\n      registerPress(top, 0.45, sign === -1 ? "L" : "R");'
  );
}

content = content.replace(
  'key.position.y = 13.3;\n      registerPress(key, 0.4);',
  'key.position.y = 13.3;\n      registerPress(key, 0.4, ["up", "left", "down", "right"][i]);'
);
if (!content.includes('["up", "left", "down", "right"][i]')) {
  content = content.replace(
    'key.position.y = 13.3;\r\n      registerPress(key, 0.4);',
    'key.position.y = 13.3;\r\n      registerPress(key, 0.4, ["up", "left", "down", "right"][i]);'
  );
}

const audioAndNavCode = 
    const playHapticClick = () => {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(420, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.035);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.035);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.04);
      } catch {}
    };
;

if (!content.includes('playHapticClick')) {
  content = content.replace('let pressedButton: THREE.Mesh | null = null;', audioAndNavCode + '\n    let pressedButton: THREE.Mesh | null = null;');
}

if (!content.includes('playHapticClick();')) {
  content = content.replace(
    'pressedButton.position.z = pressedBaseZ - travel;',
    'pressedButton.position.z = pressedBaseZ - travel;\n        playHapticClick();\n        const cid = pressedButton.userData.controlId;\n        if (cid === "L" || cid === "left" || cid === "up") {\n          navigateRef.current?.("prev");\n        } else if (cid === "R" || cid === "right" || cid === "down") {\n          navigateRef.current?.("next");\n        }'
  );
}

fs.writeFileSync('src/web/components/3d/VitaConsoleScene.tsx', content);
console.log("VitaConsoleScene navigation + haptics updated");

