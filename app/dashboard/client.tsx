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
            <button className="btn btn-primary">+ New role</button>
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
    { label: "Earnings · This month", value: `$${stats.earningsThisMonth.toLocaleString()}` },
    { label: "Earnings · All time", value: `$${stats.earningsAllTime.toLocaleString()}` },
    { label: "Hires", value: stats.hires.toString() },
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
  return (
    <div>
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="serif text-[28px] tracking-editorial">Active roles</h2>
        <Link href="/roles" className="text-[12px] text-t-3 hover:text-t-1">
          View all →
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roles.map((r) => (
          <Link
            key={r.id}
            href={`/roles/${r.id}`}
            className="card p-5 hover:border-rule transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="label">{r.company}</span>
              {r.priority && (
                <span className="text-[10px] mono text-rust uppercase tracking-widest">
                  Priority
                </span>
              )}
            </div>
            <div className="serif mt-2 text-[24px] leading-tight">
              {r.title}
            </div>
            <div className="text-xs text-t-3 mt-1">
              {r.location} · {r.remote}
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="mono text-[11px] text-t-3">Bounty</span>
              <span className="serif text-[22px]">
                ${(r.bounty.amount / 1000).toFixed(0)}k
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
