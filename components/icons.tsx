import * as React from "react";

/* Spare line-icon set, hand-drawn feel — no external library */

const SVG = ({
  children,
  size = 18,
  className,
}: {
  children: React.ReactNode;
  size?: number;
  className?: string;
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden
  >
    {children}
  </svg>
);

export const HomeIcon = (p: { size?: number; className?: string }) => (
  <SVG {...p}>
    <path d="M3 10.5L12 3l9 7.5" />
    <path d="M5 9.5V21h14V9.5" />
  </SVG>
);
export const RolesIcon = (p: { size?: number; className?: string }) => (
  <SVG {...p}>
    <rect x="4" y="6" width="16" height="14" rx="2" />
    <path d="M9 6V4h6v2" />
  </SVG>
);
export const CandidatesIcon = (p: { size?: number; className?: string }) => (
  <SVG {...p}>
    <circle cx="12" cy="9" r="3.5" />
    <path d="M5 20c1-3.5 4-5 7-5s6 1.5 7 5" />
  </SVG>
);
export const EmailIcon = (p: { size?: number; className?: string }) => (
  <SVG {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 7l9 6 9-6" />
  </SVG>
);
export const SavedIcon = (p: { size?: number; className?: string }) => (
  <SVG {...p}>
    <path d="M6 4h12v17l-6-4-6 4z" />
  </SVG>
);
export const StatsIcon = (p: { size?: number; className?: string }) => (
  <SVG {...p}>
    <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
  </SVG>
);
export const ToolsIcon = (p: { size?: number; className?: string }) => (
  <SVG {...p}>
    <path d="M14 4l6 6-10 10H4v-6z" />
  </SVG>
);
export const SettingsIcon = (p: { size?: number; className?: string }) => (
  <SVG {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19 12c0 .5 0 1-.1 1.5l2 1.5-2 3.4-2.3-1a7 7 0 01-2.6 1.5l-.4 2.6h-4l-.4-2.6a7 7 0 01-2.6-1.5l-2.3 1-2-3.4 2-1.5C5 13 5 12.5 5 12s0-1 .1-1.5l-2-1.5 2-3.4 2.3 1A7 7 0 0110 5.1L10.4 2.5h4l.4 2.6a7 7 0 012.6 1.5l2.3-1 2 3.4-2 1.5c.1.5.1 1 .1 1.5z" />
  </SVG>
);
export const ContractIcon = (p: { size?: number; className?: string }) => (
  <SVG {...p}>
    <path d="M6 3h9l4 4v14H6z" />
    <path d="M14 3v5h5" />
    <path d="M9 13h7M9 17h5" />
  </SVG>
);
export const PlusIcon = (p: { size?: number; className?: string }) => (
  <SVG {...p}>
    <path d="M12 5v14M5 12h14" />
  </SVG>
);
export const SearchIcon = (p: { size?: number; className?: string }) => (
  <SVG {...p}>
    <circle cx="11" cy="11" r="6" />
    <path d="M20 20l-4-4" />
  </SVG>
);
export const ChevronIcon = (p: { size?: number; className?: string }) => (
  <SVG {...p}>
    <path d="M9 6l6 6-6 6" />
  </SVG>
);
export const ArrowLeftIcon = (p: { size?: number; className?: string }) => (
  <SVG {...p}>
    <path d="M15 18l-6-6 6-6" />
  </SVG>
);
export const LogoutIcon = (p: { size?: number; className?: string }) => (
  <SVG {...p}>
    <path d="M14 8V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2h7a2 2 0 002-2v-2" />
    <path d="M21 12H10M18 9l3 3-3 3" />
  </SVG>
);
