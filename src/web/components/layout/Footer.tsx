import React from "react";
import { ExternalLink } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#090c11] border-t border-[#202a38] mt-16 py-12 text-[#68788c] text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 text-[#edf5ff] font-bold text-sm mb-3">
              <span>VitaPortWatch</span>
            </div>
            <p className="text-[#9aaabd] leading-relaxed">
              Open intelligence tracker for active PS Vita game ports. Verified provenance, direct developer attribution, and structured timeline events.
            </p>
          </div>

          <div>
            <h4 className="text-[#edf5ff] font-semibold mb-3">Discovery Sources</h4>
            <ul className="space-y-1.5">
              <li>
                <a
                  href="https://reddit.com/r/vitahacks"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#249cf4] inline-flex items-center gap-1"
                >
                  <span>r/vitahacks</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://reddit.com/r/VitaPiracy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#249cf4] inline-flex items-center gap-1"
                >
                  <span>r/VitaPiracy</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-[#edf5ff] font-semibold mb-3">Legal & Disclaimer</h4>
            <p className="text-[#9aaabd] leading-relaxed">
              Unofficial community project. Not affiliated with, sponsored by, or endorsed by Sony Interactive Entertainment or Reddit. No game binaries, ROMs, or copyrighted data are hosted on this platform.
            </p>
          </div>
        </div>

        <div className="pt-8 border-t border-[#202a38] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} VitaPortWatch. Zero-cost-first open architecture.</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[#9aaabd]">Tracking Active Ports</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

