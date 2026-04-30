"use server";

import { revalidatePath } from "next/cache";
import * as api from "@/lib/api";
import {
  CreateRoleInput,
  type CreateRoleInput as CreateRoleInputT,
} from "@/lib/api/roles";
import {
  SubmitCandidateInput,
  type SubmitCandidateInput as SubmitCandidateInputT,
} from "@/lib/api/candidates";

/* ─── Roles ───────────────────────────────────────────────────────── */
export async function createRoleAction(input: CreateRoleInputT) {
  const parsed = CreateRoleInput.parse(input);
  const role = await api.createRole(parsed);
  revalidatePath("/dashboard");
  revalidatePath("/roles");
  return { ok: true as const, role };
}

export async function updateRoleStatusAction(input: {
  id: string;
  status: Parameters<typeof api.updateRoleStatus>[1];
}) {
  const role = await api.updateRoleStatus(input.id, input.status);
  revalidatePath(`/roles/${input.id}`);
  revalidatePath("/dashboard");
  return { ok: true as const, role };
}

/* ─── Candidates ──────────────────────────────────────────────────── */
export async function submitCandidateAction(input: SubmitCandidateInputT) {
  const parsed = SubmitCandidateInput.parse(input);
  const candidate = await api.submitCandidate(parsed);
  revalidatePath(`/roles/${parsed.roleId}`);
  revalidatePath("/candidates");
  return { ok: true as const, candidate };
}

export async function moveCandidateStageAction(input: {
  id: string;
  stage: Parameters<typeof api.moveCandidateStage>[1];
}) {
  const candidate = await api.moveCandidateStage(input.id, input.stage);
  revalidatePath("/candidates");
  if (candidate.roleId) revalidatePath(`/roles/${candidate.roleId}`);
  return { ok: true as const, candidate };
}
