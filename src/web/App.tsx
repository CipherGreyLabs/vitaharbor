import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
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
  const { pathname } = useLocation();
  // The home stage runs edge to edge; every other route stays on the readable grid.
  const isFullBleed = pathname === "/";

  return (
    <div className="min-h-screen bg-[#08090a] text-[#f4f6f8] flex flex-col selection:bg-[#3ad2ff]/30 selection:text-[#f4f6f8]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#3ad2ff] focus:text-white focus:rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
      >
        Skip to content
      </a>
      <Navbar />
      <main
        id="main-content"
        className={
          isFullBleed
            ? "flex-1 w-full"
            : "flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10"
        }
      >
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
