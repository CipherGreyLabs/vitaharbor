import React from "react";
import { Routes, Route } from "react-router-dom";
import { HomePage } from "./routes/HomePage";
import { ProjectsPage } from "./routes/ProjectsPage";
import { ProjectDetailPage } from "./routes/ProjectDetailPage";
import { DevelopersPage } from "./routes/DevelopersPage";
import { DeveloperDetailPage } from "./routes/DeveloperDetailPage";
import { UpdatesPage } from "./routes/UpdatesPage";
import { AboutPage } from "./routes/AboutPage";
import { AdminPage } from "./routes/AdminPage";
import { NotFoundPage } from "./routes/NotFoundPage";

export default function App() {
  return (
    <div className="min-h-screen bg-[#0d0e11] text-[#e4e5e9] flex flex-col antialiased">
      <main className="flex-1 w-full">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:slug" element={<ProjectDetailPage />} />
          <Route path="/developers" element={<DevelopersPage />} />
          <Route path="/developers/:slug" element={<DeveloperDetailPage />} />
          <Route path="/updates" element={<UpdatesPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </div>
  );
}
