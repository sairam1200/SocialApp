import { cn } from "@/utils/cn.util";

export type ResultSkeletonKind = "mixed" | "profile" | "content" | "project" | "job";

export function ResultLayoutSkeleton({
  layout,
  kind = "mixed",
  count = 6,
  singleColumnCards = false,
  className,
}: {
  layout: "grid" | "list";
  kind?: ResultSkeletonKind;
  count?: number;
  /** Keep card-shaped placeholders while arranging them in one column. */
  singleColumnCards?: boolean;
  className?: string;
}) {
  if (layout === "list" && !singleColumnCards) {
    return (
      <div className={cn("space-y-0", className)} data-testid="list-result-skeleton">
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className="flex animate-pulse gap-4 border-b border-border py-5"
          >
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-3 w-24 rounded bg-muted" />
              <div className="h-3 w-2/3 rounded bg-muted" />
              <div className="h-5 w-3/4 rounded bg-muted" />
              <div className="h-3 w-full rounded bg-muted" />
              <div className="h-3 w-4/5 rounded bg-muted" />
            </div>
            <div className="h-24 w-40 shrink-0 rounded-xl bg-muted" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-6",
        !singleColumnCards && "sm:grid-cols-2 lg:grid-cols-3",
        className,
      )}
      data-testid="grid-result-skeleton"
    >
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={cn(
            "animate-pulse overflow-hidden rounded-2xl border border-border bg-card",
            kind === "profile" ? "h-[440px] p-6" :
              kind === "content" || kind === "mixed" ? "h-[440px]" : "h-[340px] p-5",
          )}
        >
          {kind === "profile" ? (
            <>
              <div className="mx-auto size-20 rounded-full bg-muted" />
              <div className="mx-auto mt-4 h-5 w-2/3 rounded bg-muted" />
              <div className="mx-auto mt-2 h-4 w-1/2 rounded bg-muted" />
            </>
          ) : (
            <>
              {(kind === "content" || kind === "mixed") && (
                <div className="h-[200px] w-full bg-muted" />
              )}
              <div className={cn("space-y-3", kind === "content" || kind === "mixed" ? "p-4" : "pt-2")}>
                <div className="h-4 w-1/3 rounded bg-muted" />
                <div className="h-5 w-3/4 rounded bg-muted" />
                <div className="h-3 w-full rounded bg-muted" />
                <div className="h-3 w-2/3 rounded bg-muted" />
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
