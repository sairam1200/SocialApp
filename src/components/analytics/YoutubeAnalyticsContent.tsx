"use client";

import { useMemo } from "react";
import { MetricCard } from "@/components/analytics/MetricCard";
import { GrowthChart } from "@/components/analytics/GrowthChart";
import { OverviewCardsSkeleton, ChartSkeleton, ContentTableSkeleton } from "@/components/analytics/LoadingSkeletons";
import { EmptyState, ErrorState } from "@/components/analytics/EmptyState";
import { Card } from "@/components/analytics/Card";
import { DateRange } from "@/types/analytics";
import { formatCompactNumber } from "@/components/analytics/PlatformIcon";
import { Users, ThumbsUp, MessageCircle, Share2, DollarSign, Clock, TrendingUp, Monitor, MapPin, Play } from "lucide-react";
import Image from "next/image";
import {
  useYoutubeDashboardOverview,
  useYoutubeDailyViews,
  useYoutubeWatchTime,
  useYoutubeSubscriberGrowth,
  useYoutubeRevenue,
  useYoutubeTrafficSources,
  useYoutubeAudience,
  useYoutubeGeography,
  useYoutubeDevices,
  useYoutubePlaybackLocations,
  useYoutubeTopVideos,
} from "@/hooks/api/useYoutubeAnalytics";
import { YoutubeChannelAnalytics } from "@/types/analytics/youtube";

function mapToChartData(data: YoutubeChannelAnalytics[], metric: string) {
  return data.map((item) => ({
    date: item.snapshotDate,
    value: (item as any)[metric] ?? 0,
    metric,
  }));
}

