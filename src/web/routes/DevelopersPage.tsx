import React, { useState, useEffect } from "react";
import { DeveloperCard, type DeveloperCardData } from "../components/developers/DeveloperCard";
import { apiGet } from "../lib/api";
import { useDocumentMeta } from "../lib/useDocumentMeta";

export const DevelopersPage: React.FC = () => {
  useDocumentMeta({
    title: "Reverse engineers",
    description:
      "The developers, porters and reverse engineers behind every PlayStation Vita port in the ledger."
  });

  const [developers, setDevelopers] = useState<DeveloperCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDevelopers() {
      try {
        const data = await apiGet<{ developers: DeveloperCardData[] }>(
          "/api/developers?limit=50",
          "developers"
        );
        setDevelopers(data.developers || []);
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
      <div className="border-b border-[#242830] pb-2">
        <h1 className="font-mono text-sm font-bold uppercase tracking-wider text-[#f4f6f8]">
          PS VITA REVERSE ENGINEERS & PORTERS
        </h1>
        <p className="text-[11px] font-mono text-[#7c848d]">
          Verified homebrew creators responsible for native recompilations and ARM wrappers.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="terminal-card p-4 h-28 animate-pulse bg-[#15181b]" />
          ))}
        </div>
      ) : developers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {developers.map((d) => (
            <DeveloperCard key={d.id} developer={d} />
          ))}
        </div>
      ) : (
        <div className="terminal-panel p-12 text-center font-mono text-xs text-[#7c848d]">
          No developers registered yet.
        </div>
      )}
    </div>
  );
};
