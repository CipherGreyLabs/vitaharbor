import React from "react";
import { Link } from "react-router-dom";

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 bg-white py-10 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="max-w-2xl leading-relaxed">
          <span className="font-semibold text-slate-900 block mb-1">Non-Infringing Community Archive</span>
          VitaHarbor indexes public engineering discussions on r/vitahacks and r/VitaPiracy. Zero game binaries, ISOs, or ROMs are hosted or distributed. All ports require legitimately acquired original game assets.
        </div>

        <div className="flex items-center gap-4 shrink-0 font-medium">
          <Link to="/about" className="hover:text-slate-900 transition-colors">
            Methodology
          </Link>
          <span className="text-slate-300">·</span>
          <a href="/api/feed.json" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors">
            JSON Feed
          </a>
          <span className="text-slate-300">·</span>
          <a href="/api/rss.xml" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors">
            RSS Feed
          </a>
        </div>
      </div>
    </footer>
  );
};