function DimensionGrid({ data, label, icon, valueKey, secondaryKey }: {
  data: Record<string, any>[];
  label: string;
  icon: React.ReactNode;
  valueKey: string;
  secondaryKey?: string;
}) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <div className="flex items-center gap-2 mb-3">
          <div className="text-gray-400">{icon}</div>
          <h3 className="text-base font-semibold text-gray-900">{label}</h3>
        </div>
        <EmptyState title="No data yet" description="" />
      </Card>
    );
  }

  const total = data.reduce((sum: number, d: any) => sum + (Number(d[valueKey]) || 0), 0);

  return (
    <Card>
      <div className="flex items-center gap-2 mb-4">
        <div className="text-gray-400">{icon}</div>
        <h3 className="text-base font-semibold text-gray-900">{label}</h3>
      </div>
      <div className="space-y-3">
        {data.map((item: any, i: number) => {
          const key = item.source ?? item.countryCode ?? item.deviceType ?? item.location ?? item.gender ?? `item-${i}`;
          const name = item.source ?? item.countryName ?? item.deviceType ?? item.location ?? (item.gender && item.ageGroup ? `${item.gender}, ${item.ageGroup}` : key);
          const val = Number(item[valueKey]) || 0;
          const pct = total > 0 ? ((val / total) * 100).toFixed(1) : "0";
          const secondary = secondaryKey ? Number(item[secondaryKey]) || 0 : null;

          return (
            <div key={key} className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{name}</p>
                <div className="w-full h-1.5 bg-gray-100 rounded-full mt-1">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                </div>
              </div>
              <div className="text-right ml-4 shrink-0">
                <p className="text-sm font-semibold text-gray-900">{formatCompactNumber(val)}</p>
                <p className="text-xs text-gray-neutral">{pct}%</p>
                {secondary !== null && (
                  <p className="text-xs text-gray-neutral">{formatCompactNumber(secondary)}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export default function YoutubeAnalyticsContent({ range }: { range: DateRange }) {
  const overview = useYoutubeDashboardOverview(range);
  const dailyViews = useYoutubeDailyViews(range);
  const watchTime = useYoutubeWatchTime(range);
  const subscriberGrowth = useYoutubeSubscriberGrowth(range);
  const revenue = useYoutubeRevenue(range);
  const trafficSources = useYoutubeTrafficSources();
  const audience = useYoutubeAudience();
  const geography = useYoutubeGeography();
  const devices = useYoutubeDevices();
  const playbackLocations = useYoutubePlaybackLocations();
  const topVideos = useYoutubeTopVideos(10);

  const loading = overview.isLoading;
  const hasError = overview.isError;

  const dailyViewsData = useMemo(() => mapToChartData(dailyViews.data ?? [], "viewCount"), [dailyViews.data]);
  const watchTimeData = useMemo(() => mapToChartData(watchTime.data ?? [], "estimatedMinutesWatched"), [watchTime.data]);
  const subscriberGrowthData = useMemo(() => mapToChartData(subscriberGrowth.data ?? [], "subscribersGained"), [subscriberGrowth.data]);
  const revenueData = useMemo(() => mapToChartData(revenue.data ?? [], "estimatedRevenueUsd"), [revenue.data]);

  if (loading) {
    return (
      <>
        <OverviewCardsSkeleton />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
        <ChartSkeleton />
        <ChartSkeleton />
        <ContentTableSkeleton />
      </>
    );
  }

  if (hasError) {
    return (
      <ErrorState
        title="Failed to load YouTube analytics"
        message={overview.error instanceof Error ? overview.error.message : "Something went wrong."}
        onRetry={() => overview.refetch()}
      />
    );
  }

  const current = overview.data?.current;
  const previous = overview.data?.previous;

  function calcChange(current?: number, previous?: number): number | undefined {
    if (current === undefined || previous === undefined || previous === 0) return undefined;
    return ((current - previous) / previous) * 100;
  }

  const overviewMetrics = [
    {
      key: "estimatedMinutesWatched",
      label: "Watch Time (min)",
      value: current?.estimatedMinutesWatched ?? 0,
      prev: previous?.estimatedMinutesWatched ?? 0,
      icon: <Clock className="w-5 h-5" />,
    },
    {
      key: "subscribersGained",
      label: "Subscribers Gained",
      value: current?.subscribersGained ?? 0,
      prev: previous?.subscribersGained ?? 0,
      icon: <Users className="w-5 h-5" />,
    },
    {
      key: "likes",
      label: "Likes",
      value: current?.likes ?? 0,
      prev: previous?.likes ?? 0,
      icon: <ThumbsUp className="w-5 h-5" />,
    },
    {
      key: "comments",
      label: "Comments",
      value: current?.comments ?? 0,
      prev: previous?.comments ?? 0,
      icon: <MessageCircle className="w-5 h-5" />,
    },
    {
      key: "shares",
      label: "Shares",
      value: current?.shares ?? 0,
      prev: previous?.shares ?? 0,
      icon: <Share2 className="w-5 h-5" />,
    },
    {
      key: "estimatedRevenueUsd",
      label: "Revenue (USD)",
      value: current?.estimatedRevenueUsd ?? 0,
      prev: previous?.estimatedRevenueUsd ?? 0,
      icon: <DollarSign className="w-5 h-5" />,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {overviewMetrics.map((m) => (
          <MetricCard
            key={m.key}
            title={m.label}
            value={Number(m.value).toLocaleString()}
            change={calcChange(m.value, m.prev)}
            icon={m.icon}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GrowthChart data={dailyViewsData} metric="views" color="#FF0000" loading={dailyViews.isLoading} />
        <GrowthChart data={watchTimeData} metric="watch time (min)" color="#FF0000" loading={watchTime.isLoading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GrowthChart data={subscriberGrowthData} metric="subscribers gained" color="#FF0000" loading={subscriberGrowth.isLoading} />
        <GrowthChart data={revenueData} metric="revenue (USD)" color="#FF0000" loading={revenue.isLoading} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DimensionGrid
          data={Array.isArray(trafficSources.data) ? trafficSources.data : []}
          label="Traffic Sources"
          icon={<TrendingUp className="w-5 h-5" />}
          valueKey="views"
          secondaryKey="watchTimeMinutes"
        />
        <DimensionGrid
          data={Array.isArray(audience.data?.demographics) ? audience.data.demographics : []}
          label="Audience"
          icon={<Users className="w-5 h-5" />}
          valueKey="viewPercentage"
        />
        <DimensionGrid
          data={Array.isArray(geography.data) ? geography.data : []}
          label="Geography"
          icon={<MapPin className="w-5 h-5" />}
          valueKey="views"
          secondaryKey="watchTimeMinutes"
        />
        <DimensionGrid
          data={Array.isArray(devices.data) ? devices.data : []}
          label="Devices"
          icon={<Monitor className="w-5 h-5" />}
          valueKey="views"
          secondaryKey="watchTimeMinutes"
        />
        <DimensionGrid
          data={Array.isArray(playbackLocations.data) ? playbackLocations.data : []}
          label="Playback Locations"
          icon={<Play className="w-5 h-5" />}
          valueKey="views"
          secondaryKey="watchTimeMinutes"
        />
      </div>

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
            <div className="text-xs text-gray-neutral">Likes: {formatCompactNumber(item.metrics.likes)}</div>
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
