import React from "react";
import { Routes, Route } from "react-router-dom";
import { Navbar } from "./components/layout/Navbar";
import { Footer } from "./components/layout/Footer";
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
    <div className="min-h-screen bg-[#090c11] text-[#edf5ff] flex flex-col selection:bg-[#249cf4]/30 selection:text-[#edf5ff]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#249cf4] focus:text-white focus:rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
      >
        Skip to content
      </a>
      <Navbar />
      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
      <Footer />
    </div>
  );
}
