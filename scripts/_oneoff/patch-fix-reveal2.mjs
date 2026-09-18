import fs from 'fs';

let dt = fs.readFileSync('src/web/components/ledger/DirectoryTable.tsx', 'utf8');

// The filters button regex
const regexFilterBtn = /<button\s*key=\{filter\.key\}\s*type="button"\s*aria-pressed=\{activeFilter === filter\.key\}\s*onClick=\{\(\) => onFilterChange\(filter\.key\)\}\s*>\s*\{filter\.label\}\s*<\/button>/g;

// Simple string replacement using a single line string to avoid any literal breakages
const newBtn = '<div key={filter.key} className="relative group"><button type="button" aria-pressed={activeFilter === filter.key} onClick={() => onFilterChange(filter.key)} className={"relative z-10 rounded-full px-4 py-1.5 text-caption font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20 " + (activeFilter === filter.key ? "text-ink text-shadow-glow" : "text-ink-muted hover:text-ink")}>{filter.label}</button>{activeFilter === filter.key && (<div className="filter-active-bg transition-all duration-300" style={{boxShadow: "0 0 15px rgba(0, 210, 255, 0.2)"}}></div>)}</div>';

dt = dt.replace(regexFilterBtn, newBtn);
fs.writeFileSync('src/web/components/ledger/DirectoryTable.tsx', dt);

let home = fs.readFileSync('src/web/routes/HomePage.tsx', 'utf8');
home = home.replace('ref={directoryReveal}', '');
home = home.replace('<section id="directory"', '<section id="directory" className="vh-rise"'); 
fs.writeFileSync('src/web/routes/HomePage.tsx', home);

