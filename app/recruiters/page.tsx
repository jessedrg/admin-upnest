import { fetchRecruiters } from "@/lib/api";
import { RecruitersClient } from "./client";

export default async function RecruitersPage() {
  const recruiters = await fetchRecruiters();
  return <RecruitersClient initial={recruiters} />;
}
