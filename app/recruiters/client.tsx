"use client";

import { useRecruiters } from "@/lib/queries";
import { PageSkeleton, TopProgress } from "@/components/ui/skeleton";
import type { User } from "@/lib/schemas";

export function RecruitersClient({ initial }: { initial: User[] }) {
  const q = useRecruiters();
  const list = q.data ?? initial;

  return (
    <>
      <header className="sticky top-0 z-10 border-b border-rule-2 bg-paper/85 backdrop-blur">
        <div className="flex h-14 items-center justify-between px-9">
          <h1 className="serif text-[22px] tracking-editorial">Recruiters</h1>
          <div className="flex items-center gap-4">
            <span className="text-t-3 text-sm">{list.length} total</span>
            <button className="btn btn-primary">+ Invite recruiter</button>
          </div>
        </div>
        <TopProgress active={q.isFetching} />
      </header>
      {q.isLoading ? (
        <PageSkeleton variant="kpi-table" />
      ) : list.length === 0 ? (
        <div className="px-9 py-16 text-center">
          <p className="text-t-3">No recruiters found.</p>
        </div>
      ) : (
        <div className="px-9 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {list.map((user) => (
              <div
                key={user.id}
                className="card p-5 hover:border-rule transition-colors"
              >
                <div className="flex items-center gap-4">
                  {user.profile_picture_url ? (
                    <img
                      src={user.profile_picture_url}
                      alt=""
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-paper-2 grid place-items-center text-sm">
                      {(user.full_name || user.email || "?")
                        .split(" ")
                        .map((s) => s[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">
                      {user.full_name || user.first_name || "Unknown"}
                    </div>
                    <div className="text-xs text-t-3 truncate">
                      {user.email}
                    </div>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  {user.linkedin_url && (
                    <a
                      href={user.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-t-3 hover:underline flex items-center gap-1"
                    >
                      LinkedIn
                    </a>
                  )}
                  <div className="flex items-center justify-between">
                    <StatusBadge status={user.status || "active"} />
                    {user.bounty_percentage && (
                      <span className="text-xs text-t-3">
                        {user.bounty_percentage}% commission
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    active: "bg-emerald-100 text-emerald-700",
    approved: "bg-emerald-100 text-emerald-700",
    pending: "bg-yellow-100 text-yellow-700",
    suspended: "bg-red-100 text-red-700",
    inactive: "bg-gray-100 text-gray-500",
  };

  return (
    <span
      className={`inline-flex px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-medium ${colors[status] || colors.active}`}
    >
      {status}
    </span>
  );
}
