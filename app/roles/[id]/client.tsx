"use client";

import { useState } from "react";
import Link from "next/link";
import { useCandidates } from "@/lib/queries";
import { TopProgress } from "@/components/ui/skeleton";
import { ArrowLeftIcon } from "@/components/icons";
import type { Role, Candidate } from "@/lib/schemas";
import { clsx } from "clsx";

const TABS = ["role", "candidates", "sourcing", "rejections"] as const;
type Tab = (typeof TABS)[number];

export function RoleDetailClient({
  role,
  initialCandidates,
}: {
  role: Role;
  initialCandidates: Candidate[];
}) {
  const [tab, setTab] = useState<Tab>("role");
  const candidates = useCandidates(role.id);

  return (
    <>
      <header className="sticky top-0 z-10 border-b border-rule-2 bg-paper/85 backdrop-blur">
        <div className="flex h-14 items-center gap-4 px-9">
          <Link href="/dashboard" className="text-t-3 hover:text-t-1">
            <ArrowLeftIcon size={18} />
          </Link>
          <div>
            <div className="label">{role.company}</div>
            <h1 className="serif text-[20px] leading-none tracking-editorial">
              {role.title}
            </h1>
          </div>
          <div className="ml-auto flex gap-1">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={clsx(
                  "px-3 py-1.5 text-[12px] capitalize rounded-full",
                  tab === t
                    ? "bg-ink text-paper"
                    : "text-t-3 hover:text-t-1 hover:bg-paper-2",
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <TopProgress active={candidates.isFetching} />
      </header>

      <div className="px-9 py-8 space-y-6">
        {tab === "role" && <RoleTab role={role} />}
        {tab === "candidates" && (
          <CandidatesTab list={candidates.data ?? initialCandidates} />
        )}
        {tab === "sourcing" && (
          <p className="text-t-3 italic serif">Sourcing tools — coming soon.</p>
        )}
        {tab === "rejections" && (
          <p className="text-t-3 italic serif">No rejections to review.</p>
        )}
      </div>
    </>
  );
}

function RoleTab({ role }: { role: Role }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-4">
        <div className="card p-6">
          <div className="label mb-2">Brief</div>
          <p className="text-[15px] leading-relaxed text-t-2">
            {role.description ?? "No description provided yet."}
          </p>
        </div>
        <div className="card p-6">
          <div className="label mb-3">Pipeline</div>
          <div className="grid grid-cols-5 gap-2">
            {Object.entries(role.pipeline).map(([k, v]) => (
              <div key={k} className="rounded-lg bg-paper-2 p-3">
                <div className="label text-[9px]">{k}</div>
                <div className="serif text-[28px] leading-none mt-1">{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <aside className="space-y-4">
        <div className="card p-5">
          <div className="label">Bounty</div>
          <div className="serif text-[40px] leading-none mt-1">
            ${(role.bounty.amount / 1000).toFixed(0)}k
          </div>
        </div>
        <div className="card p-5 space-y-2">
          <div className="label mb-1">Details</div>
          <div className="text-sm flex justify-between">
            <span className="text-t-3">Location</span>
            <span>{role.location}</span>
          </div>
          <div className="text-sm flex justify-between">
            <span className="text-t-3">Remote</span>
            <span className="capitalize">{role.remote}</span>
          </div>
          <div className="text-sm flex justify-between">
            <span className="text-t-3">Status</span>
            <span className="capitalize">{role.status.replace("_", " ")}</span>
          </div>
        </div>
      </aside>
    </div>
  );
}

function CandidatesTab({ list }: { list: Candidate[] }) {
  return (
    <div className="space-y-2">
      {list.map((c) => (
        <div
          key={c.id}
          className="flex items-center gap-4 px-4 py-3 rounded-lg border border-rule-2 bg-paper-soft"
        >
          <div className="h-9 w-9 rounded-full bg-paper-2 grid place-items-center text-xs">
            {c.name
              .split(" ")
              .map((s) => s[0])
              .join("")}
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
  );
}
