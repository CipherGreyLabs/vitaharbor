import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useDocumentMeta } from "../lib/useDocumentMeta";
import { formatUtcDateTime } from "../components/ledger/types";
import { scannerFreshness, type ScannerHealthRecord } from "../lib/visitorState";
import { fetchScannerAsset, type ScannerAssetSource, type ScannerQueueDocument, type ScannerQueueItem } from "../lib/scannerAssets";

export const DiscoveryPage: React.FC = () => {
  const [items, setItems] = useState<ScannerQueueItem[]>([]);
  const [generatedAt, setGeneratedAt] = useState("");
  const [source, setSource] = useState("");
  const [health, setHealth] = useState<ScannerHealthRecord | null>(null);
  const [assetSource, setAssetSource] = useState<ScannerAssetSource>("unavailable");
  const [loading, setLoading] = useState(true);

  useDocumentMeta({
    title: "Vita port discovery queue — VitaHarbor",
    description: "Public review queue of Vita port threads detected by VitaHarbor before curated promotion."
  });

  useEffect(() => {
    let cancelled = false;
    const refreshScannerAssets = async () => {
      const [queueResult, scanResult] = await Promise.all([
        fetchScannerAsset<ScannerQueueDocument>("discovered.json"),
        fetchScannerAsset<ScannerHealthRecord>("scanner-health.json")
      ]);
      if (cancelled) return;
      const body = queueResult.data;
      const scan = scanResult.data;
      setItems(Array.isArray(body?.items) ? body.items : []);
      setGeneratedAt(typeof body?.generated_at === "string" ? body.generated_at : "");
      setSource(typeof body?.source === "string" ? body.source : "");
      if (scan?.schema_version === 1) setHealth(scan);
      setAssetSource(queueResult.source === "live" && scanResult.source === "live"
        ? "live"
        : queueResult.source === "unavailable" || scanResult.source === "unavailable"
          ? "unavailable"
          : "snapshot");
      setLoading(false);
    };
    void refreshScannerAssets();
    const interval = window.setInterval(() => void refreshScannerAssets(), 15 * 60 * 1000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  const freshness = useMemo(() => scannerFreshness(health), [health]);

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
          {health?.attempted_at && <span className="rounded-full border border-hairline bg-surface px-3 py-1.5">Last attempt {formatUtcDateTime(health.attempted_at)}</span>}
          <span className="rounded-full border border-hairline bg-surface px-3 py-1.5">
            {assetSource === "live" ? "Live scan data" : assetSource === "snapshot" ? "Last deployed snapshot" : "Scan data unavailable"}
          </span>
          {health?.sources.filter((item) => item.status !== "available").map((item) => (
            <span key={item.subreddit} className="rounded-full border border-hairline bg-surface px-3 py-1.5">
              r/{item.subreddit}: {item.status === "rate_limited" ? "rate limited" : "unavailable"}
            </span>
          ))}
          {!health?.attempted_at && generatedAt && <span className="rounded-full border border-hairline bg-surface px-3 py-1.5">Queue snapshot {formatUtcDateTime(generatedAt)}</span>}
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
                {item.url
                  ? <a href={item.url} target="_blank" rel="noopener noreferrer" className="font-medium text-accent hover:underline">Open Reddit source</a>
                  : <span className="text-ink-muted">{item.public_visibility === "withheld" ? "Source withheld pending review" : "Source link unavailable"}</span>}
              </div>
            </li>
          ))}
        </ol>
      )}
    </main>
  );
};
