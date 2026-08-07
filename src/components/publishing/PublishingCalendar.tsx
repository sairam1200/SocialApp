"use client";

import { useMemo, useState } from "react";
import {
  addMonths,
  addWeeks,
  endOfMonth,
  endOfWeek,
  format,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { useTranslations } from "next-intl";
import { CalendarDays, ChevronLeft, ChevronRight, List, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import CreatePostDialog from "@/components/create-post";
import { cn } from "@/utils/cn.util";
import { platformMap } from "@/constants/platforms";
import {
  useCancelPost,
  useDuplicatePost,
  usePublishCalendar,
  usePublishQueue,
  useReschedulePost,
} from "@/hooks/api/usePublishing";
import { accentFor, channelLabel } from "./channel-theme";
import { MonthGrid } from "./MonthGrid";
import { PostDetail } from "./PostDetail";
import { QueueList } from "./QueueList";
import { WeekGrid, weekRangeLabel } from "./WeekGrid";
import type { PublishItem, PublishStatus } from "@/types/publishing.types";

type View = "month" | "week" | "list";

/**
 * Monday, always.
 *
 * Every market this product sells into starts the week on Monday, and a
 * calendar whose week silently changes shape with the browser locale is a
 * calendar two people cannot discuss over a screen share.
 */
const WEEK_STARTS_ON = 1 as const;

export function PublishingCalendar() {
  const t = useTranslations("publishing");
  const [view, setView] = useState<View>("month");
  const [anchor, setAnchor] = useState(() => new Date());
  const [channels, setChannels] = useState<string[]>([]);
  const [selected, setSelected] = useState<PublishItem | null>(null);
  const [queueFilter, setQueueFilter] = useState<PublishStatus | "all">("all");
  // null closes the composer; a Date opens it seeded to that slot, and
  // `undefined` opens it with no schedule at all for a publish-now post.
  const [composeAt, setComposeAt] = useState<Date | null | undefined>(null);

  const range = useMemo(() => {
    if (view === "week") {
      return {
        from: startOfWeek(anchor, { weekStartsOn: WEEK_STARTS_ON }),
        to: endOfWeek(anchor, { weekStartsOn: WEEK_STARTS_ON }),
      };
    }
    // The month view draws leading and trailing days from the neighbouring
    // months, so the query has to cover them or those cells render empty and
    // the reader believes the week is free.
    return {
      from: startOfWeek(startOfMonth(anchor), { weekStartsOn: WEEK_STARTS_ON }),
      to: endOfWeek(endOfMonth(anchor), { weekStartsOn: WEEK_STARTS_ON }),
    };
  }, [anchor, view]);

  const calendar = usePublishCalendar(
    range.from.toISOString(),
    range.to.toISOString(),
    channels,
    view !== "list",
  );
  const queue = usePublishQueue(
    queueFilter === "all" ? [] : [queueFilter],
    channels,
    0,
  );

  const reschedule = useReschedulePost();
  const cancel = useCancelPost();
  const duplicate = useDuplicatePost();
  const busy = reschedule.isPending || cancel.isPending || duplicate.isPending;

  const items = calendar.data?.items ?? [];
  const knownChannels = useMemo(() => {
    const seen = new Set<string>(Object.keys(calendar.data?.countsByPlatform ?? {}));
    for (const channel of channels) seen.add(channel);
    return Array.from(seen).sort();
  }, [calendar.data?.countsByPlatform, channels]);

  function step(direction: -1 | 1) {
    setAnchor((current) =>
      view === "week"
        ? addWeeks(current, direction)
        : addMonths(current, direction),
    );
  }

  /**
   * A drop keeps the post's time of day and changes only its date in month
   * view; in week view the lane carries both. Dropping a 09:00 post onto next
   * Tuesday should give a 09:00 Tuesday post, not midnight.
   */
  function moveTo(item: PublishItem, target: Date, keepTimeOfDay: boolean) {
    const when = new Date(target);
    if (keepTimeOfDay) {
      const original = new Date(item.at);
      when.setHours(
        original.getHours(),
        original.getMinutes(),
        0,
        0,
      );
    }
    if (when.getTime() <= Date.now()) {
      // The API refuses a past time, and refusing here means the reader gets
      // the reason next to the calendar instead of as a toast after a request.
      return;
    }
    reschedule.mutate({
      publishJobId: item.id,
      scheduledAt: when.toISOString(),
    });
  }

  const rangeLabel =
    view === "week"
      ? weekRangeLabel(anchor, WEEK_STARTS_ON)
      : format(anchor, "MMMM yyyy");

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {t("title")}
          </h1>
          <p className="mt-1 max-w-prose text-sm text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => setComposeAt(undefined)}>
            <Plus aria-hidden />
            {t("newPost")}
          </Button>
        </div>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={t("previous")}
            onClick={() => step(-1)}
          >
            <ChevronLeft aria-hidden />
          </Button>
          <span className="min-w-[11rem] text-center text-sm font-medium tabular-nums text-foreground">
            {rangeLabel}
          </span>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={t("next")}
            onClick={() => step(1)}
          >
            <ChevronRight aria-hidden />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setAnchor(new Date())}
            className="ms-1"
          >
            {t("today")}
          </Button>
        </div>

        <div
          role="group"
          aria-label={t("viewLabel")}
          className="inline-flex rounded-full border border-border p-0.5"
        >
          {(
            [
              { value: "month", labelKey: "viewMonth", icon: CalendarDays },
              { value: "week", labelKey: "viewWeek", icon: CalendarDays },
              { value: "list", labelKey: "viewQueue", icon: List },
            ] as const
          ).map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setView(option.value)}
              aria-pressed={view === option.value}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                view === option.value
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t(option.labelKey)}
            </button>
          ))}
        </div>
      </div>

      {knownChannels.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setChannels([])}
            aria-pressed={channels.length === 0}
            className={cn(
              "rounded-full border px-3 py-1 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              channels.length === 0
                ? "border-foreground text-foreground"
                : "border-border text-muted-foreground hover:text-foreground",
            )}
          >
            {t("allChannels")}
          </button>
          {knownChannels.map((channel) => {
            const on = channels.includes(channel);
            const count = calendar.data?.countsByPlatform?.[channel] ?? 0;
            return (
              <button
                key={channel}
                type="button"
                onClick={() =>
                  setChannels((current) =>
                    current.includes(channel)
                      ? current.filter((entry) => entry !== channel)
                      : [...current, channel],
                  )
                }
                aria-pressed={on}
                style={{ ["--channel" as string]: accentFor(channel) }}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  on
                    ? "border-foreground text-foreground"
                    : "border-border text-muted-foreground hover:text-foreground",
                )}
              >
                <span
                  aria-hidden
                  className="size-2 rounded-full bg-[color:var(--channel)]"
                />
                {channelLabel(channel, platformMap)}
                {count > 0 && (
                  <span className="tabular-nums text-muted-foreground">{count}</span>
                )}
              </button>
            );
          })}
        </div>
      )}

      <div className="flex min-h-0 flex-1 gap-4">
        <div className="min-w-0 flex-1">
          {calendar.isError && view !== "list" && (
            <p className="rounded-xl border border-destructive/60 bg-destructive/5 p-4 text-sm text-foreground">
              {t("calendarError")}
            </p>
          )}

          {view === "month" && (
            <MonthGrid
              month={anchor}
              items={items}
              weekStartsOn={WEEK_STARTS_ON}
              onSelect={setSelected}
              onMove={(item, day) => moveTo(item, day, true)}
              onCompose={(day) => setComposeAt(defaultSlotOn(day))}
            />
          )}

          {view === "week" && (
            <WeekGrid
              anchor={anchor}
              items={items}
              weekStartsOn={WEEK_STARTS_ON}
              onSelect={setSelected}
              onMove={(item, when) => moveTo(item, when, false)}
              onCompose={(when) => setComposeAt(when)}
            />
          )}

          {view === "list" && (
            <QueueList
              items={queue.data?.items ?? []}
              total={queue.data?.total ?? 0}
              active={queueFilter}
              loading={queue.isLoading}
              onFilter={setQueueFilter}
              onSelect={setSelected}
            />
          )}
        </div>

        {selected && (
          <div className="w-full max-w-sm shrink-0">
            <PostDetail
              item={selected}
              busy={busy}
              onClose={() => setSelected(null)}
              onReschedule={(item, when, applyToGroup) => {
                reschedule.mutate(
                  { publishJobId: item.id, scheduledAt: when, applyToGroup },
                  { onSuccess: () => setSelected(null) },
                );
              }}
              onCancel={(item, applyToGroup) => {
                cancel.mutate(
                  { publishJobId: item.id, applyToGroup },
                  { onSuccess: () => setSelected(null) },
                );
              }}
              onDuplicate={(item, when) => {
                duplicate.mutate({ publishJobId: item.id, scheduledAt: when });
              }}
            />
          </div>
        )}
      </div>

      <CreatePostDialog
        open={composeAt !== null}
        close={() => setComposeAt(null)}
        initialScheduleAt={composeAt ?? null}
      />
    </div>
  );
}

/**
 * The hour a month-view slot opens at.
 *
 * A month cell carries a day and no time. Midnight would be both a bad hour to
 * post and a time the API refuses on any day already begun, so the slot opens
 * at 09:00, or an hour from now when that has already passed today.
 */
function defaultSlotOn(day: Date): Date {
  const slot = new Date(day);
  slot.setHours(9, 0, 0, 0);
  if (slot.getTime() <= Date.now()) {
    const soon = new Date(Date.now() + 60 * 60 * 1000);
    soon.setMinutes(0, 0, 0);
    return soon;
  }
  return slot;
}
