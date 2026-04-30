import { fetchRoles } from "@/lib/api";
import { RolesClient } from "./client";

export default async function RolesPage() {
  const roles = await fetchRoles();
  return <RolesClient initialRoles={roles} />;
}
