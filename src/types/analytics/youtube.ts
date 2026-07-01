export type YoutubeChannelAnalytics = {
  id: string;
  channelId: string;
  userId: string;
  subscriberCount: number;
  viewCount: number;
  videoCount: number;
  engagementMetrics: Record<string, any>;
  estimatedMinutesWatched: number;
  averageViewDurationSeconds: number;
  subscribersGained: number;
  subscribersLost: number;
  likes: number;
  comments: number;
  shares: number;
  estimatedRevenueUsd: number;
  estimatedAdRevenueUsd: number;
  trafficSources: Record<string, any>[];
  geography: Record<string, any>[];
  devices: Record<string, any>[];
  audience: Record<string, any>;
  playbackLocations: Record<string, any>[];
  snapshotDate: string;
  createdAt: string;
  updatedAt: string;
};

export type YoutubeVideoAnalytics = {
  id: string;
  videoId: string;
  userId: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  favoriteCount: number;
  estimatedMinutesWatched: number;
  averageViewDurationSeconds: number;
  shares: number;
  publishedAt?: string;
  duration?: string;
  snapshotDate: string;
  createdAt: string;
  updatedAt: string;
};

export type YoutubeAnalyticsTrendsResponse = (YoutubeChannelAnalytics | YoutubeVideoAnalytics)[];

export type YoutubeTopVideosResponse = YoutubeVideoAnalytics[];

export type ChannelMetricsAggregate = {
  estimatedMinutesWatched: number;
  averageViewDurationSeconds: number;
  subscribersGained: number;
  subscribersLost: number;
  likes: number;
  comments: number;
  shares: number;
  estimatedRevenueUsd: number;
  estimatedAdRevenueUsd: number;
  snapshotCount: number;
};

export type YoutubeOverviewResponse = {
  current: ChannelMetricsAggregate & { startDate: string; endDate: string };
  previous: ChannelMetricsAggregate & { startDate: string; endDate: string };
};

export type YoutubeDimensionResponse = Record<string, any>[];
