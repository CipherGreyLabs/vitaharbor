import React, { useState, useEffect, useMemo } from "react";
import { UpdateCard, type UpdateCardData } from "../components/updates/UpdateCard";
import { apiGet } from "../lib/api";
import { useDocumentMeta } from "../lib/useDocumentMeta";

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
  useDocumentMeta({
    title: "Signal stream",
    description:
      "Every milestone observation from r/vitahacks, r/VitaPiracy and r/PSVitaHomebrew, filtered by event type and verification status."
  });

  const [updates, setUpdates] = useState<UpdateCardData[]>([]);
  const [eventTypeFilter, setEventTypeFilter] = useState("");
  const [verificationFilter, setVerificationFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUpdates() {
      try {
        const data = await apiGet<{ updates: UpdateCardData[] }>("/api/updates?limit=100", "updates");
        setUpdates(data.updates || []);
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
      <div className="border-b border-[#242830] pb-2">
        <h1 className="font-mono text-sm font-bold uppercase tracking-wider text-[#f4f6f8]">
          DEVELOPMENT MILESTONE STREAM
        </h1>
        <p className="text-[11px] font-mono text-[#7c848d]">
          Chronological evidence feed linking to verified Reddit releases and progress logs.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="terminal-panel p-2.5 flex flex-wrap items-center gap-2 text-[10px] font-mono">
        <select
          value={eventTypeFilter}
          onChange={(e) => setEventTypeFilter(e.target.value)}
          className="bg-[#08090a] border border-[#242830] text-[#a3acb5] rounded-[2px] px-2.5 py-1 focus:outline-none focus:border-[#3ad2ff]"
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
          className="bg-[#08090a] border border-[#242830] text-[#a3acb5] rounded-[2px] px-2.5 py-1 focus:outline-none focus:border-[#3ad2ff]"
        >
          {VERIFICATION_FILTERS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>

        <span className="ml-auto text-[10px] text-[#7c848d]">
          {filteredUpdates.length} of {updates.length} events
        </span>
      </div>

      {/* Stream */}
      {loading ? (
        <div className="space-y-2.5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="terminal-card p-4 h-24 animate-pulse bg-[#15181b]" />
          ))}
        </div>
      ) : filteredUpdates.length > 0 ? (
        <div className="space-y-2.5">
          {filteredUpdates.map((u) => (
            <UpdateCard key={u.id} update={u} />
          ))}
        </div>
      ) : (
        <div className="terminal-panel p-12 text-center font-mono text-xs text-[#7c848d]">
          NO EVENTS MATCH SELECTED FILTERS
        </div>
      )}
    </div>
  );
};
