"use client";

import * as React from "react";
import { clsx } from "clsx";

type Toast = { id: string; title: string; tone?: "default" | "success" | "error" };
type Ctx = { toast: (t: Omit<Toast, "id">) => void };

const ToastCtx = React.createContext<Ctx | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<Toast[]>([]);
  const toast = React.useCallback((t: Omit<Toast, "id">) => {
    const id = String(Math.random()).slice(2);
    setItems((s) => [...s, { id, ...t }]);
    setTimeout(() => setItems((s) => s.filter((x) => x.id !== id)), 3500);
  }, []);
  return (
    <ToastCtx.Provider value={{ toast }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[100] flex flex-col items-center gap-2">
        {items.map((t) => (
          <div
            key={t.id}
            className={clsx(
              "pointer-events-auto rounded-full border px-4 py-2 text-sm shadow-lg backdrop-blur",
              "border-rule-2 bg-paper-soft/90 text-t-1 animate-fade-in",
              t.tone === "success" && "border-moss/40 text-moss",
              t.tone === "error" && "border-rust/40 text-rust",
            )}
          >
            {t.title}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = React.useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}
