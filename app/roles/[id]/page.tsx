import { fetchRole, fetchCandidates } from "@/lib/api";
import { notFound } from "next/navigation";
import { RoleDetailClient } from "./client";

export default async function RoleDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [role, candidates] = await Promise.all([
    fetchRole(params.id),
    fetchCandidates(params.id),
  ]);
  if (!role) notFound();
  return <RoleDetailClient role={role} initialCandidates={candidates} />;
}
