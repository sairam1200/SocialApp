"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
} from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ExternalLink, Eye, MousePointerClick } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { apiClient } from "@/services/apiClient.service";
import type { SearchResultEngagementStats } from "@/services/api/search.service";
import {
  isExternalResultUrl,
  isSafeResultUrl,
  normalizeContentStreamId,
} from "@/lib/result-url";
import { useContentStreamEngagementSocket } from "@/hooks/useContentStreamEngagementSocket";
import { cn } from "@/utils/cn.util";

export interface InteractiveSearchResult {
  id: string;
  contentStreamId?: string;
  gaddrViews?: string;
  gaddrExternalClicks?: string;
  type: string;
  title?: string;
  description?: string | null;
  platform: string;
  url?: string;
  externalUrl?: string | null;
  profileHandle?: string | null;
  publicProfile?: unknown;
  author?: { handle?: string };
  media?: { url?: string; thumbnailUrl?: string };
}

interface SearchResultInteractionProps {
  result: InteractiveSearchResult;
  children: React.ReactNode;
  className?: string;
}

function resultHref(result: InteractiveSearchResult): string | undefined {
  if (result.url) return result.url;
  if (result.type !== "profile") return undefined;

  const profile = result.publicProfile as { userName?: string } | undefined;
  const handle = result.profileHandle ?? profile?.userName ?? result.author?.handle;
  return handle ? `/${handle.replace(/^@/, "")}` : undefined;
}

function displayCount(value: string): string {
  try {
    return new Intl.NumberFormat().format(BigInt(value));
  } catch {
    return value;
  }
}

function greatestCount(current: string, incoming: string): string {
  try {
    return BigInt(incoming) >= BigInt(current) ? incoming : current;
  } catch {
    return incoming;
  }
}

