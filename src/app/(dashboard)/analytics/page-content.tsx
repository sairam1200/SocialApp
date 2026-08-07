"use client";

import { useEffect, useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import Image from "next/image";
import {
  AlertCircle,
  Eye,
  Lightbulb,
  MousePointerClick,
  ThumbsUp,
  TrendingUp,
  Users,
} from "lucide-react";
import { DateRangeFilter } from "@/components/analytics/Filters";
import { MetricCard } from "@/components/analytics/MetricCard";
import { GrowthChart } from "@/components/analytics/GrowthChart";
import { PlatformBreakdownChart } from "@/components/analytics/PlatformBreakdownChart";
import { ContentPerformanceTable } from "@/components/analytics/ContentPerformanceTable";
import {
  ChartSkeleton,
  ContentTableSkeleton,
  OverviewCardsSkeleton,
} from "@/components/analytics/LoadingSkeletons";
import { EmptyState, ErrorState } from "@/components/analytics/EmptyState";
import { Card } from "@/components/analytics/Card";
import { Button } from "@/components/ui/button";
import type { DateRange } from "@/types/analytics";
import YoutubeAnalyticsContent from "@/components/analytics/YoutubeAnalyticsContent";
import {
  useFacebookOverview,
  useFacebookTopPosts,
  useFacebookTopVideos,
  useFacebookTrends,
} from "@/hooks/api/useFacebookAnalytics";
import { apiClient } from "@/services/apiClient.service";
import type {
  ContentAnalytics,
  PlatformAnalytics,
  PlatformAnalyticsItem,
} from "@/services/api/analytics.service";
import { platforms as platformDefinitions } from "@/constants/platforms";
import { getAnalyticsErrorKind } from "./analytics-ui.util";

const METRIC_ICONS: Record<string, React.ReactNode> = {
  subscribers: (
    <Users className="size-5 text-muted-foreground" aria-hidden="true" />
  ),
  views: <Eye className="size-5 text-muted-foreground" aria-hidden="true" />,
  videos: <Eye className="size-5 text-muted-foreground" aria-hidden="true" />,
  engagement: (
    <TrendingUp className="size-5 text-muted-foreground" aria-hidden="true" />
  ),
  followers: (
    <Users className="size-5 text-muted-foreground" aria-hidden="true" />
  ),
  fans: <Users className="size-5 text-muted-foreground" aria-hidden="true" />,
  impressions: (
    <Eye className="size-5 text-muted-foreground" aria-hidden="true" />
  ),
  reach: <Eye className="size-5 text-muted-foreground" aria-hidden="true" />,
  pageViews: (
    <MousePointerClick
      className="size-5 text-muted-foreground"
      aria-hidden="true"
    />
  ),
  clicks: (
    <MousePointerClick
      className="size-5 text-muted-foreground"
      aria-hidden="true"
    />
  ),
};

function platformName(platform: string): string {
  return (
    platformDefinitions.find((definition) => definition.id === platform)
      ?.name ??
    platform
      .split(/[-_]/u)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ")
  );
}

function YoutubeSection({ range }: { range: DateRange }) {
  const t = useTranslations("analyticsDashboard");
  const [ready, setReady] = useState(false);
  const [syncing, setSyncing] = useState(true);
  const [syncError, setSyncError] = useState<unknown>(null);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        await apiClient.Youtube.getChannelAnalytics();
      } catch (error: unknown) {
        const apiError = error as {
          response?: {
            status?: number;
            data?: { title?: string; message?: string };
          };
          status?: number;
          statusCode?: number;
        };
        const status =
          apiError?.response?.status ??
          apiError?.status ??
          apiError?.statusCode;
        const message =
          apiError?.response?.data?.title ??
          apiError?.response?.data?.message ??
          "";

        if (
          status === 404 &&
          typeof message === "string" &&
          message.includes("No channel analytics")
        ) {
          await apiClient.Youtube.syncAnalytics();
        } else {
          throw error;
        }
      }

      if (!cancelled) {
        setReady(true);
        setSyncing(false);
      }
    }

    bootstrap().catch((error: unknown) => {
      if (!cancelled) {
        setSyncError(error);
        setSyncing(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  if (syncing) {
    return (
      <>
        <OverviewCardsSkeleton />
        <ChartSkeleton />
        <ContentTableSkeleton />
      </>
    );
  }

  if (syncError) {
    const kind = getAnalyticsErrorKind(syncError);
    return (
      <ErrorState
        title={t(`errors.${kind}.title`)}
        message={t(`errors.${kind}.message`)}
        retryLabel={t("errors.retry")}
        onRetry={() => window.location.reload()}
      />
    );
  }

  return ready ? <YoutubeAnalyticsContent range={range} /> : null;
}

function FacebookSection({ range }: { range: DateRange }) {
  const t = useTranslations("analyticsDashboard");
  const format = useFormatter();
  const overview = useFacebookOverview();
  const topPosts = useFacebookTopPosts(10);
  const topVideos = useFacebookTopVideos(10);
  const trends = useFacebookTrends(range);

  if (overview.isError) {
    const kind = getAnalyticsErrorKind(overview.error);
    return (
      <ErrorState
        title={t(`errors.${kind}.title`)}
        message={t(`errors.${kind}.message`)}
        retryLabel={t("errors.retry")}
        onRetry={() => overview.refetch()}
      />
    );
  }

  const primaryMetrics = [
    "followers",
    "reach",
    "impressions",
    "engagement",
  ] as const;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {primaryMetrics.map((key) => {
          const value = overview.data?.metrics[key];
          return (
            <MetricCard
              key={key}
              title={t(`metrics.${key}`)}
              value={
                typeof value === "number"
                  ? format.number(value)
                  : t("notAvailable")
              }
              icon={METRIC_ICONS[key]}
              loading={overview.isLoading}
            />
          );
        })}
      </div>

      <GrowthChart
        data={trends.data ?? []}
        metric="followers"
        title={t("charts.followerGrowth")}
        emptyMessage={t("charts.noData")}
        loading={trends.isLoading}
        color="var(--primary)"
      />

      <ContentTable
        title={t("content.topPosts")}
        emptyTitle={t("content.noTopPosts")}
        emptyDescription={t("content.topPostsHint")}
        items={topPosts.data ?? []}
        isLoading={topPosts.isLoading}
        isError={topPosts.isError}
        error={topPosts.error}
        onRetry={() => topPosts.refetch()}
        renderMetrics={(item) => (
          <>
            <div className="text-xs text-muted-foreground">
              {t("content.reachValue", {
                value: format.number(item.metrics.reach, {
                  notation: "compact",
                }),
              })}
            </div>
            <div className="text-xs text-muted-foreground">
              {t("content.engagementValue", {
                value: format.number(item.metrics.engagement, {
                  notation: "compact",
                }),
              })}
            </div>
          </>
        )}
      />

      <ContentTable
        title={t("content.topVideos")}
        emptyTitle={t("content.noTopVideos")}
        emptyDescription={t("content.topVideosHint")}
        items={topVideos.data ?? []}
        isLoading={topVideos.isLoading}
        isError={topVideos.isError}
        error={topVideos.error}
        onRetry={() => topVideos.refetch()}
        renderMetrics={(item) => (
          <>
            <div className="text-xs text-muted-foreground">
              {t("content.viewsValue", {
                value: format.number(item.metrics.views, {
                  notation: "compact",
                }),
              })}
            </div>
            <div className="text-xs text-muted-foreground">
              {t("content.completionValue", {
                value: format.number(item.metrics.completionRate ?? 0, {
                  maximumFractionDigits: 1,
                }),
              })}
            </div>
          </>
        )}
      />
    </div>
  );
}

function CrossPlatformSection({
  platforms,
  range,
  onSelectPlatform,
}: {
  platforms: PlatformAnalyticsItem[];
  range: DateRange;
  onSelectPlatform: (platform: string) => void;
}) {
  const t = useTranslations("analyticsDashboard");
  const format = useFormatter();
  const [contentAnalytics, setContentAnalytics] =
    useState<ContentAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);

    apiClient.Analytics.getContentAnalytics(range)
      .then((content) => {
        if (!cancelled) setContentAnalytics(content);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [range]);

  const totals = platforms.reduce(
    (result, item) => {
      result.followers += item.metrics.followers;
      result.posts += item.metrics.postCount;
      result.views += item.metrics.views;
      result.engagement += item.metrics.engagement;
      return result;
    },
    { followers: 0, posts: 0, views: 0, engagement: 0 },
  );
  const trendByDate = new Map<string, number>();
  for (const item of platforms) {
    for (const point of item.trend) {
      trendByDate.set(
        point.date,
        (trendByDate.get(point.date) ?? 0) + point.value,
      );
    }
  }
  const combinedTrend = Array.from(trendByDate, ([date, value]) => ({
    date,
    value,
  }));

  return (
    <div className="space-y-6">
      <section aria-labelledby="platform-status-title">
        <h2
          id="platform-status-title"
          className="mb-3 text-lg font-semibold text-foreground"
        >
          {t("permissions.platformStatus")}
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {platforms.map((item) => {
            const needsPermission = !["granted", "not_required"].includes(
              item.permission.state,
            );
            const status = needsPermission
              ? t(`permissions.states.${item.permission.state}`)
              : item.dataStatus === "no_data"
                ? t("empty.noDataStatus")
                : t("permissions.states.granted");

            return (
              <button
                key={item.platform}
                type="button"
                onClick={() => onSelectPlatform(item.platform)}
                aria-label={t("permissions.openPlatform", {
                  platform: platformName(item.platform),
                })}
                className="min-h-11 rounded-xl border border-border bg-card p-4 text-start transition-colors hover:border-primary/50 focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="block font-semibold text-foreground">
                  {platformName(item.platform)}
                </span>
                <span
                  className={
                    needsPermission
                      ? "mt-1 block text-sm text-destructive"
                      : "mt-1 block text-sm text-muted-foreground"
                  }
                >
                  {status}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title={t("metrics.followers")}
          value={format.number(totals.followers)}
          icon={METRIC_ICONS.followers}
        />
        <MetricCard
          title={t("metrics.posts")}
          value={format.number(totals.posts)}
          icon={METRIC_ICONS.videos}
        />
        <MetricCard
          title={t("metrics.views")}
          value={format.number(totals.views)}
          icon={METRIC_ICONS.views}
        />
        <MetricCard
          title={t("metrics.engagement")}
          value={format.number(totals.engagement)}
          icon={
            <ThumbsUp
              className="size-5 text-muted-foreground"
              aria-hidden="true"
            />
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <GrowthChart
          data={combinedTrend}
          metric="engagement"
          title={t("charts.engagementTrend")}
          emptyMessage={t("charts.noData")}
          color="var(--primary)"
        />
        <PlatformBreakdownChart
          data={platforms.map((item) => ({
            platform: item.platform,
            postCount: item.metrics.postCount,
          }))}
        />
      </div>

      {error ? (
        <ErrorState
          title={t("errors.loadFailed.title")}
          message={t("errors.loadFailed.message")}
          retryLabel={t("errors.retry")}
          onRetry={() => window.location.reload()}
        />
      ) : (
        <ContentPerformanceTable
          posts={contentAnalytics?.posts ?? []}
          loading={loading}
        />
      )}
    </div>
  );
}

function PlatformPermissionCard({ item }: { item: PlatformAnalyticsItem }) {
  const t = useTranslations("analyticsDashboard");
  const needsAttention = !["granted", "not_required"].includes(
    item.permission.state,
  );
  const scopes = item.permission.requiredScopes;

  return (
    <Card className="space-y-4">
      <div className="flex items-start gap-3">
        <AlertCircle
          className={
            needsAttention
              ? "mt-0.5 size-5 text-destructive"
              : "mt-0.5 size-5 text-primary"
          }
          aria-hidden="true"
        />
        <div className="min-w-0 flex-1">
          <h2 className="font-semibold text-foreground">
            {t("permissions.title")}
          </h2>
          <p
            className="mt-1 text-sm text-muted-foreground"
            role={item.permission.state === "denied" ? "alert" : "status"}
          >
            {t(`permissions.states.${item.permission.state}`)}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {t(`permissions.access.${item.permission.apiAccess}`)}
          </p>
        </div>
      </div>

      {scopes.length > 0 ? (
        <div>
          <p className="text-sm font-medium text-foreground">
            {t("permissions.required")}
          </p>
          <ul
            className="mt-2 flex flex-wrap gap-2"
            aria-label={t("permissions.required")}
          >
            {scopes.map((scope) => {
              const missing = item.permission.missingScopes.includes(scope);
              return (
                <li
                  key={scope}
                  className={
                    missing
                      ? "max-w-full rounded-md border border-destructive/40 bg-destructive/10 px-2 py-1 font-mono text-xs text-destructive"
                      : "max-w-full rounded-md border border-border bg-muted px-2 py-1 font-mono text-xs text-foreground"
                  }
                >
                  <span className="break-all">{scope}</span>
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">{t("permissions.none")}</p>
      )}
    </Card>
  );
}

function GaddrPlatformInsights({ item }: { item: PlatformAnalyticsItem }) {
  const t = useTranslations("analyticsDashboard");
  const format = useFormatter();
  const name = platformName(item.platform);

  if (item.dataStatus === "no_data") {
    return (
      <section className="space-y-4" aria-labelledby="gaddr-insights-title">
        <div>
          <h2
            id="gaddr-insights-title"
            className="text-lg font-semibold text-foreground"
          >
            {t("gaddrInsights.title")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("gaddrInsights.description", { platform: name })}
          </p>
        </div>
        <EmptyState
          title={t("empty.noPlatformDataTitle", { platform: name })}
          description={t("empty.noPlatformDataDescription")}
        />
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">
          {t("gaddrInsights.title")}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("gaddrInsights.description", { platform: name })}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title={t("metrics.followers")}
          value={format.number(item.metrics.followers)}
          icon={METRIC_ICONS.followers}
        />
        <MetricCard
          title={t("metrics.posts")}
          value={format.number(item.metrics.postCount)}
          icon={METRIC_ICONS.videos}
        />
        <MetricCard
          title={t("metrics.views")}
          value={format.number(item.metrics.views)}
          icon={METRIC_ICONS.views}
        />
        <MetricCard
          title={t("metrics.engagement")}
          value={format.number(item.metrics.engagement)}
          icon={METRIC_ICONS.engagement}
        />
      </div>

      <Card className="space-y-4">
        <div className="flex items-center gap-2">
          <Lightbulb className="size-5 text-primary" aria-hidden="true" />
          <h3 className="font-semibold text-foreground">
            {t("gaddrInsights.summary")}
          </h3>
        </div>
        {item.insights.length > 0 ? (
          <ul className="space-y-3">
            {item.insights.map((insight) => (
              <li
                key={`${insight.code}-${insight.contentTitle ?? insight.value}`}
                className="text-sm text-muted-foreground"
              >
                {t(`insights.${insight.code}`, {
                  value:
                    insight.code === "engagement_rate"
                      ? format.number(insight.value, {
                          maximumFractionDigits: 2,
                        })
                      : format.number(insight.value),
                  title: insight.contentTitle ?? "",
                })}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">
            {t("gaddrInsights.noSummary")}
          </p>
        )}
      </Card>

      <GrowthChart
        data={item.trend}
        metric="engagement"
        title={t("charts.platformEngagement", { platform: name })}
        emptyMessage={t("charts.noData")}
        color="var(--primary)"
      />
    </div>
  );
}

function PlatformSection({
  item,
  range,
}: {
  item: PlatformAnalyticsItem;
  range: DateRange;
}) {
  const t = useTranslations("analyticsDashboard");
  const canLoadNative = ["granted", "unverified", "not_required"].includes(
    item.permission.state,
  );
  const hasNativeView =
    item.platform === "youtube" || item.platform === "facebook";

  return (
    <div className="space-y-8">
      <PlatformPermissionCard item={item} />
      <GaddrPlatformInsights item={item} />
      {hasNativeView && canLoadNative ? (
        <section className="space-y-6" aria-labelledby="native-analytics-title">
          <div>
            <h2
              id="native-analytics-title"
              className="text-lg font-semibold text-foreground"
            >
              {t("nativeAnalytics.title", {
                platform: platformName(item.platform),
              })}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("nativeAnalytics.description")}
            </p>
          </div>
          {item.platform === "youtube" ? (
            <YoutubeSection range={range} />
          ) : (
            <FacebookSection range={range} />
          )}
        </section>
      ) : null}
    </div>
  );
}

interface ContentTableItem {
  id: string;
  title: string;
  thumbnailUrl?: string;
  publishedAt: string;
}

interface ContentTableProps<T extends ContentTableItem> {
  title: string;
  emptyTitle: string;
  emptyDescription: string;
  items: T[];
  isLoading: boolean;
  isError: boolean;
  error?: unknown;
  onRetry: () => void;
  renderMetrics: (item: T) => React.ReactNode;
}

function ContentTable<T extends ContentTableItem>({
  title,
  emptyTitle,
  emptyDescription,
  items,
  isLoading,
  isError,
  error,
  onRetry,
  renderMetrics,
}: ContentTableProps<T>) {
  const t = useTranslations("analyticsDashboard");
  const format = useFormatter();

  if (isError) {
    const kind = getAnalyticsErrorKind(error);
    return (
      <ErrorState
        title={t(`errors.${kind}.title`)}
        message={t(`errors.${kind}.message`)}
        retryLabel={t("errors.retry")}
        onRetry={onRetry}
      />
    );
  }
  if (!isLoading && items.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="mb-4 text-base font-semibold text-foreground">{title}</h3>
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-4">
            {item.thumbnailUrl ? (
              <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                <Image
                  src={item.thumbnailUrl}
                  alt={item.title}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="flex size-16 shrink-0 items-center justify-center rounded-lg bg-muted">
                <span className="text-xs text-muted-foreground">
                  {t("content.noImage")}
                </span>
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {item.title}
              </p>
              <p className="text-xs text-muted-foreground">
                {format.dateTime(new Date(item.publishedAt), {
                  dateStyle: "medium",
                })}
              </p>
            </div>
            <div className="shrink-0 text-end">{renderMetrics(item)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const t = useTranslations("analyticsDashboard");
  const [analytics, setAnalytics] = useState<PlatformAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string | "all">(
    "all",
  );
  const [dateRange, setDateRange] = useState<DateRange>("30d");

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setHasError(false);

    apiClient.Analytics.getPlatformAnalytics(dateRange)
      .then((result) => {
        if (!cancelled) {
          setAnalytics(result);
          setSelectedPlatform((current) =>
            current === "all" ||
            result.platforms.some((item) => item.platform === current)
              ? current
              : "all",
          );
        }
      })
      .catch(() => {
        if (!cancelled) setHasError(true);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [dateRange]);

  const connectedPlatforms = analytics?.platforms ?? [];
  const activePlatform =
    selectedPlatform === "all"
      ? null
      : (connectedPlatforms.find(
          (item) => item.platform === selectedPlatform,
        ) ?? null);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("description")}
          </p>
        </div>
        <DateRangeFilter value={dateRange} onChange={setDateRange} />
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <div className="h-11 w-56 animate-pulse rounded bg-muted" />
          <OverviewCardsSkeleton />
          <ChartSkeleton />
          <ContentTableSkeleton />
        </div>
      ) : hasError ? (
        <ErrorState
          title={t("errors.loadFailed.title")}
          message={t("errors.loadFailed.message")}
          retryLabel={t("errors.retry")}
          onRetry={() => window.location.reload()}
        />
      ) : connectedPlatforms.length === 0 ? (
        <EmptyState
          title={t("empty.noPlatformsTitle")}
          description={t("empty.noPlatformsDescription")}
          action={
            <Button
              label={t("empty.connectAction")}
              onClick={() => window.location.assign("/settings")}
            />
          }
        />
      ) : (
        <>
          <div
            className="flex flex-wrap gap-2"
            role="tablist"
            aria-label={t("platformTabsLabel")}
          >
            <button
              type="button"
              role="tab"
              aria-selected={selectedPlatform === "all"}
              onClick={() => setSelectedPlatform("all")}
              className={
                selectedPlatform === "all"
                  ? "min-h-11 rounded-full border-2 border-primary bg-primary/5 px-4 py-2 text-sm font-semibold text-primary focus-visible:ring-2 focus-visible:ring-ring"
                  : "min-h-11 rounded-full border-2 border-border bg-card px-4 py-2 text-sm font-semibold text-muted-foreground hover:border-primary/50 focus-visible:ring-2 focus-visible:ring-ring"
              }
            >
              {t("allPlatforms")}
            </button>
            {connectedPlatforms.map((item) => (
              <button
                key={item.platform}
                type="button"
                role="tab"
                aria-selected={selectedPlatform === item.platform}
                onClick={() => setSelectedPlatform(item.platform)}
                className={
                  selectedPlatform === item.platform
                    ? "min-h-11 rounded-full border-2 border-primary bg-primary/5 px-4 py-2 text-sm font-semibold text-primary focus-visible:ring-2 focus-visible:ring-ring"
                    : "min-h-11 rounded-full border-2 border-border bg-card px-4 py-2 text-sm font-semibold text-muted-foreground hover:border-primary/50 focus-visible:ring-2 focus-visible:ring-ring"
                }
              >
                {platformName(item.platform)}
              </button>
            ))}
          </div>

          {selectedPlatform === "all" ? (
            <CrossPlatformSection
              platforms={connectedPlatforms}
              range={dateRange}
              onSelectPlatform={setSelectedPlatform}
            />
          ) : activePlatform ? (
            <PlatformSection item={activePlatform} range={dateRange} />
          ) : null}
        </>
      )}
    </div>
  );
}
