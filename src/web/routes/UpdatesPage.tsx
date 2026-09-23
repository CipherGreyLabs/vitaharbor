import React from "react";
import { Link } from "react-router-dom";
import { FALLBACK_UPDATES } from "@/shared/constants/fallbackData";
import { useDocumentMeta } from "../lib/useDocumentMeta";
import { formatUtcDateTime, verificationMeta } from "../components/ledger/types";

export const UpdatesPage: React.FC = () => {
  useDocumentMeta({
    title: "Vita port updates — VitaHarbor",
    description: "Chronological, source-linked PlayStation Vita port development updates tracked by VitaHarbor."
  });
  const updates = [...FALLBACK_UPDATES].sort(
    (a, b) => new Date(b.event_at).getTime() - new Date(a.event_at).getTime()
  );

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-6 py-10 sm:py-14">
      <nav className="flex flex-wrap items-center justify-between gap-4 text-body">
        <Link to="/" className="font-semibold text-ink hover:text-accent">VitaHarbor</Link>
        <div className="flex gap-4 text-ink-muted">
          <Link to="/discovery" className="hover:text-ink">Discovery</Link>
          <Link to="/#directory" className="hover:text-ink">Directory</Link>
        </div>
      </nav>
      <header className="mt-14 border-b border-hairline-strong/30 pb-6">
        <p className="text-micro font-semibold uppercase tracking-[0.16em] text-ink-muted">Chronological ledger</p>
        <h1 className="mt-3 text-display font-semibold tracking-tight text-ink">All updates</h1>
        <p className="mt-4 max-w-2xl text-lead text-ink-medium">Verified and source-linked project events, newest first.</p>
      </header>
      <ol className="mt-8 space-y-4">
        {updates.map((update) => {
          const sourceUrl = update.sources?.[0]?.canonical_url;
          const verification = verificationMeta(update.verification_level);
          return (
            <li key={update.id} className="rounded-2xl border border-hairline bg-surface p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3 text-caption text-ink-muted">
                {update.project_slug ? <Link to={`/projects/${update.project_slug}/`} className="font-medium text-accent hover:underline">{update.project_display_name || update.project_slug}</Link> : <span>{update.project_display_name || "Unassigned project"}</span>}
                <time dateTime={new Date(update.event_at).toISOString()}>{formatUtcDateTime(update.event_at)}</time>
              </div>
              <h2 className="mt-3 text-subtitle font-semibold text-ink">{update.title}</h2>
              <p className="mt-2 text-body leading-relaxed text-ink-medium">{update.summary}</p>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-hairline pt-3 text-caption text-ink-muted">
                <span title={verification.description}>{verification.label}</span>
                {sourceUrl && <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-accent hover:underline">Open source</a>}
              </div>
            </li>
          );
        })}
      </ol>
    </main>
  );
};
