import { fetchRoles, fetchStats } from "@/lib/api";
import { DashboardClient } from "./client";

/** Server Component — initial data + SSR. Hydrates the client cache. */
export default async function DashboardPage() {
  const [roles, stats] = await Promise.all([fetchRoles(), fetchStats()]);
  return <DashboardClient initialRoles={roles} initialStats={stats} />;
}
