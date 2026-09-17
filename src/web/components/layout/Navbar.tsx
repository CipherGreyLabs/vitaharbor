import React, { useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { Search, Menu, X, ExternalLink } from "lucide-react";

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

  const navLinks = [
    { to: "/", label: "Overview", end: true },
    { to: "/projects", label: "Port Directory" },
    { to: "/updates", label: "Community Signals" },
    { to: "/developers", label: "Developers" },
    { to: "/about", label: "Methodology" },
  ];

  return (
    <header className="sticky top-0 z-50 editorial-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          
          {/* Brand */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-6 h-6 rounded bg-[#1e232b] flex items-center justify-center border border-white/10 group-hover:border-sky-400/50 transition-colors">
                <span className="w-2 h-2 rounded-sm bg-sky-400" />
              </div>
              <span className="text-sm font-semibold tracking-tight text-white group-hover:text-sky-400 transition-colors">
                VitaHarbor
              </span>
            </Link>

            <span className="hidden sm:inline-block h-3.5 w-px bg-white/10" />
            <span className="hidden sm:inline-block text-xs text-slate-400 font-normal">
              Independent PlayStation Vita Port Ledger
            </span>
          </div>

          {/* Clean Text Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    isActive
                      ? "text-white bg-white/10 font-semibold"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Search & Community Links */}
          <div className="hidden sm:flex items-center gap-3">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search ports, engines, devs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-48 lg:w-60 bg-[#12151a] border border-white/10 rounded-md pl-8 pr-3 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-400 transition-colors"
              />
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </form>
          </div>

          {/* Mobile menu toggle */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 text-slate-400 hover:text-white focus:outline-none"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0e1014] border-b border-white/10 px-4 py-3 space-y-2">
          <form onSubmit={handleSearchSubmit} className="relative mb-2">
            <input
              type="text"
              placeholder="Search ports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#161a21] border border-white/10 rounded-md pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
            />
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </form>
          <div className="flex flex-col space-y-0.5">
            {navLinks.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className="px-2.5 py-1.5 rounded text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};


