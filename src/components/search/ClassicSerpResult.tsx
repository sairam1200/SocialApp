"use client";

import React from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { useTranslations } from "next-intl";
import { platformDisplayName } from "@/lib/card-helpers";
import { isExternalResultUrl, isSafeResultUrl } from "@/lib/result-url";
import type { SearchResult } from "@/types/search.types";

interface ClassicSerpResultProps {
  result: SearchResult;
}

function getSourceLabel(type: string): string {
  switch (type) {
    case "content": return "Content";
    case "profile": return "Profile";
    case "project": return "Project";
    case "job": return "Job";
    default: return "Result";
  }
}

export function ClassicSerpResult({ result }: ClassicSerpResultProps) {
  const t = useTranslations("search");
  const sourceLabel = getSourceLabel(result.type);
  const platformLabel = platformDisplayName(result.platform);
  const snippet = result.description
    ? result.description.length > 200
      ? result.description.slice(0, 200) + "..."
      : result.description
    : "";
  const thumbnailUrl = result.media?.thumbnailUrl;
  const safeUrl = isSafeResultUrl(result.url) ? result.url : null;
  const isExternal = Boolean(safeUrl && isExternalResultUrl(safeUrl));

  const title = (
    <span className="block text-lg font-medium leading-snug text-primary hover:underline">
      {result.title || "Untitled"}
    </span>
  );

  return (
    <article
      data-testid="classic-serp-result"
      className="border-b border-border py-5 last:border-b-0"
    >
      <div className="flex gap-4">
        <div className="flex-1 min-w-0">
          <div className="mb-1 text-xs text-muted-foreground">
            {sourceLabel} - {platformLabel}
          </div>

          {/* Google-style destination line. The URL itself remains selectable
              and clickable, with an off-site marker only for non-Gaddr hosts. */}
          {safeUrl && (
            isExternal ? (
              <a
                href={safeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mb-1 inline-flex max-w-full items-center gap-1 text-xs text-foreground hover:underline"
              >
                <span className="truncate">{safeUrl}</span>
                <ExternalLink className="size-3 shrink-0" aria-hidden />
                <span className="sr-only">{t("externalResult")}</span>
              </a>
            ) : safeUrl.startsWith("/") ? (
              <Link
                href={safeUrl}
                className="mb-1 block truncate text-xs text-foreground hover:underline"
              >
                {safeUrl}
              </Link>
            ) : (
              <a
                href={safeUrl}
                className="mb-1 block truncate text-xs text-foreground hover:underline"
              >
                {safeUrl}
              </a>
            )
          )}

          {/* Title */}
          {safeUrl && isExternal ? (
            <a
              href={safeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1"
            >
              {title}
            </a>
          ) : safeUrl?.startsWith("/") ? (
            <Link href={safeUrl} className="block">
              {title}
            </Link>
          ) : safeUrl ? (
            <a href={safeUrl} className="block">
              {title}
            </a>
          ) : (
            <h3 className="text-lg font-medium leading-snug text-primary">
              {result.title || "Untitled"}
            </h3>
          )}

          {/* Snippet */}
          {snippet && (
            <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
              {snippet}
            </p>
          )}
        </div>

        {/* Thumbnail */}
        {thumbnailUrl && (
          <div className="shrink-0">
            <img
              src={thumbnailUrl}
              alt=""
              className="w-20 h-15 object-cover rounded"
              loading="lazy"
            />
          </div>
        )}
      </div>
    </article>
  );
}
