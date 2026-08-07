"use client";

import { useMemo, useRef, useState } from "react";
import {
  addDays,
  eachDayOfInterval,
  endOfWeek,
  format,
  isSameDay,
  startOfWeek,
} from "date-fns";
import type { Locale } from "date-fns";
import { useTranslations } from "next-intl";
import { cn } from "@/utils/cn.util";
import { PostChip } from "./PostChip";
import type { PublishItem } from "@/types/publishing.types";

/**
 * The visible band of the day.
 *
 * Social posting happens between about 06:00 and midnight. Rendering all 24
 * hours means two thirds of the grid is permanently empty, so the quiet hours
 * collapse into one row that expands when something is actually scheduled
 * there.
 */
const DAY_START_HOUR = 6;
const DAY_END_HOUR = 23;
const ROW_HEIGHT_REM = 3;

interface WeekGridProps {
  anchor: Date;
  items: PublishItem[];
  weekStartsOn: 0 | 1;
  locale?: Locale;
  onSelect: (item: PublishItem) => void;
  /** Dropping in a lane moves the post to that day and that hour. */
  onMove: (item: PublishItem, when: Date) => void;
  onCompose: (when: Date) => void;
}

export function WeekGrid({
  anchor,
  items,
  weekStartsOn,
  locale,
  onSelect,
  onMove,
  onCompose,
}: WeekGridProps) {
  const t = useTranslations("publishing");
  const [dragging, setDragging] = useState<PublishItem | null>(null);
  const [dropCell, setDropCell] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const days = useMemo(
    () =>
      eachDayOfInterval({
        start: startOfWeek(anchor, { weekStartsOn }),
        end: endOfWeek(anchor, { weekStartsOn }),
      }),
    [anchor, weekStartsOn],
  );

  const { earlyItems, lateItems, byCell } = useMemo(() => {
    const cells = new Map<string, PublishItem[]>();
    const early: PublishItem[] = [];
    const late: PublishItem[] = [];

    for (const item of items) {
      const at = new Date(item.at);
      const hour = at.getHours();
      if (hour < DAY_START_HOUR) {
        early.push(item);
        continue;
      }
      if (hour > DAY_END_HOUR) {
        late.push(item);
        continue;
      }
      const key = `${format(at, "yyyy-MM-dd")}T${hour}`;
      const bucket = cells.get(key);
      if (bucket) bucket.push(item);
      else cells.set(key, [item]);
    }
    return { earlyItems: early, lateItems: late, byCell: cells };
  }, [items]);

  const hours = useMemo(() => {
    const list: number[] = [];
    for (let hour = DAY_START_HOUR; hour <= DAY_END_HOUR; hour += 1) {
      list.push(hour);
    }
    return list;
  }, []);

  function cellDate(day: Date, hour: number): Date {
    const when = new Date(day);
    when.setHours(hour, 0, 0, 0);
    return when;
  }

  function renderOverflow(list: PublishItem[], label: string) {
    if (list.length === 0) return null;
    return (
      <div className="flex items-start gap-3 border-b border-border bg-muted/30 px-3 py-2">
        <span className="w-14 shrink-0 pt-1 text-[11px] uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
        <div className="flex flex-1 flex-wrap gap-1.5">
          {list.map((item) => (
            <div key={item.id} className="w-56">
              <PostChip
                item={item}
                compact
                timeLabel={format(new Date(item.at), "HH:mm")}
                onSelect={onSelect}
                onDragStart={setDragging}
                isDragging={dragging?.id === item.id}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <div className="grid grid-cols-[3.5rem_repeat(7,minmax(0,1fr))] border-b border-border bg-muted/40">
        <div />
        {days.map((day) => {
          const today = isSameDay(day, new Date());
          return (
            <div key={day.toISOString()} className="px-2 py-2">
              <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                {format(day, "EEE", { locale })}
              </div>
              <div
                className={cn(
                  "text-sm tabular-nums",
                  today ? "font-semibold text-foreground" : "text-muted-foreground",
                )}
              >
                {format(day, "d MMM", { locale })}
              </div>
            </div>
          );
        })}
      </div>

      {renderOverflow(earlyItems, t("overnight"))}

      <div ref={scrollRef} className="max-h-[34rem] overflow-y-auto">
        {hours.map((hour) => (
          <div
            key={hour}
            className="grid grid-cols-[3.5rem_repeat(7,minmax(0,1fr))]"
            style={{ minHeight: `${ROW_HEIGHT_REM}rem` }}
          >
            <div className="border-b border-e border-border px-2 py-1 text-[11px] tabular-nums text-muted-foreground">
              {String(hour).padStart(2, "0")}:00
            </div>
            {days.map((day) => {
              const key = `${format(day, "yyyy-MM-dd")}T${hour}`;
              const cellItems = byCell.get(key) ?? [];
              return (
                <div
                  key={key}
                  onDragOver={(event) => {
                    if (!dragging) return;
                    event.preventDefault();
                    event.dataTransfer.dropEffect = "move";
                    setDropCell(key);
                  }}
                  onDragLeave={() =>
                    setDropCell((current) => (current === key ? null : current))
                  }
                  onDrop={(event) => {
                    event.preventDefault();
                    setDropCell(null);
                    if (dragging) onMove(dragging, cellDate(day, hour));
                    setDragging(null);
                  }}
                  onDoubleClick={() => onCompose(cellDate(day, hour))}
                  className={cn(
                    "group/cell space-y-1 border-b border-e border-border p-1 last:border-e-0",
                    dropCell === key && "bg-primary/10 ring-1 ring-inset ring-primary",
                  )}
                >
                  {cellItems.map((item) => (
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
              );
            })}
          </div>
        ))}
      </div>

      {renderOverflow(lateItems, t("late"))}
    </div>
  );
}

/** Exported so the shell can label the range without repeating the week maths. */
export function weekRangeLabel(
  anchor: Date,
  weekStartsOn: 0 | 1,
  locale?: Locale,
): string {
  const start = startOfWeek(anchor, { weekStartsOn });
  const end = addDays(start, 6);
  return `${format(start, "d MMM", { locale })} to ${format(end, "d MMM yyyy", { locale })}`;
}
