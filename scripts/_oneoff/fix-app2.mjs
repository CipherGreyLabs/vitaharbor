import fs from 'fs';

// 1. Fix src/web/App.tsx
let appTsx = fs.readFileSync('src/web/App.tsx', 'utf8');
appTsx = "import { CustomCursor } from './components/ui/CustomCursor';\n" + appTsx;
appTsx = appTsx.replace(
  '<div className="min-h-screen bg-[#fbfbfd] text-[#1d1d1f]">',
  '<div className="min-h-screen bg-canvas text-ink">\n      <div className="vh-grain"></div>\n      <CustomCursor />'
);
fs.writeFileSync('src/web/App.tsx', appTsx);

// 2. Cleanup src/web/app/index.tsx
let indexTsx = fs.readFileSync('src/web/app/index.tsx', 'utf8');
indexTsx = indexTsx.replace("import { CustomCursor } from '../components/ui/CustomCursor';\r\n", '');
indexTsx = indexTsx.replace("import { CustomCursor } from '../components/ui/CustomCursor';\n", '');
fs.writeFileSync('src/web/app/index.tsx', indexTsx);

console.log("App components fixed");

