import { sleep, ApiClient } from "./_client";
import { mockRoles } from "@/lib/mock";
import {
  RoleSchema,
  type Role,
  type RoleStatus,
} from "@/lib/schemas";
import { z } from "zod";

/* ─── Reads ───────────────────────────────────────────────────────── */
export async function fetchRoles(): Promise<Role[]> {
  if (ApiClient.useMocks) {
    await sleep(500);
    return z.array(RoleSchema).parse(mockRoles);
  }
  const data = await ApiClient.get<unknown>("/v1/roles");
  return z.array(RoleSchema).parse(data);
}

export async function fetchRole(id: string): Promise<Role | null> {
  if (ApiClient.useMocks) {
    await sleep(400);
    const r = mockRoles.find((x) => x.id === id);
    return r ? RoleSchema.parse(r) : null;
  }
  const data = await ApiClient.get<unknown>(`/v1/roles/${id}`);
  return RoleSchema.parse(data);
}

/* ─── Mutations ───────────────────────────────────────────────────── */
export const CreateRoleInput = z.object({
  title: z.string().min(2),
  company: z.string().min(2),
  location: z.string(),
  remote: z.enum(["onsite", "hybrid", "remote"]),
  bountyAmount: z.number().min(0),
  description: z.string().optional(),
});
export type CreateRoleInput = z.infer<typeof CreateRoleInput>;

export async function createRole(input: CreateRoleInput): Promise<Role> {
  const parsed = CreateRoleInput.parse(input);
  if (ApiClient.useMocks) {
    await sleep(600);
    return RoleSchema.parse({
      id: `r_${Date.now()}`,
      title: parsed.title,
      company: parsed.company,
      location: parsed.location,
      remote: parsed.remote,
      status: "open",
      priority: false,
      bounty: { amount: parsed.bountyAmount, currency: "USD" },
      postedAt: new Date().toISOString(),
      pipeline: { sourced: 0, submitted: 0, interviewing: 0, offered: 0, hired: 0 },
      tags: [],
      description: parsed.description,
      recruiters: [],
    });
  }
  return RoleSchema.parse(await ApiClient.post("/v1/roles", parsed));
}

export async function updateRoleStatus(
  id: string,
  status: RoleStatus,
): Promise<Role> {
  if (ApiClient.useMocks) {
    await sleep(300);
    const r = mockRoles.find((x) => x.id === id);
    if (!r) throw new Error("not found");
    return RoleSchema.parse({ ...r, status });
  }
  return RoleSchema.parse(
    await ApiClient.post(`/v1/roles/${id}/status`, { status }),
  );
}
