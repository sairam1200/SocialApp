"use client";

import { useTranslations } from "next-intl";
import { format, isSameDay } from "date-fns";
import { cn } from "@/utils/cn.util";
import { PostChip } from "./PostChip";
import type { PublishItem, PublishStatus } from "@/types/publishing.types";

const FILTERS: (PublishStatus | "all")[] = [
  "all",
  "scheduled",
  "failed",
  "completed",
  "cancelled",
];

interface QueueListProps {
  items: PublishItem[];
  total: number;
  active: PublishStatus | "all";
  loading?: boolean;
  onFilter: (value: PublishStatus | "all") => void;
  onSelect: (item: PublishItem) => void;
}

export function QueueList({
  items,
  total,
  active,
  loading,
  onFilter,
  onSelect,
}: QueueListProps) {
  const t = useTranslations("publishing");
  const groups: { day: Date; items: PublishItem[] }[] = [];
  for (const item of items) {
    const at = new Date(item.at);
    const last = groups[groups.length - 1];
    if (last && isSameDay(last.day, at)) last.items.push(item);
    else groups.push({ day: at, items: [item] });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => onFilter(filter)}
            aria-pressed={active === filter}
            className={cn(
              "rounded-full border px-3 py-1 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              active === filter
                ? "border-foreground bg-foreground text-background"
                : "border-border text-muted-foreground hover:text-foreground",
            )}
          >
            {t(`queue.${filter}`)}
          </button>
        ))}
        <span className="ms-auto text-xs text-muted-foreground">
          {t("queue.count", { count: total })}
        </span>
      </div>

      {loading && items.length === 0 && (
        <ul className="space-y-2" aria-busy="true">
          {Array.from({ length: 5 }).map((_, index) => (
            <li key={index} className="h-14 animate-pulse rounded-lg bg-muted/50" />
          ))}
        </ul>
      )}

      {!loading && items.length === 0 && (
        <p className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          {t("queue.empty")}
        </p>
      )}

      <ol className="space-y-5">
        {groups.map((group) => (
          <li key={group.day.toISOString()}>
            <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {format(group.day, "EEEE d MMMM")}
            </h3>
            <ul className="space-y-1.5">
              {group.items.map((item) => (
                <li key={item.id}>
                  <PostChip
                    item={item}
                    timeLabel={format(new Date(item.at), "HH:mm")}
                    onSelect={onSelect}
                  />
                  {/* The failure reason belongs in the list, not one click
                      away. A queue that only says "failed" makes the reader
                      open every row to find the one they can fix. */}
                  {item.status === "failed" && item.lastError && (
                    <p className="ms-3 mt-1 border-s-2 border-destructive/40 ps-2 text-xs text-muted-foreground">
                      {item.lastError}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </div>
  );
}
