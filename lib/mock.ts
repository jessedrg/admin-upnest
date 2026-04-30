import type {
  Role,
  Candidate,
  Email,
  Contract,
  Stats,
  Activity,
  User,
  Org,
} from "@/lib/schemas";

/* ─── Orgs ────────────────────────────────────────────────────────── */
export const mockOrgs: Org[] = [
  { id: "org_ramp", name: "Ramp", type: "company", status: "active" },
  { id: "org_linear", name: "Linear", type: "company", status: "active" },
  { id: "org_notion", name: "Notion", type: "company", status: "active" },
  { id: "org_arc", name: "Arc", type: "company", status: "active" },
  { id: "org_retool", name: "Retool", type: "company", status: "active" },
  { id: "org_vercel", name: "Vercel", type: "company", status: "pending" },
];

/* ─── Users ───────────────────────────────────────────────────────── */
export const mockUsers: User[] = [
  {
    id: "u_me",
    name: "Alex Reyes",
    email: "alex@upnest.example",
    role: "recruiter",
  },
  {
    id: "u_emma",
    name: "Emma Tran",
    email: "emma@ramp.com",
    role: "client",
    orgId: "org_ramp",
  },
  {
    id: "u_jess",
    name: "Jess Kim",
    email: "jess@linear.app",
    role: "client",
    orgId: "org_linear",
  },
  {
    id: "u_admin",
    name: "Admin",
    email: "admin@upnest.com",
    role: "admin",
  },
];

/* ─── Roles ───────────────────────────────────────────────────────── */
export const mockRoles: Role[] = [
  {
    id: "r_001",
    title: "Senior Product Engineer",
    company: "Ramp",
    location: "New York, NY",
    remote: "hybrid",
    status: "priority",
    priority: true,
    bounty: { amount: 28000, currency: "USD" },
    baseSalary: { min: 180000, max: 240000, currency: "USD" },
    postedAt: "2024-09-12",
    pipeline: { sourced: 42, submitted: 8, interviewing: 3, offered: 1, hired: 0 },
    tags: ["TypeScript", "React", "Postgres"],
    description: "Build the next generation of finance tooling.",
    recruiters: ["u_me"],
  },
  {
    id: "r_002",
    title: "Staff Engineer, Infra",
    company: "Linear",
    location: "Remote",
    remote: "remote",
    status: "open",
    priority: false,
    bounty: { amount: 35000, currency: "USD" },
    baseSalary: { min: 220000, max: 290000, currency: "USD" },
    postedAt: "2024-09-08",
    pipeline: { sourced: 28, submitted: 5, interviewing: 2, offered: 0, hired: 0 },
    tags: ["Go", "Distributed Systems"],
    recruiters: ["u_me"],
  },
  {
    id: "r_003",
    title: "Design Engineer",
    company: "Notion",
    location: "San Francisco, CA",
    remote: "hybrid",
    status: "open",
    priority: false,
    bounty: { amount: 22000, currency: "USD" },
    baseSalary: { min: 165000, max: 220000, currency: "USD" },
    postedAt: "2024-09-05",
    pipeline: { sourced: 18, submitted: 4, interviewing: 1, offered: 0, hired: 0 },
    tags: ["React", "Design Systems", "WebGL"],
    recruiters: ["u_me"],
  },
  {
    id: "r_004",
    title: "Founding GTM",
    company: "Arc",
    location: "London, UK",
    remote: "onsite",
    status: "on_hold",
    priority: false,
    bounty: { amount: 18000, currency: "USD" },
    postedAt: "2024-08-28",
    pipeline: { sourced: 12, submitted: 2, interviewing: 0, offered: 0, hired: 0 },
    tags: ["Sales", "Founding"],
    recruiters: ["u_me"],
  },
  {
    id: "r_005",
    title: "Head of Eng",
    company: "Retool",
    location: "Remote",
    remote: "remote",
    status: "open",
    priority: false,
    bounty: { amount: 50000, currency: "USD" },
    baseSalary: { min: 300000, max: 400000, currency: "USD" },
    postedAt: "2024-08-20",
    pipeline: { sourced: 6, submitted: 1, interviewing: 0, offered: 0, hired: 0 },
    tags: ["Leadership", "Engineering"],
    recruiters: ["u_me"],
  },
];

