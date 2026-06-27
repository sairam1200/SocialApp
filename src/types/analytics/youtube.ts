export type YoutubeChannelAnalytics = {
  id: string;
  channelId: string;
  userId: string;
  subscriberCount: number;
  viewCount: number;
  videoCount: number;
  engagementMetrics: Record<string, any>;
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
  publishedAt?: string;
  duration?: string;
  snapshotDate: string;
  createdAt: string;
  updatedAt: string;
};

export type YoutubeAnalyticsTrendsResponse = (YoutubeChannelAnalytics | YoutubeVideoAnalytics)[];

export type YoutubeTopVideosResponse = YoutubeVideoAnalytics[];
