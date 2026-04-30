"use client";

import { useState } from "react";
import Link from "next/link";
import { useCandidates } from "@/lib/queries";
import { TopProgress } from "@/components/ui/skeleton";
import { ArrowLeftIcon } from "@/components/icons";
import type { Role, Application } from "@/lib/schemas";
import { clsx } from "clsx";

const TABS = ["role", "candidates", "sourcing", "rejections"] as const;
type Tab = (typeof TABS)[number];

export function RoleDetailClient({
  role,
  initialCandidates,
}: {
  role: Role;
  initialCandidates: Application[];
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
            <div className="label">{role.company_name || "No company"}</div>
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
                    : "text-t-3 hover:text-t-1 hover:bg-paper-2"
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
          <div className="label mb-2">Description</div>
          <p className="text-[15px] leading-relaxed text-t-2">
            {role.description ?? "No description provided yet."}
          </p>
        </div>
        {role.requirements && (
          <div className="card p-6">
            <div className="label mb-2">Requirements</div>
            <p className="text-[15px] leading-relaxed text-t-2">
              {role.requirements}
            </p>
          </div>
        )}
        <div className="card p-6">
          <div className="label mb-3">Candidates</div>
          <div className="text-center py-4">
            <span className="serif text-[40px]">
              {role.applications_count ?? 0}
            </span>
            <span className="text-t-3 ml-2">total candidates</span>
          </div>
        </div>
      </div>
      <aside className="space-y-4">
        <div className="card p-5">
          <div className="label">Bounty</div>
          <div className="serif text-[40px] leading-none mt-1">
            {role.bounty ? `$${(role.bounty / 1000).toFixed(0)}k` : "TBD"}
          </div>
        </div>
        <div className="card p-5 space-y-2">
          <div className="label mb-1">Details</div>
          <div className="text-sm flex justify-between">
            <span className="text-t-3">Location</span>
            <span>{role.location || "Remote"}</span>
          </div>
          <div className="text-sm flex justify-between">
            <span className="text-t-3">Remote Policy</span>
            <span className="capitalize">{role.remote_policy || "Flexible"}</span>
          </div>
          <div className="text-sm flex justify-between">
            <span className="text-t-3">Status</span>
            <span className="capitalize">
              {(role.status || "draft").replace("_", " ")}
            </span>
          </div>
          {role.salary_range && (
            <div className="text-sm flex justify-between">
              <span className="text-t-3">Salary</span>
              <span>{role.salary_range}</span>
            </div>
          )}
          {role.experience_level && (
            <div className="text-sm flex justify-between">
              <span className="text-t-3">Experience</span>
              <span>{role.experience_level}</span>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}

function CandidatesTab({ list }: { list: Application[] }) {
  if (list.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-t-3">No candidates submitted for this role yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {list.map((c) => (
        <div
          key={c.id}
          className="flex items-center gap-4 px-4 py-3 rounded-lg border border-rule-2 bg-paper-soft"
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
          <span className="mono text-[10px] uppercase tracking-widest text-t-3">
            {c.status}
          </span>
          {c.fit_score != null && (
            <span className="serif text-[20px] tabular-nums">{c.fit_score}</span>
          )}
        </div>
      ))}
    </div>
  );
}
