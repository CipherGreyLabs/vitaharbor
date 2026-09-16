import React from "react";

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto space-y-8 py-2">
      <div className="border-b border-[#1a2332] pb-3 space-y-1">
        <h1 className="font-mono text-sm font-bold uppercase tracking-wider text-[#f1f5f9] flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#00f0ff]" />
          <span>ABOUT VITAHARBOR</span>
        </h1>
        <p className="text-[11px] font-mono text-[#64748b]">
          Open-access intelligence ledger for PlayStation Vita game ports.
        </p>
      </div>

      <section className="terminal-panel p-5 space-y-2.5">
        <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-[#00b4d8]">
          // THE CENTRAL PROBLEM
        </h2>
        <p className="text-xs text-[#94a3b8] leading-relaxed">
          The PlayStation Vita homebrew ecosystem is one of the most technically ambitious in gaming history. Developers reverse-engineer Android ARM binaries, decompile engines, rewrite OpenGL ES shaders in vitaGL, and recompile whole PC classics natively for ARM Cortex-A9.
        </p>
        <p className="text-xs text-[#94a3b8] leading-relaxed">
          However, project updates, first-boot milestones, and beta builds remain scattered across isolated Reddit threads, comment replies, and GitHub gists. VitaHarbor exists as the central, verifiable reference point.
        </p>
      </section>

      <section className="terminal-panel p-5 space-y-3.5">
        <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-[#00b4d8]">
          // SYSTEM INVARIANTS
        </h2>

        <div className="space-y-3 text-xs text-[#94a3b8]">
          <div>
            <span className="text-[#f1f5f9] font-mono font-bold text-[11px] block">
              1. DIRECT EVIDENCE PROVENANCE
            </span>
            <span>
              Every milestone claim is linked to the primary Reddit statement or repository release where the developer announced it.
            </span>
          </div>

          <div>
            <span className="text-[#f1f5f9] font-mono font-bold text-[11px] block">
              2. DISCRETE MILESTONES (NO FAKE PERCENTAGES)
            </span>
            <span>
              Software development cannot be reduced to synthetic percentages like "78% done". VitaHarbor tracks empirical milestones: Announced, Booting, In-Game, Playable, and Released.
            </span>
          </div>

          <div>
            <span className="text-[#f1f5f9] font-mono font-bold text-[11px] block">
              3. STRICT METADATA ONLY (ZERO PIRACY)
            </span>
            <span>
              VitaHarbor hosts exclusively structured technical data and changelogs. No ROMs, VPKs, copyrighted assets, or game binaries are distributed.
            </span>
          </div>
        </div>
      </section>

      <section className="terminal-panel p-4 border-l-2 border-l-[#f59e0b] space-y-1 text-[11px] font-mono text-[#64748b]">
        <span className="text-[#f59e0b] font-bold block">// LEGAL DISCLAIMER</span>
        <p>
          VitaHarbor is an independent community project. Not affiliated with or endorsed by Sony Interactive Entertainment or Reddit.
        </p>
      </section>
    </div>
  );
};
