import { createClient } from "@/lib/supabase/server";
import { RoleSchema, type Role } from "@/lib/schemas";
import { z } from "zod";

/* ─── Reads ───────────────────────────────────────────────────────── */
export async function fetchRoles(): Promise<Role[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("roles")
    .select(`
      *,
      applications:applications(count)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching roles:", error);
    throw new Error(error.message);
  }

  // Transform the data to include applications_count
  const roles = (data || []).map((role) => ({
    ...role,
    applications_count: role.applications?.[0]?.count ?? 0,
  }));

  return z.array(RoleSchema).parse(roles);
}

export async function fetchRole(id: string): Promise<Role | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("roles")
    .select(`
      *,
      applications:applications(count)
    `)
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // Not found
    console.error("Error fetching role:", error);
    throw new Error(error.message);
  }

  const role = {
    ...data,
    applications_count: data.applications?.[0]?.count ?? 0,
  };

  return RoleSchema.parse(role);
}

/* ─── Mutations ───────────────────────────────────────────────────── */
export const CreateRoleInput = z.object({
  title: z.string().min(2),
  company_name: z.string().min(2),
  location: z.string().optional(),
  remote_policy: z.enum(["onsite", "hybrid", "remote"]).optional(),
  bounty: z.number().min(0).optional(),
  description: z.string().optional(),
  requirements: z.string().optional(),
  salary_range: z.string().optional(),
  experience_level: z.string().optional(),
  department: z.string().optional(),
  type: z.string().optional(),
});
export type CreateRoleInput = z.infer<typeof CreateRoleInput>;

export async function createRole(input: CreateRoleInput): Promise<Role> {
  const supabase = await createClient();
  const parsed = CreateRoleInput.parse(input);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("roles")
    .insert({
      ...parsed,
      created_by: user.id,
      status: "draft",
      is_published: false,
      priority: 0,
      focus_this_week: false,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating role:", error);
    throw new Error(error.message);
  }

  return RoleSchema.parse(data);
}

export async function updateRoleStatus(
  id: string,
  status: string
): Promise<Role> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("roles")
    .update({
      status,
      updated_at: new Date().toISOString(),
      ...(status === "open" && { is_published: true, published_at: new Date().toISOString() }),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating role status:", error);
    throw new Error(error.message);
  }

  return RoleSchema.parse(data);
}

export async function updateRole(
  id: string,
  updates: Partial<CreateRoleInput>
): Promise<Role> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("roles")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating role:", error);
    throw new Error(error.message);
  }

  return RoleSchema.parse(data);
}

export async function deleteRole(id: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.from("roles").delete().eq("id", id);

  if (error) {
    console.error("Error deleting role:", error);
    throw new Error(error.message);
  }
}
