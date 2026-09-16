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
      <div>
        <h1 className="text-2xl font-bold text-[#edf5ff]">PS Vita Port Developers</h1>
        <p className="text-xs text-[#9aaabd] mt-1">Community programmers and engine reverse-engineers</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card-panel p-5 h-36 animate-pulse bg-[#0f141b]" />
          ))}
        </div>
      ) : developers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {developers.map((d) => (
            <DeveloperCard key={d.id} developer={d} />
          ))}
        </div>
      ) : (
        <div className="card-panel p-12 text-center text-xs text-[#68788c]">
          No developers registered yet.
        </div>
      )}
    </div>
  );
};

