import { createClient } from "@/lib/supabase/server";
import { UserSchema, type User } from "@/lib/schemas";
import { z } from "zod";

/* ─── Reads ───────────────────────────────────────────────────────── */
export async function fetchUsers(filters?: {
  role?: string;
  status?: string;
  agency_id?: string;
}): Promise<User[]> {
  const supabase = await createClient();

  let query = supabase
    .from("user_profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (filters?.role) {
    query = query.eq("role", filters.role);
  }
  if (filters?.status) {
    query = query.eq("status", filters.status);
  }
  if (filters?.agency_id) {
    query = query.eq("agency_id", filters.agency_id);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching users:", error);
    throw new Error(error.message);
  }

  return z.array(UserSchema).parse(data || []);
}

export async function fetchRecruiters(): Promise<User[]> {
  return fetchUsers({ role: "recruiter" });
}

export async function fetchUser(id: string): Promise<User | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    console.error("Error fetching user:", error);
    throw new Error(error.message);
  }

  return UserSchema.parse(data);
}

export async function fetchCurrentUser(): Promise<User | null> {
  const supabase = await createClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) return null;

  return fetchUser(authUser.id);
}

/* ─── Mutations ───────────────────────────────────────────────────── */
export const UpdateUserInput = z.object({
  full_name: z.string().optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  phone: z.string().optional(),
  bio: z.string().optional(),
  linkedin_url: z.string().url().optional(),
  profile_picture_url: z.string().url().optional(),
});
export type UpdateUserInput = z.infer<typeof UpdateUserInput>;

export async function updateUser(
  id: string,
  updates: UpdateUserInput
): Promise<User> {
  const supabase = await createClient();
  const parsed = UpdateUserInput.parse(updates);

  const { data, error } = await supabase
    .from("user_profiles")
    .update({
      ...parsed,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating user:", error);
    throw new Error(error.message);
  }

  return UserSchema.parse(data);
}

export async function updateUserStatus(
  id: string,
  status: string
): Promise<User> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("user_profiles")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating user status:", error);
    throw new Error(error.message);
  }

  return UserSchema.parse(data);
}

export async function updateUserRole(id: string, role: string): Promise<User> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("user_profiles")
    .update({
      role,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating user role:", error);
    throw new Error(error.message);
  }

  return UserSchema.parse(data);
}
