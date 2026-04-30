import { sleep, ApiClient } from "./_client";
import { mockStats, mockActivity, mockEmails, mockContracts } from "@/lib/mock";
import {
  StatsSchema,
  ActivitySchema,
  EmailSchema,
  ContractSchema,
  type Stats,
  type Activity,
  type Email,
  type Contract,
} from "@/lib/schemas";
import { z } from "zod";

export async function fetchStats(): Promise<Stats> {
  if (ApiClient.useMocks) {
    await sleep(400);
    return StatsSchema.parse(mockStats);
  }
  return StatsSchema.parse(await ApiClient.get<unknown>("/v1/me/stats"));
}

export async function fetchActivity(): Promise<Activity[]> {
  if (ApiClient.useMocks) {
    await sleep(350);
    return z.array(ActivitySchema).parse(mockActivity);
  }
  return z
    .array(ActivitySchema)
    .parse(await ApiClient.get<unknown>("/v1/activity"));
}

export async function fetchEmails(): Promise<Email[]> {
  if (ApiClient.useMocks) {
    await sleep(350);
    return z.array(EmailSchema).parse(mockEmails);
  }
  return z
    .array(EmailSchema)
    .parse(await ApiClient.get<unknown>("/v1/emails"));
}

export async function fetchContracts(): Promise<Contract[]> {
  if (ApiClient.useMocks) {
    await sleep(400);
    return z.array(ContractSchema).parse(mockContracts);
  }
  return z
    .array(ContractSchema)
    .parse(await ApiClient.get<unknown>("/v1/contracts"));
}
