import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/services/apiClient.service";
import {
  YoutubeChannelAnalytics,
  YoutubeVideoAnalytics,
  YoutubeAnalyticsTrendsResponse,
  YoutubeOverviewResponse,
  TopVideoItemModel,
} from "@/types/analytics/youtube";

export interface YoutubeOverview {
  platform: "youtube";
  metrics: {
    subscribers: number;
    views: number;
    videos: number;
    engagement: Record<string, any>;
  };
  snapshotDate: string;
}

export interface YoutubeContentItem {
  id: string;
  videoId: string;
  title: string;
  thumbnailUrl: string;
  publishedAt: string;
  metrics: {
    views: number;
    likes: number;
    comments: number;
    favorites: number;
  };
  url: string;
}

export interface YoutubeTrendPoint {
  date: string;
  value: number;
  metric: string;
}

function unwrapRestfitResponse<T>(response: T): T {
  if (response && typeof response === "object" && !Array.isArray(response)) {
    const obj = response as Record<string, unknown>;
    if ("data" in obj && "success" in obj) {
      return obj.data as T;
    }
  }
  return response;
}

let analyticsSyncPromise: Promise<void> | null = null;

async function ensureAnalyticsExists() {
  if (!analyticsSyncPromise) {
    analyticsSyncPromise = apiClient.Youtube
      .syncAnalytics()
      .then(() => { })
      .finally(() => {
        analyticsSyncPromise = null;
      });
  }

  await analyticsSyncPromise;
}



function isMissingAnalyticsError(error: unknown): boolean {
  const err = error as { response?: { status?: number; data?: { title?: string; message?: string } }; status?: number; statusCode?: number } | undefined;
  const status =
    err?.response?.status ??
    err?.status ??
    err?.statusCode;

  const message =
    err?.response?.data?.title ??
    err?.response?.data?.message ??
    "";

  return (
    status === 404 &&
    typeof message === "string" &&
    message.includes("No channel analytics")
  );
}

function mapChannelToOverview(data: YoutubeChannelAnalytics): YoutubeOverview {
  return {
    platform: "youtube",
    metrics: {
      subscribers: data.subscriberCount,
      views: data.viewCount,
      videos: data.videoCount,
      engagement: data.engagementMetrics ?? {},
    },
    snapshotDate: data.snapshotDate,
  };
}

function mapVideoToContentItem(data: YoutubeVideoAnalytics): YoutubeContentItem {
  return {
    id: data.id,
    videoId: data.videoId,
    title: `Video ${data.videoId.slice(0, 8)}`,
    thumbnailUrl: `https://i.ytimg.com/vi/${data.videoId}/hqdefault.jpg`,
    publishedAt: data.publishedAt ?? data.snapshotDate,
    metrics: {
      views: data.viewCount,
      likes: data.likeCount,
      comments: data.commentCount,
      favorites: data.favoriteCount,
    },
    url: `https://www.youtube.com/watch?v=${data.videoId}`,
  };
}

function mapTopVideoToContentItem(data: TopVideoItemModel): YoutubeContentItem {
  return {
    id: data.id,
    videoId: data.id,
    title: data.title,
    thumbnailUrl: data.thumbnail ?? `https://i.ytimg.com/vi/${data.id}/hqdefault.jpg`,
    publishedAt: data.publishedAt ? new Date(data.publishedAt).toISOString() : new Date().toISOString(),
    metrics: {
      views: data.views,
      likes: data.likes,
      comments: data.comments,
      favorites: 0,
    },
    url: `https://www.youtube.com/watch?v=${data.id}`,
  };
}

function mapTrendsToChartPoints(data: YoutubeAnalyticsTrendsResponse, metric: string = "viewCount"): YoutubeTrendPoint[] {
  return data
    .filter((item): item is YoutubeChannelAnalytics => "subscriberCount" in item)
    .map((item) => ({
      date: item.snapshotDate,
      value: (item as any)[metric] ?? 0,
      metric,
    }));
}

async function loadYoutubeOverview(): Promise<YoutubeOverview> {
  try {
    const data = await apiClient.Youtube.getChannelAnalytics();
    return mapChannelToOverview(data);
  } catch (error) {
    if (!isMissingAnalyticsError(error)) {
      throw error;
    }

    await ensureAnalyticsExists();

    const retry = await apiClient.Youtube.getChannelAnalytics();
    return mapChannelToOverview(retry);
  }
}

