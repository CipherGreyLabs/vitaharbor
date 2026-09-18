
const fs = require('fs');

// 1. Rewrite App.tsx without custom cursor
const appTsx = 
import React from "react";
import { Routes, Route } from "react-router-dom";
import { HomePage } from "./routes/HomePage";

export default function App() {
  return (
    <div className="min-h-screen bg-canvas text-ink">
      <div className="vh-grain"></div>
      <Routes>
        <Route path="*" element={<HomePage />} />
      </Routes>
    </div>
  );
}
;
fs.writeFileSync('src/web/App.tsx', appTsx);

if (fs.existsSync('src/web/components/ui/CustomCursor.tsx')) {
  fs.unlinkSync('src/web/components/ui/CustomCursor.tsx');
}

// 2. Fix DirectoryTable conditional rendering issue safely
let dt = fs.readFileSync('src/web/components/ledger/DirectoryTable.tsx', 'utf8');

// Just remove the ternary operator and replace it with boolean conditionals
const topRegex = /\{loading \? \([\s\S]*?\) : visible\.length === 0 \? \([\s\S]*?\) : \(/;
if (topRegex.test(dt)) {
  dt = dt.replace(topRegex, 
    "{loading && (\n" +
          "<div className=\"divide-y divide-hairline\">\n" +
            "{[0, 1, 2, 3, 4].map((row) => (\n" +
              "<div key={row} className=\"flex items-center gap-4 px-5 py-5\">\n" +
                "<div className=\"vh-skeleton h-3 w-40 rounded-full bg-sunken\" />\n" +
                "<div className=\"vh-skeleton h-3 w-20 rounded-full bg-sunken\" />\n" +
                "<div className=\"vh-skeleton hidden h-3 flex-1 rounded-full bg-sunken md:block\" />\n" +
              "</div>\n" +
            "))}\n" +
          "</div>\n" +
        ")}\n" +
        "{!loading && visible.length === 0 && (\n" +
          "<div className=\"px-6 py-16 text-center\">\n" +
            "<p className=\"text-body text-ink-medium\">Nothing matches that search.</p>\n" +
            "<button\n" +
              " type=\"button\"\n" +
              " onClick={() => { onSearchChange(''); onFilterChange('all'); onCategoryChange('all'); }}\n" +
              " className=\"mt-3 text-body font-medium text-ink underline underline-offset-4\"\n" +
            ">\n" +
              "Reset filters\n" +
            "</button>\n" +
          "</div>\n" +
        ")}\n" +
        "{!loading && visible.length > 0 && ("
  );
}
fs.writeFileSync('src/web/components/ledger/DirectoryTable.tsx', dt);


