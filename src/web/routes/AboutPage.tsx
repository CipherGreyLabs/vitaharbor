import React from "react";
import { Disc, CheckCircle2 } from "lucide-react";

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto space-y-10 py-2">
      {/* Title */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Disc className="w-5 h-5 text-[#249cf4]" />
          <h1 className="text-xl font-bold tracking-tight text-[#edf5ff]">
            About VitaHarbor
          </h1>
        </div>
        <p className="text-xs text-[#9aaabd] leading-relaxed">
          Open, zero-cost intelligence platform tracking active PlayStation Vita game-port development.
        </p>
      </div>

      {/* Core Mission */}
      <section className="card-panel p-6 space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#edf5ff]">
          The Purpose
        </h2>
        <p className="text-xs text-[#9aaabd] leading-relaxed">
          The PlayStation Vita homebrew community continues to deliver extraordinary technical feats: ARM wrappers, reverse-engineered bytecode translators, OpenGL ES / vitaGL shaders, and native source-port reimplementations.
        </p>
        <p className="text-xs text-[#9aaabd] leading-relaxed">
          VitaHarbor answers one fundamental question:
        </p>
        <blockquote className="text-xs text-[#edf5ff] border-l-2 border-[#249cf4] pl-3 py-1 font-medium bg-[#090c11]/50 rounded-r">
          What PS Vita game ports are currently being developed, by whom, how far have they progressed, and what changed recently?
        </blockquote>
      </section>

      {/* Principles & Anti-Hype */}
      <section className="card-panel p-6 space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#edf5ff]">
          Product Principles
        </h2>

        <div className="space-y-3 text-xs text-[#9aaabd]">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#249cf4] flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#edf5ff] block">Verified Source Provenance</strong>
              Every factual milestone, boot claim, or release statement links back directly to the original developer post, repository commit, or public community statement.
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#249cf4] flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#edf5ff] block">Never Fake Progress Percentages</strong>
              Software development cannot be reduced to arbitrary percentages like "76% done". We track verifiable discrete stages: Announced → Booting → In-Game → Playable → Released.
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#249cf4] flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#edf5ff] block">No Piracy, No ROMs, No Binaries</strong>
              VitaHarbor hosts strictly structured metadata and news. We do not distribute VPKs, copyrighted game assets, data files, or ROMs.
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#249cf4] flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#edf5ff] block">Zero-Cost-First Architecture</strong>
              Built to operate sustainably on Cloudflare free-tier serverless primitives (Workers, D1 SQLite, Static Assets, and Cron Triggers), ensuring long-term community availability without advertising, accounts, or donations.
            </div>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="card-panel p-6 space-y-2 border-l-2 border-l-amber-500/50">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#edf5ff]">
          Legal Notice & Disclaimer
        </h2>
        <p className="text-[11px] text-[#68788c] leading-relaxed">
          VitaHarbor is an independent, non-commercial community project. It is not affiliated with, endorsed by, or connected to Sony Interactive Entertainment, Reddit, or any represented game publishers. PlayStation and PS Vita are trademarks of Sony Interactive Entertainment Inc.
        </p>
      </section>
    </div>
  );
};
