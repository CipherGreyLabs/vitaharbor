import fs from 'fs';
import path from 'path';

// Destroy Vite cache
const cacheDir = path.join('node_modules', '.vite');
if (fs.existsSync(cacheDir)) {
  fs.rmSync(cacheDir, { recursive: true, force: true });
  console.log("Vite cache destroyed.");
} else {
  console.log("No Vite cache found.");
}

