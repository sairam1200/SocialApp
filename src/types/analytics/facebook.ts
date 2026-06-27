export type FacebookPageAnalytics = {
  id: string;
  pageId: string;
  userId: string;
  followerCount: number;
  fanCount: number;
  impressions: number;
  reach: number;
  engagement: number;
  pageViews: number;
  clicks: number;
  snapshotDate: string;
  createdAt: string;
  updatedAt: string;
};

export type FacebookPostAnalytics = {
  id: string;
  postId: string;
  userId: string;
  reach: number;
  impressions: number;
  engagement: number;
  reactionsCount: number;
  likeCount: number;
  loveCount: number;
  hahaCount: number;
  wowCount: number;
  sadCount: number;
  angryCount: number;
  commentCount: number;
  shareCount: number;
  clickCount: number;
  videoViews: number;
  averageWatchTime: number;
  publishedAt?: string;
  postType?: string;
  snapshotDate: string;
  createdAt: string;
  updatedAt: string;
};

export type FacebookVideoAnalytics = {
  id: string;
  videoId: string;
  userId: string;
  videoViews: number;
  uniqueViewers: number;
  threeSecondViews: number;
  oneMinuteViews: number;
  averageWatchTime: number;
  totalWatchTime: number;
  completionRate: number;
  publishedAt?: string;
  duration?: string;
  snapshotDate: string;
  createdAt: string;
  updatedAt: string;
};

export type FacebookAnalyticsTrendsResponse = FacebookPageAnalytics[];

export type FacebookTopPostsResponse = FacebookPostAnalytics[];

export type FacebookTopVideosResponse = FacebookVideoAnalytics[];

export type FacebookCompareResponse = {
  period1: Record<string, number>;
  period2: Record<string, number>;
  comparison: Record<string, number>;
};
