export interface DiscoverContentModel {
  id: string;
  contentStreamId?: string | null;
  userId: string;
  linkedAccountId?: string;
  userName: string;
  userHandle: string;
  userProfileImage: string | null;
  platform: string;
  type: string;
  title: string | null;
  description: string | null;
  imageUrl: string | null;
  publishedAt: string | null;
  sourceUrl: string | null;
  views: number | null;
  gaddrViews?: string | null;
  likes: number | null;
  comments: number | null;
  verified?: boolean;
  profileUrl?: string | null;
}

export interface DiscoverFeedResponse {
  contents: DiscoverContentModel[];
  nextCursor: string | null;
  hasMore: boolean;
}

export type ForYouItemType = 'content' | 'project' | 'job';

export interface ForYouItem {
  id: string;
  contentStreamId?: string;
  gaddrViews?: string;
  type: ForYouItemType;
  title: string;
  description: string | null;
  imageUrl: string | null;
  platform: string | null;
  score: number;
  sourceUrl: string | null;
  publishedAt: string | null;
  meta: Record<string, any>;
}

export interface ForYouFeedResponse {
  items: ForYouItem[];
  totalCount: number;
}
