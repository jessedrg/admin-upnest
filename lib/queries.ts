"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import type {
  Role,
  Application,
  Stats,
  User,
  Org,
  Notification,
} from "@/lib/schemas";

// Import API functions for client-side use
// Note: These will be called via server actions or API routes
import { createClient } from "@/lib/supabase/client";

/* ─── Helper to fetch via Supabase client ─────────────────────────── */
async function fetchFromSupabase<T>(
  table: string,
  options?: {
    select?: string;
    filters?: Record<string, unknown>;
    order?: { column: string; ascending?: boolean };
    limit?: number;
    single?: boolean;
  }
): Promise<T> {
  const supabase = createClient();
  let query = supabase.from(table).select(options?.select || "*");

  if (options?.filters) {
    Object.entries(options.filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
  }

  if (options?.order) {
    query = query.order(options.order.column, {
      ascending: options.order.ascending ?? false,
    });
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.single) {
    const { data, error } = await query.single();
    if (error) throw new Error(error.message);
    return data as T;
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data as T;
}

/* ─── Roles ───────────────────────────────────────────────────────── */
export const rolesKey = ["roles"] as const;
export const roleKey = (id: string) => ["role", id] as const;

export function useRoles(opts?: Partial<UseQueryOptions<Role[]>>) {
  return useQuery({
    queryKey: rolesKey,
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("roles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw new Error(error.message);
      return data as Role[];
    },
    ...opts,
  });
}

export function useRole(id: string) {
  return useQuery({
    queryKey: roleKey(id),
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("roles")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        if (error.code === "PGRST116") return null;
        throw new Error(error.message);
      }
      return data as Role;
    },
    enabled: !!id,
  });
}

export function useCreateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      title: string;
      company_name: string;
      location?: string;
      bounty?: number;
      description?: string;
    }) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("roles")
        .insert({
          ...input,
          status: "draft",
          is_published: false,
          priority: 0,
        })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data as Role;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: rolesKey }),
  });
}

export function useUpdateRoleStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string; status: string }) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("roles")
        .update({ status: input.status, updated_at: new Date().toISOString() })
        .eq("id", input.id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data as Role;
    },
    onSuccess: (r) => {
      qc.invalidateQueries({ queryKey: rolesKey });
      qc.invalidateQueries({ queryKey: roleKey(r.id) });
    },
  });
}

/* ─── Applications/Candidates ─────────────────────────────────────── */
export const candidatesKey = (roleId?: string) =>
  ["candidates", roleId ?? "all"] as const;

export function useCandidates(roleId?: string) {
  return useQuery({
    queryKey: candidatesKey(roleId),
    queryFn: async () => {
      const supabase = createClient();
      let query = supabase
        .from("applications")
        .select(`
          *,
          role:roles(id, title, company_name, company_logo)
        `)
        .order("created_at", { ascending: false });

      if (roleId) {
        query = query.eq("role_id", roleId);
      }

      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return data as Application[];
    },
  });
}

export function useSubmitCandidate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      role_id: string;
      candidate_name: string;
      candidate_email?: string;
      linkedin_url?: string;
    }) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("applications")
        .insert({
          ...input,
          status: "submitted",
        })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data as Application;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["candidates"] }),
  });
}

export function useMoveCandidateStage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string; status: string }) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("applications")
        .update({ status: input.status, updated_at: new Date().toISOString() })
        .eq("id", input.id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data as Application;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["candidates"] }),
  });
}

/* ─── Organizations ───────────────────────────────────────────────── */
export const organizationsKey = ["organizations"] as const;

export function useOrganizations() {
  return useQuery({
    queryKey: organizationsKey,
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("client_organizations")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw new Error(error.message);
      return data as Org[];
    },
  });
}

/* ─── Users/Recruiters ────────────────────────────────────────────── */
export const usersKey = (role?: string) => ["users", role ?? "all"] as const;

export function useUsers(role?: string) {
  return useQuery({
    queryKey: usersKey(role),
    queryFn: async () => {
      const supabase = createClient();
      let query = supabase
        .from("user_profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (role) {
        query = query.eq("role", role);
      }

      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return data as User[];
    },
  });
}

export function useRecruiters() {
  return useUsers("recruiter");
}

/* ─── Stats ───────────────────────────────────────────────────────── */
export function useStats() {
  return useQuery<Stats>({
    queryKey: ["stats"],
    queryFn: async () => {
      const supabase = createClient();

      // Get active roles count
      const { count: rolesActive } = await supabase
        .from("roles")
        .select("*", { count: "exact", head: true })
        .in("status", ["open", "priority", "active"]);

      // Get candidates submitted count
      const { count: candidatesSubmitted } = await supabase
        .from("applications")
        .select("*", { count: "exact", head: true });

      // Get hires count
      const { count: hires } = await supabase
        .from("applications")
        .select("*", { count: "exact", head: true })
        .eq("status", "hired");

      // Get earnings from placements
      const { data: placements } = await supabase
        .from("agency_placements")
        .select("recruiter_amount, hired_at");

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      let earningsThisMonth = 0;
      let earningsAllTime = 0;

      (placements || []).forEach((p) => {
        const amount = p.recruiter_amount || 0;
        earningsAllTime += amount;
        if (p.hired_at && new Date(p.hired_at) >= startOfMonth) {
          earningsThisMonth += amount;
        }
      });

      return {
        earningsThisMonth,
        earningsAllTime,
        rolesActive: rolesActive || 0,
        candidatesSubmitted: candidatesSubmitted || 0,
        hires: hires || 0,
        responseRate: 0,
      };
    },
  });
}

/* ─── Activity/Notifications ──────────────────────────────────────── */
export function useActivity() {
  return useQuery({
    queryKey: ["activity"],
    queryFn: async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return [];

      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) return [];

      return (data || []).map((n) => ({
        id: n.id,
        actor: n.actor_name || "System",
        verb: n.type,
        target: n.title,
        at: n.created_at,
        kind: n.reference_type || "system",
      }));
    },
  });
}

export function useNotifications() {
  return useQuery<Notification[]>({
    queryKey: ["notifications"],
    queryFn: async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return [];

      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) return [];
      return data as Notification[];
    },
  });
}

/* ─── Emails ──────────────────────────────────────────────────────── */
export function useEmails() {
  return useQuery({
    queryKey: ["emails"],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("email_tracking")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) return [];

      return (data || []).map((e) => ({
        id: e.id,
        candidateId: e.recipient_id,
        roleId: e.role_ids?.[0],
        to: e.recipient_email,
        from: "system@upnest.com",
        subject: e.subject,
        body: "",
        sentAt: e.sent_at,
        status: e.opened_at ? "opened" : e.delivered_at ? "sent" : "draft",
      }));
    },
  });
}

/* ─── Contracts ───────────────────────────────────────────────────── */
export function useContracts() {
  return useQuery({
    queryKey: ["contracts"],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("agency_placements")
        .select(`
          *,
          role:roles(id, title, company_name)
        `)
        .order("created_at", { ascending: false });

      if (error) return [];

      return (data || []).map((p) => ({
        id: p.id,
        roleId: p.role_id,
        recruiterId: p.recruiter_id,
        bounty: { amount: p.total_bounty || 0, currency: "USD" },
        status: p.payment_status === "paid" ? "completed" : "active",
        signedAt: p.hired_at,
        paidAt: p.paid_at,
      }));
    },
  });
}
