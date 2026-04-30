import { createClient } from "@/lib/supabase/server";
import { ApplicationSchema, type Application } from "@/lib/schemas";
import { z } from "zod";

/* ─── Reads ───────────────────────────────────────────────────────── */
export async function fetchCandidates(roleId?: string): Promise<Application[]> {
  const supabase = await createClient();

  let query = supabase
    .from("applications")
    .select(`
      *,
      role:roles(id, title, company_name, company_logo),
      sourced_by_user:user_profiles!applications_sourced_by_fkey(id, full_name, email, profile_picture_url)
    `)
    .order("created_at", { ascending: false });

  if (roleId) {
    query = query.eq("role_id", roleId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching candidates:", error);
    throw new Error(error.message);
  }

  return z.array(ApplicationSchema).parse(data || []);
}

export async function fetchCandidate(id: string): Promise<Application | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("applications")
    .select(`
      *,
      role:roles(id, title, company_name, company_logo, bounty, location),
      sourced_by_user:user_profiles!applications_sourced_by_fkey(id, full_name, email, profile_picture_url)
    `)
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    console.error("Error fetching candidate:", error);
    throw new Error(error.message);
  }

  return ApplicationSchema.parse(data);
}

/* ─── Mutations ───────────────────────────────────────────────────── */
export const SubmitCandidateInput = z.object({
  role_id: z.string().uuid(),
  candidate_name: z.string().min(2),
  candidate_email: z.string().email().optional(),
  candidate_phone: z.string().optional(),
  linkedin_url: z.string().url().optional(),
  resume_url: z.string().url().optional(),
  cover_letter: z.string().optional(),
});
export type SubmitCandidateInput = z.infer<typeof SubmitCandidateInput>;

export async function submitCandidate(
  input: SubmitCandidateInput
): Promise<Application> {
  const supabase = await createClient();
  const parsed = SubmitCandidateInput.parse(input);

  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("applications")
    .insert({
      ...parsed,
      sourced_by: user?.id,
      status: "submitted",
    })
    .select()
    .single();

  if (error) {
    console.error("Error submitting candidate:", error);
    throw new Error(error.message);
  }

  return ApplicationSchema.parse(data);
}

export async function moveCandidateStage(
  id: string,
  status: string
): Promise<Application> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("applications")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error moving candidate stage:", error);
    throw new Error(error.message);
  }

  return ApplicationSchema.parse(data);
}

export async function updateCandidate(
  id: string,
  updates: Partial<SubmitCandidateInput & { fit_score?: number; rejection_reason?: string }>
): Promise<Application> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("applications")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating candidate:", error);
    throw new Error(error.message);
  }

  return ApplicationSchema.parse(data);
}

export async function deleteCandidate(id: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.from("applications").delete().eq("id", id);

  if (error) {
    console.error("Error deleting candidate:", error);
    throw new Error(error.message);
  }
}

/* ─── Stats by Role ───────────────────────────────────────────────── */
export async function fetchCandidateStats(roleId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("applications")
    .select("status")
    .eq("role_id", roleId);

  if (error) {
    console.error("Error fetching candidate stats:", error);
    throw new Error(error.message);
  }

  const stats = {
    sourced: 0,
    submitted: 0,
    reviewing: 0,
    interviewing: 0,
    offered: 0,
    hired: 0,
    rejected: 0,
    total: data?.length || 0,
  };

  (data || []).forEach((app) => {
    const status = app.status as keyof typeof stats;
    if (status in stats) {
      stats[status]++;
    }
  });

  return stats;
}
