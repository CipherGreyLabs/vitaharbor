import React, { useEffect, useLayoutEffect, useRef, useState } from "react";

type CountMode = "idle" | "animate" | "instant";

function useCountUp(target: number, mode: CountMode) {
  const [value, setValue] = useState(target);

  useEffect(() => {
    if (mode === "animate") return;
    setValue(target);
  }, [mode, target]);

  useEffect(() => {
    if (mode !== "animate") return;
    let frame = 0;
    const started = performance.now();
    const step = (now: number) => {
      const progress = Math.min(1, (now - started) / 850);
      setValue(Math.round(target * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    setValue(0);
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [mode, target]);

  return value;
}

const StatFigure: React.FC<{ label: string; value: number; note: string; mode: CountMode }> = ({
  label,
  value,
  note,
  mode
}) => {
  const shown = useCountUp(value, mode);
  return (
    <div className="vh-glass vh-interactive flex flex-col justify-between rounded-3xl px-6 py-6 transition-transform hover:-translate-y-1">
      <p className="text-micro font-medium uppercase text-white/45">{label}</p>
      <p className="vh-tnum mt-4 text-display font-display font-semibold text-transparent bg-clip-text bg-gradient-to-br from-white to-ink-muted">{shown}</p>
      <p className="mt-1 text-caption text-white/45">{note}</p>
    </div>
  );
};

export const LedgerStats: React.FC<{ items: Array<[string, number, string]> }> = ({ items }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<CountMode>("idle");

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const alreadyPassed = node.getBoundingClientRect().bottom < 0;
    if (reduced || alreadyPassed) setMode("instant");
  }, []);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setMode("instant");
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setMode("animate");
            observer.disconnect();
          }
        }
      },
      { threshold: 0.35 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section aria-label="Archive at a glance" className="mt-20 bg-deep">
      <div ref={ref} className="mx-auto max-w-5xl px-6 py-10">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-white/10 sm:grid-cols-4">
          {items.map(([label, value, note]) => (
            <StatFigure key={label} label={label} value={value} note={note} mode={mode} />
          ))}
        </div>
      </div>
    </section>
  );
};
