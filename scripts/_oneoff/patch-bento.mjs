import fs from 'fs';
let content = fs.readFileSync('src/web/components/ledger/LedgerStats.tsx', 'utf8');

// Convert traditional stats row to an asymmetrical Bento Box
content = content.replace(
  '<div className="bg-deep px-5 py-6">',
  '<div className="vh-glass vh-interactive flex flex-col justify-between rounded-3xl px-6 py-6 transition-transform hover:-translate-y-1">'
);

content = content.replace(
  '<p className="vh-tnum mt-2 text-title font-semibold text-white">{shown}</p>',
  '<p className="vh-tnum mt-4 text-display font-display font-semibold text-transparent bg-clip-text bg-gradient-to-br from-white to-ink-muted">{shown}</p>'
);

content = content.replace(
  '<div\n        ref={ref}\n        className="grid grid-cols-2 divide-x divide-y divide-hairline border-y border-hairline bg-hairline md:grid-cols-4 md:divide-y-0"\n      >',
  '<div\n        ref={ref}\n        className="grid grid-cols-2 gap-4 md:grid-cols-4"\n      >'
);

fs.writeFileSync('src/web/components/ledger/LedgerStats.tsx', content);
console.log("LedgerStats bento update done");

