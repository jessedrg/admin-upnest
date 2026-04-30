"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clsx } from "clsx";
import {
  HomeIcon,
  RolesIcon,
  CandidatesIcon,
  StatsIcon,
  SettingsIcon,
  ContractIcon,
  LogoutIcon,
} from "@/components/icons";
import { createClient } from "@/lib/supabase/client";

const NAV = [
  { href: "/dashboard", label: "Overview", icon: HomeIcon },
  { href: "/roles", label: "Roles", icon: RolesIcon },
  { href: "/candidates", label: "Candidates", icon: CandidatesIcon },
  { href: "/organizations", label: "Organizations", icon: ContractIcon },
  { href: "/recruiters", label: "Recruiters", icon: CandidatesIcon },
  { href: "/contracts", label: "Contracts", icon: ContractIcon },
  { href: "/stats", label: "Stats", icon: StatsIcon },
  { href: "/activity", label: "Activity", icon: HomeIcon },
  { href: "/settings", label: "Settings", icon: SettingsIcon },
];

export function SideNav() {
  const path = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <aside className="hidden md:flex w-[220px] flex-col border-r border-rule-2 bg-paper-soft py-6 px-3">
      <div className="px-3 mb-6">
        <div className="serif text-[28px] leading-none">Upnest</div>
        <div className="label mt-1">Admin</div>
      </div>
      <nav className="flex flex-col gap-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = path === href || path?.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href as never}
              className={clsx(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] tracking-tight",
                active
                  ? "bg-paper-2 text-t-1"
                  : "text-t-2 hover:bg-paper-2 hover:text-t-1",
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto px-3">
        <button 
          onClick={handleSignOut}
          className="flex items-center gap-2 text-[12px] text-t-3 hover:text-t-1"
        >
          <LogoutIcon size={14} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
