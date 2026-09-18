import fs from 'fs';
let css = fs.readFileSync('src/web/styles/index.css', 'utf8');

// The error is at the very end of the file or around line 162. Let's just fix the end of the file.
css = css.replace(/\}\s*\}\s*$/g, '}');
fs.writeFileSync('src/web/styles/index.css', css);

