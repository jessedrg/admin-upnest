import { createClient } from "@/lib/supabase/server";

/**
 * Get the currently authenticated user from Supabase.
 * Returns null if not authenticated.
 */
export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Get the user profile from the user_profiles table.
 * Returns null if not found.
 */
export async function getUserProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return profile;
}

/**
 * Check if the current user has admin role.
 */
export async function isAdmin() {
  const profile = await getUserProfile();
  return profile?.role === "admin";
}

/**
 * Sign out the current user.
 */
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
}
