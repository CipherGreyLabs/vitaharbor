import React from "react";
import { Routes, Route } from "react-router-dom";
import { HomePage } from "./routes/HomePage";
import { ProjectDetailPage } from "./routes/ProjectDetailPage";
import { UpdatesPage } from "./routes/UpdatesPage";
import { DiscoveryPage } from "./routes/DiscoveryPage";

/** Public routes are real pages so deep links can carry their own metadata. */
export default function App() {
  return (
    <div className="min-h-screen bg-canvas text-ink">
      <div className="vh-grain"></div>
      <Routes>
        <Route path="/projects/:slug" element={<ProjectDetailPage />} />
        <Route path="/updates" element={<UpdatesPage />} />
        <Route path="/discovery" element={<DiscoveryPage />} />
        <Route path="*" element={<HomePage />} />
      </Routes>
    </div>
  );
}
