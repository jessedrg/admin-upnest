import { z } from "zod";

/* ─── Primitives ──────────────────────────────────────────────────── */
export const IdSchema = z.string().uuid();
export const TimestampSchema = z.string().datetime().or(z.string());

/* ─── Money ───────────────────────────────────────────────────────── */
export const MoneySchema = z.object({
  amount: z.number(),
  currency: z.enum(["USD", "EUR", "GBP", "MXN"]).default("USD"),
});
export type Money = z.infer<typeof MoneySchema>;

/* ─── Organization (Client) ───────────────────────────────────────── */
export const OrgSchema = z.object({
  id: IdSchema,
  name: z.string(),
  logo_url: z.string().nullable().optional(),
  website: z.string().nullable().optional(),
  industry: z.string().nullable().optional(),
  company_size: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  contact_name: z.string().nullable().optional(),
  contact_email: z.string().nullable().optional(),
  contact_phone: z.string().nullable().optional(),
  account_type: z.string().nullable().optional(),
  created_at: TimestampSchema,
  updated_at: TimestampSchema.nullable().optional(),
});
export type Org = z.infer<typeof OrgSchema>;

/* ─── User Profile ────────────────────────────────────────────────── */
export const UserSchema = z.object({
  id: IdSchema,
  email: z.string().email().nullable().optional(),
  full_name: z.string().nullable().optional(),
  first_name: z.string().nullable().optional(),
  last_name: z.string().nullable().optional(),
  role: z.string().nullable().optional(),
  status: z.string().nullable().optional(),
  profile_picture_url: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  linkedin_url: z.string().nullable().optional(),
  agency_id: IdSchema.nullable().optional(),
  bounty_percentage: z.number().nullable().optional(),
  created_at: TimestampSchema,
  updated_at: TimestampSchema.nullable().optional(),
});
export type User = z.infer<typeof UserSchema>;

/* ─── Role ────────────────────────────────────────────────────────── */
export const RoleStatusSchema = z.enum([
  "draft",
  "open",
  "priority",
  "on_hold",
  "filled",
  "closed",
  "pending_approval",
  "active",
]);
export type RoleStatus = z.infer<typeof RoleStatusSchema>;

export const RoleSchema = z.object({
  id: IdSchema,
  title: z.string(),
  company_name: z.string().nullable().optional(),
  company_logo: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  remote_policy: z.string().nullable().optional(),
  status: z.string().nullable().optional(),
  bounty: z.number().nullable().optional(),
  salary_range: z.string().nullable().optional(),
  created_at: TimestampSchema,
  updated_at: TimestampSchema.nullable().optional(),
  description: z.string().nullable().optional(),
  requirements: z.string().nullable().optional(),
  skills_required: z.any().nullable().optional(),
  experience_level: z.string().nullable().optional(),
  department: z.string().nullable().optional(),
  type: z.string().nullable().optional(),
  is_published: z.boolean().default(false),
  published_at: TimestampSchema.nullable().optional(),
  priority: z.number().default(0),
  focus_this_week: z.boolean().default(false),
  recruiter_percentage: z.number().nullable().optional(),
  created_by: IdSchema.nullable().optional(),
  agency_id: IdSchema.nullable().optional(),
  // Computed fields
  applications_count: z.number().optional(),
});
export type Role = z.infer<typeof RoleSchema>;

/* ─── Application (Candidate) ─────────────────────────────────────── */
export const ApplicationStatusSchema = z.enum([
  "sourced",
  "submitted",
  "reviewing",
  "interviewing",
  "offered",
  "hired",
  "rejected",
  "withdrawn",
]);
export type ApplicationStatus = z.infer<typeof ApplicationStatusSchema>;

export const ApplicationSchema = z.object({
  id: IdSchema,
  role_id: IdSchema,
  candidate_name: z.string(),
  candidate_email: z.string().nullable().optional(),
  candidate_phone: z.string().nullable().optional(),
  status: z.string().default("submitted"),
  fit_score: z.number().nullable().optional(),
  sourced_by: IdSchema.nullable().optional(),
  created_at: TimestampSchema,
  updated_at: TimestampSchema.nullable().optional(),
  linkedin_url: z.string().nullable().optional(),
  resume_url: z.string().nullable().optional(),
  cv_url: z.string().nullable().optional(),
  cover_letter: z.string().nullable().optional(),
  rejection_reason: z.string().nullable().optional(),
  ai_analysis: z.any().nullable().optional(),
  matching_skills: z.array(z.string()).nullable().optional(),
  missing_skills: z.array(z.string()).nullable().optional(),
  profile_image_url: z.string().nullable().optional(),
  // Relations
  role: RoleSchema.optional(),
  sourced_by_user: UserSchema.optional(),
});
export type Application = z.infer<typeof ApplicationSchema>;