function videoEmbedUrl(value: string | undefined): string | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, "").toLowerCase();
    if (host === "youtu.be") {
      const id = url.pathname.split("/").filter(Boolean)[0];
      return id ? `https://www.youtube.com/embed/${encodeURIComponent(id)}` : undefined;
    }
    if (host.endsWith("youtube.com")) {
      const id = url.searchParams.get("v") ?? url.pathname.match(/\/(?:shorts|embed)\/([^/?#]+)/)?.[1];
      return id ? `https://www.youtube.com/embed/${encodeURIComponent(id)}` : undefined;
    }
    if (host.endsWith("vimeo.com")) {
      const id = url.pathname.match(/\/(?:video\/)?(\d+)/)?.[1];
      return id ? `https://player.vimeo.com/video/${id}` : undefined;
    }
    if (host.endsWith("tiktok.com")) {
      const id = url.pathname.match(/\/video\/(\d+)/)?.[1];
      return id ? `https://www.tiktok.com/player/v1/${id}` : undefined;
    }
    if (host.endsWith("instagram.com") && /\/(?:p|reel|tv)\//.test(url.pathname)) {
      return `${url.origin}${url.pathname.replace(/\/+$/, "")}/embed/`;
    }
  } catch {
    return undefined;
  }
  return undefined;
}

export function SearchResultInteraction({
  result,
  children,
  className,
}: SearchResultInteractionProps) {
  const t = useTranslations("search");
  const router = useRouter();
  const rawHref = resultHref(result);
  const href = isSafeResultUrl(rawHref) ? rawHref : undefined;
  const defaultExternalHref = isSafeResultUrl(result.externalUrl)
    ? result.externalUrl
    : isExternalResultUrl(href)
      ? href
      : undefined;
  const isExternal = isExternalResultUrl(defaultExternalHref);
  const isProjectOrJob = result.type === "project" || result.type === "job";
  const isCardOverlayResult =
    result.type === "profile" || isProjectOrJob;
  const contentStreamId = normalizeContentStreamId(result.contentStreamId);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewHref, setPreviewHref] = useState<string | undefined>(
    defaultExternalHref ?? undefined,
  );
  const [stats, setStats] = useState<SearchResultEngagementStats | null>(() =>
    contentStreamId && result.gaddrViews != null
      ? {
        views: result.gaddrViews,
        externalClicks: result.gaddrExternalClicks ?? "0",
      }
      : null,
  );

  const applyStats = useCallback((next: SearchResultEngagementStats) => {
    setStats((current) => current
      ? {
        views: greatestCount(current.views, next.views),
        externalClicks: greatestCount(
          current.externalClicks,
          next.externalClicks,
        ),
      }
      : next);
  }, []);

  useContentStreamEngagementSocket(contentStreamId, applyStats);

  const platformLabel = useMemo(
    () => result.platform || t("externalPlatform"),
    [result.platform, t],
  );
  const embedUrl = useMemo(
    () => videoEmbedUrl(result.media?.url) ?? videoEmbedUrl(previewHref),
    [previewHref, result.media?.url],
  );

  useEffect(() => {
    if (!contentStreamId) {
      setStats(null);
      return;
    }

    setStats((current) => current ?? {
      views: result.gaddrViews ?? "0",
      externalClicks: result.gaddrExternalClicks ?? "0",
    });
  }, [contentStreamId, result.gaddrExternalClicks, result.gaddrViews]);

  const trackView = useCallback(() => {
    if (!contentStreamId) return;
    void apiClient.Search.trackResultEngagement(contentStreamId, {
      event: "view",
    })
      .then(applyStats)
      .catch(() => undefined);
  }, [applyStats, contentStreamId]);

  const openResult = () => {
    if (!href) return;
    trackView();
    if (isExternal) {
      setPreviewHref(defaultExternalHref ?? undefined);
      setPreviewOpen(true);
      return;
    }
    router.push(href);
  };

  const openExternal = () => {
    if (!isSafeResultUrl(previewHref) || !isExternalResultUrl(previewHref)) return;
    window.open(previewHref, "_blank", "noopener,noreferrer");
    if (!contentStreamId) return;

    void apiClient.Search.trackResultEngagement(contentStreamId, {
      event: "external_click",
    })
      .then(applyStats)
      .catch(() => undefined);
  };

  const handleClickCapture = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    // Dialog portals retain React ancestry. Ignore their events here so
    // choosing a bookmark collection never activates the underlying card.
    if (target.closest('[role="dialog"], [data-result-action]')) return;
    trackView();
    // Share, bookmark and follow remain their own actions.
    if (target.closest("button")) return;
    const clickedAnchor = target.closest<HTMLAnchorElement>("a[href]");
    const clickedHref = clickedAnchor?.href;

    if (clickedHref && !isSafeResultUrl(clickedHref)) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    if (isExternalResultUrl(clickedHref, window.location.origin)) {
      event.preventDefault();
      event.stopPropagation();
      setPreviewHref(clickedHref);
      setPreviewOpen(true);
      return;
    }

    if (!href) return;

    if (isExternal) {
      event.preventDefault();
      event.stopPropagation();
      setPreviewHref(defaultExternalHref ?? undefined);
      setPreviewOpen(true);
      return;
    }

    // Existing internal links keep native navigation. The rest of a profile
    // card becomes clickable too, fixing the inert search-card surface.
    if (!target.closest("a")) {
      event.preventDefault();
      router.push(href);
    }
  };

  return (
    <>
      <div
        className={cn(
          "relative isolate flex h-full min-h-0 flex-col",
          href && "cursor-pointer",
          className,
        )}
        style={
          isExternal
            ? ({ "--content-card-action-offset": "1.75rem" } as CSSProperties)
            : undefined
        }
        onClickCapture={handleClickCapture}
        onKeyDown={(event) => {
          if ((event.key === "Enter" || event.key === " ") && event.target === event.currentTarget) {
            event.preventDefault();
            openResult();
          }
        }}
        tabIndex={href ? 0 : undefined}
        role={href ? "link" : undefined}
        data-testid="search-result-card"
        data-result-type={result.type}
        data-external-result={isExternal ? "true" : undefined}
      >
        {isExternal && (
          <span
            data-testid="external-result-indicator"
            className={cn(
              "pointer-events-none absolute top-2 z-10 inline-flex whitespace-nowrap items-center gap-1 rounded-full border border-border bg-card/95 px-2 py-1 text-xs font-medium text-foreground shadow-sm",
              isCardOverlayResult ? "start-2" : "end-2",
            )}
          >
            <ExternalLink className="size-3" aria-hidden />
            {t("externalResult")}
          </span>
        )}
        {children}
        {stats && (
          <span
            data-testid="result-view-count"
            className={cn(
              "pointer-events-none absolute bottom-2 z-10 inline-flex whitespace-nowrap items-center gap-1 rounded-full border border-border bg-card/95 px-2 py-1 text-xs font-medium text-foreground shadow-sm",
              isProjectOrJob ? "start-2" : "end-2",
            )}
          >
            <Eye className="size-3" aria-hidden />
            {t("gaddrViews", { count: displayCount(stats.views) })}
          </span>
        )}
      </div>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <div className="mb-1 flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <ExternalLink className="size-3.5" aria-hidden />
              {t("externalResult")}
            </div>
            <DialogTitle>{result.title || t("untitledResult")}</DialogTitle>
            <DialogDescription>
              {t("externalResultHint", { platform: platformLabel })}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {result.media?.url && /\.(mp4|webm|mov|m4v)(\?|$)/i.test(result.media.url) ? (
              <video
                src={result.media.url}
                controls
                playsInline
                poster={result.media.thumbnailUrl}
                className="max-h-[55vh] w-full rounded-xl bg-muted object-contain"
              >
                <track kind="captions" />
              </video>
            ) : embedUrl ? (
              <div className="aspect-video overflow-hidden rounded-xl bg-muted">
                <iframe
                  src={embedUrl}
                  title={result.title || t("untitledResult")}
                  allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                  className="h-full w-full border-0"
                />
              </div>
            ) : result.media?.thumbnailUrl ? (
              <div className="relative aspect-video overflow-hidden rounded-xl bg-muted">
                <Image
                  src={result.media.thumbnailUrl}
                  alt=""
                  fill
                  unoptimized
                  sizes="(max-width: 640px) 100vw, 640px"
                  className="object-contain"
                />
              </div>
            ) : null}

            {result.description && (
              <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                {result.description}
              </p>
            )}

            {stats && (
              <div className="flex flex-wrap gap-4 rounded-xl border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Eye className="size-4" aria-hidden />
                  {t("gaddrViews", { count: displayCount(stats.views) })}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MousePointerClick className="size-4" aria-hidden />
                  {t("outboundClicks", { count: displayCount(stats.externalClicks) })}
                </span>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" onClick={openExternal}>
              {t("continueTo", { platform: platformLabel })}
              <ExternalLink className="size-4" aria-hidden />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
