"use client";

import { useState } from "react";
import { useEffect } from "react";
import { useConnectedPlatforms } from "@/hooks/useConnectedPlatforms";
import { PlatformSelector, DateRangeFilter } from "@/components/analytics/Filters";
import { MetricCard } from "@/components/analytics/MetricCard";
import { GrowthChart } from "@/components/analytics/GrowthChart";
import { OverviewCardsSkeleton, ChartSkeleton, ContentTableSkeleton } from "@/components/analytics/LoadingSkeletons";
import { EmptyState, ErrorState } from "@/components/analytics/EmptyState";
import { Card } from "@/components/analytics/Card";
import { Button } from "@/components/ui/button";
import { PlatformId, DateRange } from "@/types/analytics";
import { formatNumber, formatCompactNumber } from "@/components/analytics/PlatformIcon";
import { Eye, Users, ThumbsUp, TrendingUp, MousePointerClick } from "lucide-react";
import Image from "next/image";
import YoutubeAnalyticsContent from "@/components/analytics/YoutubeAnalyticsContent";
import {
  useFacebookOverview,
  useFacebookTopPosts,
  useFacebookTopVideos,
  useFacebookTrends,
} from "@/hooks/api/useFacebookAnalytics";
import { apiClient } from "@/services/apiClient.service";
const ANALYTICS_METRICS: Record<string, { label: string; icon?: React.ReactNode }> = {
  subscribers: { label: "Subscribers", icon: <Users className="w-5 h-5 text-gray-400" /> },
  views: { label: "Views", icon: <Eye className="w-5 h-5 text-gray-400" /> },
  videos: { label: "Videos", icon: <Eye className="w-5 h-5 text-gray-400" /> },
  engagement: { label: "Engagement", icon: <TrendingUp className="w-5 h-5 text-gray-400" /> },
  followers: { label: "Followers", icon: <Users className="w-5 h-5 text-gray-400" /> },
  fans: { label: "Fans", icon: <Users className="w-5 h-5 text-gray-400" /> },
  impressions: { label: "Impressions", icon: <Eye className="w-5 h-5 text-gray-400" /> },
  reach: { label: "Reach", icon: <Eye className="w-5 h-5 text-gray-400" /> },
  pageViews: { label: "Page Views", icon: <MousePointerClick className="w-5 h-5 text-gray-400" /> },
  clicks: { label: "Clicks", icon: <MousePointerClick className="w-5 h-5 text-gray-400" /> },
};
function YoutubeSection({ range }: { range: DateRange }) {
  const [ready, setReady] = useState(false);
  const [syncing, setSyncing] = useState(true);
  const [syncError, setSyncError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        await apiClient.Youtube.getChannelAnalytics();
      } catch (err: any) {
        const status =
          err?.response?.status ??
          err?.status ??
          err?.statusCode;

        const message =
          err?.response?.data?.title ??
          err?.response?.data?.message ??
          "";

        if (
          status === 404 &&
          typeof message === "string" &&
          message.includes("No channel analytics")
        ) {
          await apiClient.Youtube.syncAnalytics();
        } else {
          throw err;
        }
      }

      if (!cancelled) {
        setReady(true);
        setSyncing(false);
      }
    }

    bootstrap().catch((err) => {
      if (!cancelled) {
        setSyncError(err);
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
    return (
      <ErrorState
        title="Failed to initialize analytics"
        message={
          syncError instanceof Error
            ? syncError.message
            : "Something went wrong."
        }
        onRetry={() => window.location.reload()}
      />
    );
  }

  if (!ready) return null;

  return <YoutubeAnalyticsContent range={range} />;
}


function FacebookSection({ range }: { range: DateRange }) {
  const overview = useFacebookOverview();
  const topPosts = useFacebookTopPosts(10);
  const topVideos = useFacebookTopVideos(10);
  const trends = useFacebookTrends(range);

  if (overview.isError) {
    return <ErrorState title="Failed to load Facebook analytics" message={overview.error instanceof Error ? overview.error.message : "Something went wrong."} onRetry={() => overview.refetch()} />;
  }

  const primaryMetrics = ["followers", "reach", "impressions", "engagement"];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {primaryMetrics.map((key) => {
          const config = ANALYTICS_METRICS[key] ?? { label: key };
          const value = overview.data?.metrics[key as keyof typeof overview.data.metrics];
          return (
            <MetricCard
              key={key}
              title={config.label}
              value={typeof value === "number" ? value.toLocaleString() : "—"}
              icon={config.icon}
              loading={overview.isLoading}
            />
          );
        })}
      </div>

      <GrowthChart
        data={trends.data ?? []}
        metric="followers"
        loading={trends.isLoading}
        color="#1877F2"
      />

      <ContentTable
        title="Top Posts"
        items={topPosts.data ?? []}
        isLoading={topPosts.isLoading}
        isError={topPosts.isError}
        error={topPosts.error}
        onRetry={() => topPosts.refetch()}
        renderMetrics={(item) => (
          <>
            <div className="text-xs text-gray-neutral">Reach: {formatCompactNumber(item.metrics.reach)}</div>
            <div className="text-xs text-gray-neutral">Engagement: {formatCompactNumber(item.metrics.engagement)}</div>
          </>
        )}
      />

      <ContentTable
        title="Top Videos"
        items={topVideos.data ?? []}
        isLoading={topVideos.isLoading}
        isError={topVideos.isError}
        error={topVideos.error}
        onRetry={() => topVideos.refetch()}
        renderMetrics={(item) => (
          <>
            <div className="text-xs text-gray-neutral">Views: {formatCompactNumber(item.metrics.views)}</div>
            <div className="text-xs text-gray-neutral">Completion: {item.metrics.completionRate?.toFixed(1)}%</div>
          </>
        )}
      />
    </div>
  );
}

