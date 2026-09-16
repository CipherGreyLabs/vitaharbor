import React from "react";
import { ExternalLink } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-[#242830] bg-[#08090a] mt-20 py-8 text-[11px] font-mono text-[#7c848d]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        {/* Top Status Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#242830]">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
            <span className="text-[#f4f6f8] font-bold tracking-wider uppercase">
              VitaHarbor
            </span>
            <span className="text-[#343a42]">|</span>
            <span className="text-[#a3acb5]">PS Vita Port Development Registry</span>
          </div>

          <div className="flex items-center gap-4 text-[#a3acb5]">
            <span>SOURCES:</span>
            <a
              href="https://reddit.com/r/vitahacks"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#3ad2ff] inline-flex items-center gap-1 transition-colors"
            >
              <span>r/vitahacks</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
            <a
              href="https://reddit.com/r/VitaPiracy"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#3ad2ff] inline-flex items-center gap-1 transition-colors"
            >
              <span>r/VitaPiracy</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
        </div>

        {/* Legal notice */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[10px] text-[#7c848d] leading-relaxed">
          <p>
            Unofficial community intelligence tracker. Not affiliated with Sony Interactive Entertainment. No ROMs, VPKs, or copyrighted files are hosted on this platform.
          </p>
          <span className="flex-shrink-0">
            © {new Date().getFullYear()} VitaHarbor · Zero-cost edge architecture
          </span>
        </div>
      </div>
    </footer>
  );
};

