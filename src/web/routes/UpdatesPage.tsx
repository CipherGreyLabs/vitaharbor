import React, { useState, useEffect, useMemo } from "react";
import { UpdateCard, type UpdateCardData } from "../components/updates/UpdateCard";

const EVENT_TYPE_FILTERS = [
  { value: "", label: "TYPE: ALL" },
  { value: "release", label: "RELEASE" },
  { value: "playability_progress", label: "PLAYABILITY" },
  { value: "first_boot", label: "FIRST BOOT" },
  { value: "first_in_game", label: "IN-GAME" },
  { value: "technical_progress", label: "TECH PROGRESS" },
  { value: "project_announced", label: "ANNOUNCEMENT" }
];

const VERIFICATION_FILTERS = [
  { value: "", label: "VERIFICATION: ALL" },
  { value: "developer_direct", label: "DEV DIRECT" },
  { value: "maintainer_confirmed", label: "VERIFIED" },
  { value: "community_report", label: "COMMUNITY REPORT" }
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
      <div className="border-b border-[#1a2332] pb-2">
        <h1 className="font-mono text-sm font-bold uppercase tracking-wider text-[#f1f5f9]">
          DEVELOPMENT MILESTONE STREAM
        </h1>
        <p className="text-[11px] font-mono text-[#64748b]">
          Chronological evidence feed linking to verified Reddit releases and progress logs.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="terminal-panel p-2.5 flex flex-wrap items-center gap-2 text-[10px] font-mono">
        <select
          value={eventTypeFilter}
          onChange={(e) => setEventTypeFilter(e.target.value)}
          className="bg-[#040608] border border-[#1a2332] text-[#94a3b8] rounded-[2px] px-2.5 py-1 focus:outline-none focus:border-[#00f0ff]"
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
          className="bg-[#040608] border border-[#1a2332] text-[#94a3b8] rounded-[2px] px-2.5 py-1 focus:outline-none focus:border-[#00f0ff]"
        >
          {VERIFICATION_FILTERS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>

        <span className="ml-auto text-[10px] text-[#64748b]">
          {filteredUpdates.length} of {updates.length} events
        </span>
      </div>

      {/* Stream */}
      {loading ? (
        <div className="space-y-2.5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="terminal-card p-4 h-24 animate-pulse bg-[#0d131b]" />
          ))}
        </div>
      ) : filteredUpdates.length > 0 ? (
        <div className="space-y-2.5">
          {filteredUpdates.map((u) => (
            <UpdateCard key={u.id} update={u} />
          ))}
        </div>
      ) : (
        <div className="terminal-panel p-12 text-center font-mono text-xs text-[#64748b]">
          NO EVENTS MATCH SELECTED FILTERS
        </div>
      )}
    </div>
  );
};

