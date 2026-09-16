import React, { useState, useEffect } from "react";
import { UpdateCard, type UpdateCardData } from "../components/updates/UpdateCard";

export const UpdatesPage: React.FC = () => {
  const [updates, setUpdates] = useState<UpdateCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUpdates() {
      try {
        const res = await fetch("/api/updates?limit=50");
        if (res.ok) {
          const data = (await res.json()) as { updates: UpdateCardData[] };
          setUpdates(data.updates || []);
        }
      } catch (e) {
        console.error("Failed to load updates feed", e);
      } finally {
        setLoading(false);
      }
    }
    loadUpdates();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#edf5ff]">Development Updates Feed</h1>
        <p className="text-xs text-[#9aaabd] mt-1">Live chronological record of verified PlayStation Vita game-port milestones</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card-panel p-5 h-32 animate-pulse bg-[#0f141b]" />
          ))}
        </div>
      ) : updates.length > 0 ? (
        <div className="space-y-4">
          {updates.map((u) => (
            <UpdateCard key={u.id} update={u} />
          ))}
        </div>
      ) : (
        <div className="card-panel p-12 text-center text-xs text-[#68788c]">
          No development updates recorded yet.
        </div>
      )}
    </div>
  );
};

