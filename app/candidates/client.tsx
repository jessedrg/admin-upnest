"use client";

import { useCandidates } from "@/lib/queries";
import { PageSkeleton, TopProgress } from "@/components/ui/skeleton";
import type { Application } from "@/lib/schemas";

export function CandidatesClient({ initial }: { initial: Application[] }) {
  const q = useCandidates();
  const list = q.data ?? initial;
  return (
    <>
      <header className="sticky top-0 z-10 border-b border-rule-2 bg-paper/85 backdrop-blur">
        <div className="flex h-14 items-center justify-between px-9">
          <h1 className="serif text-[22px] tracking-editorial">Candidates</h1>
          <div className="flex items-center gap-4">
            <span className="text-t-3 text-sm">{list.length} total</span>
            <button className="btn btn-primary">+ Submit candidate</button>
          </div>
        </div>
        <TopProgress active={q.isFetching} />
      </header>
      {q.isLoading ? (
        <PageSkeleton variant="kpi-table" />
      ) : list.length === 0 ? (
        <div className="px-9 py-16 text-center">
          <p className="text-t-3">No candidates found.</p>
          <p className="text-t-3 text-sm mt-2">
            Submit your first candidate to a role to get started.
          </p>
        </div>
      ) : (
        <div className="px-9 py-8 space-y-2">
          {list.map((c) => (
            <div
              key={c.id}
              className="flex items-center gap-4 px-4 py-3 rounded-lg border border-rule-2 bg-paper-soft hover:bg-paper-2"
            >
              <div className="h-9 w-9 rounded-full bg-paper-2 grid place-items-center text-xs">
                {c.candidate_name
                  .split(" ")
                  .map((s) => s[0])
                  .join("")}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">{c.candidate_name}</div>
                <div className="text-xs text-t-3 truncate">
                  {c.candidate_email || c.linkedin_url || "No contact info"}
                </div>
              </div>
              <div className="text-xs text-t-3">
                {c.role?.title || "Unknown role"}
              </div>
              <StatusBadge status={c.status} />
              {c.fit_score != null && (
                <span className="serif text-[20px] tabular-nums">
                  {c.fit_score}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    sourced: "bg-gray-100 text-gray-600",
    submitted: "bg-blue-100 text-blue-700",
    reviewing: "bg-purple-100 text-purple-700",
    interviewing: "bg-amber-100 text-amber-700",
    offered: "bg-emerald-100 text-emerald-700",
    hired: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
    withdrawn: "bg-gray-100 text-gray-500",
  };

  return (
    <span
      className={`inline-flex px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-medium ${colors[status] || colors.submitted}`}
    >
      {status}
    </span>
  );
}
