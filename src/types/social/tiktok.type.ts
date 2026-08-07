export interface TiktokProfile {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  followersCount: number;
  followingCount: number;
  likesCount: number;
  videoCount: number;
  verified: boolean;
}

export interface TiktokContent {
  id: string;
  externalId: string;
  title?: string;
  description?: string;
  type: string;
  mediaUrl?: string;
  thumbnailUrl?: string;
  permalink?: string;
  username?: string;
  playCount?: number;
  likeCount?: number;
  commentCount?: number;
  shareCount?: number;
  timestamp?: string;
  createdAt?: string;
}

export interface TiktokContentsResponse {
  contents: TiktokContent[];
  nextCursor: string | null;
  hasMore: boolean;
  success: boolean;
}
