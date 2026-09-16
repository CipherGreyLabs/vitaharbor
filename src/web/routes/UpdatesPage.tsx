import React, { useState, useEffect, useMemo } from "react";
import { UpdateCard, type UpdateCardData } from "../components/updates/UpdateCard";

const EVENT_TYPE_FILTERS = [
  { value: "", label: "All Event Types" },
  { value: "release", label: "Releases" },
  { value: "playability_progress", label: "Playability Progress" },
  { value: "first_boot", label: "First Boot" },
  { value: "first_in_game", label: "In-Game" },
  { value: "technical_progress", label: "Technical Progress" },
  { value: "project_announced", label: "Announcements" }
];

const VERIFICATION_FILTERS = [
  { value: "", label: "All Verification" },
  { value: "developer_direct", label: "Developer Direct" },
  { value: "maintainer_confirmed", label: "Maintainer Confirmed" },
  { value: "community_report", label: "Community Report" }
];

export const UpdatesPage: React.FC = () => {
  const [updates, setUpdates] = useState<UpdateCardData[]>([]);
  const [eventTypeFilter, setEventTypeFilter] = useState("");
  const [verificationFilter, setVerificationFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUpdates() {
      try {
        const res = await fetch("/api/updates?limit=100");
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

  const filteredUpdates = useMemo(() => {
    return updates.filter((u) => {
      if (eventTypeFilter && u.event_type !== eventTypeFilter) return false;
      if (verificationFilter && u.verification_level !== verificationFilter) return false;
      return true;
    });
  }, [updates, eventTypeFilter, verificationFilter]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-[#edf5ff]">
          Development Updates Feed
        </h1>
        <p className="text-xs text-[#9aaabd] mt-0.5">
          Chronological timeline of verified PlayStation Vita porting milestones with direct evidence provenance.
        </p>
      </div>

      {/* Blueprint §80: Filters */}
      <div className="card-panel p-3.5 flex flex-wrap items-center gap-2">
        <select
          value={eventTypeFilter}
          onChange={(e) => setEventTypeFilter(e.target.value)}
          className="bg-[#090c11] border border-[#202a38] text-[11px] text-[#edf5ff] rounded px-2.5 py-1.5 focus:outline-none focus:border-[#249cf4]"
        >
          {EVENT_TYPE_FILTERS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>

        <select
          value={verificationFilter}
          onChange={(e) => setVerificationFilter(e.target.value)}
          className="bg-[#090c11] border border-[#202a38] text-[11px] text-[#edf5ff] rounded px-2.5 py-1.5 focus:outline-none focus:border-[#249cf4]"
        >
          {VERIFICATION_FILTERS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>

        <span className="ml-auto text-[11px] text-[#68788c]">
          Showing {filteredUpdates.length} of {updates.length} events
        </span>
      </div>

      {/* Feed Stream */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card-panel p-4 h-28 animate-pulse bg-[#0f141b]" />
          ))}
        </div>
      ) : filteredUpdates.length > 0 ? (
        <div className="space-y-3">
          {filteredUpdates.map((u) => (
            <UpdateCard key={u.id} update={u} />
          ))}
        </div>
      ) : (
        <div className="card-panel p-12 text-center text-xs text-[#68788c]">
          No development events match the selected criteria.
        </div>
      )}
    </div>
  );
};

