import { fetchCandidates } from "@/lib/api";
import { CandidatesClient } from "./client";

export default async function CandidatesPage() {
  const candidates = await fetchCandidates();
  return <CandidatesClient initial={candidates} />;
}
