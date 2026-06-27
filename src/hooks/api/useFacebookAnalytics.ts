import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/services/apiClient.service";
import {
  FacebookPageAnalytics,
  FacebookPostAnalytics,
  FacebookVideoAnalytics,
  FacebookAnalyticsTrendsResponse,
} from "@/types/analytics/facebook";

export interface FacebookOverview {
  platform: "facebook";
  metrics: {
    followers: number;
    fans: number;
    impressions: number;
    reach: number;
    engagement: number;
    pageViews: number;
    clicks: number;
  };
  snapshotDate: string;
}

export interface FacebookContentItem {
  id: string;
  externalId: string;
  title: string;
  thumbnailUrl: string;
  publishedAt: string;
  metrics: Record<string, number>;
  url: string;
}

export interface FacebookTrendPoint {
  date: string;
  value: number;
  metric: string;
}

function mapPageToOverview(data: FacebookPageAnalytics): FacebookOverview {
  return {
    platform: "facebook",
    metrics: {
      followers: data.followerCount,
      fans: data.fanCount,
      impressions: data.impressions,
      reach: data.reach,
      engagement: data.engagement,
      pageViews: data.pageViews,
      clicks: data.clicks,
    },
    snapshotDate: data.snapshotDate,
  };
}

function mapPostToContentItem(data: FacebookPostAnalytics): FacebookContentItem {
  const title = data.postType ? `${data.postType} post` : `Post ${data.postId.slice(0, 8)}`;
  return {
    id: data.id,
    externalId: data.postId,
    title,
    thumbnailUrl: "",
    publishedAt: data.publishedAt ?? data.snapshotDate,
    metrics: {
      reach: data.reach,
      impressions: data.impressions,
      engagement: data.engagement,
      reactions: data.reactionsCount,
      comments: data.commentCount,
      shares: data.shareCount,
    },
    url: `https://facebook.com/${data.postId}`,
  };
}

function mapVideoToContentItem(data: FacebookVideoAnalytics): FacebookContentItem {
  return {
    id: data.id,
    externalId: data.videoId,
    title: `Video ${data.videoId.slice(0, 8)}`,
    thumbnailUrl: "",
    publishedAt: data.publishedAt ?? data.snapshotDate,
    metrics: {
      views: data.videoViews,
      uniqueViewers: data.uniqueViewers,
      avgWatchTime: data.averageWatchTime,
      completionRate: data.completionRate,
    },
    url: `https://facebook.com/${data.videoId}`,
  };
}

function mapTrendsToChartPoints(data: FacebookAnalyticsTrendsResponse): FacebookTrendPoint[] {
  return data.map((item) => ({
    date: item.snapshotDate,
    value: item.followerCount,
    metric: "followers",
  }));
}

export function useFacebookOverview() {
  return useQuery({
    queryKey: ["analytics", "facebook", "overview"],
    queryFn: async () => {
      const data = await apiClient.Facebook.getPageAnalytics();
      return mapPageToOverview(data);
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

export function useFacebookTopPosts(limit: number = 10) {
  return useQuery({
    queryKey: ["analytics", "facebook", "top-posts", limit],
    queryFn: async () => {
      const data = await apiClient.Facebook.getTopPosts(String(limit));
      return data.map(mapPostToContentItem);
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

export function useFacebookTopVideos(limit: number = 10) {
  return useQuery({
    queryKey: ["analytics", "facebook", "top-videos", limit],
    queryFn: async () => {
      const data = await apiClient.Facebook.getTopVideos(String(limit));
      return data.map(mapVideoToContentItem);
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

export function useFacebookTrends(range: string = "30d") {
  const { startDate, endDate } = getDateRange(range);

  return useQuery({
    queryKey: ["analytics", "facebook", "trends", range],
    queryFn: async () => {
      const data = await apiClient.Facebook.getTrends(startDate, endDate);
      return mapTrendsToChartPoints(data);
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
