import fs from 'fs';

async function check() {
  const res = await fetch('https://vitaharbor.vercel.app/');
  const html = await res.text();
  const entries = (html.match(/<li[^>]*id="entry-/g) || []).length;
  console.log("LIVE SITE - Entries found:", entries);
  console.log("LIVE SITE - Has CustomCursor string:", html.includes("CustomCursor"));
  console.log("LIVE SITE - Has vh-row string:", html.includes("vh-row"));
  
  if (fs.existsSync('dist/web/index.html')) {
    const local = fs.readFileSync('dist/web/index.html', 'utf8');
    console.log("LOCAL BUILD - Entries found:", (local.match(/<li[^>]*id="entry-/g) || []).length);
  }
}
check();