/* ─── Candidates ──────────────────────────────────────────────────── */
export const mockCandidates: Candidate[] = [
  {
    id: "c_01",
    name: "Diane Chen",
    title: "Sr. Engineer @ Stripe",
    email: "diane@example.com",
    yearsExperience: 8,
    location: "Brooklyn, NY",
    roleId: "r_001",
    stage: "interviewing",
    submittedBy: "u_me",
    submittedAt: "2024-09-15",
    fitScore: 92,
  },
  {
    id: "c_02",
    name: "Marcus Webb",
    title: "Staff @ Coinbase",
    yearsExperience: 11,
    roleId: "r_001",
    stage: "submitted",
    submittedBy: "u_me",
    submittedAt: "2024-09-14",
    fitScore: 86,
  },
  {
    id: "c_03",
    name: "Priya Nair",
    title: "Senior @ Plaid",
    yearsExperience: 7,
    roleId: "r_001",
    stage: "offered",
    submittedBy: "u_me",
    submittedAt: "2024-09-10",
    fitScore: 95,
  },
  {
    id: "c_04",
    name: "Tom Schultz",
    title: "Infra @ Databricks",
    roleId: "r_002",
    stage: "interviewing",
    submittedBy: "u_me",
    submittedAt: "2024-09-12",
    fitScore: 88,
  },
  {
    id: "c_05",
    name: "Saoirse Lim",
    title: "Design Eng @ Vercel",
    roleId: "r_003",
    stage: "submitted",
    submittedBy: "u_me",
    submittedAt: "2024-09-09",
    fitScore: 90,
  },
];

/* ─── Emails ──────────────────────────────────────────────────────── */
export const mockEmails: Email[] = [
  {
    id: "e_01",
    candidateId: "c_01",
    roleId: "r_001",
    to: "diane@example.com",
    from: "alex@upnest.example",
    subject: "Ramp — Senior Product Engineer",
    body: "Hi Diane — quick intro, the team at Ramp is looking for a senior product engineer...",
    sentAt: "2024-09-15T14:22:00Z",
    status: "replied",
  },
  {
    id: "e_02",
    candidateId: "c_02",
    to: "marcus@example.com",
    from: "alex@upnest.example",
    subject: "Quick question",
    body: "Saw your work on the L3 routing layer...",
    sentAt: "2024-09-14T09:00:00Z",
    status: "opened",
  },
];

/* ─── Contracts ───────────────────────────────────────────────────── */
export const mockContracts: Contract[] = [
  {
    id: "k_01",
    roleId: "r_001",
    recruiterId: "u_me",
    bounty: { amount: 28000, currency: "USD" },
    status: "active",
    signedAt: "2024-09-01",
  },
  {
    id: "k_02",
    roleId: "r_002",
    recruiterId: "u_me",
    bounty: { amount: 35000, currency: "USD" },
    status: "active",
    signedAt: "2024-09-03",
  },
];

/* ─── Stats ───────────────────────────────────────────────────────── */
export const mockStats: Stats = {
  earningsThisMonth: 28000,
  earningsAllTime: 412000,
  rolesActive: 5,
  candidatesSubmitted: 23,
  hires: 14,
  responseRate: 0.68,
};

/* ─── Activity ────────────────────────────────────────────────────── */
export const mockActivity: Activity[] = [
  {
    id: "a_01",
    actor: "Diane Chen",
    verb: "moved to",
    target: "Onsite (Ramp)",
    at: "2024-09-16T10:12:00Z",
    kind: "candidate",
  },
  {
    id: "a_02",
    actor: "Ramp",
    verb: "raised priority on",
    target: "Senior Product Engineer",
    at: "2024-09-15T18:00:00Z",
    kind: "role",
  },
  {
    id: "a_03",
    actor: "Linear",
    verb: "countersigned",
    target: "Staff Eng contract",
    at: "2024-09-14T22:31:00Z",
    kind: "contract",
  },
];
