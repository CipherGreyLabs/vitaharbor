import React from "react";

/**
 * The LiveArea wave, the one visual motif the PlayStation Vita interface is
 * remembered for: stacked translucent ribbons drifting against each other.
 *
 * Kept in the PlayStation blue family at low opacity so it reads as depth behind
 * the hardware rather than as decoration on top of it. Motion is slow and is
 * disabled entirely under prefers-reduced-motion.
 */
export const LiveAreaWaves: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 1440 620"
    preserveAspectRatio="xMidYMid slice"
    aria-hidden="true"
    role="presentation"
    className={className}
  >
    <defs>
      <linearGradient id="livearea-a" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#0070d1" stopOpacity="0.22" />
        <stop offset="1" stopColor="#00a2ff" stopOpacity="0.04" />
      </linearGradient>
      <linearGradient id="livearea-b" x1="1" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#2f8fff" stopOpacity="0.16" />
        <stop offset="1" stopColor="#0070d1" stopOpacity="0.03" />
      </linearGradient>
      <linearGradient id="livearea-c" x1="0" y1="1" x2="1" y2="0">
        <stop offset="0" stopColor="#7cc4ff" stopOpacity="0.12" />
        <stop offset="1" stopColor="#0070d1" stopOpacity="0.03" />
      </linearGradient>
    </defs>

    <g className="vh-wave">
      <path
        d="M-80 404 C 220 236 452 528 756 336 C 1010 174 1244 214 1520 320 L1520 720 L-80 720 Z"
        fill="url(#livearea-a)"
      />
    </g>

    <g className="vh-wave vh-wave-slow">
      <path
        d="M-80 470 C 260 322 470 566 792 408 C 1052 280 1256 300 1520 392 L1520 720 L-80 720 Z"
        fill="url(#livearea-b)"
      />
    </g>

    <g className="vh-wave vh-wave-fast">
      <path
        d="M-80 534 C 300 420 500 610 820 486 C 1080 386 1268 404 1520 470 L1520 720 L-80 720 Z"
        fill="url(#livearea-c)"
      />
    </g>
  </svg>
);

