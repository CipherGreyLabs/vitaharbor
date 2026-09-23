import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDocumentMeta } from "../lib/useDocumentMeta";
import { formatUtcDateTime } from "../components/ledger/types";
import { fetchCommunityPosts, type CommunityPost } from "../lib/scannerAssets";

export const DiscoveryPage: React.FC = () => {
  const [items, setItems] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(false);

  useDocumentMeta({
    title: "VitaHarbor community posts",
    description: "Recent Reddit posts about PlayStation Vita ports and updates. Posts here are unverified leads unless included in the project directory."
  });

  useEffect(() => {
    let cancelled = false;
    const refreshCommunityPosts = async () => {
      const result = await fetchCommunityPosts();
      if (cancelled) return;
      setItems(result.data?.items || []);
      setUnavailable(result.source === "unavailable");
      setLoading(false);
    };
    void refreshCommunityPosts();
    const interval = window.setInterval(() => void refreshCommunityPosts(), 15 * 60 * 1000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

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
        <p className="text-micro font-semibold uppercase tracking-[0.16em] text-ink-muted">From the community</p>
        <h1 className="mt-3 text-display font-semibold tracking-tight text-ink">Community posts</h1>
        <p className="mt-4 max-w-2xl text-lead text-ink-medium">
          Recent Reddit posts about possible Vita ports and updates. Each item is an unverified lead, not a confirmed project or release.
        </p>
      </header>
      {loading ? <p className="py-12 text-body text-ink-muted">Loading community posts…</p> : unavailable ? (
        <p className="py-12 text-body text-ink-muted">Community posts are temporarily unavailable. Please try again later.</p>
      ) : items.length === 0 ? (
        <p className="py-12 text-body text-ink-muted">There are no community posts to show right now.</p>
      ) : (
        <ul aria-label="Unverified community posts" className="mt-8 space-y-3">
          {items.map((item) => (
            <li key={item.url} className="rounded-2xl border border-hairline bg-surface p-5">
              <div className="flex flex-wrap items-center gap-2 text-micro font-semibold uppercase tracking-[0.1em] text-ink-muted">
                <span>Unverified lead</span>
                <span aria-hidden="true">·</span>
                <span>r/{item.subreddit}</span>
              </div>
              <h2 className="mt-2 text-subtitle font-semibold text-ink">{item.title}</h2>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-caption text-ink-muted">
                <span>{item.published_at ? `Posted ${formatUtcDateTime(item.published_at)}` : "Publication date unavailable"}</span>
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="font-medium text-accent hover:underline">
                  Open original post
                </a>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
};
