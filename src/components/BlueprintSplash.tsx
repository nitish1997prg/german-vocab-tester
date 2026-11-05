
"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function BlueprintSplash() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (pathname !== "/") return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const timeout = window.setTimeout(
      () => setVisible(false),
      reducedMotion ? 0 : 1150
    );

    return () => window.clearTimeout(timeout);
  }, [pathname]);

  if (!visible || pathname !== "/") {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className="
        wm-blueprint-overlay
        fixed inset-0 z-[100]
        flex items-center justify-center
        overflow-hidden bg-[#0F1117]
        text-white
      "
    >
      {/* Architectural blueprint grid */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(
              to right,
              rgba(148,163,184,0.1) 1px,
              transparent 1px
            ),
            linear-gradient(
              to bottom,
              rgba(148,163,184,0.1) 1px,
              transparent 1px
            )
          `,
          backgroundSize: "24px 24px",
        }}
      />

      <svg
        viewBox="0 0 360 420"
        className="relative w-[min(85vw,420px)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Drafting guides */}
        <g
          stroke="#94A3B8"
          strokeWidth="0.6"
          strokeDasharray="4 5"
          opacity="0.35"
        >
          <path d="M180 32V350" />
          <path d="M50 310H310" />
          <path d="M60 248H300" />
          <circle cx="180" cy="215" r="125" />
        </g>

        {/* Animated geometric Ä */}
        <g
          className="wm-blueprint-trace"
          stroke="#F8FAFC"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M105 310 L180 110 L255 310" />
          <path d="M130 248 H230" />
          <circle cx="158" cy="82" r="11" />
          <circle cx="202" cy="82" r="11" />
        </g>

        {/* App branding */}
        <text
          x="180"
          y="375"
          fill="#F8FAFC"
          fontSize="24"
          fontWeight="700"
          letterSpacing="4"
          textAnchor="middle"
        >
          WORTMEISTER
        </text>

        <text
          x="180"
          y="401"
          fill="#94A3B8"
          fontSize="11"
          letterSpacing="2"
          textAnchor="middle"
        >
          DEUTSCH VOKABELN LERNEN
        </text>
      </svg>

      {/* Architectural title block */}
      <div
        className="
          absolute bottom-7 right-4
          border border-white/40
          bg-[#0F1117]/80
          p-3 font-mono
          text-[10px] leading-5
          text-gray-300
        "
      >
        <p>Projekt: Wortmeister</p>
        <p>Level: A1–B2</p>
        <p>Maßstab: 1:1</p>
      </div>
    </div>
  );
}
