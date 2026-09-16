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
    <header className="sticky top-0 z-50 bg-[#08090a]/95 backdrop-blur-md border-b border-[#242830]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-5 h-5 rounded-[2px] bg-[#0f1113] border border-[#242830] flex items-center justify-center group-hover:border-[#3ad2ff] transition-colors">
              <span className="w-2 h-2 rounded-full bg-[#3ad2ff]" />
            </div>
            <span className="font-mono text-xs font-bold tracking-widest uppercase text-[#f4f6f8]">
              Vita<span className="text-[#3ad2ff]">Harbor</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 font-mono text-[11px] uppercase tracking-wider">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `transition-colors ${
                  isActive ? "text-[#3ad2ff] font-semibold" : "text-[#a3acb5] hover:text-[#f4f6f8]"
                }`
              }
            >
              [ Home ]
            </NavLink>
            <NavLink
              to="/projects"
              className={({ isActive }) =>
                `transition-colors ${
                  isActive ? "text-[#3ad2ff] font-semibold" : "text-[#a3acb5] hover:text-[#f4f6f8]"
                }`
              }
            >
              [ Projects ]
            </NavLink>
            <NavLink
              to="/developers"
              className={({ isActive }) =>
                `transition-colors ${
                  isActive ? "text-[#3ad2ff] font-semibold" : "text-[#a3acb5] hover:text-[#f4f6f8]"
                }`
              }
            >
              [ Developers ]
            </NavLink>
            <NavLink
              to="/updates"
              className={({ isActive }) =>
                `transition-colors ${
                  isActive ? "text-[#3ad2ff] font-semibold" : "text-[#a3acb5] hover:text-[#f4f6f8]"
                }`
              }
            >
              [ Updates ]
            </NavLink>
            <NavLink
              to="/about"
              className={({ isActive }) =>
                `transition-colors ${
                  isActive ? "text-[#3ad2ff] font-semibold" : "text-[#a3acb5] hover:text-[#f4f6f8]"
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
                className="w-40 lg:w-52 bg-[#0f1113] border border-[#242830] rounded-[2px] pl-7 pr-2.5 py-1 text-[11px] font-mono text-[#f4f6f8] placeholder-[#7c848d] focus:outline-none focus:border-[#3ad2ff] transition-all"
              />
              <Search className="w-3 h-3 text-[#7c848d] absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </form>
          </div>

          {/* Mobile menu toggle */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded text-[#a3acb5] hover:text-[#f4f6f8] hover:bg-[#0f1113] focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0f1113] border-b border-[#242830] px-4 pt-2 pb-4 space-y-2 font-mono text-xs uppercase">
          <form onSubmit={handleSearchSubmit} className="relative mb-2">
            <input
              type="text"
              placeholder="Search ports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#08090a] border border-[#242830] rounded-[2px] pl-8 pr-3 py-1.5 text-xs text-[#f4f6f8] placeholder-[#7c848d] focus:outline-none focus:border-[#3ad2ff]"
            />
            <Search className="w-3.5 h-3.5 text-[#7c848d] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </form>
          <div className="flex flex-col space-y-1">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="px-2 py-1.5 text-[#a3acb5] hover:text-[#f4f6f8]"
            >
              [ Home ]
            </Link>
            <Link
              to="/projects"
              onClick={() => setMobileMenuOpen(false)}
              className="px-2 py-1.5 text-[#a3acb5] hover:text-[#f4f6f8]"
            >
              [ Projects ]
            </Link>
            <Link
              to="/developers"
              onClick={() => setMobileMenuOpen(false)}
              className="px-2 py-1.5 text-[#a3acb5] hover:text-[#f4f6f8]"
            >
              [ Developers ]
            </Link>
            <Link
              to="/updates"
              onClick={() => setMobileMenuOpen(false)}
              className="px-2 py-1.5 text-[#a3acb5] hover:text-[#f4f6f8]"
            >
              [ Updates ]
            </Link>
            <Link
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="px-2 py-1.5 text-[#a3acb5] hover:text-[#f4f6f8]"
            >
              [ About ]
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
