import { clsx } from "clsx";

export function Skeleton({
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx("shimmer rounded", className)}
      aria-hidden
      {...rest}
    />
  );
}

export function TopProgress({ active }: { active: boolean }) {
  if (!active) return null;
  return <div className="top-progress" aria-hidden />;
}

/* High-level page skeletons matching layout shapes */
export function PageSkeleton({
  variant = "simple",
}: {
  variant?: "simple" | "kpi-table" | "kpi-cards" | "compose" | "cards" | "form" | "detail";
}) {
  if (variant === "kpi-table") {
    return (
      <div className="px-9 py-8 space-y-6">
        <div className="grid grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-[420px]" />
      </div>
    );
  }
  if (variant === "kpi-cards") {
    return (
      <div className="px-9 py-8 space-y-6">
        <div className="grid grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-[280px]" />
      </div>
    );
  }
  if (variant === "compose") {
    return (
      <div className="px-9 py-8 space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-12" />
        <Skeleton className="h-[400px]" />
      </div>
    );
  }
  if (variant === "cards") {
    return (
      <div className="px-9 py-8 grid grid-cols-3 gap-4">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-44" />
        ))}
      </div>
    );
  }
  if (variant === "form") {
    return (
      <div className="px-9 py-8 max-w-3xl mx-auto space-y-3">
        {[0, 1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-14" />
        ))}
      </div>
    );
  }
  if (variant === "detail") {
    return (
      <div className="px-9 py-8 space-y-6">
        <Skeleton className="h-12 w-2/3" />
        <div className="grid grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-[360px]" />
      </div>
    );
  }
  return (
    <div className="px-9 py-8 space-y-3">
      {[0, 1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-16" />
      ))}
    </div>
  );
}
