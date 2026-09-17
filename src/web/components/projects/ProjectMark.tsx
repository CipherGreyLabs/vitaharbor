import React from "react";

/**
 * A deterministic mark per project, derived from its slug.
 *
 * The archive cannot use publisher artwork, so each entry gets its own generated
 * identity instead: a gradient tile plus one of four geometric motifs. The same
 * slug always produces the same mark, which makes the list scannable by shape and
 * colour without shipping a single image file.
 */
const PALETTES: Array<[string, string]> = [
  ["#1d4ed8", "#0ea5e9"],
  ["#047857", "#34d399"],
  ["#b91c1c", "#fb923c"],
  ["#6d28d9", "#c084fc"],
  ["#0f766e", "#2dd4bf"],
  ["#9d174d", "#f472b6"],
  ["#0369a1", "#38bdf8"],
  ["#a16207", "#facc15"]
];

const DOT_GRID: Array<[number, number]> = [
  [10, 10], [26, 10], [42, 10],
  [10, 26], [42, 26],
  [10, 42], [26, 42], [42, 42]
];

function seedOf(value: string) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export const ProjectMark: React.FC<{ seed: string; size?: number; className?: string }> = ({
  seed,
  size = 44,
  className
}) => {
  const hash = seedOf(seed || "vita");
  const [from, to] = PALETTES[hash % PALETTES.length];
  const motif = Math.floor(hash / 7) % 6;
  const tilt = (hash % 90) - 45;
  const id = "mark-" + hash.toString(36);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="presentation"
      aria-hidden="true"
      className={className}
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={from} />
          <stop offset="1" stopColor={to} />
        </linearGradient>
        <clipPath id={id + "-clip"}>
          <rect width="64" height="64" rx="16" />
        </clipPath>
      </defs>

      <g clipPath={"url(#" + id + "-clip)"}>
        <rect width="64" height="64" fill={"url(#" + id + ")"} />

        {motif === 0 && (
          <rect
            x="-20"
            y="36"
            width="104"
            height="16"
            fill="#ffffff"
            opacity="0.24"
            transform={"rotate(" + tilt + " 32 32)"}
          />
        )}

        {motif === 1 && (
          <>
            <circle cx="32" cy="42" r="26" fill="#ffffff" opacity="0.10" />
            <circle cx="32" cy="42" r="17" fill="#ffffff" opacity="0.14" />
            <circle cx="32" cy="42" r="8" fill="#ffffff" opacity="0.20" />
          </>
        )}

        {motif === 2 &&
          DOT_GRID.map(([cx, cy]) => (
            <circle key={cx + "-" + cy} cx={cx} cy={cy} r="3.2" fill="#ffffff" opacity="0.28" />
          ))}

        {motif === 3 && (
          <>
            <path d="M-8 42 L32 14 L72 42" stroke="#ffffff" strokeWidth="9" fill="none" opacity="0.20" />
            <path d="M-8 62 L32 34 L72 62" stroke="#ffffff" strokeWidth="9" fill="none" opacity="0.13" />
          </>
        )}
        {motif === 4 && (
          <>
            <rect x="9" y="9" width="46" height="46" rx="11" fill="none" stroke="#ffffff" strokeWidth="4" opacity="0.18" />
            <rect x="20" y="20" width="24" height="24" rx="7" fill="#ffffff" opacity="0.16" />
          </>
        )}

        {motif === 5 && (
          <>
            <path d="M-12 60 L28 -8" stroke="#ffffff" strokeWidth="10" opacity="0.16" />
            <path d="M14 76 L54 8" stroke="#ffffff" strokeWidth="10" opacity="0.12" />
            <path d="M40 92 L80 24" stroke="#ffffff" strokeWidth="10" opacity="0.09" />
          </>
        )}

      </g>
    </svg>
  );
};

