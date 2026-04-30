import { createClient } from "@/lib/supabase/server";
import {
  StatsSchema,
  NotificationSchema,
  type Stats,
  type Notification,
} from "@/lib/schemas";
import { z } from "zod";

/* ─── Stats ───────────────────────────────────────────────────────── */
export async function fetchStats(): Promise<Stats> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

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
    .select("recruiter_amount, hired_at, payment_status");

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

  // Calculate response rate from applications
  const { data: allApps } = await supabase
    .from("applications")
    .select("status");

  const totalApps = allApps?.length || 0;
  const respondedApps =
    allApps?.filter((a) =>
      ["interviewing", "offered", "hired"].includes(a.status)
    ).length || 0;

  const responseRate = totalApps > 0 ? respondedApps / totalApps : 0;

  return StatsSchema.parse({
    earningsThisMonth,
    earningsAllTime,
    rolesActive: rolesActive || 0,
    candidatesSubmitted: candidatesSubmitted || 0,
    hires: hires || 0,
    responseRate,
  });
}

/* ─── Activity / Notifications ────────────────────────────────────── */
export async function fetchActivity() {
  const supabase = await createClient();

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

  if (error) {
    console.error("Error fetching activity:", error);
    return [];
  }

  // Transform notifications to activity format
  return (data || []).map((n) => ({
    id: n.id,
    actor: n.actor_name || "System",
    verb: n.type,
    target: n.title,
    at: n.created_at,
    kind: (n.reference_type || "system") as "candidate" | "role" | "contract" | "system",
  }));
}

export async function fetchNotifications(): Promise<Notification[]> {
  const supabase = await createClient();

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

  if (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }

  return z.array(NotificationSchema).parse(data || []);
}

export async function markNotificationRead(id: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", id);

  if (error) {
    console.error("Error marking notification read:", error);
    throw new Error(error.message);
  }
}

export async function markAllNotificationsRead(): Promise<void> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", user.id)
    .eq("is_read", false);

  if (error) {
    console.error("Error marking all notifications read:", error);
    throw new Error(error.message);
  }
}

/* ─── Email Tracking (placeholder - needs email_tracking table) ───── */
export async function fetchEmails() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("email_tracking")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("Error fetching emails:", error);
    return [];
  }

  // Transform to expected format
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
}

/* ─── Contracts (from agency_placements) ──────────────────────────── */
export async function fetchContracts() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("agency_placements")
    .select(`
      *,
      role:roles(id, title, company_name)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching contracts:", error);
    return [];
  }

  // Transform to expected format
  return (data || []).map((p) => ({
    id: p.id,
    roleId: p.role_id,
    recruiterId: p.recruiter_id,
    bounty: { amount: p.total_bounty || 0, currency: "USD" },
    status: p.payment_status === "paid" ? "completed" : "active",
    signedAt: p.hired_at,
    paidAt: p.paid_at,
  }));
}
