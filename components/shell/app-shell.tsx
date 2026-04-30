"use client";

import { usePathname } from "next/navigation";
import { SideNav } from "@/components/shell/side-nav";

const PUBLIC_ROUTES = ["/login", "/signup"];

export function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const isPublic = PUBLIC_ROUTES.some((r) => path?.startsWith(r));

  if (isPublic) return <>{children}</>;

  return (
    <div className="flex min-h-screen bg-paper">
      <SideNav />
      <main className="flex-1 min-w-0 flex flex-col">{children}</main>
    </div>
  );
}
