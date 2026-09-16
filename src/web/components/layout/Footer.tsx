import React from "react";
import { ExternalLink } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-[#1a2332] bg-[#040608] mt-20 py-8 text-[11px] font-mono text-[#64748b]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        {/* Top Status Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#1a2332]">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
            <span className="text-[#f1f5f9] font-bold tracking-wider uppercase">
              VitaHarbor
            </span>
            <span className="text-[#29374e]">|</span>
            <span className="text-[#94a3b8]">PS Vita Port Development Registry</span>
          </div>

          <div className="flex items-center gap-4 text-[#94a3b8]">
            <span>SOURCES:</span>
            <a
              href="https://reddit.com/r/vitahacks"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#00f0ff] inline-flex items-center gap-1 transition-colors"
            >
              <span>r/vitahacks</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
            <a
              href="https://reddit.com/r/VitaPiracy"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#00f0ff] inline-flex items-center gap-1 transition-colors"
            >
              <span>r/VitaPiracy</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
        </div>

        {/* Legal notice */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[10px] text-[#64748b] leading-relaxed">
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

