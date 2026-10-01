import React from "react";
import { Link2, ShieldCheck, Scale, type LucideIcon } from "lucide-react";

interface MethodologySectionProps {
  methodRef: React.RefObject<HTMLElement | null>;
}

interface MethodItem {
  Icon: LucideIcon;
  title: string;
  body: string;
}

const METHOD_ITEMS: MethodItem[] = [
  {
    Icon: Link2,
    title: "Direct Source Code",
    body: "Every project links directly to its official public repository or developer announcement thread on r/vitahacks & r/PSVitaHomebrew."
  },
  {
    Icon: ShieldCheck,
    title: "Hardware Tested",
    body: "Playability statuses reflect real PS Vita & PSTV hardware execution—tracking shaders, framerates, audio, and controller input."
  },
  {
    Icon: Scale,
    title: "Clean Homebrew",
    body: "Dedicated strictly to open-source engine recreations, PC decompilations, and legal ARM wrappers. No game assets or copyrighted files are hosted."
  }
];

export const MethodologySection: React.FC<MethodologySectionProps> = ({ methodRef }) => {
  return (
    <section
      id="methodology"
      ref={methodRef}
      aria-labelledby="methodology-heading"
      className="mt-24 border-t border-hairline bg-surface/30"
    >
      <div className="mx-auto max-w-5xl px-6 py-16">
        <p className="text-micro font-medium uppercase tracking-[0.22em] text-ink-medium">Method</p>
        <h2 id="methodology-heading" className="mt-3 text-title font-semibold text-ink">
          How entries get listed
        </h2>
        <div className="mt-10 grid gap-10 sm:grid-cols-3">
          {METHOD_ITEMS.map(({ Icon, title, body }) => (
            <div key={title} className="rounded-2xl border border-hairline bg-surface p-6">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-hairline bg-sunken text-ink">
                <Icon className="h-4.5 w-4.5" />
              </span>
              <h3 className="mt-4 text-subtitle font-medium text-ink">{title}</h3>
              <p className="mt-2 text-body text-ink-medium">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
