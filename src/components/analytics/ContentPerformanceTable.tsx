"use client";

import { cn } from "@/utils/cn.util";
import { Card } from "./Card";
import type { ContentPost } from "@/services/api/analytics.service";
import { useFormatter, useTranslations } from "next-intl";

interface ContentPerformanceTableProps {
  posts: ContentPost[];
  className?: string;
  loading?: boolean;
}

function formatPlatformBadge(platform: string): {
  label: string;
  className: string;
} {
  //social media platform mapping to display names
  const map: Record<string, string> = {
    youtube: "YouTube",
    facebook: "Facebook",
    instagram: "Instagram",
    twitter: "X",
    tiktok: "TikTok",
    linkedin: "LinkedIn",
  };
  return {
    label: map[platform.toLowerCase()] ?? platform,
    className: "border border-border bg-muted text-foreground",
  };
}

export function ContentPerformanceTable({
  posts,
  className,
  loading,
}: ContentPerformanceTableProps) {
  const t = useTranslations("analyticsDashboard");
  const format = useFormatter();
  if (loading) {
    return (
      <Card className={className}>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4 animate-pulse">
              <div className="h-4 w-32 bg-muted rounded" />
              <div className="h-4 w-16 bg-muted rounded" />
              <div className="h-4 w-20 bg-muted rounded ml-auto" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (posts.length === 0) {
    return (
      <Card className={className}>
        <h3 className="text-base font-semibold text-foreground mb-4">
          {t("content.performance")}
        </h3>
        <p className="text-sm text-muted-foreground text-center py-8">
          {t("content.noPerformanceData")}
        </p>
      </Card>
    );
  }

  const sorted = [...posts].sort((a, b) => {
    const totalA =
      a.engagement.likes +
      a.engagement.comments +
      a.engagement.views +
      a.engagement.shares;
    const totalB =
      b.engagement.likes +
      b.engagement.comments +
      b.engagement.views +
      b.engagement.shares;
    return totalB - totalA;
  });

  return (
    <Card className={className}>
      <h3 className="text-base font-semibold text-foreground mb-4">
        {t("content.performance")}
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-start py-3 px-2 text-muted-foreground font-medium">
                {t("content.columns.title")}
              </th>
              <th className="text-start py-3 px-2 text-muted-foreground font-medium">
                {t("content.columns.platform")}
              </th>
              <th className="text-end py-3 px-2 text-muted-foreground font-medium">
                {t("content.columns.views")}
              </th>
              <th className="text-end py-3 px-2 text-muted-foreground font-medium">
                {t("content.columns.likes")}
              </th>
              <th className="text-end py-3 px-2 text-muted-foreground font-medium">
                {t("content.columns.comments")}
              </th>
              <th className="text-end py-3 px-2 text-muted-foreground font-medium">
                {t("content.columns.total")}
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.slice(0, 10).map((post) => {
              const total =
                post.engagement.likes +
                post.engagement.comments +
                post.engagement.views +
                post.engagement.shares;
              const badge = formatPlatformBadge(post.platform);
              return (
                <tr
                  key={post.id}
                  className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                >
                  <td className="py-3 px-2 text-foreground font-medium truncate max-w-[200px]">
                    {post.title}
                  </td>
                  <td className="py-3 px-2">
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded-full text-xs font-medium",
                        badge.className,
                      )}
                    >
                      {badge.label}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-end text-muted-foreground">
                    {format.number(post.engagement.views, {
                      notation: "compact",
                    })}
                  </td>
                  <td className="py-3 px-2 text-end text-muted-foreground">
                    {format.number(post.engagement.likes, {
                      notation: "compact",
                    })}
                  </td>
                  <td className="py-3 px-2 text-end text-muted-foreground">
                    {format.number(post.engagement.comments, {
                      notation: "compact",
                    })}
                  </td>
                  <td className="py-3 px-2 text-end font-semibold text-foreground">
                    {format.number(total, { notation: "compact" })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
