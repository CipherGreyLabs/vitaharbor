import React, { useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { Search, Menu, X, Disc } from "lucide-react";

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
    <header className="sticky top-0 z-50 bg-[#090c11]/95 backdrop-blur-md border-b border-[#202a38]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Brand Logo with subtle Vita-like OLED accent */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 rounded-full bg-[#151b24] border border-[#202a38] flex items-center justify-center group-hover:border-[#249cf4]/70 transition-colors shadow-sm">
              <Disc className="w-3.5 h-3.5 text-[#249cf4]" />
            </div>
            <span className="text-sm font-bold tracking-wider uppercase text-[#edf5ff]">
              Vita<span className="text-[#249cf4]">Harbor</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `text-xs font-medium tracking-wide transition-colors ${
                  isActive ? "text-[#249cf4] font-semibold" : "text-[#9aaabd] hover:text-[#edf5ff]"
                }`
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/projects"
              className={({ isActive }) =>
                `text-xs font-medium tracking-wide transition-colors ${
                  isActive ? "text-[#249cf4] font-semibold" : "text-[#9aaabd] hover:text-[#edf5ff]"
                }`
              }
            >
              Projects
            </NavLink>
            <NavLink
              to="/developers"
              className={({ isActive }) =>
                `text-xs font-medium tracking-wide transition-colors ${
                  isActive ? "text-[#249cf4] font-semibold" : "text-[#9aaabd] hover:text-[#edf5ff]"
                }`
              }
            >
              Developers
            </NavLink>
            <NavLink
              to="/updates"
              className={({ isActive }) =>
                `text-xs font-medium tracking-wide transition-colors ${
                  isActive ? "text-[#249cf4] font-semibold" : "text-[#9aaabd] hover:text-[#edf5ff]"
                }`
              }
            >
              Updates
            </NavLink>
            <NavLink
              to="/about"
              className={({ isActive }) =>
                `text-xs font-medium tracking-wide transition-colors ${
                  isActive ? "text-[#249cf4] font-semibold" : "text-[#9aaabd] hover:text-[#edf5ff]"
                }`
              }
            >
              About
            </NavLink>
          </nav>

          {/* Search bar */}
          <div className="hidden sm:flex items-center">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search ports, devs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-48 lg:w-60 bg-[#0f141b] border border-[#202a38] rounded-full pl-8 pr-3 py-1 text-xs text-[#edf5ff] placeholder-[#68788c] focus:outline-none focus:border-[#249cf4] transition-all"
              />
              <Search className="w-3.5 h-3.5 text-[#68788c] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </form>
          </div>

          {/* Mobile menu toggle */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded text-[#9aaabd] hover:text-[#edf5ff] hover:bg-[#151b24] focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0f141b] border-b border-[#202a38] px-4 pt-2 pb-4 space-y-2">
          <form onSubmit={handleSearchSubmit} className="relative mb-2">
            <input
              type="text"
              placeholder="Search ports or games..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#151b24] border border-[#202a38] rounded-full pl-8 pr-3 py-1.5 text-xs text-[#edf5ff] placeholder-[#68788c] focus:outline-none focus:border-[#249cf4]"
            />
            <Search className="w-3.5 h-3.5 text-[#68788c] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </form>
          <div className="flex flex-col space-y-1">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-1.5 rounded text-xs font-medium text-[#9aaabd] hover:text-[#edf5ff] hover:bg-[#151b24]"
            >
              Home
            </Link>
            <Link
              to="/projects"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-1.5 rounded text-xs font-medium text-[#9aaabd] hover:text-[#edf5ff] hover:bg-[#151b24]"
            >
              Projects
            </Link>
            <Link
              to="/developers"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-1.5 rounded text-xs font-medium text-[#9aaabd] hover:text-[#edf5ff] hover:bg-[#151b24]"
            >
              Developers
            </Link>
            <Link
              to="/updates"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-1.5 rounded text-xs font-medium text-[#9aaabd] hover:text-[#edf5ff] hover:bg-[#151b24]"
            >
              Updates
            </Link>
            <Link
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-1.5 rounded text-xs font-medium text-[#9aaabd] hover:text-[#edf5ff] hover:bg-[#151b24]"
            >
              About
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

