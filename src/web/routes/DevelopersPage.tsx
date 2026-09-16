import React, { useState, useEffect } from "react";
import { DeveloperCard, type DeveloperCardData } from "../components/developers/DeveloperCard";

export const DevelopersPage: React.FC = () => {
  const [developers, setDevelopers] = useState<DeveloperCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDevelopers() {
      try {
        const res = await fetch("/api/developers?limit=50");
        if (res.ok) {
          const data = (await res.json()) as { developers: DeveloperCardData[] };
          setDevelopers(data.developers || []);
        }
      } catch (e) {
        console.error("Failed to load developers", e);
      } finally {
        setLoading(false);
      }
    }
    loadDevelopers();
  }, []);

  return (
    <div className="space-y-6">
      <div className="border-b border-[#1a2332] pb-2">
        <h1 className="font-mono text-sm font-bold uppercase tracking-wider text-[#f1f5f9]">
          PS VITA REVERSE ENGINEERS & PORTERS
        </h1>
        <p className="text-[11px] font-mono text-[#64748b]">
          Verified homebrew creators responsible for native recompilations and ARM wrappers.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="terminal-card p-4 h-28 animate-pulse bg-[#0d131b]" />
          ))}
        </div>
      ) : developers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {developers.map((d) => (
            <DeveloperCard key={d.id} developer={d} />
          ))}
        </div>
      ) : (
        <div className="terminal-panel p-12 text-center font-mono text-xs text-[#64748b]">
          No developers registered yet.
        </div>
      )}
    </div>
  );
};

