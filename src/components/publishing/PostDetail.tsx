"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import {
  AlertTriangle,
  CalendarClock,
  Copy,
  ExternalLink,
  Send,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn.util";
import { platformMap } from "@/constants/platforms";
import { accentFor, channelLabel } from "./channel-theme";
import type { PublishItem } from "@/types/publishing.types";

interface PostDetailProps {
  item: PublishItem;
  busy?: boolean;
  onClose: () => void;
  onReschedule: (item: PublishItem, when: string | null, applyToGroup: boolean) => void;
  onCancel: (item: PublishItem, applyToGroup: boolean) => void;
  onDuplicate: (item: PublishItem, when: string | null) => void;
}

/** `datetime-local` wants wall-clock in the reader's zone, not an ISO instant. */
function toLocalInputValue(iso: string): string {
  const date = new Date(iso);
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function PostDetail({
  item,
  busy,
  onClose,
  onReschedule,
  onCancel,
  onDuplicate,
}: PostDetailProps) {
  const t = useTranslations("publishing");
  const [when, setWhen] = useState(() => toLocalInputValue(item.at));
  const [applyToGroup, setApplyToGroup] = useState(false);
  const label = channelLabel(item.platform, platformMap);
  const isGroup = Boolean(item.groupId);

  return (
    <aside
      role="dialog"
      aria-label={`${label} post`}
      className="flex h-full w-full flex-col border-s border-border bg-card"
    >
      <header
        style={{ ["--channel" as string]: accentFor(item.platform) }}
        className="relative flex items-start justify-between gap-3 border-b border-border p-4"
      >
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 h-[3px] bg-[color:var(--channel)]"
        />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">{label}</p>
          <p className="text-xs text-muted-foreground">
            {format(new Date(item.at), "EEEE d MMMM, HH:mm")}
            {item.timezone ? ` (${item.timezone})` : ""}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onClose}
          aria-label={t("detail.close")}
        >
          <X aria-hidden />
        </Button>
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        <div className="flex flex-wrap items-center gap-2">
          <StatusPill item={item} />
          <span className="rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground">
            {item.postFormat}
          </span>
          {item.deliveryMode === "native" && (
            <span
              className="rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground"
              title="The platform is holding this post until its publish time, not Gaddr."
            >
              {t("detail.heldBy", { channel: label })}
            </span>
          )}
          {isGroup && (
            <span className="rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground">
              {t("detail.multiChannel")}
            </span>
          )}
        </div>

        {item.title && (
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
              {t("detail.titleLabel")}
            </p>
            <p className="mt-0.5 text-sm text-foreground">{item.title}</p>
          </div>
        )}

        <div>
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
            {t("detail.captionLabel")}
          </p>
          <p className="mt-0.5 whitespace-pre-wrap text-sm text-foreground">
            {item.excerpt || t("detail.noCaption")}
          </p>
        </div>

        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {item.tags.map((tag) => (
              <span
                key={tag}
                className="rounded bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* A failure is shown with the platform's own words. "Publishing
            failed" tells the user nothing they can act on; "your token no
            longer has pages_manage_posts" tells them exactly what to do. */}
        {item.status === "failed" && item.lastError && (
          <div className="rounded-lg border border-destructive/60 bg-destructive/5 p-3">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-destructive">
              <AlertTriangle aria-hidden className="size-3.5" />
              {t("detail.rejected", { channel: label })}
            </p>
            <p className="mt-1 text-xs text-foreground">{item.lastError}</p>
            {item.attempts > 1 && (
              <p className="mt-1 text-[11px] text-muted-foreground">
                {t("detail.attempts", { count: item.attempts })}
              </p>
            )}
          </div>
        )}

        {item.status === "processing" && (
          <div className="rounded-lg border border-border p-3">
            <p className="text-xs text-muted-foreground">
              {item.statusMessage ?? t("detail.publishing")}
            </p>
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-border">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${Math.max(4, item.progress)}%` }}
              />
            </div>
          </div>
        )}

        {item.platformContentUrl && (
          <a
            href={item.platformContentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {t("detail.viewOn", { channel: label })}
            <ExternalLink aria-hidden className="size-3.5" />
          </a>
        )}

        {item.editable && (
          <div className="space-y-2 rounded-lg border border-border p-3">
            <label
              htmlFor="reschedule-at"
              className="flex items-center gap-1.5 text-xs font-medium text-foreground"
            >
              <CalendarClock aria-hidden className="size-3.5" />
              {t("detail.moveTo")}
            </label>
            <input
              id="reschedule-at"
              type="datetime-local"
              value={when}
              onChange={(event) => setWhen(event.target.value)}
              className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            {isGroup && (
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked={applyToGroup}
                  onChange={(event) => setApplyToGroup(event.target.checked)}
                  className="size-3.5 accent-primary"
                />
                {t("detail.applyToGroup")}
              </label>
            )}
            <div className="flex flex-wrap gap-2 pt-1">
              <Button
                size="sm"
                disabled={busy}
                onClick={() =>
                  onReschedule(item, new Date(when).toISOString(), applyToGroup)
                }
              >
                {t("detail.saveTime")}
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={busy}
                onClick={() => onReschedule(item, null, applyToGroup)}
              >
                <Send aria-hidden />
                {t("detail.publishNow")}
              </Button>
            </div>
          </div>
        )}
      </div>

      <footer className="flex flex-wrap gap-2 border-t border-border p-4">
        <Button
          size="sm"
          variant="outline"
          disabled={busy}
          onClick={() => onDuplicate(item, null)}
        >
          <Copy aria-hidden />
          {t("detail.duplicate")}
        </Button>
        {item.status !== "completed" && item.status !== "cancelled" && (
          <Button
            size="sm"
            variant="destructive"
            disabled={busy || item.status === "processing"}
            title={
              item.status === "processing"
                ? t("detail.cannotCancelProcessing")
                : undefined
            }
            onClick={() => onCancel(item, applyToGroup)}
          >
            <Trash2 aria-hidden />
            {t("detail.cancel")}
          </Button>
        )}
      </footer>
    </aside>
  );
}

function StatusPill({ item }: { item: PublishItem }) {
  const t = useTranslations("publishing");
  const styles: Record<string, string> = {
    scheduled: "border-border text-foreground",
    pending: "border-border text-foreground",
    processing: "border-primary/60 text-primary",
    completed: "border-transparent bg-muted text-muted-foreground",
    failed: "border-destructive/70 text-destructive",
    cancelled: "border-dashed border-border text-muted-foreground",
  };
  return (
    <span
      className={cn(
        "rounded-full border px-2 py-0.5 text-[11px] font-medium",
        styles[item.status] ?? styles.scheduled,
      )}
    >
      {t(`status.${item.status}`)}
    </span>
  );
}
