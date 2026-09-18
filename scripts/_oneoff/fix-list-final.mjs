import fs from 'fs';

let dt = fs.readFileSync('src/web/components/ledger/DirectoryTable.tsx', 'utf8');

// Replace custom vh-row with a standard solid rendering class
dt = dt.replace(
  'className={"vh-row " + (selected ? "bg-sunken/60" : "")}',
  'className={"transition-all duration-300 " + (selected ? "bg-sunken/60" : "")}'
);

// Remove the potentially blocking animationDelay
dt = dt.replace(
  'style={{ animationDelay: Math.min(index, 14) * 22 + "ms" }}',
  ''
);

fs.writeFileSync('src/web/components/ledger/DirectoryTable.tsx', dt);

console.log("Replaced animation classes with foolproof Tailwind classes.");

