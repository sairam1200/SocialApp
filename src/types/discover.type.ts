export interface DiscoverContentModel {
  id: string;
  userId: string;
  userName: string;
  userHandle: string;
  userProfileImage: string | null;
  platform: string;
  type: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  publishedAt: string | null;
  sourceUrl: string | null;
  views: number;
  likes: number;
  comments: number;
}

export interface DiscoverFeedResponse {
  contents: DiscoverContentModel[];
  nextCursor: string | null;
  hasMore: boolean;
}
