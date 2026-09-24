import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useDocumentMeta } from "../lib/useDocumentMeta";
import { formatUtcDateTime } from "../components/ledger/types";
import { scannerFreshness } from "../lib/visitorState";

interface DiscoveryItem {
  id: string;
  state: string;
  title: string;
  url: string;
  subreddit?: string;
  published_at?: string;
  candidate_type?: string;
}

export const DiscoveryPage: React.FC = () => {
  const [items, setItems] = useState<DiscoveryItem[]>([]);
  const [generatedAt, setGeneratedAt] = useState("");
  const [source, setSource] = useState("");
  const [loading, setLoading] = useState(true);

  useDocumentMeta({
    title: "Vita port discovery queue — VitaHarbor",
    description: "Public review queue of Vita port threads detected by VitaHarbor before curated promotion."
  });

  useEffect(() => {
    let cancelled = false;
    fetch("/data/discovered.json", { cache: "no-store", headers: { accept: "application/json" } })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("discovery fetch failed")))
      .then((body) => {
        if (cancelled) return;
        setItems(Array.isArray(body?.items) ? body.items : []);
        setGeneratedAt(typeof body?.generated_at === "string" ? body.generated_at : "");
        setSource(typeof body?.source === "string" ? body.source : "");
      })
      .catch(() => undefined)
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const freshness = useMemo(() => scannerFreshness(generatedAt), [generatedAt]);

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-6 py-10 sm:py-14">
      <nav className="flex flex-wrap items-center justify-between gap-4 text-body">
        <Link to="/" className="font-semibold text-ink hover:text-accent">VitaHarbor</Link>
        <div className="flex gap-4 text-ink-muted">
          <Link to="/updates" className="hover:text-ink">Updates</Link>
          <Link to="/#directory" className="hover:text-ink">Directory</Link>
        </div>
      </nav>
      <header className="mt-14 border-b border-hairline-strong/30 pb-6">
        <p className="text-micro font-semibold uppercase tracking-[0.16em] text-ink-muted">Scanner review queue</p>
        <h1 className="mt-3 text-display font-semibold tracking-tight text-ink">Discovery</h1>
        <p className="mt-4 max-w-2xl text-lead text-ink-medium">Detected community threads remain outside the curated ledger until their evidence is reviewed.</p>
        <div className="mt-5 flex flex-wrap gap-2 text-caption text-ink-muted">
          <span className="rounded-full border border-hairline bg-surface px-3 py-1.5">{freshness.label}</span>
          {generatedAt && <span className="rounded-full border border-hairline bg-surface px-3 py-1.5">Last scan {formatUtcDateTime(generatedAt)}</span>}
          {source && <span className="rounded-full border border-hairline bg-surface px-3 py-1.5">{source}</span>}
        </div>
      </header>
      {loading ? <p className="py-12 text-body text-ink-muted">Loading discovery queue…</p> : items.length === 0 ? (
        <p className="py-12 text-body text-ink-muted">No public detections are waiting for review.</p>
      ) : (
        <ol className="mt-8 space-y-3">
          {items.map((item) => (
            <li key={item.id} className="rounded-2xl border border-hairline bg-surface p-5">
              <div className="flex flex-wrap items-center gap-2 text-micro font-semibold uppercase tracking-[0.1em] text-ink-muted">
                <span>{item.state === "VERIFIED_FOR_REVIEW" ? "Verified for review" : "Quarantined source"}</span>
                {item.subreddit && <span>· r/{item.subreddit}</span>}
                {item.candidate_type && <span>· {item.candidate_type}</span>}
              </div>
              <h2 className="mt-2 text-subtitle font-semibold text-ink">{item.title}</h2>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-caption text-ink-muted">
                <span>{item.published_at ? `Published ${formatUtcDateTime(item.published_at)}` : "Publication time not recorded"}</span>
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="font-medium text-accent hover:underline">Open Reddit source</a>
              </div>
            </li>
          ))}
        </ol>
      )}
    </main>
  );
};
