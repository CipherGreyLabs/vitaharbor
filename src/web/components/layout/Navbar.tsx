import React, { useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { Search, Menu, X } from "lucide-react";

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
    <header className="sticky top-0 z-50 bg-[#040608]/95 backdrop-blur-md border-b border-[#1a2332]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-5 h-5 rounded-[2px] bg-[#090d13] border border-[#1a2332] flex items-center justify-center group-hover:border-[#00f0ff] transition-colors">
              <span className="w-2 h-2 rounded-full bg-[#00f0ff]" />
            </div>
            <span className="font-mono text-xs font-bold tracking-widest uppercase text-[#f1f5f9]">
              Vita<span className="text-[#00f0ff]">Harbor</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 font-mono text-[11px] uppercase tracking-wider">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `transition-colors ${
                  isActive ? "text-[#00f0ff] font-semibold" : "text-[#94a3b8] hover:text-[#f1f5f9]"
                }`
              }
            >
              [ Home ]
            </NavLink>
            <NavLink
              to="/projects"
              className={({ isActive }) =>
                `transition-colors ${
                  isActive ? "text-[#00f0ff] font-semibold" : "text-[#94a3b8] hover:text-[#f1f5f9]"
                }`
              }
            >
              [ Projects ]
            </NavLink>
            <NavLink
              to="/developers"
              className={({ isActive }) =>
                `transition-colors ${
                  isActive ? "text-[#00f0ff] font-semibold" : "text-[#94a3b8] hover:text-[#f1f5f9]"
                }`
              }
            >
              [ Developers ]
            </NavLink>
            <NavLink
              to="/updates"
              className={({ isActive }) =>
                `transition-colors ${
                  isActive ? "text-[#00f0ff] font-semibold" : "text-[#94a3b8] hover:text-[#f1f5f9]"
                }`
              }
            >
              [ Updates ]
            </NavLink>
            <NavLink
              to="/about"
              className={({ isActive }) =>
                `transition-colors ${
                  isActive ? "text-[#00f0ff] font-semibold" : "text-[#94a3b8] hover:text-[#f1f5f9]"
                }`
              }
            >
              [ About ]
            </NavLink>
          </nav>

          {/* Search bar */}
          <div className="hidden sm:flex items-center">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-40 lg:w-52 bg-[#090d13] border border-[#1a2332] rounded-[2px] pl-7 pr-2.5 py-1 text-[11px] font-mono text-[#f1f5f9] placeholder-[#64748b] focus:outline-none focus:border-[#00f0ff] transition-all"
              />
              <Search className="w-3 h-3 text-[#64748b] absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </form>
          </div>

          {/* Mobile menu toggle */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#090d13] focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#090d13] border-b border-[#1a2332] px-4 pt-2 pb-4 space-y-2 font-mono text-xs uppercase">
          <form onSubmit={handleSearchSubmit} className="relative mb-2">
            <input
              type="text"
              placeholder="Search ports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#040608] border border-[#1a2332] rounded-[2px] pl-8 pr-3 py-1.5 text-xs text-[#f1f5f9] placeholder-[#64748b] focus:outline-none focus:border-[#00f0ff]"
            />
            <Search className="w-3.5 h-3.5 text-[#64748b] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </form>
          <div className="flex flex-col space-y-1">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="px-2 py-1.5 text-[#94a3b8] hover:text-[#f1f5f9]"
            >
              [ Home ]
            </Link>
            <Link
              to="/projects"
              onClick={() => setMobileMenuOpen(false)}
              className="px-2 py-1.5 text-[#94a3b8] hover:text-[#f1f5f9]"
            >
              [ Projects ]
            </Link>
            <Link
              to="/developers"
              onClick={() => setMobileMenuOpen(false)}
              className="px-2 py-1.5 text-[#94a3b8] hover:text-[#f1f5f9]"
            >
              [ Developers ]
            </Link>
            <Link
              to="/updates"
              onClick={() => setMobileMenuOpen(false)}
              className="px-2 py-1.5 text-[#94a3b8] hover:text-[#f1f5f9]"
            >
              [ Updates ]
            </Link>
            <Link
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="px-2 py-1.5 text-[#94a3b8] hover:text-[#f1f5f9]"
            >
              [ About ]
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
