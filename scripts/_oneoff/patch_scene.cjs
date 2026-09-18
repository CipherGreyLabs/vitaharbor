const fs = require('fs');
let c = fs.readFileSync('src/web/components/3d/VitaConsoleScene.tsx', 'utf8').replace(/\r\n/g, '\n');

c = c.replace('onConsoleClick?: () => void;', 'onConsoleClick?: () => void;\n  onNavigate?: (direction:  prev | next) => void;');
c = c.replace('onConsoleClick\n}) => {', 'onConsoleClick,\n  onNavigate\n}) => {');
c = c.replace('selected.current = selectedProject;', 'selected.current = selectedProject;\n  const navigateRef = useRef(onNavigate);\n  navigateRef.current = onNavigate;');
c = c.replace('function registerPress(mesh: THREE.Mesh, travel: number) {', 'function registerPress(mesh: THREE.Mesh, travel: number, id?: string) {\n      mesh.userData.controlId = id;');
c = c.replace('registerPress(top, 0.45);', 'registerPress(top, 0.45, sign === -1 ? L : R);');
c = c.replace('registerPress(key, 0.4);', 'registerPress(key, 0.4, [up, left, down, right][i]);');

const haptic = [
  '    const playHapticClick = () => {',
  '      try {',
  '        const AudioCtx = window.AudioContext || window.webkitAudioContext;',
  '        if (!AudioCtx) return;',
  '        const ctx = new AudioCtx();',
  '        const osc = ctx.createOscillator();',
  '        const gain = ctx.createGain();',
  '        osc.type = sine;',
  '        osc.frequency.setValueAtTime(420, ctx.currentTime);',
  '        osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.035);',
  '        gain.gain.setValueAtTime(0.035, ctx.currentTime);',
  '        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.035);',
  '        osc.connect(gain);',
  '        gain.connect(ctx.destination);',
  '        osc.start();',
  '        osc.stop(ctx.currentTime + 0.04);',
  '      } catch {}',
  '    };'
].join('\n');

c = c.replace('let pressedBaseZ = 0;', 'let pressedBaseZ = 0;\n' + haptic);
c = c.replace('pressedButton.position.z = pressedBaseZ - travel;', 'pressedButton.position.z = pressedBaseZ - travel;\n        playHapticClick();\n        const cid = pressedButton.userData.controlId;\n        if (cid === L || cid === left || cid === up) {\n          navigateRef.current?.(prev);\n        } else if (cid === R || cid === right || cid === down) {\n          navigateRef.current?.(next);\n        }');

fs.writeFileSync('src/web/components/3d/VitaConsoleScene.tsx', c);
console.log('SUCCESSFULLY_UPDATED_CONSOLE_SCENE');