// Legacy alias for backwards compatibility
export const CandidateSchema = ApplicationSchema;
export const CandidateStageSchema = ApplicationStatusSchema;
export type Candidate = Application;
export type CandidateStage = ApplicationStatus;

/* ─── Agency ──────────────────────────────────────────────────────── */
export const AgencySchema = z.object({
  id: IdSchema,
  name: z.string(),
  slug: z.string().nullable().optional(),
  logo_url: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  website: z.string().nullable().optional(),
  contact_email: z.string().nullable().optional(),
  contact_phone: z.string().nullable().optional(),
  is_active: z.boolean().default(true),
  agency_commission_percentage: z.number().nullable().optional(),
  created_at: TimestampSchema,
  updated_at: TimestampSchema.nullable().optional(),
});
export type Agency = z.infer<typeof AgencySchema>;

/* ─── Placement ───────────────────────────────────────────────────── */
export const PlacementSchema = z.object({
  id: IdSchema,
  role_id: IdSchema,
  application_id: IdSchema,
  recruiter_id: IdSchema.nullable().optional(),
  agency_id: IdSchema.nullable().optional(),
  total_bounty: z.number().nullable().optional(),
  platform_amount: z.number().nullable().optional(),
  agency_amount: z.number().nullable().optional(),
  recruiter_amount: z.number().nullable().optional(),
  payment_status: z.string().nullable().optional(),
  hired_at: TimestampSchema.nullable().optional(),
  paid_at: TimestampSchema.nullable().optional(),
  created_at: TimestampSchema,
});
export type Placement = z.infer<typeof PlacementSchema>;

/* ─── Notification ────────────────────────────────────────────────── */
export const NotificationSchema = z.object({
  id: IdSchema,
  user_id: IdSchema,
  type: z.string(),
  title: z.string(),
  message: z.string(),
  is_read: z.boolean().default(false),
  created_at: TimestampSchema,
  reference_type: z.string().nullable().optional(),
  reference_id: IdSchema.nullable().optional(),
  actor_id: IdSchema.nullable().optional(),
  actor_name: z.string().nullable().optional(),
  actor_image: z.string().nullable().optional(),
});
export type Notification = z.infer<typeof NotificationSchema>;

/* ─── Stats ───────────────────────────────────────────────────────── */
export const StatsSchema = z.object({
  earningsThisMonth: z.number(),
  earningsAllTime: z.number(),
  rolesActive: z.number(),
  candidatesSubmitted: z.number(),
  hires: z.number(),
  responseRate: z.number(),
});
export type Stats = z.infer<typeof StatsSchema>;

/* ─── Activity ────────────────────────────────────────────────────── */
export const ActivitySchema = z.object({
  id: IdSchema,
  actor: z.string(),
  verb: z.string(),
  target: z.string(),
  at: TimestampSchema,
  kind: z.enum(["candidate", "role", "contract", "system"]),
});
export type Activity = z.infer<typeof ActivitySchema>;

/* ─── Email ───────────────────────────────────────────────────────── */
export const EmailSchema = z.object({
  id: IdSchema,
  candidateId: IdSchema.optional(),
  roleId: IdSchema.optional(),
  to: z.string(),
  from: z.string(),
  subject: z.string(),
  body: z.string(),
  sentAt: TimestampSchema,
  status: z.enum(["draft", "sent", "opened", "replied"]).default("sent"),
});
export type Email = z.infer<typeof EmailSchema>;

/* ─── Contract ────────────────────────────────────────────────────── */
export const ContractSchema = z.object({
  id: IdSchema,
  roleId: IdSchema,
  recruiterId: IdSchema,
  bounty: MoneySchema,
  status: z.enum(["pending", "active", "completed", "cancelled"]),
  signedAt: TimestampSchema.optional(),
  paidAt: TimestampSchema.optional(),
});
export type Contract = z.infer<typeof ContractSchema>;
