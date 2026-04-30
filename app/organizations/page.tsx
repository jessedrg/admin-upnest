import { fetchOrganizations } from "@/lib/api";
import { OrganizationsClient } from "./client";

export default async function OrganizationsPage() {
  const organizations = await fetchOrganizations();
  return <OrganizationsClient initial={organizations} />;
}