export function useYoutubeOverview() {
  return useQuery({
    queryKey: ["analytics", "youtube", "overview"],
    queryFn: async () => {
      const data = await loadYoutubeOverview();
      return data;
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

async function loadTopVideos(limit: number): Promise<YoutubeContentItem[]> {
  try {
    const response = await apiClient.Youtube.getTopVideos(String(limit));
    const items = response?.topVideos ?? [];
    return items.map(mapTopVideoToContentItem);
  } catch (error) {
    if (!isMissingAnalyticsError(error)) {
      throw error;
    }

    await ensureAnalyticsExists();

    const retry = await apiClient.Youtube.getTopVideos(String(limit));
    const items = retry?.topVideos ?? [];
    return items.map(mapTopVideoToContentItem);
  }
}

export function useYoutubeTopVideos(limit: number = 10) {
  return useQuery({
    queryKey: ["analytics", "youtube", "top-videos", limit],
    queryFn: async () => loadTopVideos(limit),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

async function loadTrends(
  startDate: string,
  endDate: string
): Promise<YoutubeTrendPoint[]> {
  try {
    const data = unwrapRestfitResponse(await apiClient.Youtube.getTrends(startDate, endDate));
    return mapTrendsToChartPoints(data, "viewCount");
  } catch (error) {
    if (!isMissingAnalyticsError(error)) {
      throw error;
    }

    await ensureAnalyticsExists();

    const retry = unwrapRestfitResponse(await apiClient.Youtube.getTrends(startDate, endDate));
    return mapTrendsToChartPoints(retry, "viewCount");
  }
}

export function useYoutubeTrends(range: string = "30d") {
  const { startDate, endDate } = getDateRange(range);

  return useQuery({
    queryKey: ["analytics", "youtube", "trends", range],
    queryFn: async () => loadTrends(startDate, endDate),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

export function useYoutubeDashboardOverview(range: string = "30d") {
  const { startDate, endDate } = getDateRange(range);

  return useQuery({
    queryKey: ["analytics", "youtube", "dashboard-overview", range],
    queryFn: async () => {
      const data = await apiClient.Youtube.getOverview(startDate, endDate);
      return data;
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

export function useYoutubeDailyViews(range: string = "30d") {
  const { startDate, endDate } = getDateRange(range);

  return useQuery({
    queryKey: ["analytics", "youtube", "daily-views", range],
    queryFn: async () => {
      const data = unwrapRestfitResponse(await apiClient.Youtube.getDailyViews(startDate, endDate));
      return data;
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

export function useYoutubeWatchTime(range: string = "30d") {
  const { startDate, endDate } = getDateRange(range);

  return useQuery({
    queryKey: ["analytics", "youtube", "watch-time", range],
    queryFn: async () => {
      const data = unwrapRestfitResponse(await apiClient.Youtube.getWatchTime(startDate, endDate));
      return data;
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

export function useYoutubeSubscriberGrowth(range: string = "30d") {
  const { startDate, endDate } = getDateRange(range);

  return useQuery({
    queryKey: ["analytics", "youtube", "subscriber-growth", range],
    queryFn: async () => {
      const data = unwrapRestfitResponse(await apiClient.Youtube.getSubscriberGrowth(startDate, endDate));
      return data;
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

export function useYoutubeRevenue(range: string = "30d") {
  const { startDate, endDate } = getDateRange(range);

  return useQuery({
    queryKey: ["analytics", "youtube", "revenue", range],
    queryFn: async () => {
      const data = unwrapRestfitResponse(await apiClient.Youtube.getRevenue(startDate, endDate));
      return data;
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

export function useYoutubeTrafficSources() {
  return useQuery({
    queryKey: ["analytics", "youtube", "traffic-sources"],
    queryFn: async () => {
      const data = unwrapRestfitResponse(await apiClient.Youtube.getTrafficSources());
      return data;
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

export function useYoutubeAudience() {
  return useQuery({
    queryKey: ["analytics", "youtube", "audience"],
    queryFn: async () => {
      const data = await apiClient.Youtube.getAudience();
      const demographics = data?.subscribedViewerPercentage !== undefined
        ? [
            { source: "Subscribed", viewPercentage: data.subscribedViewerPercentage },
            { source: "Returning", viewPercentage: data.returnViewerPercentage ?? 0 },
            { source: "New", viewPercentage: data.newViewerPercentage ?? 0 },
          ]
        : [];
      return { demographics };
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

export function useYoutubeGeography() {
  return useQuery({
    queryKey: ["analytics", "youtube", "geography"],
    queryFn: async () => {
      const data = unwrapRestfitResponse(await apiClient.Youtube.getGeography());
      return data;
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

export function useYoutubeDevices() {
  return useQuery({
    queryKey: ["analytics", "youtube", "devices"],
    queryFn: async () => {
      const data = unwrapRestfitResponse(await apiClient.Youtube.getDevices());
      return data;
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

export function useYoutubePlaybackLocations() {
  return useQuery({
    queryKey: ["analytics", "youtube", "playback-locations"],
    queryFn: async () => {
      const data = unwrapRestfitResponse(await apiClient.Youtube.getPlaybackLocations());
      return data;
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

function getDateRange(range: string): { startDate: string; endDate: string } {
  const end = new Date();
  const start = new Date();
  const days = range === "7d" ? 7 : range === "30d" ? 30 : range === "90d" ? 90 : 365;
  start.setUTCDate(end.getUTCDate() - days);
  return {
    startDate: start.toISOString().split("T")[0],
    endDate: end.toISOString().split("T")[0],
  };
}
