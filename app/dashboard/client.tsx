"use client";

import Link from "next/link";
import { useRoles, useStats } from "@/lib/queries";
import { PageSkeleton, TopProgress } from "@/components/ui/skeleton";
import type { Role, Stats } from "@/lib/schemas";

export function DashboardClient({
  initialRoles,
  initialStats,
}: {
  initialRoles: Role[];
  initialStats: Stats;
}) {
  const roles = useRoles({ initialData: initialRoles });
  const stats = useStats();

  const loading = roles.isLoading || stats.isLoading;

  return (
    <>
      <header className="sticky top-0 z-10 border-b border-rule-2 bg-paper/85 backdrop-blur">
        <div className="flex h-14 items-center justify-between px-9">
          <h1 className="serif text-[22px] tracking-editorial">Dashboard</h1>
          <div className="flex items-center gap-2">
            <button className="btn btn-ghost">Filters</button>
            <Link href="/roles" className="btn btn-primary">
              + New role
            </Link>
          </div>
        </div>
        <TopProgress active={loading} />
      </header>

      {loading ? (
        <PageSkeleton variant="kpi-cards" />
      ) : (
        <div className="px-9 py-8 space-y-8">
          <Kpis stats={stats.data ?? initialStats} />
          <RolesGrid roles={roles.data ?? []} />
        </div>
      )}
    </>
  );
}

function Kpis({ stats }: { stats: Stats }) {
  const items = [
    {
      label: "Earnings · This month",
      value: `$${stats.earningsThisMonth.toLocaleString()}`,
    },
    {
      label: "Earnings · All time",
      value: `$${stats.earningsAllTime.toLocaleString()}`,
    },
    { label: "Hires", value: stats.hires.toString() },
    { label: "Active Roles", value: stats.rolesActive.toString() },
    { label: "Candidates", value: stats.candidatesSubmitted.toString() },
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {items.map((it) => (
        <div key={it.label} className="card p-5">
          <div className="label">{it.label}</div>
          <div className="serif mt-2 text-[40px] leading-none">{it.value}</div>
        </div>
      ))}
    </div>
  );
}

function RolesGrid({ roles }: { roles: Role[] }) {
  // Filter to show only active/open roles
  const activeRoles = roles.filter((r) =>
    ["open", "priority", "active", "draft"].includes(r.status || "")
  );

  return (
    <div>
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="serif text-[28px] tracking-editorial">Active roles</h2>
        <Link href="/roles" className="text-[12px] text-t-3 hover:text-t-1">
          View all ({roles.length}) →
        </Link>
      </div>
      {activeRoles.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-t-3">No active roles found.</p>
          <Link href="/roles" className="btn btn-primary mt-4">
            Create your first role
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeRoles.slice(0, 6).map((r) => (
            <Link
              key={r.id}
              href={`/roles/${r.id}`}
              className="card p-5 hover:border-rule transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="label">{r.company_name || "No company"}</span>
                {r.priority > 0 && (
                  <span className="text-[10px] mono text-rust uppercase tracking-widest">
                    Priority
                  </span>
                )}
                {r.focus_this_week && (
                  <span className="text-[10px] mono text-emerald-600 uppercase tracking-widest">
                    Focus
                  </span>
                )}
              </div>
              <div className="serif mt-2 text-[24px] leading-tight">
                {r.title}
              </div>
              <div className="text-xs text-t-3 mt-1">
                {r.location || "Remote"} · {r.remote_policy || "Flexible"}
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <span className="mono text-[11px] text-t-3">Bounty</span>
                <span className="serif text-[22px]">
                  {r.bounty
                    ? `$${(r.bounty / 1000).toFixed(0)}k`
                    : "TBD"}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-t-3">
                <span>Status: {r.status}</span>
                {r.applications_count !== undefined && (
                  <span>{r.applications_count} candidates</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
