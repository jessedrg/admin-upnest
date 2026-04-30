"use client";

import { useCandidates } from "@/lib/queries";
import { PageSkeleton, TopProgress } from "@/components/ui/skeleton";
import type { Candidate } from "@/lib/schemas";

export function CandidatesClient({ initial }: { initial: Candidate[] }) {
  const q = useCandidates();
  const list = q.data ?? initial;
  return (
    <>
      <header className="sticky top-0 z-10 border-b border-rule-2 bg-paper/85 backdrop-blur">
        <div className="flex h-14 items-center justify-between px-9">
          <h1 className="serif text-[22px] tracking-editorial">Candidates</h1>
          <button className="btn btn-primary">+ Submit candidate</button>
        </div>
        <TopProgress active={q.isFetching} />
      </header>
      {q.isLoading ? (
        <PageSkeleton variant="kpi-table" />
      ) : (
        <div className="px-9 py-8 space-y-2">
          {list.map((c) => (
            <div
              key={c.id}
              className="flex items-center gap-4 px-4 py-3 rounded-lg border border-rule-2 bg-paper-soft hover:bg-paper-2"
            >
              <div className="h-9 w-9 rounded-full bg-paper-2 grid place-items-center text-xs">
                {c.name.split(" ").map((s) => s[0]).join("")}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">{c.name}</div>
                <div className="text-xs text-t-3 truncate">{c.title}</div>
              </div>
              <span className="mono text-[10px] uppercase tracking-widest text-t-3">
                {c.stage}
              </span>
              {c.fitScore != null && (
                <span className="serif text-[20px] tabular-nums">{c.fitScore}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
