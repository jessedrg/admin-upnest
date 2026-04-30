import { createClient } from "@/lib/supabase/server";
import { OrgSchema, type Org } from "@/lib/schemas";
import { z } from "zod";

/* ─── Reads ───────────────────────────────────────────────────────── */
export async function fetchOrganizations(): Promise<Org[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("client_organizations")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching organizations:", error);
    throw new Error(error.message);
  }

  return z.array(OrgSchema).parse(data || []);
}

export async function fetchOrganization(id: string): Promise<Org | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("client_organizations")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    console.error("Error fetching organization:", error);
    throw new Error(error.message);
  }

  return OrgSchema.parse(data);
}

/* ─── Mutations ───────────────────────────────────────────────────── */
export const CreateOrgInput = z.object({
  name: z.string().min(2),
  website: z.string().url().optional(),
  industry: z.string().optional(),
  company_size: z.string().optional(),
  description: z.string().optional(),
  contact_name: z.string().optional(),
  contact_email: z.string().email().optional(),
  contact_phone: z.string().optional(),
});
export type CreateOrgInput = z.infer<typeof CreateOrgInput>;

export async function createOrganization(input: CreateOrgInput): Promise<Org> {
  const supabase = await createClient();
  const parsed = CreateOrgInput.parse(input);

  const { data, error } = await supabase
    .from("client_organizations")
    .insert(parsed)
    .select()
    .single();

  if (error) {
    console.error("Error creating organization:", error);
    throw new Error(error.message);
  }

  return OrgSchema.parse(data);
}

export async function updateOrganization(
  id: string,
  updates: Partial<CreateOrgInput>
): Promise<Org> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("client_organizations")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating organization:", error);
    throw new Error(error.message);
  }

  return OrgSchema.parse(data);
}

export async function deleteOrganization(id: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("client_organizations")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting organization:", error);
    throw new Error(error.message);
  }
}
