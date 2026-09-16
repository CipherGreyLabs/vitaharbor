import React, { useState, useEffect } from "react";
import { CheckCircle2, XCircle, Plus, Shield, ExternalLink } from "lucide-react";
import { StatusBadge } from "../components/ui/StatusBadge";
import { formatDate } from "@/shared/utils";

interface ModerationItem {
  id: string;
  source_item_id: string;
  confidence_score: number;
  moderation_status: string;
  source_item?: {
    external_id: string;
    canonical_url: string;
    community: string;
    author_username: string;
    item_type: string;
  };
  suggested_project?: {
    id: number;
    slug: string;
    display_name: string;
  };
  observations?: {
    id: string;
    observation_type: string;
    claim_text: string;
    suggested_stage?: string;
  }[];
}

interface AuditLogItem {
  id: string;
  action: string;
  user_id: string | null;
  details: Record<string, unknown>;
  created_at: string;
}

export const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"queue" | "create" | "audit">("queue");
  const [queueItems, setQueueItems] = useState<ModerationItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);

  // New Project Form State
  const [newTitle, setNewTitle] = useState("");
  const [newPlatform, setNewPlatform] = useState("");
  const [newYear, setNewYear] = useState("");
  const [newSummary, setNewSummary] = useState("");
  const [newStage, setNewStage] = useState("announced");
  const [createMsg, setCreateMsg] = useState("");

  useEffect(() => {
    loadQueue();
  }, []);

  async function loadQueue() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/moderation/queue");
      if (res.ok) {
        const data = (await res.json()) as { items: ModerationItem[] };
        setQueueItems(data.items || []);
      }
    } catch (e) {
      console.error("Failed to load queue", e);
    } finally {
      setLoading(false);
    }
  }

  async function loadAuditLogs() {
    try {
      const res = await fetch("/api/admin/audit-log");
      if (res.ok) {
        const data = (await res.json()) as { logs: AuditLogItem[] };
        setAuditLogs(data.logs || []);
      }
    } catch (e) {
      console.error("Failed to load audit logs", e);
    }
  }

  async function handleApprove(id: string) {
    try {
      const res = await fetch(`/api/admin/moderation/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({})
      });
      if (res.ok) {
        setQueueItems((prev) => prev.filter((item) => item.id !== id));
      }
    } catch (e) {
      console.error("Failed to approve", e);
    }
  }

  async function handleReject(id: string) {
    try {
      const res = await fetch(`/api/admin/moderation/${id}/reject`, {
        method: "POST"
      });
      if (res.ok) {
        setQueueItems((prev) => prev.filter((item) => item.id !== id));
      }
    } catch (e) {
      console.error("Failed to reject", e);
    }
  }

  async function handleCreateProject(e: React.FormEvent) {
    e.preventDefault();
    setCreateMsg("");
    try {
      const res = await fetch("/api/admin/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          game_title: newTitle,
          original_platform: newPlatform || undefined,
          original_release_year: newYear ? Number(newYear) : undefined,
          summary: newSummary,
          current_stage: newStage
        })
      });
      if (res.ok) {
        setCreateMsg("Project created successfully!");
        setNewTitle("");
        setNewPlatform("");
        setNewYear("");
        setNewSummary("");
      } else {
        setCreateMsg("Failed to create project.");
      }
    } catch {
      setCreateMsg("Error creating project.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#edf5ff] flex items-center gap-2">
            <Shield className="w-6 h-6 text-[#249cf4]" />
            <span>Moderation & Admin Panel</span>
          </h1>
          <p className="text-xs text-[#9aaabd] mt-1">Review incoming discovery candidates and manage project records</p>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-1 bg-[#151b24] p-1 rounded-lg border border-[#202a38]">
          <button
            onClick={() => setActiveTab("queue")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeTab === "queue" ? "bg-[#249cf4] text-white" : "text-[#9aaabd] hover:text-[#edf5ff]"
            }`}
          >
            Discovery Queue ({queueItems.length})
          </button>
          <button
            onClick={() => setActiveTab("create")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeTab === "create" ? "bg-[#249cf4] text-white" : "text-[#9aaabd] hover:text-[#edf5ff]"
            }`}
          >
            Add Project
          </button>
          <button
            onClick={() => {
              setActiveTab("audit");
              loadAuditLogs();
            }}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeTab === "audit" ? "bg-[#249cf4] text-white" : "text-[#9aaabd] hover:text-[#edf5ff]"
            }`}
          >
            Audit Log
          </button>
        </div>
      </div>

      {/* Discovery Queue Tab */}
      {activeTab === "queue" && (
        <div className="space-y-4">
          {loading ? (
            <div className="card-panel p-12 text-center text-xs text-[#68788c] animate-pulse">Loading moderation queue...</div>
          ) : queueItems.length > 0 ? (
            queueItems.map((item) => {
              const obs = item.observations && item.observations[0];
              return (
                <div key={item.id} className="card-panel p-5 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#202a38] pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-[#edf5ff]">
                        r/{item.source_item?.community || "Reddit"}
                      </span>
                      <span className="text-xs text-[#68788c]">by u/{item.source_item?.author_username}</span>
                      {item.source_item?.canonical_url && (
                        <a
                          href={item.source_item.canonical_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#249cf4] text-xs hover:text-[#4fb5ff] inline-flex items-center gap-1"
                        >
                          <span>Open Reddit</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                    <div className="text-xs text-[#9aaabd]">
                      Confidence: <span className="font-semibold text-[#249cf4]">{Math.round(item.confidence_score * 100)}%</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs text-[#edf5ff] bg-[#090c11] p-3 rounded border border-[#202a38] leading-relaxed">
                      {obs?.claim_text || "No claim text provided."}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-[#9aaabd]">
                      <div>
                        Matched Project:{" "}
                        <span className="text-[#edf5ff] font-medium">
                          {item.suggested_project?.display_name || "Unmatched (New Port Candidate)"}
                        </span>
                      </div>
                      {obs?.suggested_stage && (
                        <div className="flex items-center gap-1">
                          <span>Suggested Stage:</span>
                          <StatusBadge type="stage" value={obs.suggested_stage} />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      onClick={() => handleReject(item.id)}
                      className="px-3 py-1.5 rounded-md text-xs font-medium text-red-400 hover:bg-red-950/30 border border-red-900/40 inline-flex items-center gap-1.5 transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject / Ignore</span>
                    </button>
                    <button
                      onClick={() => handleApprove(item.id)}
                      className="px-3 py-1.5 rounded-md text-xs font-medium bg-[#249cf4] text-white hover:bg-[#4fb5ff] inline-flex items-center gap-1.5 transition-colors"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve & Publish Update</span>
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="card-panel p-12 text-center text-xs text-[#68788c]">
              Discovery queue is currently clear. No pending items to review.
            </div>
          )}
        </div>
      )}

      {/* Add Project Tab */}
      {activeTab === "create" && (
        <form onSubmit={handleCreateProject} className="card-panel p-6 sm:p-8 space-y-4 max-w-2xl">
          <h3 className="text-base font-semibold text-[#edf5ff]">Register New Game & Port Project</h3>

          {createMsg && <div className="p-3 rounded bg-[#151b24] border border-[#202a38] text-xs text-[#249cf4]">{createMsg}</div>}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#9aaabd]">Game Title (Required)</label>
            <input
              type="text"
              required
              placeholder="e.g. Grand Theft Auto: Vice City"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full bg-[#090c11] border border-[#202a38] rounded-md px-3 py-2 text-xs text-[#edf5ff] focus:outline-none focus:border-[#249cf4]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#9aaabd]">Original Platform</label>
              <input
                type="text"
                placeholder="e.g. PC, PS2, Android"
                value={newPlatform}
                onChange={(e) => setNewPlatform(e.target.value)}
                className="w-full bg-[#090c11] border border-[#202a38] rounded-md px-3 py-2 text-xs text-[#edf5ff] focus:outline-none focus:border-[#249cf4]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#9aaabd]">Release Year</label>
              <input
                type="number"
                placeholder="e.g. 2002"
                value={newYear}
                onChange={(e) => setNewYear(e.target.value)}
                className="w-full bg-[#090c11] border border-[#202a38] rounded-md px-3 py-2 text-xs text-[#edf5ff] focus:outline-none focus:border-[#249cf4]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#9aaabd]">Initial Development Stage</label>
            <select
              value={newStage}
              onChange={(e) => setNewStage(e.target.value)}
              className="w-full bg-[#090c11] border border-[#202a38] rounded-md px-3 py-2 text-xs text-[#edf5ff] focus:outline-none focus:border-[#249cf4]"
            >
              <option value="announced">Announced</option>
              <option value="early_wip">Early WIP</option>
              <option value="booting">Booting</option>
              <option value="in_game">In-Game</option>
              <option value="playable">Playable</option>
              <option value="released">Released</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#9aaabd]">Summary / Notes</label>
            <textarea
              rows={3}
              placeholder="Technical approach, wrapper details, etc."
              value={newSummary}
              onChange={(e) => setNewSummary(e.target.value)}
              className="w-full bg-[#090c11] border border-[#202a38] rounded-md px-3 py-2 text-xs text-[#edf5ff] focus:outline-none focus:border-[#249cf4]"
            />
          </div>

          <button type="submit" className="btn-accent text-xs">
            <Plus className="w-4 h-4" />
            <span>Create Port Record</span>
          </button>
        </form>
      )}

      {/* Audit Log Tab */}
      {activeTab === "audit" && (
        <div className="space-y-3">
          {auditLogs.length > 0 ? (
            auditLogs.map((log) => (
              <div key={log.id} className="card-panel p-4 flex items-center justify-between gap-4 text-xs">
                <div>
                  <span className="font-semibold text-[#edf5ff]">{log.action}</span>
                  <span className="text-[#68788c] ml-2">by {log.user_id || "system"}</span>
                  <pre className="text-[10px] text-[#9aaabd] mt-1 bg-[#090c11] p-2 rounded max-w-xl overflow-x-auto">
                    {JSON.stringify(log.details)}
                  </pre>
                </div>
                <span className="text-[#68788c] flex-shrink-0">{formatDate(log.created_at)}</span>
              </div>
            ))
          ) : (
            <div className="card-panel p-12 text-center text-xs text-[#68788c]">No audit log events recorded yet.</div>
          )}
        </div>
      )}
    </div>
  );
};
