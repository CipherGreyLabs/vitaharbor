import fs from 'fs';

function replaceClass(file, fromStr, toStr) {
  try {
    let content = fs.readFileSync(file, 'utf8');
    content = content.split(fromStr).join(toStr);
    fs.writeFileSync(file, content);
  } catch(e) {}
}

const files = [
  'src/web/routes/HomePage.tsx',
  'src/web/components/ledger/DirectoryTable.tsx',
  'src/web/components/ledger/ProjectPanel.tsx',
  'src/web/components/ledger/MethodologySection.tsx'
];

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  // General replacement of basic dark theme blocks with glass and premium effects
  content = content.replace(/bg-surface/g, 'vh-glass');
  content = content.replace(/border-hairline/g, 'border-hairline-strong/30');
  content = content.replace(/shadow-card/g, 'shadow-lift');
  fs.writeFileSync(f, content);
});

console.log("Components styling upgraded to glassmorphism");

