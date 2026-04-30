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
                  <th className="px-4 py-3 label">Status</th>
                  <th className="px-4 py-3 label">Pipeline</th>
                  <th className="px-4 py-3 label text-right">Bounty</th>
                </tr>
              </thead>
              <tbody>
                {(roles.data ?? []).map((r) => (
                  <tr
                    key={r.id}
                    className="border-t border-rule-2 hover:bg-paper-soft/60"
                  >
                    <td className="px-4 py-3">
                      <Link href={`/roles/${r.id}`} className="hover:underline">
                        {r.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-t-3">{r.company}</td>
                    <td className="px-4 py-3">
                      <span className="mono text-[10px] uppercase tracking-widest text-t-3">
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 mono text-xs text-t-3">
                      {r.pipeline.submitted} submitted ·{" "}
                      {r.pipeline.interviewing} in process
                    </td>
                    <td className="px-4 py-3 text-right serif text-lg">
                      ${(r.bounty.amount / 1000).toFixed(0)}k
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
