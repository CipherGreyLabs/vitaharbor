import fs from 'fs';

// 1. ANNIHILATE THE CUSTOM CURSOR FROM APP.TSX
const newAppTsx = import React from "react";
import { Routes, Route } from "react-router-dom";
import { HomePage } from "./routes/HomePage";

/**
 * The archive is a single coherent surface. Every path renders the same index so
 * legacy links such as /projects/<slug> resolve to the matching entry instead of
 * landing on an empty page.
 */
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
fs.writeFileSync('src/web/App.tsx', newAppTsx);

// 2. DELETE THE CUSTOM CURSOR FILE
if (fs.existsSync('src/web/components/ui/CustomCursor.tsx')) {
  fs.unlinkSync('src/web/components/ui/CustomCursor.tsx');
}

// 3. FIX DIRECTORY TABLE RENDERING
let dt = fs.readFileSync('src/web/components/ledger/DirectoryTable.tsx', 'utf8');

// I am going to remove the ternary isible.length === 0 ? ... : ... entirely to ensure the list Renders!
// We'll replace it with simple sequential logical rendering.
// Find the block: {loading ? (...) : visible.length === 0 ? (...) : ( <ul...> ... </ul> )}
// Let's just use string slicing to rebuild the render structure properly.

const topPartRegex = /\{loading \? \([\s\S]*?\) : visible\.length === 0 \? \([\s\S]*?\) : \(/;
if (topPartRegex.test(dt)) {
  dt = dt.replace(topPartRegex, 
    {loading && (
          <div className="divide-y divide-hairline">
            {[0, 1, 2, 3, 4].map((row) => (
              <div key={row} className="flex items-center gap-4 px-5 py-5">
                <div className="vh-skeleton h-3 w-40 rounded-full bg-sunken" />
                <div className="vh-skeleton h-3 w-20 rounded-full bg-sunken" />
                <div className="vh-skeleton hidden h-3 flex-1 rounded-full bg-sunken md:block" />
              </div>
            ))}
          </div>
        )}
        {!loading && visible.length === 0 && (
          <div className="px-6 py-16 text-center">
            <p className="text-body text-ink-medium">Nothing matches that search.</p>
            <button
              type="button"
              onClick={() => {
                onSearchChange("");
                onFilterChange("all");
                onCategoryChange("all");
              }}
              className="mt-3 text-body font-medium text-ink underline underline-offset-4"
            >
              Reset filters
            </button>
          </div>
        )}
        {!loading && visible.length > 0 && (
  );
}

// Make sure animation delays and custom classes are totally stripped from <li>
dt = dt.replace(
  /className=\{"transition-all duration-300 " \+ \(selected \? "bg-sunken\/60" : ""\)\}/g,
  'className={selected ? "bg-sunken/60" : ""}'
);

fs.writeFileSync('src/web/components/ledger/DirectoryTable.tsx', dt);
console.log("Forced structural rewrite completed.");

