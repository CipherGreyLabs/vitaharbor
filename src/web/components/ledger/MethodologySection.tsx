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
    title: "Sourced",
    body: "Every entry links to the original engineering thread on r/vitahacks or r/VitaPiracy."
  },
  {
    Icon: ShieldCheck,
    title: "Verified",
    body: "Stage and performance notes come from the people running the build on real hardware."
  },
  {
    Icon: Scale,
    title: "Non-infringing",
    body: "Only discussion and source repositories are indexed. No ROMs, ISOs or game data are hosted."
  }
];

export const MethodologySection: React.FC<MethodologySectionProps> = ({ methodRef }) => {
  return (
    <section
      id="methodology"
      ref={methodRef}
      data-reveal=""
      aria-labelledby="methodology-heading"
      className="mt-24 bg-deep"
    >
      <div className="mx-auto max-w-5xl px-6 py-16">
        <p className="text-micro font-medium uppercase tracking-[0.22em] text-ink-medium">Method</p>
        <h2 id="methodology-heading" className="mt-3 text-title font-semibold text-white">
          How entries get listed
        </h2>
        <div className="mt-10 grid gap-10 sm:grid-cols-3">
          {METHOD_ITEMS.map(({ Icon, title, body }) => (
            <div key={title}>
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white">
                <Icon className="h-4.5 w-4.5" />
              </span>
              <h3 className="mt-4 text-subtitle font-medium text-white">{title}</h3>
              <p className="mt-2 text-body text-ink-medium">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
