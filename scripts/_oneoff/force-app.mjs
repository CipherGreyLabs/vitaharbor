import fs from 'fs';
let app = fs.readFileSync('src/web/App.tsx', 'utf8');
app = app.replace("import { CustomCursor } from './components/ui/CustomCursor';\r\n", "");
app = app.replace("      <CustomCursor />\r\n", "");
fs.writeFileSync('src/web/App.tsx', app);

