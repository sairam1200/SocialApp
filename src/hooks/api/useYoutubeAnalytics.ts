import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/services/apiClient.service";
import {
  YoutubeChannelAnalytics,
  YoutubeVideoAnalytics,
  YoutubeAnalyticsTrendsResponse,
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

function mapTrendsToChartPoints(data: YoutubeAnalyticsTrendsResponse, metric: string = "viewCount"): YoutubeTrendPoint[] {
  return data
    .filter((item): item is YoutubeChannelAnalytics => "subscriberCount" in item)
    .map((item) => ({
      date: item.snapshotDate,
      value: (item as any)[metric] ?? 0,
      metric,
    }));
}

export function useYoutubeOverview() {
  return useQuery({
    queryKey: ["analytics", "youtube", "overview"],
    queryFn: async () => {
      const data = await apiClient.Youtube.getChannelAnalytics();
      return mapChannelToOverview(data);
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

export function useYoutubeTopVideos(limit: number = 10) {
  return useQuery({
    queryKey: ["analytics", "youtube", "top-videos", limit],
    queryFn: async () => {
      const data = await apiClient.Youtube.getTopVideos(String(limit));
      return data.map(mapVideoToContentItem);
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

export function useYoutubeTrends(range: string = "30d") {
  const { startDate, endDate } = getDateRange(range);

  return useQuery({
    queryKey: ["analytics", "youtube", "trends", range],
    queryFn: async () => {
      const data = await apiClient.Youtube.getTrends(startDate, endDate);
      return mapTrendsToChartPoints(data, "viewCount");
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