interface ContentTableProps {
  title: string;
  items: any[];
  isLoading: boolean;
  isError: boolean;
  error?: unknown;
  onRetry: () => void;
  renderMetrics: (item: any) => React.ReactNode;
}

function ContentTable({ title, items, isLoading, isError, error, onRetry, renderMetrics }: ContentTableProps) {
  if (isError) {
    return <ErrorState title={`Failed to load ${title}`} message={error instanceof Error ? error.message : "Something went wrong."} onRetry={onRetry} />;
  }

  if (!isLoading && items.length === 0) {
    return <EmptyState title={`No ${title.toLowerCase()} yet`} description={`${title} will appear here once available.`} />;
  }

  return (
    <Card>
      <h3 className="text-base font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-4">
            {item.thumbnailUrl ? (
              <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                <Image src={item.thumbnailUrl} alt={item.title} fill className="object-cover" />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-lg bg-gray-100 shrink-0 flex items-center justify-center">
                <span className="text-xs text-gray-400">No img</span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
              <p className="text-xs text-gray-neutral">{new Date(item.publishedAt).toLocaleDateString()}</p>
            </div>
            <div className="text-right shrink-0">{renderMetrics(item)}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default function AnalyticsPage() {
  const { connectedPlatforms, isLoading: platformsLoading } = useConnectedPlatforms();
  const analyticsPlatforms = connectedPlatforms.filter((p): p is PlatformId => p === "youtube" || p === "facebook");
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformId | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>("30d");

  const activePlatform = selectedPlatform ?? analyticsPlatforms[0] ?? null;

  if (platformsLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-40 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded animate-pulse bg-[length:200%_100%]" />
        <OverviewCardsSkeleton />
        <ChartSkeleton />
        <ContentTableSkeleton />
      </div>
    );
  }

  if (!platformsLoading && analyticsPlatforms.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <EmptyState
          title="No platforms connected"
          description="Connect YouTube or Facebook to view your analytics and performance insights."
          action={
            <Button label="Go to Discover" onClick={() => window.location.href = "/discover"} />
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <div className="flex items-center gap-3">
          <DateRangeFilter value={dateRange} onChange={setDateRange} />
        </div>
      </div>

      {analyticsPlatforms.length > 1 && (
        <PlatformSelector
          platforms={analyticsPlatforms}
          selected={activePlatform!}
          onChange={setSelectedPlatform}
        />
      )}

      {activePlatform === "youtube" && <YoutubeSection range={dateRange} />}
      {activePlatform === "facebook" && <FacebookSection range={dateRange} />}
    </div>
  );
}
