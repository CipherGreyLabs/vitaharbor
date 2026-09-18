import fs from 'fs';

// Safely modify tailwind config
let tw = fs.readFileSync('tailwind.config.js', 'utf8');
if (!tw.includes("display: ['\"Space Grotesk\"', 'sans-serif']")) {
  // Use simple split-join to avoid regex escape hell
  tw = tw.split("sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],").join("sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],\n        display: ['\"Space Grotesk\"', 'sans-serif'],");
  fs.writeFileSync('tailwind.config.js', tw);
}

// Add the boot sequence class to the Hero text
let home = fs.readFileSync('src/web/routes/HomePage.tsx', 'utf8');
if (!home.includes('vh-boot')) {
  home = home.split('<main id="main-content">').join('<main id="main-content" className="vh-boot">');
}

// Implement smooth scroll since lenis npm install had some issues, we'll use CSS smooth scroll behavior 
// + custom easing if they use a mouse, or we can use native smooth scroll. 
// We already have "scroll-behavior: smooth;" in the CSS.

fs.writeFileSync('src/web/routes/HomePage.tsx', home);

console.log("Stage 3 success");

