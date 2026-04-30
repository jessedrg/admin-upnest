import { z } from "zod";

/* ─── Primitives ──────────────────────────────────────────────────── */
export const IdSchema = z.string().min(1);
export const TimestampSchema = z.string().datetime().or(z.string()); // ISO

/* ─── Money ───────────────────────────────────────────────────────── */
export const MoneySchema = z.object({
  amount: z.number(),
  currency: z.enum(["USD", "EUR", "GBP", "MXN"]).default("USD"),
});
export type Money = z.infer<typeof MoneySchema>;

/* ─── Org / User ──────────────────────────────────────────────────── */
export const OrgSchema = z.object({
  id: IdSchema,
  name: z.string(),
  type: z.enum(["company", "agency"]),
  logo: z.string().url().optional(),
  status: z.enum(["pending", "active", "suspended"]).default("active"),
});
export type Org = z.infer<typeof OrgSchema>;

export const UserSchema = z.object({
  id: IdSchema,
  name: z.string(),
  email: z.string().email(),
  avatar: z.string().url().optional(),
  role: z.enum(["recruiter", "client", "admin"]),
  orgId: IdSchema.optional(),
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
]);
export type RoleStatus = z.infer<typeof RoleStatusSchema>;

export const RoleSchema = z.object({
  id: IdSchema,
  title: z.string(),
  company: z.string(),
  companyLogo: z.string().optional(),
  location: z.string(),
  remote: z.enum(["onsite", "hybrid", "remote"]).default("hybrid"),
  status: RoleStatusSchema,
  priority: z.boolean().default(false),
  bounty: MoneySchema,
  baseSalary: z
    .object({
      min: z.number(),
      max: z.number(),
      currency: z.string().default("USD"),
    })
    .optional(),
  postedAt: TimestampSchema,
  closesAt: TimestampSchema.optional(),
  pipeline: z.object({
    sourced: z.number().default(0),
    submitted: z.number().default(0),
    interviewing: z.number().default(0),
    offered: z.number().default(0),
    hired: z.number().default(0),
  }),
  tags: z.array(z.string()).default([]),
  description: z.string().optional(),
  recruiters: z.array(IdSchema).default([]),
});
export type Role = z.infer<typeof RoleSchema>;

/* ─── Candidate ───────────────────────────────────────────────────── */
export const CandidateStageSchema = z.enum([
  "sourced",
  "submitted",
  "interviewing",
  "offered",
  "hired",
  "rejected",
]);
export type CandidateStage = z.infer<typeof CandidateStageSchema>;

export const CandidateSchema = z.object({
  id: IdSchema,
  name: z.string(),
  title: z.string(),
  avatar: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  linkedin: z.string().url().optional(),
  yearsExperience: z.number().optional(),
  location: z.string().optional(),
  roleId: IdSchema,
  stage: CandidateStageSchema,
  submittedBy: IdSchema, // recruiter id
  submittedAt: TimestampSchema,
  notes: z.string().optional(),
  fitScore: z.number().min(0).max(100).optional(),
  rejectionReason: z.string().optional(),
});
export type Candidate = z.infer<typeof CandidateSchema>;

/* ─── Email / Note ────────────────────────────────────────────────── */
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
