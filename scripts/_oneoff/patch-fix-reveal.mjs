import fs from 'fs';

// --- 1. Fix Filter Buttons in DirectoryTable.tsx ---
let dt = fs.readFileSync('src/web/components/ledger/DirectoryTable.tsx', 'utf8');

const regexFilterBtn = /<button\s*key=\{filter\.key\}\s*type="button"\s*aria-pressed=\{activeFilter === filter\.key\}\s*onClick=\{\(\) => onFilterChange\(filter\.key\)\}\s*>\s*\{filter\.label\}\s*<\/button>/g;

dt = dt.replace(regexFilterBtn, <div key={filter.key} className="relative group">
                <button
                  type="button"
                  aria-pressed={activeFilter === filter.key}
                  onClick={() => onFilterChange(filter.key)}
                  className={"relative z-10 rounded-full px-4 py-1.5 text-caption font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20 " + (activeFilter === filter.key ? "text-ink text-shadow-glow" : "text-ink-muted hover:text-ink")}
                >
                  {filter.label}
                </button>
                {activeFilter === filter.key && (
                  <div className="filter-active-bg transition-all duration-300" style={{boxShadow: "0 0 15px rgba(0, 210, 255, 0.2)"}}></div>
                )}
              </div>);
fs.writeFileSync('src/web/components/ledger/DirectoryTable.tsx', dt);


// --- 2. Disable potentially blocking data-reveal on the directory section ---
let home = fs.readFileSync('src/web/routes/HomePage.tsx', 'utf8');
// remove data-reveal from Directory
home = home.replace('ref={directoryReveal}', '');
home = home.replace('<section id="directory"', '<section id="directory" className="vh-rise"'); // force it to rise directly without scroll observing
fs.writeFileSync('src/web/routes/HomePage.tsx', home);

