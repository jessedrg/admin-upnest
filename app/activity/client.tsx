"use client";

import { useActivity } from "@/lib/queries";
import { PageSkeleton, TopProgress } from "@/components/ui/skeleton";

export function ActivityClient() {
  const q = useActivity();
  const list = q.data ?? [];

  return (
    <>
      <header className="sticky top-0 z-10 border-b border-rule-2 bg-paper/85 backdrop-blur">
        <div className="flex h-14 items-center justify-between px-9">
          <h1 className="serif text-[22px] tracking-editorial">Activity log</h1>
          <span className="text-t-3 text-sm">{list.length} events</span>
        </div>
        <TopProgress active={q.isFetching} />
      </header>
      {q.isLoading ? (
        <PageSkeleton variant="simple" />
      ) : list.length === 0 ? (
        <div className="px-9 py-16 text-center">
          <p className="text-t-3">No activity yet.</p>
          <p className="text-t-3 text-sm mt-2">
            Activity will appear here as you interact with the platform.
          </p>
        </div>
      ) : (
        <div className="px-9 py-8">
          <div className="space-y-3">
            {list.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-4 px-4 py-3 rounded-lg border border-rule-2 bg-paper-soft"
              >
                <div className="h-9 w-9 rounded-full bg-paper-2 grid place-items-center text-xs shrink-0">
                  {item.actor
                    .split(" ")
                    .map((s: string) => s[0])
                    .join("")
                    .slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm">
                    <span className="font-medium">{item.actor}</span>{" "}
                    <span className="text-t-3">{item.verb}</span>{" "}
                    <span className="font-medium">{item.target}</span>
                  </div>
                  <div className="text-xs text-t-3 mt-1">
                    {new Date(item.at).toLocaleString()}
                  </div>
                </div>
                <span className="mono text-[10px] uppercase tracking-widest text-t-3">
                  {item.kind}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
