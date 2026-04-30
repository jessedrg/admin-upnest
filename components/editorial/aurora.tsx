"use client";

import * as React from "react";

/**
 * Aurora — soft animated paper-noise background.
 * Pure CSS, no canvas. Drop into any container with `position: relative`.
 */
export function Aurora({
  intensity = 0.5,
  className = "",
}: {
  intensity?: number;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      style={{ opacity: intensity }}
    >
      <div
        className="absolute -left-1/4 -top-1/4 h-[60vmax] w-[60vmax] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle at center, rgba(107,63,91,0.20), transparent 60%)",
          animation: "aurora1 22s ease-in-out infinite alternate",
        }}
      />
      <div
        className="absolute -right-1/4 top-1/3 h-[55vmax] w-[55vmax] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle at center, rgba(200,168,120,0.20), transparent 60%)",
          animation: "aurora2 28s ease-in-out infinite alternate",
        }}
      />
      <style jsx>{`
        @keyframes aurora1 {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(8%, 4%) scale(1.1); }
        }
        @keyframes aurora2 {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(-6%, -3%) scale(1.05); }
        }
      `}</style>
    </div>
  );
}
