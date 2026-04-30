"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import * as api from "@/lib/api";
import type {
  Role,
  Candidate,
  Stats,
  Activity,
  Email,
  Contract,
} from "@/lib/schemas";

/* ─── Roles ───────────────────────────────────────────────────────── */
export const rolesKey = ["roles"] as const;
export const roleKey = (id: string) => ["role", id] as const;

export function useRoles(opts?: Partial<UseQueryOptions<Role[]>>) {
  return useQuery({ queryKey: rolesKey, queryFn: api.fetchRoles, ...opts });
}

export function useRole(id: string) {
  return useQuery({
    queryKey: roleKey(id),
    queryFn: () => api.fetchRole(id),
    enabled: !!id,
  });
}

export function useCreateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createRole,
    onSuccess: () => qc.invalidateQueries({ queryKey: rolesKey }),
  });
}

export function useUpdateRoleStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: string; status: Parameters<typeof api.updateRoleStatus>[1] }) =>
      api.updateRoleStatus(input.id, input.status),
    onSuccess: (r) => {
      qc.invalidateQueries({ queryKey: rolesKey });
      qc.invalidateQueries({ queryKey: roleKey(r.id) });
    },
  });
}

/* ─── Candidates ──────────────────────────────────────────────────── */
export const candidatesKey = (roleId?: string) =>
  ["candidates", roleId ?? "all"] as const;

export function useCandidates(roleId?: string) {
  return useQuery({
    queryKey: candidatesKey(roleId),
    queryFn: () => api.fetchCandidates(roleId),
  });
}

export function useSubmitCandidate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.submitCandidate,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["candidates"] }),
  });
}

export function useMoveCandidateStage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: string; stage: Parameters<typeof api.moveCandidateStage>[1] }) =>
      api.moveCandidateStage(input.id, input.stage),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["candidates"] }),
  });
}

/* ─── Misc ────────────────────────────────────────────────────────── */
export function useStats() {
  return useQuery<Stats>({ queryKey: ["stats"], queryFn: api.fetchStats });
}

export function useActivity() {
  return useQuery<Activity[]>({ queryKey: ["activity"], queryFn: api.fetchActivity });
}

export function useEmails() {
  return useQuery<Email[]>({ queryKey: ["emails"], queryFn: api.fetchEmails });
}

export function useContracts() {
  return useQuery<Contract[]>({ queryKey: ["contracts"], queryFn: api.fetchContracts });
}
