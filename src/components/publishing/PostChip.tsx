"use client";

import { useTranslations } from "next-intl";
import { AlertTriangle, Ban, Check, Clock, Loader2 } from "lucide-react";
import { cn } from "@/utils/cn.util";
import { platformMap } from "@/constants/platforms";
import { accentFor, channelLabel } from "./channel-theme";
import type { PublishItem, PublishStatus } from "@/types/publishing.types";

const STATUS_ICON: Record<PublishStatus, typeof Clock> = {
  scheduled: Clock,
  pending: Clock,
  processing: Loader2,
  completed: Check,
  failed: AlertTriangle,
  cancelled: Ban,
};

/**
 * How each state reads at a glance, without colour doing the work alone.
 *
 * A calendar where "failed" is only red is a calendar that fails for one reader
 * in twelve. Every state carries an icon and a different border weight as well,
 * so status survives a greyscale screenshot.
 */
const STATUS_STYLE: Record<PublishStatus, string> = {
  scheduled: "border-border bg-card",
  pending: "border-border bg-card",
  processing: "border-primary/60 bg-primary/5",
  completed: "border-transparent bg-muted/60",
  failed: "border-destructive/70 bg-destructive/5",
  cancelled: "border-dashed border-border bg-transparent opacity-60",
};

interface PostChipProps {
  item: PublishItem;
  /** Rendered inside an hour lane, where vertical room is fixed. */
  compact?: boolean;
  timeLabel: string;
  onSelect: (item: PublishItem) => void;
  onDragStart?: (item: PublishItem) => void;
  isDragging?: boolean;
}

export function PostChip({
  item,
  compact,
  timeLabel,
  onSelect,
  onDragStart,
  isDragging,
}: PostChipProps) {
  const t = useTranslations("publishing");
  const Icon = STATUS_ICON[item.status] ?? Clock;
  const platform = platformMap[item.platform as keyof typeof platformMap];
  const PlatformIcon = platform?.icon;
  const label = channelLabel(item.platform, platformMap);
  const text = item.excerpt || item.title || label;

  return (
    <button
      type="button"
      // Only a post that can still move is draggable. A published post that
      // followed the cursor and then snapped back would be a lie about what the
      // calendar can do.
      draggable={item.editable}
      onDragStart={(event) => {
        if (!item.editable) return;
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", item.id);
        onDragStart?.(item);
      }}
      onClick={() => onSelect(item)}
      aria-label={`${label}, ${timeLabel}, ${t(`status.${item.status}`)}. ${text}`}
      style={{ ["--channel" as string]: accentFor(item.platform) }}
      className={cn(
        "group relative flex w-full items-start gap-2 overflow-hidden rounded-md border py-1.5 pe-2 ps-3 text-start transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "hover:border-foreground/30",
        STATUS_STYLE[item.status] ?? STATUS_STYLE.scheduled,
        item.editable ? "cursor-grab active:cursor-grabbing" : "cursor-pointer",
        isDragging && "opacity-40",
      )}
    >
      <span
        aria-hidden
        className="absolute inset-y-0 start-0 w-[3px] bg-[color:var(--channel)]"
      />

      {PlatformIcon ? (
        <PlatformIcon
          aria-hidden
          className="mt-0.5 size-3.5 shrink-0 fill-current text-muted-foreground"
        />
      ) : (
        <span
          aria-hidden
          className="mt-1 size-2 shrink-0 rounded-full bg-[color:var(--channel)]"
        />
      )}

      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <time className="text-[11px] font-medium tabular-nums text-muted-foreground">
            {timeLabel}
          </time>
          <Icon
            aria-hidden
            className={cn(
              "size-3 shrink-0",
              item.status === "failed"
                ? "text-destructive"
                : "text-muted-foreground",
              item.status === "processing" && "animate-spin text-primary",
            )}
          />
          {item.groupId && (
            <span
              className="text-[10px] text-muted-foreground"
              title={t("detail.multiChannel")}
            >
              ×
            </span>
          )}
        </span>
        <span
          className={cn(
            "mt-0.5 block truncate text-xs text-foreground",
            compact ? "leading-tight" : "line-clamp-2 whitespace-normal",
          )}
        >
          {text}
        </span>
      </span>
    </button>
  );
}
