"use client";

import { useMemo, useState } from "react";
import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import type { Locale } from "date-fns";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { cn } from "@/utils/cn.util";
import { PostChip } from "./PostChip";
import type { PublishItem } from "@/types/publishing.types";

/** More than this in one cell and the cell becomes a scroll box nobody reads. */
const VISIBLE_PER_DAY = 3;

interface MonthGridProps {
  month: Date;
  items: PublishItem[];
  weekStartsOn: 0 | 1;
  locale?: Locale;
  onSelect: (item: PublishItem) => void;
  /** Fired when a chip is dropped on a day. Keeps the original time of day. */
  onMove: (item: PublishItem, day: Date) => void;
  onCompose: (day: Date) => void;
}

export function MonthGrid({
  month,
  items,
  weekStartsOn,
  locale,
  onSelect,
  onMove,
  onCompose,
}: MonthGridProps) {
  const t = useTranslations("publishing");
  const [dragging, setDragging] = useState<PublishItem | null>(null);
  const [dropDay, setDropDay] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const days = useMemo(
    () =>
      eachDayOfInterval({
        start: startOfWeek(startOfMonth(month), { weekStartsOn }),
        end: endOfWeek(endOfMonth(month), { weekStartsOn }),
      }),
    [month, weekStartsOn],
  );

  const byDay = useMemo(() => {
    const map = new Map<string, PublishItem[]>();
    for (const item of items) {
      // The instant is grouped by the reader's local day, which is what the
      // grid is drawn in. Slicing the ISO string instead would file a 01:00
      // Stockholm post under the previous day for half the year.
      const key = format(new Date(item.at), "yyyy-MM-dd");
      const bucket = map.get(key);
      if (bucket) bucket.push(item);
      else map.set(key, [item]);
    }
    return map;
  }, [items]);

  const busiest = useMemo(
    () => Math.max(1, ...Array.from(byDay.values(), (list) => list.length)),
    [byDay],
  );

  const weekdayLabels = days.slice(0, 7);

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <div className="grid grid-cols-7 border-b border-border bg-muted/40">
        {weekdayLabels.map((day) => (
          <div
            key={day.toISOString()}
            className="px-2 py-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground"
          >
            {format(day, "EEE", { locale })}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const dayItems = byDay.get(key) ?? [];
          const outsideMonth = !isSameMonth(day, month);
          const today = isSameDay(day, new Date());
          const isExpanded = expanded === key;
          const shown = isExpanded ? dayItems : dayItems.slice(0, VISIBLE_PER_DAY);
          const hidden = dayItems.length - shown.length;

          return (
            <div
              key={key}
              onDragOver={(event) => {
                if (!dragging) return;
                event.preventDefault();
                event.dataTransfer.dropEffect = "move";
                setDropDay(key);
              }}
              onDragLeave={() => setDropDay((current) => (current === key ? null : current))}
              onDrop={(event) => {
                event.preventDefault();
                setDropDay(null);
                if (dragging) onMove(dragging, day);
                setDragging(null);
              }}
              className={cn(
                "group/day relative min-h-[8.5rem] border-b border-e border-border p-1.5",
                "[&:nth-child(7n)]:border-e-0",
                outsideMonth && "bg-muted/20",
                dropDay === key && "bg-primary/10 ring-1 ring-inset ring-primary",
              )}
            >
              <div className="mb-1 flex items-center justify-between px-0.5">
                <span
                  className={cn(
                    "text-xs tabular-nums",
                    outsideMonth ? "text-muted-foreground/60" : "text-foreground",
                    today &&
                      "inline-flex size-5 items-center justify-center rounded-full bg-foreground text-background",
                  )}
                >
                  {format(day, "d")}
                </span>

                {/* Volume as a bar rather than a number: the point of a month
                    view is spotting the empty Thursday, and a row of "3"s does
                    not do that as fast as a row of bars. */}
                {dayItems.length > 0 && (
                  <span
                    aria-hidden
                    className="h-1 w-8 overflow-hidden rounded-full bg-border"
                    title={t("postsOnDay", { count: dayItems.length })}
                  >
                    <span
                      className="block h-full rounded-full bg-foreground/50"
                      style={{
                        width: `${Math.round((dayItems.length / busiest) * 100)}%`,
                      }}
                    />
                  </span>
                )}
              </div>

              <div className="space-y-1">
                {shown.map((item) => (
                  <PostChip
                    key={item.id}
                    item={item}
                    compact
                    timeLabel={format(new Date(item.at), "HH:mm")}
                    onSelect={onSelect}
                    onDragStart={setDragging}
                    isDragging={dragging?.id === item.id}
                  />
                ))}
              </div>

              {hidden > 0 && (
                <button
                  type="button"
                  onClick={() => setExpanded(key)}
                  className="mt-1 w-full rounded px-1 py-0.5 text-start text-[11px] text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {t("morePosts", { count: hidden })}
                </button>
              )}
              {isExpanded && (
                <button
                  type="button"
                  onClick={() => setExpanded(null)}
                  className="mt-1 w-full rounded px-1 py-0.5 text-start text-[11px] text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {t("showLess")}
                </button>
              )}

              <button
                type="button"
                onClick={() => onCompose(day)}
                aria-label={t("addPostOn", { date: format(day, "d MMMM", { locale }) })}
                className={cn(
                  "absolute bottom-1.5 end-1.5 inline-flex size-6 items-center justify-center rounded-md border border-border bg-card text-muted-foreground opacity-0 transition-opacity",
                  "hover:text-foreground focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  "group-hover/day:opacity-100",
                )}
              >
                <Plus aria-hidden className="size-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
