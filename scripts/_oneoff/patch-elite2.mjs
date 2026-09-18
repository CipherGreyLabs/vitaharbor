import fs from 'fs';

let tableCode = fs.readFileSync('src/web/components/ledger/DirectoryTable.tsx', 'utf8');

// 1. Wrap the list of rows in a keyed div so changing filters re-triggers the stagger animation
tableCode = tableCode.replace(
  '{visible.length > 0 ? (',
  '<div key={activeFilter + activeCategory + activeSort + searchTerm} className="contents">\n        {visible.length > 0 ? ('
);
tableCode = tableCode.replace(
  '          </div>\n        ) : visible.length === 0 ? (',
  '          </div>\n        </div>\n        ) : visible.length === 0 ? ('
);

// 2. Enhance the filter chips
// Find the old map for filters
tableCode = tableCode.replace(
  /(<button[^>]+onClick={() => onFilterChange(filter.key)}[^>]+>)\s*{filter.label}\s*<\/button>/g,
  '<div className="relative group"><button type="button" onClick={() => onFilterChange(filter.key)} className={"relative z-10 rounded-full px-4 py-1.5 text-caption font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20 " + (activeFilter === filter.key ? "text-ink text-shadow-glow" : "text-ink-muted hover:text-ink")}>{filter.label}</button>{activeFilter === filter.key && <div className="filter-active-bg transition-all duration-300" style={{boxShadow: "0 0 15px rgba(0, 210, 255, 0.2)"}}></div>}</div>'
);

// 3. Remove the old className logic for those buttons to avoid conflicts
tableCode = tableCode.replace(
  /className=\{[^}]*\(activeFilter === filter\.key[^}]*\}\s*>/g,
  '>'
);

fs.writeFileSync('src/web/components/ledger/DirectoryTable.tsx', tableCode);
console.log("Table animations applied.");

