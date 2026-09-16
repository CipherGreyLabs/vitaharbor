import React, { useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { Search, Menu, X, Cpu } from "lucide-react";

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/projects?search=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm("");
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#090c11]/90 backdrop-blur-md border-b border-[#202a38]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-[#151b24] border border-[#202a38] flex items-center justify-center group-hover:border-[#249cf4]/50 transition-colors">
              <Cpu className="w-4 h-4 text-[#249cf4]" />
            </div>
            <span className="text-lg font-bold tracking-tight text-[#edf5ff]">
              VitaPort<span className="text-[#249cf4]">Watch</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <NavLink
              to="/projects"
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${isActive ? "text-[#249cf4]" : "text-[#9aaabd] hover:text-[#edf5ff]"}`
              }
            >
              Projects
            </NavLink>
            <NavLink
              to="/developers"
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${isActive ? "text-[#249cf4]" : "text-[#9aaabd] hover:text-[#edf5ff]"}`
              }
            >
              Developers
            </NavLink>
            <NavLink
              to="/updates"
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${isActive ? "text-[#249cf4]" : "text-[#9aaabd] hover:text-[#edf5ff]"}`
              }
            >
              Updates Feed
            </NavLink>
          </nav>

          <div className="hidden sm:flex items-center">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search ports, games..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-48 lg:w-64 bg-[#0f141b] border border-[#202a38] rounded-md pl-9 pr-3 py-1.5 text-xs text-[#edf5ff] placeholder-[#68788c] focus:outline-none focus:border-[#249cf4] focus:ring-1 focus:ring-[#249cf4] transition-all"
              />
              <Search className="w-4 h-4 text-[#68788c] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </form>
          </div>

          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-[#9aaabd] hover:text-[#edf5ff] hover:bg-[#151b24] focus:outline-none"
              aria-label="Open menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0f141b] border-b border-[#202a38] px-4 pt-2 pb-4 space-y-3">
          <form onSubmit={handleSearchSubmit} className="relative mb-2">
            <input
              type="text"
              placeholder="Search ports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#151b24] border border-[#202a38] rounded-md pl-9 pr-3 py-2 text-sm text-[#edf5ff] placeholder-[#68788c] focus:outline-none focus:border-[#249cf4]"
            />
            <Search className="w-4 h-4 text-[#68788c] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </form>
          <div className="flex flex-col space-y-2">
            <Link
              to="/projects"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-md text-sm font-medium text-[#9aaabd] hover:text-[#edf5ff] hover:bg-[#151b24]"
            >
              Projects
            </Link>
            <Link
              to="/developers"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-md text-sm font-medium text-[#9aaabd] hover:text-[#edf5ff] hover:bg-[#151b24]"
            >
              Developers
            </Link>
            <Link
              to="/updates"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-md text-sm font-medium text-[#9aaabd] hover:text-[#edf5ff] hover:bg-[#151b24]"
            >
              Updates Feed
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

