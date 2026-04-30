"use client";

import { useContracts } from "@/lib/queries";
import { PageSkeleton, TopProgress } from "@/components/ui/skeleton";

export function ContractsClient() {
  const q = useContracts();
  return (
    <>
      <header className="sticky top-0 z-10 border-b border-rule-2 bg-paper/85 backdrop-blur">
        <div className="flex h-14 items-center justify-between px-9">
          <h1 className="serif text-[22px] tracking-editorial">Contracts</h1>
        </div>
        <TopProgress active={q.isFetching} />
      </header>
      {q.isLoading ? (
        <PageSkeleton variant="kpi-table" />
      ) : (
        <div className="px-9 py-8">
          <div className="card p-8 text-center">
            <div className="serif text-[24px] mb-2">Contracts</div>
            <p className="text-t-3 italic serif">
              View shell ready — wire data via lib/api/ and lib/queries.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
