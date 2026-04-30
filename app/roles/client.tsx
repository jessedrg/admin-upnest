"use client";

import Link from "next/link";
import { useRoles } from "@/lib/queries";
import { PageSkeleton, TopProgress } from "@/components/ui/skeleton";
import type { Role } from "@/lib/schemas";

export function RolesClient({ initialRoles }: { initialRoles: Role[] }) {
  const roles = useRoles({ initialData: initialRoles });
  return (
    <>
      <header className="sticky top-0 z-10 border-b border-rule-2 bg-paper/85 backdrop-blur">
        <div className="flex h-14 items-center justify-between px-9">
          <h1 className="serif text-[22px] tracking-editorial">Roles</h1>
          <span className="text-t-3 text-sm">
            {(roles.data ?? []).length} total roles
          </span>
        </div>
        <TopProgress active={roles.isFetching} />
      </header>

      {roles.isLoading ? (
        <PageSkeleton variant="kpi-table" />
      ) : (
        <div className="px-9 py-8">
          <div className="rounded-lg border border-rule-2 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-paper-soft text-left">
                <tr>
                  <th className="px-4 py-3 label">Role</th>
                  <th className="px-4 py-3 label">Company</th>
                  <th className="px-4 py-3 label">Location</th>
                  <th className="px-4 py-3 label">Status</th>
                  <th className="px-4 py-3 label">Candidates</th>
                  <th className="px-4 py-3 label text-right">Bounty</th>
                </tr>
              </thead>
              <tbody>
                {(roles.data ?? []).length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-t-3">
                      No roles found. Create your first role to get started.
                    </td>
                  </tr>
                ) : (
                  (roles.data ?? []).map((r) => (
                    <tr
                      key={r.id}
                      className="border-t border-rule-2 hover:bg-paper-soft/60"
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/roles/${r.id}`}
                          className="hover:underline font-medium"
                        >
                          {r.title}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-t-3">
                        {r.company_name || "—"}
                      </td>
                      <td className="px-4 py-3 text-t-3">
                        {r.location || "Remote"}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={r.status || "draft"} />
                      </td>
                      <td className="px-4 py-3 mono text-xs text-t-3">
                        {r.applications_count ?? 0} candidates
                      </td>
                      <td className="px-4 py-3 text-right serif text-lg">
                        {r.bounty ? `$${(r.bounty / 1000).toFixed(0)}k` : "TBD"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    open: "bg-emerald-100 text-emerald-700",
    active: "bg-emerald-100 text-emerald-700",
    priority: "bg-amber-100 text-amber-700",
    draft: "bg-gray-100 text-gray-600",
    on_hold: "bg-orange-100 text-orange-700",
    filled: "bg-blue-100 text-blue-700",
    closed: "bg-gray-100 text-gray-500",
    pending_approval: "bg-yellow-100 text-yellow-700",
  };

  return (
    <span
      className={`inline-flex px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-medium ${colors[status] || colors.draft}`}
    >
      {status.replace("_", " ")}
    </span>
  );
}
