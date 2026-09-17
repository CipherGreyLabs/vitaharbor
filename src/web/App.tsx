import React from "react";
import { Routes, Route } from "react-router-dom";
import { HomePage } from "./routes/HomePage";

/**
 * The archive is a single coherent surface. Every path renders the same index so
 * legacy links such as /projects/<slug> resolve to the matching entry instead of
 * landing on an empty page.
 */
export default function App() {
  return (
    <div className="min-h-screen bg-[#fbfbfd] text-[#1d1d1f]">
      <Routes>
        <Route path="*" element={<HomePage />} />
      </Routes>
    </div>
  );
}

