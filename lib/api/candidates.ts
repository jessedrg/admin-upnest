import { sleep, ApiClient } from "./_client";
import { mockCandidates } from "@/lib/mock";
import {
  CandidateSchema,
  type Candidate,
  type CandidateStage,
} from "@/lib/schemas";
import { z } from "zod";

export async function fetchCandidates(roleId?: string): Promise<Candidate[]> {
  if (ApiClient.useMocks) {
    await sleep(450);
    const list = roleId
      ? mockCandidates.filter((c) => c.roleId === roleId)
      : mockCandidates;
    return z.array(CandidateSchema).parse(list);
  }
  const path = roleId ? `/v1/candidates?roleId=${roleId}` : "/v1/candidates";
  return z.array(CandidateSchema).parse(await ApiClient.get<unknown>(path));
}

export async function fetchCandidate(id: string): Promise<Candidate | null> {
  if (ApiClient.useMocks) {
    await sleep(300);
    const c = mockCandidates.find((x) => x.id === id);
    return c ? CandidateSchema.parse(c) : null;
  }
  return CandidateSchema.parse(
    await ApiClient.get<unknown>(`/v1/candidates/${id}`),
  );
}

export const SubmitCandidateInput = z.object({
  roleId: z.string(),
  name: z.string().min(2),
  title: z.string(),
  email: z.string().email().optional(),
  linkedin: z.string().url().optional(),
  notes: z.string().optional(),
});
export type SubmitCandidateInput = z.infer<typeof SubmitCandidateInput>;

export async function submitCandidate(
  input: SubmitCandidateInput,
): Promise<Candidate> {
  const parsed = SubmitCandidateInput.parse(input);
  if (ApiClient.useMocks) {
    await sleep(700);
    return CandidateSchema.parse({
      id: `c_${Date.now()}`,
      ...parsed,
      stage: "submitted",
      submittedBy: "u_me",
      submittedAt: new Date().toISOString(),
    });
  }
  return CandidateSchema.parse(
    await ApiClient.post("/v1/candidates", parsed),
  );
}

export async function moveCandidateStage(
  id: string,
  stage: CandidateStage,
): Promise<Candidate> {
  if (ApiClient.useMocks) {
    await sleep(300);
    const c = mockCandidates.find((x) => x.id === id);
    if (!c) throw new Error("not found");
    return CandidateSchema.parse({ ...c, stage });
  }
  return CandidateSchema.parse(
    await ApiClient.post(`/v1/candidates/${id}/stage`, { stage }),
  );
}
